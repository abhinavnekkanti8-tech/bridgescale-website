import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  BudgetBand,
  CompensationMode,
  ContractStatus,
  EngagementCallStatus,
  EngagementIntentParty,
  EngagementIntentStatus,
  EngagementType,
  MembershipRole,
  MsaStatus,
  OperatorLane,
  OperatorTier,
  OperatorVerification,
  OrgType,
  PackageType,
  PreSowSummaryStatus,
  RetainerFlavour,
  ServiceTemplateCode,
  SowStatus,
  StartupStage,
  SalesMotion,
  TargetMarket,
  TaxFormStatus,
  TaxFormType,
  UserStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * DemoSeedService
 *
 * One-button end-to-end demo seeder for Phase 2 clickable testing. Creates a
 * predictable demo Startup user + Operator user and a single (Company, Operator)
 * pair carried through every stage of the engagement flow:
 *   call (REQUESTED) -> ACCEPTED -> intents recorded -> Pre-SOW SHARED ->
 *   Pre-SOW CONFIRMED -> MSA generated (PENDING_SIGNATURES, BridgeScale-signed) ->
 *   SOW + Contract generated (PENDING_SIGNATURES) -> Engagement workspace ACTIVE.
 *
 * Idempotent: re-running deletes the previous demo data and recreates it.
 */
@Injectable()
export class DemoSeedService {
  private readonly logger = new Logger(DemoSeedService.name);
  private readonly password = 'demo1234';
  private readonly startupEmail = 'demo-startup@bridgescale.test';
  private readonly operatorEmail = 'demo-operator@bridgescale.test';

  constructor(private readonly prisma: PrismaService) {}

  /** Demo credentials returned to the admin UI for clarity. */
  credentials() {
    return {
      startup: { email: this.startupEmail, password: this.password, dashboard: '/startup/dashboard' },
      operator: { email: this.operatorEmail, password: this.password, dashboard: '/operator/dashboard' },
    };
  }

