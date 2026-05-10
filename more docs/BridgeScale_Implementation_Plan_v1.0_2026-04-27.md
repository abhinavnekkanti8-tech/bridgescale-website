# BridgeScale — Implementation Plan v1.0
### Preparation → Build → Wire-up, broken into phases and tasks

**Date:** 27 April 2026
**Owner:** BridgeScale Founding Team
**Maintained by:** Outside Advisory + Founders + Engineering
**Status:** Living document. Updated weekly during execution.

---

## How to Use This Plan

Six phases, executed in sequence with parallel tracks where possible:

| Phase | What it produces | Duration (rough) | Dependency |
|---|---|---|---|
| **Phase 0 — Preparation** | All draft documents, placeholders, clarifications resolved, engineering scoping ready | 1–2 weeks | None |
| **Phase 1 — Foundation** | Schema migrations + seed data + role enum + MSA model in code | 3–4 weeks | Phase 0 complete |
| **Phase 2 — Core Flow** | MSA + SOW v1 + Pre-SOW Commercial Summary + onboarding gate + cancellation policy live | 4–5 weeks | Phase 1 complete |
| **Phase 3 — Payments Backend** | Skeleton payment rails + tax form collection + multi-leg ledger built (not wired to live partners) | 3–4 weeks | Phase 1 complete (parallel with Phase 2) |
| **Phase 4 — Website with Placeholders** | Public-facing FAQs, /learn page, sample documents — using placeholder content | 2 weeks | Phase 0 drafts ready (parallel with Phase 2/3) |
| **Phase 5 — Legal & Finance Validation** | Final MSA / SOW / addendum content; tax-form rules; corridor classification | 4–6 weeks | Phase 0 drafts in counsel's hands |
| **Phase 6 — Wire-up & Polish** | Live EOR partners, live payment rails, finalised public copy, finalised contracts | 4–6 weeks | Phases 2, 3, 5 complete |

Phases 3, 4, and 5 run in parallel with each other and with Phase 2. Phase 6 is the only fully sequential gate.

Each task carries: **Owner**, **Deliverable**, **Dependency**, **Estimate**, **Status**.

Status uses the Decision Register taxonomy: 🟢 Locked / 🟡 Proposed / 🔴 Needs legal-finance review / ⚪ Open / ⏳ In progress / ✅ Done.

---

# Phase 0 — Preparation (1–2 weeks)

**Goal:** Resolve every open clarification and produce every draft document needed downstream. By end of Phase 0, Engineering has a precise build spec, Legal has draft templates, Marketing has draft copy.

