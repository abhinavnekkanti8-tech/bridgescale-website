import { EngagementsService } from './engagements.service';

describe('EngagementsService Phase 2 conversion', () => {
  function createService(overrides: Record<string, any> = {}) {
    const prisma = {
      engagement: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      lifecycleEvent: { create: jest.fn() },
      paymentPlan: { create: jest.fn() },
      invoice: { create: jest.fn() },
      user: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
      },
      ...overrides,
    };

    return { service: new EngagementsService(prisma as any, {} as any), prisma };
  }

  it('creates lifecycle event and draft conversion invoice placeholder', async () => {
    const { service, prisma } = createService();
    prisma.engagement.findUnique.mockResolvedValue({
      id: 'eng_1',
      contractId: 'contract_1',
      contract: {
        sow: { totalPriceUsd: 10000 },
        paymentPlan: null,
      },
    });
    prisma.engagement.update.mockResolvedValue({ id: 'eng_1', status: 'CONVERTED_TO_FULLTIME' });
    prisma.paymentPlan.create.mockResolvedValue({ id: 'plan_1' });
    prisma.invoice.create.mockResolvedValue({ id: 'invoice_1' });

    await expect(service.convertToFulltime('eng_1', {}, 'admin_1')).resolves.toMatchObject({
      status: 'CONVERTED_TO_FULLTIME',
    });

    expect(prisma.lifecycleEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ eventType: 'CONVERTED_TO_FULLTIME' }),
      }),
    );
    expect(prisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amountUsd: 2500, status: 'DRAFT' }),
      }),
    );
  });
});

