import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordAccessService } from '../common/services/record-access.service';
import { SessionUser } from '../common/types/session.types';
import {
  UpdateEngagementStatusDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  CreateNoteDto,
  ConvertFulltimeDto,
} from './dto/engagements.dto';

@Injectable()
export class EngagementsService {
  private readonly logger = new Logger(EngagementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly recordAccess: RecordAccessService,
  ) {}

  // ── Core Engagement ────────────────────────────────────────────────────────

  async initializeEngagement(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { sow: true, paymentPlan: { include: { invoices: true } } },
    });

    if (!contract || contract.status !== 'FULLY_SIGNED') {
      throw new BadRequestException('Contract must be FULLY_SIGNED to start engagement.');
    }
    
    // Check if initial payment is made (simplified logic: check if any invoice is paid)
    const hasInitialPayment = contract.paymentPlan?.invoices?.some(inv => inv.status === 'PAID');
    if (!hasInitialPayment) {
       this.logger.warn(`Engagement initialized for ${contractId} without initial payment. Assuming Deferred start.`);
    }

    const engagement = await this.prisma.engagement.create({
      data: {
        contractId,
        startupId: contract.sow.startupProfileId,
        operatorId: contract.sow.operatorId,
        status: 'ACTIVE',
        startDate: new Date(),
      },
    });

    await this.logActivity(engagement.id, 'SYSTEM', 'ENGAGEMENT_STARTED', 'Workspace initialized from signed contract.');

    this.logger.log(`Engagement workspace ${engagement.id} created.`);
    return engagement;
  }

  async getEngagement(user: SessionUser, id: string) {
    await this.recordAccess.assertEngagementAccess(user, id);
    const eng = await this.prisma.engagement.findUnique({
      where: { id },
      include: {
        startup: { select: { industry: true } },
        contract: {
          include: {
            sow: { include: { msa: true } },
          },
        },
      },
    });
    if (!eng) throw new NotFoundException('Engagement not found.');

    // Pre-SOW summaries are keyed off the operator-org id, not the profile id —
    // resolve it to look up the most recent summary for this (startup, operator) pair.
    const operatorProfile = await this.prisma.operatorProfile.findUnique({
      where: { id: eng.operatorId },
      select: { operatorId: true },
    });
    const preSowSummary = operatorProfile
      ? await this.prisma.preSowCommercialSummary.findFirst({
          where: {
            startupProfileId: eng.startupId,
            operatorId: operatorProfile.operatorId,
          },
          orderBy: { updatedAt: 'desc' },
        })
      : null;

    return { ...eng, preSowSummary };
  }

  async getWorkspaceData(user: SessionUser, engagementId: string) {
    await this.recordAccess.assertEngagementAccess(user, engagementId);
    const milestones = await this.prisma.engagementMilestone.findMany({
      where: { engagementId },
      orderBy: { dueDate: 'asc' },
    });
    const notes = await this.prisma.workspaceNote.findMany({
      where: { engagementId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true, email: true } } },
    });
    const logs = await this.prisma.activityLog.findMany({
      where: { engagementId },
      orderBy: { createdAt: 'desc' },
      take: 20, // Recent 20
      include: { actor: { select: { name: true, email: true } } },
    });

    return { milestones, notes, logs };
  }

  async findForStartup(user: SessionUser) {
    const startupId = await this.recordAccess.getStartupProfileIdForUser(user);
    return this.prisma.engagement.findMany({
      where: { startupId },
      include: { contract: { select: { sow: { select: { title: true } } } } },
    });
  }

  async findForOperator(user: SessionUser) {
    const operatorId = await this.recordAccess.getOperatorProfileIdForUser(user);
    return this.prisma.engagement.findMany({
      where: { operatorId },
      include: { startup: { select: { industry: true } }, contract: { select: { sow: { select: { title: true } } } } },
    });
  }

  async updateStatus(id: string, dto: UpdateEngagementStatusDto, actorId: string) {
    const eng = await this.prisma.engagement.update({
      where: { id },
      data: { 
        status: dto.status,
        ...(dto.status === 'COMPLETED' || dto.status === 'TERMINATED' ? { endDate: new Date() } : {})
      },
    });
    await this.logActivity(id, actorId, 'STATUS_CHANGED', `Engagement marked as ${dto.status}`);
    return eng;
  }

  async convertToFulltime(id: string, dto: ConvertFulltimeDto, actorId: string) {
    const engagement = await this.prisma.engagement.findUnique({
      where: { id },
      include: { contract: { include: { sow: true, paymentPlan: true } } },
    });
    if (!engagement) throw new NotFoundException('Engagement not found.');

    const converted = await this.prisma.engagement.update({
      where: { id },
      data: { status: 'CONVERTED_TO_FULLTIME', endDate: new Date() },
    });

    await this.prisma.lifecycleEvent.create({
      data: {
        engagementId: id,
        eventType: 'CONVERTED_TO_FULLTIME',
        description: dto.description ?? 'Engagement converted to full-time employment.',
        metadata: {
          placeholderConversionFeePercent: 25,
          contractId: engagement.contractId,
        },
      },
    });

    const baseAmount = engagement.contract.sow.totalPriceUsd ?? 0;
    const conversionFeeAmount = Math.round(baseAmount * 0.25);
    const paymentPlan = engagement.contract.paymentPlan ?? await this.prisma.paymentPlan.create({
      data: {
        contractId: engagement.contractId,
        planType: 'CONVERSION_FEE',
        totalAmountUsd: conversionFeeAmount,
        currency: 'USD',
        billingCurrency: 'USD',
      },
    });

    await this.prisma.invoice.create({
      data: {
        paymentPlanId: paymentPlan.id,
        amountUsd: conversionFeeAmount,
        description: 'Draft full-time conversion fee placeholder (25%).',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'DRAFT',
        metadata: {
          engagementId: id,
          source: 'PHASE_2_CONVERSION_PLACEHOLDER',
        },
      },
    });

    await this.logActivity(id, actorId, 'CONVERTED_TO_FULLTIME', 'Engagement converted to full-time.');
    return converted;
  }

  // ── Milestones ─────────────────────────────────────────────────────────────

  async createMilestone(engagementId: string, dto: CreateMilestoneDto, actor: SessionUser) {
    await this.recordAccess.assertEngagementAccess(actor, engagementId);
    const ms = await this.prisma.engagementMilestone.create({
      data: {
        engagementId,
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
      },
    });
    await this.logActivity(engagementId, actor.id, 'MILESTONE_ADDED', `Added milestone: ${dto.title}`);
    return ms;
  }

  async updateMilestone(milestoneId: string, dto: UpdateMilestoneDto, actor: SessionUser) {
    const existing = await this.recordAccess.assertMilestoneAccess(actor, milestoneId);

    const ms = await this.prisma.engagementMilestone.update({
      where: { id: milestoneId },
      data: {
        status: dto.status,
        evidenceUrl: dto.evidenceUrl,
        ...(dto.status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
    });

    await this.logActivity(
      existing.engagementId,
      actor.id,
      'MILESTONE_UPDATED',
      `Updated milestone "${existing.title}": ${dto.status}`
    );
    return ms;
  }

  // ── Notes & Messages ───────────────────────────────────────────────────────

  async addNote(engagementId: string, dto: CreateNoteDto, author: SessionUser) {
    await this.recordAccess.assertEngagementAccess(author, engagementId);
    return this.prisma.workspaceNote.create({
      data: { engagementId, authorId: author.id, content: dto.content },
      include: { author: { select: { name: true, email: true } } }
    });
  }

  // ── Internal Helpers ───────────────────────────────────────────────────────

  private async logActivity(engagementId: string, actorId: string, actionType: string, description: string) {
    // If SYSTEM action, look up a platform admin to attach, or ideally have a nullable actorId or a System User
    // For MVP, if actorId is 'SYSTEM', we will try to find the first platform admin, else just skip or create a dummy hook.
    let actualActorId = actorId;
    if (actorId === 'SYSTEM') {
      const admin = await this.prisma.user.findFirst({
        where: { memberships: { some: { membershipRole: 'PLATFORM_ADMIN' } } },
      });
      actualActorId = admin ? admin.id : 'system_placeholder';
    }

    // Skip if system_placeholder doesn't exist to prevent FK failures
    const actorExists = await this.prisma.user.findUnique({ where: { id: actualActorId } });
    if (!actorExists) return;

    await this.prisma.activityLog.create({
      data: { engagementId, actorId: actualActorId, actionType, description },
    });
  }
}
