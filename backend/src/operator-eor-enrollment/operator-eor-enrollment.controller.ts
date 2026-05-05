import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { SessionUser } from '../common/types/session.types';
import {
  RequestEorEnrollmentDto,
  UpdateEorEnrollmentStatusDto,
} from './dto/operator-eor-enrollment.dto';
import { OperatorEorEnrollmentService } from './operator-eor-enrollment.service';

@Controller('operator-eor-enrollments')
@UseGuards(SessionAuthGuard, RolesGuard)
export class OperatorEorEnrollmentController {
  constructor(private readonly service: OperatorEorEnrollmentService) {}

  /** Returns one row per partner (DEEL / REMOTE / MULTIPLIER), placeholder when missing. */
  @Get('me')
  @Roles(MembershipRole.OPERATOR)
  listMine(@CurrentUser() user: SessionUser) {
    return this.service.listForOperatorOrg(user.orgId);
  }

  /** Operator requests enrollment with a specific EOR partner. */
  @Post('me/request')
  @Roles(MembershipRole.OPERATOR)
  requestMine(
    @CurrentUser() user: SessionUser,
    @Body() dto: RequestEorEnrollmentDto,
  ) {
    return this.service.requestEnrollment(user.orgId, dto.partner);
  }

  /** Admin updates partner-side status (manual today; partner API in Phase 6). */
  @Patch(':id/status')
  @Roles(MembershipRole.PLATFORM_ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEorEnrollmentStatusDto,
  ) {
    return this.service.updateStatus(id, dto.status, dto.partnerSideId);
  }

  /** Operator triggers a status re-sync from the partner. */
  @Post(':id/sync')
  @Roles(MembershipRole.OPERATOR, MembershipRole.PLATFORM_ADMIN)
  syncStatus(@Param('id') id: string) {
    return this.service.syncStatusFromPartner(id);
  }
}
