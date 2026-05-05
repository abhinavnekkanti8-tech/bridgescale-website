import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { partnerLiveMode, stubId } from './partners.config';
import { OperatorProfileWithPartners } from './operator-profile-augment';

export interface WiseQuote {
  quoteId: string;
  sourceCurrency: string;
  targetCurrency: string;
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  fee: number;
  liveMode: boolean;
}

export interface WiseTransfer {
  transferId: string;
  quoteId: string;
  status: 'incoming_payment_waiting' | 'processing' | 'outgoing_payment_sent' | 'cancelled' | 'funds_refunded';
  trackingUrl?: string;
  liveMode: boolean;
}

export interface WiseRecipientInput {
  operatorOrgId: string;
  /** ISO currency code: INR, USD, EUR, GBP, AUD, SGD, AED. */
  currency: string;
  /** Country ISO code where the recipient bank is held. */
  country: string;
  /** Account holder full legal name. */
  accountHolderName: string;
  /** Free-form account details — Wise's required fields vary by corridor. */
  accountDetails: Record<string, string | number>;
}

/**
 * Wise (TransferWise) integration (Implementation Plan §P6.4).
 *
 * Persists wiseRecipientId on OperatorProfile. The operator's recipient is
 * created once via createRecipient, then reused for every transfer.
 *
 * Live mode requires:
 *   - WISE_API_TOKEN
 *   - WISE_PROFILE_ID (the platform's business profile)
 */
@Injectable()
export class WiseService {
  private readonly logger = new Logger(WiseService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Creates (or returns) the operator's Wise recipient. */
  async createRecipient(input: WiseRecipientInput): Promise<string> {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { operatorId: input.operatorOrgId },
    });
    const profileEx = profile as OperatorProfileWithPartners | null;
    if (!profile) throw new BadRequestException('Operator profile not found.');
    if (profileEx!.wiseRecipientId) return profileEx!.wiseRecipientId;

    if (!partnerLiveMode()) {
      const recipientId = stubId('wise_rec_stub');
      await this.prisma.operatorProfile.update({
        where: { id: profile.id },
        data: { wiseRecipientId: recipientId } as never,
      });
      this.logger.warn(`[stub] Wise recipient created for ${input.operatorOrgId} (${input.currency}/${input.country}) -> ${recipientId}`);
      return recipientId;
    }

    // ── Live mode (Phase 6 wire-up) ────────────────────────────────────────
    // const res = await fetch('https://api.wise.com/v1/accounts', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${envOrThrow('WISE_API_TOKEN')}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     currency: input.currency,
    //     type: input.currency === 'INR' ? 'indian' : 'iban', // varies by corridor
    //     profile: Number(envOrThrow('WISE_PROFILE_ID')),
    //     accountHolderName: input.accountHolderName,
    //     details: input.accountDetails,
    //   }),
    // });
    // const recipient = await res.json();
    // await this.prisma.operatorProfile.update({
    //   where: { id: profile.id },
    //   data: { wiseRecipientId: String(recipient.id) },
    // });
    // return String(recipient.id);
    throw new Error('Wise createRecipient live mode wired but SDK call not implemented yet.');
  }

  async createQuote(params: {
    sourceCurrency: string;
    targetCurrency: string;
    sourceAmount: number;
  }): Promise<WiseQuote> {
    if (!partnerLiveMode()) {
      // Hard-coded indicative rate for stub mode. Replace with the actual Wise quote response in live mode.
      const rate = params.targetCurrency === 'INR' ? 84.0 : 1.0;
      const fee = params.sourceAmount * 0.005;
      const targetAmount = (params.sourceAmount - fee) * rate;
      const quoteId = stubId('quote_stub');
      this.logger.warn(`[stub] Wise quote ${params.sourceAmount} ${params.sourceCurrency} -> ${params.targetCurrency} (q=${quoteId})`);
      return {
        quoteId,
        sourceCurrency: params.sourceCurrency,
        targetCurrency: params.targetCurrency,
        sourceAmount: params.sourceAmount,
        targetAmount,
        rate,
        fee,
        liveMode: false,
      };
    }
    // ── Live mode (Phase 6 wire-up) ────────────────────────────────────────
    // POST https://api.wise.com/v3/profiles/{profileId}/quotes
    //   body: { sourceCurrency, targetCurrency, sourceAmount, payOut: 'BANK_TRANSFER' }
    // const q = await res.json();
    // return { quoteId: q.id, sourceCurrency: q.sourceCurrency, targetCurrency: q.targetCurrency,
    //          sourceAmount: q.sourceAmount, targetAmount: q.targetAmount, rate: q.rate, fee: q.paymentOptions[0].fee.total, liveMode: true };
    throw new Error('Wise quote live call not implemented yet.');
  }

  async createTransfer(params: {
    quoteId: string;
    operatorOrgId: string;
    invoiceId: string;
  }): Promise<WiseTransfer> {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { operatorId: params.operatorOrgId },
    });
    const profileEx = profile as OperatorProfileWithPartners | null;
    if (!profile) throw new BadRequestException('Operator profile not found.');
    if (!profileEx!.wiseRecipientId) {
      throw new BadRequestException('Operator has no Wise recipient on file. Call createRecipient first.');
    }

    if (!partnerLiveMode()) {
      const transferId = stubId('xfer_stub');
      this.logger.warn(`[stub] Wise transfer ${transferId} created for ${params.operatorOrgId} (invoice ${params.invoiceId})`);
      return {
        transferId,
        quoteId: params.quoteId,
        status: 'incoming_payment_waiting',
        trackingUrl: `https://wise.com/track/stub/${transferId}`,
        liveMode: false,
      };
    }
    // ── Live mode (Phase 6 wire-up) ────────────────────────────────────────
    // POST https://api.wise.com/v1/transfers
    //   body: { targetAccount: profileEx!.wiseRecipientId, quoteUuid: params.quoteId,
    //           customerTransactionId: params.invoiceId, details: { reference: ... } }
    // Then POST /v3/profiles/{profileId}/transfers/{transferId}/payments to fund.
    throw new Error('Wise createTransfer live mode wired but SDK call not implemented yet.');
  }

  async getTransferStatus(transferId: string): Promise<WiseTransfer> {
    if (!partnerLiveMode()) {
      return {
        transferId,
        quoteId: 'quote_stub',
        status: 'outgoing_payment_sent',
        liveMode: false,
      };
    }
    throw new Error('Wise transfer-status live call not implemented yet.');
  }

  async handleWebhook(rawBody: string, signature: string): Promise<{ ok: true }> {
    if (!partnerLiveMode()) {
      this.logger.warn(`[stub] Wise webhook received (sig=${signature.slice(0, 12)}…)`);
      return { ok: true };
    }
    void rawBody;
    throw new Error('Wise webhook live handling not implemented yet.');
  }
}
