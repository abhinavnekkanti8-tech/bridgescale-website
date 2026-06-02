-- Phase 6 — partner credential pointers on OperatorProfile.
-- Set by Stripe Connect Express, Wise, RazorpayX onboarding flows.
-- All nullable so existing rows backfill cleanly.

ALTER TABLE "operator_profiles"
  ADD COLUMN "stripeAccountId"        TEXT,
  ADD COLUMN "stripeChargesEnabled"   BOOLEAN,
  ADD COLUMN "stripePayoutsEnabled"   BOOLEAN,
  ADD COLUMN "stripeDetailsSubmitted" BOOLEAN,
  ADD COLUMN "wiseRecipientId"        TEXT,
  ADD COLUMN "razorpayFundAccountId"  TEXT;