| Task | Owner | Deliverable | Dependency | Estimate | Status |
|---|---|---|---|---|---|
| **P0.1** Lock the 6 open decisions remaining in Decision Register | Founder + Outside Advisor | Decision Register v1.1 — all ⚪ Open and 🔴 Needs review items have a *direction* recorded (even if not legally validated yet) | None | 60-min working session | 🟡 Proposed |
| **P0.2** Resolve unlock-fee number across all surfaces | Founder + Engineering | Pin to **₹8,500 INR** (company unlock) and **$50 USD** (operator activation). Audit `CLAUDE.md`, `/for-companies`, `/for-talent`, FAQ for inconsistencies. | None | 1 day | 🟡 Proposed |
| **P0.3** Lock public role bucket names | Founder + Marketing | Final 6 names: **Sales Leadership / Sales Advisors / Partnerships & BD / Sales Execution / Sales Operations / Customer Success**. Update Master Plan + Operating Matrix. | None | 30 min | 🟡 Proposed |
| **P0.4** Draft MSA placeholder document | Outside Advisor | Word/PDF version of Master Plan §4.1 skeleton, watermarked "SAMPLE — finalised version coming soon", saved in repo as `Docs/legal-drafts/MSA_placeholder_v0.pdf` | None | 1 day | ⚪ |
| **P0.5** Draft SOW placeholder document | Outside Advisor | PDF of Master Plan §4.2 skeleton, watermarked, saved as `Docs/legal-drafts/SOW_placeholder_v0.pdf` | None | 1 day | ⚪ |
| **P0.6** Draft Pre-SOW Commercial Summary template | Outside Advisor | One-page template covering engagement type, term, fee, comp mode, special terms, cancellation. Saved as `Docs/legal-drafts/PreSOW_Summary_placeholder_v0.pdf` | None | 0.5 day | ⚪ |
| **P0.7** Draft Contracts & Payments FAQ placeholder | Outside Advisor | Following the Knex `Contracts & Payments FAQ.docx` shape, BridgeScale-flavoured. Saved as `Docs/legal-drafts/Contracts_Payments_FAQ_placeholder_v0.pdf` | None | 1 day | ⚪ |
| **P0.8** Draft addendum placeholders (Hybrid, Success-Fee, Equity-Only, Conversion) | Outside Advisor | One-page skeletons per addendum, watermarked, saved as `Docs/legal-drafts/Addendum_*_placeholder_v0.pdf` | None | 1 day | ⚪ |
| **P0.9** Draft `/for-companies` and `/for-talent` FAQ entry copy | Outside Advisor | Copy ready for founder approval per Master Plan §7.1 | None | 0.5 day | ⚪ |
| **P0.10** Draft `/learn` page copy (6 sections) | Outside Advisor | Copy + visual specs for hero, when-fractional-makes-sense, wrong-hire-cost calculator inputs, engagement-type cards, role-engagement matrix, FAQ | None | 3 days | ⚪ |
| **P0.11** Engineering: detailed schema migration plan | Engineering | Migration scripts, data-backfill plan, rollback plan for the three HIGH-severity migrations (per Master Plan §6.1) | None | 2 days | ⚪ |
| **P0.12** Engineering: confirm Razorpay payout API supports operator-side flows | Engineering | Technical feasibility note on extending Razorpay from collection-only to collection + payout (for INR Scenario B in Phase 6) | None | 0.5 day | ⚪ |
| **P0.13** Founder: pick legal counsel | Founder | Cross-border employment + tax counsel engaged. Indian primary + US/EU partner counsel as needed. | None | 1 week | ⚪ |
| **P0.14** Outside Advisor: ChatGPT-deep-research request for country tier classification | Outside Advisor | Research prompt + curated output covering contractor risk per Tier-1 country and corridor-specific rules | None | 1 day | ⚪ |

### Phase 0 — Definition of Done

- All placeholder PDFs in `Docs/legal-drafts/` directory
- Decision Register v1.1 published
- Engineering migration plan reviewed and signed off
- Legal counsel engaged with first packet (P0.4 + P0.5 + P0.7 + P0.8)
- Marketing has approved copy ready to drop into website

---

# Phase 1 — Foundation (3–4 weeks)

**Goal:** Fix the schema gaps that today block the operating model from being enforced in code. Per founder direction (B8 comment): the combinations matrix moves from Excel into a database seed/config table, optimised for runtime read.

