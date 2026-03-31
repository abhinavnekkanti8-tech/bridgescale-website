import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentPlanDto, IssueInvoiceDto } from './dto/payments.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MembershipRole } from '@prisma/client';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** POST /api/v1/payments/plan — Create a payment plan (Admin only) */
  @Post('plan')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  createPaymentPlan(@Body() dto: CreatePaymentPlanDto) {
    return this.paymentsService.createPaymentPlan(dto);
  }

  /** GET /api/v1/payments/plan/:contractId — Get a payment plan */
  @Get('plan/:contractId')
  @UseGuards(SessionAuthGuard)
  getPaymentPlan(@Param('contractId') contractId: string) {
    return this.paymentsService.getPaymentPlanByContract(contractId);
  }

  /** POST /api/v1/payments/invoice — Issue an invoice (Admin only) */
  @Post('invoice')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  issueInvoice(@Body() dto: IssueInvoiceDto) {
    return this.paymentsService.issueInvoice(dto);
  }

  /** GET /api/v1/payments/invoice — List all invoices (Admin) */
  @Get('invoice')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  getAllInvoices() {
    return this.paymentsService.getAllInvoices();
  }

  /** GET /api/v1/payments/invoice/startup/:id — Get startup invoices */
  @Get('invoice/startup/:id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.STARTUP_ADMIN, MembershipRole.PLATFORM_ADMIN)
  getStartupInvoices(@Param('id') id: string) {
    return this.paymentsService.getInvoicesByStartup(id);
  }

  /** PATCH /api/v1/payments/invoice/:id/pay — Mark paid manually (Admin) */
  @Patch('invoice/:id/pay')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  markInvoicePaid(@Param('id') id: string) {
    return this.paymentsService.markInvoicePaid(id);
  }

  /** PATCH /api/v1/payments/invoice/:id/overdue — Mark overdue manually (Admin) */
  @Patch('invoice/:id/overdue')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  markInvoiceOverdue(@Param('id') id: string) {
    return this.paymentsService.markInvoiceOverdue(id);
  }

  /** POST /api/v1/payments/webhook — Stripe Webhook Endpoint */
  @Post('webhook')
  handleWebhook(@Body() payload: any) {
    // Open endpoint for external service (Stripe)
    return this.paymentsService.handleStripeWebhook(payload);
  }
}
