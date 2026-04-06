import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TalentPreScreenService } from './talent-pre-screen.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole, PreScreenRecommendation } from '@prisma/client';

/**
 * Talent Pre-Screen Controller: API for managing talent pre-screens.
 * Pre-screens evaluate talent applications before matching with opportunities.
 */
@Controller('talent-pre-screens')
export class TalentPreScreenController {
  constructor(private readonly talentPreScreenService: TalentPreScreenService) {}

  /**
   * GET /api/v1/talent-pre-screens/:applicationId
   * ADMIN — Get a talent pre-screen by application ID.
   */
  @Get(':applicationId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN, MembershipRole.STARTUP_ADMIN)
  async getPreScreen(@Param('applicationId') applicationId: string) {
    return this.talentPreScreenService.getPreScreenByApplicationId(applicationId);
  }

  /**
   * POST /api/v1/talent-pre-screens/:applicationId/generate
   * ADMIN — Generate a talent pre-screen for the application.
   * Calculates scores: completeness, consistency, references, assessment.
   * Idempotent: if pre-screen exists, returns it without regenerating.
   */
  @Post(':applicationId/generate')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async generatePreScreen(@Param('applicationId') applicationId: string) {
    return this.talentPreScreenService.generatePreScreen(applicationId);
  }

  /**
   * PATCH /api/v1/talent-pre-screens/:applicationId
   * ADMIN — Update pre-screen recommendation and details.
   *
   * Body:
   * {
   *   "recommendation": "STRONG_PASS" | "PASS" | "CONDITIONAL" | "FAIL",
   *   "redFlags": [...],
   *   "suggestedProbeQuestions": [...]
   * }
   */
  @Patch(':applicationId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async updateRecommendation(
    @Param('applicationId') applicationId: string,
    @Body() params: {
      recommendation?: PreScreenRecommendation;
      redFlags?: any[];
      suggestedProbeQuestions?: string[];
    },
  ) {
    return this.talentPreScreenService.updateRecommendation(applicationId, params);
  }
}