| Task | Owner | Deliverable | Dependency | Estimate | Status |
|---|---|---|---|---|---|
| **P1.1** Schema migration #1 — split lane / engagement / template enums | Engineering | New enums: `ServiceLane`, `EngagementType`, `RetainerFlavour`, `ServiceTemplateCode`. Old `OperatorLane` and `PackageType` migrated to new enums with backfill. | P0.11 | 1 week | 🟡 Proposed |
| **P1.2** Schema migration #2 — closed `OperatorRole` enum | Engineering | New enum with 22 values per Master Plan §2.3. `OperatorProfile.functions String[]` migrated to `roles OperatorRole[]`. Helper `roleToLane()` function. | P1.1 | 3 days | 🟡 Proposed |
| **P1.3** Schema migration #3 — `MasterServiceAgreement` model | Engineering | Per Master Plan §6.1. Per-(Company, Operator) pair unique constraint. Status enum. Signature timestamps for all three parties. | P1.1 | 1 week | 🟡 Proposed |
| **P1.4** Seed data — service templates table | Engineering | New `ServiceTemplate` model with 10 rows (codes from Master Plan §2.4). Seed file in `backend/prisma/seed.ts`. | P1.1 | 2 days | 🟡 Proposed |
| **P1.5** Seed data — combinations matrix as DB rows (per founder direction B8) | Engineering | New `RoleTemplateEngagementCombination` table seeded from Operating Matrix sheet 06. Indexed for fast read by matching engine. Replaces Excel-as-source-of-truth at runtime. | P1.1 + P1.2 + P1.4 | 3 days | 🟡 Proposed |
| **P1.6** Schema additions — auxiliary models | Engineering | `OperatorTaxProfile`, `CompensationMode` enum + addendum models (`HybridAddendum`, `SuccessFeeAddendum`, `EquityOnlyAddendum`, `ConversionAddendum`), `ComplianceMode` enum + audit log, `EorPartner` enum, `PaymentPlan.billingCurrency` + `payoutCurrency` + `fxRateAtSigning`, extended `SowStatus`, `CancellationEvent`, `LifecycleEvent` | P1.1 | 1.5 weeks | 🟡 Proposed |
| **P1.7** Operator profile API — three-stage gate logic | Engineering | API endpoint that reports profile completeness state at three levels: (1) basic profile + tax residency + payout preference → matching pool entry; (2) full W-9/W-8BEN/KYC + bank → before MSA; (3) all docs validated → before payout. | P1.6 | 1 week | 🟡 Proposed |
| **P1.8** Engineering tests — schema migrations | Engineering | Unit and integration tests for all three migrations. Shadow-run on production-shape dev data. | P1.1, P1.2, P1.3 | 1 week parallel | 🟡 Proposed |
| **P1.9** Founder review of foundation layer | Founder | Walk-through of new schema + matching engine read flow. Approval to proceed to Phase 2. | All P1 tasks | 1 hour | ⚪ |

### Phase 1 — Definition of Done

- All three HIGH-severity migrations applied to dev DB without regression
- Seed data loaded; combinations matrix queryable in <50ms for typical match
- Three-stage onboarding gate logic in code, with feature flag to control rollout
- Founder approval on foundation layer

---

# Phase 2 — Core Flow (4–5 weeks)

**Goal:** End-to-end engagement creation flow operational on test data. Match → unblur → call → engagement intent → Pre-SOW Summary → MSA → SOW → engagement record. Uses placeholder documents from Phase 0.

| Task | Owner | Deliverable | Dependency | Estimate | Status |
|---|---|---|---|---|---|
| **P2.1** Operator onboarding flow (revised three-stage gate) | Engineering | Signup with Gmail/Apple/Outlook OAuth + email/password. Email verification. Welcome email. Dashboard. Profile completion form including tax residency country + payout preference dropdowns. Profile-enters-matching-pool trigger. | P1.7 | 1 week | 🟡 Proposed |
| **P2.2** Operator activation fee (USD $50) payment integration | Engineering | After matching pool entry + blurred matches shown, operator pays $50 via Stripe to unblur. | P1.6 + P0.2 | 3 days | 🟡 Proposed |
| **P2.3** Company unlock fee (₹8,500 INR) — audit and confirm | Engineering | Existing Razorpay collection flow. Verify amount is ₹8,500 INR consistently. Update copy if needed. | P0.2 | 0.5 day | 🟡 Proposed |
| **P2.4** 30-min call scheduling and intent-capture | Engineering | After unblurring, Company can request a call with selected Operator. Operator can accept. Call held outside platform (e.g., Calendly link). Post-call, both parties click "Indicate engagement intent" buttons. | P1.6 | 1 week | 🟡 Proposed |
| **P2.5** Pre-SOW Commercial Summary generation | Engineering | After mutual engagement intent, platform generates a one-page commercial summary from structured inputs (engagement type, service template, indicative price band, hours, comp mode, special terms, cancellation). Both parties confirm or request edits. | P1.5 + P1.6 + P0.6 | 1 week | 🟡 Proposed |
| **P2.6** MSA service module — find-or-create per (Company, Operator) pair | Engineering | `backend/src/contracts/msa.service.ts` per Master Plan §6.2.B. Generation from §4.1 template. Three-party signing flow (BridgeScale pre-signs; Company + Operator counter-sign). | P1.3 + P0.4 | 2 weeks | 🟡 Proposed |
| **P2.7** SOW v1 generation wired to ServiceTemplate table | Engineering | Replace hardcoded `getSowTemplate()` in `contracts.service.ts` with read from new `ServiceTemplate` table. Key on `serviceTemplate + engagementType + retainerFlavour`. AI service injection retained but not called (v1). | P1.4 + P0.5 | 1 week | 🟡 Proposed |
| **P2.8** Cancellation policy enforcement | Engineering | `CancellationEvent` model recording reason, party, refund amount, payout penalty per Master Plan §2.8. Three-strikes logic for operator no-shows. First-deferral-grace logic. | P1.6 | 1 week | 🟡 Proposed |
| **P2.9** Conversion fee invoice trigger | Engineering | When `Engagement.status` transitions to `CONVERTED_TO_FULLTIME`, auto-generate Conversion Fee invoice (25% placeholder). Store as `LifecycleEvent`. | P1.6 | 3 days | 🟡 Proposed |
| **P2.10** End-to-end test: full happy-path engagement | QA | Test scenario: company signs up → diagnosis → match → unblur → call → intent → Pre-SOW Summary confirmed → MSA signed → SOW signed → engagement starts → completion. Run on dev with placeholder MSA/SOW/Summary documents. | All P2 tasks | 1 week | ⚪ |

