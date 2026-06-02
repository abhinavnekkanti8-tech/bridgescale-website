import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { SessionUser } from '../common/types/session.types';
import { CoreFlowService } from './core-flow.service';
import {
  CallOutcomeDto,
  ConfirmPreSowSummaryDto,
  DeferCallDto,
  CreatePreSowSummaryDto,
  EngagementIntentDto,
  RequestCallDto,
  RespondToCallDto,
} from './dto/core-flow.dto';

@Controller()
@UseGuards(SessionAuthGuard, RolesGuard)
export class CoreFlowController {
  constructor(private readonly service: CoreFlowService) {}

  @Post('calls/request')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.PLATFORM_ADMIN)
  requestCall(@CurrentUser() user: SessionUser, @Body() dto: RequestCallDto) {
    return this.service.requestCall(user.id, dto);
  }

  /** List all engagement calls visible to the current user. */
  @Get('calls/me')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  listMyCalls(@CurrentUser() user: SessionUser) {
    return this.service.listCallsForUser(user);
  }

  @Get('calls/:id')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  getCall(@Param('id') id: string) {
    return this.service.getCallWithIntents(id);
  }

  @Patch('calls/:id/respond')
  @Roles(MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  respondToCall(@Param('id') id: string, @Body() dto: RespondToCallDto) {
    return this.service.respondToCall(id, dto);
  }

  @Patch('calls/:id/outcome')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  recordCallOutcome(@Param('id') id: string, @Body() dto: CallOutcomeDto) {
    return this.service.recordCallOutcome(id, dto);
  }

  @Post('engagement-intents')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  recordIntent(@Body() dto: EngagementIntentDto) {
    return this.service.recordIntent(dto);
  }

  @Post('pre-sow-summaries')
  @Roles(MembershipRole.PLATFORM_ADMIN)
  createPreSowSummary(@Body() dto: CreatePreSowSummaryDto) {
    return this.service.createPreSowSummary(dto);
  }

  @Patch('pre-sow-summaries/:id/confirm')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  confirmPreSowSummary(@Param('id') id: string, @Body() dto: ConfirmPreSowSummaryDto) {
    return this.service.confirmPreSowSummary(id, dto);
  }

  @Get('pre-sow-summaries/:id')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  getPreSowSummary(@Param('id') id: string) {
    return this.service.getSummary(id);
  }

  /** Either party requests a new time for the call. Resets status to REQUESTED. */
  @Patch('calls/:id/defer')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  deferCall(@Param('id') id: string, @Body() dto: DeferCallDto) {
    return this.service.deferCall(id, dto.newProposedAt, dto.reason);
  }

  /** Operator-only: returns the strike count over the rolling 90-day window. */
  @Get('strikes/me')
  @Roles(MembershipRole.OPERATOR)
  getMyStrikes(@CurrentUser() user: SessionUser) {
    return this.service.getStrikesForOperator(user.orgId);
  }
}
