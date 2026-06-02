import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EngagementIntentParty, EngagementIntentStatus, MembershipRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SessionUser } from '../common/types/session.types';
import {
  CallOutcomeDto,
  ConfirmPreSowSummaryDto,
  CreatePreSowSummaryDto,
  EngagementIntentDto,
  RequestCallDto,
  RespondToCallDto,
} from './dto/core-flow.dto';

@Injectable()
export class CoreFlowService {
  constructor(private readonly prisma: PrismaService) {}

  async requestCall(requestedBy: string, dto: RequestCallDto) {
    await this.ensureStartupAndOperator(dto.startupProfileId, dto.operatorId);

    return this.prisma.engagementCall.create({
      data: {
        startupProfileId: dto.startupProfileId,
        operatorId: dto.operatorId,
        shortlistId: dto.shortlistId,
        candidateId: dto.candidateId,
        requestedBy,
        proposedAt: dto.proposedAt ? new Date(dto.proposedAt) : undefined,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        meetingLink: dto.meetingLink,
        notes: dto.notes,
      },
    });
  }

  async respondToCall(callId: string, dto: RespondToCallDto) {
    await this.getCallOrThrow(callId);

    return this.prisma.engagementCall.update({
      where: { id: callId },
      data: {
        status: dto.status,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        meetingLink: dto.meetingLink,
        notes: dto.notes,
        respondedAt: new Date(),
      },
    });
  }

  async recordCallOutcome(callId: string, dto: CallOutcomeDto) {
    await this.getCallOrThrow(callId);

    return this.prisma.engagementCall.update({
      where: { id: callId },
      data: {
        status: 'COMPLETED',
        outcomeNotes: dto.outcomeNotes,
        completedAt: new Date(),
      },
    });
  }

