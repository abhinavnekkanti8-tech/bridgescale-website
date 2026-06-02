import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SessionUser } from '../common/types/session.types';
import { UpsertOperatorTaxProfileDto } from './dto/operator-tax-profile.dto';
import { OperatorTaxProfileService } from './operator-tax-profile.service';

@Controller('operator-tax-profile')
@UseGuards(SessionAuthGuard, RolesGuard)
export class OperatorTaxProfileController {
  constructor(private readonly service: OperatorTaxProfileService) {}

  /** Status summary for the current operator: which forms are on file + gating flags. */
  @Get('me')
  @Roles(MembershipRole.OPERATOR)
  getMine(@CurrentUser() user: SessionUser) {
    return this.service.getStatusForOperatorOrg(user.orgId);
  }

  @Post()
  @Roles(MembershipRole.OPERATOR)
  upsertMine(@CurrentUser() user: SessionUser, @Body() dto: UpsertOperatorTaxProfileDto) {
    return this.service.upsertForOperatorOrg(user.orgId, dto);
  }
}