### Phase 2 — Definition of Done

- A test Company–Operator pair completes full happy-path flow on dev
- Placeholder MSA, SOW, and Pre-SOW Summary are referenced in the flow at the right gates
- Cancellation, deferral, and conversion-fee flows triggered and validated on test data

---

# Phase 3 — Payments Backend (3–4 weeks, parallel with Phase 2)

**Goal:** Build the structural payment plumbing — skeleton-only at this phase. No live partner integrations until Phase 6.

Per founder direction (G1, G5, G6): "build it in the backend, but the final wire-up will take place at a later stage."

| Task | Owner | Deliverable | Dependency | Estimate | Status |
|---|---|---|---|---|---|
| **P3.1** Stripe Connect Express skeleton | Engineering | Operator KYC-onboarding flow scaffolded but not connecting to Stripe production. Form fields collect (a) basic info → matching pool gate; (b) full W-9/W-8BEN + bank → MSA gate. Encrypted-at-rest storage. | P1.6 | 1 week | 🟡 Proposed |
| **P3.2** Razorpay payout extension scaffolded (per P0.12 feasibility note) | Engineering | API skeleton for INR-out payouts to operator Indian accounts (Scenario B). Razorpay-side wire-up deferred to Phase 6. | P0.12 + P1.6 | 1 week | 🟡 Proposed |
| **P3.3** Wise corridor skeleton (Scenario A — USD/EUR/GBP → INR/local) | Engineering | API skeleton for Wise multi-currency payouts. Wire-up deferred to Phase 6. Records `payoutCurrency`, `payoutCountry`, `fxRateAtSigning` per `PaymentPlan`. | P1.6 | 1 week | 🟡 Proposed |
| **P3.4** Multi-leg ledger | Engineering | Split `Invoice` into `operatorPayoutAmount` + `platformFeeAmount` + `eorFeeAmount` (where applicable). `PaymentEvent` records track each leg separately. | P1.6 | 1 week | 🟡 Proposed |
| **P3.5** Tax-form collection forms — basic | Engineering | UI form per tax-form type (W-9, W-8BEN, W-8BEN-E, GST/PAN, VAT). Stored encrypted in `OperatorTaxProfile`. Renewal-cadence tracking. Per founder direction G3: collect basic at onboarding (country of residence, tax residency, payout country, payout currency, individual vs entity); collect full forms before MSA generation. | P1.6 + P3.1 | 1.5 weeks | 🟡 Proposed |
| **P3.6** EOR partner enum + skeleton enrolment | Engineering | `EorPartner` enum (Deel / Remote / Multiplier). `OperatorEorEnrollment` model with status, partner-side ID placeholder. No live partner API integration this phase. | P1.6 | 3 days | 🟡 Proposed |
| **P3.7** Compliance mode resolver — rule-based | Engineering | `compliance.service.ts` per Master Plan §6.2.C. At MSA generation, runs trigger sub-table (Master Plan §5.3): IR35 / EU Platform Worker / PE-mismatch / corridor / hours / duration → returns one of 7 compliance modes. Routes to ops/legal queue where review needed. Initially uses placeholder corridor classifications until P0.14 deep-research returns and legal validates. | P1.6 + P0.14 | 1 week | 🟡 Proposed |
| **P3.8** FX-absorption policy in code (per founder direction G4) | Engineering | Rate fixed at SOW signing. Founder absorbs full FX drift initially (no >2% re-quote logic in v1; flag for Phase 6 re-evaluation). | P3.4 | 2 days | 🟡 Proposed |

