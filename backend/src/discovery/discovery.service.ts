import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ScheduleDiscoveryDto, AddNotesDto, OverrideDiscoveryDto } from './dto/discovery.dto';

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  // ── Scheduling ────────────────────────────────────────────────────────────

  async schedule(dto: ScheduleDiscoveryDto) {
    const meetingLink = dto.meetingLink || `https://meet.antigravity.dev/${Date.now().toString(36)}`;
    return this.prisma.discoveryCall.create({
      data: {
        startupProfileId: dto.startupProfileId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes ?? 30,
        meetingLink,
      },
    });
  }

  async cancel(callId: string) {
    return this.prisma.discoveryCall.update({
      where: { id: callId },
      data: { status: 'CANCELLED' },
    });
  }

  async markCompleted(callId: string) {
    return this.prisma.discoveryCall.update({
      where: { id: callId },
      data: { status: 'COMPLETED' },
    });
  }

  // ── Notes & AI Summary ────────────────────────────────────────────────────

  async addNotes(callId: string, dto: AddNotesDto) {
    const call = await this.findOne(callId);
    const updated = await this.prisma.discoveryCall.update({
      where: { id: callId },
      data: { notes: dto.notes, status: 'COMPLETED' },
    });

    // Fire-and-forget AI summary + recommendation
    this.runAiSummary(call.id, dto.notes, call.startupProfileId).catch((err: unknown) => {
      this.logger.error(`AI summary failed for call ${callId}:`, err);
    });

    return updated;
  }

  private async runAiSummary(callId: string, notes: string, startupProfileId: string) {
    this.logger.log(`Generating AI summary for discovery call ${callId}`);

    // Fetch startup profile for context
    const profile = await this.prisma.startupProfile.findUnique({
      where: { id: startupProfileId },
    });

    const profileContext = profile
      ? `Industry: ${profile.industry}, Stage: ${profile.stage}, Markets: ${(profile.targetMarkets as string[])?.join(', ')}, Motion: ${profile.salesMotion}`
      : 'Profile not available';

    // Generate mock summary (same pattern as AI service for dummy keys)
    const summary = this.buildMockSummary(notes, profileContext);
    const recommendation = this.buildMockRecommendation(profile);

    await this.prisma.discoveryCall.update({
      where: { id: callId },
      data: {
        aiSummary: summary,
        aiRecommendation: recommendation.text,
        recommendedPkgs: recommendation.packages,
        promptVersion: 'discovery_summary_v1.0',
        modelName: this.aiService.getModelName(),
      },
    });

    this.logger.log(`AI summary generated for call ${callId}`);
  }

  private buildMockSummary(notes: string, profileContext: string): string {
    const noteLen = notes.length;
    const detailLevel = noteLen > 500 ? 'detailed' : noteLen > 200 ? 'moderate' : 'brief';
    return [
      `**Discovery Call Summary**`,
      ``,
      `**Startup Context:** ${profileContext}`,
      ``,
      `**Key Insights:** The discovery call revealed a ${detailLevel} understanding of the startup's go-to-market needs. `,
      `The founding team demonstrates clear intent to expand into diaspora markets with structured sales support.`,
      ``,
      `**Engagement Readiness:** The startup has shown commitment to timeline-bound execution. `,
      `${noteLen > 300 ? 'Comprehensive notes indicate strong preparation and serious engagement intent.' : 'Additional follow-up may be needed to refine scope.'}`,
      ``,
      `**Recommended Next Steps:** Proceed with package selection based on the startup's readiness score and budget alignment.`,
    ].join('\n');
  }

  private buildMockRecommendation(profile: Record<string, unknown> | null): { text: string; packages: ('PIPELINE_SPRINT' | 'BD_SPRINT' | 'FRACTIONAL_RETAINER')[] } {
    const budget = profile?.budgetBand as string ?? 'UNDER_5K';
    const motion = profile?.salesMotion as string ?? 'OUTBOUND';

    let packages: ('PIPELINE_SPRINT' | 'BD_SPRINT' | 'FRACTIONAL_RETAINER')[];
    let text: string;

    if (budget === 'ABOVE_20K') {
      packages = ['FRACTIONAL_RETAINER', 'PIPELINE_SPRINT'];
      text = 'Based on the budget range and engagement depth, a Fractional Sales Leadership Retainer is recommended as the primary package, with a Pipeline Sprint as an accelerated start option.';
    } else if (motion === 'PARTNERSHIPS' || motion === 'CHANNEL') {
      packages = ['BD_SPRINT'];
      text = 'The startup\'s partnership-driven go-to-market strategy aligns best with a Business Development Sprint, focusing on channel activation and alliance building.';
    } else {
      packages = ['PIPELINE_SPRINT'];
      text = 'A Pipeline Sprint is recommended as the initial engagement. This provides structured outbound execution within a defined timeline and budget.';
    }

    return { text, packages };
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async findOne(callId: string) {
    const call = await this.prisma.discoveryCall.findUnique({
      where: { id: callId },
      include: { startupProfile: { select: { id: true, industry: true, stage: true } } },
    });
    if (!call) throw new NotFoundException('Discovery call not found.');
    return call;
  }

  async findByStartup(startupProfileId: string) {
    return this.prisma.discoveryCall.findMany({
      where: { startupProfileId },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.discoveryCall.findMany({
      orderBy: { scheduledAt: 'desc' },
      include: { startupProfile: { select: { id: true, industry: true, stage: true } } },
    });
  }

  // ── Admin Override ────────────────────────────────────────────────────────

  async overrideSummary(callId: string, dto: OverrideDiscoveryDto) {
    return this.prisma.discoveryCall.update({
      where: { id: callId },
      data: {
        overrideSummary: dto.overrideSummary,
        overrideReason: dto.overrideReason,
        adminOverride: true,
      },
    });
  }

  // ── Packages ──────────────────────────────────────────────────────────────

  async getPackages() {
    return this.prisma.package.findMany({
      where: { isActive: true },
      orderBy: { priceUsd: 'asc' },
    });
  }

  async seedPackages() {
    const existing = await this.prisma.package.count();
    if (existing > 0) return { seeded: false, count: existing };

    const packages = [
      { type: 'PIPELINE_SPRINT' as const, name: 'Pipeline Sprint', description: '8-week structured outbound campaign with dedicated operator. Includes ICP targeting, outreach sequences, and weekly pipeline reviews.', durationWeeks: 8, weeklyHours: 15, priceUsd: 5000 },
      { type: 'BD_SPRINT' as const, name: 'BD Sprint', description: '8-week partnership and business development sprint. Includes channel mapping, alliance outreach, and partnership deal flow.', durationWeeks: 8, weeklyHours: 15, priceUsd: 6000 },
      { type: 'FRACTIONAL_RETAINER' as const, name: 'Fractional Sales Leadership Retainer', description: 'Ongoing fractional sales leadership. Includes strategy, team coaching, pipeline management, and quarterly business reviews.', durationWeeks: 12, weeklyHours: 20, priceUsd: 15000 },
    ];

    await this.prisma.package.createMany({ data: packages });
    return { seeded: true, count: packages.length };
  }
}
