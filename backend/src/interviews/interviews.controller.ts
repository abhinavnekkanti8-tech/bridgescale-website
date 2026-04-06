import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';

/**
 * Interviews Controller: API for scheduling and managing interviews.
 * Coordinates calendar and communication between companies and talent.
 */
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  /**
   * POST /api/v1/interviews/schedule
   * ADMIN — Schedule an interview between company and talent.
   *
   * Body:
   * {
   *   "companyApplicationId": "...",
   *   "talentApplicationId": "...",
   *   "scheduledAt": "2026-04-20T14:00:00Z",
   *   "meetingLink": "https://meet.google.com/..."
   * }
   */
  @Post('schedule')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async scheduleInterview(
    @Body()
    params: {
      companyApplicationId: string;
      talentApplicationId: string;
      scheduledAt: Date;
      meetingLink?: string;
      notes?: string;
    },
  ) {
    return this.interviewsService.scheduleInterview(params);
  }

  /**
   * GET /api/v1/interviews/:companyApplicationId/:talentApplicationId
   * ADMIN — Get interview details and status.
   */
  @Get(':companyApplicationId/:talentApplicationId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getInterview(
    @Param('companyApplicationId') companyApplicationId: string,
    @Param('talentApplicationId') talentApplicationId: string,
  ) {
    return this.interviewsService.getInterview(companyApplicationId, talentApplicationId);
  }

  /**
   * POST /api/v1/interviews/:companyApplicationId/:talentApplicationId/complete
   * ADMIN — Complete an interview and record outcome (approved/rejected).
   *
   * Body:
   * {
   *   "decision": "APPROVED" | "REJECTED",
   *   "feedback": "...",
   *   "nextSteps": "..."
   * }
   */
  @Post(':companyApplicationId/:talentApplicationId/complete')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async completeInterview(
    @Param('companyApplicationId') companyApplicationId: string,
    @Param('talentApplicationId') talentApplicationId: string,
    @Body()
    params: {
      decision: 'APPROVED' | 'REJECTED';
      feedback?: string;
      nextSteps?: string;
    },
  ) {
    return this.interviewsService.completeInterview(companyApplicationId, talentApplicationId, params);
  }

  /**
   * GET /api/v1/interviews/upcoming
   * ADMIN — Get list of upcoming scheduled interviews.
   */
  @Get()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getUpcomingInterviews() {
    return this.interviewsService.getUpcomingInterviews();
  }
}
