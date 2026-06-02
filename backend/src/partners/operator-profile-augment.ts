import { OperatorProfile } from '@prisma/client';

/**
 * Augmented OperatorProfile type that includes Phase 6 partner-credential
 * fields. After running `npx prisma generate` against the latest schema, these
 * fields become part of the base OperatorProfile type and this augmentation is
 * a harmless no-op. Until then, this lets the partner services compile against
 * the un-regenerated client.
 */
export type OperatorProfileWithPartners = OperatorProfile & {
  stripeAccountId: string | null;
  stripeChargesEnabled: boolean | null;
  stripePayoutsEnabled: boolean | null;
  stripeDetailsSubmitted: boolean | null;
  wiseRecipientId: string | null;
  razorpayFundAccountId: string | null;
};
