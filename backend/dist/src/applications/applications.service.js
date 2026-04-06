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
var ApplicationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const razorpay_service_1 = require("../payments/razorpay.service");
const ai_workflow_service_1 = require("../ai/ai-workflow.service");
const create_application_dto_1 = require("./dto/create-application.dto");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
let ApplicationsService = ApplicationsService_1 = class ApplicationsService {
    constructor(prisma, config, emailService, razorpay, aiWorkflow) {
        this.prisma = prisma;
        this.config = config;
        this.emailService = emailService;
        this.razorpay = razorpay;
        this.aiWorkflow = aiWorkflow;
        this.logger = new common_1.Logger(ApplicationsService_1.name);
    }
    getFeeMinor(type) {
        if (type === create_application_dto_1.ApplicationTypeDto.COMPANY) {
            return { amount: 1500000, currency: 'INR', provider: client_1.PaymentProvider.RAZORPAY };
        }
        return { amount: 5000, currency: 'USD', provider: client_1.PaymentProvider.STRIPE };
    }
    getFeeAmount(type) {
        return type === create_application_dto_1.ApplicationTypeDto.COMPANY ? 15000 : 50;
    }
    isDummyMode() {
        return this.config.get('DUMMY_PAYMENT_MODE', 'true') === 'true';
    }
    async createApplication(dto) {
        const fee = this.getFeeMinor(dto.type);
        const recentDuplicate = await this.prisma.application.findFirst({
            where: {
                email: dto.email.toLowerCase(),
                createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                status: { not: client_1.ApplicationStatus.REJECTED },
            },
        });
        if (recentDuplicate) {
            throw new common_1.BadRequestException('An application with this email was already submitted recently. Please check your inbox or try again later.');
        }
        const applicationData = {
            type: dto.type,
            name: dto.name,
            email: dto.email.toLowerCase(),
            notes: dto.notes,
            companyName: dto.companyName,
            companyWebsite: dto.companyWebsite,
            companyStage: dto.companyStage,
            needArea: dto.needArea,
            targetMarkets: dto.targetMarkets,
            engagementModel: dto.engagementModel,
            budgetRange: dto.budgetRange,
            urgency: dto.urgency,
            salesMotion: dto.salesMotion,
            teamStructure: dto.teamStructure,
            hasDeck: dto.hasDeck,
            hasDemo: dto.hasDemo,
            hasCrm: dto.hasCrm,
            previousAttempts: dto.previousAttempts,
            idealOutcome90d: dto.idealOutcome90d,
            specificTargets: dto.specificTargets,
            location: dto.location,
            talentCategory: dto.talentCategory,
            currentRole: dto.currentRole,
            currentEmployer: dto.currentEmployer,
            employmentStatus: dto.employmentStatus,
            yearsExperience: dto.yearsExperience,
            seniorityLevel: dto.seniorityLevel,
            seniority: dto.seniority,
            engagementPref: dto.engagementPref,
            markets: dto.markets,
            dealHistory: dto.dealHistory ? dto.dealHistory : undefined,
            confidenceMarkets: dto.confidenceMarkets ? dto.confidenceMarkets : undefined,
            languagesSpoken: dto.languagesSpoken ?? [],
            linkedInUrl: dto.linkedInUrl,
            references: dto.references ? dto.references : undefined,
            caseStudyResponse: dto.caseStudyResponse,
            availabilityHours: dto.availabilityHours,
            earliestStart: dto.earliestStart ? new Date(dto.earliestStart) : undefined,
            rateExpectationMin: dto.rateExpectationMin,
            rateExpectationMax: dto.rateExpectationMax,
            rateCurrency: dto.rateCurrency ?? 'USD',
            preferredStructures: dto.preferredStructures ?? [],
            paymentProvider: fee.provider,
            feeAmountMinor: fee.amount,
            feeCurrency: fee.currency,
            feeAmountUsd: this.getFeeAmount(dto.type),
        };
        const application = await this.prisma.application.create({
            data: { ...applicationData, status: client_1.ApplicationStatus.PENDING_PAYMENT },
        });
        this.logger.log(`Application ${application.id} created (PENDING_PAYMENT) for ${dto.email}`);
        if (dto.type === create_application_dto_1.ApplicationTypeDto.COMPANY) {
            const order = await this.razorpay.createOrder({
                amountPaisa: fee.amount,
                currency: fee.currency,
                receipt: application.id.slice(0, 40),
                notes: { applicationId: application.id, applicantEmail: dto.email },
            });
            await this.prisma.application.update({
                where: { id: application.id },
                data: { stripeSessionId: order.id },
            });
            return {
                applicationId: application.id,
                status: client_1.ApplicationStatus.PENDING_PAYMENT,
                provider: 'RAZORPAY',
                keyId: this.razorpay.publishableKeyId,
                orderId: order.id,
                amount: fee.amount,
                currency: fee.currency,
                prefill: { name: dto.name, email: dto.email.toLowerCase() },
                dummyMode: this.isDummyMode(),
            };
        }
        const dummySessionId = `cs_test_dummy_${Date.now()}`;
        const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3001');
        await this.prisma.application.update({
            where: { id: application.id },
            data: { stripeSessionId: dummySessionId },
        });
        if (this.isDummyMode()) {
            await this.prisma.application.update({
                where: { id: application.id },
                data: {
                    status: client_1.ApplicationStatus.SUBMITTED,
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
                status: client_1.ApplicationStatus.SUBMITTED,
                provider: 'STRIPE',
                checkoutUrl: null,
                dummyMode: true,
            };
        }
        return {
            applicationId: application.id,
            status: client_1.ApplicationStatus.PENDING_PAYMENT,
            provider: 'STRIPE',
            checkoutUrl: `${frontendUrl}/for-talent/apply/pay?session=${dummySessionId}`,
            amount: fee.amount,
            currency: fee.currency,
            dummyMode: false,
        };
    }
    async verifyRazorpayPayment(params) {
        const application = await this.prisma.application.findUnique({
            where: { id: params.applicationId },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found.');
        if (application.status !== client_1.ApplicationStatus.PENDING_PAYMENT) {
            return { success: true, applicationId: params.applicationId, status: application.status };
        }
        const isValid = this.razorpay.verifyPaymentSignature({
            orderId: params.razorpayOrderId,
            paymentId: params.razorpayPaymentId,
            signature: params.razorpaySignature,
        });
        if (!isValid) {
            throw new common_1.BadRequestException('Payment verification failed — invalid signature.');
        }
        const updated = await this.prisma.application.update({
            where: { id: params.applicationId },
            data: {
                status: client_1.ApplicationStatus.SUBMITTED,
                stripePaymentId: params.razorpayPaymentId,
                paidAt: new Date(),
            },
        });
        this.logger.log(`Application ${params.applicationId} Razorpay verified — status → SUBMITTED`);
        this.emailService
            .sendApplicationReceived({ id: updated.id, name: updated.name, email: updated.email, type: updated.type })
            .catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));
        this.provisionAccount({
            id: updated.id,
            name: updated.name,
            email: updated.email,
            type: updated.type,
            companyName: updated.companyName,
        });
        this.aiWorkflow
            .generateDiagnosisForApplication(updated.id)
            .catch((err) => this.logger.error(`Failed to trigger diagnosis: ${err.message}`));
        return { success: true, applicationId: updated.id, status: updated.status };
    }
    async dummyConfirmPayment(applicationId) {
        if (!this.isDummyMode()) {
            throw new common_1.BadRequestException('Dummy confirm is disabled in production.');
        }
        const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
        if (!application)
            throw new common_1.NotFoundException('Application not found.');
        if (application.status !== client_1.ApplicationStatus.PENDING_PAYMENT) {
            return { success: true, applicationId, status: application.status };
        }
        const updated = await this.prisma.application.update({
            where: { id: applicationId },
            data: {
                status: client_1.ApplicationStatus.SUBMITTED,
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
            companyName: updated.companyName,
        });
        this.aiWorkflow
            .generateDiagnosisForApplication(updated.id)
            .catch((err) => this.logger.error(`Failed to trigger diagnosis: ${err.message}`));
        return { success: true, applicationId: updated.id, status: updated.status };
    }
    async handleRazorpayWebhook(rawBody, signature, payload) {
        if (!this.razorpay.verifyWebhookSignature(rawBody, signature)) {
            throw new common_1.BadRequestException('Invalid Razorpay webhook signature.');
        }
        if (payload.event !== 'payment.captured')
            return { received: true };
        const paymentEntity = payload.payload?.payment?.entity;
        if (!paymentEntity?.order_id)
            return { received: true };
        const application = await this.prisma.application.findFirst({
            where: { stripeSessionId: paymentEntity.order_id },
        });
        if (!application || application.status !== client_1.ApplicationStatus.PENDING_PAYMENT) {
            return { received: true };
        }
        await this.prisma.application.update({
            where: { id: application.id },
            data: {
                status: client_1.ApplicationStatus.SUBMITTED,
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
            companyName: application.companyName,
        });
        this.aiWorkflow
            .generateDiagnosisForApplication(application.id)
            .catch((err) => this.logger.error(`Failed to trigger diagnosis: ${err.message}`));
        return { received: true, applicationId: application.id };
    }
    async handleCheckoutCompleted(stripeSessionId, paymentIntentId) {
        const application = await this.prisma.application.findUnique({ where: { stripeSessionId } });
        if (!application) {
            this.logger.warn(`No application for Stripe session ${stripeSessionId}`);
            return { received: true };
        }
        if (application.status !== client_1.ApplicationStatus.PENDING_PAYMENT)
            return { received: true };
        await this.prisma.application.update({
            where: { id: application.id },
            data: { status: client_1.ApplicationStatus.SUBMITTED, stripePaymentId: paymentIntentId, paidAt: new Date() },
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
            companyName: application.companyName,
        });
        this.aiWorkflow
            .generateDiagnosisForApplication(application.id)
            .catch((err) => this.logger.error(`Failed to trigger diagnosis: ${err.message}`));
        return { received: true, applicationId: application.id };
    }
    async provisionAccount(application) {
        try {
            const existing = await this.prisma.user.findUnique({
                where: { email: application.email },
            });
            if (existing) {
                await this.issueAndSendMagicLink(existing.id, application.name, application.email);
                return;
            }
            const isCompany = application.type === 'COMPANY';
            const orgType = isCompany ? client_1.OrgType.STARTUP : client_1.OrgType.OPERATOR_ENTITY;
            const orgName = isCompany
                ? (application.companyName ?? `${application.name}'s Company`)
                : `${application.name} (Operator)`;
            const membershipRole = isCompany
                ? client_1.MembershipRole.STARTUP_ADMIN
                : client_1.MembershipRole.OPERATOR;
            await this.prisma.$transaction(async (tx) => {
                const org = await tx.organization.create({
                    data: { name: orgName, orgType, country: isCompany ? 'IN' : undefined },
                });
                const user = await tx.user.create({
                    data: {
                        name: application.name,
                        email: application.email,
                        status: client_1.UserStatus.PENDING_APPROVAL,
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
        }
        catch (err) {
            this.logger.error(`Failed to provision account for ${application.email}: ${err.message}`);
        }
    }
    async issueAndSendMagicLink(userId, name, email) {
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiry = new Date(Date.now() + 30 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: userId },
            data: { magicLinkToken: token, magicLinkExpiry: expiry },
        });
        const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3001');
        const magicUrl = `${frontendUrl}/auth/magic?token=${token}`;
        this.emailService
            .sendMagicLink({ name, email, magicUrl, expiryMinutes: 30 })
            .catch((err) => this.logger.error(`Failed to send magic link to ${email}: ${err.message}`));
    }
    async getApplicationStatus(id) {
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
        if (!application)
            throw new common_1.NotFoundException('Application not found.');
        return application;
    }
    async listApplications(status) {
        return this.prisma.application.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateApplicationStatus(id, status) {
        const application = await this.prisma.application.findUnique({ where: { id } });
        if (!application)
            throw new common_1.NotFoundException('Application not found.');
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
    async attachCv(applicationId, fileName, fileUrl) {
        const application = await this.prisma.application.findUnique({ where: { id: applicationId } });
        if (!application)
            throw new common_1.NotFoundException('Application not found.');
        const updated = await this.prisma.application.update({
            where: { id: applicationId },
            data: { cvFileName: fileName, cvFileUrl: fileUrl },
        });
        this.logger.log(`CV attached to application ${applicationId}: ${fileName}`);
        return { applicationId: updated.id, cvFileName: updated.cvFileName, cvFileUrl: updated.cvFileUrl };
    }
    async getMyApplication(email) {
        const application = await this.prisma.application.findFirst({
            where: { email: email.toLowerCase() },
            include: {
                needDiagnosis: true,
                opportunityBrief: true,
                talentPreScreen: true,
            },
        });
        if (!application)
            throw new common_1.NotFoundException('No application found for this email.');
        return application;
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = ApplicationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        email_service_1.EmailService,
        razorpay_service_1.RazorpayService,
        ai_workflow_service_1.AiWorkflowService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map