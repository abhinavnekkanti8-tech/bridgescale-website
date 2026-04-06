import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class OpportunityBriefsService {
  private readonly logger = new Logger(OpportunityBriefsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Get an opportunity brief by application ID.
   * Returns internal + client-facing content.
   */
  async getBriefByApplicationId(applicationId: string) {
    const brief = await this.prisma.opportunityBrief.findUnique({
      where: { applicationId },
      include: { application: true },
    });

    if (!brief) throw new NotFoundException('Opportunity brief not found.');
    return brief;
  }

  /**
   * Create an opportunity brief from an approved diagnosis.
   * Generates internal content using AI based on diagnosis + application data.
   */
  async generateBrief(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { needDiagnosis: true },
    });

    if (!application) throw new NotFoundException('Application not found.');
    if (!application.needDiagnosis) {
      throw new BadRequestException('No diagnosis found for this application.');
    }

    // Check if brief already exists
    const existing = await this.prisma.opportunityBrief.findUnique({
      where: { applicationId },
    });

    if (existing) {
      this.logger.debug(`Opportunity brief already exists for ${applicationId}`);
      return existing;
    }

    this.logger.log(`Generating opportunity brief for application ${applicationId}`);

    // Build brief data from application + diagnosis
    const briefData = {
      type: application.type,
      companyName: application.companyName,
      needArea: application.needArea,
      targetMarkets: application.targetMarkets,
      budgetRange: application.budgetRange,
      urgency: application.urgency,
      diagnosis: application.needDiagnosis.aiContent,
    };

    // Call AI to generate internal brief
    const internalContent = await this.generateInternalContent(briefData);

    // Create the brief
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

  /**
   * Update opportunity brief content (admin editing).
   * Allows admins to modify internal and client-facing content.
   */
  async updateBrief(
    applicationId: string,
    params: {
      internalContent?: Record<string, any>;
      clientFacingContent?: Record<string, any>;
    },
  ) {
    const brief = await this.prisma.opportunityBrief.findUnique({
      where: { applicationId },
    });

    if (!brief) throw new NotFoundException('Opportunity brief not found.');

    const updateData: Record<string, any> = {};

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

  /**
   * Generate internal brief content using AI.
   * Structured analysis of the opportunity.
   */
  private async generateInternalContent(briefData: Record<string, any>) {
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

      // For now, return a structured mock response
      return {
        summary: `Building ${briefData.companyName || 'the company'}'s commercial capability in ${(briefData.targetMarkets as string[])?.[0] || 'target markets'}. This fractional engagement will establish market entry strategy and initial customer pipeline.`,
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
        talentProfile:
          'Experienced sales/business development leader with successful market entry experience, deep network in target geography, and proven ability to identify and close early deals.',
        riskFactors: [
          'Market timing and readiness',
          'Resource availability of company team',
          'Competitive landscape changes',
        ],
        growthPotential:
          'Potential evolution into retained fractional VP Sales or head of business development role based on initial sprint results.',
      };
    } catch (err: any) {
      this.logger.error(`Failed to generate internal brief: ${err.message}`);
      // Return structured fallback
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
}
