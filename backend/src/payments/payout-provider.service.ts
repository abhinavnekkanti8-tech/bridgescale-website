import { Injectable } from '@nestjs/common';
import { PayoutProvider } from '@prisma/client';

export interface PlannedPayout {
  provider: PayoutProvider;
  amount: number;
  currency: string;
  dummyMode: true;
  providerRef: string;
  metadata: Record<string, unknown>;
}

@Injectable()
export class PayoutProviderService {
  planPayout(params: {
    provider: PayoutProvider;
    ledgerId: string;
    amount: number;
    currency: string;
  }): PlannedPayout {
    return {
      provider: params.provider,
      amount: params.amount,
      currency: params.currency,
      dummyMode: true,
      providerRef: `${params.provider.toLowerCase()}_${params.ledgerId}_placeholder`,
      metadata: {
        phase: 'PHASE_3_SKELETON',
        liveApiCalled: false,
      },
    };
  }
}

