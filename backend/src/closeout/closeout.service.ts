import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { UpdateCloseoutDto, SubmitRatingDto } from './dto/closeout.dto';

@Injectable()
export class CloseoutService {
  private readonly logger = new Logger(CloseoutService.name);

  constructor(private prisma: PrismaService, private aiService: AiService) {}

  // ── Closeout Report ───────────────────────────────────────────────────

  async generateReport(engagementId: string) {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id: engagementId },
      include: { milestones: true, logs: true, contract: { include: { sow: true } } },
    });
    if (!engagement) throw new NotFoundException('Engagement not found');

    // MOCK AI GENERATION
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

  async getReport(engagementId: string) {
    return this.prisma.closeoutReport.findUnique({ where: { engagementId } });
  }

  async updateReport(engagementId: string, dto: UpdateCloseoutDto) {
    return this.prisma.closeoutReport.update({
      where: { engagementId },
      data: dto,
    });
  }

  // ── Ratings ─────────────────────────────────────────────────────────────

  async submitRating(engagementId: string, reviewerId: string, dto: SubmitRatingDto) {
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

  async getEngagementRatings(engagementId: string) {
    return this.prisma.engagementRating.findMany({
      where: { engagementId },
      include: {
        reviewer: { select: { name: true, email: true } },
        reviewee: { select: { name: true, email: true } },
      },
    });
  }

  // ── Renewal Recommendations ─────────────────────────────────────────────

  async generateRenewalRecommendation(engagementId: string) {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id: engagementId },
      include: {
        contract: { include: { sow: true } },
        healthSnapshots: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!engagement) throw new NotFoundException('Engagement not found');

    const health = engagement.healthSnapshots[0]?.scoreTotal || 100;
    
    let recommendedType: 'RENEWAL' | 'RETAINER_CONVERSION' | 'FOLLOW_ON_SPRINT' | 'NONE' = 'NONE';
    let reasoning = 'No clear signal for renewal based on engagement metrics.';

    if (health >= 85) {
      recommendedType = 'RETAINER_CONVERSION';
      reasoning = 'Highly successful engagement with strong health scores. Recommend converting to long-term retained advisory.';
    } else if (health >= 70) {
      recommendedType = 'FOLLOW_ON_SPRINT';
      reasoning = 'Good progress made. A targeted follow-on sprint is recommended to finalize outstanding operational goals.';
    }

    return this.prisma.renewalRecommendation.upsert({
      where: { engagementId },
      update: { recommendedType, reasoning },
      create: { engagementId, recommendedType, reasoning },
    });
  }

  async getRenewalRecommendation(engagementId: string) {
    return this.prisma.renewalRecommendation.findUnique({ where: { engagementId } });
  }
}
