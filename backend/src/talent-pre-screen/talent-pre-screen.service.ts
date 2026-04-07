import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PreScreenRecommendation } from '@prisma/client';
import {
  TALENT_PRESCREEN_PROMPT_VERSION,
  mockTalentPreScreen,
  TalentPreScreenInput,
} from '../ai/prompts/talent-prescreen.prompt';

@Injectable()
export class TalentPreScreenService {
  private readonly logger = new Logger(TalentPreScreenService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get a talent pre-screen by application ID.
   */
  async getPreScreenByApplicationId(applicationId: string) {
    const preScreen = await this.prisma.talentPreScreen.findUnique({
      where: { applicationId },
      include: { application: true },
    });

    if (!preScreen) throw new NotFoundException('Talent pre-screen not found.');
    return preScreen;
  }

  /**
   * Create a talent pre-screen for an applicant.
   * Generates recommendation scores based on application data.
   */
  async generatePreScreen(applicationId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) throw new NotFoundException('Application not found.');

    // Check if pre-screen already exists
    const existing = await this.prisma.talentPreScreen.findUnique({
      where: { applicationId },
    });

    if (existing) {
      this.logger.debug(`Pre-screen already exists for application ${applicationId}`);
      return existing;
    }

    this.logger.log(`Generating pre-screen for application ${applicationId}`);

    // Calculate scores via the dedicated prescreen prompt module (mock path
    // for now; identical contract to a future live OpenAI call).
    const promptInput: TalentPreScreenInput = {
      yearsExperience: application.yearsExperience ?? undefined,
      currentRole: application.currentRole ?? undefined,
      linkedInUrl: application.linkedInUrl ?? undefined,
      caseStudyResponse: application.caseStudyResponse ?? undefined,
      references: Array.isArray(application.references)
        ? (application.references as unknown[])
        : undefined,
      employmentStatus: application.employmentStatus ?? undefined,
      earliestStart: application.earliestStart
        ? application.earliestStart.toISOString()
        : undefined,
      rateExpectationMin: application.rateExpectationMin ?? undefined,
      rateExpectationMax: application.rateExpectationMax ?? undefined,
      markets: application.markets ? [application.markets] : undefined,
    };
    const scores = mockTalentPreScreen(promptInput);

    // Create the pre-screen record
    const preScreen = await this.prisma.talentPreScreen.create({
      data: {
        applicationId,
        recommendation: scores.recommendation,
        completenessScore: scores.completenessScore,
        consistencyScore: scores.consistencyScore,
        referenceScore: scores.referenceScore,
        assessmentScore: scores.assessmentScore,
        redFlags: scores.redFlags as any,
        suggestedProbeQuestions: scores.suggestedProbeQuestions,
        linkedinVerification: scores.linkedinVerification as any,
        promptVersion: TALENT_PRESCREEN_PROMPT_VERSION,
      },
      include: { application: true },
    });

    this.logger.log(
      `Pre-screen created for application ${applicationId}: ${scores.recommendation}`,
    );
    return preScreen;
  }

  /**
   * Update pre-screen recommendation (admin decision).
   * Allows admins to override AI recommendation.
   */
  async updateRecommendation(
    applicationId: string,
    params: {
      recommendation?: PreScreenRecommendation;
      redFlags?: any[];
      suggestedProbeQuestions?: string[];
    },
  ) {
    const preScreen = await this.prisma.talentPreScreen.findUnique({
      where: { applicationId },
    });

    if (!preScreen) throw new NotFoundException('Talent pre-screen not found.');

    const updateData: Record<string, any> = {};

    if (params.recommendation) {
      if (!['STRONG_PASS', 'PASS', 'MAYBE', 'WEAK_PASS', 'FAIL'].includes(params.recommendation)) {
        throw new BadRequestException(`Invalid recommendation: ${params.recommendation}`);
      }
      updateData.recommendation = params.recommendation;
    }

    if (params.redFlags) {
      updateData.redFlags = params.redFlags;
    }

    if (params.suggestedProbeQuestions) {
      updateData.suggestedProbeQuestions = params.suggestedProbeQuestions;
    }

    const updated = await this.prisma.talentPreScreen.update({
      where: { applicationId },
      data: updateData,
      include: { application: true },
    });

    this.logger.log(
      `Pre-screen updated for application ${applicationId}: ${updated.recommendation}`,
    );
    return updated;
  }

}
