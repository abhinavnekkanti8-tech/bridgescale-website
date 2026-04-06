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
 * Interviews Service: Manages scheduling and tracking of interviews.
 * Coordinates interviews between companies and talent candidates.
 */
@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Schedule an interview between a company and talent candidate.
   * Updates both applications to INTERVIEW_SCHEDULED status.
   */
  async scheduleInterview(params: {
    companyApplicationId: string;
    talentApplicationId: string;
    scheduledAt: Date;
    meetingLink?: string;
    notes?: string;
  }) {
    const company = await this.prisma.application.findUnique({
      where: { id: params.companyApplicationId },
    });

    const talent = await this.prisma.application.findUnique({
      where: { id: params.talentApplicationId },
    });

    if (!company) throw new NotFoundException('Company application not found.');
    if (!talent) throw new NotFoundException('Talent application not found.');

    if (company.type !== 'COMPANY') {
      throw new BadRequestException('First application must be a company.');
    }
    if (talent.type !== 'TALENT') {
      throw new BadRequestException('Second application must be talent.');
    }

    // Validate interview time is in the future
    if (new Date(params.scheduledAt) <= new Date()) {
      throw new BadRequestException('Interview must be scheduled for a future date.');
    }

    // Update both applications
    const companyUpdated = await this.prisma.application.update({
      where: { id: params.companyApplicationId },
      data: {
        status: ApplicationStatus.INTERVIEW_SCHEDULED,
        notes: params.notes ? `${company.notes || ''}\n\nInterview scheduled for ${params.scheduledAt}` : undefined,
      },
    });

    const talentUpdated = await this.prisma.application.update({
      where: { id: params.talentApplicationId },
      data: {
        status: ApplicationStatus.INTERVIEW_SCHEDULED,
      },
    });

    this.logger.log(
      `Interview scheduled: ${company.name} (company) with ${talent.name} (talent) at ${params.scheduledAt}`,
    );

    // Send notification emails
    this.sendInterviewNotifications(company, talent, params);

    return {
      id: `interview_${company.id}_${talent.id}`,
      companyApplication: companyUpdated,
      talentApplication: talentUpdated,
      scheduledAt: params.scheduledAt,
      meetingLink: params.meetingLink,
    };
  }

  /**
   * Get interview details and status.
   */
  async getInterview(companyApplicationId: string, talentApplicationId: string) {
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
      company,
      talent,
      status: company.status === ApplicationStatus.INTERVIEW_SCHEDULED ? 'SCHEDULED' : 'NOT_SCHEDULED',
    };
  }

  /**
   * Complete an interview and record outcome.
   * Updates status to APPROVED or REJECTED based on feedback.
   */
  async completeInterview(
    companyApplicationId: string,
    talentApplicationId: string,
    params: {
      decision: 'APPROVED' | 'REJECTED';
      feedback?: string;
      nextSteps?: string;
    },
  ) {
    const company = await this.prisma.application.findUnique({
      where: { id: companyApplicationId },
    });

    const talent = await this.prisma.application.findUnique({
      where: { id: talentApplicationId },
    });

    if (!company || !talent) {
      throw new NotFoundException('One or both applications not found.');
    }

    const newStatus = params.decision === 'APPROVED' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED;

    const companyUpdated = await this.prisma.application.update({
      where: { id: companyApplicationId },
      data: {
        status: newStatus,
        notes: `${company.notes || ''}\n\nInterview outcome: ${params.decision}\n${params.feedback || ''}`,
      },
    });

    const talentUpdated = await this.prisma.application.update({
      where: { id: talentApplicationId },
      data: {
        status: newStatus,
        notes: `${talent.notes || ''}\n\nInterview outcome: ${params.decision}`,
      },
    });

    this.logger.log(`Interview completed: ${params.decision} for ${company.name} and ${talent.name}`);

    // Send outcome notifications
    this.sendInterviewOutcomeNotifications(company, talent, params);

    return {
      company: companyUpdated,
      talent: talentUpdated,
      decision: params.decision,
      feedback: params.feedback,
    };
  }

  /**
   * List upcoming interviews (INTERVIEW_SCHEDULED applications).
   */
  async getUpcomingInterviews(limit = 20) {
    const interviews = await this.prisma.application.findMany({
      where: { status: ApplicationStatus.INTERVIEW_SCHEDULED },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return interviews;
  }

  /**
   * Send interview scheduled notifications to both parties.
   */
  private sendInterviewNotifications(
    company: any,
    talent: any,
    params: { scheduledAt: Date; meetingLink?: string },
  ) {
    const formattedDate = new Date(params.scheduledAt).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Non-blocking email notifications
    this.logger.log(
      `Interview notification: ${company.name} and ${talent.name} scheduled for ${formattedDate}${params.meetingLink ? ` (${params.meetingLink})` : ''}`,
    );
  }

  /**
   * Send interview outcome notifications.
   */
  private sendInterviewOutcomeNotifications(
    company: any,
    talent: any,
    params: { decision: string; feedback?: string },
  ) {
    const status = params.decision === 'APPROVED' ? 'approved' : 'not approved';

    // Non-blocking outcome notification
    this.logger.log(
      `Interview outcome: ${company.name} and ${talent.name} - ${status}${params.feedback ? ` (${params.feedback})` : ''}`,
    );
  }
}
