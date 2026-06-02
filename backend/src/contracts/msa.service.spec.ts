import { EngagementIntentParty } from '@prisma/client';
import { MsaService } from './msa.service';

describe('MsaService', () => {
  function createService(overrides: Record<string, any> = {}) {
    const prisma = {
      startupProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'startup_1' }) },
      operatorProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'profile_1', operatorId: 'operator_1' }) },
      operatorTaxProfile: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'tax_1',
          encryptedBlobRef: 'vault://tax-doc',
          formStatus: 'COLLECTED',
        }),
      },
      masterServiceAgreement: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      ...overrides,
    };

    return { service: new MsaService(prisma as any), prisma };
  }

  it('uses the unique company/operator pair when finding or creating an MSA', async () => {
    const { service, prisma } = createService();
    prisma.masterServiceAgreement.upsert.mockResolvedValue({ id: 'msa_1' });

    await service.findOrCreateMsa({ startupProfileId: 'startup_1', operatorId: 'operator_1' });

    expect(prisma.masterServiceAgreement.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          startupProfileId_operatorId: {
            startupProfileId: 'startup_1',
            operatorId: 'operator_1',
          },
        },
      }),
    );
  });

  it('blocks MSA creation until tax documents are on file', async () => {
    const { service, prisma } = createService({
      operatorTaxProfile: { findFirst: jest.fn().mockResolvedValue(null) },
    });

    await expect(
      service.findOrCreateMsa({ startupProfileId: 'startup_1', operatorId: 'operator_1' }),
    ).rejects.toThrow('Tax documents must be on file before an MSA can be created.');

    expect(prisma.masterServiceAgreement.upsert).not.toHaveBeenCalled();
  });

  it('marks an MSA fully executed when all three signatures are present', async () => {
    const { service, prisma } = createService();
    prisma.masterServiceAgreement.findUnique.mockResolvedValue({ id: 'msa_1' });
    prisma.masterServiceAgreement.update
      .mockResolvedValueOnce({
        id: 'msa_1',
        platformSignedAt: new Date(),
        startupSignedAt: new Date(),
        operatorSignedAt: new Date(),
        status: 'PARTIALLY_SIGNED',
      })
      .mockResolvedValueOnce({ id: 'msa_1', status: 'FULLY_EXECUTED' });

    await expect(
      service.recordSignature('msa_1', EngagementIntentParty.OPERATOR, 'operator-signature'),
    ).resolves.toEqual({ id: 'msa_1', status: 'FULLY_EXECUTED' });
  });
});
