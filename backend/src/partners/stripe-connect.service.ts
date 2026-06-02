import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { envOrThrow, partnerLiveMode, stubId } from './partners.config';
import { OperatorProfileWithPartners } from './operator-profile-augment';

export interface StripeOnboardingLink {
  url: string;
  accountId: string;
  expiresAt: Date;
  liveMode: boolean;
}

export interface StripeAccountStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  liveMode: boolean;
}

/**
 * Stripe Connect Express integration (Implementation Plan §P6.2).
 *
 * Persists Stripe state on OperatorProfile (Phase 6 schema fields):
 *   - stripeAccountId          — Express account ID (set on first onboarding)
 *   - stripeChargesEnabled     — refreshed by getAccountStatus + webhook
 *   - stripePayoutsEnabled     — refreshed by getAccountStatus + webhook
 *   - stripeDetailsSubmitted   — refreshed by getAccountStatus + webhook
 *
 * With PARTNER_LIVE_MODE=false: stub mode returns deterministic IDs.
 * With PARTNER_LIVE_MODE=true:  live mode calls Stripe SDK + persists state.
 *
 * Run `npx prisma generate` after pulling to pick up the Phase 6 schema fields.
 */
@Injectable()
export class StripeConnectService {
  private readonly logger = new Logger(StripeConnectService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns a Stripe-hosted onboarding URL the operator is redirected to.
   * Reuses the operator's existing stripeAccountId if one exists; otherwise
   * creates a new Express account and persists its ID.
   */
  async getOnboardingLink(operatorOrgId: string, returnUrl: string): Promise<StripeOnboardingLink> {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { operatorId: operatorOrgId },
    });
    const profileEx = profile as OperatorProfileWithPartners | null;
    if (!profile) throw new Error('Operator profile not found.');

    if (!partnerLiveMode()) {
      const accountId = profileEx!.stripeAccountId ?? stubId('acct_stub');
      if (!profileEx!.stripeAccountId) {
        await this.prisma.operatorProfile.update({
          where: { id: profile.id },
          data: { stripeAccountId: accountId } as never,
        });
      }
      this.logger.warn(`[stub] Stripe Connect onboarding link requested for ${operatorOrgId} (account=${accountId})`);
      return {
        url: `${returnUrl}?stripe=stub&account=${accountId}`,
        accountId,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        liveMode: false,
      };
    }

    // ── Live mode (Phase 6 wire-up) ────────────────────────────────────────
    // const Stripe = require('stripe');
    // const stripe = new Stripe(envOrThrow('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });
    // let accountId = profileEx!.stripeAccountId;
    // if (!accountId) {
    //   const account = await stripe.accounts.create({
    //     type: 'express',
    //     capabilities: { transfers: { requested: true } },
    //   });
    //   accountId = account.id;
    //   await this.prisma.operatorProfile.update({
    //     where: { id: profile.id },
    //     data: { stripeAccountId: accountId },
    //   });
    // }
    // const link = await stripe.accountLinks.create({
    //   account: accountId,
    //   return_url: returnUrl,
    //   refresh_url: returnUrl,
    //   type: 'account_onboarding',
    // });
    // return { url: link.url, accountId, expiresAt: new Date(link.expires_at * 1000), liveMode: true };
    void envOrThrow;
    throw new Error('Stripe live mode wired but SDK call not implemented yet — see comment block.');
  }

  /**
   * Polls Stripe for an account's KYC status and persists the booleans on the
   * operator profile so the dashboard reflects payout-readiness without a
   * round-trip to Stripe on every load.
   */
  async getAccountStatus(accountId: string): Promise<StripeAccountStatus> {
    if (!partnerLiveMode()) {
      return {
        accountId,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        liveMode: false,
      };
    }
    // ── Live mode (Phase 6 wire-up) ────────────────────────────────────────
    // const Stripe = require('stripe');
    // const stripe = new Stripe(envOrThrow('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });
    // const a = await stripe.accounts.retrieve(accountId);
    // await this.prisma.operatorProfile.updateMany({
    //   where: { stripeAccountId: accountId },
    //   data: {
    //     stripeChargesEnabled: a.charges_enabled,
    //     stripePayoutsEnabled: a.payouts_enabled,
    //     stripeDetailsSubmitted: a.details_submitted,
    //   },
    // });
    // return { accountId: a.id, chargesEnabled: a.charges_enabled, payoutsEnabled: a.payouts_enabled, detailsSubmitted: a.details_submitted, liveMode: true };
    throw new Error('Stripe live mode wired but SDK call not implemented yet.');
  }

  /**
   * Webhook handler for account.updated events. Re-syncs the operator's
   * payout-readiness flags in our DB so the dashboard reflects KYC completion
   * without an explicit poll.
   */
  async handleWebhook(rawBody: string, signature: string): Promise<{ ok: true; type?: string }> {
    if (!partnerLiveMode()) {
      this.logger.warn(`[stub] Stripe webhook received (sig=${signature.slice(0, 12)}…)`);
      return { ok: true, type: 'stub' };
    }
    // ── Live mode (Phase 6 wire-up) ────────────────────────────────────────
    // const Stripe = require('stripe');
    // const stripe = new Stripe(envOrThrow('STRIPE_SECRET_KEY'), { apiVersion: '2024-06-20' });
    // const event = stripe.webhooks.constructEvent(rawBody, signature, envOrThrow('STRIPE_WEBHOOK_SECRET'));
    // if (event.type === 'account.updated') {
    //   const a = event.data.object;
    //   await this.prisma.operatorProfile.updateMany({
    //     where: { stripeAccountId: a.id },
    //     data: {
    //       stripeChargesEnabled: a.charges_enabled,
    //       stripePayoutsEnabled: a.payouts_enabled,
    //       stripeDetailsSubmitted: a.details_submitted,
    //     },
    //   });
    // }
    // return { ok: true, type: event.type };
    void rawBody; void signature;
    throw new Error('Stripe webhook live handling not implemented yet.');
  }
}
