# Data Models

*Sources: `backend/prisma/schema.prisma` (complete) · `backend/prisma/migrations/2026042909*…20260429150000_phase6_partner_credentials` · `backend/prisma/seed.ts` · `CLAUDE.md`*

---

## Purpose
[coverage: high]

Single PostgreSQL database via Prisma ORM. All models are defined in `backend/prisma/schema.prisma`. The schema covers the full platform lifecycle: intake → matching → MSA → pre-SOW → SOW/contract → payments + payout ledgering → engagement → closeout. Phase 1–6 migrations layered in compliance, EOR, partner credentials, MSA, pre-SOW summaries, addenda, and a payment ledger/payout-attempt skeleton.

---

## Architecture
[coverage: high]

```
PostgreSQL
  └── Prisma ORM (prisma-client-js)
        └── PrismaService (NestJS singleton)
              └── injected into every service that needs DB access
```

No caching layer. All queries are direct Prisma calls. `PrismaService` extends `PrismaClient` with `onModuleInit` and shutdown hooks. Migrations live in `backend/prisma/migrations/` and are applied with `npx prisma migrate dev`.

The four most recent migrations introduced large surface-area additions:

| Migration | What it added |
|-----------|---------------|
| `20260429090000_phase1_foundation` | `OperatorRole`, `ServiceTemplate`, `RoleTemplateEngagementCombination`, `ServiceLane`, `EngagementType`, `RetainerFlavour`, `ServiceTemplateCode` |
| `20260429110000_phase2_core_flow` | `EngagementCall`, `EngagementIntent`, `PreSowCommercialSummary`, `MasterServiceAgreement`, addenda models (`HybridAddendum`, `SuccessFeeAddendum`, `EquityOnlyAddendum`, `ConversionAddendum`), `CancellationEvent`, `LifecycleEvent` |
| `20260429130000_phase3_payments_compliance_skeleton` | `PaymentLedger`, `PayoutAttempt`, `OperatorTaxProfile`, `OperatorEorEnrollment`, `ComplianceDecisionLog`, plus enums `ComplianceMode`, `EorPartner`, `PayoutProvider`, `PaymentLedgerStatus`, `TaxFormType` |
| `20260429150000_phase6_partner_credentials` | `OperatorProfile.stripeAccountId / stripeChargesEnabled / stripePayoutsEnabled / stripeDetailsSubmitted / wiseRecipientId / razorpayFundAccountId` |

---

## Talks To
[coverage: medium]

Every backend module talks to the schema through `PrismaService`. Notable cross-cutting consumers:

| Module | Models touched |
|--------|----------------|
| `applications` | `Application`, `User`, `Organization`, `Membership`, `TalentPreScreen`, `NeedDiagnosis` |
| `contracts` (incl. `MsaService`) | `MasterServiceAgreement`, `StatementOfWork`, `Contract`, `SowVersion`, `DocumentLog`, addenda, `CancellationEvent`, `PreSowCommercialSummary` |
| `payments` | `PaymentPlan`, `Invoice`, `PaymentEvent`, `PaymentLedger`, `PayoutAttempt`, `ComplianceDecisionLog`, `OperatorTaxProfile` |
| `partners` | `OperatorProfile` (Phase-6 partner credential fields), `OperatorEorEnrollment` |
| `admin-ops` | Read-only aggregator over MSA / contract / ledger / EOR / compliance / pre-SOW |
| `engagements` | `Engagement`, `EngagementMilestone`, `WorkspaceNote`, `ActivityLog`, `LifecycleEvent`, `HealthScoreSnapshot`, `SystemNudge`, `EscalationCase` |

---

## API Surface
[coverage: low]

The schema itself has no API surface — see the per-module wiki pages. The one cross-cutting endpoint is the **PrismaService shutdown hook** registered in `main.ts`.

---

## Data
[coverage: high]

### Identity Layer

| Model | Purpose | Key fields |
|-------|---------|-----------|
| `User` | Auth + identity | `email` (unique), `passwordHash?`, `status`, `emailVerifiedAt`, `privacyAcceptedAt`, `termsAcceptedAt`, `noticeVersion`, `onboardingStage` |
| `OAuthIdentity` | Google/Microsoft/Apple federation | `provider`, `providerAccountId` (`@@unique`) |
| `EmailActionToken` | `VERIFY_EMAIL` / `RESET_PASSWORD` tokens | `tokenHash` (unique), `expiresAt`, `consumedAt` |
| `Organization` | Company or talent entity | `orgType: STARTUP \| OPERATOR_ENTITY \| PLATFORM` |
| `Membership` | User ↔ Org with role | `membershipRole`, `status: PENDING \| ACTIVE \| INACTIVE` |
| `DataSubjectRequest` | GDPR export/delete audit row | `type: EXPORT \| DELETE`, `subjectEmail`, `requestedBy` |

