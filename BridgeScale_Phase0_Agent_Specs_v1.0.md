# BridgeScale — Phase 0 Agent Task Specs v1.0
### Tasks formatted for execution by an AI coding agent (Claude, Codex, Cursor) or content drafter

**Date:** 27 April 2026
**Companion to:** `BridgeScale_Implementation_Plan_v1.0_2026-04-27.md` (high-level plan), `BridgeScale_Master_Plan_v1.0_2026-04-27.md` (operating model), `BridgeScale_Decision_Register_2026-04-27.md` (status of every decision)

---

## How to Read These Specs

Each task is structured as a **self-contained brief** an AI agent can pick up and execute end-to-end without further clarification. The format:

```
TASK ID — Title
  Goal: [one-line outcome]
  Type: [Engineering | Document Drafting | Marketing Copy | Founder Decision]
  Context: [files / paths / models the agent will touch]
  Inputs: [existing state / prerequisites the task starts from]
  Outputs: [files created/modified, schema changes, copy produced]
  Constraints: [conventions to follow, things not to break]
  Acceptance Criteria: [how to verify the task is done]
  Complexity: [Trivial / Small / Medium / Large]
  Status: [⚪ pending | ⏳ in progress | ✅ done]
```

When handing a task to a coding agent, the entire brief can be pasted as the prompt. Mark the status field as you progress. When the work raises a new question, add a `> NOTE FROM AGENT:` block and pause for founder input.

---

## Phase 0 Task Specs

### P0.1 — Lock the remaining open Decision Register items

```
Goal:        Move every remaining ⚪ Open and 🔴 Needs-review item in
             BridgeScale_Decision_Register_2026-04-27.md to a definite
             status (🟡 Proposed at minimum), with a recorded direction
             even if external validation is still pending.
Type:        Founder Decision (60-min working session)
Context:     C:\Users\manis\Desktop\AG\Platform\BridgeScale_Decision_Register_2026-04-27.md
Inputs:      Current register (v1.0). The 11 🔴 items, the 3 ⚪ items.
Outputs:     - Decision Register v1.1 with each item carrying a direction,
               an owner, and a target date for moving to 🟢 Locked.
             - Status flips recorded in the History table at the bottom.
Constraints: - Do not move items to 🟢 Locked unless legal/finance/
               implementation feasibility is genuinely confirmed.
             - 🔴 items remain 🔴 until counsel returns; record the
               direction in a new "Founder direction (pending review)"
               column where helpful.
Acceptance:  - Zero ⚪ items remaining.
             - Every 🔴 item has a counsel-engagement target date.
             - History table updated with date and rationale per change.
Complexity:  Small (60-min session + 30-min write-up)
Status:      ⚪ pending
```

### P0.2 — Resolve unlock-fee inconsistency across all surfaces

```
Goal:        Pin the unlock fees to ₹8,500 INR (Company) and $50 USD
             (Operator) consistently across the codebase, copy, and
             reference docs.
Type:        Engineering + Marketing
Context:     - C:\Users\manis\Desktop\AG\Platform\CLAUDE.md (line referencing ₹8,500)
             - frontend/src/app/for-companies/page.tsx (currently shows $100)
             - frontend/src/app/for-companies/apply/page.tsx
             - frontend/src/app/for-talent/page.tsx (shows $50 — keep)
             - frontend/src/content/faq.ts (Companies section says $100)
             - backend/src/applications/applications.service.ts (initiate-unlock pricing)
Inputs:      Current copy + code references the value in three different
             places ($100, ₹8,500, ₹8500).
Outputs:     - All public surfaces show "₹8,500" for Company unlock.
             - Backend initiate-unlock generates Razorpay order in INR
               at the same amount (paise = 850000).
             - Operator-side stays at "$50" for activation fee
               (collected via Stripe).
             - CLAUDE.md updated to reflect single source of truth.
Constraints: - Do not change the underlying flow — just the displayed
               number and the backend amount.
             - Currency symbols must render correctly (₹ codepoint, $).
             - No formatting drift: "₹8,500" everywhere, not "₹ 8500"
               or "Rs 8500".
Acceptance:  - grep across the repo finds no remaining "$100" reference
               in connection with the company unlock fee.
             - Loaded /for-companies in browser shows ₹8,500.
             - Backend integration test passes for amount = 8500 INR.
Complexity:  Small (2–4 hours)
Status:      ⚪ pending
```

### P0.3 — Lock public role-bucket names

