# Partners (Payout & EOR Vendors)

*Sources: `backend/src/partners/partners.module.ts` · `backend/src/partners/partners.controller.ts` · `backend/src/partners/partners.config.ts` · `backend/src/partners/razorpay-payout.service.ts` · `backend/src/partners/stripe-connect.service.ts` · `backend/src/partners/wise.service.ts` · `backend/src/partners/operator-profile-augment.ts` · `backend/src/partners/eor/{deel,remote,multiplier}.service.ts` · `backend/src/partners/eor/eor.types.ts` · `backend/prisma/migrations/20260429150000_phase6_partner_credentials/migration.sql` · `frontend/src/components/operator/StripeConnectPanel.tsx`*

---

## Purpose
[coverage: high]

The `partners` module is BridgeScale's outbound integration layer for *paying* operators and for putting them on third-party Employer-of-Record arrangements. It abstracts six external APIs behind a single NestJS module: Stripe Connect Express (US/EU operator payouts), RazorpayX Payouts (Indian INR payouts), Wise (cross-border corridors), and three EOR vendors (Deel, Remote, Multiplier).

The collection-side payment integrations (Razorpay Checkout for company unlock, Stripe Checkout for talent unlock) live in `payments/`, not here. This module is strictly *payouts* and *EOR enrolment* — money leaving BridgeScale, plus the legal-employer arrangements that govern higher-control engagements.

Every service in the module is dual-mode by design. With `PARTNER_LIVE_MODE=false` (the default), each method returns deterministic stubs that exercise the same DB writes a live response would, so the end-to-end flow works without API keys. The live SDK calls are written out as commented blocks in each service, ready to uncomment during Phase-6 partner ramp-up.

---

## Architecture
[coverage: high]

```
backend/src/partners/
├── partners.module.ts             Registers all 6 services + controller
├── partners.controller.ts         Webhook endpoints + Stripe onboarding-link
├── partners.config.ts             partnerLiveMode(), envOrThrow(), stubId()
├── operator-profile-augment.ts    Type-shim for un-regenerated Prisma client
│
├── stripe-connect.service.ts      Stripe Connect Express
├── razorpay-payout.service.ts     RazorpayX (separate from collection-side keys)
├── wise.service.ts                Wise (recipient → quote → transfer)
│
└── eor/
    ├── eor.types.ts               EorPartnerService interface
    ├── deel.service.ts            implements EorPartnerService
    ├── remote.service.ts          implements EorPartnerService
    └── multiplier.service.ts      implements EorPartnerService
```

All three EOR services implement a common `EorPartnerService` interface (`enroll` / `getContractor` / `handleWebhook`). Consumers — primarily the `operator-eor-enrollment` module — inject all three and dispatch by `EorPartner` enum, so adding a fourth partner is a localized change.

The payout services follow a consistent shape: a one-time `createRecipient` / `createFundAccount` / Stripe-Express-account step persists a partner-side ID on `OperatorProfile`, then every subsequent payout reuses it. This matches each vendor's expected onboarding model.

```
                 ┌────── Stripe Connect (US/EU)  → operatorProfile.stripeAccountId
PaymentLedger ──►│
                 ├────── RazorpayX (India)        → operatorProfile.razorpayFundAccountId
                 │
                 └────── Wise (everywhere else)   → operatorProfile.wiseRecipientId
```

---

## Talks To
[coverage: high]

| Module | How |
|--------|-----|
| `payments/payout-provider.service` | Selects which partner to use based on operator corridor; calls `createPayout` / `createTransfer` |
| `operator-eor-enrollment` | Injects `DeelService` / `RemoteService` / `MultiplierService` and dispatches by `EorPartner` |
| `prisma` | Reads/writes `OperatorProfile` partner-credential pointers (Phase 6 columns) |
| External: Stripe / RazorpayX / Wise / Deel / Remote / Multiplier | Live SDKs gated on `PARTNER_LIVE_MODE` |

---

## API Surface
[coverage: high]