`MembershipRole` values: `STARTUP_ADMIN`, `STARTUP_MEMBER`, `OPERATOR`, `PLATFORM_ADMIN`, `DEAL_DESK`.
`UserStatus` values: `ACTIVE`, `INACTIVE`, `SUSPENDED`, `PENDING_APPROVAL`.

---

### Intake & Profiles

| Model | Purpose |
|-------|---------|
| `Application` | Fat intake row — company OR talent. Holds form data, payment metadata, signup-flow flags, decision fields |
| `StartupProfile` | Derived from approved company applications |
| `OperatorProfile` | Talent profile used for matching; **also stores Phase-6 partner credentials** (`stripeAccountId`, `wiseRecipientId`, `razorpayFundAccountId`) |
| `DemandReadinessScore` | AI scoring of a startup profile |
| `SupplyQualityScore` | AI scoring of an operator profile |
| `InviteToken` | Email invitations for operators / partners |

---

### Service Catalogue (Phase 1)

| Model | Purpose |
|-------|---------|
| `ServiceTemplate` | Catalogue of canonical engagement archetypes keyed by `ServiceTemplateCode` (`INTL_MARKET_ENTRY`, `ICP_REFINEMENT`, `GTM_STRATEGY`, `PIPELINE_SPRINT`, `PARTNER_CHANNEL_DEVELOPMENT`, …) with a `ServiceLane` and `EngagementType` |
| `RoleTemplateEngagementCombination` | Lookup table of recommended `OperatorRole × ServiceTemplate × EngagementType × RetainerFlavour` combos |
| `Package` | Legacy fixed-price engagement packages |

`OperatorRole` covers ~22 sales/BD roles (VP_SALES, CRO, BD_LEAD, RevOps, AE, SDR, etc.). `ServiceLane` is one of `FRACTIONAL_LEADERSHIP`, `FRACTIONAL_BD_PARTNERSHIPS`, `FRACTIONAL_EXECUTION_OPS`. `EngagementType` is `CONSULTATION | SPRINT | RETAINER`; retainers further qualified by `RetainerFlavour: LEADERSHIP | OPERATOR`.

---

### Matching & Discovery

| Model | Purpose |
|-------|---------|
| `MatchShortlist` | One per startup. `DRAFT → PUBLISHED → SELECTION_MADE \| EXPIRED` |
| `MatchCandidate` | One row per operator on a shortlist; `matchScore` (0–100), `scoreBreakdown` JSON, `mainRisk`, `packageTier`, `weeklyFitHours` |
| `DiscoveryCall` | Pre-matching sales call between platform and startup |

---

### Engagement Calls & Pre-SOW (Phase 2 — NEW)

| Model | Purpose |
|-------|---------|
| `EngagementCall` | The startup ↔ operator intro call. `REQUESTED → ACCEPTED → COMPLETED` |
| `EngagementIntent` | Per-party `INTERESTED / NOT_INTERESTED` outcome from the call (one row per `party`) |
| `PreSowCommercialSummary` | Lightweight commercial term-sheet drafted **before** the SOW. Status: `DRAFT → SHARED → CONFIRMED \| CANCELLED`. Carries `serviceTemplate`, `compensationMode`, `indicativePrice`, `weeklyHours`, `durationDays`, `specialTerms`, `cancellationNote`. Confirmed by both `startupConfirmedAt` and `operatorConfirmedAt`. |

A confirmed `PreSowCommercialSummary` is the input to `ContractsService.generateSowFromSummary`.

---

### MSA, SOW, Contract

| Model | Purpose |
|-------|---------|
| `MasterServiceAgreement` | Pair-level master contract created **before** any SOW. Three-party signature: `platformSignedAt`, `startupSignedAt`, `operatorSignedAt`. `MsaStatus: PENDING_SIGNATURES → PARTIALLY_SIGNED → FULLY_EXECUTED \| TERMINATED`. Stores `platformFeePercent` (default 10), `conversionFeePercent` (default 25), `nonCircMonths` (12), `termNoticeDays` (30), `governingLaw` (default `India`). Unique on `(startupProfileId, operatorId)` |
| `StatementOfWork` | Scope document under an MSA. `masterAgreementId` FK back to MSA. `SowStatus`: `AI_DRAFT → DRAFT → REVIEW → HUMAN_APPROVED → SHARED → APPROVED → SIGNED → ACTIVE → COMPLETED \| TERMINATED \| LOCKED` |
| `SowVersion` | Versioned snapshots; unique on `(sowId, version)` |
| `Contract` | Dual-signature wrapper around a SOW. `PENDING_SIGNATURES → STARTUP_SIGNED → OPERATOR_SIGNED → FULLY_SIGNED → CANCELLED`. Has `idempotencyKey` (unique), `contactsUnlocked`, `watermarked` |
| `DocumentLog` | Per-contract audit trail (`SIGNED`, `DOWNLOAD`, …) with `ipAddress` + `userAgent` |
| `CancellationEvent` | SOW-level cancellation record (`party`, `reason`, optional `refundAmount`, `payoutPenalty`) |

