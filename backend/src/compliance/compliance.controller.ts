import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MembershipRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { SessionUser } from '../common/types/session.types';
import { ComplianceService } from './compliance.service';
import { DataDeleteRequestDto, DataExportRequestDto } from './dto/data-request.dto';

@Controller('compliance')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(MembershipRole.PLATFORM_ADMIN)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('processors')
  getProcessorRegister() {
    return this.complianceService.getProcessorRegister();
  }

  @Get('retention-policy')
  getRetentionPolicy() {
    return this.complianceService.getRetentionPolicy();
  }

  @Get('requests')
  listRequests() {
    return this.complianceService.listRequests();
  }

  @Post('requests/export')
  exportSubjectData(
    @CurrentUser() user: SessionUser,
    @Body() dto: DataExportRequestDto,
  ) {
    return this.complianceService.exportSubjectData(dto.subjectEmail, user, dto.reason);
  }

  @Post('requests/delete')
  deleteSubjectData(
    @CurrentUser() user: SessionUser,
    @Body() dto: DataDeleteRequestDto,
  ) {
    return this.complianceService.deleteSubjectData(dto.subjectEmail, user, dto.reason);
  }
}
