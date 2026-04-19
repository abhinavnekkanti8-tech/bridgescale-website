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
import { CrossVerifyService } from '../ai/cross-verify.service';
import { CreateApplicationDto, ApplicationTypeDto } from './dto/create-application.dto';
import { ApplicationStatus, PaymentProvider, MembershipRole, OrgType, UserStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly emailService: EmailService,
    private readonly razorpay: RazorpayService,
    private readonly aiWorkflow: AiWorkflowService,
    private readonly crossVerify: CrossVerifyService,
  ) {}

  /**
   * Fee in minor units (paisa for INR, cents for USD).
   * Company: ₹8,500 = 850,000 paisa. Talent: $50 = 5,000 cents.
   * Paid for "unlock matching" from dashboard, not at signup (free signup).
   */
  private getFeeMinor(type: ApplicationTypeDto): { amount: number; currency: string; provider: PaymentProvider } {
    if (type === ApplicationTypeDto.COMPANY) {
      return { amount: 850000, currency: 'INR', provider: PaymentProvider.RAZORPAY };
    }
    return { amount: 5000, currency: 'USD', provider: PaymentProvider.STRIPE };
  }

  /** @deprecated use getFeeMinor */
  private getFeeAmount(type: ApplicationTypeDto): number {
    return type === ApplicationTypeDto.COMPANY ? 100 : 50;
  }

  private isDummyMode(): boolean {
    return this.config.get<string>('DUMMY_PAYMENT_MODE', 'true') === 'true';
  }

  /**
   * Create a new application with free signup (no payment at signup).
   * Returns session data for auto-login + application details.
   *
   * Flow:
   * 1. Create application record (SUBMITTED or AWAITING_COMPLETION)
   * 2. Provision user account immediately
   * 3. Trigger internal matching (companies) or AI pre-screen (talent)
   * 4. Return session token for auto-login
   *
   * Payment (unlock matching) happens later from the dashboard via initiateUnlockPayment().
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

    // Determine status based on type and skipped steps
    const isTalent = dto.type === ApplicationTypeDto.TALENT;
    const assessmentSkipped = isTalent && (dto.assessmentSkipped ?? false);
    const referencesSkipped = isTalent && (dto.referencesSkipped ?? false);

    const initialStatus = (isTalent && (assessmentSkipped || referencesSkipped))
      ? ApplicationStatus.AWAITING_COMPLETION
      : ApplicationStatus.SUBMITTED;

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

      // Signup flow control
      assessmentSkipped,
      referencesSkipped,
      assessmentCompletedAt: (isTalent && !assessmentSkipped && dto.caseStudyResponse) ? new Date() : undefined,
      referencesCompletedAt: (isTalent && !referencesSkipped && (dto.references?.length ?? 0) >= 2) ? new Date() : undefined,

      // Payment meta (stored for later unlock — no payment at signup)
      paymentProvider: fee.provider,
      feeAmountMinor: fee.amount,
      feeCurrency: fee.currency,
      feeAmountUsd: this.getFeeAmount(dto.type),
    };

    // Create application with correct initial status (NOT PENDING_PAYMENT)
    const application = await this.prisma.application.create({
      data: { ...applicationData, status: initialStatus },
    });

    this.logger.log(`Application ${application.id} created (${initialStatus}) for ${dto.email} — FREE SIGNUP`);

    // Send confirmation email
    this.emailService
      .sendApplicationReceived({
        id: application.id,
        name: application.name,
        email: application.email,
        type: application.type,
      })
      .catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));

    // Provision account immediately (user + org + membership)
    const sessionData = await this.provisionAccountWithPassword({
      id: application.id,
      name: application.name,
      email: application.email,
      type: application.type,
      companyName: dto.companyName ?? null,
      password: dto.password,
    });

    // For companies: trigger internal matching in background
    if (dto.type === ApplicationTypeDto.COMPANY) {
      this.triggerInternalMatching(application.id).catch((err) =>
        this.logger.error(`Failed to trigger internal matching: ${err.message}`),
      );
    }

    // For talent with assessment data: trigger AI pre-screen
    if (isTalent && !assessmentSkipped && dto.caseStudyResponse) {
      this.aiWorkflow
        .generatePreScreenForApplication(application.id)
        .catch((err) => this.logger.error(`Failed to trigger pre-screen: ${err.message}`));
    }

    return {
      applicationId: application.id,
      status: initialStatus,
      provider: 'NONE',
      dummyMode: this.isDummyMode(),
      // Session data for auto-login
      session: sessionData,
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

      // Fire-and-forget cross-verification of any references on the source
      // application. Result is persisted on the talentPreScreen if/when one
      // exists, so this only runs for talent.
      this.runCrossVerifyForApplication(application.id).catch((err) =>
        this.logger.error(`Cross-verify pipeline failed: ${err.message}`),
      );
    } catch (err: any) {
      // Non-blocking — don't fail payment confirmation if provisioning fails
      this.logger.error(`Failed to provision account for ${application.email}: ${err.message}`);
    }
  }

  /**
   * Provision a User + Organization + Membership during FREE signup.
   * Hashes password if provided. Returns session data for auto-login.
   * Idempotent: if user exists, returns existing data.
   */
  private async provisionAccountWithPassword(application: {
    id: string;
    name: string;
    email: string;
    type: string;
    companyName?: string | null;
    password?: string;
  }): Promise<{ userId: string; orgId: string; role: string } | null> {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: application.email },
      });

      if (existing) {
        // Account already exists — return existing data for session
        const membership = await this.prisma.membership.findFirst({
          where: { userId: existing.id },
        });
        return {
          userId: existing.id,
          orgId: membership?.orgId ?? '',
          role: membership?.membershipRole ?? 'OPERATOR',
        };
      }

      const isCompany = application.type === 'COMPANY';
      const orgType: OrgType = isCompany ? OrgType.STARTUP : OrgType.OPERATOR_ENTITY;
      const orgName = isCompany
        ? (application.companyName ?? `${application.name}'s Company`)
        : `${application.name} (Operator)`;
      const membershipRole: MembershipRole = isCompany
        ? MembershipRole.STARTUP_ADMIN
        : MembershipRole.OPERATOR;

      // Hash password if provided
      const passwordHash = application.password
        ? await bcrypt.hash(application.password, 10)
        : null;

      const result = await this.prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: { name: orgName, orgType, country: isCompany ? 'IN' : undefined },
        });

        const user = await tx.user.create({
          data: {
            name: application.name,
            email: application.email,
            passwordHash,
            status: UserStatus.PENDING_APPROVAL,
          },
        });

        await tx.membership.create({
          data: {
            userId: user.id,
            orgId: org.id,
            membershipRole,
            status: 'ACTIVE', // Active immediately (not PENDING — no payment gate)
          },
        });

        return { userId: user.id, orgId: org.id, role: membershipRole };
      });

      this.logger.log(`Account provisioned (free signup) for ${application.email} (${application.type})`);

      // Cross-verify references if talent provided them
      this.runCrossVerifyForApplication(application.id).catch((err) =>
        this.logger.error(`Cross-verify pipeline failed: ${err.message}`),
      );

      return result;
    } catch (err: any) {
      this.logger.error(`Failed to provision account for ${application.email}: ${err.message}`);
      return null;
    }
  }

  /**
   * Trigger internal matching for a company application.
   * Creates a StartupProfile from the application data, then runs the matching algorithm.
   * Results are stored but NOT revealed until payment.
   */
  private async triggerInternalMatching(applicationId: string): Promise<void> {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!app || app.type !== 'COMPANY') return;

    // Check if a startup profile already exists for this company's org
    const user = await this.prisma.user.findUnique({
      where: { email: app.email },
      include: { memberships: { include: { organization: true } } },
    });
    if (!user) return;

    const org = user.memberships[0]?.organization;
    if (!org) return;

    // Check if startup profile already exists
    const existingProfile = await this.prisma.startupProfile.findUnique({
      where: { startupId: org.id },
    });

    if (existingProfile) {
      this.logger.log(`Startup profile already exists for org ${org.id} — skipping creation`);
      return;
    }

    // Map application data to startup profile fields
    const targetMarketMap: Record<string, string> = {
      'EU': 'EU', 'US': 'US', 'UK': 'EU', 'Australia': 'AU', 'AU': 'AU',
      'Middle East': 'REST_OF_WORLD', 'Southeast Asia': 'REST_OF_WORLD',
      'Rest of World': 'REST_OF_WORLD', 'RoW': 'REST_OF_WORLD',
    };

    const targetMarkets = (app.targetMarkets?.split(',') ?? [])
      .map(m => targetMarketMap[m.trim()] ?? 'REST_OF_WORLD')
      .filter((v, i, arr) => arr.indexOf(v) === i) as any[];

    const stageMap: Record<string, string> = {
      'Pre-Seed': 'PRE_SEED', 'Seed': 'SEED', 'Series A': 'SERIES_A',
      'Series B+': 'SERIES_B_PLUS', 'Bootstrapped': 'BOOTSTRAPPED',
    };

    const budgetMap: Record<string, string> = {
      '$2,000–$5,000': 'TWO_TO_5K', '$5,000–$10,000': 'FIVE_TO_10K',
      '$10,000–$25,000': 'ABOVE_10K', '$25,000+': 'ABOVE_10K',
    };

    const motionMap: Record<string, string> = {
      'Outbound': 'OUTBOUND', 'Inbound': 'INBOUND', 'Partner-led': 'PARTNER_LED',
      'Product-led': 'PRODUCT_LED', 'Blended': 'BLENDED',
    };

    try {
      const profile = await this.prisma.startupProfile.create({
        data: {
          startupId: org.id,
          industry: app.needArea ?? 'General',
          stage: (stageMap[app.companyStage ?? ''] ?? 'BOOTSTRAPPED') as any,
          targetMarkets: targetMarkets.length > 0 ? targetMarkets : ['REST_OF_WORLD'],
          salesMotion: (motionMap[app.salesMotion ?? ''] ?? 'OUTBOUND') as any,
          budgetBand: (budgetMap[app.budgetRange ?? ''] ?? 'TWO_TO_5K') as any,
          hasDeck: app.hasDeck ?? false,
          hasProductDemo: app.hasDemo ?? false,
          status: 'SUBMITTED',
        },
      });

      this.logger.log(`StartupProfile created (${profile.id}) from application ${applicationId}`);
    } catch (err: any) {
      this.logger.error(`Failed to create startup profile from application: ${err.message}`);
    }
  }

  /**
   * Run cross-verification on a talent application's references and
   * persist the result onto the talentPreScreen row (created lazily if it
   * does not yet exist). Always non-blocking and never throws.
   */
  private async runCrossVerifyForApplication(applicationId: string): Promise<void> {
    const app = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        type: true,
        linkedInUrl: true,
        references: true,
      },
    });

    if (!app || app.type !== 'TALENT') return;

    const inputs: Array<{ email?: string; linkedInUrl?: string; fullName?: string }> = [];

    // Self verification (the applicant themselves)
    if (app.linkedInUrl) {
      inputs.push({ linkedInUrl: app.linkedInUrl });
    }

    // Their references — typed loosely because Prisma stores JSON
    const refs = (app.references as Array<Record<string, unknown>> | null) || [];
    for (const r of refs) {
      inputs.push({
        email: typeof r.email === 'string' ? r.email : undefined,
        linkedInUrl: typeof r.linkedIn === 'string' ? r.linkedIn : undefined,
        fullName: typeof r.name === 'string' ? r.name : undefined,
      });
    }

    if (inputs.length === 0) return;

    const results = await this.crossVerify.verifyReferences(inputs);

    await this.prisma.talentPreScreen.upsert({
      where: { applicationId },
      update: {
        referenceVerification: results as any,
      },
      create: {
        applicationId,
        recommendation: 'CONDITIONAL',
        completenessScore: 0,
        consistencyScore: 0,
        referenceScore: 0,
        assessmentScore: 0,
        redFlags: [],
        suggestedProbeQuestions: [],
        referenceVerification: results as any,
      },
    });

    this.logger.log(
      `Cross-verify completed for application ${applicationId}: ${results.length} references checked (mode=${this.crossVerify.getMode()})`,
    );
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

    // StartupProfile lives on Organization, not Application — fetch separately
    const org = await this.prisma.organization.findFirst({
      where: { memberships: { some: { user: { email: email.toLowerCase() } } } },
      include: {
        startupProfile: {
          include: {
            shortlists: {
              include: { candidates: { take: 5 } },
              take: 1,
            },
          },
        },
      },
    });

    return { ...application, startupProfile: org?.startupProfile ?? null };
  }

  /**
   * ADMIN — Schedule an interview for an application.
   * Sets status to INTERVIEW_SCHEDULED and stores when/where + free-form notes.
   * Sends a notification email to the applicant.
   */
  async scheduleInterview(
    applicationId: string,
    params: {
      scheduledAt: string | Date;
      location?: string;
      notes?: string;
    },
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found.');

    const when = new Date(params.scheduledAt);
    if (isNaN(when.getTime())) {
      throw new BadRequestException('Invalid scheduledAt date.');
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.INTERVIEW_SCHEDULED,
        interviewScheduledAt: when,
        interviewLocation: params.location,
        interviewNotes: params.notes,
      },
    });

    this.logger.log(
      `Application ${applicationId} interview scheduled for ${when.toISOString()}`,
    );

    this.emailService
      .sendStatusUpdate(
        { id: updated.id, name: updated.name, email: updated.email },
        ApplicationStatus.INTERVIEW_SCHEDULED,
      )
      .catch((err) =>
        this.logger.error(`Failed to send schedule email: ${err.message}`),
      );

    return updated;
  }

  /**
   * ADMIN — Approve an application as final.
   * Sets status to APPROVED and activates the user account if pending.
   */
  async approveApplication(applicationId: string, reason?: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found.');

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.APPROVED,
        decidedAt: new Date(),
        decisionReason: reason,
      },
    });

    // Activate the corresponding user account if it's pending
    const user = await this.prisma.user.findUnique({
      where: { email: application.email.toLowerCase() },
    });
    if (user && user.status === UserStatus.PENDING_APPROVAL) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: UserStatus.ACTIVE },
      });
      this.logger.log(`User ${user.email} activated after application approval.`);
    }

    this.logger.log(`Application ${applicationId} approved.`);

    this.emailService
      .sendStatusUpdate(
        { id: updated.id, name: updated.name, email: updated.email },
        ApplicationStatus.APPROVED,
      )
      .catch((err) =>
        this.logger.error(`Failed to send approval email: ${err.message}`),
      );

    return updated;
  }

  /**
   * ADMIN — Reject an application as final.
   * Sets status to REJECTED with the reason for the audit trail and email.
   */
  async rejectApplication(applicationId: string, reason: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found.');

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Rejection reason is required.');
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.REJECTED,
        decidedAt: new Date(),
        decisionReason: reason,
      },
    });

    this.logger.log(`Application ${applicationId} rejected: ${reason}`);

    this.emailService
      .sendStatusUpdate(
        { id: updated.id, name: updated.name, email: updated.email },
        ApplicationStatus.REJECTED,
      )
      .catch((err) =>
        this.logger.error(`Failed to send rejection email: ${err.message}`),
      );

    return updated;
  }

  // ── Dashboard: Completion & Unlock Matching ────────────────────────────────

  /**
   * Complete assessment for a talent application (from dashboard).
   * Updates the application with assessment data and marks assessmentSkipped = false.
   */
  async completeAssessment(
    email: string,
    dto: any, // CompleteAssessmentDto but avoiding circular import
  ) {
    const application = await this.prisma.application.findFirst({
      where: { email: email.toLowerCase(), type: 'TALENT' },
    });
    if (!application) throw new NotFoundException('No talent application found.');

    const updated = await this.prisma.application.update({
      where: { id: application.id },
      data: {
        caseStudyResponse: dto.caseStudyResponse,
        availabilityHours: dto.availabilityHours as any,
        earliestStart: dto.earliestStart ? new Date(dto.earliestStart) : undefined,
        rateExpectationMin: dto.rateExpectationMin,
        rateExpectationMax: dto.rateExpectationMax,
        rateCurrency: dto.rateCurrency ?? 'USD',
        preferredStructures: dto.preferredStructures ?? [],
        assessmentSkipped: false,
        assessmentCompletedAt: new Date(),
        // If references are also complete, move to SUBMITTED
        status: application.referencesCompletedAt
          ? ApplicationStatus.SUBMITTED
          : ApplicationStatus.AWAITING_COMPLETION,
      },
    });

    this.logger.log(`Assessment completed for application ${application.id}`);

    // Trigger AI pre-screen now that assessment is available
    this.aiWorkflow
      .generatePreScreenForApplication(application.id)
      .catch((err) => this.logger.error(`Failed to trigger pre-screen: ${err.message}`));

    return { applicationId: updated.id, status: updated.status };
  }

  /**
   * Complete references for a talent application (from dashboard).
   * Updates the application with reference data and marks referencesSkipped = false.
   */
  async completeReferences(
    email: string,
    dto: any, // CompleteReferencesDto but avoiding circular import
  ) {
    const application = await this.prisma.application.findFirst({
      where: { email: email.toLowerCase(), type: 'TALENT' },
    });
    if (!application) throw new NotFoundException('No talent application found.');

    const updated = await this.prisma.application.update({
      where: { id: application.id },
      data: {
        references: dto.references as any,
        referencesSkipped: false,
        referencesCompletedAt: new Date(),
        // If assessment is also complete, move to SUBMITTED
        status: application.assessmentCompletedAt
          ? ApplicationStatus.SUBMITTED
          : ApplicationStatus.AWAITING_COMPLETION,
      },
    });

    this.logger.log(`References completed for application ${application.id}`);

    // Trigger cross-verification
    this.runCrossVerifyForApplication(application.id).catch((err) =>
      this.logger.error(`Cross-verify pipeline failed: ${err.message}`),
    );

    return { applicationId: updated.id, status: updated.status };
  }

  /**
   * Get the completion status for the current user's application.
   * Used by the dashboard to show the checklist and enable/disable the payment button.
   */
  async getCompletionStatus(email: string) {
    const application = await this.prisma.application.findFirst({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        type: true,
        status: true,
        assessmentSkipped: true,
        referencesSkipped: true,
        assessmentCompletedAt: true,
        referencesCompletedAt: true,
        matchingUnlocked: true,
        matchingUnlockedAt: true,
        feeAmountMinor: true,
        feeCurrency: true,
        paymentProvider: true,
      },
    });
    if (!application) throw new NotFoundException('No application found.');

    const isTalent = application.type === 'TALENT';
    const assessmentComplete = !isTalent || !!application.assessmentCompletedAt;
    const referencesComplete = !isTalent || !!application.referencesCompletedAt;
    const canPay = assessmentComplete && referencesComplete && !application.matchingUnlocked;

    return {
      ...application,
      assessmentComplete,
      referencesComplete,
      canPay,
    };
  }

  /**
   * Initiate the "unlock matching" payment.
   * Company → Razorpay order. Talent → Stripe checkout session.
   * Only allowed when all required steps are complete.
   */
  async initiateUnlockPayment(email: string) {
    const application = await this.prisma.application.findFirst({
      where: { email: email.toLowerCase() },
    });
    if (!application) throw new NotFoundException('No application found.');

    if (application.matchingUnlocked) {
      throw new BadRequestException('Matching is already unlocked.');
    }

    // For talent: check that assessment and references are complete
    if (application.type === 'TALENT') {
      if (!application.assessmentCompletedAt) {
        throw new BadRequestException('Please complete your assessment before unlocking matching.');
      }
      if (!application.referencesCompletedAt) {
        throw new BadRequestException('Please complete your references before unlocking matching.');
      }
    }

    const fee = this.getFeeMinor(application.type as ApplicationTypeDto);

    // ── Company → Razorpay order ──────────────────────────────────
    if (application.type === 'COMPANY') {
      // In dummy mode: auto-confirm
      if (this.isDummyMode()) {
        await this.unlockMatching(application.id);
        return {
          applicationId: application.id,
          provider: 'RAZORPAY',
          dummyMode: true,
          unlocked: true,
        };
      }

      const order = await this.razorpay.createOrder({
        amountPaisa: fee.amount,
        currency: fee.currency,
        receipt: `unlock_${application.id.slice(0, 30)}`,
        notes: { applicationId: application.id, purpose: 'unlock_matching' },
      });

      // Store order ID for verification
      await this.prisma.application.update({
        where: { id: application.id },
        data: { razorpayOrderId: order.id },
      });

      return {
        applicationId: application.id,
        provider: 'RAZORPAY',
        keyId: this.razorpay.publishableKeyId,
        orderId: order.id,
        amount: fee.amount,
        currency: fee.currency,
        prefill: { name: application.name, email: application.email },
        dummyMode: false,
      };
    }

    // ── Talent → Stripe ───────────────────────────────────────────
    if (this.isDummyMode()) {
      await this.unlockMatching(application.id);
      return {
        applicationId: application.id,
        provider: 'STRIPE',
        dummyMode: true,
        unlocked: true,
      };
    }

    // TODO: Create real Stripe Checkout session when Stripe is fully integrated
    const dummySessionId = `cs_unlock_${Date.now()}`;
    await this.prisma.application.update({
      where: { id: application.id },
      data: { stripeSessionId: dummySessionId },
    });

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3001');
    return {
      applicationId: application.id,
      provider: 'STRIPE',
      checkoutUrl: `${frontendUrl}/dashboard/unlock?session=${dummySessionId}`,
      amount: fee.amount,
      currency: fee.currency,
      dummyMode: false,
    };
  }

  /**
   * Verify Razorpay payment for unlock-matching flow.
   * Similar to verifyRazorpayPayment but calls unlockMatching instead of provisionAccount.
   */
  async verifyUnlockPayment(params: {
    applicationId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const application = await this.prisma.application.findUnique({
      where: { id: params.applicationId },
    });
    if (!application) throw new NotFoundException('Application not found.');

    if (application.matchingUnlocked) {
      return { success: true, applicationId: params.applicationId, unlocked: true };
    }

    const isValid = this.razorpay.verifyPaymentSignature({
      orderId: params.razorpayOrderId,
      paymentId: params.razorpayPaymentId,
      signature: params.razorpaySignature,
    });

    if (!isValid) {
      throw new BadRequestException('Payment verification failed — invalid signature.');
    }

    // Store payment ID
    await this.prisma.application.update({
      where: { id: params.applicationId },
      data: { razorpayPaymentId: params.razorpayPaymentId },
    });

    await this.unlockMatching(params.applicationId);

    return { success: true, applicationId: params.applicationId, unlocked: true };
  }

  /**
   * Mark matching as unlocked after payment is confirmed.
   * This is the "moment of truth" — reveals match data.
   */
  private async unlockMatching(applicationId: string): Promise<void> {
    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        matchingUnlocked: true,
        matchingUnlockedAt: new Date(),
        paidAt: new Date(),
      },
    });

    this.logger.log(`Matching unlocked for application ${applicationId}`);

    // For companies: trigger full AI diagnosis now
    if (updated.type === 'COMPANY') {
      this.aiWorkflow
        .generateDiagnosisForApplication(applicationId)
        .catch((err) => this.logger.error(`Failed to trigger diagnosis: ${err.message}`));
    }
  }
}
