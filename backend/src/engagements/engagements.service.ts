import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateEngagementStatusDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  CreateNoteDto,
} from './dto/engagements.dto';

@Injectable()
export class EngagementsService {
  private readonly logger = new Logger(EngagementsService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  async getEngagement(id: string) {
    const eng = await this.prisma.engagement.findUnique({
      where: { id },
      include: {
        startup: { select: { industry: true } },
        contract: { select: { sow: { select: { title: true, deliverables: true, scope: true } } } },
      },
    });
    if (!eng) throw new NotFoundException('Engagement not found.');
    return eng;
  }

  async getWorkspaceData(engagementId: string) {
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

  async findByStartup(startupId: string) {
    return this.prisma.engagement.findMany({
      where: { startupId },
      include: { contract: { select: { sow: { select: { title: true } } } } },
    });
  }

  async findByOperator(operatorId: string) {
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

  // ── Milestones ─────────────────────────────────────────────────────────────

  async createMilestone(engagementId: string, dto: CreateMilestoneDto, actorId: string) {
    const ms = await this.prisma.engagementMilestone.create({
      data: {
        engagementId,
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
      },
    });
    await this.logActivity(engagementId, actorId, 'MILESTONE_ADDED', `Added milestone: ${dto.title}`);
    return ms;
  }

  async updateMilestone(milestoneId: string, dto: UpdateMilestoneDto, actorId: string) {
    const existing = await this.prisma.engagementMilestone.findUnique({ where: { id: milestoneId } });
    if (!existing) throw new NotFoundException('Milestone not found');

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
      actorId,
      'MILESTONE_UPDATED',
      `Updated milestone "${existing.title}": ${dto.status}`
    );
    return ms;
  }

  // ── Notes & Messages ───────────────────────────────────────────────────────

  async addNote(engagementId: string, dto: CreateNoteDto, authorId: string) {
    return this.prisma.workspaceNote.create({
      data: { engagementId, authorId, content: dto.content },
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
