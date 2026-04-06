import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AiService } from './ai.service';

/**
 * AI Workflow Service: Orchestrates AI-driven workflows such as diagnosis generation.
 * Non-blocking: errors are logged but don't interrupt the main request flow.
 */
@Injectable()
export class AiWorkflowService {
  private readonly logger = new Logger(AiWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Generate needs diagnosis for a submitted application.
   * Called after payment is confirmed and account is provisioned.
   * Non-blocking — errors are logged and don't fail the payment flow.
   */
  async generateDiagnosisForApplication(applicationId: string): Promise<void> {
    try {
      // Fetch full application data for AI analysis
      const application = await this.prisma.application.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        this.logger.warn(`Application ${applicationId} not found for diagnosis generation.`);
        return;
      }

      // Check if diagnosis already exists (idempotent)
      const existingDiagnosis = await this.prisma.needDiagnosis.findUnique({
        where: { applicationId },
      });

      if (existingDiagnosis) {
        this.logger.debug(`Diagnosis already exists for application ${applicationId}`);
        return;
      }

      this.logger.log(`Generating diagnosis for application ${applicationId} (${application.type})`);

      // Build application data object for AI analysis
      const appData = {
        type: application.type,
        name: application.name,
        email: application.email,
        companyName: application.companyName ?? undefined,
        companyStage: application.companyStage ?? undefined,
        needArea: application.needArea ?? undefined,
        targetMarkets: application.targetMarkets ?? undefined,
        budgetRange: application.budgetRange ?? undefined,
        urgency: application.urgency ?? undefined,
        notes: application.notes ?? undefined,

        // Talent-specific fields
        currentRole: application.currentRole ?? undefined,
        currentEmployer: application.currentEmployer ?? undefined,
        yearsExperience: application.yearsExperience ?? undefined,
        seniorityLevel: application.seniorityLevel ?? undefined,
      };

      // Call AI service to generate diagnosis
      const diagnosis = await this.aiService.generateNeedsDiagnosis(appData);

      // Persist diagnosis record
      const needDiagnosis = await this.prisma.needDiagnosis.create({
        data: {
          applicationId,
          status: 'DRAFT_AI',
          aiContent: {
            analysis: diagnosis.analysis,
            challenges: diagnosis.challenges,
            opportunities: diagnosis.opportunities,
            recommendedRole: diagnosis.recommendedRole,
            estimatedSprint: diagnosis.estimatedSprint,
          },
          clientFacingContent: {
            status: 'PENDING_REVIEW',
            summary: diagnosis.analysis,
            recommendedRole: diagnosis.recommendedRole,
            lastUpdatedAt: new Date().toISOString(),
          },
          aiModel: 'gpt-4o',
          promptVersion: 'demand_readiness_v1.0',
        },
      });

      this.logger.log(
        `Diagnosis created for application ${applicationId}: role=${diagnosis.recommendedRole}`,
      );

      // Send notification email (optional, non-blocking)
      this.emailService
        .sendDiagnosisGenerated({
          email: application.email,
          name: application.name,
          type: application.type,
          recommendedRole: diagnosis.recommendedRole,
        })
        .catch((err) =>
          this.logger.error(
            `Failed to send diagnosis notification to ${application.email}: ${err.message}`,
          ),
        );

      return;
    } catch (err: any) {
      // Non-blocking — log error but don't throw
      this.logger.error(
        `Failed to generate diagnosis for application ${applicationId}: ${err.message}`,
      );
    }
  }
}
