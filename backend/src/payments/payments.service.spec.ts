import { BadRequestException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { PaymentsService } from './payments.service';

describe('PaymentsService Phase 3 ledger skeleton', () => {
  function createService(overrides: Record<string, any> = {}) {
    const prisma = {
      paymentPlan: { findUnique: jest.fn() },
      operatorTaxProfile: { findFirst: jest.fn() },
      complianceDecisionLog: { create: jest.fn().mockResolvedValue({ id: 'log_1' }) },
      paymentLedger: {
        upsert: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payoutAttempt: { create: jest.fn() },
      ...overrides,
    };
    const payoutProvider = {
      planPayout: jest.fn((params) => ({
        provider: params.provider,
        amount: params.amount,
        currency: params.currency,
        dummyMode: true,
        providerRef: `dummy_${params.ledgerId}`,
        metadata: { liveApiCalled: false },
      })),
    };

    const config = {
      get: jest.fn((_key: string, defaultValue?: string) => defaultValue),
    };

    return {
      service: new PaymentsService(prisma as any, payoutProvider as any, config as any),
      prisma,
      payoutProvider,
    };
  }

  it('generates a ledger split with platform fee, operator payout, tax, and compliance status', async () => {
    const { service, prisma } = createService();
    prisma.paymentPlan.findUnique.mockResolvedValue({
      id: 'plan_1',
      contractId: 'contract_1',
      totalAmountUsd: 10000,
      billingCurrency: 'USD',
      payoutCurrency: 'USD',
      fxRateAtSigning: null,
      invoices: [{ amountUsd: 10000 }],
      contract: {
        sow: {
          id: 'sow_1',
          operatorId: 'operator_org_1',
          engagementType: 'SPRINT',
          retainerFlavour: null,
          weeklyHours: 10,
        },
      },
    });
    prisma.operatorTaxProfile.findFirst.mockResolvedValue({ formStatus: 'VERIFIED' });
    prisma.paymentLedger.upsert.mockResolvedValue({
      id: 'ledger_1',
      invoiceAmount: 10000,
      platformFeeAmount: 1000,
      operatorPayoutAmount: 9000,
      taxReady: true,
      payoutReady: true,
    });

    await expect(service.generateLedger({ contractId: 'contract_1' })).resolves.toMatchObject({
      platformFeeAmount: 1000,
      operatorPayoutAmount: 9000,
      payoutReady: true,
    });

    expect(prisma.complianceDecisionLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ mode: 'CONTRACTOR' }),
      }),
    );
  });

  it('blocks payout attempt when ledger is not payout-ready', async () => {
    const { service, prisma } = createService();
    prisma.paymentLedger.findUnique.mockResolvedValue({ id: 'ledger_1', payoutReady: false });

    await expect(
      service.createPayoutAttempt('ledger_1', { provider: 'DUMMY' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a dummy payout attempt for a payout-ready ledger', async () => {
    const { service, prisma, payoutProvider } = createService();
    prisma.paymentLedger.findUnique.mockResolvedValue({
      id: 'ledger_1',
      payoutReady: true,
      operatorPayoutAmount: 9000,
      payoutCurrency: 'USD',
      billingCurrency: 'USD',
    });
    prisma.payoutAttempt.create.mockResolvedValue({ id: 'payout_1', dummyMode: true });

    await expect(
      service.createPayoutAttempt('ledger_1', { provider: 'DUMMY' } as any),
    ).resolves.toEqual({ id: 'payout_1', dummyMode: true });

    expect(payoutProvider.planPayout).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 9000, currency: 'USD' }),
    );
  });
});

describe('PaymentsService.handleStripeWebhook signature verification', () => {
  const SECRET = 'whsec_test_secret_value_123456';

  function createService() {
    const prisma = {
      paymentEvent: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
      invoice: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    const config = {
      get: jest.fn((key: string, defaultValue?: string) =>
        key === 'STRIPE_WEBHOOK_SECRET' ? SECRET : defaultValue,
      ),
    };
    return {
      service: new PaymentsService(prisma as any, {} as any, config as any),
      prisma,
    };
  }

  function sign(rawBody: string, timestamp = Math.floor(Date.now() / 1000)) {
    const signature = createHmac('sha256', SECRET)
      .update(`${timestamp}.${rawBody}`, 'utf8')
      .digest('hex');
    return `t=${timestamp},v1=${signature}`;
  }

  it('rejects an unsigned (forged) payload', async () => {
    const { service, prisma } = createService();
    const forged = JSON.stringify({
      id: 'evt_forged',
      type: 'invoice.paid',
      data: { object: { id: 'in_123', amount_paid: 100000 } },
    });

    await expect(service.handleStripeWebhook(forged, '')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.invoice.update).not.toHaveBeenCalled();
  });

  it('rejects a payload signed with the wrong secret', async () => {
    const { service, prisma } = createService();
    const body = JSON.stringify({ id: 'evt_1', type: 'invoice.paid', data: { object: { id: 'in_1' } } });
    const timestamp = Math.floor(Date.now() / 1000);
    const badSignature = createHmac('sha256', 'the_wrong_secret')
      .update(`${timestamp}.${body}`, 'utf8')
      .digest('hex');

    await expect(
      service.handleStripeWebhook(body, `t=${timestamp},v1=${badSignature}`),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.invoice.update).not.toHaveBeenCalled();
  });

  it('accepts a correctly-signed payload', async () => {
    const { service } = createService();
    const body = JSON.stringify({
      id: 'evt_ok',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_1' } },
    });

    await expect(service.handleStripeWebhook(body, sign(body))).resolves.toEqual({
      received: true,
    });
  });
});

