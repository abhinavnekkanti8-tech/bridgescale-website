import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { OperatorsService } from './operators.service';
import { CreateOperatorProfileDto } from './dto/create-operator-profile.dto';
import { UpdateOperatorProfileDto } from './dto/update-operator-profile.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
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

class AcceptInviteDto {
  @IsString() token: string;
  @IsString() name: string;
  @IsString() password: string;
}

@Controller('operators')
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  // ── Invite endpoints (admin-only except accept) ───────────────────────────

  /** POST /api/v1/operators/invites — Create an invite (admin) */
  @Post('invites')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  createInvite(@Body() dto: CreateInviteDto) {
    return this.operatorsService.createInvite(dto);
  }

  /** GET /api/v1/operators/invites — List invites (admin) */
  @Get('invites')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  listInvites() {
    return this.operatorsService.listInvites();
  }

  /** PATCH /api/v1/operators/invites/:id/revoke — Revoke invite (admin) */
  @Patch('invites/:id/revoke')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  revokeInvite(@Param('id') id: string) {
    return this.operatorsService.revokeInvite(id);
  }

  /** POST /api/v1/operators/invites/accept — Accept invite (public) */
  @Post('invites/accept')
  acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.operatorsService.acceptInvite(dto.token, dto.name, dto.password);
  }

  // ── Profile endpoints ─────────────────────────────────────────────────────

  /** POST /api/v1/operators/profile — Create operator profile */
  @Post('profile')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.OPERATOR)
  createProfile(@Body() dto: CreateOperatorProfileDto, @CurrentUser() user: SessionUser) {
    return this.operatorsService.createProfile(user.orgId, dto);
  }

  /** GET /api/v1/operators/profile/me — Get own profile */
  @Get('profile/me')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.OPERATOR)
  getMyProfile(@CurrentUser() user: SessionUser) {
    return this.operatorsService.findByOrgId(user.orgId);
  }

  /** PATCH /api/v1/operators/profile/:id — Update operator profile */
  @Patch('profile/:id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.OPERATOR)
  updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateOperatorProfileDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.operatorsService.updateProfile(id, user.orgId, dto);
  }

  // ── Admin endpoints ───────────────────────────────────────────────────────

  /** GET /api/v1/operators — List all operators (admin) */
  @Get()
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  findAll() {
    return this.operatorsService.findAll();
  }

  /** GET /api/v1/operators/:id — Get specific operator profile */
  @Get(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN, MembershipRole.OPERATOR)
  findOne(@Param('id') id: string) {
    return this.operatorsService.findOne(id);
  }

  /** POST /api/v1/operators/:id/score — Trigger quality scoring */
  @Post(':id/score')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN, MembershipRole.OPERATOR)
  requestScore(@Param('id') id: string) {
    return this.operatorsService.requestScore(id);
  }

  /** GET /api/v1/operators/:id/scores — Get score history */
  @Get(':id/scores')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN, MembershipRole.OPERATOR)
  getScores(@Param('id') id: string) {
    return this.operatorsService.getScores(id);
  }

  /** PATCH /api/v1/operators/:id/verify — Verify/reject operator (admin) */
  @Patch(':id/verify')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  verifyOperator(@Param('id') id: string, @Body('action') action: 'VERIFIED' | 'REJECTED') {
    return this.operatorsService.verifyOperator(id, action);
  }

  /** PATCH /api/v1/operators/scores/:scoreId/override — Admin override */
  @Patch('scores/:scoreId/override')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  overrideScore(
    @Param('scoreId') scoreId: string,
    @Body() dto: OverrideScoreDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.operatorsService.overrideScore(scoreId, user, dto);
  }
}
