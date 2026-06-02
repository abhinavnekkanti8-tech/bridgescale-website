import { Injectable, Logger } from '@nestjs/common';
import { EorEnrollmentStatus, EorPartner } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { partnerLiveMode, stubId } from '../partners.config';
import { EorContractor, EorPartnerEnrollment, EorPartnerService } from './eor.types';

/**
 * Deel EOR integration (Implementation Plan §P6.5/6.6/6.7).
 *
 * Stub mode returns deterministic IDs and 'PENDING' status so the operator's
 * EOR dashboard reflects the correct state without needing API keys.
 *
 * Live wire-up checklist:
 *   - Set deel_API_TOKEN (and any required org/workspace IDs)
 *   - Replace the stub blocks with the partner SDK calls
 *   - Wire up the webhook signature check at the controller level
 */
@Injectable()
export class DeelService implements EorPartnerService {
  private readonly logger = new Logger('DeelService');
  readonly partner = EorPartner.DEEL;

  constructor(private readonly prisma: PrismaService) {}

  async enroll(operatorOrgId: string, countryCode: string): Promise<EorPartnerEnrollment> {
    const profile = await this.prisma.operatorProfile.findUnique({
      where: { operatorId: operatorOrgId },
      select: { id: true },
    });
    if (!profile) throw new Error('Operator profile not found.');

    if (!partnerLiveMode()) {
      const partnerSideId = stubId('deel_stub');
      this.logger.warn(`[stub] Deel enrolment requested for ${operatorOrgId} (${countryCode}) -> ${partnerSideId}`);
      return {
        partner: this.partner,
        partnerSideId,
        status: EorEnrollmentStatus.PENDING,
        liveMode: false,
        trackingUrl: `https://deel.example/contractors/${partnerSideId}`,
      };
    }

    // ── Live mode (Phase 6 wire-up) ────────────────────────────────────────
    // Example for Deel:
    //   POST https://api.letsdeel.com/rest/v2/contracts
    //   headers: Authorization: Bearer <DEEL_API_TOKEN>
    //   body: { type: 'ongoing_time_based', employee: {...}, employer: {...}, ... }
    // Each partner has its own shape — implement here.
    void countryCode;
    throw new Error('Deel live mode wired but SDK call not implemented yet.');
  }

  async getContractor(partnerSideId: string): Promise<EorContractor> {
    if (!partnerLiveMode()) {
      return {
        partnerSideId,
        status: EorEnrollmentStatus.PENDING,
        countryCode: 'XX',
        liveMode: false,
      };
    }
    throw new Error('Deel contractor-status live call not implemented yet.');
  }

  async handleWebhook(rawBody: string, signature: string): Promise<{ ok: true; status?: EorEnrollmentStatus }> {
    if (!partnerLiveMode()) {
      this.logger.warn(`[stub] Deel webhook received (sig=${signature.slice(0, 12)}…)`);
      return { ok: true };
    }
    void rawBody;
    throw new Error('Deel webhook live handling not implemented yet.');
  }
}