  async recordIntent(dto: EngagementIntentDto) {
    const call = await this.getCallOrThrow(dto.callId);
    if (call.status !== 'ACCEPTED' && call.status !== 'COMPLETED') {
      throw new BadRequestException('Call must be accepted or completed before recording engagement intent.');
    }

    return this.prisma.engagementIntent.upsert({
      where: { callId_party: { callId: dto.callId, party: dto.party } },
      update: { status: dto.status, notes: dto.notes },
      create: {
        callId: dto.callId,
        startupProfileId: call.startupProfileId,
        operatorId: call.operatorId,
        party: dto.party,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  async createPreSowSummary(dto: CreatePreSowSummaryDto) {
    const call = await this.getCallOrThrow(dto.callId);
    await this.assertMutualIntent(dto.callId);

    const template = await this.prisma.serviceTemplate.findUnique({
      where: { code: dto.serviceTemplate },
    });
    if (!template) throw new NotFoundException('Service template not found.');

    return this.prisma.preSowCommercialSummary.create({
      data: {
        callId: call.id,
        startupProfileId: call.startupProfileId,
        operatorId: call.operatorId,
        serviceTemplate: dto.serviceTemplate,
        engagementType: dto.engagementType,
        retainerFlavour: dto.retainerFlavour,
        compensationMode: dto.compensationMode ?? 'CASH',
        indicativePrice: dto.indicativePrice,
        currency: dto.currency ?? 'USD',
        weeklyHours: dto.weeklyHours,
        durationDays: dto.durationDays,
        specialTerms: dto.specialTerms,
        cancellationNote: dto.cancellationNote,
        status: 'SHARED',
      },
    });
  }

  async confirmPreSowSummary(summaryId: string, dto: ConfirmPreSowSummaryDto) {
    const summary = await this.prisma.preSowCommercialSummary.findUnique({
      where: { id: summaryId },
    });
    if (!summary) throw new NotFoundException('Pre-SOW Commercial Summary not found.');

    const data =
      dto.party === EngagementIntentParty.STARTUP
        ? { startupConfirmedAt: new Date() }
        : { operatorConfirmedAt: new Date() };

    const updated = await this.prisma.preSowCommercialSummary.update({
      where: { id: summaryId },
      data,
    });

    if (updated.startupConfirmedAt && updated.operatorConfirmedAt && updated.status !== 'CONFIRMED') {
      return this.prisma.preSowCommercialSummary.update({
        where: { id: summaryId },
        data: { status: 'CONFIRMED' },
      });
    }

    return updated;
  }

  /**
   * Lists engagement calls visible to the current user.
   * STARTUP_ADMIN sees calls for their startup profile; OPERATOR sees calls
   * scheduled with them; PLATFORM_ADMIN sees everything.
   * Each call carries its intents so the UI can show whether mutual interest is recorded.
   */
  async listCallsForUser(user: SessionUser) {
    const where: Record<string, unknown> = {};
    if (user.role === MembershipRole.STARTUP_ADMIN) {
      const startup = await this.prisma.startupProfile.findFirst({
        where: { startupId: user.orgId },
        select: { id: true },
      });
      if (!startup) return [];
      where.startupProfileId = startup.id;
    } else if (user.role === MembershipRole.OPERATOR) {
      where.operatorId = user.orgId;
    }
    return this.prisma.engagementCall.findMany({
      where,
      include: {
        intents: true,
        startup: { select: { id: true, industry: true } },
        operator: { select: { id: true, operatorId: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getCallWithIntents(callId: string) {
    const call = await this.prisma.engagementCall.findUnique({
      where: { id: callId },
      include: { intents: true },
    });
    if (!call) throw new NotFoundException('Engagement call not found.');
    return call;
  }

  async getSummary(summaryId: string) {
    const summary = await this.prisma.preSowCommercialSummary.findUnique({
      where: { id: summaryId },
      include: { call: true },
    });
    if (!summary) throw new NotFoundException('Pre-SOW Commercial Summary not found.');
    return summary;
  }


  /**
   * Records a deferral request on a call. Resets call status to REQUESTED with
   * the new proposed time so the other party re-accepts. Logs the reason in
   * notes (appended) so both sides see context.
   */
  async deferCall(callId: string, newProposedAt: string, reason?: string) {
    const call = await this.getCallOrThrow(callId);
    const reasonLine = reason ? `[Deferred ${new Date().toISOString()}] ${reason}` : '';
    const newNotes = [call.notes, reasonLine].filter(Boolean).join('\n');
    return this.prisma.engagementCall.update({
      where: { id: callId },
      data: {
        status: 'REQUESTED',
        proposedAt: new Date(newProposedAt),
        scheduledAt: null,
        respondedAt: null,
        notes: newNotes || undefined,
      },
    });
  }

  /**
   * Returns the operator's cancellation/no-show strike count over a rolling
   * 90-day window. Today this counts CancellationEvent rows linked to the
   * operator's SOWs (party=OPERATOR). When call-level cancellation tracking
   * lands, this method should also count CallCancelEvent rows. Threshold and
   * pause flag mirror the public policy on the operator dashboard.
   */
  async getStrikesForOperator(operatorOrgId: string) {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { operatorId: operatorOrgId },
      select: { id: true, operatorId: true },
    });
    if (!profile) return { lateCancels: 0, noShows: 0, total: 0, windowDays: 90, threshold: 3, pausedAtRisk: false, paused: false };

    const since = new Date();
    since.setDate(since.getDate() - 90);

    const events = await this.prisma.cancellationEvent.findMany({
      where: {
        party: 'OPERATOR',
        createdAt: { gte: since },
        sow: { operatorId: profile.operatorId },
      },
      select: { reason: true },
    });

    let noShows = 0;
    let lateCancels = 0;
    for (const e of events) {
      const r = (e.reason ?? '').toLowerCase();
      if (r.includes('no-show') || r.includes('no show') || r.includes('noshow')) noShows += 1;
      else lateCancels += 1;
    }
    const total = noShows + lateCancels;
    return {
      lateCancels,
      noShows,
      total,
      windowDays: 90,
      threshold: 3,
      pausedAtRisk: noShows >= 2 || total >= 2,
      paused: noShows >= 3 || total >= 3,
    };
  }

  private async ensureStartupAndOperator(startupProfileId: string, operatorId: string) {
    const [startup, operator] = await Promise.all([
      this.prisma.startupProfile.findUnique({ where: { id: startupProfileId } }),
      this.prisma.operatorProfile.findUnique({ where: { operatorId } }),
    ]);
    if (!startup) throw new NotFoundException('Startup profile not found.');
    if (!operator) throw new NotFoundException('Operator profile not found.');
  }

  private async getCallOrThrow(callId: string) {
    const call = await this.prisma.engagementCall.findUnique({
      where: { id: callId },
    });
    if (!call) throw new NotFoundException('Engagement call not found.');
    return call;
  }

  private async assertMutualIntent(callId: string) {
    const intents = await this.prisma.engagementIntent.findMany({
      where: { callId },
    });
    const startupIntent = intents.find((intent) => intent.party === EngagementIntentParty.STARTUP);
    const operatorIntent = intents.find((intent) => intent.party === EngagementIntentParty.OPERATOR);

    if (
      startupIntent?.status !== EngagementIntentStatus.INTERESTED ||
      operatorIntent?.status !== EngagementIntentStatus.INTERESTED
    ) {
      throw new BadRequestException('Both parties must indicate engagement intent before creating a Pre-SOW Summary.');
    }
  }
}
