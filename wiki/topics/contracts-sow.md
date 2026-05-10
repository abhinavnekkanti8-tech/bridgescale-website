# Contracts & SOW

*Sources: `backend/src/contracts/` · `backend/src/sow/` · `backend/prisma/schema.prisma`*

---

## Purpose
[coverage: high]

Manages the Statement of Work (scope agreement) and dual-signature contract lifecycle between a startup and a selected operator. Sits between matching (operator selected) and engagement (work begins).

---

## Architecture
[coverage: medium]

```
SowController / SowService            ← SOW CRUD, version management, AI prefill
ContractsController / ContractsService ← Contract creation, signing, payment plan
SowTemplatesController / Service      ← Template library management (admin)
```

---

## Talks To
[coverage: medium]

| Module | How |
|--------|-----|
| `matching` | SOW created after `MatchCandidate.status = SELECTED` |
| `payments` | `PaymentPlan` + `Invoice` created after `Contract` is `FULLY_SIGNED` |
| `engagements` | `Engagement` initialized from `FULLY_SIGNED` contract |
| `ai/opportunity-briefs` | `prefillSowFromBrief` uses opportunity brief to pre-populate SOW |

---

## API Surface
[coverage: medium]

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/v1/sow` | PLATFORM_ADMIN | Create SOW from shortlist |
| `GET` | `/api/v1/sow/:id` | Auth | Get SOW with versions |
| `PATCH` | `/api/v1/sow/:id` | PLATFORM_ADMIN | Update SOW fields |
| `POST` | `/api/v1/sow/:id/lock` | PLATFORM_ADMIN | Lock SOW for signing |
| `GET` | `/api/v1/sow/templates` | Auth | List SOW templates |
| `POST` | `/api/v1/contracts` | PLATFORM_ADMIN | Create contract from SOW |
| `POST` | `/api/v1/contracts/:id/sign` | Auth | Sign contract (startup or operator) |
| `GET` | `/api/v1/contracts` | Auth | List contracts |
| `GET` | `/api/v1/contracts/:id` | Auth | Get contract detail |

---

## Data
[coverage: high]

**SOW lifecycle:** `DRAFT → REVIEW → APPROVED → SIGNED → LOCKED`

**Contract lifecycle:** `PENDING_SIGNATURES → STARTUP_SIGNED → OPERATOR_SIGNED → FULLY_SIGNED → CANCELLED`

**`StatementOfWork` key fields:**
- `shortlistId`, `startupProfileId`, `operatorId` — links back to matching
- `packageType`: `PIPELINE_SPRINT | BD_SPRINT | FRACTIONAL_RETAINER`
- `weeklyHours`, `totalPriceUsd`, `timeline`, `scope`, `deliverables`
- `nonCircumvention: Boolean` — standard protection clause
- `currentVersion: Int` — incremented on each edit; full history in `SowVersion`

**`Contract` key fields:**
- `startupSignedAt` / `operatorSignedAt` — when each party signed
- `contactsUnlocked` — set true when fully signed (reveals operator contact details)
- `watermarked` — documents are watermarked until fully signed

**`SowTemplate` types:**
`PIPELINE_SPRINT`, `BD_SPRINT`, `FRACTIONAL_RETAINER`, `MARKET_ENTRY`, `HYBRID_EQUITY`

---

## Key Decisions
[coverage: medium]

**Versioned SOW:** Every edit to a SOW creates a new `SowVersion` row. The current version number is on `StatementOfWork.currentVersion`. This provides a full audit trail.

**`nonCircumvention` flag:** All SOWs include a non-circumvention clause by default (direct relationship outside the platform is prohibited during the engagement period).

**`contactsUnlocked` on contract:** Operator contact details are hidden until both parties have signed. The frontend should check this field before displaying contact info.

---

## Gotchas
[coverage: low]

- `ContractsController` and `SowController` are separate NestJS controllers — check that both modules are registered in `app.module.ts`.
- `SowTemplatesController` is in the `contracts/` directory but handles a separate resource (templates, not active SOWs).
- Payment plan creation after contract signing is handled by `PaymentsService`, not `ContractsService`.
