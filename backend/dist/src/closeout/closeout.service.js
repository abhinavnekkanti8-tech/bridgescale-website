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
var CloseoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseoutService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let CloseoutService = CloseoutService_1 = class CloseoutService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.logger = new common_1.Logger(CloseoutService_1.name);
    }
    async generateReport(engagementId) {
        const engagement = await this.prisma.engagement.findUnique({
            where: { id: engagementId },
            include: { milestones: true, logs: true, contract: { include: { sow: true } } },
        });
        if (!engagement)
            throw new common_1.NotFoundException('Engagement not found');
        const completedMilestones = engagement.milestones.filter(m => m.status === 'COMPLETED').length;
        const totalMilestones = engagement.milestones.length;
        const summary = `Engagement for ${engagement.contract?.sow.title} has concluded. Completed ${completedMilestones} of ${totalMilestones} milestones.`;
        const outcomes = 'Successfully modernized the sales pipeline and established a strong GTM foundation within the EU market.';
        const nextSteps = 'Recommend transitioning to a retained advisory role or spinning up a follow-on sprint for US expansion.';
        const report = await this.prisma.closeoutReport.upsert({
            where: { engagementId },
            update: { summary, outcomes, nextSteps, status: 'DRAFT', generatedByAi: true },
            create: { engagementId, summary, outcomes, nextSteps, status: 'DRAFT', generatedByAi: true },
        });
        return report;
    }
    async getReport(engagementId) {
        return this.prisma.closeoutReport.findUnique({ where: { engagementId } });
    }
    async updateReport(engagementId, dto) {
        return this.prisma.closeoutReport.update({
            where: { engagementId },
            data: dto,
        });
    }
    async submitRating(engagementId, reviewerId, dto) {
        return this.prisma.engagementRating.create({
            data: {
                engagementId,
                reviewerId,
                revieweeId: dto.revieweeId,
                score: dto.score,
                comments: dto.comments,
                components: dto.components || {},
            },
        });
    }
    async getEngagementRatings(engagementId) {
        return this.prisma.engagementRating.findMany({
            where: { engagementId },
            include: {
                reviewer: { select: { name: true, email: true } },
                reviewee: { select: { name: true, email: true } },
            },
        });
    }
    async generateRenewalRecommendation(engagementId) {
        const engagement = await this.prisma.engagement.findUnique({
            where: { id: engagementId },
            include: {
                contract: { include: { sow: true } },
                healthSnapshots: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
        });
        if (!engagement)
            throw new common_1.NotFoundException('Engagement not found');
        const health = engagement.healthSnapshots[0]?.scoreTotal || 100;
        let recommendedType = 'NONE';
        let reasoning = 'No clear signal for renewal based on engagement metrics.';
        if (health >= 85) {
            recommendedType = 'RETAINER_CONVERSION';
            reasoning = 'Highly successful engagement with strong health scores. Recommend converting to long-term retained advisory.';
        }
        else if (health >= 70) {
            recommendedType = 'FOLLOW_ON_SPRINT';
            reasoning = 'Good progress made. A targeted follow-on sprint is recommended to finalize outstanding operational goals.';
        }
        return this.prisma.renewalRecommendation.upsert({
            where: { engagementId },
            update: { recommendedType, reasoning },
            create: { engagementId, recommendedType, reasoning },
        });
    }
    async getRenewalRecommendation(engagementId) {
        return this.prisma.renewalRecommendation.findUnique({ where: { engagementId } });
    }
};
exports.CloseoutService = CloseoutService;
exports.CloseoutService = CloseoutService = CloseoutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, ai_service_1.AiService])
], CloseoutService);
//# sourceMappingURL=closeout.service.js.map