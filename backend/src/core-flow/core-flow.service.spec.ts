import { BadRequestException } from '@nestjs/common';
import { EngagementIntentParty, EngagementIntentStatus } from '@prisma/client';
import { CoreFlowService } from './core-flow.service';

describe('CoreFlowService', () => {
  function createService(overrides: Record<string, any> = {}) {
    const prisma = {
      startupProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'startup_1' }) },
      operatorProfile: { findUnique: jest.fn().mockResolvedValue({ operatorId: 'operator_1' }) },
      engagementCall: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      engagementIntent: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      serviceTemplate: { findUnique: jest.fn() },
      preSowCommercialSummary: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      ...overrides,
    };

    return { service: new CoreFlowService(prisma as any), prisma };
  }

  it('creates a call request for a valid company/operator pair', async () => {
    const { service, prisma } = createService();
    prisma.engagementCall.create.mockResolvedValue({ id: 'call_1' });

    await expect(
      service.requestCall('user_1', {
        startupProfileId: 'startup_1',
        operatorId: 'operator_1',
        meetingLink: 'https://cal.example/intro',
      }),
    ).resolves.toEqual({ id: 'call_1' });

    expect(prisma.engagementCall.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ requestedBy: 'user_1' }),
      }),
    );
  });

  it('requires mutual interested intent before creating a Pre-SOW Summary', async () => {
    const { service, prisma } = createService();
    prisma.engagementCall.findUnique.mockResolvedValue({
      id: 'call_1',
      startupProfileId: 'startup_1',
      operatorId: 'operator_1',
    });
    prisma.engagementIntent.findMany.mockResolvedValue([
      { party: EngagementIntentParty.STARTUP, status: EngagementIntentStatus.INTERESTED },
    ]);

    await expect(
      service.createPreSowSummary({
        callId: 'call_1',
        serviceTemplate: 'PIPELINE_SPRINT',
        engagementType: 'SPRINT',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a Pre-SOW Summary when both parties are interested', async () => {
    const { service, prisma } = createService();
    prisma.engagementCall.findUnique.mockResolvedValue({
      id: 'call_1',
      startupProfileId: 'startup_1',
      operatorId: 'operator_1',
    });
    prisma.engagementIntent.findMany.mockResolvedValue([
      { party: EngagementIntentParty.STARTUP, status: EngagementIntentStatus.INTERESTED },
      { party: EngagementIntentParty.OPERATOR, status: EngagementIntentStatus.INTERESTED },
    ]);
    prisma.serviceTemplate.findUnique.mockResolvedValue({ code: 'PIPELINE_SPRINT' });
    prisma.preSowCommercialSummary.create.mockResolvedValue({ id: 'summary_1', status: 'SHARED' });

    await expect(
      service.createPreSowSummary({
        callId: 'call_1',
        serviceTemplate: 'PIPELINE_SPRINT',
        engagementType: 'SPRINT',
      } as any),
    ).resolves.toEqual({ id: 'summary_1', status: 'SHARED' });
  });
});

