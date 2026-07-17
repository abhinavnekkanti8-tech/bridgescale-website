import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentPlanDto,
  CreatePayoutAttemptDto,
  GenerateLedgerDto,
  IssueInvoiceDto,
  UpdateLedgerReviewDto,
} from './dto/payments.dto';
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

  /** POST /api/v1/payments/ledger — Generate or refresh payment ledger skeleton */
  @Post('ledger')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  generateLedger(@Body() dto: GenerateLedgerDto) {
    return this.paymentsService.generateLedger(dto);
  }

  /** GET /api/v1/payments/ledger/contract/:contractId — View ledger by contract */
  @Get('ledger/contract/:contractId')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  getLedgerByContract(@Param('contractId') contractId: string) {
    return this.paymentsService.getLedgerByContract(contractId);
  }

  /** PATCH /api/v1/payments/ledger/:id/review — Founder/admin review marker */
  @Patch('ledger/:id/review')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  updateLedgerReview(@Param('id') id: string, @Body() dto: UpdateLedgerReviewDto) {
    return this.paymentsService.updateLedgerReview(id, dto);
  }

  /** POST /api/v1/payments/ledger/:id/payout-attempt — Create dummy payout attempt */
  @Post('ledger/:id/payout-attempt')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.PLATFORM_ADMIN)
  createPayoutAttempt(@Param('id') id: string, @Body() dto: CreatePayoutAttemptDto) {
    return this.paymentsService.createPayoutAttempt(id, dto);
  }

  /**
   * POST /api/v1/payments/webhook — Stripe Webhook Endpoint.
   * Unauthenticated by design (called by Stripe), but the raw body is verified
   * against the Stripe signature inside the service before any state change.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req.rawBody ?? Buffer.alloc(0)).toString('utf-8');
    return this.paymentsService.handleStripeWebhook(rawBody, signature ?? '');
  }


  /**
   * GET /api/v1/payments/mode — surfaces which payment surfaces are live.
   * Used by the UI to show a "Dummy mode" / "Live mode" banner so testers
   * never confuse a stub success with a real charge.
   */
  @Get('mode')
  getMode() {
    return {
      dummyPaymentMode: process.env.DUMMY_PAYMENT_MODE === 'true',
      partnerLiveMode: process.env.PARTNER_LIVE_MODE === 'true',
      env: process.env.NODE_ENV ?? 'development',
    };
  }
}
