import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateStartupProfileDto } from './dto/create-startup-profile.dto';
import { UpdateStartupProfileDto } from './dto/update-startup-profile.dto';
import { SessionUser } from '../common/types/session.types';
import { MembershipRole } from '@prisma/client';

@Injectable()
export class StartupsService {
  private readonly logger = new Logger(StartupsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  // ── Profile CRUD ──────────────────────────────────────────────────────────

  async create(orgId: string, dto: CreateStartupProfileDto) {
    // Ensure no duplicate profile for this org
    const existing = await this.prisma.startupProfile.findUnique({ where: { startupId: orgId } });
    if (existing) {
      return this.update(existing.id, orgId, dto);
    }

    return this.prisma.startupProfile.create({
      data: {
        startupId: orgId,
        industry: dto.industry,
        stage: dto.stage,
        targetMarkets: dto.targetMarkets,
        salesMotion: dto.salesMotion,
        budgetBand: dto.budgetBand,
        executionOwner: dto.executionOwner,
        hasProductDemo: dto.hasProductDemo ?? false,
        hasDeck: dto.hasDeck ?? false,
        toolingReady: dto.toolingReady ?? false,
        responsivenessCommit: dto.responsivenessCommit ?? false,
        additionalContext: dto.additionalContext,
        status: 'SUBMITTED',
      },
    });
  }

  async update(profileId: string, orgId: string, dto: UpdateStartupProfileDto) {
    const profile = await this.findOne(profileId);
    if (profile.startupId !== orgId) {
      throw new ForbiddenException('You do not own this profile.');
    }
    return this.prisma.startupProfile.update({
      where: { id: profileId },
      data: { ...dto },
    });
  }

  async findOne(profileId: string) {
    const profile = await this.prisma.startupProfile.findUnique({
      where: { id: profileId },
      include: { scores: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!profile) throw new NotFoundException('Startup profile not found.');
    return profile;
  }

  async findByOrgId(orgId: string) {
    return this.prisma.startupProfile.findUnique({
      where: { startupId: orgId },
      include: { scores: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
  }

  async findAll() {
    return this.prisma.startupProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        startup: { select: { id: true, name: true, country: true } },
        scores: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  // ── Scoring ───────────────────────────────────────────────────────────────

  async getScores(profileId: string) {
    return this.prisma.demandReadinessScore.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Trigger async AI scoring. Returns immediately with status = 'scoring_queued'.
   * Score is persisted in the background; frontend polls GET /startups/:id/scores.
   */
  async requestScore(profileId: string) {
    const profile = await this.findOne(profileId);

    // Fire and forget — score asynchronously
    this.runScoringJob(profile).catch((err: unknown) => {
      this.logger.error(`Scoring job failed for profile ${profileId}:`, err);
    });

    return { status: 'scoring_queued', profileId };
  }

  private async runScoringJob(profile: { id: string;[key: string]: unknown }) {
    this.logger.log(`Starting readiness scoring for profile ${profile.id}`);

    const scoreOutput = await this.aiService.scoreStartupReadiness(profile as Record<string, unknown>);

    await this.prisma.demandReadinessScore.create({
      data: {
        profileId: profile.id,
        scoreTotal: scoreOutput.totalScore,
        scoreBreakdown: scoreOutput.componentScores as any,
        blockers: scoreOutput.blockers,
        recommendation: scoreOutput.recommendation,
        eligibility: scoreOutput.eligibility,
        generatedBy: 'AI',
        promptVersion: this.aiService.getPromptVersion(),
        modelName: this.aiService.getModelName(),
        temperature: this.aiService.getTemperature(),
      },
    });

    this.logger.log(`Scored profile ${profile.id}: ${scoreOutput.totalScore}/100 (${scoreOutput.eligibility})`);
  }

  // ── Admin Score Override ──────────────────────────────────────────────────

  async overrideScore(
    scoreId: string,
    admin: SessionUser,
    overrideData: { scoreTotal: number; overrideReason: string },
  ) {
    if (admin.role !== MembershipRole.PLATFORM_ADMIN) {
      throw new ForbiddenException('Only Platform Admins can override scores.');
    }

    return this.prisma.demandReadinessScore.update({
      where: { id: scoreId },
      data: {
        scoreTotal: overrideData.scoreTotal,
        overrideReason: overrideData.overrideReason,
        adminOverride: true,
        generatedBy: `ADMIN:${admin.id}`,
        // Recalculate eligibility from the overridden score
        eligibility:
          overrideData.scoreTotal >= 75 ? 'SPRINT_AND_RETAINER' :
          overrideData.scoreTotal >= 60 ? 'SPRINT_ONLY' : 'INELIGIBLE',
      },
    });
  }
}
