import { BadRequestException } from '@nestjs/common';
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

    return {
      service: new PaymentsService(prisma as any, payoutProvider as any),
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

