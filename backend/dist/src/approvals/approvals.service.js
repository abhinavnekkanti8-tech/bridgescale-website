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
var ApprovalsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const client_1 = require("@prisma/client");
let ApprovalsService = ApprovalsService_1 = class ApprovalsService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.logger = new common_1.Logger(ApprovalsService_1.name);
    }
    async approvePair(params) {
        const company = await this.prisma.application.findUnique({
            where: { id: params.companyApplicationId },
        });
        const talent = await this.prisma.application.findUnique({
            where: { id: params.talentApplicationId },
        });
        if (!company || !talent) {
            throw new common_1.NotFoundException('One or both applications not found.');
        }
        if (company.type !== 'COMPANY' || talent.type !== 'TALENT') {
            throw new common_1.BadRequestException('Invalid application types for approval.');
        }
        const companyUpdated = await this.prisma.application.update({
            where: { id: params.companyApplicationId },
            data: { status: client_1.ApplicationStatus.APPROVED },
        });
        const talentUpdated = await this.prisma.application.update({
            where: { id: params.talentApplicationId },
            data: { status: client_1.ApplicationStatus.APPROVED },
        });
        this.logger.log(`Pair approved: ${company.name} with ${talent.name}`);
        this.sendApprovalNotifications(company, talent, params.engagementType);
        return {
            company: companyUpdated,
            talent: talentUpdated,
        };
    }
    async rejectPair(params) {
        const company = await this.prisma.application.findUnique({
            where: { id: params.companyApplicationId },
        });
        const talent = await this.prisma.application.findUnique({
            where: { id: params.talentApplicationId },
        });
        if (!company || !talent) {
            throw new common_1.NotFoundException('One or both applications not found.');
        }
        const companyUpdated = await this.prisma.application.update({
            where: { id: params.companyApplicationId },
            data: { status: client_1.ApplicationStatus.REJECTED },
        });
        const talentUpdated = await this.prisma.application.update({
            where: { id: params.talentApplicationId },
            data: { status: client_1.ApplicationStatus.REJECTED },
        });
        this.logger.log(`Pair rejected: ${company.name} with ${talent.name}${params.reason ? ` (${params.reason})` : ''}`);
        this.sendRejectionNotifications(company, talent, params.reason);
        return {
            company: companyUpdated,
            talent: talentUpdated,
            reason: params.reason,
        };
    }
    async getPairStatus(companyApplicationId, talentApplicationId) {
        const company = await this.prisma.application.findUnique({
            where: { id: companyApplicationId },
        });
        const talent = await this.prisma.application.findUnique({
            where: { id: talentApplicationId },
        });
        if (!company || !talent) {
            throw new common_1.NotFoundException('One or both applications not found.');
        }
        return {
            company: { id: company.id, status: company.status },
            talent: { id: talent.id, status: talent.status },
            isPaired: company.status === client_1.ApplicationStatus.APPROVED && talent.status === client_1.ApplicationStatus.APPROVED,
        };
    }
    async getApprovedPairs() {
        const approvedApplications = await this.prisma.application.findMany({
            where: { status: client_1.ApplicationStatus.APPROVED },
            orderBy: { createdAt: 'desc' },
        });
        return approvedApplications;
    }
    sendApprovalNotifications(company, talent, engagementType) {
        this.logger.log(`Approval notifications: ${company.name} and ${talent.name} for ${engagementType} engagement`);
    }
    sendRejectionNotifications(company, talent, reason) {
        this.logger.log(`Rejection notifications: ${company.name} and ${talent.name}${reason ? ` (${reason})` : ''}`);
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = ApprovalsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map