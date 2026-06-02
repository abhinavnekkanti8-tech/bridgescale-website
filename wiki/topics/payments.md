# Payments

*Sources: `backend/src/payments/payments.controller.ts` · `backend/src/payments/payments.service.ts` · `backend/src/payments/payments.module.ts` · `backend/src/payments/dto/payments.dto.ts` · `backend/src/payments/payout-provider.service.ts` · `backend/src/payments/razorpay.service.ts` · `backend/src/payments/payments.service.spec.ts` · `backend/src/partners/` · `backend/src/applications/applications.service.ts` · `backend/prisma/schema.prisma`*

---

## Purpose
[coverage: high]

Two completely separate flows live under the "payments" umbrella:

1. **Application-side, signup unlock fee** — `applications.service` initiates Razorpay (INR, companies) or Stripe (USD, talent) checkouts to "unlock matching". Free signup is the default; this fee is optional and post-signup.
2. **Engagement-side, contract billing + operator payout** — `payments.service` owns `PaymentPlan`, `Invoice`, `PaymentEvent`, the new `PaymentLedger` skeleton, and `PayoutAttempt` rows. Routing to a real provider (Stripe Connect, RazorpayX, Wise, an EOR partner, or manual) is delegated to `PayoutProviderService` and the `partners/` module.

A `DUMMY_PAYMENT_MODE` env flag stubs out application-side checkouts. A separate `PARTNER_LIVE_MODE` flag controls whether the engagement-side payout providers actually call partner APIs.

---

## Architecture
[coverage: high]

```
Application-side (unlock matching)
  ApplicationsService
    ├── RazorpayService           ← createOrder + verify (INR, companies)
    └── Stripe SDK (stubbed)      ← talent unlock (TODO)

Engagement-side (invoicing + payout)
  PaymentsController / PaymentsService
    ├── PrismaService             ← PaymentPlan, Invoice, PaymentEvent, PaymentLedger, PayoutAttempt
    └── PayoutProviderService     ← chooses provider + builds PlannedPayout
                                  ↓
  PartnersModule
    ├── StripeConnectService      ← Express onboarding + payouts (US/EU operators)
    ├── RazorpayPayoutService     ← RazorpayX fund accounts (Indian operators)
    ├── WiseService               ← cross-border (anything else)
    └── eor/{Deel,Remote,Multiplier}Service
```

`PaymentsModule` wires `PaymentsController`, `PaymentsService`, `RazorpayService`, and the new `PayoutProviderService`. `PartnersModule` is a sibling module and is consumed by the engagement-side flow indirectly via the operator's persisted partner credentials on `OperatorProfile`.

---

## Talks To
[coverage: medium]

| Module | How |
|--------|-----|
| `applications` | Razorpay/Stripe checkout for the unlock-matching fee |
| `contracts` | `Contract` → `PaymentPlan` → `Invoice`. `Contract.sow.operatorId` resolves the operator for ledger generation |
| `engagements` | Health score reads payment status |
| `partners` (Stripe Connect, RazorpayX, Wise, Deel/Remote/Multiplier) | Phase-6 destinations for `PayoutAttempt` |
| `prisma` | All ledger / invoice / event writes |

---

## API Surface
[coverage: high]

### Application-side (unlock matching)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/v1/applications/initiate-unlock` | Session | Create Razorpay order or Stripe session |
| `POST` | `/api/v1/applications/verify-unlock` | Public | Verify Razorpay payment signature |
| `POST` | `/api/v1/applications/payment/razorpay/webhook` | Public | Razorpay server webhook |
| `POST` | `/api/v1/applications/webhook` | Public | Stripe Checkout webhook |
| `POST` | `/api/v1/applications/payment/dummy-confirm` | Public | Dev-only auto-confirm (DUMMY_PAYMENT_MODE) |

