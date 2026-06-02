import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailActionType, Prisma, User } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

type SecurityUser = Pick<User, 'id' | 'name' | 'email'>;

@Injectable()
export class AccountSecurityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async sendEmailVerification(user: SecurityUser) {
    const { token } = await this.issueToken({
      userId: user.id,
      email: user.email,
      type: EmailActionType.VERIFY_EMAIL,
      expiresInMinutes: 60,
    });

    const verifyUrl = `${this.frontendUrl()}/auth/verify-email?token=${token}`;
    await this.emailService.sendEmailVerification({
      name: user.name,
      email: user.email,
      verifyUrl,
      expiryMinutes: 60,
    });
  }

  async sendPasswordReset(user: SecurityUser) {
    const { token } = await this.issueToken({
      userId: user.id,
      email: user.email,
      type: EmailActionType.RESET_PASSWORD,
      expiresInMinutes: 60,
    });

    const resetUrl = `${this.frontendUrl()}/auth/reset-password?token=${token}`;
    await this.emailService.sendPasswordReset({
      name: user.name,
      email: user.email,
      resetUrl,
      expiryMinutes: 60,
    });
  }

  async consumeToken(token: string, type: EmailActionType) {
    const tokenHash = this.hashToken(token);
    const record = await this.prisma.emailActionToken.findFirst({
      where: {
        tokenHash,
        type,
        consumedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or expired link.');
    }

    await this.prisma.emailActionToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });

    return record;
  }

  private async issueToken(params: {
    userId?: string;
    email: string;
    type: EmailActionType;
    expiresInMinutes: number;
    metadata?: Prisma.InputJsonValue;
  }) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + params.expiresInMinutes * 60 * 1000);

    await this.prisma.emailActionToken.updateMany({
      where: {
        email: params.email.toLowerCase().trim(),
        type: params.type,
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });

    await this.prisma.emailActionToken.create({
      data: {
        userId: params.userId,
        email: params.email.toLowerCase().trim(),
        tokenHash,
        type: params.type,
        metadata: params.metadata,
        expiresAt,
      },
    });

    return { token, expiresAt };
  }

  private frontendUrl() {
    return this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  private hashToken(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
