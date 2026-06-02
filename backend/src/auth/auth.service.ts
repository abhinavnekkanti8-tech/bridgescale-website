import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  AuthProvider,
  EmailActionType,
  MembershipRole,
  OnboardingStage,
  OrgType,
} from '@prisma/client';
import { createSign } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { SessionUser } from '../common/types/session.types';
import { CURRENT_NOTICE_VERSION } from '../legal/legal.constants';
import { RegisterDto } from './dto/register.dto';
import { TalentSignupDto } from './dto/talent-signup.dto';
import { AccountSecurityService } from '../account-security/account-security.service';

const BCRYPT_SALT_ROUNDS = 10;

type OAuthProfile = {
  providerAccountId: string;
  email: string;
  emailVerified: boolean;
  name: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly accountSecurity: AccountSecurityService,
  ) {}

  async register(_dto: RegisterDto): Promise<never> {
    throw new BadRequestException(
      'Public self-registration is disabled. Use the company or talent signup flows.',
    );
  }

  async registerTalentWithPassword(dto: TalentSignupDto) {
    const email = this.normalizeEmail(dto.email);
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const legalAcceptance = this.requireCurrentNoticeAcceptance(dto);
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const createdUser = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: `${dto.name} (Operator)`,
          orgType: OrgType.OPERATOR_ENTITY,
        },
      });

      const user = await tx.user.create({
        data: {
          name: dto.name,
          email,
          passwordHash,
          onboardingStage: OnboardingStage.ONBOARDING,
          ...legalAcceptance,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          orgId: org.id,
          membershipRole: MembershipRole.OPERATOR,
          status: 'ACTIVE',
        },
      });

      return user;
    });

    await this.accountSecurity.sendEmailVerification({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    });

    return {
      message: 'Account created. Please verify your email to continue.',
      verificationRequired: true,
    };
  }

  async validateCredentials(email: string, password: string): Promise<SessionUser> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Your account has been suspended. Please contact support.');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Your account is inactive. Please contact support.');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Please verify your email before signing in.');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    await this.usersService.touchLoginTimestamp(user.id);

    return this.buildSessionUser(user);
  }

  async confirmEmailVerification(token: string): Promise<SessionUser> {
    const record = await this.accountSecurity.consumeToken(token, EmailActionType.VERIFY_EMAIL);
    const user =
      record.user ??
      (await this.prisma.user.findUnique({
        where: { email: record.email },
        include: { memberships: { where: { status: 'ACTIVE' } } },
      }));

    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification link.');
    }

    if (!user.emailVerifiedAt) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
    }

    return this.getSessionUserByEmail(user.email);
  }

  async resendEmailVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && !user.emailVerifiedAt) {
      await this.accountSecurity.sendEmailVerification({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    }

    return {
      message: 'If an unverified account exists for that email, a new verification link has been sent.',
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && user.emailVerifiedAt && user.passwordHash) {
      await this.accountSecurity.sendPasswordReset({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    }

    return {
      message: 'If an account exists for that email, password reset instructions have been sent.',
    };
  }

  async resetPassword(token: string, password: string) {
    const record = await this.accountSecurity.consumeToken(token, EmailActionType.RESET_PASSWORD);
    const user =
      record.user ??
      (await this.prisma.user.findUnique({
        where: { email: record.email },
      }));

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset link.');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully.' };
  }

  getAuthorizationUrl(providerInput: string, state: string) {
    const provider = this.parseProvider(providerInput);
    const redirectUri = this.oauthRedirectUri(providerInput);

    if (provider === AuthProvider.GOOGLE) {
      return (
        'https://accounts.google.com/o/oauth2/v2/auth?' +
        new URLSearchParams({
          client_id: this.requiredConfig('GOOGLE_OAUTH_CLIENT_ID'),
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'openid email profile',
          state,
          prompt: 'select_account',
        }).toString()
      );
    }

    if (provider === AuthProvider.MICROSOFT) {
      const tenant = this.config.get<string>('MICROSOFT_OAUTH_TENANT_ID', 'common');
      return (
        `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?` +
        new URLSearchParams({
          client_id: this.requiredConfig('MICROSOFT_OAUTH_CLIENT_ID'),
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'openid profile email User.Read',
          state,
          prompt: 'select_account',
        }).toString()
      );
    }

    return (
      'https://appleid.apple.com/auth/authorize?' +
      new URLSearchParams({
        client_id: this.requiredConfig('APPLE_OAUTH_CLIENT_ID'),
        redirect_uri: redirectUri,
        response_type: 'code',
        response_mode: 'form_post',
        scope: 'name email',
        state,
      }).toString()
    );
  }

  async handleOAuthCallback(
    providerInput: string,
    code: string,
    appleUser?: string,
  ): Promise<SessionUser> {
    const provider = this.parseProvider(providerInput);
    const profile = await this.fetchOAuthProfile(provider, code, appleUser);

    if (!profile.email || !profile.emailVerified) {
      throw new UnauthorizedException('The selected provider did not return a verified email address.');
    }

    const identity = await this.prisma.oAuthIdentity.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: {
        user: {
          include: {
            memberships: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (identity) {
      await this.usersService.touchLoginTimestamp(identity.user.id);
      return this.buildSessionUser(identity.user);
    }

    const email = this.normalizeEmail(profile.email);
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      const membership = existingUser.memberships[0];
      if (!membership || membership.membershipRole !== MembershipRole.OPERATOR) {
        throw new BadRequestException(
          'This email is already associated with a non-talent account. Use email and password to sign in.',
        );
      }

      await this.prisma.$transaction(async (tx) => {
        if (!existingUser.emailVerifiedAt) {
          await tx.user.update({
            where: { id: existingUser.id },
            data: { emailVerifiedAt: new Date() },
          });
        }

        await tx.oAuthIdentity.create({
          data: {
            userId: existingUser.id,
            provider,
            providerAccountId: profile.providerAccountId,
            providerEmail: email,
          },
        });
      });

      await this.usersService.touchLoginTimestamp(existingUser.id);
      return this.getSessionUserByEmail(existingUser.email);
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: `${profile.name} (Operator)`,
          orgType: OrgType.OPERATOR_ENTITY,
        },
      });

      const createdUser = await tx.user.create({
        data: {
          name: profile.name,
          email,
          emailVerifiedAt: new Date(),
          onboardingStage: OnboardingStage.ONBOARDING,
        },
      });

      await tx.membership.create({
        data: {
          userId: createdUser.id,
          orgId: org.id,
          membershipRole: MembershipRole.OPERATOR,
          status: 'ACTIVE',
        },
      });

      await tx.oAuthIdentity.create({
        data: {
          userId: createdUser.id,
          provider,
          providerAccountId: profile.providerAccountId,
          providerEmail: email,
        },
      });

      return createdUser;
    });

    await this.usersService.touchLoginTimestamp(user.id);
    return this.getSessionUserByEmail(user.email);
  }

  async getSessionUserByEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return this.buildSessionUser(user);
  }

  getPostAuthPath(user: SessionUser, next?: string | null) {
    if (user.stage === OnboardingStage.ONBOARDING) {
      return '/for-talent/apply';
    }

    if (user.stage === OnboardingStage.PENDING_APPROVAL) {
      return '/application/status';
    }

    const sanitizedNext = this.sanitizeNextPath(next);
    if (sanitizedNext) {
      return sanitizedNext;
    }

    if (
      user.role === MembershipRole.PLATFORM_ADMIN ||
      user.role === MembershipRole.DEAL_DESK
    ) {
      return '/admin/dashboard';
    }

    if (
      user.role === MembershipRole.STARTUP_ADMIN ||
      user.role === MembershipRole.STARTUP_MEMBER
    ) {
      return '/startup/dashboard';
    }

    return '/operator/dashboard';
  }

  private buildSessionUser(user: {
    id: string;
    name: string;
    email: string;
    status: any;
    onboardingStage: OnboardingStage;
    memberships: Array<{ membershipRole: MembershipRole; orgId: string }>;
  }): SessionUser {
    const membership = user.memberships[0];
    if (!membership) {
      throw new BadRequestException(
        'Your account has no active role assignment. Please contact support.',
      );
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: membership.membershipRole,
      orgId: membership.orgId,
      status: user.status,
      stage: user.onboardingStage,
    };
  }

  private async fetchOAuthProfile(
    provider: AuthProvider,
    code: string,
    appleUser?: string,
  ): Promise<OAuthProfile> {
    if (provider === AuthProvider.GOOGLE) {
      const tokenRes = await this.exchangeCode(
        'https://oauth2.googleapis.com/token',
        {
          code,
          client_id: this.requiredConfig('GOOGLE_OAUTH_CLIENT_ID'),
          client_secret: this.requiredConfig('GOOGLE_OAUTH_CLIENT_SECRET'),
          redirect_uri: this.oauthRedirectUri('google'),
          grant_type: 'authorization_code',
        },
      );
      const payload = this.decodeJwtPayload(tokenRes.id_token);
      return {
        providerAccountId: String(payload.sub),
        email: String(payload.email),
        emailVerified: payload.email_verified === true || payload.email_verified === 'true',
        name: String(payload.name || payload.given_name || this.nameFromEmail(String(payload.email))),
      };
    }

    if (provider === AuthProvider.MICROSOFT) {
      const tenant = this.config.get<string>('MICROSOFT_OAUTH_TENANT_ID', 'common');
      const tokenRes = await this.exchangeCode(
        `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
        {
          code,
          client_id: this.requiredConfig('MICROSOFT_OAUTH_CLIENT_ID'),
          client_secret: this.requiredConfig('MICROSOFT_OAUTH_CLIENT_SECRET'),
          redirect_uri: this.oauthRedirectUri('microsoft'),
          grant_type: 'authorization_code',
        },
      );
      const payload = this.decodeJwtPayload(tokenRes.id_token);
      const email = String(payload.email || payload.preferred_username || '');
      return {
        providerAccountId: String(payload.sub || payload.oid),
        email,
        emailVerified: Boolean(email),
        name: String(payload.name || this.nameFromEmail(email)),
      };
    }

    const tokenRes = await this.exchangeCode('https://appleid.apple.com/auth/token', {
      code,
      client_id: this.requiredConfig('APPLE_OAUTH_CLIENT_ID'),
      client_secret: this.appleClientSecret(),
      redirect_uri: this.oauthRedirectUri('apple'),
      grant_type: 'authorization_code',
    });
    const payload = this.decodeJwtPayload(tokenRes.id_token);
    const appleUserObject = appleUser ? JSON.parse(appleUser) : null;
    const fallbackName = appleUserObject?.name
      ? [appleUserObject.name.firstName, appleUserObject.name.lastName]
          .filter(Boolean)
          .join(' ')
      : this.nameFromEmail(String(payload.email || 'apple-user@example.com'));

    return {
      providerAccountId: String(payload.sub),
      email: String(payload.email),
      emailVerified: payload.email_verified === true || payload.email_verified === 'true',
      name: fallbackName,
    };
  }

  private async exchangeCode(endpoint: string, params: Record<string, string>) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    });

    const data = (await res.json()) as Record<string, any>;
    if (!res.ok) {
      this.logger.error(`OAuth token exchange failed: ${JSON.stringify(data)}`);
      throw new BadRequestException('Failed to complete provider login.');
    }

    return data;
  }

  private decodeJwtPayload(token: string) {
    const [, payload] = token.split('.');
    if (!payload) {
      throw new BadRequestException('Provider response was missing identity data.');
    }

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(normalized, 'base64').toString('utf-8');
    return JSON.parse(json) as Record<string, any>;
  }

  private oauthRedirectUri(provider: string) {
    const backendUrl = this.config.get<string>('BACKEND_URL', 'http://localhost:4000');
    return `${backendUrl}/api/v1/auth/oauth/${provider}/callback`;
  }

  private appleClientSecret() {
    const teamId = this.requiredConfig('APPLE_OAUTH_TEAM_ID');
    const keyId = this.requiredConfig('APPLE_OAUTH_KEY_ID');
    const clientId = this.requiredConfig('APPLE_OAUTH_CLIENT_ID');
    const privateKey = this.requiredConfig('APPLE_OAUTH_PRIVATE_KEY').replace(/\\n/g, '\n');
    const header = this.base64UrlEncode(
      JSON.stringify({ alg: 'ES256', kid: keyId, typ: 'JWT' }),
    );
    const now = Math.floor(Date.now() / 1000);
    const payload = this.base64UrlEncode(
      JSON.stringify({
        iss: teamId,
        iat: now,
        exp: now + 60 * 60,
        aud: 'https://appleid.apple.com',
        sub: clientId,
      }),
    );
    const signingInput = `${header}.${payload}`;
    const signature = createSign('SHA256')
      .update(signingInput)
      .end()
      .sign({ key: privateKey, dsaEncoding: 'ieee-p1363' });

    return `${signingInput}.${this.base64UrlEncode(signature)}`;
  }

  private base64UrlEncode(value: string | Buffer) {
    return Buffer.from(value)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private parseProvider(providerInput: string) {
    const normalized = providerInput.trim().toUpperCase();
    if (!(normalized in AuthProvider)) {
      throw new BadRequestException(`Unsupported OAuth provider: ${providerInput}`);
    }
    return AuthProvider[normalized as keyof typeof AuthProvider];
  }

  private requiredConfig(key: string) {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new BadRequestException(`Missing required auth configuration: ${key}`);
    }
    return value;
  }

  private sanitizeNextPath(next?: string | null) {
    if (!next || !next.startsWith('/') || next.startsWith('//')) {
      return null;
    }

    if (next.startsWith('/auth')) {
      return null;
    }

    return next;
  }

  private normalizeEmail(email: string) {
    return email.toLowerCase().trim();
  }

  private requireCurrentNoticeAcceptance(dto: {
    privacyAccepted: boolean;
    termsAccepted: boolean;
    noticeVersion: string;
  }) {
    if (!dto.privacyAccepted || !dto.termsAccepted) {
      throw new BadRequestException('You must accept the privacy notice and terms to continue.');
    }

    if (dto.noticeVersion !== CURRENT_NOTICE_VERSION) {
      throw new BadRequestException('Your legal notice is out of date. Please refresh and try again.');
    }

    const acceptedAt = new Date();
    return {
      privacyAcceptedAt: acceptedAt,
      termsAcceptedAt: acceptedAt,
      noticeVersion: CURRENT_NOTICE_VERSION,
    };
  }

  private nameFromEmail(email: string) {
    const localPart = email.split('@')[0] || 'User';
    return localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
