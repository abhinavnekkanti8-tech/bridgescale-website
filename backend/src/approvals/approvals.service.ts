import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { ApplicationStatus } from '@prisma/client';

/**
 * Approvals Service: Final approval workflow for matched company-talent pairs.
 * Creates engagements and transitions applications to APPROVED status.
 */
@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Approve a matched pair (company + talent) after successful interview.
   * Updates both applications to APPROVED status.
   * Note: Engagement creation requires a Contract in the current schema.
   */
  async approvePair(params: {
    companyApplicationId: string;
    talentApplicationId: string;
    engagementType: 'SPRINT' | 'RETAINER';
    internalNotes?: string;
  }) {
    const company = await this.prisma.application.findUnique({
      where: { id: params.companyApplicationId },
    });

    const talent = await this.prisma.application.findUnique({
      where: { id: params.talentApplicationId },
    });

    if (!company || !talent) {
      throw new NotFoundException('One or both applications not found.');
    }

    if (company.type !== 'COMPANY' || talent.type !== 'TALENT') {
      throw new BadRequestException('Invalid application types for approval.');
    }

    // Update both applications to APPROVED
    const companyUpdated = await this.prisma.application.update({
      where: { id: params.companyApplicationId },
      data: { status: ApplicationStatus.APPROVED },
    });

    const talentUpdated = await this.prisma.application.update({
      where: { id: params.talentApplicationId },
      data: { status: ApplicationStatus.APPROVED },
    });

    this.logger.log(
      `Pair approved: ${company.name} with ${talent.name}`,
    );

    // Send approval notifications (fire-and-forget)
    this.sendApprovalNotifications(company, talent, params.engagementType);

    return {
      company: companyUpdated,
      talent: talentUpdated,
    };
  }

  /**
   * Reject a matched pair (after interview decision).
   * Updates both applications to REJECTED.
   */
  async rejectPair(params: {
    companyApplicationId: string;
    talentApplicationId: string;
    reason?: string;
  }) {
    const company = await this.prisma.application.findUnique({
      where: { id: params.companyApplicationId },
    });

    const talent = await this.prisma.application.findUnique({
      where: { id: params.talentApplicationId },
    });

    if (!company || !talent) {
      throw new NotFoundException('One or both applications not found.');
    }

    const companyUpdated = await this.prisma.application.update({
      where: { id: params.companyApplicationId },
      data: { status: ApplicationStatus.REJECTED },
    });

    const talentUpdated = await this.prisma.application.update({
      where: { id: params.talentApplicationId },
      data: { status: ApplicationStatus.REJECTED },
    });

    this.logger.log(
      `Pair rejected: ${company.name} with ${talent.name}${params.reason ? ` (${params.reason})` : ''}`,
    );

    // Send rejection notifications
    this.sendRejectionNotifications(company, talent, params.reason);

    return {
      company: companyUpdated,
      talent: talentUpdated,
      reason: params.reason,
    };
  }

  /**
   * Get approval status for a pair.
   */
  async getPairStatus(companyApplicationId: string, talentApplicationId: string) {
    const company = await this.prisma.application.findUnique({
      where: { id: companyApplicationId },
    });

    const talent = await this.prisma.application.findUnique({
      where: { id: talentApplicationId },
    });

    if (!company || !talent) {
      throw new NotFoundException('One or both applications not found.');
    }

    return {
      company: { id: company.id, status: company.status },
      talent: { id: talent.id, status: talent.status },
      isPaired: company.status === ApplicationStatus.APPROVED && talent.status === ApplicationStatus.APPROVED,
    };
  }

  /**
   * Get all approved pairs (applications with APPROVED status).
   */
  async getApprovedPairs() {
    const approvedApplications = await this.prisma.application.findMany({
      where: { status: ApplicationStatus.APPROVED },
      orderBy: { createdAt: 'desc' },
    });

    return approvedApplications;
  }

  /**
   * Send approval notifications to both parties.
   */
  private sendApprovalNotifications(company: any, talent: any, engagementType: string) {
    this.logger.log(
      `Approval notifications: ${company.name} and ${talent.name} for ${engagementType} engagement`,
    );

    // In a real system, would send emails here
    // For now, just log the notification
  }

  /**
   * Send rejection notifications.
   */
  private sendRejectionNotifications(company: any, talent: any, reason?: string) {
    this.logger.log(
      `Rejection notifications: ${company.name} and ${talent.name}${reason ? ` (${reason})` : ''}`,
    );

    // In a real system, would send emails here
  }
}