```
Goal:        Lock the 6 public role bucket labels:
             Sales Leadership / Sales Advisors / Partnerships & BD /
             Sales Execution / Sales Operations / Customer Success.
Type:        Founder Decision + Marketing
Context:     - BridgeScale_Master_Plan_v1.0_2026-04-27.md §2.3
             - BridgeScale_Decision_Register_2026-04-27.md A4 / I8
             - BridgeScale_Operating_Matrix.xlsx sheets 02_Roles, 04_Role_x_Template
Inputs:      Current proposed names ("GTM Strategy & Coaching" etc.)
             that founder rejected as "made up".
Outputs:     - Master Plan v1.1 reflects the 6 locked labels.
             - Operating Matrix v0.2 reflects the same labels (later
               task in P1).
             - Decision Register A4 / I8 marked 🟢 Locked.
Constraints: The 22-role internal enum (B2) is unaffected — it stays
             as the source of truth for matching. The 6 buckets are
             a presentation layer.
Acceptance:  Founder written confirmation of the 6 labels recorded
             in Decision Register history.
Complexity:  Trivial (already proposed; founder approval only)
Status:      🟡 Proposed (founder said "agree with the new names")
```

### P0.4 — Draft MSA placeholder document

```
Goal:        Produce the BridgeScale Master Service Agreement
             placeholder v0 in Markdown.
Type:        Document Drafting
Context:     - Reference structure: BridgeScale Research Docs/
                 Knex Tri-Party Service Agreement.pdf (read for
                 structural inspiration only; never copy text)
             - BridgeScale Master Plan §4.1 (skeleton)
             - Docs/legal-drafts/00_README.md (folder convention)
Inputs:      None — produce from scratch using BridgeScale's terms.
Outputs:     Docs/legal-drafts/01_MSA_BridgeScale_v0_DRAFT.md
Constraints: - All text must be BridgeScale's own — no Knex text.
             - Cover the 11 sections from Master Plan §4.1: Structure
               of Services, Relationship, Payments + Platform Fee,
               IP, Conversion Fee, Non-Solicitation/Non-Circumvention,
               Confidentiality, Term + Termination, Limitation of
               Liability, Case Studies, General Provisions.
             - Include a "STATUS — SAMPLE ONLY" banner at top.
             - Include a "Drafter Notes — Remove Before Legal Review"
               section at bottom flagging open items.
             - Include the 10% platform fee, 25% conversion fee
               placeholder rates with notes that they are placeholders.
             - Include the EOR pass-through clause (§3.5).
Acceptance:  - File exists at the specified path.
             - Founder reviews and marks up inline comments.
             - All 11 sections present with section numbers.
Complexity:  Medium (2–3 hours of careful drafting)
Status:      ✅ done — first draft saved 2026-04-27
```

### P0.5 — Draft SOW placeholder document

```
Goal:        Produce the per-engagement Scope of Work template
             placeholder v0.
Type:        Document Drafting
Context:     - Reference structure: BridgeScale Research Docs/
                 SOW Template - Long term engagement.docx (read for
                 structural inspiration only; never copy text)
             - BridgeScale Master Plan §4.2
             - The MSA placeholder (P0.4) — SOW must reference MSA
Inputs:      Master Plan §4.2 skeleton (12 sections).
Outputs:     Docs/legal-drafts/02_SOW_BridgeScale_v0_DRAFT.md
Constraints: - BridgeScale-rewritten throughout.
             - Cover 12 sections: Engagement Title, Service Lane &
               Template, Engagement Type (with Retainer flavour),
               Scope of Services, Deliverables, Success Metrics,
               Term, Fees + Payment, Compensation Mode, Reporting +
               Communication, Termination, Special Terms.
             - Reference the MSA by ID: "Addendum to MSA #[ID]".
             - Show how each compensation mode triggers a separate
               addendum (Hybrid / Success-Fee / Equity-Only).
             - Include placeholder fees marked clearly.
             - Match the SAMPLE banner + Drafter Notes pattern from
               the MSA.
Acceptance:  Founder reviews and marks up.
Complexity:  Medium (2–3 hours)
Status:      ⚪ pending
```

### P0.6 — Draft Pre-SOW Commercial Summary template