### Phase 3 — Definition of Done

- All payment-plumbing models, services, and forms exist and pass unit tests
- No live payments flow yet — flagged behind feature flags
- Tax-form collection works on dev, including hard rule that no MSA generates without tax docs on file

---

# Phase 4 — Website with Placeholders (2 weeks, parallel with Phase 2/3)

**Goal:** All public-facing changes live on the website, using placeholder copy and documents. Per your strategy: drop placeholders now, swap for finalised versions later (cheap operation).

Every change requires founder approval per the workflow in Master Plan §7.4. Drafts are in `Docs/legal-drafts/` from Phase 0.

| Task | Owner | Deliverable | Dependency | Estimate | Status |
|---|---|---|---|---|---|
| **P4.1** Update `/for-companies` engagement-types card grid | Marketing + Engineering | Three cards (Consultation / Sprint / Retainer with two flavours). Removes Hybrid and Success-fee as separate cards. | P0.10 + Founder approval | 2 days | 🟡 Proposed |
| **P4.2** Add new FAQ entry on `/for-companies` (legal/contracts question) | Marketing + Engineering | Per Master Plan §7.1 draft — links to placeholder MSA, SOW, Pre-SOW Summary, Contracts & Payments FAQ samples. | P0.4–P0.7 + P0.9 + Founder approval | 1 day | 🟡 Proposed |
| **P4.3** Add new FAQ entry on `/for-talent` (contracts + payment question) | Marketing + Engineering | Per Master Plan §7.1 draft — same sample-document links. | P0.4–P0.7 + P0.9 + Founder approval | 1 day | 🟡 Proposed |
| **P4.4** Update operator-side role display | Marketing + Engineering | `/for-talent` page lists 6 public role buckets (P0.3 names) with the underlying job titles shown on click/expand. | P0.3 + Founder approval | 2 days | 🟡 Proposed |
| **P4.5** Resolve unlock-fee inconsistency on the website | Engineering | All public references show ₹8,500 INR (company) and $50 USD (operator). | P0.2 | 0.5 day | 🟡 Proposed |
| **P4.6** Name AI diagnosis as a visible product step | Marketing + Engineering | Update "How matching works" Step 01 on `/for-companies` to explicitly name the AI diagnosis step. | P0.10 + Founder approval | 0.5 day | 🟡 Proposed |
| **P4.7** Build `/learn` page | Marketing + Engineering | All 6 sections per Master Plan §7.3: hero, when-fractional-makes-sense, wrong-hire-cost calculator (interactive), engagement-type cards, role-engagement matrix, FAQ. | P0.10 + P0.3 + Founder approval | 2 weeks | 🟡 Proposed |
| **P4.8** Sample-document hosting infrastructure | Engineering | `/Docs/legal-drafts/*.pdf` served as static assets. Each linked from FAQ entries with a "SAMPLE — finalised version coming soon" disclaimer banner. | P0.4–P0.8 | 1 day | 🟡 Proposed |
| **P4.9** Public role-bucket landing pages (optional, ship if time allows) | Marketing + Engineering | One mini-page per public role bucket explaining what the bucket does, typical engagement types, indicative price. | P0.3 + P4.7 | 1 week | 🟡 Proposed |
| **P4.10** Founder-approval gates for every public-facing string | Founder | Per Master Plan §7.4: drafts → founder approval → engineering → publish. Every copy change requires written sign-off. | P0.9 + P0.10 | Cumulative | 🟢 Locked (process) |

