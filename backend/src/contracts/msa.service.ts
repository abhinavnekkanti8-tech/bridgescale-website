import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EngagementIntentParty } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MsaService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateMsa(params: { startupProfileId: string; operatorId: string }) {
    const [startup, operator] = await Promise.all([
      this.prisma.startupProfile.findUnique({ where: { id: params.startupProfileId } }),
      this.prisma.operatorProfile.findUnique({ where: { operatorId: params.operatorId } }),
    ]);
    if (!startup) throw new NotFoundException('Startup profile not found.');
    if (!operator) throw new NotFoundException('Operator profile not found.');

    const taxProfile = await this.prisma.operatorTaxProfile.findFirst({
      where: {
        operatorProfileId: operator.id,
        formStatus: { in: ['COLLECTED', 'UNDER_REVIEW', 'VERIFIED'] },
        encryptedBlobRef: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!taxProfile?.encryptedBlobRef?.trim()) {
      throw new BadRequestException('Tax documents must be on file before an MSA can be created.');
    }

    return this.prisma.masterServiceAgreement.upsert({
      where: {
        startupProfileId_operatorId: {
          startupProfileId: params.startupProfileId,
          operatorId: params.operatorId,
        },
      },
      update: {},
      create: {
        startupProfileId: params.startupProfileId,
        operatorId: params.operatorId,
        platformSignedAt: new Date(),
        platformSignatureId: 'BRIDGESCALE_DEV_PRESIGN',
      },
    });
  }

  async getMsa(msaId: string) {
    const msa = await this.prisma.masterServiceAgreement.findUnique({
      where: { id: msaId },
      include: { sows: true },
    });
    if (!msa) throw new NotFoundException('MSA not found.');
    return msa;
  }

  async recordPlatformSignature(msaId: string, signatureId = 'BRIDGESCALE_DEV_PRESIGN') {
    await this.getMsa(msaId);
    return this.updateSignature(msaId, { platformSignedAt: new Date(), platformSignatureId: signatureId });
  }

  async recordSignature(msaId: string, party: EngagementIntentParty, signatureId: string) {
    await this.getMsa(msaId);
    if (!signatureId.trim()) throw new BadRequestException('Signature ID is required.');

    if (party === EngagementIntentParty.STARTUP) {
      return this.updateSignature(msaId, { startupSignedAt: new Date(), startupSignatureId: signatureId });
    }

    return this.updateSignature(msaId, { operatorSignedAt: new Date(), operatorSignatureId: signatureId });
  }

  private async updateSignature(msaId: string, data: Record<string, unknown>) {
    const updated = await this.prisma.masterServiceAgreement.update({
      where: { id: msaId },
      data,
    });

    const fullySigned =
      Boolean(updated.platformSignedAt) &&
      Boolean(updated.startupSignedAt) &&
      Boolean(updated.operatorSignedAt);

    if (fullySigned && updated.status !== 'FULLY_EXECUTED') {
      return this.prisma.masterServiceAgreement.update({
        where: { id: msaId },
        data: { status: 'FULLY_EXECUTED', fullyExecutedAt: new Date() },
      });
    }

    if (!fullySigned && (updated.platformSignedAt || updated.startupSignedAt || updated.operatorSignedAt)) {
      return this.prisma.masterServiceAgreement.update({
        where: { id: msaId },
        data: { status: 'PARTIALLY_SIGNED' },
      });
    }

    return updated;
  }
}
