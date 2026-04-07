import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import {
  OPPORTUNITY_BRIEF_PROMPT_VERSION,
  OpportunityBriefInput,
  OpportunityBriefOutput,
  mockOpportunityBrief,
} from '../ai/prompts/opportunity-brief.prompt';

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
        internalContent: internalContent as any,
        clientFacingContent: {
          summary: internalContent.summary,
          keyResponsibilities: internalContent.keyResponsibilities?.slice(0, 5) || [],
          successMetrics: internalContent.successMetrics || [],
          timeline: internalContent.timeline,
        },
        aiModel: this.aiService.getModelName(),
        promptVersion: OPPORTUNITY_BRIEF_PROMPT_VERSION,
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
   * Delegates to the dedicated opportunity-brief prompt module.
   */
  private async generateInternalContent(
    briefData: Record<string, any>,
  ): Promise<OpportunityBriefOutput> {
    const input: OpportunityBriefInput = {
      companyName: briefData.companyName,
      needArea: briefData.needArea,
      targetMarkets: briefData.targetMarkets,
      budgetRange: briefData.budgetRange,
      urgency: briefData.urgency,
      diagnosis: briefData.diagnosis,
    };

    try {
      // Currently always returns the deterministic mock — when a real
      // OpenAI call is wired up here it will use the prompt builders
      // exported from ../ai/prompts/opportunity-brief.prompt.ts.
      return mockOpportunityBrief(input);
    } catch (err: any) {
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
}
