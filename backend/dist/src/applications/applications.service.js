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
const create_application_dto_1 = require("./dto/create-application.dto");
const client_1 = require("@prisma/client");
let ApplicationsService = ApplicationsService_1 = class ApplicationsService {
    constructor(prisma, config, emailService) {
        this.prisma = prisma;
        this.config = config;
        this.emailService = emailService;
        this.logger = new common_1.Logger(ApplicationsService_1.name);
    }
    getFeeAmount(type) {
        return type === create_application_dto_1.ApplicationTypeDto.COMPANY ? 200 : 50;
    }
    isDummyMode() {
        return this.config.get('DUMMY_PAYMENT_MODE', 'true') === 'true';
    }
    async createApplication(dto) {
        const feeAmount = this.getFeeAmount(dto.type);
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
            companyStage: dto.companyStage,
            needArea: dto.needArea,
            targetMarkets: dto.targetMarkets,
            engagementModel: dto.engagementModel,
            budgetRange: dto.budgetRange,
            urgency: dto.urgency,
            location: dto.location,
            talentCategory: dto.talentCategory,
            seniority: dto.seniority,
            engagementPref: dto.engagementPref,
            markets: dto.markets,
            linkedInUrl: dto.linkedInUrl,
            references: dto.references ? dto.references : undefined,
            feeAmountUsd: feeAmount,
        };
        if (this.isDummyMode()) {
            const application = await this.prisma.application.create({
                data: {
                    ...applicationData,
                    status: client_1.ApplicationStatus.SUBMITTED,
                    paidAt: new Date(),
                    stripeSessionId: `dummy_sess_${Date.now()}`,
                    stripePaymentId: `dummy_pi_${Date.now()}`,
                },
            });
            this.logger.log(`[DUMMY MODE] Application ${application.id} created and auto-submitted for ${dto.email}`);
            this.emailService
                .sendApplicationReceived({
                id: application.id,
                name: application.name,
                email: application.email,
                type: application.type,
            })
                .catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));
            return {
                applicationId: application.id,
                status: application.status,
                checkoutUrl: null,
                dummyMode: true,
            };
        }
        const application = await this.prisma.application.create({
            data: {
                ...applicationData,
                status: client_1.ApplicationStatus.PENDING_PAYMENT,
            },
        });
        const updated = await this.prisma.application.update({
            where: { id: application.id },
            data: {
                status: client_1.ApplicationStatus.SUBMITTED,
                paidAt: new Date(),
                stripeSessionId: `placeholder_sess_${Date.now()}`,
            },
        });
        this.logger.log(`Application ${application.id} created for ${dto.email} (Stripe not configured — auto-submitted)`);
        this.emailService
            .sendApplicationReceived({
            id: updated.id,
            name: updated.name,
            email: updated.email,
            type: updated.type,
        })
            .catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));
        return {
            applicationId: updated.id,
            status: updated.status,
            checkoutUrl: null,
            dummyMode: true,
        };
    }
    async handleCheckoutCompleted(stripeSessionId, paymentIntentId) {
        const application = await this.prisma.application.findUnique({
            where: { stripeSessionId },
        });
        if (!application) {
            this.logger.warn(`No application found for Stripe session ${stripeSessionId}`);
            return { received: true };
        }
        if (application.status !== client_1.ApplicationStatus.PENDING_PAYMENT) {
            this.logger.warn(`Application ${application.id} already processed (status: ${application.status})`);
            return { received: true };
        }
        await this.prisma.application.update({
            where: { id: application.id },
            data: {
                status: client_1.ApplicationStatus.SUBMITTED,
                stripePaymentId: paymentIntentId,
                paidAt: new Date(),
            },
        });
        this.logger.log(`Application ${application.id} payment confirmed — status → SUBMITTED`);
        this.emailService
            .sendApplicationReceived({
            id: application.id,
            name: application.name,
            email: application.email,
            type: application.type,
        })
            .catch((err) => this.logger.error(`Failed to send confirmation email: ${err.message}`));
        return { received: true, applicationId: application.id };
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
                createdAt: true,
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
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found.');
        const updated = await this.prisma.application.update({
            where: { id: applicationId },
            data: { cvFileName: fileName, cvFileUrl: fileUrl },
        });
        this.logger.log(`CV attached to application ${applicationId}: ${fileName}`);
        return { applicationId: updated.id, cvFileName: updated.cvFileName, cvFileUrl: updated.cvFileUrl };
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = ApplicationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        email_service_1.EmailService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map