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
var MatchingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let MatchingService = MatchingService_1 = class MatchingService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.logger = new common_1.Logger(MatchingService_1.name);
    }
    async generateShortlist(startupProfileId) {
        const startup = await this.prisma.startupProfile.findUnique({
            where: { id: startupProfileId },
            include: { scores: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
        if (!startup)
            throw new common_1.NotFoundException('Startup profile not found.');
        const operators = await this.prisma.operatorProfile.findMany({
            where: { verification: 'VERIFIED' },
            include: {
                operator: { select: { id: true, name: true, country: true } },
                scores: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
        });
        if (operators.length === 0) {
            throw new common_1.BadRequestException('No verified operators available for matching.');
        }
        const scoredCandidates = operators.map((op) => {
            const breakdown = this.computeMatchScore(startup, op);
            const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
            return { operator: op, breakdown, total };
        });
        const filtered = scoredCandidates.filter((c) => c.breakdown.laneAlignment > 0);
        filtered.sort((a, b) => b.total - a.total);
        const tierA = filtered.filter((c) => c.operator.tier === 'TIER_A');
        const selected = [];
        for (const c of tierA) {
            if (selected.length >= 2)
                break;
            selected.push(c);
        }
        for (const c of filtered) {
            if (selected.length >= 4)
                break;
            if (!selected.includes(c))
                selected.push(c);
        }
        const adjacentPool = scoredCandidates.filter((c) => !selected.includes(c) && c.total > 0);
        if (adjacentPool.length > 0) {
            const midIdx = Math.floor(adjacentPool.length / 2);
            selected.push(adjacentPool[midIdx]);
        }
        const shortlist = await this.prisma.matchShortlist.create({
            data: {
                startupProfileId,
                promptVersion: 'match_fit_v1.0',
                modelName: this.aiService.getModelName(),
                selectionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        for (const c of selected) {
            const isAdjacent = selected.indexOf(c) === selected.length - 1 && adjacentPool.includes(c);
            await this.prisma.matchCandidate.create({
                data: {
                    shortlistId: shortlist.id,
                    operatorId: c.operator.id,
                    matchScore: c.total,
                    scoreBreakdown: c.breakdown,
                    explanation: this.generateExplanation(c.operator, c.breakdown, isAdjacent),
                    mainRisk: this.identifyRisk(c.breakdown),
                    packageTier: this.recommendPackageTier(startup),
                    weeklyFitHours: this.estimateWeeklyHours(c.breakdown),
                },
            });
        }
        this.logger.log(`Shortlist ${shortlist.id} generated with ${selected.length} candidates for startup ${startupProfileId}`);
        return this.findOne(shortlist.id);
    }
    computeMatchScore(startup, operator) {
        const sMarkets = startup.targetMarkets ?? [];
        const sMotion = startup.salesMotion ?? '';
        const sBudget = startup.budgetBand ?? '';
        const oLanes = operator.lanes ?? [];
        const oRegions = operator.regions ?? [];
        const oTier = operator.tier ?? 'UNVERIFIED';
        const oYears = operator.yearsExperience ?? 0;
        let laneAlignment = 0;
        if (sMotion === 'OUTBOUND' && oLanes.includes('PIPELINE_SPRINT'))
            laneAlignment = 20;
        else if ((sMotion === 'PARTNERSHIPS' || sMotion === 'CHANNEL') && oLanes.includes('BD_SPRINT'))
            laneAlignment = 20;
        else if (oLanes.includes('FRACTIONAL_RETAINER'))
            laneAlignment = 15;
        else if (oLanes.length > 0)
            laneAlignment = 8;
        const regionOverlap = sMarkets.some((m) => oRegions.includes(m)) ? 15 : sMarkets.length > 0 ? 5 : 10;
        let budgetFit = 10;
        if (sBudget === 'ABOVE_20K')
            budgetFit = 15;
        else if (sBudget === '10K_TO_20K')
            budgetFit = 13;
        else if (sBudget === '5K_TO_10K')
            budgetFit = 11;
        const experienceRelevance = Math.min(15, oYears * 2 + 3);
        const availabilityMatch = 8;
        const tierBonus = oTier === 'TIER_A' ? 15 : oTier === 'TIER_B' ? 10 : oTier === 'TIER_C' ? 5 : 0;
        const motionFit = laneAlignment >= 15 ? 10 : laneAlignment > 0 ? 6 : 2;
        return { laneAlignment, regionOverlap, budgetFit, experienceRelevance, availabilityMatch, tierBonus, motionFit };
    }
    generateExplanation(operator, breakdown, isAdjacent) {
        const oName = operator.operator?.name ?? 'This operator';
        const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
        const strengths = [];
        if (breakdown.laneAlignment >= 15)
            strengths.push('strong lane alignment');
        if (breakdown.regionOverlap >= 12)
            strengths.push('strong regional overlap');
        if (breakdown.tierBonus >= 12)
            strengths.push('Tier A verified quality');
        if (breakdown.experienceRelevance >= 12)
            strengths.push('deep domain experience');
        const adj = isAdjacent ? ' (Adjacent fit — included for diverse perspective.)' : '';
        return `${oName} scored ${total}/100. Key strengths: ${strengths.length > 0 ? strengths.join(', ') : 'balanced across all dimensions'}.${adj}`;
    }
    identifyRisk(breakdown) {
        const weakest = Object.entries(breakdown).sort(([, a], [, b]) => a - b)[0];
        const riskMap = {
            laneAlignment: 'Service lane may not be the optimal match — clarify engagement scope.',
            regionOverlap: 'Limited overlap in target regions — ensure cultural and timezone fit.',
            budgetFit: 'Budget alignment should be validated during SOW negotiation.',
            experienceRelevance: 'Operator experience profile may need supplementary domain exposure.',
            availabilityMatch: 'Availability constraints — confirm commitment before engagement.',
            tierBonus: 'Lower tier verification — additional references may strengthen confidence.',
            motionFit: 'Go-to-market motion alignment is partial — scope definition will be important.',
        };
        return riskMap[weakest[0]] ?? 'No critical risks identified.';
    }
    recommendPackageTier(startup) {
        const budget = startup.budgetBand;
        const motion = startup.salesMotion;
        if (budget === 'ABOVE_20K')
            return 'FRACTIONAL_RETAINER';
        if (motion === 'PARTNERSHIPS' || motion === 'CHANNEL')
            return 'BD_SPRINT';
        return 'PIPELINE_SPRINT';
    }
    estimateWeeklyHours(breakdown) {
        const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
        if (total >= 80)
            return 20;
        if (total >= 65)
            return 15;
        return 10;
    }
    async findOne(shortlistId) {
        const sl = await this.prisma.matchShortlist.findUnique({
            where: { id: shortlistId },
            include: { candidates: { orderBy: { matchScore: 'desc' } } },
        });
        if (!sl)
            throw new common_1.NotFoundException('Shortlist not found.');
        return sl;
    }
    async findByStartup(startupProfileId) {
        return this.prisma.matchShortlist.findMany({
            where: { startupProfileId },
            orderBy: { createdAt: 'desc' },
            include: { candidates: { orderBy: { matchScore: 'desc' } } },
        });
    }
    async findAll() {
        return this.prisma.matchShortlist.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                startupProfile: { select: { id: true, industry: true, stage: true } },
                candidates: { orderBy: { matchScore: 'desc' } },
            },
        });
    }
    async publishShortlist(shortlistId) {
        return this.prisma.matchShortlist.update({
            where: { id: shortlistId },
            data: { status: 'PUBLISHED', publishedAt: new Date() },
        });
    }
    async operatorRespond(candidateId, interest, declineReason) {
        const candidate = await this.prisma.matchCandidate.findUnique({ where: { id: candidateId } });
        if (!candidate)
            throw new common_1.NotFoundException('Candidate not found.');
        return this.prisma.matchCandidate.update({
            where: { id: candidateId },
            data: {
                interest,
                status: interest === 'ACCEPTED' ? 'INTERESTED' : 'DECLINED',
                declineReason: interest === 'DECLINED' ? declineReason : undefined,
            },
        });
    }
    async selectOperator(shortlistId, candidateId) {
        const candidate = await this.prisma.matchCandidate.findUnique({ where: { id: candidateId } });
        if (!candidate || candidate.shortlistId !== shortlistId)
            throw new common_1.NotFoundException('Candidate not found on shortlist.');
        if (candidate.interest !== 'ACCEPTED')
            throw new common_1.BadRequestException('Cannot select an operator who has not accepted interest.');
        await this.prisma.$transaction([
            this.prisma.matchCandidate.update({
                where: { id: candidateId },
                data: { status: 'SELECTED', selectedAt: new Date() },
            }),
            this.prisma.matchCandidate.updateMany({
                where: { shortlistId, id: { not: candidateId } },
                data: { status: 'PASSED' },
            }),
            this.prisma.matchShortlist.update({
                where: { id: shortlistId },
                data: { status: 'SELECTION_MADE' },
            }),
        ]);
        return this.findOne(shortlistId);
    }
};
exports.MatchingService = MatchingService;
exports.MatchingService = MatchingService = MatchingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], MatchingService);
//# sourceMappingURL=matching.service.js.map