All routes mounted at `/api/v1/partners`. Webhooks bypass `SessionAuthGuard` because they are signed by the partner.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/stripe/onboarding-link` | OPERATOR session | Returns Stripe-hosted Express onboarding URL; creates account on first call |
| `POST` | `/stripe/webhook` | Stripe signature header | `account.updated` → re-syncs `chargesEnabled` / `payoutsEnabled` / `detailsSubmitted` |
| `POST` | `/razorpay/webhook` | `x-razorpay-signature` | Payout status events |
| `POST` | `/wise/webhook` | `x-signature-sha256` | Transfer status events |
| `POST` | `/eor/:partner/webhook` | `x-partner-signature` | Dispatches to `Deel` / `Remote` / `Multiplier` service `handleWebhook` |

### Internal interfaces (consumed by other backend modules, not exposed)

| Service | Methods |
|---------|---------|
| `StripeConnectService` | `getOnboardingLink(operatorOrgId, returnUrl)`, `getAccountStatus(accountId)`, `handleWebhook` |
| `RazorpayPayoutService` | `createFundAccount(input)`, `createPayout({invoiceId, operatorOrgId, amountInr, purpose})`, `getPayoutStatus`, `handleWebhook` |
| `WiseService` | `createRecipient(input)`, `createQuote({sourceCurrency, targetCurrency, sourceAmount})`, `createTransfer({quoteId, operatorOrgId, invoiceId})`, `getTransferStatus`, `handleWebhook` |
| `EorPartnerService` (Deel / Remote / Multiplier) | `enroll(operatorOrgId, countryCode)`, `getContractor(partnerSideId)`, `handleWebhook` |

---

## Data
[coverage: high]

The Phase-6 migration `20260429150000_phase6_partner_credentials` adds six nullable columns to `operator_profiles`:

| Column | Set by | Purpose |
|--------|--------|---------|
| `stripeAccountId` | Stripe `accounts.create` (Express) | Reused for onboarding-link refresh + payouts |
| `stripeChargesEnabled` | Stripe webhook `account.updated` | UI gating in `StripeConnectPanel` |
| `stripePayoutsEnabled` | Stripe webhook | Required before payout-ready |
| `stripeDetailsSubmitted` | Stripe webhook | KYC progress signal |
| `wiseRecipientId` | `WiseService.createRecipient` | Reused for every transfer |
| `razorpayFundAccountId` | `RazorpayPayoutService.createFundAccount` | Reused for every payout (one Indian bank account) |

Because these were added after the rest of the schema, services use the `OperatorProfileWithPartners` augmented type from `operator-profile-augment.ts` — a TS shim that lets services compile against an un-regenerated Prisma client. After `npx prisma generate` runs, the augmentation becomes a no-op.

### `EorPartnerEnrollment` (in-memory result type, not a model)

```ts
interface EorPartnerEnrollment {
  partner: EorPartner;
  partnerSideId: string;
  status: EorEnrollmentStatus;
  liveMode: boolean;
  trackingUrl?: string;
}
```

Persisted into `OperatorEorEnrollment` rows by the consuming module (see `compliance-eor.md`).

---

## Key Decisions
[coverage: high]

**Three providers, picked by corridor.** Stripe Connect Express handles US/EU operators where Stripe has strong KYC/payout coverage. RazorpayX handles INR payouts (separate from the collection-side Razorpay keys — different products, different credentials). Wise is the catch-all for every other corridor where neither Stripe nor RazorpayX is the natural rail.

**Live-mode gate everywhere.** `partnerLiveMode()` reads `PARTNER_LIVE_MODE === 'true'` exactly once per call. Stub mode is the default so the full operator dashboard works in dev without provisioning real accounts. Each service writes the same DB rows in stub mode (e.g. `stripeAccountId = 'acct_stub_xxxx'`) so transitioning to live mode doesn't require a migration.

**Live-mode SDK calls live as commented blocks, not behind feature flags.** Each service has the actual `Stripe`/`Razorpay`/`fetch` call written out in a comment block, then `throw new Error('… live mode wired but SDK call not implemented yet.')`. This is intentional: the wire-up is reviewable in PR before any code path executes.

**EOR partners share an interface.** `EorPartnerService` enforces a 3-method contract (`enroll`, `getContractor`, `handleWebhook`). Adding a fourth partner means adding a service + an `EorPartner` enum value — no changes in the consuming module beyond a switch arm.

**One persistent partner-side ID per operator.** RazorpayX fund accounts and Wise recipients are created once and reused. The services bail out early (`if (profileEx!.razorpayFundAccountId) return profileEx!.razorpayFundAccountId;`) rather than creating fresh records, which would multiply on retries.

**Webhook signature checks live in the service, not the controller.** The controller passes the raw body and signature header through; each service is responsible for validating with the partner SDK's verify helper. This keeps the controller thin and per-partner secret handling co-located.

---

## Gotchas
[coverage: medium]

- The augmented `OperatorProfileWithPartners` type uses `as never` on Prisma `update.data` to silence TS errors against the un-regenerated client. Once `npx prisma generate` runs, those casts are still safe but no longer needed.
- Stub-mode `getAccountStatus` returns all-`false` for `chargesEnabled` / `payoutsEnabled` / `detailsSubmitted`. This means the operator UI never appears "ready to receive payouts" in dev unless you manually flip those columns.
- `RazorpayPayoutService` requires a *separate* set of env vars from collection-side Razorpay: `RAZORPAYX_KEY_ID`, `RAZORPAYX_KEY_SECRET`, `RAZORPAYX_ACCOUNT_NUMBER`. Don't reuse the checkout keys.
- Wise's recipient `details` shape varies by corridor (Indian: `type: 'indian'`; EU: `iban`; etc.). The current `accountDetails: Record<string, string | number>` is permissive — validation is the caller's job.
- Webhook signature constants differ per partner: `stripe-signature`, `x-razorpay-signature`, `x-signature-sha256` (Wise), `x-partner-signature` (EOR). Mis-routing a header silently fails signature verification in live mode.
- The `eor/:partner/webhook` route uppercases the partner string before matching against `EorPartner`. Lowercase URLs work; mixed-case (`Deel`) also works; anything else returns `{ ok: false, error: 'unknown partner' }` with HTTP 200.
- Live-mode SDK code is commented out — *do not* uncomment without also setting the env vars, or the next request panics with `Missing required partner env var: …` from `envOrThrow`.
- `RAZORPAYX_KEY_ID` etc. are referenced only inside live-mode commented blocks today, so missing them in stub mode is a no-op. That changes the moment live mode flips on.
