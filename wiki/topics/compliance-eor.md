# Compliance & EOR

*Sources: `backend/src/operator-eor-enrollment/` · `backend/src/operator-tax-profile/` · `backend/src/compliance/` · `backend/src/legal/legal.constants.ts` · `backend/prisma/schema.prisma` · `backend/prisma/migrations/20260429130000_phase3_payments_compliance_skeleton/migration.sql` · `frontend/src/components/operator/EorEnrollmentPanel.tsx` · `frontend/src/components/operator/TaxFormsPanel.tsx` · `Docs/BRIDGESCALE_SERVICE_MODEL/06_CONTRACTING_PAYMENTS_COMPLIANCE_OBLIGATIONS.md` · `Docs/BRIDGESCALE_SERVICE_MODEL/07_SERVICE_ROLE_ENGAGEMENT_PAYMENT_COMPLIANCE_MAPPING.md`*

---

## Purpose
[coverage: high]

The compliance and EOR surface answers two questions for every paid engagement: *can this operator legally be paid through this corridor?* and *which classification mode (contractor / AOR / EOR / payroll) does the engagement need to ride on?*. BridgeScale operates cross-border between Indian-diaspora operators and companies in many jurisdictions, so worker classification, tax-form routing, and EOR partner enrolment all sit on the critical path between SOW signature and payout.

The implementation is layered: an `OperatorTaxProfile` collects residency + payout-corridor info early, an `OperatorEorEnrollment` tracks per-partner enrolment status (Deel / Remote / Multiplier), a `ComplianceMode` enum stamps each operator profile and SOW with how that engagement runs, and a `ComplianceDecisionLog` records who decided what and why. The `compliance` module separately handles GDPR-style data-subject requests (export / delete) plus a public-facing processor register and retention policy.

Tax-form collection is intentionally deferred. Operators give country and currency at signup so matching can run, but full W-9 / W-8BEN / GST/PAN / VAT documents are only required before MSA generation (`msaReady`) and verified before payout (`payoutReady`). This avoids onboarding drop-off while keeping money movement compliant.

---

## Architecture
[coverage: high]

```
backend/src/
├── operator-tax-profile/        Tax-form collection per operator
│   ├── controller               GET/POST /operator-tax-profile
│   └── service                  Computes basicComplete / msaReady / payoutReady
├── operator-eor-enrollment/     Per-partner EOR enrolment rows
│   ├── controller               /operator-eor-enrollments
│   └── service                  Delegates to partner EOR services
├── compliance/                  GDPR / processor register / retention
│   ├── controller               PLATFORM_ADMIN-only
│   ├── service                  Export + anonymize subject data
│   └── compliance.constants.ts  DATA_RETENTION_POLICY, LIVE_PROCESSOR_REGISTER
└── legal/legal.constants.ts     CURRENT_NOTICE_VERSION (terms/privacy version)

frontend/src/components/operator/
├── TaxFormsPanel.tsx            UI for tax-form upsert + status pills
└── EorEnrollmentPanel.tsx       UI to request enrolment with each partner
```

The EOR enrolment service is the cleanest consumer of the partner abstraction: it injects `DeelService`, `RemoteService`, `MultiplierService` (all implementing `EorPartnerService`) and dispatches via a small `partnerSvc(partner)` switch. With `PARTNER_LIVE_MODE=false` those services return stub IDs so the full UI flow works without partner credentials.

---

## Talks To
[coverage: high]

| Module | How |
|--------|-----|
| `partners/eor` | EOR enrolment service injects `DeelService` / `RemoteService` / `MultiplierService` and forwards `enroll` / `getContractor` calls |
| `prisma` | Reads/writes `OperatorTaxProfile`, `OperatorEorEnrollment`, `ComplianceDecisionLog`, `DataSubjectRequest`, `User` |
| `auth` (session) | All endpoints sit behind `SessionAuthGuard` + `RolesGuard` |
| `applications` | The `compliance` service anonymizes `Application` rows during a delete request |
| `engagements` / `sow` | Read `complianceMode` off `OperatorProfile` and `StatementOfWork` to gate SOW + payout |
| frontend `lib/api-client` | Exports `operatorTaxApi`, `operatorEorApi`, `partnersApi` consumed by the operator panels |

