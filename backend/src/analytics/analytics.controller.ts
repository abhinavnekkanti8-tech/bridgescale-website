import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '../common/enums/role.enum';

@Controller('admin/analytics')
@UseGuards(SessionAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('dashboard')
  @Roles(MembershipRole.PLATFORM_ADMIN)
  async getDashboardMetrics() {
    return this.service.getDashboardMetrics();
  }
}