### Engagement-side

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/v1/payments/plan` | PLATFORM_ADMIN | Create `PaymentPlan` for a contract |
| `GET` | `/api/v1/payments/plan/:contractId` | Session | Get plan + ordered invoices |
| `POST` | `/api/v1/payments/invoice` | PLATFORM_ADMIN | Issue an invoice (creates a mock Stripe invoice in non-live mode) |
| `GET` | `/api/v1/payments/invoice` | PLATFORM_ADMIN | List all invoices |
| `GET` | `/api/v1/payments/invoice/startup/:id` | STARTUP_ADMIN / PLATFORM_ADMIN | Startup-scoped invoice list |
| `PATCH` | `/api/v1/payments/invoice/:id/pay` | PLATFORM_ADMIN | Mark paid manually |
| `PATCH` | `/api/v1/payments/invoice/:id/overdue` | PLATFORM_ADMIN | Mark overdue manually |
| `POST` | `/api/v1/payments/ledger` | PLATFORM_ADMIN | Generate / refresh `PaymentLedger` skeleton |
| `GET` | `/api/v1/payments/ledger/contract/:contractId` | PLATFORM_ADMIN | View ledger by contract |
| `PATCH` | `/api/v1/payments/ledger/:id/review` | PLATFORM_ADMIN | Move ledger through `DRAFT → REVIEWED → APPROVED → BLOCKED \| READY_FOR_PAYOUT` |
| `POST` | `/api/v1/payments/ledger/:id/payout-attempt` | PLATFORM_ADMIN | Create a planned `PayoutAttempt` against a chosen `PayoutProvider` |
| `POST` | `/api/v1/payments/webhook` | Public | Stripe invoice webhook |
| `GET` | `/api/v1/payments/mode` | Public | Returns `{ dummyPaymentMode, partnerLiveMode, env }` for the UI banner |

### Partner-side (Phase 6, separate controller)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/partners/stripe/onboarding-link` | Operator-initiated Stripe Connect Express onboarding |
| `POST` | `/api/v1/partners/stripe/webhook` | `account.updated` re-syncs operator KYC flags |
| `POST` | `/api/v1/partners/razorpay/webhook` | Razorpay payout events |
| `POST` | `/api/v1/partners/wise/webhook` | Wise transfer events |
| `POST` | `/api/v1/partners/eor/:partner/webhook` | Deel / Remote / Multiplier callbacks |

---

## Data
[coverage: high]

### Application-side unlock fee

Stored on `Application`:

| Field | Use |
|-------|-----|
| `paymentProvider` | `RAZORPAY`, `STRIPE`, or `DUMMY` |
| `feeAmountMinor` | paisa for INR, cents for USD |
| `feeCurrency` | `INR` or `USD` |
| `razorpayOrderId`, `razorpayPaymentId`, `stripeSessionId`, `stripePaymentId` | provider IDs |
| `paidAt`, `matchingUnlocked`, `matchingUnlockedAt` | flow flags |

Defaults: company unlock = ₹8,500 = 850,000 paisa via Razorpay; talent unlock = $50 = 5,000 cents via Stripe.

### Engagement-side ledger

```
Contract ─1:1─ PaymentPlan ─1:N─ Invoice ─1:N─ PaymentEvent
                  │
                  └──1:1── PaymentLedger ─1:N─ PayoutAttempt
```

`PaymentLedger` columns:

| Column | Meaning |
|--------|---------|
| `invoiceAmount` | Sum of all invoices (or `totalAmountUsd` if no invoices yet) |
| `platformFeeAmount` | `round(invoiceAmount × 0.10)` — 10% platform fee |
| `eorFeeAmount` | Optional, comes from `GenerateLedgerDto.eorFeeAmount` |
| `operatorPayoutAmount` | `invoiceAmount − platformFee − eorFee` (clamped at 0) |
| `complianceMode` | Resolved by `resolveComplianceForSow` (see Key Decisions) |
| `taxReady` | `OperatorTaxProfile.formStatus === 'VERIFIED'` |
| `payoutReady` | `taxReady && complianceMode ∈ {CONTRACTOR, CONTRACTOR_WITH_REVIEW}` |
| `status` | `DRAFT → REVIEWED → APPROVED → BLOCKED \| READY_FOR_PAYOUT` |

`PayoutAttempt`: `provider` (`STRIPE_CONNECT \| RAZORPAY \| WISE \| MANUAL \| DUMMY`), `status` (`PLANNED → QUEUED → SUCCEEDED \| FAILED \| CANCELLED`), `amount`, `currency`, `providerRef`, `dummyMode`, `metadata`.

---

## Key Decisions
[coverage: high]

**Two payment surfaces, two flags.** `DUMMY_PAYMENT_MODE` covers the application-side unlock checkout (Razorpay/Stripe). `PARTNER_LIVE_MODE` covers the engagement-side payout providers (Stripe Connect, RazorpayX, Wise, EOR partners). They are independent. The `/api/v1/payments/mode` endpoint surfaces both so the frontend can render a clear "Dummy mode" / "Live mode" banner.

