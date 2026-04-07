import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OpportunityBriefsService } from './opportunity-briefs.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';

/**
 * Opportunity Briefs Controller: API for managing opportunity briefs.
 * Briefs are generated from approved diagnoses and outline the engagement opportunity.
 */
@Controller('opportunity-briefs')
export class OpportunityBriefsController {
  constructor(private readonly opportunityBriefsService: OpportunityBriefsService) {}

  /**
   * GET /api/v1/opportunity-briefs/:applicationId
   * ADMIN — Get an opportunity brief by application ID.
   */
  @Get(':applicationId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN, MembershipRole.STARTUP_ADMIN)
  async getBrief(@Param('applicationId') applicationId: string) {
    return this.opportunityBriefsService.getBriefByApplicationId(applicationId);
  }

  /**
   * POST /api/v1/opportunity-briefs/:applicationId/generate
   * ADMIN — Generate an opportunity brief from the application's diagnosis.
   * Idempotent: if brief exists, returns it without regenerating.
   */
  @Post(':applicationId/generate')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async generateBrief(@Param('applicationId') applicationId: string) {
    return this.opportunityBriefsService.generateBrief(applicationId);
  }

  /**
   * PATCH /api/v1/opportunity-briefs/:applicationId
   * ADMIN — Update brief content (internal and/or client-facing).
   *
   * Body:
   * {
   *   "internalContent": { ... },
   *   "clientFacingContent": { ... }
   * }
   */
  @Patch(':applicationId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async updateBrief(
    @Param('applicationId') applicationId: string,
    @Body() params: {
      internalContent?: Record<string, any>;
      clientFacingContent?: Record<string, any>;
    },
  ) {
    return this.opportunityBriefsService.updateBrief(applicationId, params);
  }

  /**
   * POST /api/v1/opportunity-briefs/:applicationId/suggest-template
   * ADMIN — Suggest the best SoW template type based on the brief.
   * Used in T4.3 to recommend templates when creating SoWs from briefs.
   */
  @Post(':applicationId/suggest-template')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async suggestTemplate(@Param('applicationId') applicationId: string) {
    return this.opportunityBriefsService.suggestSowTemplate(applicationId);
  }
}
