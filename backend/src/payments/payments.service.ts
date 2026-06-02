import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePaymentPlanDto,
  CreatePayoutAttemptDto,
  GenerateLedgerDto,
  IssueInvoiceDto,
  UpdateLedgerReviewDto,
} from './dto/payments.dto';
import { PayoutProviderService } from './payout-provider.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly payoutProvider: PayoutProviderService,
  ) {}

  // ── Payment Plans ─────────────────────────────────────────────────────────

  async createPaymentPlan(dto: CreatePaymentPlanDto) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: dto.contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found.');

    const existing = await this.prisma.paymentPlan.findUnique({
      where: { contractId: dto.contractId },
    });
    if (existing) throw new BadRequestException('Contract already has a payment plan.');

    const plan = await this.prisma.paymentPlan.create({
      data: {
        contractId: dto.contractId,
        planType: dto.planType,
        totalAmountUsd: dto.totalAmountUsd,
      },
    });

    this.logger.log(`Payment plan created for contract ${dto.contractId}`);
    return plan;
  }

  async getPaymentPlanByContract(contractId: string) {
    return this.prisma.paymentPlan.findUnique({
      where: { contractId },
      include: { invoices: { orderBy: { dueDate: 'asc' } } },
    });
  }

  // ── Invoices ─────────────────────────────────────────────────────────────

  async issueInvoice(dto: IssueInvoiceDto) {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id: dto.paymentPlanId },
    });
    if (!plan) throw new NotFoundException('Payment plan not found.');

    // Simulated Stripe Integration
    const dummyStripeId = `in_${Date.now()}_mock`;
    const dummyStripeUrl = `https://pay.stripe.com/mock/${dummyStripeId}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        paymentPlanId: dto.paymentPlanId,
        amountUsd: dto.amountUsd,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
        status: 'ISSUED',
        issuedAt: new Date(),
        stripeId: dummyStripeId,
        stripeUrl: dummyStripeUrl,
      },
    });

    this.logger.log(`Invoice ${invoice.id} issued for ${dto.amountUsd} USD`);
    return invoice;
  }

  async getInvoice(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { events: { orderBy: { createdAt: 'desc' } } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found.');
    return invoice;
  }

  async getInvoicesByStartup(startupProfileId: string) {
    return this.prisma.invoice.findMany({
      where: { paymentPlan: { contract: { sow: { startupProfileId } } } },
      orderBy: { dueDate: 'asc' },
      include: { paymentPlan: { include: { contract: { include: { sow: true } } } } },
    });
  }

  async getAllInvoices() {
    return this.prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: { paymentPlan: { include: { contract: { include: { sow: true } } } } },
    });
  }

  // ── State Machine & Admin Actions ─────────────────────────────────────────

  async markInvoicePaid(id: string) {
    const invoice = await this.getInvoice(id);
    if (invoice.status === 'PAID') throw new BadRequestException('Invoice already paid.');

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'PAID', paidAt: new Date() },
    });

    // Mock payment event
    await this.prisma.paymentEvent.create({
      data: {
        invoiceId: id,
        stripeEventId: `evt_${Date.now()}_mock`,
        amountCaptured: invoice.amountUsd,
        status: 'SUCCEEDED',
      },
    });

    this.logger.log(`Invoice ${id} marked as PAID.`);
    return updated;
  }

  async markInvoiceOverdue(id: string) {
    const invoice = await this.getInvoice(id);
    if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot mark ${invoice.status} invoice as overdue.`);
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { status: 'OVERDUE' },
    });

    this.logger.log(`Invoice ${id} marked as OVERDUE. Consider pausing engagement.`);
    return updated;
  }

  // Idempotent webhook handler (mocked for MVP)
  async handleStripeWebhook(payload: any) {
    if (!payload || !payload.type || !payload.data?.object) return { received: true };

    const eventId = payload.id;
    const existingEvent = await this.prisma.paymentEvent.findUnique({
      where: { stripeEventId: eventId },
    });
    if (existingEvent) {
      this.logger.warn(`Webhook event ${eventId} already processed.`);
      return { received: true }; // Idempotent
    }

    if (payload.type === 'invoice.paid') {
      const stripeInvoiceId = payload.data.object.id;
      const invoice = await this.prisma.invoice.findUnique({
        where: { stripeId: stripeInvoiceId },
      });
      
      if (invoice && invoice.status !== 'PAID') {
        await this.prisma.$transaction([
          this.prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: 'PAID', paidAt: new Date() },
          }),
          this.prisma.paymentEvent.create({
            data: {
              invoiceId: invoice.id,
              stripeEventId: eventId,
              amountCaptured: payload.data.object.amount_paid / 100,
              status: 'SUCCEEDED',
            },
          }),
        ]);
        this.logger.log(`Webhook: Invoice ${invoice.id} marked as PAID.`);
      }
    }

    return { received: true };
  }

  async generateLedger(dto: GenerateLedgerDto) {
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { contractId: dto.contractId },
      include: {
        contract: { include: { sow: true } },
        invoices: true,
      },
    });
    if (!plan) throw new NotFoundException('Payment plan not found for contract.');

    const invoiceAmount = plan.invoices.reduce((sum, invoice) => sum + invoice.amountUsd, 0) || plan.totalAmountUsd;
    const platformFeeAmount = Math.round(invoiceAmount * 0.1);
    const eorFeeAmount = dto.eorFeeAmount ?? 0;
    const operatorPayoutAmount = Math.max(invoiceAmount - platformFeeAmount - eorFeeAmount, 0);
    const taxProfile = await this.prisma.operatorTaxProfile.findFirst({
      where: { operatorProfile: { operatorId: plan.contract.sow.operatorId } },
      orderBy: { createdAt: 'desc' },
    });
    const taxReady = taxProfile?.formStatus === 'VERIFIED';
    const compliance = await this.resolveComplianceForSow(plan.contract.sow);
    const payoutReady = taxReady && ['CONTRACTOR', 'CONTRACTOR_WITH_REVIEW'].includes(compliance.mode);

    return this.prisma.paymentLedger.upsert({
      where: { paymentPlanId: plan.id },
      update: {
        invoiceAmount,
        billingCurrency: plan.billingCurrency,
        platformFeeAmount,
        operatorPayoutAmount,
        eorFeeAmount,
        payoutCurrency: plan.payoutCurrency,
        fxRateAtSigning: plan.fxRateAtSigning,
        complianceMode: compliance.mode,
        taxReady,
        payoutReady,
      },
      create: {
        paymentPlanId: plan.id,
        contractId: dto.contractId,
        invoiceAmount,
        billingCurrency: plan.billingCurrency,
        platformFeeAmount,
        operatorPayoutAmount,
        eorFeeAmount,
        payoutCurrency: plan.payoutCurrency,
        fxRateAtSigning: plan.fxRateAtSigning,
        complianceMode: compliance.mode,
        taxReady,
        payoutReady,
      },
      include: { payoutAttempts: true },
    });
  }

  async getLedgerByContract(contractId: string) {
    const ledger = await this.prisma.paymentLedger.findFirst({
      where: { contractId },
      include: { payoutAttempts: { orderBy: { createdAt: 'desc' } } },
    });
    if (!ledger) throw new NotFoundException('Payment ledger not found for contract.');
    return ledger;
  }

  async updateLedgerReview(ledgerId: string, dto: UpdateLedgerReviewDto) {
    const ledger = await this.prisma.paymentLedger.findUnique({ where: { id: ledgerId } });
    if (!ledger) throw new NotFoundException('Payment ledger not found.');

    return this.prisma.paymentLedger.update({
      where: { id: ledgerId },
      data: {
        status: dto.status,
        reviewNotes: dto.reviewNotes,
        reviewedAt: new Date(),
      },
    });
  }

  async createPayoutAttempt(ledgerId: string, dto: CreatePayoutAttemptDto) {
    const ledger = await this.prisma.paymentLedger.findUnique({ where: { id: ledgerId } });
    if (!ledger) throw new NotFoundException('Payment ledger not found.');
    if (!ledger.payoutReady) {
      throw new BadRequestException('Ledger is not payout-ready. Resolve tax/compliance status first.');
    }

    const planned = this.payoutProvider.planPayout({
      provider: dto.provider,
      ledgerId,
      amount: ledger.operatorPayoutAmount,
      currency: ledger.payoutCurrency ?? ledger.billingCurrency,
    });

    return this.prisma.payoutAttempt.create({
      data: {
        ledgerId,
        provider: planned.provider,
        status: 'PLANNED',
        amount: planned.amount,
        currency: planned.currency,
        providerRef: planned.providerRef,
        dummyMode: planned.dummyMode,
        metadata: planned.metadata as Prisma.InputJsonValue,
      },
    });
  }

  private async resolveComplianceForSow(sow: {
    id: string;
    operatorId: string;
    engagementType: string | null;
    retainerFlavour: string | null;
    weeklyHours: number;
  }) {
    let mode: 'CONTRACTOR' | 'CONTRACTOR_WITH_REVIEW' | 'EOR_REQUIRED' | 'BLOCKED_PENDING_REVIEW' = 'CONTRACTOR';
    const reasons: string[] = [];

    if (sow.engagementType === 'RETAINER' && sow.weeklyHours >= 20) {
      mode = 'CONTRACTOR_WITH_REVIEW';
      reasons.push('Retainer with 20+ weekly hours should be reviewed before payout.');
    }

    if (sow.retainerFlavour === 'LEADERSHIP' && sow.weeklyHours >= 30) {
      mode = 'EOR_REQUIRED';
      reasons.push('Leadership retainer at 30+ weekly hours should be routed to EOR review.');
    }

    if (!sow.engagementType) {
      mode = 'BLOCKED_PENDING_REVIEW';
      reasons.push('Missing engagement type; cannot resolve compliance mode automatically.');
    }

    await this.prisma.complianceDecisionLog.create({
      data: {
        operatorProfileId: undefined,
        sowId: sow.id,
        mode,
        reason: reasons.join(' ') || 'Phase 3 placeholder resolver: contractor mode by default.',
        decidedBy: 'SYSTEM',
        metadata: {
          phase: 'PHASE_3_SKELETON',
          legalAdvice: false,
        },
      },
    });

    return { mode, reasons };
  }
}
