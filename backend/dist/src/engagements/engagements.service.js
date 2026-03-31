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
var EngagementsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EngagementsService = EngagementsService_1 = class EngagementsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(EngagementsService_1.name);
    }
    async initializeEngagement(contractId) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { sow: true, paymentPlan: { include: { invoices: true } } },
        });
        if (!contract || contract.status !== 'FULLY_SIGNED') {
            throw new common_1.BadRequestException('Contract must be FULLY_SIGNED to start engagement.');
        }
        const hasInitialPayment = contract.paymentPlan?.invoices?.some(inv => inv.status === 'PAID');
        if (!hasInitialPayment) {
            this.logger.warn(`Engagement initialized for ${contractId} without initial payment. Assuming Deferred start.`);
        }
        const engagement = await this.prisma.engagement.create({
            data: {
                contractId,
                startupId: contract.sow.startupProfileId,
                operatorId: contract.sow.operatorId,
                status: 'ACTIVE',
                startDate: new Date(),
            },
        });
        await this.logActivity(engagement.id, 'SYSTEM', 'ENGAGEMENT_STARTED', 'Workspace initialized from signed contract.');
        this.logger.log(`Engagement workspace ${engagement.id} created.`);
        return engagement;
    }
    async getEngagement(id) {
        const eng = await this.prisma.engagement.findUnique({
            where: { id },
            include: {
                startup: { select: { industry: true } },
                contract: { select: { sow: { select: { title: true, deliverables: true, scope: true } } } },
            },
        });
        if (!eng)
            throw new common_1.NotFoundException('Engagement not found.');
        return eng;
    }
    async getWorkspaceData(engagementId) {
        const milestones = await this.prisma.engagementMilestone.findMany({
            where: { engagementId },
            orderBy: { dueDate: 'asc' },
        });
        const notes = await this.prisma.workspaceNote.findMany({
            where: { engagementId },
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { name: true, email: true } } },
        });
        const logs = await this.prisma.activityLog.findMany({
            where: { engagementId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: { actor: { select: { name: true, email: true } } },
        });
        return { milestones, notes, logs };
    }
    async findByStartup(startupId) {
        return this.prisma.engagement.findMany({
            where: { startupId },
            include: { contract: { select: { sow: { select: { title: true } } } } },
        });
    }
    async findByOperator(operatorId) {
        return this.prisma.engagement.findMany({
            where: { operatorId },
            include: { startup: { select: { industry: true } }, contract: { select: { sow: { select: { title: true } } } } },
        });
    }
    async updateStatus(id, dto, actorId) {
        const eng = await this.prisma.engagement.update({
            where: { id },
            data: {
                status: dto.status,
                ...(dto.status === 'COMPLETED' || dto.status === 'TERMINATED' ? { endDate: new Date() } : {})
            },
        });
        await this.logActivity(id, actorId, 'STATUS_CHANGED', `Engagement marked as ${dto.status}`);
        return eng;
    }
    async createMilestone(engagementId, dto, actorId) {
        const ms = await this.prisma.engagementMilestone.create({
            data: {
                engagementId,
                title: dto.title,
                description: dto.description,
                dueDate: new Date(dto.dueDate),
            },
        });
        await this.logActivity(engagementId, actorId, 'MILESTONE_ADDED', `Added milestone: ${dto.title}`);
        return ms;
    }
    async updateMilestone(milestoneId, dto, actorId) {
        const existing = await this.prisma.engagementMilestone.findUnique({ where: { id: milestoneId } });
        if (!existing)
            throw new common_1.NotFoundException('Milestone not found');
        const ms = await this.prisma.engagementMilestone.update({
            where: { id: milestoneId },
            data: {
                status: dto.status,
                evidenceUrl: dto.evidenceUrl,
                ...(dto.status === 'COMPLETED' ? { completedAt: new Date() } : {}),
            },
        });
        await this.logActivity(existing.engagementId, actorId, 'MILESTONE_UPDATED', `Updated milestone "${existing.title}": ${dto.status}`);
        return ms;
    }
    async addNote(engagementId, dto, authorId) {
        return this.prisma.workspaceNote.create({
            data: { engagementId, authorId, content: dto.content },
            include: { author: { select: { name: true, email: true } } }
        });
    }
    async logActivity(engagementId, actorId, actionType, description) {
        let actualActorId = actorId;
        if (actorId === 'SYSTEM') {
            const admin = await this.prisma.user.findFirst({
                where: { memberships: { some: { membershipRole: 'PLATFORM_ADMIN' } } },
            });
            actualActorId = admin ? admin.id : 'system_placeholder';
        }
        const actorExists = await this.prisma.user.findUnique({ where: { id: actualActorId } });
        if (!actorExists)
            return;
        await this.prisma.activityLog.create({
            data: { engagementId, actorId: actualActorId, actionType, description },
        });
    }
};
exports.EngagementsService = EngagementsService;
exports.EngagementsService = EngagementsService = EngagementsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EngagementsService);
//# sourceMappingURL=engagements.service.js.map