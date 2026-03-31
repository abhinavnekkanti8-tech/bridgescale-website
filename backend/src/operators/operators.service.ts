import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateOperatorProfileDto } from './dto/create-operator-profile.dto';
import { UpdateOperatorProfileDto } from './dto/update-operator-profile.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { SessionUser } from '../common/types/session.types';
import { MembershipRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ── Supply Quality Scoring (7 components) ──────────────────────────────────
export interface SupplyScoreBreakdown {
  domainExpertise: number;       // max 20
  regionExperience: number;      // max 15
  referencesVerified: number;    // max 15
  trackRecord: number;           // max 15
  platformFit: number;           // max 15
  availability: number;          // max 10
  responsiveness: number;        // max 10
}

export interface SupplyScoreOutput {
  componentScores: SupplyScoreBreakdown;
  totalScore: number;
  blockers: string[];
  recommendation: string;
  tier: 'TIER_A' | 'TIER_B' | 'TIER_C';
}

@Injectable()
export class OperatorsService {
  private readonly logger = new Logger(OperatorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  // ── Invite workflow ───────────────────────────────────────────────────────

  async createInvite(dto: CreateInviteDto) {
    // Check no duplicate pending invite
    const existing = await this.prisma.inviteToken.findFirst({
      where: { email: dto.email, status: 'SENT' },
    });
    if (existing) throw new ConflictException('An active invite already exists for this email.');

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await this.prisma.inviteToken.create({
      data: {
        email: dto.email,
        token,
        role: dto.role,
        orgName: dto.orgName,
        expiresAt,
      },
    });

    // In production: send email with invite link. For MVP, return token directly.
    this.logger.log(`Invite created for ${dto.email}. Token: ${token}`);
    return { ...invite, inviteUrl: `/auth/register?token=${token}` };
  }

  async acceptInvite(token: string, name: string, password: string) {
    const invite = await this.prisma.inviteToken.findUnique({ where: { token } });
    if (!invite) throw new NotFoundException('Invalid invite token.');
    if (invite.status !== 'SENT') throw new ConflictException('Invite already used or revoked.');
    if (invite.expiresAt < new Date()) throw new ConflictException('Invite has expired.');

    const passwordHash = hashPassword(password);

    // Create org + user + membership in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: invite.orgName || `${name}'s Organization`, orgType: 'OPERATOR_ENTITY' },
      });

      const user = await tx.user.create({
        data: { name, email: invite.email, passwordHash },
      });

      await tx.membership.create({
        data: { userId: user.id, orgId: org.id, membershipRole: invite.role, status: 'ACTIVE' },
      });

      await tx.inviteToken.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } });

      return { userId: user.id, orgId: org.id, email: user.email };
    });

    return result;
  }

  async listInvites() {
    return this.prisma.inviteToken.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async revokeInvite(inviteId: string) {
    return this.prisma.inviteToken.update({
      where: { id: inviteId },
      data: { status: 'REVOKED' },
    });
  }

  // ── Profile CRUD ──────────────────────────────────────────────────────────

  async createProfile(orgId: string, dto: CreateOperatorProfileDto) {
    const existing = await this.prisma.operatorProfile.findUnique({ where: { operatorId: orgId } });
    if (existing) return this.updateProfile(existing.id, orgId, dto);

    return this.prisma.operatorProfile.create({
      data: {
        operatorId: orgId,
        lanes: dto.lanes,
        regions: dto.regions,
        functions: dto.functions,
        experienceTags: dto.experienceTags ?? [],
        yearsExperience: dto.yearsExperience,
        linkedIn: dto.linkedIn,
        references: dto.references as object ?? undefined,
        availability: dto.availability,
        bio: dto.bio,
      },
    });
  }

  async updateProfile(profileId: string, orgId: string, dto: UpdateOperatorProfileDto) {
    const profile = await this.findOne(profileId);
    if (profile.operatorId !== orgId) throw new ForbiddenException('You do not own this profile.');
    return this.prisma.operatorProfile.update({
      where: { id: profileId },
      data: { ...dto, references: dto.references as object ?? undefined },
    });
  }

  async findOne(profileId: string) {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { id: profileId },
      include: { scores: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!profile) throw new NotFoundException('Operator profile not found.');
    return profile;
  }

  async findByOrgId(orgId: string) {
    return this.prisma.operatorProfile.findUnique({
      where: { operatorId: orgId },
      include: { scores: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
  }

  async findAll() {
    return this.prisma.operatorProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        operator: { select: { id: true, name: true, country: true } },
        scores: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  // ── Quality Scoring ───────────────────────────────────────────────────────

  async requestScore(profileId: string) {
    const profile = await this.findOne(profileId);
    this.runScoringJob(profile).catch((err: unknown) => {
      this.logger.error(`Quality scoring failed for ${profileId}:`, err);
    });
    return { status: 'scoring_queued', profileId };
  }

  private async runScoringJob(profile: { id: string; [key: string]: unknown }) {
    this.logger.log(`Starting quality scoring for operator ${profile.id}`);

    // Build mock score (same pattern as AiService — uses dummy key detection)
    const scoreOutput = this.buildMockSupplyScore(profile);

    await this.prisma.supplyQualityScore.create({
      data: {
        profileId: profile.id,
        scoreTotal: scoreOutput.totalScore,
        scoreBreakdown: scoreOutput.componentScores as any,
        blockers: scoreOutput.blockers,
        recommendation: scoreOutput.recommendation,
        tier: scoreOutput.tier,
        generatedBy: 'AI',
        promptVersion: 'supply_quality_v1.0',
        modelName: this.aiService.getModelName(),
        temperature: this.aiService.getTemperature(),
      },
    });

    // Auto-update tier on profile
    await this.prisma.operatorProfile.update({
      where: { id: profile.id },
      data: { tier: scoreOutput.tier },
    });

    this.logger.log(`Scored operator ${profile.id}: ${scoreOutput.totalScore}/100 (${scoreOutput.tier})`);
  }

  private buildMockSupplyScore(profile: Record<string, unknown>): SupplyScoreOutput {
    const hasRefs = Boolean(profile.references);
    const years = (profile.yearsExperience as number) ?? 0;
    const lanes = (profile.lanes as string[]) ?? [];
    const bio = profile.bio as string ?? '';

    const domainExpertise = Math.min(20, years * 3 + 5);
    const regionExperience = 12;
    const referencesVerified = hasRefs ? 13 : 5;
    const trackRecord = Math.min(15, years * 2 + 3);
    const platformFit = lanes.length >= 2 ? 13 : 9;
    const availability = 8;
    const responsiveness = bio.length > 50 ? 9 : 6;

    const totalScore = domainExpertise + regionExperience + referencesVerified + trackRecord + platformFit + availability + responsiveness;
    const tier = totalScore >= 80 ? 'TIER_A' as const : totalScore >= 65 ? 'TIER_B' as const : 'TIER_C' as const;

    const blockers: string[] = [];
    if (!hasRefs) blockers.push('No verified references — provide at least 2 professional references.');
    if (years < 3) blockers.push('Limited experience — operators with 3+ years receive higher tier scores.');

    return {
      componentScores: { domainExpertise, regionExperience, referencesVerified, trackRecord, platformFit, availability, responsiveness },
      totalScore,
      blockers,
      recommendation: `Score: ${totalScore}/100 (${tier.replace('_', ' ')}). ${tier === 'TIER_C' ? 'Resolve blockers to improve tier.' : 'Eligible for matching.'}`,
      tier,
    };
  }

  // ── Verification & Override ───────────────────────────────────────────────

  async verifyOperator(profileId: string, action: 'VERIFIED' | 'REJECTED') {
    return this.prisma.operatorProfile.update({
      where: { id: profileId },
      data: { verification: action },
    });
  }

  async overrideScore(
    scoreId: string,
    admin: SessionUser,
    data: { scoreTotal: number; overrideReason: string },
  ) {
    if (admin.role !== MembershipRole.PLATFORM_ADMIN) {
      throw new ForbiddenException('Only Platform Admins can override scores.');
    }
    const tier = data.scoreTotal >= 80 ? 'TIER_A' : data.scoreTotal >= 65 ? 'TIER_B' : 'TIER_C';
    return this.prisma.supplyQualityScore.update({
      where: { id: scoreId },
      data: {
        scoreTotal: data.scoreTotal,
        overrideReason: data.overrideReason,
        adminOverride: true,
        generatedBy: `ADMIN:${admin.id}`,
        tier: tier as 'TIER_A' | 'TIER_B' | 'TIER_C',
      },
    });
  }

  async getScores(profileId: string) {
    return this.prisma.supplyQualityScore.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
