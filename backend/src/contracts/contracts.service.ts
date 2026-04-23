import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import {
  GenerateSowDto,
  GenerateEquitySowDto,
  EditSowDto,
  SignContractDto,
  RecordVestingDto,
  SetEquityDocRefDto,
  EquityEventDto,
  EquityTypeDto,
} from './dto/contracts.dto';

// ── Equity review auto-trigger thresholds ─────────────────────────────────────
// If either threshold is exceeded the platform flags admin review as mandatory.
const EQUITY_REVIEW_FAST_THRESHOLD_USD_CENTS = 5_000_000; // $50,000 notional
const EQUITY_REVIEW_PCT_THRESHOLD = 2.0;                  // 2% direct equity

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly config: ConfigService,
  ) {}

  // ── Helpers ───────────────────────────────────────────────────────────────

  private get isDummyMode(): boolean {
    return this.config.get<string>('DUMMY_PAYMENT_MODE', 'false') === 'true';
  }

  // ── Standard AI-Native SoW Generation ────────────────────────────────────

  async generateSow(dto: GenerateSowDto) {
    const template = this.getSowTemplate(dto.packageType);

    const sow = await this.prisma.statementOfWork.create({
      data: {
        shortlistId: dto.shortlistId,
        startupProfileId: dto.startupProfileId,
        operatorId: dto.operatorId,
        packageType: dto.packageType as any,
        title: template.title,
        scope: template.scope,
        deliverables: template.deliverables,
        timeline: template.timeline,
        weeklyHours: template.weeklyHours,
        totalPriceUsd: template.totalPriceUsd,
        nonCircumvention: true,
        promptVersion: 'sow_gen_v1.0',
        modelName: this.aiService.getModelName(),
      },
    });

    await this.prisma.sowVersion.create({
      data: {
        sowId: sow.id,
        version: 1,
        content: {
          title: sow.title,
          scope: sow.scope,
          deliverables: sow.deliverables,
          timeline: sow.timeline,
          weeklyHours: sow.weeklyHours,
          totalPriceUsd: sow.totalPriceUsd,
        },
        changedBy: 'SYSTEM',
        changeNote: 'AI-generated initial draft',
      },
    });

    this.logger.log(`SoW ${sow.id} generated for package ${dto.packageType}`);
    return sow;
  }

  private getSowTemplate(packageType: string): {
    title: string;
    scope: string;
    deliverables: string;
    timeline: string;
    weeklyHours: number;
    totalPriceUsd: number;
  } {
    const templates: Record<string, { title: string; scope: string; deliverables: string; timeline: string; weeklyHours: number; totalPriceUsd: number }> = {
      PIPELINE_SPRINT: {
        title: 'Pipeline Sprint — Statement of Work',
        scope: 'Structured 8-week outbound sales campaign targeting ICP-aligned prospects in designated diaspora markets. Operator executes weekly outreach sequences, manages pipeline, and delivers weekly progress reports. All activities conducted through the Antigravity platform.',
        deliverables: '• ICP Targeting & List Build (Week 1–2)\n• Outreach Sequence Design & Launch (Week 2–3)\n• Weekly Pipeline Reports with qualified lead handoffs\n• 4× Pipeline Review Calls (Bi-weekly)\n• Final Campaign Report with recommendations',
        timeline: 'Week 1–2: Setup & ICP | Week 3–6: Execution | Week 7–8: Handoff & Review',
        weeklyHours: 15,
        totalPriceUsd: 5000,
      },
      BD_SPRINT: {
        title: 'BD Sprint — Statement of Work',
        scope: 'Structured 8-week business development sprint focused on partnership and channel activation in designated markets. Operator maps channel landscape, initiates alliance outreach, and manages partnership deal flow through the Antigravity platform.',
        deliverables: '• Channel Landscape Mapping (Week 1–2)\n• Alliance Outreach Campaign (Week 2–6)\n• Partnership Term Sheet Drafts\n• 4× BD Review Calls (Bi-weekly)\n• Final Partnership Pipeline Report',
        timeline: 'Week 1–2: Mapping | Week 3–6: Outreach | Week 7–8: Deal Flow & Handoff',
        weeklyHours: 15,
        totalPriceUsd: 6000,
      },
      FRACTIONAL_RETAINER: {
        title: 'Fractional Sales Leadership Retainer — Statement of Work',
        scope: 'Ongoing fractional sales leadership engagement. Operator provides strategic direction, team coaching, pipeline management, process optimization, and quarterly business reviews. All activities logged and tracked through the Antigravity platform.',
        deliverables: '• Sales Strategy & Process Design (Month 1)\n• Weekly Team Coaching Sessions\n• Monthly Pipeline & Forecast Reports\n• Quarterly Business Reviews (QBR)\n• Ongoing CRM Hygiene & Optimization',
        timeline: '12-week initial term, renewable quarterly upon mutual agreement.',
        weeklyHours: 20,
        totalPriceUsd: 15000,
      },
      HYBRID_EQUITY: {
        title: 'Hybrid Fractional Engagement (Cash + FAST) — Statement of Work',
        scope: 'Six-month hybrid fractional leadership engagement combining a monthly cash retainer with a FAST equity component. Operator leads commercial expansion, pipeline development, and strategic partnership initiatives in designated target markets, with compensation structured to align long-term incentives.',
        deliverables: '• GTM Strategy & Market Entry Plan (Month 1)\n• Monthly Pipeline & Revenue Reports\n• Quarterly Board / Founders Review\n• KPI-Linked Milestone Submissions (per equity schedule)\n• Final Engagement Report & Handoff Package',
        timeline: '6-month initial term. Equity vests per agreed schedule. Cash invoiced monthly.',
        weeklyHours: 20,
        totalPriceUsd: 0, // Cash set via equityCashComponentUsd; equity via fastValueUsd/equityPct
      },
    };
    return templates[packageType] ?? templates.PIPELINE_SPRINT;
  }

  // ── Equity SOW Generation ─────────────────────────────────────────────────

  /**
   * Generate a HYBRID_EQUITY SOW with equity terms baked in.
   * Auto-flags equityReviewRequired when FAST notional > $50k or direct equity > 2%.
   * The SOW cannot be approved until both parties have acknowledged legal risk
   * and (if flagged) admin has signed off on equity review.
   */
  async generateEquitySow(dto: GenerateEquitySowDto) {
    // Cross-field validation: FAST needs fastValueUsd, DIRECT needs equityPct
    if (dto.equityType === EquityTypeDto.FAST && !dto.fastValueUsd) {
      throw new BadRequestException(
        'fastValueUsd is required for FAST equity type.',
      );
    }
    if (dto.equityType === EquityTypeDto.DIRECT && dto.equityPct == null) {
      throw new BadRequestException(
        'equityPct is required for DIRECT equity type.',
      );
    }

    // Auto-determine whether admin review is required
    const reviewRequired =
      (dto.equityType === EquityTypeDto.FAST &&
        dto.fastValueUsd != null &&
        dto.fastValueUsd > EQUITY_REVIEW_FAST_THRESHOLD_USD_CENTS) ||
      (dto.equityType === EquityTypeDto.DIRECT &&
        dto.equityPct != null &&
        dto.equityPct > EQUITY_REVIEW_PCT_THRESHOLD);

    const template = this.getSowTemplate('HYBRID_EQUITY');

    const sow = await this.prisma.statementOfWork.create({
      data: {
        shortlistId: dto.shortlistId,
        startupProfileId: dto.startupProfileId,
        operatorId: dto.operatorId,
        packageType: 'HYBRID_EQUITY' as any,
        title: template.title,
        scope: template.scope,
        deliverables: template.deliverables,
        timeline: template.timeline,
        weeklyHours: dto.weeklyHours,
        totalPriceUsd: dto.totalCashUsd,
        nonCircumvention: true,
        // Equity terms
        equityCashComponentUsd: dto.equityCashComponentUsd,
        equityType: dto.equityType as any,
        equityPct: dto.equityPct ?? null,
        fastValueUsd: dto.fastValueUsd ?? null,
        vestingSchedule: dto.vestingSchedule,
        equityCliffMonths: dto.equityCliffMonths ?? 6,
        equityVestingMonths: dto.equityVestingMonths ?? 36,
        equityKpiMilestones: dto.equityKpiMilestones
          ? (dto.equityKpiMilestones as object[])
          : null,
        equityReviewRequired: reviewRequired,
        promptVersion: 'equity_sow_v1.0',
        modelName: this.aiService.getModelName(),
      },
    });

    // Initial version snapshot
    await this.prisma.sowVersion.create({
      data: {
        sowId: sow.id,
        version: 1,
        content: {
          title: sow.title,
          scope: sow.scope,
          deliverables: sow.deliverables,
          timeline: sow.timeline,
          weeklyHours: sow.weeklyHours,
          totalPriceUsd: sow.totalPriceUsd,
          equityCashComponentUsd: dto.equityCashComponentUsd,
          equityType: dto.equityType,
          fastValueUsd: dto.fastValueUsd,
          equityPct: dto.equityPct,
          vestingSchedule: dto.vestingSchedule,
          equityCliffMonths: dto.equityCliffMonths ?? 6,
          equityVestingMonths: dto.equityVestingMonths ?? 36,
        },
        changedBy: 'SYSTEM',
        changeNote: 'Equity SOW — initial draft',
      },
    });

    this.logger.log(
      `Equity SOW ${sow.id} generated — ${dto.equityType} ` +
        `(reviewRequired=${reviewRequired})`,
    );

    if (reviewRequired) {
      this.logger.warn(
        `Equity SOW ${sow.id} flagged for mandatory admin review ` +
          `(FAST notional=${dto.fastValueUsd}, pct=${dto.equityPct})`,
      );
    }

    return sow;
  }

  // ── Legal acknowledgment gates ─────────────────────────────────────────────

  /**
   * Record that a party has acknowledged the equity legal risk clause.
   * Must be called by both startup and operator before the SOW can be approved.
   * PLATFORM_ADMIN can acknowledge on behalf of either or both parties.
   */
  async acknowledgeEquityLegal(
    sowId: string,
    role: 'STARTUP' | 'OPERATOR' | 'PLATFORM_ADMIN',
  ) {
    const sow = await this.findOneSow(sowId);

    if ((sow as any).packageType !== 'HYBRID_EQUITY') {
      throw new BadRequestException(
        'Legal acknowledgment is only required for HYBRID_EQUITY SOWs.',
      );
    }
    if (sow.status === 'SIGNED' || sow.status === 'LOCKED') {
      throw new BadRequestException('Cannot modify a signed or locked SOW.');
    }

    const updateData: Record<string, boolean> = {};
    if (role === 'STARTUP' || role === 'PLATFORM_ADMIN') {
      updateData.startupLegalAck = true;
    }
    if (role === 'OPERATOR' || role === 'PLATFORM_ADMIN') {
      updateData.operatorLegalAck = true;
    }

    const updated = await this.prisma.statementOfWork.update({
      where: { id: sowId },
      data: updateData,
    });

    this.logger.log(
      `Equity legal acknowledged by ${role} on SOW ${sowId}`,
    );
    return updated;
  }

  /**
   * Request mandatory admin equity review.
   * Either party (startup or operator) can trigger this.
   * Once set, equityReviewRequired cannot be unset without an admin override.
   */
  async requestEquityReview(sowId: string) {
    const sow = await this.findOneSow(sowId);

    if ((sow as any).packageType !== 'HYBRID_EQUITY') {
      throw new BadRequestException(
        'Equity review is only applicable to HYBRID_EQUITY SOWs.',
      );
    }
    if (sow.status === 'SIGNED' || sow.status === 'LOCKED') {
      throw new BadRequestException('Cannot request review on a signed or locked SOW.');
    }

    const updated = await this.prisma.statementOfWork.update({
      where: { id: sowId },
      data: { equityReviewRequired: true },
    });

    this.logger.log(`Equity review requested for SOW ${sowId}`);
    return updated;
  }

  /**
   * Admin approves the equity review.
   * Sets equityReviewApprovedAt, unblocking the approval gate.
   */
  async approveEquityReview(sowId: string) {
    const sow = await this.findOneSow(sowId);

    if ((sow as any).packageType !== 'HYBRID_EQUITY') {
      throw new BadRequestException('Not an equity SOW.');
    }
    if (!(sow as any).equityReviewRequired) {
      throw new BadRequestException(
        'Equity review was not required for this SOW.',
      );
    }
    if ((sow as any).equityReviewApprovedAt) {
      return sow; // already approved — idempotent
    }

    const updated = await this.prisma.statementOfWork.update({
      where: { id: sowId },
      data: { equityReviewApprovedAt: new Date() },
    });

    this.logger.log(`Equity review approved by admin for SOW ${sowId}`);
    return updated;
  }

  // ── SoW Editing & Versioning ──────────────────────────────────────────────

  async editSow(sowId: string, dto: EditSowDto, userId: string) {
    const sow = await this.findOneSow(sowId);
    if (sow.status === 'SIGNED' || sow.status === 'LOCKED') {
      throw new BadRequestException('Cannot edit a signed or locked SoW.');
    }

    const newVersion = sow.currentVersion + 1;
    const updatedFields: Record<string, unknown> = {};
    if (dto.title !== undefined) updatedFields.title = dto.title;
    if (dto.scope !== undefined) updatedFields.scope = dto.scope;
    if (dto.deliverables !== undefined) updatedFields.deliverables = dto.deliverables;
    if (dto.timeline !== undefined) updatedFields.timeline = dto.timeline;
    if (dto.weeklyHours !== undefined) updatedFields.weeklyHours = dto.weeklyHours;
    if (dto.totalPriceUsd !== undefined) updatedFields.totalPriceUsd = dto.totalPriceUsd;

    const updated = await this.prisma.statementOfWork.update({
      where: { id: sowId },
      data: {
        ...updatedFields,
        currentVersion: newVersion,
        status: 'DRAFT',
      },
    });

    await this.prisma.sowVersion.create({
      data: {
        sowId,
        version: newVersion,
        content: {
          title: updated.title,
          scope: updated.scope,
          deliverables: updated.deliverables,
          timeline: updated.timeline,
          weeklyHours: updated.weeklyHours,
          totalPriceUsd: updated.totalPriceUsd,
        },
        changedBy: userId,
        changeNote: dto.changeNote,
      },
    });

    this.logger.log(`SoW ${sowId} updated to version ${newVersion}`);
    return updated;
  }

  async submitForReview(sowId: string) {
    return this.prisma.statementOfWork.update({
      where: { id: sowId },
      data: { status: 'REVIEW' },
    });
  }

  /**
   * Admin approves a SOW and auto-creates the Contract.
   *
   * For HYBRID_EQUITY SOWs two additional gates apply before approval:
   *   1. Both parties must have acknowledged legal risk
   *      (startupLegalAck && operatorLegalAck).
   *   2. If equityReviewRequired, equityReviewApprovedAt must be set.
   */
  async approveSow(sowId: string) {
    const sow = await this.findOneSow(sowId);
    if (sow.status !== 'REVIEW') {
      throw new BadRequestException('SoW must be in REVIEW status to approve.');
    }

    const sowData = sow as any;

    // ── Equity gates ──────────────────────────────────────────────────────────
    if (sowData.packageType === 'HYBRID_EQUITY') {
      if (!sowData.startupLegalAck || !sowData.operatorLegalAck) {
        throw new BadRequestException(
          'Both parties must acknowledge equity legal risk before this SOW can be approved. ' +
            `startupLegalAck=${sowData.startupLegalAck}, operatorLegalAck=${sowData.operatorLegalAck}`,
        );
      }
      if (sowData.equityReviewRequired && !sowData.equityReviewApprovedAt) {
        throw new BadRequestException(
          'This SOW requires admin equity review approval before it can be approved. ' +
            'Use POST /sow/:id/approve-equity-review first.',
        );
      }
    }

    const updated = await this.prisma.statementOfWork.update({
      where: { id: sowId },
      data: { status: 'APPROVED' },
    });

    // Auto-create contract, marking equity component if applicable
    await this.prisma.contract.create({
      data: {
        sowId,
        hasEquityComponent: sowData.packageType === 'HYBRID_EQUITY',
      },
    });

    this.logger.log(
      `SoW ${sowId} approved → Contract created` +
        (sowData.packageType === 'HYBRID_EQUITY'
          ? ' (equity component flagged)'
          : ''),
    );

    return updated;
  }

  // ── Contract Signing (E-Signature) ────────────────────────────────────────

  async signContract(contractId: string, role: 'STARTUP' | 'OPERATOR', dto: SignContractDto) {
    const contract = await this.findOneContract(contractId);

    if (dto.idempotencyKey) {
      const existing = await this.prisma.contract.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
      });
      if (existing) return existing;
    }

    if (contract.status === 'FULLY_SIGNED' || contract.status === 'CANCELLED') {
      throw new BadRequestException('Contract is already fully signed or cancelled.');
    }

    const updateData: Record<string, unknown> = {};
    if (role === 'STARTUP') {
      if (contract.startupSignedAt) throw new ConflictException('Startup has already signed.');
      updateData.startupSignedAt = new Date();
      updateData.startupSignatureId = dto.signatureId;
      updateData.status = contract.operatorSignedAt ? 'FULLY_SIGNED' : 'STARTUP_SIGNED';
    } else {
      if (contract.operatorSignedAt) throw new ConflictException('Operator has already signed.');
      updateData.operatorSignedAt = new Date();
      updateData.operatorSignatureId = dto.signatureId;
      updateData.status = contract.startupSignedAt ? 'FULLY_SIGNED' : 'OPERATOR_SIGNED';
    }

    if (updateData.status === 'FULLY_SIGNED') {
      updateData.fullySignedAt = new Date();
    }

    if (dto.idempotencyKey) {
      updateData.idempotencyKey = dto.idempotencyKey;
    }

    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: updateData,
    });

    await this.logDocumentAction(contractId, `${role}_SIGNED`, dto.signatureId);

    if (updated.status === 'FULLY_SIGNED') {
      // Lock the SoW
      await this.prisma.statementOfWork.update({
        where: { id: contract.sowId },
        data: { status: 'LOCKED' },
      });
      this.logger.log(`Contract ${contractId} fully signed — SoW locked.`);

      // If equity contract: create the EquityGrant record
      if ((contract as any).hasEquityComponent) {
        await this.createEquityGrantFromContract(contractId, contract.sow as any);
        this.logger.log(`EquityGrant created for contract ${contractId}`);
      }
    }

    return updated;
  }

  /**
   * Create an EquityGrant record when an equity contract is fully signed.
   * Status starts at PENDING — admin activates it when the engagement begins.
   */
  private async createEquityGrantFromContract(
    contractId: string,
    sow: {
      equityType?: string;
      equityPct?: number;
      fastValueUsd?: number;
      equityCliffMonths?: number;
      equityVestingMonths?: number;
    },
  ) {
    await this.prisma.equityGrant.create({
      data: {
        contractId,
        equityType: (sow.equityType ?? 'FAST') as any,
        equityPct: sow.equityPct ?? null,
        fastValueUsd: sow.fastValueUsd ?? null,
        cliffMonths: sow.equityCliffMonths ?? 6,
        vestingMonths: sow.equityVestingMonths ?? 36,
        status: 'PENDING',
        vestedPct: 0,
      },
    });
  }

  // ── Equity Grant — external document ─────────────────────────────────────

  /**
   * Admin sets the external URL for the FAST agreement or equity side-letter
   * once it has been countersigned outside the platform.
   */
  async setEquityDocumentRef(contractId: string, dto: SetEquityDocRefDto) {
    const contract = await this.findOneContract(contractId);
    if (!(contract as any).hasEquityComponent) {
      throw new BadRequestException('This contract does not have an equity component.');
    }

    const updated = await this.prisma.contract.update({
      where: { id: contractId },
      data: { equityDocumentRef: dto.documentRef },
    });

    await this.logDocumentAction(contractId, 'EQUITY_DOC_LINKED', 'ADMIN');
    this.logger.log(`Equity doc ref set for contract ${contractId}: ${dto.documentRef}`);
    return updated;
  }

  // ── Equity Grant — lifecycle ──────────────────────────────────────────────

  async getEquityGrant(contractId: string) {
    const grant = await this.prisma.equityGrant.findUnique({
      where: { contractId },
      include: { contract: { include: { sow: true } } },
    });
    if (!grant) {
      throw new NotFoundException(
        `No equity grant found for contract ${contractId}.`,
      );
    }
    return grant;
  }

  /**
   * Admin activates the equity grant when the engagement starts.
   * Transitions PENDING → ACTIVE and records vestingStartDate.
   */
  async activateEquityGrant(contractId: string) {
    const grant = await this.getEquityGrant(contractId);

    if (grant.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot activate grant in status ${grant.status}. Only PENDING grants can be activated.`,
      );
    }

    const updated = await this.prisma.equityGrant.update({
      where: { contractId },
      data: {
        status: 'ACTIVE',
        vestingStartDate: new Date(),
        lastEventAt: new Date(),
      },
    });

    this.logger.log(
      `EquityGrant activated for contract ${contractId} — vesting starts now`,
    );
    return updated;
  }

  /**
   * Record a vesting checkpoint.
   * vestedPct is the new CUMULATIVE vested percentage (not a delta).
   * Automatically transitions to FULLY_VESTED when vestedPct reaches 100.
   */
  async recordVestingEvent(contractId: string, dto: RecordVestingDto) {
    const grant = await this.getEquityGrant(contractId);

    if (grant.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Cannot record vesting on a grant in status ${grant.status}. Grant must be ACTIVE.`,
      );
    }
    if (dto.vestedPct < grant.vestedPct) {
      throw new BadRequestException(
        `vestedPct (${dto.vestedPct}) cannot be less than current value (${grant.vestedPct}). ` +
          'vestedPct is cumulative.',
      );
    }

    const isFullyVested = dto.vestedPct >= 100;
    const updated = await this.prisma.equityGrant.update({
      where: { contractId },
      data: {
        vestedPct: Math.min(dto.vestedPct, 100),
        status: isFullyVested ? 'FULLY_VESTED' : 'ACTIVE',
        lastEventAt: new Date(),
        ...(dto.notes ? { notes: dto.notes } : {}),
      },
    });

    this.logger.log(
      `Vesting event recorded for contract ${contractId}: ` +
        `vestedPct=${updated.vestedPct}` +
        (isFullyVested ? ' → FULLY_VESTED' : ''),
    );
    return updated;
  }

  /**
   * Lapse the equity grant on engagement termination.
   * Vested equity is retained (vestedPct stays). Unvested lapses.
   * Transitions ACTIVE → LAPSED.
   */
  async lapseEquityGrant(contractId: string, dto: EquityEventDto) {
    const grant = await this.getEquityGrant(contractId);

    if (grant.status !== 'ACTIVE' && grant.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot lapse a grant in status ${grant.status}.`,
      );
    }

    const updated = await this.prisma.equityGrant.update({
      where: { contractId },
      data: {
        status: 'LAPSED',
        lastEventAt: new Date(),
        notes: dto.notes,
      },
    });

    this.logger.log(
      `EquityGrant lapsed for contract ${contractId} — vestedPct retained: ${updated.vestedPct}`,
    );
    return updated;
  }

  /**
   * Accelerate full vesting (acquisition, IPO, or mutually agreed trigger).
   * Sets vestedPct to 100 and transitions to ACCELERATED.
   */
  async accelerateEquityGrant(contractId: string, dto: EquityEventDto) {
    const grant = await this.getEquityGrant(contractId);

    if (grant.status !== 'ACTIVE' && grant.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot accelerate a grant in status ${grant.status}.`,
      );
    }

    const updated = await this.prisma.equityGrant.update({
      where: { contractId },
      data: {
        status: 'ACCELERATED',
        vestedPct: 100,
        lastEventAt: new Date(),
        notes: dto.notes,
      },
    });

    this.logger.log(
      `EquityGrant accelerated for contract ${contractId}: ${dto.notes}`,
    );
    return updated;
  }

  /**
   * DUMMY MODE ONLY — immediately simulate a partial vesting event.
   * Activates the grant (if PENDING), then records 33.33% vested —
   * representing one notional vesting cliff month for testing.
   * Throws if DUMMY_PAYMENT_MODE is not true.
   */
  async dummyVestGrant(contractId: string) {
    if (!this.isDummyMode) {
      throw new BadRequestException(
        'Dummy vesting is only available when DUMMY_PAYMENT_MODE=true.',
      );
    }

    const grant = await this.getEquityGrant(contractId);

    // Activate if still pending
    if (grant.status === 'PENDING') {
      await this.activateEquityGrant(contractId);
    }

    // Record a single notional vesting event (cliff passed, 1/3 vested)
    const dummyVestedPct = Math.min(grant.vestedPct + 33.33, 100);
    const updated = await this.recordVestingEvent(contractId, {
      vestedPct: dummyVestedPct,
      notes: 'DUMMY: simulated cliff vesting event',
    });

    this.logger.log(
      `[DUMMY] Vesting simulated for contract ${contractId}: vestedPct=${updated.vestedPct}`,
    );
    return updated;
  }

  // ── Contacts unlock ───────────────────────────────────────────────────────

  async unlockContacts(contractId: string) {
    const contract = await this.findOneContract(contractId);
    if (contract.status !== 'FULLY_SIGNED') {
      throw new BadRequestException('Both signatures required before unlocking contacts.');
    }
    return this.prisma.contract.update({
      where: { id: contractId },
      data: { contactsUnlocked: true },
    });
  }

  // ── Document Logging ──────────────────────────────────────────────────────

  async logDocumentAction(
    contractId: string,
    action: string,
    performedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.documentLog.create({
      data: { contractId, action, performedBy, ipAddress, userAgent },
    });
  }

  async getDocumentLogs(contractId: string) {
    return this.prisma.documentLog.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async findOneSow(sowId: string) {
    const sow = await this.prisma.statementOfWork.findUnique({
      where: { id: sowId },
      include: { versions: { orderBy: { version: 'desc' } }, contract: true },
    });
    if (!sow) throw new NotFoundException('Statement of Work not found.');
    return sow;
  }

  async findOneContract(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        sow: true,
        documentLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
        equityGrant: true,
      },
    });
    if (!contract) throw new NotFoundException('Contract not found.');
    return contract;
  }

  async findAll() {
    return this.prisma.statementOfWork.findMany({
      orderBy: { createdAt: 'desc' },
      include: { contract: true },
    });
  }

  async findByStartup(startupProfileId: string) {
    return this.prisma.statementOfWork.findMany({
      where: { startupProfileId },
      orderBy: { createdAt: 'desc' },
      include: { contract: { include: { equityGrant: true } } },
    });
  }

  async findByOperator(operatorId: string) {
    return this.prisma.statementOfWork.findMany({
      where: { operatorId },
      orderBy: { createdAt: 'desc' },
      include: { contract: { include: { equityGrant: true } } },
    });
  }

  async getSowVersions(sowId: string) {
    return this.prisma.sowVersion.findMany({
      where: { sowId },
      orderBy: { version: 'desc' },
    });
  }
}
