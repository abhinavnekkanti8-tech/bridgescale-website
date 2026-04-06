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
var InterviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const email_service_1 = require("../email/email.service");
const client_1 = require("@prisma/client");
let InterviewsService = InterviewsService_1 = class InterviewsService {
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.logger = new common_1.Logger(InterviewsService_1.name);
    }
    async scheduleInterview(params) {
        const company = await this.prisma.application.findUnique({
            where: { id: params.companyApplicationId },
        });
        const talent = await this.prisma.application.findUnique({
            where: { id: params.talentApplicationId },
        });
        if (!company)
            throw new common_1.NotFoundException('Company application not found.');
        if (!talent)
            throw new common_1.NotFoundException('Talent application not found.');
        if (company.type !== 'COMPANY') {
            throw new common_1.BadRequestException('First application must be a company.');
        }
        if (talent.type !== 'TALENT') {
            throw new common_1.BadRequestException('Second application must be talent.');
        }
        if (new Date(params.scheduledAt) <= new Date()) {
            throw new common_1.BadRequestException('Interview must be scheduled for a future date.');
        }
        const companyUpdated = await this.prisma.application.update({
            where: { id: params.companyApplicationId },
            data: {
                status: client_1.ApplicationStatus.INTERVIEW_SCHEDULED,
                notes: params.notes ? `${company.notes || ''}\n\nInterview scheduled for ${params.scheduledAt}` : undefined,
            },
        });
        const talentUpdated = await this.prisma.application.update({
            where: { id: params.talentApplicationId },
            data: {
                status: client_1.ApplicationStatus.INTERVIEW_SCHEDULED,
            },
        });
        this.logger.log(`Interview scheduled: ${company.name} (company) with ${talent.name} (talent) at ${params.scheduledAt}`);
        this.sendInterviewNotifications(company, talent, params);
        return {
            id: `interview_${company.id}_${talent.id}`,
            companyApplication: companyUpdated,
            talentApplication: talentUpdated,
            scheduledAt: params.scheduledAt,
            meetingLink: params.meetingLink,
        };
    }
    async getInterview(companyApplicationId, talentApplicationId) {
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
            company,
            talent,
            status: company.status === client_1.ApplicationStatus.INTERVIEW_SCHEDULED ? 'SCHEDULED' : 'NOT_SCHEDULED',
        };
    }
    async completeInterview(companyApplicationId, talentApplicationId, params) {
        const company = await this.prisma.application.findUnique({
            where: { id: companyApplicationId },
        });
        const talent = await this.prisma.application.findUnique({
            where: { id: talentApplicationId },
        });
        if (!company || !talent) {
            throw new common_1.NotFoundException('One or both applications not found.');
        }
        const newStatus = params.decision === 'APPROVED' ? client_1.ApplicationStatus.APPROVED : client_1.ApplicationStatus.REJECTED;
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
        this.sendInterviewOutcomeNotifications(company, talent, params);
        return {
            company: companyUpdated,
            talent: talentUpdated,
            decision: params.decision,
            feedback: params.feedback,
        };
    }
    async getUpcomingInterviews(limit = 20) {
        const interviews = await this.prisma.application.findMany({
            where: { status: client_1.ApplicationStatus.INTERVIEW_SCHEDULED },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
        return interviews;
    }
    sendInterviewNotifications(company, talent, params) {
        const formattedDate = new Date(params.scheduledAt).toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        this.logger.log(`Interview notification: ${company.name} and ${talent.name} scheduled for ${formattedDate}${params.meetingLink ? ` (${params.meetingLink})` : ''}`);
    }
    sendInterviewOutcomeNotifications(company, talent, params) {
        const status = params.decision === 'APPROVED' ? 'approved' : 'not approved';
        this.logger.log(`Interview outcome: ${company.name} and ${talent.name} - ${status}${params.feedback ? ` (${params.feedback})` : ''}`);
    }
};
exports.InterviewsService = InterviewsService;
exports.InterviewsService = InterviewsService = InterviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], InterviewsService);
//# sourceMappingURL=interviews.service.js.map