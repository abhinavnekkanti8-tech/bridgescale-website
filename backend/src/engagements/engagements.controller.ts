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
import { SessionUser as SessionUserDecorator } from '../auth/session-user.decorator';
import { SessionUser as SessionUserType } from '../common/types/session.types';
import {
  UpdateEngagementStatusDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  CreateNoteDto,
  ConvertFulltimeDto,
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
  getForStartup(@SessionUserDecorator() user: SessionUserType) {
    return this.service.findForStartup(user);
  }

  @Get('operator')
  @Roles(MembershipRole.OPERATOR)
  getForOperator(@SessionUserDecorator() user: SessionUserType) {
    return this.service.findForOperator(user);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.service.getEngagement(user, id);
  }

  @Get(':id/workspace')
  getWorkspace(@Param('id') id: string, @SessionUserDecorator() user: SessionUserType) {
    return this.service.getWorkspaceData(user, id);
  }

  @Patch(':id/status')
  @Roles(MembershipRole.PLATFORM_ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEngagementStatusDto,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.service.updateStatus(id, dto, user.id);
  }

  @Patch(':id/convert-fulltime')
  @Roles(MembershipRole.PLATFORM_ADMIN)
  convertFulltime(
    @Param('id') id: string,
    @Body() dto: ConvertFulltimeDto,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.service.convertToFulltime(id, dto, user.id);
  }

  // ── Milestones ──────────────────────────────────────────────────────────

  @Post(':id/milestones')
  @Roles(MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  createMilestone(
    @Param('id') id: string,
    @Body() dto: CreateMilestoneDto,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.service.createMilestone(id, dto, user);
  }

  @Patch('milestones/:milestoneId')
  @Roles(MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  updateMilestone(
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdateMilestoneDto,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.service.updateMilestone(milestoneId, dto, user);
  }

  // ── Notes ──────────────────────────────────────────────────────────────

  @Post(':id/notes')
  addNote(
    @Param('id') id: string,
    @Body() dto: CreateNoteDto,
    @SessionUserDecorator() user: SessionUserType,
  ) {
    return this.service.addNote(id, dto, user);
  }
}
