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
var StartupsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
const client_1 = require("@prisma/client");
let StartupsService = StartupsService_1 = class StartupsService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.logger = new common_1.Logger(StartupsService_1.name);
    }
    async create(orgId, dto) {
        const existing = await this.prisma.startupProfile.findUnique({ where: { startupId: orgId } });
        if (existing) {
            return this.update(existing.id, orgId, dto);
        }
        return this.prisma.startupProfile.create({
            data: {
                startupId: orgId,
                industry: dto.industry,
                stage: dto.stage,
                targetMarkets: dto.targetMarkets,
                salesMotion: dto.salesMotion,
                budgetBand: dto.budgetBand,
                executionOwner: dto.executionOwner,
                hasProductDemo: dto.hasProductDemo ?? false,
                hasDeck: dto.hasDeck ?? false,
                toolingReady: dto.toolingReady ?? false,
                responsivenessCommit: dto.responsivenessCommit ?? false,
                additionalContext: dto.additionalContext,
                status: 'SUBMITTED',
            },
        });
    }
    async update(profileId, orgId, dto) {
        const profile = await this.findOne(profileId);
        if (profile.startupId !== orgId) {
            throw new common_1.ForbiddenException('You do not own this profile.');
        }
        return this.prisma.startupProfile.update({
            where: { id: profileId },
            data: { ...dto },
        });
    }
    async findOne(profileId) {
        const profile = await this.prisma.startupProfile.findUnique({
            where: { id: profileId },
            include: { scores: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
        if (!profile)
            throw new common_1.NotFoundException('Startup profile not found.');
        return profile;
    }
    async findByOrgId(orgId) {
        return this.prisma.startupProfile.findUnique({
            where: { startupId: orgId },
            include: { scores: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
    }
    async findAll() {
        return this.prisma.startupProfile.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                startup: { select: { id: true, name: true, country: true } },
                scores: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
        });
    }
    async getScores(profileId) {
        return this.prisma.demandReadinessScore.findMany({
            where: { profileId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async requestScore(profileId) {
        const profile = await this.findOne(profileId);
        this.runScoringJob(profile).catch((err) => {
            this.logger.error(`Scoring job failed for profile ${profileId}:`, err);
        });
        return { status: 'scoring_queued', profileId };
    }
    async runScoringJob(profile) {
        this.logger.log(`Starting readiness scoring for profile ${profile.id}`);
        const scoreOutput = await this.aiService.scoreStartupReadiness(profile);
        await this.prisma.demandReadinessScore.create({
            data: {
                profileId: profile.id,
                scoreTotal: scoreOutput.totalScore,
                scoreBreakdown: scoreOutput.componentScores,
                blockers: scoreOutput.blockers,
                recommendation: scoreOutput.recommendation,
                eligibility: scoreOutput.eligibility,
                generatedBy: 'AI',
                promptVersion: this.aiService.getPromptVersion(),
                modelName: this.aiService.getModelName(),
                temperature: this.aiService.getTemperature(),
            },
        });
        this.logger.log(`Scored profile ${profile.id}: ${scoreOutput.totalScore}/100 (${scoreOutput.eligibility})`);
    }
    async overrideScore(scoreId, admin, overrideData) {
        if (admin.role !== client_1.MembershipRole.PLATFORM_ADMIN) {
            throw new common_1.ForbiddenException('Only Platform Admins can override scores.');
        }
        return this.prisma.demandReadinessScore.update({
            where: { id: scoreId },
            data: {
                scoreTotal: overrideData.scoreTotal,
                overrideReason: overrideData.overrideReason,
                adminOverride: true,
                generatedBy: `ADMIN:${admin.id}`,
                eligibility: overrideData.scoreTotal >= 75 ? 'SPRINT_AND_RETAINER' :
                    overrideData.scoreTotal >= 60 ? 'SPRINT_ONLY' : 'INELIGIBLE',
            },
        });
    }
};
exports.StartupsService = StartupsService;
exports.StartupsService = StartupsService = StartupsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], StartupsService);
//# sourceMappingURL=startups.service.js.map