```
Goal:        Produce the one-page Pre-SOW Commercial Summary template
             that goes to both parties after 30-min call + mutual
             engagement intent, BEFORE MSA signing (per founder
             clarification on C4).
Type:        Document Drafting
Context:     - Decision Register C4 + D6
             - Master Plan §4.2 + the MSA placeholder context
Inputs:      None — produce from scratch.
Outputs:     Docs/legal-drafts/03_PreSOW_Commercial_Summary_BridgeScale_v0_DRAFT.md
Constraints: - One page.
             - Strictly NON-binding — language must make this clear
               in two places (header banner + closing line).
             - Cover: engagement type + flavour, service template,
               role(s), indicative term, indicative hours/week,
               indicative fee, compensation mode, special terms
               (success-fee triggers / equity components),
               cancellation rule that will apply, EOR (if any).
             - Both parties' confirmation captured as a checkbox
               or "Yes / Request edits" prompt.
             - Place in flow: AFTER 30-min call + mutual engagement
               intent, BEFORE MSA generation.
Acceptance:  Founder reviews. Legal counsel later confirms non-binding
             framing holds in target jurisdictions.
Complexity:  Small (1–2 hours)
Status:      ⚪ pending
```

### P0.7 — Draft Contracts & Payments FAQ placeholder

```
Goal:        Produce a BridgeScale-flavoured Contracts & Payments FAQ
             that lives at /Docs/legal-drafts/ and is linked from the
             website FAQ entries.
Type:        Document Drafting
Context:     - Reference structure: BridgeScale Research Docs/
                 Knex Contracts & Payments FAQ.docx (read for
                 structural inspiration only; never copy text)
             - The MSA + SOW placeholders (P0.4, P0.5)
Inputs:      The Knex FAQ has 7 sections: General Structure, Usage &
             Signature, Payments & Fees, IP & Confidentiality,
             Non-Circumvention & Solicitation, SOW-Specific Details,
             Other.
Outputs:     Docs/legal-drafts/08_Contracts_Payments_FAQ_BridgeScale_v0_DRAFT.md
Constraints: - BridgeScale-rewritten throughout.
             - Match the same 7-section shape but with BridgeScale's
               specifics: 10% platform fee, ₹8,500 unlock,
               $50 activation, EOR pass-through, three lanes,
               Pre-SOW Commercial Summary, etc.
             - Each Q is plain English, each A is one paragraph.
             - SAMPLE banner + Drafter Notes at bottom.
Acceptance:  Founder reviews; covers all common buyer + operator
             questions raised in earlier memo discussions.
Complexity:  Medium (2 hours)
Status:      ⚪ pending
```

### P0.8 — Draft addendum placeholders (4 documents)

```
Goal:        Produce four addendum templates corresponding to the
             four compensation modes that need addenda:
             Hybrid Cash + Equity, Success-Fee, Equity-Only,
             Conversion (full-time hire).
Type:        Document Drafting
Context:     - MSA placeholder §4 (IP), §5 (Conversion Fee)
             - Master Plan §4.3
             - FAST template reference: https://fi.co/fast (for the
               Equity-Only and Hybrid addenda)
Inputs:      Master Plan §4.3 list + compensation mode table.
Outputs:     Docs/legal-drafts/04_Addendum_Hybrid_Cash_Equity_v0_DRAFT.md
             Docs/legal-drafts/05_Addendum_Success_Fee_v0_DRAFT.md
             Docs/legal-drafts/06_Addendum_Equity_Only_v0_DRAFT.md
             Docs/legal-drafts/07_Addendum_Conversion_v0_DRAFT.md
Constraints: - Each is a one-page skeleton.
             - Each references the parent MSA and SOW by ID.
             - Hybrid + Equity-Only must reference FAST as the
               equity instrument default at launch.
             - Success-Fee includes the trigger whitelist:
               Qualified Meeting Held + Accepted, Signed Partner
               Agreement, Closed-Won Deal.
             - Conversion includes the 25% placeholder, 12-month
               window, 90-day invoice timing, 30-day payment terms.
             - Each carries the SAMPLE banner.
Acceptance:  Founder reviews each.
Complexity:  Medium total (4 × ~30–45 min = ~3 hours)
Status:      ⚪ pending
```

### P0.9 — Draft FAQ entry copy for /for-companies and /for-talent

```
Goal:        Produce the public FAQ entry copy per Master Plan §7.1,
             one entry per audience page, each linking to the sample
             documents from P0.4 + P0.5 + P0.6 + P0.7 + P0.8.
Type:        Marketing Copy
Context:     - Master Plan §7.1 has the draft copy
             - frontend/src/content/faq.ts is where it will live
             - The placeholder docs (P0.4–P0.8)
Inputs:      Master Plan §7.1 copy as a starting point.
Outputs:     Docs/legal-drafts/09_FAQ_entry_for_companies_v0_DRAFT.md
             Docs/legal-drafts/10_FAQ_entry_for_talent_v0_DRAFT.md
Constraints: - Markdown for review here — actual placement into
               frontend/src/content/faq.ts is a Phase 4 task.
             - Each entry must end with the four "→ View sample [doc]"
               links pointing to P0.4–P0.8 outputs.
             - Match the existing FAQ tone (clear, structural, no
               marketing fluff).
             - No mention of compensation amounts that are still
               placeholders ($100 → ₹8,500 must be reflected; 10%
               platform fee can be mentioned with disclosure).
Acceptance:  Founder approves each entry word-by-word.
Complexity:  Small (1 hour)
Status:      ⚪ pending
```