### Phase 4 — Definition of Done

- Both audience pages have the new FAQ entries, with placeholder document links live
- `/learn` page is accessible at `/learn` with all 6 sections rendered
- Engagement-types card grid reflects the 3-type (with flavours) model
- Unlock-fee number is consistent everywhere
- Every published string passed Founder approval

---

# Phase 5 — Legal & Finance Validation (4–6 weeks, parallel)

**Goal:** Counsel converts placeholder drafts into legally sound finalised versions. Tax counsel produces corridor-by-corridor rules. Founder confirms based on their input.

This phase runs in parallel with Phases 2, 3, 4 — it does not block them. It blocks Phase 6 only.

| Task | Owner | Deliverable | Dependency | Estimate | Status |
|---|---|---|---|---|---|
| **P5.1** Counsel reviews MSA draft → produces final MSA template | Legal counsel | Jurisdiction-specific revisions per India + EU + US. Returns final template for D2 lock. | P0.4 + P0.13 | 2–3 weeks | 🔴 Needs review |
| **P5.2** Counsel reviews SOW draft → produces final SOW template | Legal counsel | Aligned with finalised MSA. Returns final template for D3 lock. | P0.5 + P5.1 | 2 weeks | 🔴 Needs review |
| **P5.3** Counsel reviews addenda — Hybrid, Success-Fee, Equity-Only, Conversion | Legal counsel + Securities counsel for equity | Each addendum reviewed separately. Hybrid + Equity-Only need securities counsel. | P0.8 + P0.13 | 3–4 weeks | 🔴 Needs review |
| **P5.4** Tax counsel produces rules per major corridor | Tax counsel | When does W-9 vs W-8BEN apply per scenario; GST/TDS rules for India; VAT rules for EU/UK; PE-mismatch handling; specific thresholds (e.g., $600 1099 trigger). | P0.13 | 2–3 weeks | 🔴 Needs review |
| **P5.5** Country tier classification — final | Founder + Legal + ChatGPT deep research | Final list of Tier 1 / 2 / 3 corridors with per-country contractor risk note. Replaces placeholder in code. | P0.14 + P5.4 | 2 weeks | 🔴 Needs review |
| **P5.6** EOR partner contracts signed | Founder + Legal | Master Service Agreements with Deel + Remote + Multiplier. Pricing locked. | P0.13 | 4 weeks | 🔴 Needs review |
| **P5.7** Indian payout corridor rules | Founder + Legal + Finance + Tax counsel | Final rules for Scenario A (Wise → NRE) and Scenario B (Razorpay INR direct). FEMA / GST / TDS / DTAA handling spelled out. | P5.4 | 2 weeks | 🔴 Needs review |
| **P5.8** Public compliance language final review | Founder + Legal | All public-facing copy involving compliance, EOR, payments, tax, conversion fees reviewed for accuracy and absence of representations BridgeScale cannot guarantee. | P5.1 + P5.2 + P5.4 | 1 week | 🔴 Needs review |
| **P5.9** Pre-SOW Commercial Summary — non-binding language confirmed | Legal counsel | Confirm "non-binding alignment check" framing holds in target jurisdictions. | P0.6 + P0.13 | 1 week | 🔴 Needs review |
| **P5.10** Conversion fee enforceability check | Legal counsel | Confirm 25% conversion fee clause is enforceable in major jurisdictions; 12-month window enforceable; trigger-on-accepted-offer language stands up. | P5.1 | 1 week | 🔴 Needs review |
| **P5.11** Non-circumvention clause enforceability | Legal counsel | Confirm 12-month window is enforceable per jurisdiction (note: California and India are weaker than US/EU on non-competes). | P5.1 | 1 week | 🔴 Needs review |