---

## API Surface
[coverage: high]

### Tax profile (`/api/v1/operator-tax-profile`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/me` | OPERATOR | Returns `{ forms[], basicComplete, msaReady, payoutReady, expectedForms[] }` |
| `POST` | `/` | OPERATOR | Upsert a tax-form row (one per `formType`) |

### EOR enrolment (`/api/v1/operator-eor-enrollments`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/me` | OPERATOR | Always returns 3 rows (DEEL/REMOTE/MULTIPLIER), placeholder NOT_STARTED when missing |
| `POST` | `/me/request` | OPERATOR | Calls partner SDK (or stub) and persists `partnerSideId` + status |
| `PATCH` | `/:id/status` | PLATFORM_ADMIN | Manual status update (used during partner ramp-up) |
| `POST` | `/:id/sync` | OPERATOR or ADMIN | Re-sync status from the partner |

### Compliance (`/api/v1/compliance`) — PLATFORM_ADMIN only

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/processors` | Live processor register (Resend, Razorpay/Stripe, OpenAI, hosting) |
| `GET` | `/retention-policy` | Public retention policy table |
| `GET` | `/requests` | List all data-subject requests |
| `POST` | `/requests/export` | Collect all personal data for an email; logs an `EXPORT` request |
| `POST` | `/requests/delete` | Anonymize user, applications, profiles, notes, ratings; deletes CV files; logs a `DELETE` request |

---

## Data
[coverage: high]

### `OperatorTaxProfile` — one row per `formType` per operator

| Field | Notes |
|-------|-------|
| `formType` | `W9 \| W8BEN \| W8BEN_E \| GST_PAN \| VAT \| OTHER` |
| `formStatus` | `NOT_STARTED → COLLECTED → UNDER_REVIEW → VERIFIED` (or `EXPIRED`/`REJECTED`) |
| `taxResidencyCountry`, `payoutCountry`, `payoutCurrency` | ISO codes — drive `expectedForms` heuristic |
| `individualOrEntity` | `INDIVIDUAL` vs `ENTITY` (W-8BEN vs W-8BEN-E) |
| `encryptedBlobRef` | Pointer to actual document storage (encrypted) |
| `expiresAt`, `verifiedAt` | Document lifecycle |

The service computes three derived flags off the latest row per `formType`:

| Flag | Triggers |
|------|----------|
| `basicComplete` | At least one row has `taxResidencyCountry` + `payoutCountry` + `payoutCurrency` — minimum to enter the matching pool |
| `msaReady` | At least one row is `COLLECTED` or `VERIFIED` — required before MSA generation |
| `payoutReady` | At least one row is `VERIFIED` — required before payout actually moves |
| `expectedForms` | Heuristic: US payout ⇒ W-9; non-US ⇒ W-8BEN; IN ⇒ +GST_PAN; EU/UK ⇒ +VAT |

### `OperatorEorEnrollment` — `(operatorProfileId, partner)` unique

```
enum EorPartner          { DEEL, REMOTE, MULTIPLIER }
enum EorEnrollmentStatus { NOT_STARTED, PENDING, ACTIVE, REJECTED, TERMINATED }
```

`partnerSideId` is the contractor ID held by Deel / Remote / Multiplier. Webhook events from those partners (handled by `partners.controller`) flip status as the partner finishes onboarding.

### `ComplianceMode` — stamped on `OperatorProfile` and `StatementOfWork`

```
enum ComplianceMode {
  CONTRACTOR
  CONTRACTOR_WITH_REVIEW
  EOR_REQUIRED
  AGENCY_OF_RECORD
  PAYROLL_REQUIRED
  BLOCKED_PENDING_REVIEW
  UNKNOWN
}
```

| Mode | Use when (per `06_CONTRACTING_PAYMENTS_COMPLIANCE`) |
|------|----------|
| `CONTRACTOR` | Short-term, output-based, low company control |
| `AGENCY_OF_RECORD` | Contractor relationship, but tax/onboarding/payout managed by vendor |
| `EOR_REQUIRED` | Employment-like control, or local law makes contractor risky |
| `PAYROLL_REQUIRED` | Full-time conversion / direct hire |
| `BLOCKED_PENDING_REVIEW` | Equity, success-fee, regulated market — needs legal review |

`ComplianceDecisionLog` records every transition with `decidedBy`, `reason`, optional `metadata`, and an optional `sowId` link.

### `DataSubjectRequest` (GDPR-style)

`type ∈ EXPORT | DELETE`, `status ∈ PENDING | COMPLETED | REJECTED`. The delete path runs in a single Prisma transaction and:

- Deletes `OAuthIdentity` and `EmailActionToken` rows
- Redacts `WorkspaceNote.content`, `EscalationCase.reason`, `EngagementRating.comments`
- Anonymizes `User` (email becomes `deleted+<id>@redacted.local`)
- Clears PII on `OperatorProfile` (linkedIn, references, bio) and `StartupProfile`
- Wipes free-text fields on every `Application` for that email
- Deletes CV files from `uploads/` (path-traversal guarded against `uploadsRoot`)

---

## Key Decisions
[coverage: high]

**Two-phase data collection.** Per the service-model spec, BridgeScale deliberately collects only country/currency/individual-vs-entity at signup and defers W-9 / W-8BEN / GST/PAN until before MSA generation. The `basicComplete → msaReady → payoutReady` ladder encodes that progression.

**Three EOR partners by corridor.** Deel = broad global coverage (day-1 default), Remote = strong EU coverage with own entities, Multiplier = India + APAC focus. The list is hardcoded as the `EorPartner` enum so the UI can render placeholder NOT_STARTED rows even when no `OperatorEorEnrollment` exists yet.

**Stub-mode-first partner integration.** Per `partners.config.ts`, every partner SDK call is gated by `PARTNER_LIVE_MODE`. With the flag off, `enroll` returns deterministic stub IDs and `PENDING` status, so the operator panel is fully exercisable without API keys. This was an explicit Phase-6 wire-up choice (see Decision Register D17 — EOR partners are still in legal/finance review).

**Anonymize, don't hard-delete.** The data-subject delete flow rewrites PII in place rather than removing rows, preserving referential integrity for contracts, invoices, and audit logs (which have legitimate 7-year retention requirements per `DATA_RETENTION_POLICY`).

**Compliance mode is decoupled from compensation type.** A Cash-Only sprint and a Cash+Success-Fee sprint can both run on `CONTRACTOR` or both require `AGENCY_OF_RECORD` — the matrix in `07_SERVICE_ROLE_ENGAGEMENT_PAYMENT_COMPLIANCE_MAPPING.md` makes the decision per (engagement type × operator country).

---

## Gotchas
[coverage: medium]

- `getStatusForOperatorOrg` reduces multiple historic rows per `formType` to the latest by `updatedAt`. Older rows still live in the table but never appear in the API response — be careful when querying directly.
- `expectedForms` is a heuristic. The code comment is explicit: "Tax counsel will replace this with corridor-specific rules in P5.4." Don't trust it as a source of legal truth.
- `OperatorEorEnrollment.listForOperatorOrg` returns synthetic placeholder rows with `id: null` for partners the operator hasn't engaged. Frontend must handle `id === null` (the panel keys off `partner`).
- `requestEnrollment` hardcodes country code `'XX'` until country surfaces on the operator profile. Live-mode Deel/Remote/Multiplier calls will fail until that's plumbed.
- The compliance delete path deletes CV files using a guarded `uploadsRoot` prefix check. If your CV storage moves to S3/object storage, that branch becomes a no-op silently.
- `ComplianceDecisionLog.decidedBy` defaults to `'SYSTEM'` — populate it when admins make manual decisions or audit history loses attribution.
- The processor register (`LIVE_PROCESSOR_REGISTER`) is a hand-maintained constant. Adding a new vendor (e.g. Wise, Stripe Connect) requires a code change, not a config update.