### P0.10 — Draft /learn page copy (6 sections)

```
Goal:        Produce the full copy and visual specs for the new
             /learn page per Master Plan §7.3.
Type:        Marketing Copy
Context:     - Master Plan §7.3 (IA outline)
             - The 6 public role-bucket names (P0.3)
             - The combinations matrix (Operating Matrix sheet 06,
               or eventual P1.5 DB seed)
Inputs:      None — produce from scratch using §7.3 as outline.
Outputs:     Docs/legal-drafts/11_Learn_page_copy_v0_DRAFT.md
             - Includes complete copy for: Hero, When-Fractional-
               Makes-Sense, Wrong-Hire-Cost calculator (inputs +
               output formula), Engagement Type cards (4 with
               Retainer flavour breakdown), Role × Engagement
               matrix (6 buckets × 4 engagement types), FAQ.
Constraints: - Calculator math: total wrong-hire cost ₹ in INR =
               (senior salary band ₹) + (recruitment fee % × salary)
               + (ramp months × monthly opportunity cost).
             - All numbers within copy must be marked "[placeholder]"
               or replaced with founder-approved values.
             - Tone consistent with existing /for-companies pages.
             - Engagement type cards reflect the locked 3 + flavour
               structure.
             - FAQ section consolidates from the audience-specific
               FAQs — see master plan §7.3 for which questions
               belong here vs. elsewhere.
Acceptance:  Founder approves section-by-section.
Complexity:  Large (4–6 hours of writing + spec)
Status:      ⚪ pending
```

### P0.11 — Engineering: detailed schema migration plan

```
Goal:        Produce a written, executable migration plan for the
             three HIGH-severity Prisma schema migrations from
             Master Plan §6.1.
Type:        Engineering (planning + write-up; no code yet)
Context:     - backend/prisma/schema.prisma
             - Master Plan §6.1 (3 migrations + 8 auxiliary additions)
             - Operating Matrix sheet 11_Repo_Schema_Gaps
Inputs:      Current schema. The list of enum/model changes from §6.1.
Outputs:     Docs/engineering/schema_migration_plan_v1.md
             with sections per migration:
             - Pre-migration data audit (count rows per affected table)
             - Migration script (Prisma migration + custom backfill)
             - Rollback script
             - Test plan (before/after counts; sample data integrity)
             - Feature flag strategy (which downstream code reads
               new vs. old enum)
Constraints: - Migrations must run on dev with the production-shape
               seed data without errors.
             - Backfill maps for the lane/engagement enum split must
               be explicit (PIPELINE_SPRINT package → serviceTemplate=
               PIPELINE_SPRINT + engagementType=SPRINT, etc.).
             - Role enum migration must populate sensible defaults
               based on existing OperatorProfile.functions free text.
Acceptance:  - Engineering lead reviews and signs off.
             - Founder is briefed on migration risk + rollback plan.
Complexity:  Medium (1–2 days)
Status:      ⚪ pending
```

### P0.12 — Engineering: Razorpay payout API feasibility note

```
Goal:        Confirm whether and how the existing Razorpay integration
             (currently used for Company-side INR collection) can be
             extended to Operator-side INR payouts (Scenario B in
             Master Plan §5.6).
Type:        Engineering (research + write-up)
Context:     - backend/src/payments/razorpay.service.ts
             - Razorpay docs (RazorpayX payouts product)
             - Master Plan §5.6 (Indian payout corridors)
Inputs:      Current Razorpay account capabilities.
Outputs:     Docs/engineering/razorpay_payout_feasibility.md
             with: API endpoints needed, KYC requirements, supported
             payout methods (NEFT/IMPS/RTGS), per-transaction cost,
             rate limits, error handling patterns.
Constraints: - Validate against BridgeScale's actual Razorpay account
               (RazorpayX may need to be enabled separately).
             - Document any FEMA/RBI restrictions on outbound INR
               payouts to non-resident NRO accounts.
Acceptance:  Engineering lead confirms feasibility note is actionable.
Complexity:  Small (4 hours)
Status:      ⚪ pending
```

### P0.13 — Founder: pick legal counsel

