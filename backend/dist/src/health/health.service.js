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
var HealthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let HealthService = HealthService_1 = class HealthService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.logger = new common_1.Logger(HealthService_1.name);
    }
    async recalculateHealth(engagementId) {
        const engagement = await this.prisma.engagement.findUnique({
            where: { id: engagementId },
            include: {
                milestones: true,
                notes: true,
                contract: { include: { paymentPlan: { include: { invoices: true } } } },
            },
        });
        if (!engagement)
            throw new common_1.NotFoundException('Engagement not found');
        let score = 100;
        const now = new Date();
        const hasOverdueInvoice = engagement.contract?.paymentPlan?.invoices?.some((inv) => inv.status === 'OVERDUE');
        if (hasOverdueInvoice)
            score -= 20;
        const overdueMilestones = engagement.milestones.filter((ms) => ms.status !== 'COMPLETED' && ms.dueDate < now);
        score -= overdueMilestones.length * 10;
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentNotes = engagement.notes.filter((n) => n.createdAt > sevenDaysAgo);
        if (recentNotes.length === 0)
            score -= 15;
        score = Math.max(0, score);
        let aiCommentary = 'The engagement is operating smoothly.';
        let action = 'No action required.';
        if (score < 80) {
            if (hasOverdueInvoice) {
                aiCommentary = 'Payment is currently overdue, which is creating friction.';
                action = 'Prompt startup to pay overdue invoice urgently.';
            }
            else if (overdueMilestones.length > 0) {
                aiCommentary = 'Delivery is falling behind expected pace.';
                action = 'Operator needs to review overdue milestones.';
            }
            else {
                aiCommentary = 'Communication velocity is low.';
                action = 'Encourage a quick check-in note on the workspace.';
            }
        }
        const snapshot = await this.prisma.healthScoreSnapshot.create({
            data: {
                engagementId,
                scoreTotal: score,
                components: {
                    overdueInvoices: hasOverdueInvoice ? 1 : 0,
                    overdueMilestones: overdueMilestones.length,
                    recentNotes: recentNotes.length,
                },
                aiCommentary,
                suggestedAction: action,
            },
        });
        await this.prisma.engagement.update({
            where: { id: engagementId },
            data: { healthScore: score },
        });
        this.logger.log(`Recalculated health for ${engagementId}: Score ${score}`);
        return snapshot;
    }
    async getLatestSnapshot(engagementId) {
        return this.prisma.healthScoreSnapshot.findFirst({
            where: { engagementId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getAllSnapshots(engagementId) {
        return this.prisma.healthScoreSnapshot.findMany({
            where: { engagementId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
    }
    async createNudge(engagementId, dto) {
        return this.prisma.systemNudge.create({
            data: {
                engagementId,
                targetUserId: dto.targetUserId,
                nudgeType: dto.nudgeType,
                message: dto.message,
            },
            include: { targetUser: { select: { email: true } } },
        });
    }
    async getMyNudges(userId) {
        return this.prisma.systemNudge.findMany({
            where: { targetUserId: userId, isRead: false },
            orderBy: { createdAt: 'desc' },
            include: { engagement: { select: { contract: { select: { sow: { select: { title: true } } } } } } },
        });
    }
    async markNudgeRead(nudgeId) {
        return this.prisma.systemNudge.update({
            where: { id: nudgeId },
            data: { isRead: true },
        });
    }
    async getOpenEscalations() {
        return this.prisma.escalationCase.findMany({
            where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
            orderBy: { createdAt: 'desc' },
            include: { reporter: { select: { name: true, email: true } }, engagement: { select: { id: true, status: true } } },
        });
    }
    async createEscalation(reporterId, dto) {
        const esc = await this.prisma.escalationCase.create({
            data: {
                engagementId: dto.engagementId,
                reporterId,
                reason: dto.reason,
            },
        });
        this.logger.warn(`Escalation raised on ${dto.engagementId} by ${reporterId}`);
        return esc;
    }
    async updateEscalationStatus(id, dto) {
        return this.prisma.escalationCase.update({
            where: { id },
            data: {
                status: dto.status,
                resolutionNotes: dto.resolutionNotes,
            },
        });
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = HealthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, ai_service_1.AiService])
], HealthService);
//# sourceMappingURL=health.service.js.map