### Phase 5 — Definition of Done

- Final MSA, SOW, addendum templates approved by counsel and founder
- Tax-form rules per Tier-1 corridor in writing
- Country tier classification final
- EOR partner contracts signed
- All public compliance language reviewed and approved
- Decision Register has every 🔴 item promoted to 🟢

---

# Phase 6 — Wire-up & Polish (4–6 weeks, after Phases 2/3/5 complete)

**Goal:** Replace placeholders with finalised versions. Wire payment rails live. Go-live.

| Task | Owner | Deliverable | Dependency | Estimate | Status |
|---|---|---|---|---|---|
| **P6.1** Replace placeholder MSA / SOW / Summary / addenda with finalised versions | Engineering + Marketing | Update document URLs in `/Docs/legal-drafts/` (or rename to `/Docs/legal-final/`). Founder approval per swap. | P5.1 + P5.2 + P5.3 | 1 day per artefact | ⚪ |
| **P6.2** Wire Stripe Connect Express live | Engineering | Real Stripe Connect onboarding for operators. Live ACH out for US operators. Live W-9/W-8BEN collection via Stripe-hosted forms. | P3.1 + P5.4 | 1 week | ⚪ |
| **P6.3** Wire Razorpay payout (Scenario B) | Engineering | Live INR payout from BridgeScale Indian entity to operator Indian accounts. | P3.2 + P5.7 | 1 week | ⚪ |
| **P6.4** Wire Wise corridor (Scenario A + EU/UK/AU/SG/UAE corridors) | Engineering | Live cross-border USD/EUR/GBP/AUD/SGD/AED → INR/local payouts via Wise API. | P3.3 + P5.7 | 2 weeks | ⚪ |
| **P6.5** Wire Deel API integration (first EOR partner live) | Engineering | Operators can be enrolled with Deel. SOW generation routes EOR-required engagements through Deel. EOR fee invoiced to Company as separate line. | P3.6 + P5.6 | 2 weeks | ⚪ |
| **P6.6** Wire Remote API integration (EU operators) | Engineering | Same as P6.5 but for Remote. | P3.6 + P5.6 | 2 weeks | ⚪ |
| **P6.7** Wire Multiplier API integration (India + APAC operators) | Engineering | Same as P6.5 but for Multiplier. | P3.6 + P5.6 | 2 weeks | ⚪ |
| **P6.8** 1099-NEC issuance | Engineering | Annual 1099-NEC issuance via Stripe Connect (or Track1099 fallback) for US operators with >$600 in payouts. | P6.2 + P5.4 | 1 week | ⚪ |
| **P6.9** Conversion fee live invoicing | Engineering | When Company hires Operator full-time, auto-issue Conversion Fee invoice (25% — final number from P5.10). | P2.9 + P5.10 | 3 days | ⚪ |
| **P6.10** Public compliance copy final lock | Marketing + Founder | Replace placeholder language with finalised public copy from P5.8. Founder approval per surface. | P5.8 + P4.10 | 1 week | ⚪ |
| **P6.11** End-to-end production smoke test | QA + Founder | Test Company–Operator pair runs full real engagement (paid, signed, executed) on production. | All P6 tasks | 1 week | ⚪ |
| **P6.12** Go-live launch | Founder + Marketing | Public announcement, comms package, sales-ready collateral. | P6.11 | 1 day | ⚪ |

### Phase 6 — Definition of Done

- Live engagements running through finalised contracts and finalised payment rails
- All three EOR partners wired (Deel + Remote + Multiplier)
- 1099 issuance scheduled and tested
- Public copy is finalised, no placeholder language remaining

---

# Cross-Phase Summary

## Critical Path

```
P0 (Preparation, 1–2 wks)
   → P1 (Foundation, 3–4 wks)
       → P2 (Core Flow, 4–5 wks)
   ↓
P5 (Legal/Finance Validation, 4–6 wks, runs parallel from end of P0)
   ↓
P6 (Wire-up & Polish, 4–6 wks)
   → Go-live
```