```
Goal:        Engage cross-border employment + tax counsel to begin
             Phase 5 work in parallel with engineering build.
Type:        Founder Decision
Context:     - Decision Register: 11 🔴 items gated on counsel
             - Master Plan §6.3 Phase 1
             - Implementation Plan §Phase 5
Inputs:      Need: Indian primary counsel + US/EU partner counsel
             (or equivalent multi-jurisdiction firm).
Outputs:     - Counsel engagement letter signed.
             - First brief to counsel includes: MSA placeholder
               (P0.4), SOW placeholder (P0.5), addendum placeholders
               (P0.8), and a list of the 7 most critical questions
               (governing law, IR35 handling, EU Platform Worker
               Directive, FEMA/GST/TDS, conversion-fee enforceability,
               non-circumvention enforceability per jurisdiction,
               equity-instrument support).
Constraints: - Founder can engage counsel via Anthropic-style
               flat-fee or ratecard. Recommend flat-fee where
               practical for predictability.
             - Avoid waiting for placeholder documents to be
               polished — counsel can review v0 drafts.
Acceptance:  Counsel onboarded and first brief delivered.
Complexity:  Founder time only (1 week of negotiation typical)
Status:      ⚪ pending
```

### P0.14 — ChatGPT-deep-research request for country tier classification

```
Goal:        Get a thorough, current research output on contractor
             vs. employment classification risk per country, focused
             on BridgeScale's 14 candidate corridors. Use as the
             input for legal counsel rather than asking counsel to
             do open-ended research at lawyer rates.
Type:        Document Drafting (research)
Context:     - Master Plan §5.5 (Country Tier Map)
             - Operating Matrix sheet 10_Country_Tier_Map
Inputs:      The 14 countries: US, UK, Canada, Germany, France,
             Netherlands, Spain, Italy, Portugal, Ireland, UAE,
             Singapore, Australia, India.
Outputs:     Docs/research/country_tier_classification_research.md
             with per country:
             - Contractor risk level (Low / Medium / High)
             - Specific employment-misclassification rules
               (e.g., Scheinselbständigkeit in Germany)
             - Hours/duration thresholds that flip risk
             - Whether common B2B-via-entity is acceptable
             - Whether IR35 / EU Platform Worker Directive applies
             - Recommended default mode (Contractor / EOR / B2B)
             - Recommended EOR partner per country
Constraints: - Sourced from current (2025–2026) law and rule changes,
               not pre-2024 references.
             - Cited sources for every classification claim.
             - Output format ready to hand to legal counsel for
               validation, not to act on directly.
Acceptance:  Counsel uses the document as their starting point in
             P5.5; significant adjustments are recorded.
Complexity:  Small (1–2 hours of structured prompting + review)
Status:      ⚪ pending
```

---

## Cross-Phase Notes for the Implementation Track

### What runs in parallel from Phase 0 onwards

```
P0 docs        ───────┬─────────────────────────────────►
                     ▼
P1 schema      ──────────┬─────────────────────────────►
                         ▼
P2 core flow   ──────────────┬───────────────────────►
                             ▼
P3 payments    ──────────────────────────────────────►
                             (parallel with P2)
P4 website     ──────────────────────────────────────►
                             (parallel with P2/P3)
P5 legal       ──────────────────┬───────────────────►
                                 (parallel from end of P0)
P6 wire-up     ──────────────────────────────────────►
                                          (after P2/P3/P5)
```

### How to hand a task to a coding agent

For an engineering task (e.g., P1.1):
1. Open the agent (Cursor / Codex / Claude in IDE) at the repo root.
2. Paste the task spec from this document.
3. Add: *"Begin work. Confirm understanding of the task before writing code; ask clarifying questions in a single batch."*
4. Review the agent's first response — confirm it has read the relevant files (Context block) before producing code.
5. Approve, or correct. Then let it execute.

For a content/draft task (e.g., P0.6 Pre-SOW Summary):
1. Paste the task spec into Claude.
2. Add: *"Produce the document at the specified output path. Markdown only. No external content."*
3. Review the produced markdown.
4. Either approve, or feed back inline edits and ask for v0.1.

### Status updates

When a task transitions, update the Status line in this document. When new tasks emerge (P0.15, P0.16, etc.), append them at the bottom of Phase 0. When Phase 0 closes, this document gets archived; Phase 1 specs are produced in `BridgeScale_Phase1_Agent_Specs_v1.0.md`.

### One ground rule for every agent

> Where placeholders or unfinished decisions are encountered (price bands, conversion fee %, EOR partner-specific behaviour), the agent must NOT invent values. Mark them clearly as `[placeholder — pending founder decision]` and flag them in a NOTE-FROM-AGENT block at the top of the agent's output.

---

*End of Phase 0 Agent Specs v1.0.*
