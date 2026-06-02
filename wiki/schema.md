# Wiki Schema

*Source of truth for topic taxonomy. Auto-generated — do not edit manually.*

---

## Topics

| Slug | Title | Sources | Stability |
|------|-------|---------|-----------|
| `applications` | Applications | `backend/src/applications/` | stable |
| `auth` | Auth | `backend/src/auth/`, `backend/src/common/guards/` | stable |
| `ai-services` | AI Services | `backend/src/ai/`, `backend/src/diagnoses/`, `backend/src/opportunity-briefs/`, `backend/src/talent-pre-screen/` | stable |
| `matching` | Matching | `backend/src/matching/`, `backend/src/application-matching/` | stable |
| `data-models` | Data Models | `backend/prisma/schema.prisma` | stable |
| `contracts-sow` | Contracts & SOW | `backend/src/contracts/`, `backend/src/sow/` | stable |
| `engagements` | Engagements | `backend/src/engagements/`, `backend/src/closeout/` | stable |
| `payments` | Payments | `backend/src/payments/`, `backend/src/applications/` | stable |
| `frontend-startup` | Frontend — Startup UI | `frontend/src/app/startup/`, `frontend/src/app/for-companies/` | time-sensitive |
| `frontend-operator` | Frontend — Operator UI | `frontend/src/app/operator/`, `frontend/src/app/for-talent/` | time-sensitive |
| `admin-portal` | Admin Portal | `frontend/src/app/admin/`, `backend/src/approvals/`, `backend/src/analytics/` | time-sensitive |
| `product-overview` | Product Overview | `Docs/product_spec_summary.md`, `CLAUDE.md`, `Docs/TECHNICAL.md` | stable |
| `compliance-eor` | Compliance & EOR | `backend/src/operator-eor-enrollment/`, `backend/src/operator-tax-profile/`, `backend/src/compliance/`, `backend/src/legal/`, `Docs/BRIDGESCALE_SERVICE_MODEL/06_*.md`, `07_*.md` | stable |
| `partners` | Partners (Payout & EOR Vendors) | `backend/src/partners/`, `frontend/src/components/operator/StripeConnectPanel.tsx` | stable |
| `core-flow` | Core Flow | `backend/src/core-flow/`, `frontend/src/app/operator/calls/`, `frontend/src/app/startup/calls/`, `frontend/src/components/engagement/` | stable |

---

## Concepts

| Slug | Title | Topics Referenced |
|------|-------|------------------|
| `free-signup-flow` | Free Signup Flow | applications, auth, frontend-startup, frontend-operator, payments |
| `session-auth-pattern` | Session Auth Pattern | auth, applications, frontend-startup, frontend-operator, admin-portal |
| `async-ai-pattern` | Async AI Pattern | ai-services, applications, engagements, matching |

---

## Schema Evolution Log

### 2026-04-27 — Initial Compilation
- Created 12 topics from 3 source directories (backend/src, frontend/src, Docs)
- Created 3 concept articles for cross-cutting patterns
- Sources: ~95 backend files, ~80 frontend files, 12 docs files

### 2026-05-06 — Incremental Compile
- Created 3 new topics: `compliance-eor`, `partners`, `core-flow`
- Refreshed 7 topics: `data-models`, `payments`, `contracts-sow`, `admin-portal`, `frontend-startup`, `frontend-operator`, `product-overview`
- Unchanged 5 topics: `applications`, `auth`, `ai-services`, `matching`, `engagements`
- Concepts: no changes
- New sources added: `backend/src/partners/`, `backend/src/core-flow/`, `backend/src/operator-eor-enrollment/`, `backend/src/compliance/`, `Docs/BRIDGESCALE_SERVICE_MODEL/`, `Docs/phase-2-core-flow/`
