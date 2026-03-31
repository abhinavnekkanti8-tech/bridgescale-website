import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentPlanDto, IssueInvoiceDto } from './dto/payments.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

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
}