  async seed() {
    await this.cleanup();
    const passwordHash = await bcrypt.hash(this.password, 10);

    // ── Users ───────────────────────────────────────────────────────────────
    const startupUser = await this.prisma.user.create({
      data: {
        name: 'Demo Startup CEO',
        email: this.startupEmail,
        passwordHash,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    });
    const operatorUser = await this.prisma.user.create({
      data: {
        name: 'Demo Operator',
        email: this.operatorEmail,
        passwordHash,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    });

    // ── Orgs + memberships ─────────────────────────────────────────────────
    const startupOrg = await this.prisma.organization.create({
      data: { name: 'Demo Startup Inc', orgType: OrgType.STARTUP, country: 'IN' },
    });
    const operatorOrg = await this.prisma.organization.create({
      data: { name: 'Demo Operator', orgType: OrgType.OPERATOR_ENTITY, country: 'US' },
    });
    await this.prisma.membership.create({
      data: { userId: startupUser.id, orgId: startupOrg.id, membershipRole: MembershipRole.STARTUP_ADMIN },
    });
    await this.prisma.membership.create({
      data: { userId: operatorUser.id, orgId: operatorOrg.id, membershipRole: MembershipRole.OPERATOR },
    });

    // ── Profiles ────────────────────────────────────────────────────────────
    const startupProfile = await this.prisma.startupProfile.create({
      data: {
        startupId: startupOrg.id,
        industry: 'B2B SaaS',
        stage: StartupStage.SERIES_A,
        targetMarkets: [TargetMarket.US, TargetMarket.REST_OF_WORLD],
        salesMotion: SalesMotion.OUTBOUND,
        budgetBand: BudgetBand.ABOVE_10K,
        executionOwner: 'Demo CEO',
        hasProductDemo: true,
        hasDeck: true,
        toolingReady: true,
        responsivenessCommit: true,
        additionalContext: 'Demo data for end-to-end testing.',
      },
    });
    const operatorProfile = await this.prisma.operatorProfile.create({
      data: {
        operatorId: operatorOrg.id,
        lanes: [OperatorLane.FRACTIONAL_RETAINER],
        regions: [TargetMarket.US, TargetMarket.REST_OF_WORLD],
        functions: ['Fractional VP Sales', 'GTM strategy'],
        experienceTags: ['SaaS', 'B2B', 'enterprise sales'],
        yearsExperience: 12,
        bio: 'Demo fractional sales leader for end-to-end testing.',
        verification: OperatorVerification.VERIFIED,
        tier: OperatorTier.TIER_A,
      },
    });

    // ── Tax profile (basic info on file → MSA-ready) ────────────────────────
    await this.prisma.operatorTaxProfile.create({
      data: {
        operatorProfileId: operatorProfile.id,
        formType: TaxFormType.W9,
        formStatus: TaxFormStatus.COLLECTED,
        taxResidencyCountry: 'US',
        payoutCountry: 'US',
        payoutCurrency: 'USD',
        individualOrEntity: 'INDIVIDUAL',
      },
    });

    // ── Shortlist + candidate ──────────────────────────────────────────────
    const shortlist = await this.prisma.matchShortlist.create({
      data: {
        startupProfileId: startupProfile.id,
        generatedBy: 'DEMO_SEED',
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
    await this.prisma.matchCandidate.create({
      data: {
        shortlistId: shortlist.id,
        operatorId: operatorProfile.id,
        matchScore: 88,
        scoreBreakdown: {
          laneAlignment: 18, regionOverlap: 14, budgetFit: 13, experienceRelevance: 13,
          availabilityMatch: 9, tierBonus: 14, motionFit: 7,
        },
        explanation: 'Strong fit on lane, region, and experience. Available within 2 weeks.',
        packageTier: PackageType.FRACTIONAL_RETAINER,
        weeklyFitHours: 18,
        status: 'INTERESTED',
        interest: 'ACCEPTED',
      },
    });

    // ── Engagement call (COMPLETED) ────────────────────────────────────────
    const call = await this.prisma.engagementCall.create({
      data: {
        startupProfileId: startupProfile.id,
        operatorId: operatorOrg.id,
        shortlistId: shortlist.id,
        requestedBy: startupUser.id,
        status: EngagementCallStatus.COMPLETED,
        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        meetingLink: 'https://meet.example.com/demo',
        notes: 'Initial 30-min discovery call. Both parties aligned on scope.',
        outcomeNotes: 'Mutual interest. Want to proceed with a 3-month leadership retainer.',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        respondedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });

    // ── Mutual engagement intents (both INTERESTED) ────────────────────────
    await this.prisma.engagementIntent.create({
      data: {
        callId: call.id,
        startupProfileId: startupProfile.id,
        operatorId: operatorOrg.id,
        party: EngagementIntentParty.STARTUP,
        status: EngagementIntentStatus.INTERESTED,
      },
    });
    await this.prisma.engagementIntent.create({
      data: {
        callId: call.id,
        startupProfileId: startupProfile.id,
        operatorId: operatorOrg.id,
        party: EngagementIntentParty.OPERATOR,
        status: EngagementIntentStatus.INTERESTED,
      },
    });

    // ── Pre-SOW Commercial Summary (SHARED, awaiting confirmation) ─────────
    await this.prisma.preSowCommercialSummary.create({
      data: {
        callId: call.id,
        startupProfileId: startupProfile.id,
        operatorId: operatorOrg.id,
        serviceTemplate: ServiceTemplateCode.GTM_STRATEGY,
        engagementType: EngagementType.RETAINER,
        retainerFlavour: RetainerFlavour.LEADERSHIP,
        compensationMode: CompensationMode.CASH,
        indicativePrice: 10000,
        currency: 'USD',
        weeklyHours: 18,
        durationDays: 90,
        specialTerms: 'First milestone deliverable: US ICP definition + outbound sequence library.',
        status: PreSowSummaryStatus.SHARED,
      },
    });

    // ── MSA (PENDING_SIGNATURES, BridgeScale pre-signed) ───────────────────
    const msa = await this.prisma.masterServiceAgreement.create({
      data: {
        startupProfileId: startupProfile.id,
        operatorId: operatorOrg.id,
        status: MsaStatus.PENDING_SIGNATURES,
        platformSignedAt: new Date(),
        platformSignatureId: 'platform-sig-demo',
        documentUrl: '/legal/msa-sample.pdf',
      },
    });

    // ── SOW + Contract + Engagement (active engagement workspace) ──────────
    const sow = await this.prisma.statementOfWork.create({
      data: {
        shortlistId: shortlist.id,
        startupProfileId: startupProfile.id,
        operatorId: operatorOrg.id,
        masterAgreementId: msa.id,
        packageType: PackageType.FRACTIONAL_RETAINER,
        serviceTemplate: ServiceTemplateCode.GTM_STRATEGY,
        engagementType: EngagementType.RETAINER,
        retainerFlavour: RetainerFlavour.LEADERSHIP,
        title: 'GTM Strategy + US Sales Leadership (90-day retainer)',
        scope: 'Embedded fractional VP Sales for 18 hrs/week. Owns US GTM strategy, ICP refinement, outbound playbook, first 5 enterprise opportunities.',
        deliverables: 'Week 1-2: ICP + positioning. Week 3-6: outbound sequences live. Week 7-12: first 30 qualified meetings, 5 active enterprise opportunities, hiring plan for permanent VP.',
        timeline: '90 days, starting next Monday.',
        weeklyHours: 18,
        totalPriceUsd: 30000,
        nonCircumvention: true,
        status: SowStatus.APPROVED,
      },
    });

    const contract = await this.prisma.contract.create({
      data: {
        sowId: sow.id,
        status: ContractStatus.PENDING_SIGNATURES,
      },
    });

    // Active engagement workspace with milestones + a workspace note
    const engagement = await this.prisma.engagement.create({
      data: {
        contractId: contract.id,
        startupId: startupProfile.id,
        operatorId: operatorProfile.id,
        status: 'ACTIVE',
        startDate: new Date(),
        healthScore: 85,
      },
    });
    await this.prisma.engagementMilestone.createMany({
      data: [
        { engagementId: engagement.id, title: 'ICP + positioning lock', description: 'Define ICP, positioning statement, and message-market fit hypotheses.', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), status: 'IN_PROGRESS' },
        { engagementId: engagement.id, title: 'Outbound sequences live', description: 'Cadences, templates, and lead lists ready in Apollo.', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), status: 'PENDING' },
        { engagementId: engagement.id, title: 'First 30 qualified meetings', description: 'Pipeline KPI for end of month 2.', dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), status: 'PENDING' },
      ],
    });
    await this.prisma.workspaceNote.create({
      data: {
        engagementId: engagement.id,
        authorId: operatorUser.id,
        content: 'Kicked off this morning. ICP draft v0 going out tomorrow for review.',
      },
    });
    await this.prisma.activityLog.create({
      data: {
        engagementId: engagement.id,
        actorId: operatorUser.id,
        actionType: 'ENGAGEMENT_STARTED',
        description: 'Demo engagement seeded for end-to-end testing.',
      },
    });

    this.logger.log(`Demo seeded: 1 startup user, 1 operator user, 1 active engagement.`);
    return {
      ...this.credentials(),
      seeded: {
        startupOrgId: startupOrg.id,
        operatorOrgId: operatorOrg.id,
        startupProfileId: startupProfile.id,
        operatorProfileId: operatorProfile.id,
        shortlistId: shortlist.id,
        callId: call.id,
        msaId: msa.id,
        sowId: sow.id,
        contractId: contract.id,
        engagementId: engagement.id,
      },
    };
  }

  /** Wipes all rows tied to the demo users + orgs. Cascades clean up children. */
  async cleanup() {
    const users = await this.prisma.user.findMany({
      where: { email: { in: [this.startupEmail, this.operatorEmail] } },
      select: { id: true, memberships: { select: { orgId: true } } },
    });
    if (users.length === 0) return { deleted: 0 };
    const orgIds = users.flatMap((u) => u.memberships.map((m) => m.orgId));
    // Delete orgs (cascades to profiles, calls, intents, summaries, MSA, SOWs, contracts, engagements).
    if (orgIds.length > 0) {
      await this.prisma.organization.deleteMany({ where: { id: { in: orgIds } } });
    }
    await this.prisma.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
    this.logger.log(`Demo cleanup: removed ${users.length} users + ${orgIds.length} orgs.`);
    return { deleted: users.length };
  }
}
