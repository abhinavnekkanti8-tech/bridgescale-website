import { Body, Controller, Headers, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { EorPartner, MembershipRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { SessionUser } from '../common/types/session.types';
import { StripeConnectService } from './stripe-connect.service';
import { RazorpayPayoutService } from './razorpay-payout.service';
import { WiseService } from './wise.service';
import { DeelService } from './eor/deel.service';
import { RemoteService } from './eor/remote.service';
import { MultiplierService } from './eor/multiplier.service';

/**
 * Phase-6 partner-API surface:
 *   - Stripe Connect Express onboarding (operator-initiated)
 *   - Webhooks for Stripe / Razorpay / Wise / each EOR partner
 *
 * All endpoints are env-flagged. With PARTNER_LIVE_MODE=false they exercise
 * the same DB writes a live response would, but skip outbound HTTP.
 */
@Controller('partners')
export class PartnersController {
  constructor(
    private readonly stripe: StripeConnectService,
    private readonly razorpay: RazorpayPayoutService,
    private readonly wise: WiseService,
    private readonly deel: DeelService,
    private readonly remote: RemoteService,
    private readonly multiplier: MultiplierService,
  ) {}

  // ── Operator-initiated: Stripe onboarding-link ─────────────────────────
  @Post('stripe/onboarding-link')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(MembershipRole.OPERATOR)
  stripeOnboardingLink(
    @CurrentUser() user: SessionUser,
    @Body() dto: { returnUrl: string },
  ) {
    return this.stripe.getOnboardingLink(user.orgId, dto.returnUrl);
  }

  // ── Webhooks ────────────────────────────────────────────────────────────
  // Webhooks bypass the session guard (signed by partner). They are validated
  // inside each service via the partner SDK's signature check.

  @Post('stripe/webhook')
  @HttpCode(200)
  stripeWebhook(@Req() req: Request, @Headers('stripe-signature') sig: string) {
    return this.stripe.handleWebhook(req.body?.toString() ?? '', sig ?? '');
  }

  @Post('razorpay/webhook')
  @HttpCode(200)
  razorpayWebhook(@Req() req: Request, @Headers('x-razorpay-signature') sig: string) {
    return this.razorpay.handleWebhook(req.body?.toString() ?? '', sig ?? '');
  }

  @Post('wise/webhook')
  @HttpCode(200)
  wiseWebhook(@Req() req: Request, @Headers('x-signature-sha256') sig: string) {
    return this.wise.handleWebhook(req.body?.toString() ?? '', sig ?? '');
  }

  @Post('eor/:partner/webhook')
  @HttpCode(200)
  eorWebhook(
    @Param('partner') partner: string,
    @Req() req: Request,
    @Headers('x-partner-signature') sig: string,
  ) {
    const body = req.body?.toString() ?? '';
    switch (partner.toUpperCase()) {
      case EorPartner.DEEL: return this.deel.handleWebhook(body, sig ?? '');
      case EorPartner.REMOTE: return this.remote.handleWebhook(body, sig ?? '');
      case EorPartner.MULTIPLIER: return this.multiplier.handleWebhook(body, sig ?? '');
      default: return { ok: false, error: `unknown partner: ${partner}` };
    }
  }
}
