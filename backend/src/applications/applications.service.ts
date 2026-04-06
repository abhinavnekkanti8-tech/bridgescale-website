import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RazorpayService } from '../payments/razorpay.service';
import { AiWorkflowService } from '../ai/ai-workflow.service';
import { CreateApplicationDto, ApplicationTypeDto } from './dto/create-application.dto';
import { ApplicationStatus, PaymentProvider, MembershipRole, OrgType, UserStatus } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    private readonly razorpay: RazorpayService,
    private readonly aiWorkflow: AiWorkflowService,
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

  private isDummyMode(): boolean {
    return this.config.get<string>('DUMMY_PAYMENT_MODE', 'true') === 'true';
  }

  /**
   * Create a new application and initiate payment.
   * Returns payment initiation data for the frontend to drive the checkout flow.
   *
   * Company → Razorpay order (modal flow)
   * Talent  → Stripe Checkout session URL (redirect flow)
   */
  async createApplication(dto: CreateApplicationDto) {
    const fee = this.getFeeMinor(dto.type);

    // Duplicate guard: same email within 24h (excluding REJECTED)
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

      // Payment meta
      paymentProvider: fee.provider,
      feeAmountMinor: fee.amount,
      feeCurrency: fee.currency,
      feeAmountUsd: this.getFeeAmount(dto.type),
    };

    // Create application as PENDING_PAYMENT
    const application = await this.prisma.application.create({
      data: { ...applicationData, status: ApplicationStatus.PENDING_PAYMENT },
    });

    this.logger.log(`Application ${application.id} created (PENDING_PAYMENT) for ${dto.email}`);

    // ── Company → Razorpay order ──────────────────────────────────────────────
    if (dto.type === ApplicationTypeDto.COMPANY) {
      const order = await this.razorpay.createOrder({
        amountPaisa: fee.amount,
        currency: fee.currency,
        receipt: application.id.slice(0, 40),
        notes: { applicationId: application.id, applicantEmail: dto.email },
      });

      // Persist orderId in stripeSessionId field (reuse for lookup)
      await this.prisma.application.update({
        where: { id: application.id },
        data: { stripeSessionId: order.id },
      });

      return {
        applicationId: application.id,
        status: ApplicationStatus.PENDING_PAYMENT,
        provider: 'RAZORPAY',
        keyId: this.razorpay.publishableKeyId,
        orderId: order.id,
        amount: fee.amount,
        currency: fee.currency,
        prefill: { name: dto.name, email: dto.email.toLowerCase() },
        dummyMode: this.isDummyMode(),
      };
    }

    // ── Talent → Stripe Checkout (dummy session for now) ─────────────────────
    const dummySessionId = `cs_test_dummy_${Date.now()}`;
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3001');

    await this.prisma.application.update({
      where: { id: application.id },
      data: { stripeSessionId: dummySessionId },
    });

    // In dummy mode: skip Stripe redirect and auto-confirm immediately
    if (this.isDummyMode()) {
      await this.prisma.application.update({
        where: { id: application.id },
        data: {
          status: ApplicationStatus.SUBMITTED,
          paidAt: new Date(),
          stripePaymentId: `dummy_pi_${Date.now()}`,
        },
      });

      this.emailService
        .sendApplicationReceived({
          id: application.id,
          name: application.name,
          email: application.email,
          type: application.type,
        })
        .catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));

      this.provisionAccount({
        id: application.id,
        name: application.name,
        email: application.email,
        type: application.type,
        companyName: null,
      });

      return {
        applicationId: application.id,
        status: ApplicationStatus.SUBMITTED,
        provider: 'STRIPE',
        checkoutUrl: null,
        dummyMode: true,
      };
    }

    return {
      applicationId: application.id,
      status: ApplicationStatus.PENDING_PAYMENT,
      provider: 'STRIPE',
      checkoutUrl: `${frontendUrl}/for-talent/apply/pay?session=${dummySessionId}`,
      amount: fee.amount,
      currency: fee.currency,
      dummyMode: false,
    };
  }

  /**
   * Verify a Razorpay payment and mark the application as SUBMITTED.
   * Called by frontend after the Razorpay modal success callback.
   */
  async verifyRazorpayPayment(params: {
    applicationId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const application = await this.prisma.application.findUnique({
      where: { id: params.applicationId },
    });

    if (!application) throw new NotFoundException('Application not found.');

    if (application.status !== ApplicationStatus.PENDING_PAYMENT) {
      return { success: true, applicationId: params.applicationId, status: application.status };
    }

    const isValid = this.razorpay.verifyPaymentSignature({
      orderId: params.razorpayOrderId,
      paymentId: params.razorpayPaymentId,
      signature: params.razorpaySignature,
    });

    if (!isValid) {
      throw new BadRequestException('Payment verification failed — invalid signature.');
    }

    const updated = await this.prisma.application.update({
      where: { id: params.applicationId },
      data: {
        status: ApplicationStatus.SUBMITTED,
        stripePaymentId: params.razorpayPaymentId,
        paidAt: new Date(),
      },
    });

    this.logger.log(`Application ${params.applicationId} Razorpay verified — status → SUBMITTED`);

    this.emailService
      .sendApplicationReceived({ id: updated.id, name: updated.name, email: updated.email, type: updated.type })
      .catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));

    // Provision user account
    this.provisionAccount({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      type: updated.type,
      companyName: (updated as any).companyName,
    });

    // Trigger diagnosis generation (non-blocking, fire-and-forget)
    this.aiWorkflow
      .generateDiagnosisForApplication(updated.id)
      .catch((err) => this.logger.error(`Failed to trigger diagnosis: ${err.message}`));

    return { success: true, applicationId: updated.id, status: updated.status };
  }

  /**
   * Dummy payment confirm — marks PENDING_PAYMENT → SUBMITTED instantly.
   * Only available when DUMMY_PAYMENT_MODE=true.
   */
  async dummyConfirmPayment(applicationId: string) {
    if (!this.isDummyMode()) {
      throw new BadRequestException('Dummy confirm is disabled in production.');
    }

    const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) throw new NotFoundException('Application not found.');

    if (application.status !== ApplicationStatus.PENDING_PAYMENT) {
      return { success: true, applicationId, status: application.status };
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.SUBMITTED,
        paidAt: new Date(),
        stripePaymentId: `dummy_pi_${Date.now()}`,
      },
    });

    this.logger.log(`[DUMMY] Application ${applicationId} confirmed — status → SUBMITTED`);

    this.emailService
      .sendApplicationReceived({ id: updated.id, name: updated.name, email: updated.email, type: updated.type })
      .catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));

    this.provisionAccount({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      type: updated.type,
      companyName: (updated as any).companyName,
    });

    // Trigger diagnosis generation (non-blocking, fire-and-forget)
    this.aiWorkflow
      .generateDiagnosisForApplication(updated.id)
      .catch((err) => this.logger.error(`Failed to trigger diagnosis: ${err.message}`));

    return { success: true, applicationId: updated.id, status: updated.status };
  }

  /**
   * Handle Razorpay webhook: payment.captured event.
   */
  async handleRazorpayWebhook(rawBody: string, signature: string, payload: any) {
    if (!this.razorpay.verifyWebhookSignature(rawBody, signature)) {
      throw new BadRequestException('Invalid Razorpay webhook signature.');
    }

    if (payload.event !== 'payment.captured') return { received: true };

    const paymentEntity = payload.payload?.payment?.entity;
    if (!paymentEntity?.order_id) return { received: true };

    const application = await this.prisma.application.findFirst({
      where: { stripeSessionId: paymentEntity.order_id },
    });

    if (!application || application.status !== ApplicationStatus.PENDING_PAYMENT) {
      return { received: true };
    }

    await this.prisma.application.update({
      where: { id: application.id },
      data: {
        status: ApplicationStatus.SUBMITTED,
        stripePaymentId: paymentEntity.id,
        paidAt: new Date(),
      },
    });

    this.logger.log(`Razorpay webhook: Application ${application.id} → SUBMITTED`);

    this.emailService
      .sendApplicationReceived({ id: application.id, name: application.name, email: application.email, type: application.type })
      .catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));

    this.provisionAccount({
      id: application.id,
      name: application.name,
      email: application.email,
      type: application.type,
      companyName: (application as any).companyName,
    });

    // Trigger diagnosis generation (non-blocking, fire-and-forget)
    this.aiWorkflow
      .generateDiagnosisForApplication(application.id)
      .catch((err) => this.logger.error(`Failed to trigger diagnosis: ${err.message}`));

    return { received: true, applicationId: application.id };
  }

  /**
   * Handle Stripe webhook: checkout.session.completed
   */
  async handleCheckoutCompleted(stripeSessionId: string, paymentIntentId: string) {
    const application = await this.prisma.application.findUnique({ where: { stripeSessionId } });

    if (!application) {
      this.logger.warn(`No application for Stripe session ${stripeSessionId}`);
      return { received: true };
    }

    if (application.status !== ApplicationStatus.PENDING_PAYMENT) return { received: true };

    await this.prisma.application.update({
      where: { id: application.id },
      data: { status: ApplicationStatus.SUBMITTED, stripePaymentId: paymentIntentId, paidAt: new Date() },
    });

    this.logger.log(`Stripe webhook: Application ${application.id} → SUBMITTED`);

    this.emailService
      .sendApplicationReceived({ id: application.id, name: application.name, email: application.email, type: application.type })
      .catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));

    this.provisionAccount({
      id: application.id,
      name: application.name,
      email: application.email,
      type: application.type,
      companyName: (application as any).companyName,
    });

    // Trigger diagnosis generation (non-blocking, fire-and-forget)
    this.aiWorkflow
      .generateDiagnosisForApplication(application.id)
      .catch((err) => this.logger.error(`Failed to trigger diagnosis: ${err.message}`));

    return { received: true, applicationId: application.id };
  }

  /**
   * Provision a User + Organization + Membership after payment is confirmed.
   * Idempotent: if a user with the same email already exists, returns the existing user.
   * Sends a magic-link login email so the applicant can access their dashboard.
   */
  private async provisionAccount(application: {
    id: string;
    name: string;
    email: string;
    type: string;
    companyName?: string | null;
  }): Promise<void> {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: application.email },
      });

      if (existing) {
        // Account already provisioned — just refresh the magic link
        await this.issueAndSendMagicLink(existing.id, application.name, application.email);
        return;
      }

      const isCompany = application.type === 'COMPANY';
      const orgType: OrgType = isCompany ? OrgType.STARTUP : OrgType.OPERATOR_ENTITY;
      const orgName = isCompany
        ? (application.companyName ?? `${application.name}'s Company`)
        : `${application.name} (Operator)`;
      const membershipRole: MembershipRole = isCompany
        ? MembershipRole.STARTUP_ADMIN
        : MembershipRole.OPERATOR;

      await this.prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: { name: orgName, orgType, country: isCompany ? 'IN' : undefined },
        });

        const user = await tx.user.create({
          data: {
            name: application.name,
            email: application.email,
            status: UserStatus.PENDING_APPROVAL,
          },
        });

        await tx.membership.create({
          data: {
            userId: user.id,
            orgId: org.id,
            membershipRole,
            status: 'PENDING',
          },
        });

        await this.issueAndSendMagicLink(user.id, application.name, application.email);
      });

      this.logger.log(`Account provisioned for ${application.email} (${application.type})`);
    } catch (err: any) {
      // Non-blocking — don't fail payment confirmation if provisioning fails
      this.logger.error(`Failed to provision account for ${application.email}: ${err.message}`);
    }
  }

  /** Generate a magic-link token, persist it, and send the login email. */
  private async issueAndSendMagicLink(userId: string, name: string, email: string): Promise<void> {
    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await this.prisma.user.update({
      where: { id: userId },
      data: { magicLinkToken: token, magicLinkExpiry: expiry },
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3001');
    const magicUrl = `${frontendUrl}/auth/magic?token=${token}`;

    this.emailService
      .sendMagicLink({ name, email, magicUrl, expiryMinutes: 30 })
      .catch((err) => this.logger.error(`Failed to send magic link to ${email}: ${err.message}`));
  }

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
        feeCurrency: true,
        feeAmountMinor: true,
        paymentProvider: true,
        createdAt: true,
        paidAt: true,
      },
    });

    if (!application) throw new NotFoundException('Application not found.');
    return application;
  }

  async listApplications(status?: ApplicationStatus) {
    return this.prisma.application.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus) {
    const application = await this.prisma.application.findUnique({ where: { id } });
    if (!application) throw new NotFoundException('Application not found.');

    const updated = await this.prisma.application.update({
      where: { id },
      data: { status },
    });

    this.logger.log(`Application ${id} status updated: ${application.status} → ${status}`);

    this.emailService
      .sendStatusUpdate({ id: updated.id, name: updated.name, email: updated.email }, status)
      .catch((err) => this.logger.error(`Failed to send status update email: ${err.message}`));

    return updated;
  }

  async attachCv(applicationId: string, fileName: string, fileUrl: string) {
    const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) throw new NotFoundException('Application not found.');

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { cvFileName: fileName, cvFileUrl: fileUrl },
    });

    this.logger.log(`CV attached to application ${applicationId}: ${fileName}`);
    return { applicationId: updated.id, cvFileName: updated.cvFileName, cvFileUrl: updated.cvFileUrl };
  }

  /**
   * Get the authenticated user's application by email.
   * Used for the dashboard — shows user their own application + diagnosis.
   */
  async getMyApplication(email: string) {
    const application = await this.prisma.application.findFirst({
      where: { email: email.toLowerCase() },
      include: {
        needDiagnosis: true,
        opportunityBrief: true,
        talentPreScreen: true,
      },
    });

    if (!application) throw new NotFoundException('No application found for this email.');
    return application;
  }
}
