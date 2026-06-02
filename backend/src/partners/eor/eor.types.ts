import { EorPartner, EorEnrollmentStatus } from '@prisma/client';

export interface EorPartnerEnrollment {
  partner: EorPartner;
  partnerSideId: string;
  status: EorEnrollmentStatus;
  liveMode: boolean;
  trackingUrl?: string;
}

export interface EorContractor {
  partnerSideId: string;
  status: EorEnrollmentStatus;
  countryCode: string;
  startDate?: string;
  liveMode: boolean;
}

export interface EorPartnerService {
  /** Begin enrolment with the partner — creates a contractor record on their side. */
  enroll(operatorOrgId: string, countryCode: string): Promise<EorPartnerEnrollment>;

  /** Fetch the latest contractor status from the partner. */
  getContractor(partnerSideId: string): Promise<EorContractor>;

  /** Webhook handler — translates partner events into our EorEnrollmentStatus enum. */
  handleWebhook(rawBody: string, signature: string): Promise<{ ok: true; status?: EorEnrollmentStatus }>;
}
