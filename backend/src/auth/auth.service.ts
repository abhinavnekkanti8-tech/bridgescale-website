import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SessionUser } from '../common/types/session.types';
import { RegisterDto, RegisterRole } from './dto/register.dto';
import { MembershipRole } from '@prisma/client';

const BCRYPT_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Register a new user with an organization and membership.
   */
  async register(dto: RegisterDto): Promise<SessionUser> {
    // Check if email already exists
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const orgType = dto.role === RegisterRole.STARTUP_ADMIN ? 'STARTUP' : 'OPERATOR_ENTITY';
    const membershipRole = (dto.role === RegisterRole.STARTUP_ADMIN ? 'STARTUP_ADMIN' : 'OPERATOR') as MembershipRole;

    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.orgName || `${dto.name}'s Organization`,
          orgType,
          country: dto.country || 'IN',
        },
      });

      const user = await tx.user.create({
        data: { name: dto.name, email: dto.email, passwordHash },
      });

      await tx.membership.create({
        data: { userId: user.id, orgId: org.id, membershipRole, status: 'ACTIVE' },
      });

      return { userId: user.id, orgId: org.id, name: user.name, email: user.email, role: membershipRole };
    });

    this.logger.log(`New user registered: ${result.email} as ${result.role}`);

    return {
      id: result.userId,
      name: result.name,
      email: result.email,
      role: result.role,
      orgId: result.orgId,
    };
  }

  /**
   * Validate credentials and return a SessionUser object.
   * Throws UnauthorizedException on invalid credentials or suspended accounts.
   */
  async validateCredentials(email: string, password: string): Promise<SessionUser> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Use a consistent error to avoid email enumeration
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Your account has been suspended. Please contact support.');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Your account is inactive. Please contact support.');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Use the first active membership to determine primary role and org
    const membership = user.memberships[0];
    if (!membership) {
      throw new BadRequestException('Your account has no active role assignment. Please contact support.');
    }

    await this.usersService.touchLoginTimestamp(user.id);

    this.logger.log(`User ${user.email} authenticated with role ${membership.membershipRole}`);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: membership.membershipRole,
      orgId: membership.orgId,
    };
  }
}

