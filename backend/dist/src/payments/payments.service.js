"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    async createPaymentPlan(dto) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: dto.contractId },
        });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found.');
        const existing = await this.prisma.paymentPlan.findUnique({
            where: { contractId: dto.contractId },
        });
        if (existing)
            throw new common_1.BadRequestException('Contract already has a payment plan.');
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
    async getPaymentPlanByContract(contractId) {
        return this.prisma.paymentPlan.findUnique({
            where: { contractId },
            include: { invoices: { orderBy: { dueDate: 'asc' } } },
        });
    }
    async issueInvoice(dto) {
        const plan = await this.prisma.paymentPlan.findUnique({
            where: { id: dto.paymentPlanId },
        });
        if (!plan)
            throw new common_1.NotFoundException('Payment plan not found.');
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
    async getInvoice(id) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { events: { orderBy: { createdAt: 'desc' } } },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found.');
        return invoice;
    }
    async getInvoicesByStartup(startupProfileId) {
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
    async markInvoicePaid(id) {
        const invoice = await this.getInvoice(id);
        if (invoice.status === 'PAID')
            throw new common_1.BadRequestException('Invoice already paid.');
        const updated = await this.prisma.invoice.update({
            where: { id },
            data: { status: 'PAID', paidAt: new Date() },
        });
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
    async markInvoiceOverdue(id) {
        const invoice = await this.getInvoice(id);
        if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
            throw new common_1.BadRequestException(`Cannot mark ${invoice.status} invoice as overdue.`);
        }
        const updated = await this.prisma.invoice.update({
            where: { id },
            data: { status: 'OVERDUE' },
        });
        this.logger.log(`Invoice ${id} marked as OVERDUE. Consider pausing engagement.`);
        return updated;
    }
    async handleStripeWebhook(payload) {
        if (!payload || !payload.type || !payload.data?.object)
            return { received: true };
        const eventId = payload.id;
        const existingEvent = await this.prisma.paymentEvent.findUnique({
            where: { stripeEventId: eventId },
        });
        if (existingEvent) {
            this.logger.warn(`Webhook event ${eventId} already processed.`);
            return { received: true };
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map