---

### Compensation Addenda (Phase 2 — NEW)

Each addendum is a 1:1 child of `StatementOfWork`. Drives compensation modeling and downstream payout calculations.

| Model | `compensationMode` default | Distinguishing fields |
|-------|---------------------------|-----------------------|
| `HybridAddendum` | `HYBRID_CASH_EQUITY` | `cashAmount`, `cashCurrency`, `equitySummary` |
| `SuccessFeeAddendum` | `SUCCESS_FEE` | `successFeePercent`, `triggerSummary` |
| `EquityOnlyAddendum` | `EQUITY_ONLY` | `equitySummary` |
| `ConversionAddendum` | `CONVERSION_FEE` | `conversionFeePercent` (default 25) |

`CompensationMode`: `CASH | SUCCESS_FEE | HYBRID_CASH_EQUITY | EQUITY_ONLY | CONVERSION_FEE`.

---

### Payments & Payout Ledger

| Model | Purpose |
|-------|---------|
| `PaymentPlan` | One per `Contract`. `planType`, `totalAmountUsd`, `currency`, `billingCurrency`, `payoutCurrency`, `fxRateAtSigning` |
| `Invoice` | Plan line items. `DRAFT → ISSUED → PAID \| OVERDUE \| CANCELLED`; carries `stripeId` (unique) and `stripeUrl` |
| `PaymentEvent` | Webhook events; `stripeEventId` unique (idempotency) |
| `PaymentLedger` *(NEW)* | One per `PaymentPlan`. Splits `invoiceAmount` into `platformFeeAmount`, `operatorPayoutAmount`, `eorFeeAmount`. Tracks `complianceMode`, `taxReady`, `payoutReady`. `PaymentLedgerStatus: DRAFT → REVIEWED → APPROVED → BLOCKED \| READY_FOR_PAYOUT` |
| `PayoutAttempt` *(NEW)* | One per provider attempt. `provider: STRIPE_CONNECT \| RAZORPAY \| WISE \| MANUAL \| DUMMY`. Status: `PLANNED → QUEUED → SUCCEEDED \| FAILED \| CANCELLED`. `dummyMode` boolean and `providerRef` |

`PaymentPlanType` was extended with `HYBRID_CASH_EQUITY`, `EQUITY_ONLY`, `CONVERSION_FEE`, `MILESTONE_SCHEDULE`.

---

### Compliance & Tax (NEW)

| Model | Purpose |
|-------|---------|
| `OperatorTaxProfile` | One per `OperatorProfile`. `formType: W9 \| W8BEN \| W8BEN_E \| GST_PAN \| VAT \| OTHER`. `formStatus: NOT_STARTED → COLLECTED → UNDER_REVIEW → VERIFIED \| EXPIRED \| REJECTED`. Stores `encryptedBlobRef`, `taxResidencyCountry`, `payoutCountry`, `payoutCurrency` |
| `OperatorEorEnrollment` | One per `(operatorProfile, partner)`. `partner: DEEL \| REMOTE \| MULTIPLIER`. `status: NOT_STARTED → PENDING → ACTIVE \| REJECTED \| TERMINATED`. `partnerSideId` is the partner-system ID |
| `ComplianceDecisionLog` | Append-only log of compliance-mode decisions per SOW or operator. `mode: CONTRACTOR \| CONTRACTOR_WITH_REVIEW \| EOR_REQUIRED \| AGENCY_OF_RECORD \| PAYROLL_REQUIRED \| BLOCKED_PENDING_REVIEW \| UNKNOWN`. `decidedBy` defaults to `SYSTEM` |

---

### Partner Credentials (Phase 6 — NEW)

Stored as nullable fields on `OperatorProfile`:

| Field | Set by |
|-------|--------|
| `stripeAccountId`, `stripeChargesEnabled`, `stripePayoutsEnabled`, `stripeDetailsSubmitted` | `StripeConnectService` (Express onboarding + `account.updated` webhook) |
| `wiseRecipientId` | `WiseService` recipient creation |
| `razorpayFundAccountId` | `RazorpayPayoutService` fund-account creation |

These are read by `PaymentsService.createPayoutAttempt` to decide which `PayoutProvider` to route through.

---

### Engagements & Closeout