**Razorpay for India, Stripe for international.** The geography split inherits from the business model: companies are Indian startups paying in INR, talent are diaspora operators paid in USD.

**Webhook idempotency via `stripeEventId`.** `PaymentEvent.stripeEventId` is `@unique`. The webhook handler checks for an existing event before mutating the invoice.

**Payout-provider abstraction (NEW).** `PayoutProviderService.planPayout()` returns a `PlannedPayout` shape from a provider + ledger ID + amount + currency. In Phase 3 it always returns `dummyMode: true` with a deterministic `providerRef = "${provider}_${ledgerId}_placeholder"`. Phase 6 replaces this with real partner SDK calls.

**Provider routing happens at admin time, not automatically.** The admin chooses which `PayoutProvider` to attempt via `POST /payments/ledger/:id/payout-attempt`. The expected default routing logic (encoded outside the codebase, but evident from operator credentials):

| Operator country / payout currency | Provider |
|------------------------------------|----------|
| INR / India | `RAZORPAY` (uses `OperatorProfile.razorpayFundAccountId`) |
| USD with Stripe Connect Express enabled | `STRIPE_CONNECT` (uses `OperatorProfile.stripeAccountId`) |
| Anything else | `WISE` (uses `OperatorProfile.wiseRecipientId`) |
| `complianceMode = EOR_REQUIRED` | EOR partner — Deel/Remote/Multiplier handles the payout, Bridgescale only invoices |
| Manual fallback | `MANUAL` — bookkeep only, paid out-of-band |

**Compliance gates payout.** `createPayoutAttempt` rejects with `400` when `ledger.payoutReady === false`. The ledger surfaces `taxReady` and `complianceMode` so admins see why.

**`resolveComplianceForSow` is a placeholder rules engine.** Current logic:
- Retainer + ≥20 weekly hours → `CONTRACTOR_WITH_REVIEW`
- `LEADERSHIP` retainer + ≥30 weekly hours → `EOR_REQUIRED`
- Missing engagement type → `BLOCKED_PENDING_REVIEW`
- Default → `CONTRACTOR`

Each call writes a `ComplianceDecisionLog` row with `decidedBy: SYSTEM` and `metadata: { phase: 'PHASE_3_SKELETON', legalAdvice: false }`.

**Razorpay signature verification.** `x-razorpay-signature` HMAC-SHA256 against the raw body. `rawBody` is captured in `main.ts` via `bodyParser.json({ verify: ... })`.

---

## Gotchas
[coverage: high]

- `DUMMY_PAYMENT_MODE` defaults to `'true'` in `isDummyMode()` (`config.get('DUMMY_PAYMENT_MODE', 'true')`). Easy to leave enabled in staging.
- Razorpay order ID is stored in `Application.stripeSessionId` (legacy field name).
- Stripe-side talent unlock is partially stubbed: `initiateUnlockPayment` creates a fake `cs_unlock_${Date.now()}` session ID and returns a dummy URL in non-dummy mode. Real Stripe Checkout integration is a TODO.
- Engagement invoices are USD-only at the schema level (`Invoice.amountUsd`). Multi-currency lives on `PaymentPlan.billingCurrency` / `payoutCurrency` and is not yet plumbed into invoice rows.
- `PaymentLedger.upsert` on `paymentPlanId` makes `generateLedger` non-destructive — but it does **not** preserve the prior `status` field. Re-running after a manual review can reset state from `APPROVED` back to `DRAFT`. (Worth verifying before triggering re-runs.)
- `PayoutAttempt.dummyMode` is hard-coded `true` in the current `PayoutProviderService.planPayout` regardless of `PARTNER_LIVE_MODE`. Phase 6 wire-up will change this.
- The compliance resolver writes a `ComplianceDecisionLog` **on every call** — even idempotent ledger refreshes — so the table grows fast. The `/admin/compliance` queue caps at 200 most-recent rows.
- `PaymentsService.handleStripeWebhook` divides `amount_paid` by 100 when copying it to `PaymentEvent.amountCaptured`, but `PaymentEvent.amountCaptured` is otherwise stored as USD-cents elsewhere — be careful comparing values across rows.
- Partner credentials live on `OperatorProfile`. Until `npx prisma generate` runs against the Phase-6 migration, code paths fall back to the `OperatorProfileWithPartners` cast in `partners/operator-profile-augment.ts`.
