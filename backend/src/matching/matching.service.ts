import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

// ── Match Fit Scoring (7 components) ─────────────────────────────────────────
export interface MatchScoreBreakdown {
  laneAlignment: number;      // max 20
  regionOverlap: number;      // max 15
  budgetFit: number;          // max 15
  experienceRelevance: number; // max 15
  availabilityMatch: number;  // max 10
  tierBonus: number;          // max 15
  motionFit: number;          // max 10
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  // ── Generate Shortlist ───────────────────────────────────────────────────

  async generateShortlist(startupProfileId: string) {
    // Load startup profile
    const startup = await this.prisma.startupProfile.findUnique({
      where: { id: startupProfileId },
      include: { scores: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!startup) throw new NotFoundException('Startup profile not found.');

    // Load all verified operators
    const operators = await this.prisma.operatorProfile.findMany({
      where: { verification: 'VERIFIED' },
      include: {
        operator: { select: { id: true, name: true, country: true } },
        scores: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (operators.length === 0) {
      throw new BadRequestException('No verified operators available for matching.');
    }

    // Score all operators
    const scoredCandidates = operators.map((op) => {
      const breakdown = this.computeMatchScore(startup, op);
      const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
      return { operator: op, breakdown, total };
    });

    // Hard filters: remove candidates with laneAlignment = 0
    const filtered = scoredCandidates.filter((c) => c.breakdown.laneAlignment > 0);

    // Sort by total descending
    filtered.sort((a, b) => b.total - a.total);

    // Shortlist selection: top 5, ≥ 2 Tier A if available, 1 adjacent-fit
    const tierA = filtered.filter((c) => c.operator.tier === 'TIER_A');
    const selected: typeof filtered = [];

    // Pick up to 2 Tier A first
    for (const c of tierA) {
      if (selected.length >= 2) break;
      selected.push(c);
    }

    // Fill remaining from top candidates (not already selected)
    for (const c of filtered) {
      if (selected.length >= 4) break;
      if (!selected.includes(c)) selected.push(c);
    }

    // Add 1 adjacent-fit (lowest scored remaining or from unfiltered)
    const adjacentPool = scoredCandidates.filter((c) => !selected.includes(c) && c.total > 0);
    if (adjacentPool.length > 0) {
      // Pick the one in the middle as "adjacent fit"
      const midIdx = Math.floor(adjacentPool.length / 2);
      selected.push(adjacentPool[midIdx]);
    }

    // Create shortlist in DB
    const shortlist = await this.prisma.matchShortlist.create({
      data: {
        startupProfileId,
        promptVersion: 'match_fit_v1.0',
        modelName: this.aiService.getModelName(),
        selectionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Create candidates
    for (const c of selected) {
      const isAdjacent = selected.indexOf(c) === selected.length - 1 && adjacentPool.includes(c);
      await this.prisma.matchCandidate.create({
        data: {
          shortlistId: shortlist.id,
          operatorId: c.operator.id,
          matchScore: c.total,
          scoreBreakdown: c.breakdown as object,
          explanation: this.generateExplanation(c.operator, c.breakdown, isAdjacent),
          mainRisk: this.identifyRisk(c.breakdown),
          packageTier: this.recommendPackageTier(startup),
          weeklyFitHours: this.estimateWeeklyHours(c.breakdown),
        },
      });
    }

    this.logger.log(`Shortlist ${shortlist.id} generated with ${selected.length} candidates for startup ${startupProfileId}`);
    return this.findOne(shortlist.id);
  }

  private computeMatchScore(startup: Record<string, unknown>, operator: Record<string, unknown>): MatchScoreBreakdown {
    const sMarkets = (startup.targetMarkets as string[]) ?? [];
    const sMotion = startup.salesMotion as string ?? '';
    const sBudget = startup.budgetBand as string ?? '';

    const oLanes = (operator.lanes as string[]) ?? [];
    const oRegions = (operator.regions as string[]) ?? [];
    const oTier = (operator as { tier?: string }).tier ?? 'UNVERIFIED';
    const oYears = (operator as { yearsExperience?: number }).yearsExperience ?? 0;

    // 1. Lane alignment (max 20)
    let laneAlignment = 0;
    if (sMotion === 'OUTBOUND' && oLanes.includes('PIPELINE_SPRINT')) laneAlignment = 20;
    else if ((sMotion === 'PARTNERSHIPS' || sMotion === 'CHANNEL') && oLanes.includes('BD_SPRINT')) laneAlignment = 20;
    else if (oLanes.includes('FRACTIONAL_RETAINER')) laneAlignment = 15;
    else if (oLanes.length > 0) laneAlignment = 8;

    // 2. Region overlap (max 15)
    const regionOverlap = sMarkets.some((m: string) => oRegions.includes(m)) ? 15 : sMarkets.length > 0 ? 5 : 10;

    // 3. Budget fit (max 15)
    let budgetFit = 10;
    if (sBudget === 'ABOVE_20K') budgetFit = 15;
    else if (sBudget === '10K_TO_20K') budgetFit = 13;
    else if (sBudget === '5K_TO_10K') budgetFit = 11;

    // 4. Experience relevance (max 15)
    const experienceRelevance = Math.min(15, oYears * 2 + 3);

    // 5. Availability match (max 10)
    const availabilityMatch = 8;

    // 6. Tier bonus (max 15)
    const tierBonus = oTier === 'TIER_A' ? 15 : oTier === 'TIER_B' ? 10 : oTier === 'TIER_C' ? 5 : 0;

    // 7. Motion fit (max 10)
    const motionFit = laneAlignment >= 15 ? 10 : laneAlignment > 0 ? 6 : 2;

    return { laneAlignment, regionOverlap, budgetFit, experienceRelevance, availabilityMatch, tierBonus, motionFit };
  }

  private generateExplanation(operator: Record<string, unknown>, breakdown: MatchScoreBreakdown, isAdjacent: boolean): string {
    const oName = (operator as { operator?: { name?: string } }).operator?.name ?? 'This operator';
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const strengths: string[] = [];
    if (breakdown.laneAlignment >= 15) strengths.push('strong lane alignment');
    if (breakdown.regionOverlap >= 12) strengths.push('strong regional overlap');
    if (breakdown.tierBonus >= 12) strengths.push('Tier A verified quality');
    if (breakdown.experienceRelevance >= 12) strengths.push('deep domain experience');

    const adj = isAdjacent ? ' (Adjacent fit — included for diverse perspective.)' : '';
    return `${oName} scored ${total}/100. Key strengths: ${strengths.length > 0 ? strengths.join(', ') : 'balanced across all dimensions'}.${adj}`;
  }

  private identifyRisk(breakdown: MatchScoreBreakdown): string {
    const weakest = Object.entries(breakdown).sort(([, a], [, b]) => a - b)[0];
    const riskMap: Record<string, string> = {
      laneAlignment: 'Service lane may not be the optimal match — clarify engagement scope.',
      regionOverlap: 'Limited overlap in target regions — ensure cultural and timezone fit.',
      budgetFit: 'Budget alignment should be validated during SOW negotiation.',
      experienceRelevance: 'Operator experience profile may need supplementary domain exposure.',
      availabilityMatch: 'Availability constraints — confirm commitment before engagement.',
      tierBonus: 'Lower tier verification — additional references may strengthen confidence.',
      motionFit: 'Go-to-market motion alignment is partial — scope definition will be important.',
    };
    return riskMap[weakest[0]] ?? 'No critical risks identified.';
  }

  private recommendPackageTier(startup: Record<string, unknown>): 'PIPELINE_SPRINT' | 'BD_SPRINT' | 'FRACTIONAL_RETAINER' {
    const budget = startup.budgetBand as string;
    const motion = startup.salesMotion as string;
    if (budget === 'ABOVE_20K') return 'FRACTIONAL_RETAINER';
    if (motion === 'PARTNERSHIPS' || motion === 'CHANNEL') return 'BD_SPRINT';
    return 'PIPELINE_SPRINT';
  }

  private estimateWeeklyHours(breakdown: MatchScoreBreakdown): number {
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    if (total >= 80) return 20;
    if (total >= 65) return 15;
    return 10;
  }

  // ── CRUD & Actions ────────────────────────────────────────────────────────

  async findOne(shortlistId: string) {
    const sl = await this.prisma.matchShortlist.findUnique({
      where: { id: shortlistId },
      include: { candidates: { orderBy: { matchScore: 'desc' } } },
    });
    if (!sl) throw new NotFoundException('Shortlist not found.');
    return sl;
  }

  async findByStartup(startupProfileId: string) {
    return this.prisma.matchShortlist.findMany({
      where: { startupProfileId },
      orderBy: { createdAt: 'desc' },
      include: { candidates: { orderBy: { matchScore: 'desc' } } },
    });
  }

  async findAll() {
    return this.prisma.matchShortlist.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        startupProfile: { select: { id: true, industry: true, stage: true } },
        candidates: { orderBy: { matchScore: 'desc' } },
      },
    });
  }

  async publishShortlist(shortlistId: string) {
    return this.prisma.matchShortlist.update({
      where: { id: shortlistId },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  async operatorRespond(candidateId: string, interest: 'ACCEPTED' | 'DECLINED', declineReason?: string) {
    const candidate = await this.prisma.matchCandidate.findUnique({ where: { id: candidateId } });
    if (!candidate) throw new NotFoundException('Candidate not found.');

    return this.prisma.matchCandidate.update({
      where: { id: candidateId },
      data: {
        interest,
        status: interest === 'ACCEPTED' ? 'INTERESTED' : 'DECLINED',
        declineReason: interest === 'DECLINED' ? declineReason : undefined,
      },
    });
  }

  async selectOperator(shortlistId: string, candidateId: string) {
    const candidate = await this.prisma.matchCandidate.findUnique({ where: { id: candidateId } });
    if (!candidate || candidate.shortlistId !== shortlistId) throw new NotFoundException('Candidate not found on shortlist.');
    if (candidate.interest !== 'ACCEPTED') throw new BadRequestException('Cannot select an operator who has not accepted interest.');

    // Mark selected and pass others
    await this.prisma.$transaction([
      this.prisma.matchCandidate.update({
        where: { id: candidateId },
        data: { status: 'SELECTED', selectedAt: new Date() },
      }),
      this.prisma.matchCandidate.updateMany({
        where: { shortlistId, id: { not: candidateId } },
        data: { status: 'PASSED' },
      }),
      this.prisma.matchShortlist.update({
        where: { id: shortlistId },
        data: { status: 'SELECTION_MADE' },
      }),
    ]);

    return this.findOne(shortlistId);
  }
}
