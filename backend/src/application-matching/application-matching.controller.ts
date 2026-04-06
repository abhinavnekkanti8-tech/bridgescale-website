import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApplicationMatchingService } from './application-matching.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';

/**
 * Application Matching Controller: Manage company-to-talent matches.
 * Allows admins to create shortlists and add talent candidates for company opportunities.
 */
@Controller('application-matches')
export class ApplicationMatchingController {
  constructor(private readonly matchingService: ApplicationMatchingService) {}

  /**
   * POST /api/v1/application-matches/:companyApplicationId/shortlist
   * ADMIN — Create a shortlist for a company application.
   *
   * Body: { "name": "Premium B2B SaaS Ops" }
   */
  @Post(':companyApplicationId/shortlist')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async createShortlist(
    @Param('companyApplicationId') companyApplicationId: string,
    @Body() params: { name: string },
  ) {
    return this.matchingService.createShortlist(companyApplicationId, params);
  }

  /**
   * GET /api/v1/application-matches/shortlist/:shortlistId
   * ADMIN — Get a shortlist with all candidates.
   */
  @Get('shortlist/:shortlistId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getShortlist(@Param('shortlistId') shortlistId: string) {
    return this.matchingService.getShortlist(shortlistId);
  }

  /**
   * POST /api/v1/application-matches/shortlist/:shortlistId/candidates/:talentApplicationId
   * ADMIN — Add a talent candidate to a shortlist.
   *
   * Body (optional): { "matchScore": 85, "explanation": "Strong product-market fit" }
   */
  @Post('shortlist/:shortlistId/candidates/:talentApplicationId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async addCandidate(
    @Param('shortlistId') shortlistId: string,
    @Param('talentApplicationId') talentApplicationId: string,
    @Body() params?: { matchScore?: number; explanation?: string },
  ) {
    return this.matchingService.addCandidateToShortlist(shortlistId, talentApplicationId, params);
  }

  /**
   * PATCH /api/v1/application-matches/candidate/:candidateId
   * ADMIN — Update a candidate's match score and explanation.
   *
   * Body: { "matchScore": 90, "explanation": "..." }
   */
  @Patch('candidate/:candidateId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async updateCandidate(
    @Param('candidateId') candidateId: string,
    @Body() params: { matchScore?: number; explanation?: string },
  ) {
    return this.matchingService.updateCandidate(candidateId, params);
  }

  /**
   * GET /api/v1/application-matches/shortlist/:shortlistId/top
   * ADMIN — Get top candidates for a shortlist.
   */
  @Get('shortlist/:shortlistId/top')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getTopCandidates(@Param('shortlistId') shortlistId: string) {
    return this.matchingService.getTopCandidates(shortlistId);
  }
}
