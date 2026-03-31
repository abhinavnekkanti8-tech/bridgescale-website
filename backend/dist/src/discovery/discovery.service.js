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
var DiscoveryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let DiscoveryService = DiscoveryService_1 = class DiscoveryService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.logger = new common_1.Logger(DiscoveryService_1.name);
    }
    async schedule(dto) {
        const meetingLink = dto.meetingLink || `https://meet.antigravity.dev/${Date.now().toString(36)}`;
        return this.prisma.discoveryCall.create({
            data: {
                startupProfileId: dto.startupProfileId,
                scheduledAt: new Date(dto.scheduledAt),
                durationMinutes: dto.durationMinutes ?? 30,
                meetingLink,
            },
        });
    }
    async cancel(callId) {
        return this.prisma.discoveryCall.update({
            where: { id: callId },
            data: { status: 'CANCELLED' },
        });
    }
    async markCompleted(callId) {
        return this.prisma.discoveryCall.update({
            where: { id: callId },
            data: { status: 'COMPLETED' },
        });
    }
    async addNotes(callId, dto) {
        const call = await this.findOne(callId);
        const updated = await this.prisma.discoveryCall.update({
            where: { id: callId },
            data: { notes: dto.notes, status: 'COMPLETED' },
        });
        this.runAiSummary(call.id, dto.notes, call.startupProfileId).catch((err) => {
            this.logger.error(`AI summary failed for call ${callId}:`, err);
        });
        return updated;
    }
    async runAiSummary(callId, notes, startupProfileId) {
        this.logger.log(`Generating AI summary for discovery call ${callId}`);
        const profile = await this.prisma.startupProfile.findUnique({
            where: { id: startupProfileId },
        });
        const profileContext = profile
            ? `Industry: ${profile.industry}, Stage: ${profile.stage}, Markets: ${profile.targetMarkets?.join(', ')}, Motion: ${profile.salesMotion}`
            : 'Profile not available';
        const summary = this.buildMockSummary(notes, profileContext);
        const recommendation = this.buildMockRecommendation(profile);
        await this.prisma.discoveryCall.update({
            where: { id: callId },
            data: {
                aiSummary: summary,
                aiRecommendation: recommendation.text,
                recommendedPkgs: recommendation.packages,
                promptVersion: 'discovery_summary_v1.0',
                modelName: this.aiService.getModelName(),
            },
        });
        this.logger.log(`AI summary generated for call ${callId}`);
    }
    buildMockSummary(notes, profileContext) {
        const noteLen = notes.length;
        const detailLevel = noteLen > 500 ? 'detailed' : noteLen > 200 ? 'moderate' : 'brief';
        return [
            `**Discovery Call Summary**`,
            ``,
            `**Startup Context:** ${profileContext}`,
            ``,
            `**Key Insights:** The discovery call revealed a ${detailLevel} understanding of the startup's go-to-market needs. `,
            `The founding team demonstrates clear intent to expand into diaspora markets with structured sales support.`,
            ``,
            `**Engagement Readiness:** The startup has shown commitment to timeline-bound execution. `,
            `${noteLen > 300 ? 'Comprehensive notes indicate strong preparation and serious engagement intent.' : 'Additional follow-up may be needed to refine scope.'}`,
            ``,
            `**Recommended Next Steps:** Proceed with package selection based on the startup's readiness score and budget alignment.`,
        ].join('\n');
    }
    buildMockRecommendation(profile) {
        const budget = profile?.budgetBand ?? 'UNDER_5K';
        const motion = profile?.salesMotion ?? 'OUTBOUND';
        let packages;
        let text;
        if (budget === 'ABOVE_20K') {
            packages = ['FRACTIONAL_RETAINER', 'PIPELINE_SPRINT'];
            text = 'Based on the budget range and engagement depth, a Fractional Sales Leadership Retainer is recommended as the primary package, with a Pipeline Sprint as an accelerated start option.';
        }
        else if (motion === 'PARTNERSHIPS' || motion === 'CHANNEL') {
            packages = ['BD_SPRINT'];
            text = 'The startup\'s partnership-driven go-to-market strategy aligns best with a Business Development Sprint, focusing on channel activation and alliance building.';
        }
        else {
            packages = ['PIPELINE_SPRINT'];
            text = 'A Pipeline Sprint is recommended as the initial engagement. This provides structured outbound execution within a defined timeline and budget.';
        }
        return { text, packages };
    }
    async findOne(callId) {
        const call = await this.prisma.discoveryCall.findUnique({
            where: { id: callId },
            include: { startupProfile: { select: { id: true, industry: true, stage: true } } },
        });
        if (!call)
            throw new common_1.NotFoundException('Discovery call not found.');
        return call;
    }
    async findByStartup(startupProfileId) {
        return this.prisma.discoveryCall.findMany({
            where: { startupProfileId },
            orderBy: { scheduledAt: 'desc' },
        });
    }
    async findAll() {
        return this.prisma.discoveryCall.findMany({
            orderBy: { scheduledAt: 'desc' },
            include: { startupProfile: { select: { id: true, industry: true, stage: true } } },
        });
    }
    async overrideSummary(callId, dto) {
        return this.prisma.discoveryCall.update({
            where: { id: callId },
            data: {
                overrideSummary: dto.overrideSummary,
                overrideReason: dto.overrideReason,
                adminOverride: true,
            },
        });
    }
    async getPackages() {
        return this.prisma.package.findMany({
            where: { isActive: true },
            orderBy: { priceUsd: 'asc' },
        });
    }
    async seedPackages() {
        const existing = await this.prisma.package.count();
        if (existing > 0)
            return { seeded: false, count: existing };
        const packages = [
            { type: 'PIPELINE_SPRINT', name: 'Pipeline Sprint', description: '8-week structured outbound campaign with dedicated operator. Includes ICP targeting, outreach sequences, and weekly pipeline reviews.', durationWeeks: 8, weeklyHours: 15, priceUsd: 5000 },
            { type: 'BD_SPRINT', name: 'BD Sprint', description: '8-week partnership and business development sprint. Includes channel mapping, alliance outreach, and partnership deal flow.', durationWeeks: 8, weeklyHours: 15, priceUsd: 6000 },
            { type: 'FRACTIONAL_RETAINER', name: 'Fractional Sales Leadership Retainer', description: 'Ongoing fractional sales leadership. Includes strategy, team coaching, pipeline management, and quarterly business reviews.', durationWeeks: 12, weeklyHours: 20, priceUsd: 15000 },
        ];
        await this.prisma.package.createMany({ data: packages });
        return { seeded: true, count: packages.length };
    }
};
exports.DiscoveryService = DiscoveryService;
exports.DiscoveryService = DiscoveryService = DiscoveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], DiscoveryService);
//# sourceMappingURL=discovery.service.js.map