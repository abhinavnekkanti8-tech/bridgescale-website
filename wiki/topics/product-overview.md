# Product Overview

*Sources: `CLAUDE.md` · `README.md` · `Docs/TECHNICAL.md` · `Docs/product_spec_summary.md` · `Docs/BRIDGESCALE_SERVICE_MODEL/` · `Docs/phase-1-foundation/` · `Docs/phase-2-core-flow/` · `Docs/phase-3-payments-compliance/` · `Docs/GapAnalysis.md` · `Docs/Phase1_Matrix_Validation_2026-05-01.md`*

> **Currency note (2026-05-05):** This article reflects the codebase on the `codex/auth-email-gdpr-hardening` branch. Phase 2 (core flow) is implemented; Phase 3 (payments + compliance) is plumbing-only — see [Build Phase Status](#build-phase-status). Live partner wire-ups for Stripe Connect, Wise, Razorpay payouts, and the three EOR partners (Deel, Remote, Multiplier) are scheduled for Phase 6 (P6.2 / P6.5–6.7). Anything labelled `STUB MODE` in the operator dashboard reflects this.

---

## Purpose
[coverage: high]

**BridgeScale** is a curated B2B marketplace and engagement-workflow platform connecting Indian startups and MSMEs with **diaspora-first** fractional sales, BD, and partnerships talent in EU, US, AU, and rest-of-world.

Companies get senior commercial capacity for international growth without the cost or risk of a full-time hire. Operators get structured, compensated fractional work that fits alongside an existing role, with platform-managed contracting, payments, and compliance.

The platform manages the full lifecycle:

> **intake → AI diagnosis → vetting → matching → discovery call → mutual intent → Pre-SOW Commercial Summary → Master Service Agreement (tri-party) → engagement-specific SOW → active engagement → closeout**

MVP focus is **Andhra Pradesh startups** matched to diaspora operators — see `Docs/product_spec_summary.md`.

---

## Architecture
[coverage: high]

```
Platform/
├── backend/              NestJS 10 + Prisma → PostgreSQL 16    port 4000
│                         API prefix: /api/v1/  · session auth (express-session)
│                         20+ feature modules · async AI background jobs
│
├── frontend/             Next.js 14 App Router (TypeScript)    port 3000
│                         CSS Modules + global CSS variables
│                         fetch('/api/v1/...', credentials: 'include')
│
├── docker-compose.yml    Postgres 16 + Redis 7 (Redis available for prod sessions)
│
└── Docs/                 Product specs, service-model pack, phase task breakdowns
```

See [`backend.md`](./backend.md) and [`frontend-startup.md`](./frontend-startup.md) / [`frontend-operator.md`](./frontend-operator.md) for module-level detail.

**Backend feature modules of note:** applications · auth · startups · operators · matching · contracts · msa · pre-sow-summaries · calls · engagement-intents · payments · engagements · closeout · health · diagnoses · opportunity-briefs · talent-pre-screen · interviews · approvals · analytics · cancellations · operator-tax-profile · operator-eor-enrollments · partners.

---

## Talks To (External)
[coverage: high]

| Service | Purpose | Status |
|---------|---------|--------|
| PostgreSQL 16 | Primary database (~30 tables) | live |
| Redis 7 | Session store (prod), queue placeholder | available |
| Anthropic Claude / OpenAI gpt-4o | AI diagnosis, talent pre-screen, opportunity brief, matching, closeout | live (mock with `sk-dummy-*` prefix) |
| Razorpay | Company unlock payment (₹8,500 INR) + invoicing | live behind `DUMMY_PAYMENT_MODE` |
| Stripe + Stripe Connect Express | Talent unlock ($50 USD) + operator payouts | unlock live; Connect payouts stub until Phase 6 P6.2 |
| Wise | Cross-border operator payouts (USD/EUR/GBP/AUD/SGD) | stub until Phase 6 |
| Razorpay payouts | INR-direct payouts for India-resident operators | stub until Phase 6 |
| Deel · Remote · Multiplier | Employer-of-Record partners | stub until Phase 6 P6.5–6.7 |
| Resend | Transactional email (confirmation, magic links, status updates, GDPR notices) | live |

---

## API Surface (Summary)
[coverage: high]

User-facing portals (see frontend articles for the full route map):

- `/for-companies` + `/for-companies/apply` — public company landing & free signup
- `/for-talent` + `/for-talent/apply` — public talent landing & free signup
- `/services/sales-leadership` · `/services/sales-execution` · `/services/partnerships-bd` — three service-lane explainers (data-driven via the `ServicePage` component)
- `/startup/*` — company workspace (dashboard, matching, calls, contracts, engagements, billing, closeout)
- `/operator/*` — talent workspace (dashboard, calls, matches, engagements, profile)
- `/admin/*` — platform administration
- `/auth/login` + `/auth/magic` — session auth
- `/contracts-payments-faq` — Knex-style contracts & payments explainer (per service-model pack)

**Three service lanes (formerly "core packages"):**

1. **Fractional Sales Leadership** — VPs / CROs / Heads of Sales who own the commercial motion, on a fractional retainer. Cash or cash + equity (FAST templates).
2. **Sales Execution** — AE / SDR / outbound operators running pipeline, qualification, and deal cycles.
3. **Partnerships & BD** — channel, alliance, and market-access leaders who open new geographies through partner ecosystems.

Each lane crosses three engagement structures (Consultation, Sprint, Retainer) plus three add-ons (success-fee, equity-only, conversion to full-time). The 3-column engagement matrix on `/for-companies` is the visual canon for this taxonomy.

---

## Data
[coverage: high]

Core domain entities (see [`backend.md`](./backend.md) and [`applications.md`](./applications.md) for schema-level detail):

```
User → Membership → Organization (STARTUP | OPERATOR_ENTITY | PLATFORM)

Application
  ├── NeedDiagnosis            (AI-generated, company side)
  ├── TalentPreScreen          (AI-generated, talent side)
  └── OpportunityBrief         (post-diagnosis approval)

StartupProfile → MatchShortlist → MatchCandidate → OperatorProfile

EngagementCall → EngagementIntent (per party)
              ↓ (mutual INTERESTED)
PreSowCommercialSummary
              ↓ (both parties confirm)
MasterServiceAgreement     (tri-party, persists per Company×Operator pair)
              ↓ (all 3 sign: BridgeScale + Startup + Operator)
StatementOfWork → Contract → PaymentPlan → Invoice
              ↓ (FULLY_SIGNED)
Engagement     → Milestones / WorkspaceNotes / ActivityLog / HealthScore
              → CloseoutReport

Compliance plumbing:
  OperatorTaxProfile + TaxForm rows  (W-9 / W-8BEN / GST/PAN / VAT)
  OperatorEorEnrollment              (Deel / Remote / Multiplier)
  CancellationEvent + StrikeStatus   (rolling 90-day window)
```

The MSA persists per `(Company, Operator)` pair and is reused across future SOWs between the same two parties.

---

## Key Decisions
[coverage: high]

**Tri-party agreement model (Knex-inspired).** Per `Docs/BRIDGESCALE_SERVICE_MODEL/`, every engagement uses **one** standard `BridgeScale Master Services Agreement` (signed by BridgeScale + Startup + Operator) plus **one** engagement-specific `Statement of Work`. SOW addenda cover change orders, success-fees, hybrid cash + equity, and full-time conversion. The MSA is the fixed relationship document; the SOW is the collaborative one.

**AI-native operations with human gates.** Qualification (diagnosis), candidate scoring, SOW drafting, and closeout reports are AI-driven — but never the final decision. All AI outputs route through admin review, and AI tasks are fire-and-forget (errors only show in logs, never in API responses).

**Free signup.** No upfront payment. Companies pay ₹8,500 to unlock matches once they're ready; operators pay $50. The Phase-2 free-signup flow is the implemented path (see [`applications.md`](./applications.md)). The frontend hard-redirects (`window.location.href`) after signup so the session cookie is reliably picked up.

**Mutual-intent gate before commercial documents.** Pre-SOW Summary is only issued after both parties record `INTERESTED` post-call. MSA is only generated after both confirm the Pre-SOW. SOW only generates after MSA exists. This is the spine of the [Phase 2 core flow](../../Docs/phase-2-core-flow/PHASE_2_CORE_FLOW_TASK_BREAKDOWN.md).

**Diaspora-first focus.** Target operators are diaspora professionals in EU/US/AU with cultural and network depth in Indian startup markets. This drives the `TargetMarket` enum and the matching scorer (region overlap is one of seven score components).

**Operating principle:** "AI-native qualification, matching, scope generation, governance, and renewal support with human oversight for exceptions." (`product_spec_summary.md`)

---

## Build Phase Status
[coverage: high]

> Status as of 2026-05-05; see `README.md` for the canonical short version.

| Phase | Scope | Status |
|-------|-------|--------|
| Phase 1 — Foundation | Marketing site, apply forms, auth, API proxy, design system | Done |
| Phase 2 — Core flow | Free signup, dashboards, unlock payment, calls, intents, Pre-SOW, MSA, SOW, signed-contract → engagement workspace | Done (this branch) |
| Phase 3 — Payments & compliance plumbing | Tax profile, EOR enrolment skeletons, cancellation events, payment-ledger structure, no live partner APIs | In progress (UI panels live in stub mode) |
| Phase 6 — Live partner integrations | Stripe Connect Express (P6.2), Wise, Razorpay payouts, Deel / Remote / Multiplier (P6.5–6.7), e-signature provider | Not started |

Per `Docs/GapAnalysis.md` and `Docs/Phase1_Matrix_Validation_2026-05-01.md`, the platform is usable as **prototype / demo / internal alpha**. It is **not yet trustworthy as a production marketplace operating system** — open work covers stronger company intake, tighter diagnosis→matching handoff, end-to-end real signing, real money movement, and reconciling the seeded role/template/engagement matrix (currently 108 generated tuples vs 33 curated; 18 tuples in the matrix are missing from the seed).

---

## Gotchas
[coverage: medium]

- `DUMMY_PAYMENT_MODE=true` is the default in dev — all payments auto-confirm, all "providers" are no-ops. The `PaymentModeBanner` component renders site-wide whenever this is on or any partner is stubbed.
- `STUB MODE` pills on the operator dashboard's `StripeConnectPanel` and `EorEnrollmentPanel` are real — those panels will display state changes only when ops manually advance rows. Live wire-ups are P6.2 / P6.5–6.7.
- Frontend uses hard `window.location.href` redirect after signup (not the Next.js router) to ensure the session cookie is included on the next request.
- MVP target geography is **Andhra Pradesh startups** going international. Don't generalise matching weights for a wider geography without revisiting the seed and the operating matrix.
- `Docs/BRIDGESCALE_SERVICE_MODEL/08_DECISION_REGISTER.md` lists the open commercial decisions (exact platform fee, conversion-fee structure, equity-template choice, escrow vs invoice model) that block production launch.
- `CLAUDE.md` notes some Phase-2 tasks (BlurredMatchCard, UnlockMatchingCTA, CompletionChecklist) as TODO — these have since been extracted into real components and that note is stale.
- The marketing site references three service lanes; the codebase still has Phase-1 era references to "Pipeline Sprint / BD Sprint / Fractional Retainer" packages in places (e.g. matching-page label map). Treat the new lanes (Sales Leadership / Sales Execution / Partnerships & BD) as canonical going forward.

---

## See Also

- [`applications.md`](./applications.md) — intake module, the spine of the free-signup flow
- [`backend.md`](./backend.md) — module map for the NestJS API
- [`frontend-startup.md`](./frontend-startup.md) — company-side route map and pages
- [`frontend-operator.md`](./frontend-operator.md) — talent-side route map and Phase-3 panels
- `Docs/BRIDGESCALE_SERVICE_MODEL/` — service-model pack: tri-party agreement, engagement menu, role/outcome map, decision register
- `Docs/phase-2-core-flow/PHASE_2_CORE_FLOW_TASK_BREAKDOWN.md` — the call → intent → Pre-SOW → MSA → SOW spine
- `Docs/phase-3-payments-compliance/PHASE_3_PAYMENTS_COMPLIANCE_TASK_BREAKDOWN.md` — payment ledger and compliance plumbing
