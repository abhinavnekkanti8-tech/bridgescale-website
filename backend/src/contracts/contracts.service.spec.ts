import { BadRequestException } from '@nestjs/common';
import { ContractsService } from './contracts.service';

describe('ContractsService Phase 2 flows', () => {
  function createService(overrides: Record<string, any> = {}) {
    const prisma = {
      preSowCommercialSummary: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      serviceTemplate: { findUnique: jest.fn() },
      statementOfWork: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      sowVersion: { create: jest.fn() },
      cancellationEvent: { create: jest.fn() },
      ...overrides,
    };
    const msaService = {
      findOrCreateMsa: jest.fn().mockResolvedValue({ id: 'msa_1' }),
    };

    return {
      service: new ContractsService(
        prisma as any,
        { getModelName: jest.fn(() => 'test-model') } as any,
        { get: jest.fn(() => 'true') } as any,
        {} as any,
        msaService as any,
      ),
      prisma,
      msaService,
    };
  }

  it('requires a confirmed Pre-SOW Summary before generating SOW', async () => {
    const { service, prisma } = createService();
    prisma.preSowCommercialSummary.findUnique.mockResolvedValue({ id: 'summary_1', status: 'SHARED' });

    await expect(service.generateSowFromSummary('summary_1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('generates SOW v1 from ServiceTemplate and confirmed Pre-SOW Summary', async () => {
    const { service, prisma } = createService();
    prisma.preSowCommercialSummary.findUnique.mockResolvedValue({
      id: 'summary_1',
      status: 'CONFIRMED',
      callId: 'call_1',
      startupProfileId: 'startup_1',
      operatorId: 'operator_1',
      serviceTemplate: 'PIPELINE_SPRINT',
      engagementType: 'SPRINT',
      retainerFlavour: null,
      weeklyHours: 12,
      indicativePrice: 5000,
    });
    prisma.serviceTemplate.findUnique.mockResolvedValue({
      code: 'PIPELINE_SPRINT',
      name: 'Pipeline Sprint',
      description: 'Outbound sprint',
    });
    prisma.statementOfWork.create.mockResolvedValue({
      id: 'sow_1',
      title: 'Pipeline Sprint - Engagement SOW',
      scope: 'Outbound sprint',
      deliverables: 'Deliverables',
      timeline: 'Timeline',
      weeklyHours: 12,
      totalPriceUsd: 5000,
    });

    await expect(service.generateSowFromSummary('summary_1')).resolves.toMatchObject({ id: 'sow_1' });
    expect(prisma.statementOfWork.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          masterAgreementId: 'msa_1',
          serviceTemplate: 'PIPELINE_SPRINT',
          engagementType: 'SPRINT',
        }),
      }),
    );
    expect(prisma.sowVersion.create).toHaveBeenCalled();
  });

  it('records cancellation event and terminates SOW', async () => {
    const { service, prisma } = createService();
    prisma.statementOfWork.findUnique.mockResolvedValue({ id: 'sow_1', versions: [], contract: null });
    prisma.cancellationEvent.create.mockResolvedValue({ id: 'cancel_1' });

    await expect(
      service.cancelSow('sow_1', { party: 'STARTUP', reason: 'Changed priorities' } as any),
    ).resolves.toEqual({ id: 'cancel_1' });

    expect(prisma.statementOfWork.update).toHaveBeenCalledWith({
      where: { id: 'sow_1' },
      data: { status: 'TERMINATED' },
    });
  });
});