| Model | Purpose |
|-------|---------|
| `Engagement` | Active work tied 1:1 to `Contract`. `NOT_STARTED → ACTIVE → PAUSED → COMPLETED \| TERMINATED \| CONVERTED_TO_FULLTIME`. `healthScore` |
| `EngagementMilestone` | `PENDING → IN_PROGRESS → REVIEW → COMPLETED` |
| `WorkspaceNote`, `ActivityLog` | Shared notes + event log |
| `LifecycleEvent` *(NEW)* | Append-only `CREATED / STATUS_CHANGED / CONVERSION_CANDIDATE / CONVERTED_TO_FULLTIME / PAYMENT_MILESTONE / CLOSEOUT` events |
| `HealthScoreSnapshot`, `SystemNudge`, `EscalationCase` | Health + nudge + dispute tracking |
| `CloseoutReport`, `EngagementRating`, `RenewalRecommendation` | Closeout deliverables |

---

### AI Workflows

| Model | Purpose |
|-------|---------|
| `NeedDiagnosis` | Company intake analysis. `DRAFT_AI → UNDER_REVIEW → READY_FOR_CLIENT → APPROVED \| REVISION_REQUESTED` |
| `OpportunityBrief` | Post-approval matching brief |
| `TalentPreScreen` | Talent scoring + red-flag detection |
| `SowTemplate` | Library of legacy SOW templates by `templateType` |

---

## Key Decisions
[coverage: high]

**MSA gates SOWs.** `StatementOfWork.masterAgreementId` references `MasterServiceAgreement`. The flow corrected in Phase 2: a pair-level MSA must exist (and ideally be fully signed) **before** any SOW is generated. `MsaService.findOrCreateMsa` enforces that the operator has a tax profile on file (`COLLECTED | UNDER_REVIEW | VERIFIED` with a non-empty `encryptedBlobRef`) before an MSA can be created.

**Pre-SOW summaries are the canonical SOW input.** The recommended path is `EngagementCall → EngagementIntent → PreSowCommercialSummary → ContractsService.generateSowFromSummary(summaryId)`, which auto-creates/links an MSA and copies `serviceTemplate`, `engagementType`, `retainerFlavour`, `weeklyHours`, `indicativePrice` onto the SOW.

**All IDs are CUIDs.** `@id @default(cuid())` throughout. CUIDs are URL-safe and roughly sortable.

**Application is intentionally a fat model.** Both company and talent fields live on one row with nullable "other side" fields. Simpler queries at the cost of schema clarity.

**Soft-link from briefs to templates.** `OpportunityBrief.suggestedTemplateId` is **not** a foreign key — it's a soft reference resolved at read time.

**Cascade deletes everywhere.** Most relations have `onDelete: Cascade`. Deleting a `Contract` blows away the `Engagement`, milestones, notes, logs, ledger and ledger payout attempts.

**Compliance and payout state are decoupled.** `PaymentLedger.taxReady` requires `OperatorTaxProfile.formStatus = VERIFIED`. `payoutReady = taxReady && complianceMode ∈ {CONTRACTOR, CONTRACTOR_WITH_REVIEW}`. Anything else (EOR_REQUIRED, BLOCKED_PENDING_REVIEW, PAYROLL_REQUIRED) blocks payout.

---

## Gotchas
[coverage: medium]

- `Application.stripeSessionId` has a `@unique` constraint but is also used to store Razorpay order IDs in the unlock-matching flow — name is misleading.
- `Application.seniority` (free text) is kept alongside `seniorityLevel` (enum) for backwards compat. Always prefer `seniorityLevel`.
- `OperatorProfile.operatorId` is the FK to `Organization.id`, not auto-generated. `MatchCandidate.operatorId` joins on `OperatorProfile.operatorId`, not `OperatorProfile.id`. The same convention is used by `MasterServiceAgreement.operatorId` and `PreSowCommercialSummary.operatorId`.
- `PaymentLedger` is upsertable by `paymentPlanId` — calling `generateLedger` on the same contract is non-destructive and refreshes the splits.
- `PayoutAttempt.dummyMode` defaults to `true`. Until `PARTNER_LIVE_MODE=true`, every attempt is a placeholder.
- The four addendum tables (`hybrid_addenda`, `success_fee_addenda`, `equity_only_addenda`, `conversion_addenda`) are 1:1 with SOW, so a SOW can technically have multiple addenda rows of different types. Application logic enforces "one compensation mode" — the schema does not.
- Run `npx prisma generate` after pulling Phase-6 schema changes; legacy code refers to partner-credential fields via the `OperatorProfileWithPartners` cast in `partners/operator-profile-augment.ts`.
- The seed script (`backend/prisma/seed.ts`) drops and reseeds demo Startup/Operator pairs end-to-end (call → intent → pre-SOW → MSA → SOW → contract → engagement) for the admin "Phase-2 clickable demo" panel.
