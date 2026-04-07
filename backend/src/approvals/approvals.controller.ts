import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';

/**
 * Approvals Controller: Final approval workflow for matched pairs.
 * Approves company-talent matches and creates engagements.
 */
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  /**
   * POST /api/v1/approvals/approve-pair
   * ADMIN — Approve a matched company-talent pair.
   * Marks both applications as APPROVED status.
   *
   * Body:
   * {
   *   "companyApplicationId": "...",
   *   "talentApplicationId": "...",
   *   "engagementType": "SPRINT" | "RETAINER",
   *   "internalNotes": "..."
   * }
   */
  @Post('approve-pair')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async approvePair(
    @Body()
    params: {
      companyApplicationId: string;
      talentApplicationId: string;
      engagementType: 'SPRINT' | 'RETAINER';
      internalNotes?: string;
    },
  ) {
    return this.approvalsService.approvePair(params);
  }

  /**
   * POST /api/v1/approvals/reject-pair
   * ADMIN — Reject a matched pair after unsuccessful interview.
   *
   * Body:
   * {
   *   "companyApplicationId": "...",
   *   "talentApplicationId": "...",
   *   "reason": "..."
   * }
   */
  @Post('reject-pair')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async rejectPair(
    @Body()
    params: {
      companyApplicationId: string;
      talentApplicationId: string;
      reason?: string;
    },
  ) {
    return this.approvalsService.rejectPair(params);
  }

  /**
   * GET /api/v1/approvals/:companyApplicationId/:talentApplicationId
   * ADMIN — Get approval status for a pair.
   */
  @Get(':companyApplicationId/:talentApplicationId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getPairStatus(
    @Param('companyApplicationId') companyApplicationId: string,
    @Param('talentApplicationId') talentApplicationId: string,
  ) {
    return this.approvalsService.getPairStatus(companyApplicationId, talentApplicationId);
  }

  /**
   * GET /api/v1/approvals/approved
   * ADMIN — List all approved pairs (active engagements).
   */
  @Get()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getApprovedPairs() {
    return this.approvalsService.getApprovedPairs();
  }
}