Total elapsed time on critical path: **~16–22 weeks** end-to-end.

Phases 3 (payments backend skeleton), 4 (website with placeholders), and 5 (legal validation) run **in parallel** with Phase 2. They do not extend the critical path.

## Decision Gates

| Gate | When | Who decides | What's decided |
|---|---|---|---|
| **G-A** | End of P0 | Founder | Lock the 6 open Decision Register items; approve all draft documents; approve schema migration plan |
| **G-B** | End of P1 | Founder | Approve the foundation-layer build before Phase 2 starts |
| **G-C** | End of P2 | Founder + QA | Approve happy-path flow on dev |
| **G-D** | End of P4 | Founder | Approve the website with placeholders going public |
| **G-E** | End of P5 | Founder + Legal | Approve all finalised legal templates and corridor rules |
| **G-F** | End of P6 | Founder + QA + Legal | Approve go-live |

## Parallel Tracks

Per the structure above, three tracks run in parallel from week 3 onwards:

- **Engineering track**: P1 → P2 → P3 → P6 wire-ups
- **Legal/Finance track**: P0.13 → P5 → counsel-approved finals → P6.10
- **Marketing/Content track**: P0.9 → P0.10 → P4 → P6.10

The three tracks meet at Phase 6.

## Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Schema migration regression | High | Stage in dev with full backfill; shadow-run for 1 week; feature flag rollout. |
| Counsel takes longer than 4–6 weeks | High | Engage in P0.13 immediately; parallel multi-jurisdiction. |
| EOR partner contracts negotiate slowly | Medium | Sign Deel first to unblock Tier-1; Remote/Multiplier can lag. |
| MSA-signing UX too high friction | Medium | BridgeScale pre-signs platform terms; async counter-sign. |
| Operator drop-off at full-tax-doc stage | Medium | Three-stage gate (P1.7) ensures only paid-engagement-bound operators hit the friction. |
| Wise corridor cost higher than expected | Low | Negotiate volume discount once monthly volume >$50k. |
| Conversion fee disputes | Medium | Strong contract clause + monitoring (LinkedIn role-change scrape). |

## Resource Loading

Approximate effort by track:

| Track | Effort over the 16–22 weeks |
|---|---|
| Engineering (full-time equivalent) | ~3 FTE for the duration |
| Outside Advisor | ~1–2 days/week, throughout |
| Legal counsel | ~30–40 billable hours total, concentrated in P5 |
| Tax counsel | ~15–20 billable hours total, concentrated in P5 |
| Founder | ~1 day/week reviewing + decisions, throughout |
| Marketing/Content | ~1 FTE during P0 + P4 + P6.10 |

## Status Tracking

This plan should be reviewed weekly by the founder + outside advisor + engineering lead. Status changes (status flips, dates slipping, scope changing) should be recorded in the History section below.

---

## History

| Date | Version | Change |
|---|---|---|
| 2026-04-27 | 1.0 | Initial plan. Six phases, ~16–22 week critical path. Aligned with Decision Register v1.0 and Master Plan v1.0. |

---

## Cross-Reference Index

| Document | Purpose |
|---|---|
| `BridgeScale_Master_Plan_v1.0_2026-04-27.md` | Operating model, contracts, payments/tax/compliance, repo changes, website plan |
| `BridgeScale_Decision_Register_2026-04-27.md` | Status of every decision (Locked / Proposed / Needs review / Open) |
| `BridgeScale_Operating_Matrix.xlsx` | Runtime lookup matrices (will be migrated to DB seed in P1.5) |
| `Docs/BRIDGESCALE_SERVICE_MODEL/07_SERVICE_ROLE_ENGAGEMENT_PAYMENT_COMPLIANCE_MAPPING.md` | Canonical taxonomy reference |
| `Docs/legal-drafts/` (created in P0) | All placeholder PDFs |

---

*End of Implementation Plan v1.0.*
