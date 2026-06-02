import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ContractStatus,
  EorEnrollmentStatus,
  MembershipRole,
  MsaStatus,
  PaymentLedgerStatus,
  PreSowSummaryStatus,
} from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { AdminOpsService } from './admin-ops.service';

/**
 * Read-only aggregator endpoints for the admin/deal-desk surfaces.
 * All endpoints are PLATFORM_ADMIN-only.
 */
@Controller('admin-ops')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(MembershipRole.PLATFORM_ADMIN)
export class AdminOpsController {
  constructor(private readonly service: AdminOpsService) {}

  @Get('queue-counts')
  queueCounts() {
    return this.service.getQueueCounts();
  }

  @Get('pre-sow-summaries')
  preSowSummaries(@Query('status') status?: PreSowSummaryStatus) {
    return this.service.listPreSowSummaries(status);
  }

  @Get('msas')
  msas(@Query('status') status?: MsaStatus) {
    return this.service.listMsas(status);
  }

  @Get('contracts')
  contracts(@Query('status') status?: ContractStatus) {
    return this.service.listContracts(status);
  }

  @Get('compliance-decisions')
  complianceDecisions() {
    return this.service.listComplianceDecisions();
  }

  @Get('eor-enrollments')
  eorEnrollments(@Query('status') status?: EorEnrollmentStatus) {
    return this.service.listEorEnrollments(status);
  }

  @Get('payment-ledgers')
  paymentLedgers(@Query('status') status?: PaymentLedgerStatus) {
    return this.service.listPaymentLedgers(status);
  }
}
