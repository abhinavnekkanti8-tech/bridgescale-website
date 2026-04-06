import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PreScreenRecommendation } from '@prisma/client';

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

    // Calculate scores based on application data
    const scores = this.calculateScores(application as any);

    // Create the pre-screen record
    const preScreen = await this.prisma.talentPreScreen.create({
      data: {
        applicationId,
        recommendation: scores.recommendation,
        completenessScore: scores.completenessScore,
        consistencyScore: scores.consistencyScore,
        referenceScore: scores.referenceScore,
        assessmentScore: scores.assessmentScore,
        redFlags: scores.redFlags,
        suggestedProbeQuestions: scores.suggestedProbeQuestions,
        linkedinVerification: scores.linkedinVerification,
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

  /**
   * Calculate pre-screen scores based on application data.
   * Scores: completeness (0-100), consistency (0-100), references (0-100), assessment (0-100).
   */
  private calculateScores(application: any) {
    const completenessScore = this.scoreCompleteness(application);
    const consistencyScore = this.scoreConsistency(application);
    const referenceScore = this.scoreReferences(application);
    const assessmentScore = this.scoreAssessment(application);

    const avgScore = (completenessScore + consistencyScore + referenceScore + assessmentScore) / 4;

    let recommendation: PreScreenRecommendation = 'PASS';
    if (avgScore >= 85) recommendation = 'STRONG_PASS';
    else if (avgScore >= 65) recommendation = 'PASS';
    else if (avgScore >= 45) recommendation = 'CONDITIONAL';
    else recommendation = 'FAIL';

    const redFlags: any[] = [];
    if (completenessScore < 50) redFlags.push({ type: 'INCOMPLETE_PROFILE', severity: 'high' });
    if (consistencyScore < 50) redFlags.push({ type: 'INCONSISTENT_INFO', severity: 'medium' });
    if (assessmentScore < 40) redFlags.push({ type: 'WEAK_ASSESSMENT', severity: 'medium' });

    return {
      recommendation,
      completenessScore,
      consistencyScore,
      referenceScore,
      assessmentScore,
      redFlags,
      suggestedProbeQuestions: this.generateProbeQuestions(application),
      linkedinVerification: {
        verified: !!application.linkedInUrl,
        confidence: application.linkedInUrl ? 'medium' : 'low',
      },
    };
  }

  private scoreCompleteness(application: any): number {
    let score = 60; // Base score

    // Evaluate completeness of key fields
    if (application.yearsExperience) score += 10;
    if (application.currentRole) score += 10;
    if (application.linkedInUrl) score += 10;
    if (application.caseStudyResponse) score += 5;
    if (application.references) score += 5;

    return Math.min(score, 100);
  }

  private scoreConsistency(application: any): number {
    let score = 70; // Base score for consistency

    // Check for contradictions or inconsistencies
    if (application.employmentStatus === 'EMPLOYED' && application.earliestStart) {
      // Could indicate confusion about availability
      score -= 10;
    }

    if (application.rateExpectationMin && application.rateExpectationMax) {
      if (application.rateExpectationMin > application.rateExpectationMax) {
        score -= 20; // Major inconsistency
      }
    }

    return Math.min(Math.max(score, 0), 100);
  }

  private scoreReferences(application: any): number {
    // Score based on reference quality/completeness
    if (!application.references || application.references.length === 0) return 30;
    if (application.references.length === 1) return 60;
    if (application.references.length >= 2) return 85;
    return 70;
  }

  private scoreAssessment(application: any): number {
    // Score based on case study response quality
    if (!application.caseStudyResponse) return 40;
    const length = (application.caseStudyResponse as string).length;
    if (length < 200) return 50;
    if (length < 500) return 70;
    if (length >= 500) return 85;
    return 60;
  }

  private generateProbeQuestions(application: any): string[] {
    const questions: string[] = [];

    if (application.yearsExperience && application.yearsExperience > 15) {
      questions.push("Tell us about your most significant leadership achievement in recent years.");
    }

    if (application.currentRole && application.currentRole.toLowerCase().includes('founder')) {
      questions.push("What was your biggest lesson from building/scaling your company?");
    }

    if (application.markets && Array.isArray(application.markets)) {
      questions.push(`What's your strategy for success in ${application.markets[0] || 'emerging'} markets?`);
    }

    questions.push("How do you measure success in a fractional role?");
    questions.push("What type of founder/company environment brings out your best work?");

    return questions.slice(0, 5); // Return top 5 questions
  }
}
