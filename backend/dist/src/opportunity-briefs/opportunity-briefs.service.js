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
var OpportunityBriefsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpportunityBriefsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let OpportunityBriefsService = OpportunityBriefsService_1 = class OpportunityBriefsService {
    constructor(prisma, aiService) {
        this.prisma = prisma;
        this.aiService = aiService;
        this.logger = new common_1.Logger(OpportunityBriefsService_1.name);
    }
    async getBriefByApplicationId(applicationId) {
        const brief = await this.prisma.opportunityBrief.findUnique({
            where: { applicationId },
            include: { application: true },
        });
        if (!brief)
            throw new common_1.NotFoundException('Opportunity brief not found.');
        return brief;
    }
    async generateBrief(applicationId) {
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: { needDiagnosis: true },
        });
        if (!application)
            throw new common_1.NotFoundException('Application not found.');
        if (!application.needDiagnosis) {
            throw new common_1.BadRequestException('No diagnosis found for this application.');
        }
        const existing = await this.prisma.opportunityBrief.findUnique({
            where: { applicationId },
        });
        if (existing) {
            this.logger.debug(`Opportunity brief already exists for ${applicationId}`);
            return existing;
        }
        this.logger.log(`Generating opportunity brief for application ${applicationId}`);
        const briefData = {
            type: application.type,
            companyName: application.companyName,
            needArea: application.needArea,
            targetMarkets: application.targetMarkets,
            budgetRange: application.budgetRange,
            urgency: application.urgency,
            diagnosis: application.needDiagnosis.aiContent,
        };
        const internalContent = await this.generateInternalContent(briefData);
        const brief = await this.prisma.opportunityBrief.create({
            data: {
                applicationId,
                internalContent,
                clientFacingContent: {
                    summary: internalContent.summary,
                    keyResponsibilities: internalContent.keyResponsibilities?.slice(0, 5) || [],
                    successMetrics: internalContent.successMetrics || [],
                    timeline: internalContent.timeline,
                },
                aiModel: this.aiService.getModelName(),
                promptVersion: this.aiService.getPromptVersion(),
            },
            include: { application: true },
        });
        this.logger.log(`Opportunity brief created for application ${applicationId}`);
        return brief;
    }
    async updateBrief(applicationId, params) {
        const brief = await this.prisma.opportunityBrief.findUnique({
            where: { applicationId },
        });
        if (!brief)
            throw new common_1.NotFoundException('Opportunity brief not found.');
        const updateData = {};
        if (params.internalContent) {
            updateData.internalContent = params.internalContent;
        }
        if (params.clientFacingContent) {
            updateData.clientFacingContent = params.clientFacingContent;
        }
        const updated = await this.prisma.opportunityBrief.update({
            where: { applicationId },
            data: updateData,
            include: { application: true },
        });
        this.logger.log(`Opportunity brief updated for application ${applicationId}`);
        return updated;
    }
    async generateInternalContent(briefData) {
        try {
            const prompt = `You are an expert in fractional hiring and talent matching.
Generate a detailed, internal opportunity brief for the following company need:

Company: ${briefData.companyName || 'Unknown'}
Type of Need: ${briefData.needArea || 'Not specified'}
Target Markets: ${Array.isArray(briefData.targetMarkets) ? briefData.targetMarkets.join(', ') : briefData.targetMarkets}
Budget Range: ${briefData.budgetRange || 'Not specified'}
Urgency: ${briefData.urgency || 'Not specified'}

Diagnosis Summary:
- Analysis: ${briefData.diagnosis?.analysis || 'Not provided'}
- Recommended Role: ${briefData.diagnosis?.recommendedRole || 'Not provided'}
- Estimated Sprint: ${briefData.diagnosis?.estimatedSprint || 'Not provided'}

Generate a JSON object with:
{
  "summary": "<2-3 sentence summary of the opportunity>",
  "keyResponsibilities": ["<responsibility 1>", ...],
  "successMetrics": ["<metric 1>", ...],
  "timeline": "<estimated timeline>",
  "talentProfile": "<ideal talent profile description>",
  "riskFactors": ["<risk 1>", ...],
  "growthPotential": "<description of growth potential>"
}`;
            return {
                summary: `Building ${briefData.companyName || 'the company'}'s commercial capability in ${briefData.targetMarkets?.[0] || 'target markets'}. This fractional engagement will establish market entry strategy and initial customer pipeline.`,
                keyResponsibilities: [
                    'Market research and competitive analysis',
                    'Initial customer identification and outreach',
                    'Sales collateral development',
                    'Partnership exploration',
                    'Revenue forecasting and pipeline building',
                ],
                successMetrics: [
                    'Identified 10+ qualified leads in target market',
                    'Established 3-5 strategic partnerships',
                    'Delivered market entry playbook',
                    '$X revenue pipeline created',
                    'Team trained on go-to-market strategy',
                ],
                timeline: briefData.diagnosis?.estimatedSprint || '30-day sprint',
                talentProfile: 'Experienced sales/business development leader with successful market entry experience, deep network in target geography, and proven ability to identify and close early deals.',
                riskFactors: [
                    'Market timing and readiness',
                    'Resource availability of company team',
                    'Competitive landscape changes',
                ],
                growthPotential: 'Potential evolution into retained fractional VP Sales or head of business development role based on initial sprint results.',
            };
        }
        catch (err) {
            this.logger.error(`Failed to generate internal brief: ${err.message}`);
            return {
                summary: 'Opportunity brief awaiting generation.',
                keyResponsibilities: [],
                successMetrics: [],
                timeline: 'TBD',
                talentProfile: 'TBD',
                riskFactors: [],
                growthPotential: '',
            };
        }
    }
};
exports.OpportunityBriefsService = OpportunityBriefsService;
exports.OpportunityBriefsService = OpportunityBriefsService = OpportunityBriefsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], OpportunityBriefsService);
//# sourceMappingURL=opportunity-briefs.service.js.map