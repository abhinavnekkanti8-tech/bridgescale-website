import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEscalationDto, UpdateEscalationDto, CreateNudgeDto, UpdateHealthScoreDto } from './dto/health.dto';
import { AiService } from '../ai/ai.service'; // Assuming AI service can generate commentary if needed later

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private prisma: PrismaService, private aiService: AiService) {}

  // ── Engine / Recalculation ─────────────────────────────────────────────
  
  // In a real implementation this would be fired by cron or on webhook events.
  // Here we allow triggering a snapshot manually (useful for MVP testing).
  async recalculateHealth(engagementId: string) {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id: engagementId },
      include: {
        milestones: true,
        notes: true,
        contract: { include: { paymentPlan: { include: { invoices: true } } } },
      },
    });
    if (!engagement) throw new NotFoundException('Engagement not found');

    // MOCK SCORING LOGIC
    // Base 100.
    // - Deduct 20 if there is an overdue invoice.
    // - Deduct 10 for each overdue milestone.
    // - Deduct 15 if no notes in the last 7 days.
    
    let score = 100;
    const now = new Date();
    
    const hasOverdueInvoice = engagement.contract?.paymentPlan?.invoices?.some(
      (inv) => inv.status === 'OVERDUE'
    );
    if (hasOverdueInvoice) score -= 20;

    const overdueMilestones = engagement.milestones.filter(
      (ms) => ms.status !== 'COMPLETED' && ms.dueDate < now
    );
    score -= overdueMilestones.length * 10;

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentNotes = engagement.notes.filter((n) => n.createdAt > sevenDaysAgo);
    if (recentNotes.length === 0) score -= 15;

    score = Math.max(0, score); // Floor at 0

    // Prompt the dummy AI service for a commentary based on the score
    let aiCommentary = 'The engagement is operating smoothly.';
    let action = 'No action required.';
    
    if (score < 80) {
      if (hasOverdueInvoice) {
        aiCommentary = 'Payment is currently overdue, which is creating friction.';
        action = 'Prompt startup to pay overdue invoice urgently.';
      } else if (overdueMilestones.length > 0) {
        aiCommentary = 'Delivery is falling behind expected pace.';
        action = 'Operator needs to review overdue milestones.';
      } else {
        aiCommentary = 'Communication velocity is low.';
        action = 'Encourage a quick check-in note on the workspace.';
      }
    }

    const snapshot = await this.prisma.healthScoreSnapshot.create({
      data: {
        engagementId,
        scoreTotal: score,
        components: {
          overdueInvoices: hasOverdueInvoice ? 1 : 0,
          overdueMilestones: overdueMilestones.length,
          recentNotes: recentNotes.length,
        },
        aiCommentary,
        suggestedAction: action,
      },
    });

    // Update parent
    await this.prisma.engagement.update({
      where: { id: engagementId },
      data: { healthScore: score },
    });

    this.logger.log(`Recalculated health for ${engagementId}: Score ${score}`);
    return snapshot;
  }

  async getLatestSnapshot(engagementId: string) {
    return this.prisma.healthScoreSnapshot.findFirst({
      where: { engagementId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllSnapshots(engagementId: string) {
    return this.prisma.healthScoreSnapshot.findMany({
      where: { engagementId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  // ── Nudges ─────────────────────────────────────────────────────────────

  async createNudge(engagementId: string, dto: CreateNudgeDto) {
    return this.prisma.systemNudge.create({
      data: {
        engagementId,
        targetUserId: dto.targetUserId,
        nudgeType: dto.nudgeType,
        message: dto.message,
      },
      include: { targetUser: { select: { email: true } } },
    });
  }

  async getMyNudges(userId: string) {
    return this.prisma.systemNudge.findMany({
      where: { targetUserId: userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      include: { engagement: { select: { contract: { select: { sow: { select: { title: true } } } } } } },
    });
  }

  async markNudgeRead(nudgeId: string) {
    return this.prisma.systemNudge.update({
      where: { id: nudgeId },
      data: { isRead: true },
    });
  }

  // ── Escalations ────────────────────────────────────────────────────────

  async getOpenEscalations() {
    return this.prisma.escalationCase.findMany({
      where: { status: { in: ['OPEN', 'INVESTIGATING'] } },
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { name: true, email: true } }, engagement: { select: { id: true, status: true } } },
    });
  }

  async createEscalation(reporterId: string, dto: CreateEscalationDto) {
    const esc = await this.prisma.escalationCase.create({
      data: {
        engagementId: dto.engagementId,
        reporterId,
        reason: dto.reason,
      },
    });

    // Also update engagement status to PAUSED immediately to freeze invoicing?
    // Depending on platform policy. For MVP we'll simply log.
    this.logger.warn(`Escalation raised on ${dto.engagementId} by ${reporterId}`);

    return esc;
  }

  async updateEscalationStatus(id: string, dto: UpdateEscalationDto) {
    return this.prisma.escalationCase.update({
      where: { id },
      data: {
        status: dto.status,
        resolutionNotes: dto.resolutionNotes,
      },
    });
  }
}
