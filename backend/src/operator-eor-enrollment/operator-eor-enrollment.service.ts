import { Injectable, NotFoundException } from '@nestjs/common';
import { EorEnrollmentStatus, EorPartner } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DeelService } from '../partners/eor/deel.service';
import { RemoteService } from '../partners/eor/remote.service';
import { MultiplierService } from '../partners/eor/multiplier.service';

/**
 * EOR-enrollment domain service.
 *
 * Phase-3 plumbing (P3.6) sits on top of the Phase-6 partner SDK calls
 * (P6.5/6.6/6.7) injected here. With PARTNER_LIVE_MODE=false the partner
 * services return stubs so this flow exercises end-to-end without keys.
 */
@Injectable()
export class OperatorEorEnrollmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly deel: DeelService,
    private readonly remote: RemoteService,
    private readonly multiplier: MultiplierService,
  ) {}

  /** All enrollments for the current operator org, one row per partner. */
  async listForOperatorOrg(operatorOrgId: string) {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { operatorId: operatorOrgId },
    });
    if (!profile) throw new NotFoundException('Operator profile not found.');

    const existing = await this.prisma.operatorEorEnrollment.findMany({
      where: { operatorProfileId: profile.id },
      orderBy: { partner: 'asc' },
    });

    // Always return all 3 partners, with placeholder NOT_STARTED rows when missing.
    const allPartners: EorPartner[] = [EorPartner.DEEL, EorPartner.REMOTE, EorPartner.MULTIPLIER];
    return allPartners.map((partner) => {
      const found = existing.find((e) => e.partner === partner);
      return (
        found ?? {
          id: null as string | null,
          operatorProfileId: profile.id,
          partner,
          status: EorEnrollmentStatus.NOT_STARTED,
          partnerSideId: null,
          createdAt: null,
          updatedAt: null,
        }
      );
    });
  }

  /**
   * Operator initiates an enrollment request. Calls the partner SDK (or the
   * stub, depending on PARTNER_LIVE_MODE) and persists the partner-side ID
   * + initial status returned by the partner.
   */
  async requestEnrollment(operatorOrgId: string, partner: EorPartner) {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { operatorId: operatorOrgId },
    });
    if (!profile) throw new NotFoundException('Operator profile not found.');

    // Default country-code to 'XX' until we surface this on the operator profile.
    const enroll = await this.partnerSvc(partner).enroll(operatorOrgId, 'XX');

    return this.prisma.operatorEorEnrollment.upsert({
      where: { operatorProfileId_partner: { operatorProfileId: profile.id, partner } },
      create: {
        operatorProfileId: profile.id,
        partner,
        status: enroll.status,
        partnerSideId: enroll.partnerSideId,
      },
      update: {
        status: enroll.status,
        partnerSideId: enroll.partnerSideId,
      },
    });
  }

  /** Admin / system updates partner-side status as the partner API responds. */
  async updateStatus(
    enrollmentId: string,
    status: EorEnrollmentStatus,
    partnerSideId?: string,
  ) {
    const existing = await this.prisma.operatorEorEnrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!existing) throw new NotFoundException('Enrollment not found.');

    return this.prisma.operatorEorEnrollment.update({
      where: { id: enrollmentId },
      data: { status, partnerSideId: partnerSideId ?? existing.partnerSideId },
    });
  }

  /** Refresh a single enrollment by querying the partner for current status. */
  async syncStatusFromPartner(enrollmentId: string) {
    const existing = await this.prisma.operatorEorEnrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!existing) throw new NotFoundException('Enrollment not found.');
    if (!existing.partnerSideId) return existing;

    const contractor = await this.partnerSvc(existing.partner).getContractor(existing.partnerSideId);
    return this.prisma.operatorEorEnrollment.update({
      where: { id: enrollmentId },
      data: { status: contractor.status },
    });
  }

  private partnerSvc(partner: EorPartner) {
    switch (partner) {
      case EorPartner.DEEL: return this.deel;
      case EorPartner.REMOTE: return this.remote;
      case EorPartner.MULTIPLIER: return this.multiplier;
    }
  }
}
