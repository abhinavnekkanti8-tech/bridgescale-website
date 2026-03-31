import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { StartupsService } from './startups.service';
import { CreateStartupProfileDto } from './dto/create-startup-profile.dto';
import { UpdateStartupProfileDto } from './dto/update-startup-profile.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionUser } from '../common/types/session.types';
import { MembershipRole } from '@prisma/client';
import { IsInt, IsString, Min, Max } from 'class-validator';

class OverrideScoreDto {
  @IsInt() @Min(0) @Max(100) scoreTotal: number;
  @IsString() overrideReason: string;
}

@Controller('startups')
@UseGuards(SessionAuthGuard, RolesGuard)
export class StartupsController {
  constructor(private readonly startupsService: StartupsService) {}

  /**
   * POST /api/v1/startups
   * Create or upsert a startup profile (Startup Admin only).
   */
  @Post()
  @Roles(MembershipRole.STARTUP_ADMIN)
  async create(
    @Body() dto: CreateStartupProfileDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.startupsService.create(user.orgId, dto);
  }

  /**
   * PATCH /api/v1/startups/:id
   * Update a startup profile (Startup Admin only).
   */
  @Patch(':id')
  @Roles(MembershipRole.STARTUP_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateStartupProfileDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.startupsService.update(id, user.orgId, dto);
  }

  /**
   * GET /api/v1/startups/me
   * Get the current startup's own profile.
   */
  @Get('me')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.STARTUP_MEMBER)
  async getMyProfile(@CurrentUser() user: SessionUser) {
    return this.startupsService.findByOrgId(user.orgId);
  }

  /**
   * GET /api/v1/startups
   * List all startup profiles (Platform Admin only).
   */
  @Get()
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async findAll() {
    return this.startupsService.findAll();
  }

  /**
   * GET /api/v1/startups/:id
   * Get a specific startup profile (Admin or own org).
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.startupsService.findOne(id);
  }

  /**
   * POST /api/v1/startups/:id/score
   * Trigger AI readiness scoring (queues async job).
   */
  @Post(':id/score')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.PLATFORM_ADMIN)
  async requestScore(@Param('id') id: string) {
    return this.startupsService.requestScore(id);
  }

  /**
   * GET /api/v1/startups/:id/scores
   * Get score history for a startup profile.
   */
  @Get(':id/scores')
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.STARTUP_MEMBER, MembershipRole.PLATFORM_ADMIN)
  async getScores(@Param('id') id: string) {
    return this.startupsService.getScores(id);
  }

  /**
   * PATCH /api/v1/scores/:scoreId/override
   * Admin override of a readiness score with audit trail.
   */
  @Patch('scores/:scoreId/override')
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async overrideScore(
    @Param('scoreId') scoreId: string,
    @Body() dto: OverrideScoreDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.startupsService.overrideScore(scoreId, user, dto);
  }
}
