import { NotFoundException } from '@nestjs/common';
import { OperatorsService } from './operators.service';

describe('OperatorsService readiness gate', () => {
  function createService(profile: any) {
    const prisma = {
      operatorProfile: {
        findUnique: jest.fn().mockResolvedValue(profile),
      },
    };

    return {
      service: new OperatorsService(prisma as any, {} as any),
      prisma,
    };
  }

  afterEach(() => {
    delete process.env.OPERATOR_GATE_ENFORCEMENT;
  });

  it('reports all stages ready when profile, tax docs, references, and payout details exist', async () => {
    const { service } = createService({
      id: 'profile_1',
      linkedIn: 'https://linkedin.example/operator',
      regions: ['EU'],
      roles: ['CRO'],
      functions: [],
      references: [{ name: 'Reference' }],
      taxProfiles: [
        {
          formStatus: 'VERIFIED',
          taxResidencyCountry: 'DE',
          payoutCountry: 'DE',
          payoutCurrency: 'EUR',
          encryptedBlobRef: 'vault://tax/profile_1',
        },
      ],
    });

    const gate = await service.getReadinessGate('profile_1');

    expect(gate.enforcement).toBe('REPORT_ONLY');
    expect(gate.overallReady).toBe(true);
    expect(gate.stages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'MATCHING_POOL', ready: true }),
        expect.objectContaining({ key: 'MSA_READY', ready: true }),
        expect.objectContaining({ key: 'PAYOUT_READY', ready: true }),
      ]),
    );
  });

  it('lists missing items and respects the enforcement feature flag', async () => {
    process.env.OPERATOR_GATE_ENFORCEMENT = 'true';
    const { service } = createService({
      id: 'profile_2',
      linkedIn: null,
      regions: [],
      roles: [],
      functions: [],
      references: null,
      taxProfiles: [],
    });

    const gate = await service.getReadinessGate('profile_2');

    expect(gate.enforcement).toBe('ENFORCED');
    expect(gate.overallReady).toBe(false);
    expect(gate.stages[0].missing.length).toBeGreaterThan(0);
    expect(gate.stages[1].missing).toContain('Upload or collect full tax/KYC placeholder document.');
  });

  it('throws when the operator profile does not exist', async () => {
    const { service } = createService(null);

    await expect(service.getReadinessGate('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});

