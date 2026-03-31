import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EngagementsService } from './engagements.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';
import { SessionUser } from '../auth/session-user.decorator';
import {
  UpdateEngagementStatusDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  CreateNoteDto,
} from './dto/engagements.dto';

@Controller('engagements')
@UseGuards(SessionAuthGuard, RolesGuard)
export class EngagementsController {
  constructor(private readonly service: EngagementsService) {}

  // ── Engagement Workspaces ────────────────────────────────────────────────

  @Post(':contractId/initialize')
  @Roles(MembershipRole.PLATFORM_ADMIN) // Only Admin triggers initialization for MVP
  initialize(@Param('contractId') contractId: string) {
    return this.service.initializeEngagement(contractId);
  }

  @Get('startup')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.STARTUP_MEMBER)
  getForStartup(@SessionUser() user: any) {
    return this.service.findByStartup(user.organizationId); // Assuming user logic applies, or pass profile ID explicitly
  }

  @Get('operator')
  @Roles(MembershipRole.OPERATOR)
  getForOperator(@SessionUser() user: any) {
    return this.service.findByOperator(user.id); // Operator user ID maps to profile
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.service.getEngagement(id);
  }

  @Get(':id/workspace')
  getWorkspace(@Param('id') id: string) {
    return this.service.getWorkspaceData(id);
  }

  @Patch(':id/status')
  @Roles(MembershipRole.PLATFORM_ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEngagementStatusDto,
    @SessionUser() user: any,
  ) {
    return this.service.updateStatus(id, dto, user.id);
  }

  // ── Milestones ──────────────────────────────────────────────────────────

  @Post(':id/milestones')
  @Roles(MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  createMilestone(
    @Param('id') id: string,
    @Body() dto: CreateMilestoneDto,
    @SessionUser() user: any,
  ) {
    return this.service.createMilestone(id, dto, user.id);
  }

  @Patch('milestones/:milestoneId')
  @Roles(MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  updateMilestone(
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdateMilestoneDto,
    @SessionUser() user: any,
  ) {
    return this.service.updateMilestone(milestoneId, dto, user.id);
  }

  // ── Notes ──────────────────────────────────────────────────────────────

  @Post(':id/notes')
  addNote(
    @Param('id') id: string,
    @Body() dto: CreateNoteDto,
    @SessionUser() user: any,
  ) {
    return this.service.addNote(id, dto, user.id);
  }
}
