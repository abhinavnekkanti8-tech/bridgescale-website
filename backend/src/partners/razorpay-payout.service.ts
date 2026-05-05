import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { partnerLiveMode, stubId } from './partners.config';
import { OperatorProfileWithPartners } from './operator-profile-augment';

export interface RazorpayPayoutResult {
  payoutId: string;
  status: 'queued' | 'processing' | 'processed' | 'rejected';
  amountInPaise: number;
  fundAccountId: string;
  liveMode: boolean;
}

export interface RazorpayFundAccountInput {
  operatorOrgId: string;
  contactName: string;
  accountNumber: string;
  ifsc: string;
}

/**
 * Razorpay payout integration (Implementation Plan §P6.3 / Scenario B).
 *
 * Persists razorpayFundAccountId on OperatorProfile. The operator's Indian
 * bank account is created once via createFundAccount, then reused for every
 * payout. createPayout fails if no fund account is on file.
 *
 * Live mode requires:
 *   - RAZORPAYX_KEY_ID + RAZORPAYX_KEY_SECRET (separate from collection-side keys)
 *   - RAZORPAYX_ACCOUNT_NUMBER (the platform's source account)
 *   - The operator's contact created via Razorpay Contact API (per fund-account)
 */
@Injectable()
export class RazorpayPayoutService {
  private readonly logger = new Logger(RazorpayPayoutService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Creates (or returns) the operator's Razorpay fund account. */
  async createFundAccount(input: RazorpayFundAccountInput): Promise<string> {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { operatorId: input.operatorOrgId },
    });
    const profileEx = profile as OperatorProfileWithPartners | null;
    if (!profile) throw new BadRequestException('Operator profile not found.');

    if (profileEx!.razorpayFundAccountId) return profileEx!.razorpayFundAccountId;

    if (!partnerLiveMode()) {
      const fundAccountId = stubId('fa_stub');
      await this.prisma.operatorProfile.update({
        where: { id: profile.id },
        data: { razorpayFundAccountId: fundAccountId } as never,
      });
      this.logger.warn(`[stub] Razorpay fund-account created for ${input.operatorOrgId} -> ${fundAccountId}`);
      return fundAccountId;
    }

    // ── Live mode (Phase 6 wire-up) ────────────────────────────────────────
    // const Razorpay = require('razorpay');
    // const rzp = new Razorpay({ key_id: envOrThrow('RAZORPAYX_KEY_ID'), key_secret: envOrThrow('RAZORPAYX_KEY_SECRET') });
    // const contact = await rzp.contacts.create({ name: input.contactName, type: 'vendor', reference_id: profile.id });
    // const fundAccount = await rzp.fund_accounts.create({
    //   contact_id: contact.id,
    //   account_type: 'bank_account',
    //   bank_account: { name: input.contactName, account_number: input.accountNumber, ifsc: input.ifsc },
    // });
    // await this.prisma.operatorProfile.update({
    //   where: { id: profile.id },
    //   data: { razorpayFundAccountId: fundAccount.id },
    // });
    // return fundAccount.id;
    throw new Error('Razorpay createFundAccount live mode wired but SDK call not implemented yet.');
  }

  async createPayout(params: {
    invoiceId: string;
    operatorOrgId: string;
    amountInr: number;
    purpose: string;
  }): Promise<RazorpayPayoutResult> {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { operatorId: params.operatorOrgId },
    });
    const profileEx = profile as OperatorProfileWithPartners | null;
    if (!profile) throw new BadRequestException('Operator profile not found.');
    if (!profileEx!.razorpayFundAccountId) {
      throw new BadRequestException('Operator has no Razorpay fund account on file. Call createFundAccount first.');
    }

    const amountInPaise = Math.round(params.amountInr * 100);
    const fundAccountId = profileEx!.razorpayFundAccountId;

    if (!partnerLiveMode()) {
      const payoutId = stubId('payout_stub');
      this.logger.warn(`[stub] Razorpay payout requested for ${params.operatorOrgId} (invoice ${params.invoiceId}) ${params.amountInr} INR`);
      return {
        payoutId,
        status: 'queued',
        amountInPaise,
        fundAccountId,
        liveMode: false,
      };
    }

    // ── Live mode (Phase 6 wire-up) ────────────────────────────────────────
    // const Razorpay = require('razorpay');
    // const rzp = new Razorpay({ key_id: envOrThrow('RAZORPAYX_KEY_ID'), key_secret: envOrThrow('RAZORPAYX_KEY_SECRET') });
    // const result = await rzp.payouts.create({
    //   account_number: envOrThrow('RAZORPAYX_ACCOUNT_NUMBER'),
    //   fund_account_id: fundAccountId,
    //   amount: amountInPaise,
    //   currency: 'INR',
    //   mode: 'IMPS',
    //   purpose: params.purpose,
    //   queue_if_low_balance: true,
    //   reference_id: params.invoiceId,
    // });
    // return { payoutId: result.id, status: result.status, amountInPaise, fundAccountId, liveMode: true };
    throw new Error('Razorpay createPayout live mode wired but SDK call not implemented yet.');
  }

  async getPayoutStatus(payoutId: string): Promise<RazorpayPayoutResult> {
    if (!partnerLiveMode()) {
      return {
        payoutId,
        status: 'processed',
        amountInPaise: 0,
        fundAccountId: 'fa_stub',
        liveMode: false,
      };
    }
    throw new Error('Razorpay payout-status live call not implemented yet.');
  }

  async handleWebhook(rawBody: string, signature: string): Promise<{ ok: true }> {
    if (!partnerLiveMode()) {
      this.logger.warn(`[stub] Razorpay payout webhook received (sig=${signature.slice(0, 12)}…)`);
      return { ok: true };
    }
    void rawBody;
    throw new Error('Razorpay webhook live handling not implemented yet.');
  }
}
