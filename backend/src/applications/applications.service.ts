import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateApplicationDto, ApplicationTypeDto } from './dto/create-application.dto';
import { ApplicationStatus, PaymentProvider } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Fee in minor units (paisa for INR, cents for USD).
   * Company: ₹15,000 = 1,500,000 paisa. Talent: $50 = 5,000 cents.
   */
  private getFeeMinor(type: ApplicationTypeDto): { amount: number; currency: string; provider: PaymentProvider } {
    if (type === ApplicationTypeDto.COMPANY) {
      return { amount: 1500000, currency: 'INR', provider: PaymentProvider.RAZORPAY };
    }
    return { amount: 5000, currency: 'USD', provider: PaymentProvider.STRIPE };
  }

  /** @deprecated use getFeeMinor */
  private getFeeAmount(type: ApplicationTypeDto): number {
    return type === ApplicationTypeDto.COMPANY ? 15000 : 50;
  }

  /**
   * Check if we're in dummy payment mode (skip Stripe).
   */
  private isDummyMode(): boolean {
    return this.config.get<string>('DUMMY_PAYMENT_MODE', 'true') === 'true';
  }

  /**
   * Create a new application, optionally creating a Stripe Checkout session.
   * In DUMMY_PAYMENT_MODE, the application is immediately marked as SUBMITTED.
   */
  async createApplication(dto: CreateApplicationDto) {
    const fee = this.getFeeMinor(dto.type);

    // Check for duplicate recent applications (same email within 24h)
    const recentDuplicate = await this.prisma.application.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        status: { not: ApplicationStatus.REJECTED },
      },
    });

    if (recentDuplicate) {
      throw new BadRequestException(
        'An application with this email was already submitted recently. Please check your inbox or try again later.',
      );
    }

    // Build the data object with all fields
    const applicationData = {
      type: dto.type,
      name: dto.name,
      email: dto.email.toLowerCase(),
      notes: dto.notes,

      // Company — mandatory
      companyName: dto.companyName,
      companyWebsite: dto.companyWebsite,
      companyStage: dto.companyStage,
      needArea: dto.needArea,
      targetMarkets: dto.targetMarkets,
      engagementModel: dto.engagementModel,
      budgetRange: dto.budgetRange,
      urgency: dto.urgency,

      // Company — optional
      salesMotion: dto.salesMotion,
      teamStructure: dto.teamStructure,
      hasDeck: dto.hasDeck,
      hasDemo: dto.hasDemo,
      hasCrm: dto.hasCrm,
      previousAttempts: dto.previousAttempts,
      idealOutcome90d: dto.idealOutcome90d,
      specificTargets: dto.specificTargets,

      // Talent — profile
      location: dto.location,
      talentCategory: dto.talentCategory,
      currentRole: dto.currentRole,
      currentEmployer: dto.currentEmployer,
      employmentStatus: dto.employmentStatus as any,
      yearsExperience: dto.yearsExperience,
      seniorityLevel: dto.seniorityLevel as any,
      seniority: dto.seniority,

      // Talent — track record
      engagementPref: dto.engagementPref,
      markets: dto.markets,
      dealHistory: dto.dealHistory ? (dto.dealHistory as object[]) : undefined,
      confidenceMarkets: dto.confidenceMarkets ? (dto.confidenceMarkets as object[]) : undefined,
      languagesSpoken: dto.languagesSpoken ?? [],

      // Talent — references
      linkedInUrl: dto.linkedInUrl,
      references: dto.references ? (dto.references as object[]) : undefined,

      // Talent — assessment & commercials
      caseStudyResponse: dto.caseStudyResponse,
      availabilityHours: dto.availabilityHours as any,
      earliestStart: dto.earliestStart ? new Date(dto.earliestStart) : undefined,
      rateExpectationMin: dto.rateExpectationMin,
      rateExpectationMax: dto.rateExpectationMax,
      rateCurrency: dto.rateCurrency ?? 'USD',
      preferredStructures: dto.preferredStructures ?? [],

      // Payment
      paymentProvider: fee.provider,
      feeAmountMinor: fee.amount,
      feeCurrency: fee.currency,
      feeAmountUsd: this.getFeeAmount(dto.type), // legacy field
    };

    if (this.isDummyMode()) {
      // ── DUMMY MODE: skip Stripe, mark as SUBMITTED immediately ──
      const application = await this.prisma.application.create({
        data: {
          ...applicationData,
          status: ApplicationStatus.SUBMITTED,
          paidAt: new Date(),
          stripeSessionId: `dummy_sess_${Date.now()}`,
          stripePaymentId: `dummy_pi_${Date.now()}`,
        },
      });

      this.logger.log(
        `[DUMMY MODE] Application ${application.id} created and auto-submitted for ${dto.email}`,
      );

      // Send confirmation email (async, non-blocking)
      this.emailService
        .sendApplicationReceived({
          id: application.id,
          name: application.name,
          email: application.email,
          type: application.type,
        })
        .catch((err) =>
          this.logger.error(`Failed to send confirmation email: ${err.message}`),
        );

      return {
        applicationId: application.id,
        status: application.status,
        checkoutUrl: null,
        dummyMode: true,
      };
    }

    // ── LIVE MODE: Create application as PENDING_PAYMENT, then Stripe session ──
    const application = await this.prisma.application.create({
      data: {
        ...applicationData,
        status: ApplicationStatus.PENDING_PAYMENT,
      },
    });

    // Until Stripe is configured, fall back to dummy behavior
    const updated = await this.prisma.application.update({
      where: { id: application.id },
      data: {
        status: ApplicationStatus.SUBMITTED,
        paidAt: new Date(),
        stripeSessionId: `placeholder_sess_${Date.now()}`,
      },
    });

    this.logger.log(
      `Application ${application.id} created for ${dto.email} (Stripe not configured — auto-submitted)`,
    );

    // Send confirmation email
    this.emailService
      .sendApplicationReceived({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        type: updated.type,
      })
      .catch((err) =>
        this.logger.error(`Failed to send confirmation email: ${err.message}`),
      );

    return {
      applicationId: updated.id,
      status: updated.status,
      checkoutUrl: null,
      dummyMode: true,
    };
  }

  /**
   * Handle Stripe webhook: checkout.session.completed
   * Marks the application as SUBMITTED after successful payment.
   */
  async handleCheckoutCompleted(stripeSessionId: string, paymentIntentId: string) {
    const application = await this.prisma.application.findUnique({
      where: { stripeSessionId },
    });

    if (!application) {
      this.logger.warn(`No application found for Stripe session ${stripeSessionId}`);
      return { received: true };
    }

    if (application.status !== ApplicationStatus.PENDING_PAYMENT) {
      this.logger.warn(`Application ${application.id} already processed (status: ${application.status})`);
      return { received: true };
    }

    await this.prisma.application.update({
      where: { id: application.id },
      data: {
        status: ApplicationStatus.SUBMITTED,
        stripePaymentId: paymentIntentId,
        paidAt: new Date(),
      },
    });

    this.logger.log(`Application ${application.id} payment confirmed — status → SUBMITTED`);

    // Send confirmation email after payment
    this.emailService
      .sendApplicationReceived({
        id: application.id,
        name: application.name,
        email: application.email,
        type: application.type,
      })
      .catch((err) =>
        this.logger.error(`Failed to send confirmation email: ${err.message}`),
      );

    return { received: true, applicationId: application.id };
  }

  /**
   * Get application status by ID (public — for post-payment confirmation page).
   */
  async getApplicationStatus(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        status: true,
        name: true,
        email: true,
        feeAmountUsd: true,
        createdAt: true,
      },
    });

    if (!application) throw new NotFoundException('Application not found.');
    return application;
  }

  /**
   * List all applications (Admin endpoint).
   */
  async listApplications(status?: ApplicationStatus) {
    return this.prisma.application.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update application status (Admin — for review workflow).
   * Sends email notification on status change.
   */
  async updateApplicationStatus(id: string, status: ApplicationStatus) {
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found.');

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status },
    });

    this.logger.log(`Application ${id} status updated: ${application.status} → ${status}`);

    // Send status update email (async, non-blocking)
    this.emailService
      .sendStatusUpdate(
        { id: updated.id, name: updated.name, email: updated.email },
        status,
      )
      .catch((err) =>
        this.logger.error(`Failed to send status update email: ${err.message}`),
      );

    return updated;
  }

  /**
   * Attach a CV file to an application.
   */
  async attachCv(applicationId: string, fileName: string, fileUrl: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) throw new NotFoundException('Application not found.');

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { cvFileName: fileName, cvFileUrl: fileUrl },
    });

    this.logger.log(`CV attached to application ${applicationId}: ${fileName}`);
    return { applicationId: updated.id, cvFileName: updated.cvFileName, cvFileUrl: updated.cvFileUrl };
  }
}
