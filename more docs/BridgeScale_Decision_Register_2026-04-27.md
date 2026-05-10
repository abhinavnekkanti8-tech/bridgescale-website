 # BridgeScale — Decision Register v1.0
### Consolidated decisions across all rollout work, graded by status

**Date:** 27 April 2026
**Owner:** BridgeScale Founding Team
**Maintained by:** Outside Advisory + Founders
**Status:** Living document — reviewed and updated weekly

---

## Status Taxonomy

| Status | Definition | What it means in practice |
|---|---|---|
| **🟢 Locked** | Founder direction + legal/finance validated + implementation feasibility confirmed. | Engineering can build against it. Marketing can publish about it. Treated as binding. |
| **🟡 Proposed** | Founder direction is clear, but external validation (legal, finance, or implementation) is still pending. | Engineering may scope but not ship. Marketing may draft but not publish. Likely to hold but reserves the right to change. |
| **🔴 Needs legal/finance review** | Direction is set, but the specifics depend on outside expertise. Cannot be locked without that input. | Do not build, draft, or publish until review completes. Block downstream work that depends on this. |
| ⚪ Open | No direction yet. Founder decision required before status can move to any of the above. | Surface in next founder working session. |

A decision moves *forward*: ⚪ Open → 🟡 Proposed → 🔴 Needs legal/finance review (if applicable) → 🟢 Locked. It can also move *backward* if new information arrives (e.g., a Locked decision returns to Proposed if legal raises a concern).

---

## Cross-cutting note

All items previously labelled "Locked" in the Master Plan §8.1 have been re-graded against this taxonomy. The taxonomy is stricter — most items that were "Locked" earlier are now Proposed or Needs review, because they reflect founder direction but not yet legal/finance/implementation validation.

This document supersedes §8.1 and §8.2 of the Master Plan. The Master Plan v1.1 (next revision) will reference this register rather than maintain its own status list.

---

# Decision Register

## A. Strategic & Positioning

| ID | Decision | Status | Recommendation / Direction | Owner | Validation Required Before Lock |
|---|---|---|---|---|---|
| A1 | Three service lanes (no fourth lane carved out for CS) | 🟢 Locked | Fractional Leadership / BD-Partnerships / Execution-Ops | Founder | None — taxonomy decision only |
| A2 | Service lane labels (drop "Sales" prefix) | 🟢 Locked | "Fractional Leadership" / "Fractional BD / Partnerships" / "Fractional Execution / Operations" | Founder + Marketing | None |
| A3 | India-domestic engagements supported? | 🟢 Locked — NO | India-outbound only. India-domestic out of scope. | Founder | None |
| A4 | Public-facing role grouping (6 buckets vs 22 internal roles) | 🟡 Proposed | 6 public buckets: Sales Leadership / GTM Strategy & Coaching / BD & Partnerships / Sales Execution / Revenue Ops & Enablement / Customer Success & Expansion. Internal taxonomy keeps 22-role enum. | Founder + Marketing | Wireframe + buyer feedback on `/for-companies` | # I think we need better names to communicate to the users. these names seems as if they are made up roles. 
| A5 | Positioning statement: *"Fractional diaspora senior talent. Vetted, scoped, platform-managed."* | 🟢 Locked | Holds as-is. | Founder | None |

## B. Operating Model — Roles, Templates, Engagements

| ID | Decision | Status | Recommendation / Direction | Owner | Validation Required Before Lock |
|---|---|---|---|---|---|
| B1 | Five-layer model (Lanes / Roles / Templates / Engagement Types / Compensation) as canonical | 🟢 Locked | Per Master Plan §2.1 and Doc 07 | Founder + Engineering | None |
| B2 | 22-role internal taxonomy (closed enum) | 🟡 Proposed | Listed in Master Plan §2.3 | Founder + Engineering | Engineering: confirm enum can be added without breaking existing OperatorProfile.functions data | # ok.
| B3 | Sales Enablement & Solutions Consultant — single combined role | 🟢 Locked | Per founder direction; lives in Execution / Ops lane | Founder | None |
| B4 | 10 service templates | 🟡 Proposed | Listed in Master Plan §2.4 | Founder + Marketing | Pressure-test against first 5 buyer intakes; confirm trigger phrases land |  # locked
| B5 | Engagement types collapsed to 3 (Consultation / Sprint / Retainer) with Retainer in two flavours (Leadership / Operator) | 🟢 Locked | Advisory/Equity and Success-Fee become compensation modifiers. | Founder | None |
| B6 | 60-day minimum for Retainer | 🟡 Proposed | Was 90 days in earlier drafts; founder direction is 60. | Founder + Legal | Legal: confirm 60-day minimum doesn't trigger employment-classification issues in Tier-2 corridors | # locked
| B7 | 6 compensation modes (Cash Only / Cash+Success Fee / Cash+Equity / Equity Only / Cash+Equity+Success Fee / Other) | 🟡 Proposed | Per Master Plan §2.6 | Founder + Finance | Finance: confirm accounting treatment for each mode (especially equity) |# locked
| B8 | Combinations matrix (Role × Template × Engagement) read at runtime by matching engine and SOW generator | 🟡 Proposed | Per Operating Matrix sheet 06 | Engineering | Engineering: feasibility of moving matrix to a versioned config table vs hardcoded | # instead of reading from an excel. can we make it as seed or something that it is easier and optimized to read for the engine or algorithm.

## C. Marketplace Flow

| ID | Decision | Status | Recommendation / Direction | Owner | Validation Required Before Lock |
|---|---|---|---|---|---|
| C1 | Symmetric onboarding: both sides see blurred matches and pay to unblur | 🟢 Locked | Operator $50, Company $100 | Founder | None |
| C2 | Operator profile completeness gate (revised) | 🟡 Proposed | **Three-stage gate (revised per founder direction):** (1) basic profile + tax residency + payout preference → matching pool entry; (2) full W-9/W-8BEN/KYC + bank → before MSA generation for first paid engagement; (3) all docs validated → before first payout. | Founder + Engineering | Engineering: build three-stage gate without overcomplicating onboarding UX | # locked
| C3 | 30-min call as qualifying gate, free to both parties | 🟢 Locked | Per Master Plan §3.2 | Founder | None |
| C4 | **Pre-SOW Commercial Summary inserted between MSA-signing and SOW-drafting** | 🟡 Proposed | New step. One-page summary covering engagement type, term, fee, comp mode, special terms, cancellation. NON-binding alignment check before full SOW drafting. Linked from FAQ entries as sample. | Founder + Engineering + Legal | Legal: confirm "non-binding" framing holds in target jurisdictions; Engineering: design generation logic | #After 30-minute call and mutual engagement intent, before MSA signing.
| C5 | MSA persists per Company–Operator pair; reused for subsequent SOWs | 🟢 Locked | No re-signing needed for second + engagements between same pair | Founder + Legal | Legal review of reuse clause language is required before MSA template publication (see D2) |
| C6 | SOW v1 = templates, v2 = AI from call notes (deferred until ~20 calls collected) | 🟢 Locked | Per Master Plan §3.4 | Founder + Engineering | None |

## D. Contracts (MSA, SOW, Addenda)

| ID | Decision | Status | Recommendation / Direction | Owner | Validation Required Before Lock |
|---|---|---|---|---|---|
| D1 | Tri-party MSA structure (BridgeScale + Company + Operator) | 🟡 Proposed | Per Master Plan §4.1 | Founder + Legal | Legal: full MSA template review; jurisdiction-specific revisions | # for now, add it from the Master Plan §4.1
| D2 | MSA template content (the 11 sections in §4.1) | 🔴 Needs legal/finance review | Draft skeleton in Master Plan §4.1 — needs counsel | Legal counsel | Cross-border employment lawyer (India + EU + US) | #for now, we will add the link in the website, and point it to a document that is as similar to that of the tri agreement from Knex - "C:\Users\manis\Desktop\AG\Platform\BridgeScale Research Docs\Knex Tri-Party Service Agreement.pdf"
| D3 | SOW template content (the 12 sections in §4.2) | 🔴 Needs legal/finance review | Draft skeleton in Master Plan §4.2 | Legal counsel | Cross-border employment lawyer; should align with MSA | ##for now, we will add the link in the website, and point it to a document that is as similar to that of the tri agreement from Knex - "C:\Users\manis\Desktop\AG\Platform\BridgeScale Research Docs\SOW Template - Long term engagement.docx"
| D4 | Conversion fee = 25% of FY1 cash compensation | 🟡 Proposed | Category benchmark; included in MSA draft | Founder + Legal + Finance | Finance: confirm enforceable; Legal: confirm clause language | # for now, 25% is just a placeholder
| D5 | Non-circumvention period = 12 months post-engagement | 🟡 Proposed | Per Knex benchmark | Founder + Legal | Legal: enforceability per jurisdiction (12mo non-compete may not be enforceable in California, India) | #ok
| D6 | Pre-SOW Commercial Summary template | 🟡 Proposed | New deliverable per C4 | Founder + Legal | Legal: non-binding language; Engineering: structured-input source | #locked
| D7 | Addendum templates (Hybrid / Success-Fee / Equity-Only / Conversion) | 🔴 Needs legal/finance review | Skeletons in Master Plan §4.3 | Legal counsel + Finance | Each addendum needs separate legal review (especially equity) | #for now, we keep it as placeholder and point it to a document. Also, we need to have something in the website something like : "C:\Users\manis\Desktop\AG\Platform\BridgeScale Research Docs\Knex Contracts & Payments FAQ.docx"
| D8 | Cancellation policy with operator's first-deferral grace | 🟢 Locked | Per Master Plan §2.8 | Founder | None |

## E. Pricing & Platform Fee

| ID | Decision | Status | Recommendation / Direction | Owner | Validation Required Before Lock |
|---|---|---|---|---|---|
| E1 | Platform fee model: Hybrid Option C | 🟢 Locked | $50 operator activation + $100 company unlock + 10% engagement fee + EOR charge-through | Founder | None |
| E2 | Operator activation fee = $50 USD, paid AFTER profile + tax docs complete and matches shown | 🟡 Proposed | Per founder direction; revised from earlier "before matching" version | Founder + Finance | Finance: payment-processing fee bears on margin; confirm net economics | # profile is made using Gmail, Outlook, Apple or email + password. for email + password method a verification email link should sent. after signing up, the operator needs to complete his profile details along with gates and some tax residency and payout prefrence --> as soon as the profile is completed, the user's profile is considered for the matching and added to the matching talent pool --> matching happens but shows blurred matches --> pays then blurred becomes unblurred
| E3 | Company unlock fee = $100 USD, per match shortlist | 🟡 Proposed | Per founder direction | Founder + Finance | Finance: same as E2 | # company unlock fee is 8500 INR
| E4 | Resolve unlock-fee inconsistency across CLAUDE.md ($8,500 INR), `/for-companies` ($100), `/for-talent` ($50) | 🟡 Proposed | Pin to USD across all surfaces; remove ₹8,500 reference | Founder + Engineering | Engineering: search-and-replace audit | no, the company pays in INR because it is based in India
| E5 | Engagement fee = 10% of operator stated rate, paid by Company on top | 🟡 Proposed | Per Master Plan §5.1 | Founder + Finance | Finance: validate against Stripe Connect application_fee mechanics | # it is placed as a placeholder
| E6 | EOR fee charged through to Company at cost as separate line item | 🟡 Proposed | Per Master Plan §5.5 | Founder + Finance + Legal | Finance: confirm pass-through accounting; Legal: confirm SOW disclosure language | # yes, locked.
| E7 | EOR cost — fully charge-through, partial absorption, or first-engagement subsidy? | ⚪ Open | Per founder note line 128: needs deeper memo. Recommendation: charge-through with optional first-engagement subsidy if needed for top-of-funnel acceleration. | Founder | Founder direction needed | # fully charge-through

## F. Compensation & Equity

| ID | Decision | Status | Recommendation / Direction | Owner | Validation Required Before Lock |
|---|---|---|---|---|---|
| F1 | Equity instruments supported at launch | ⚪ Open | Recommend: FAST advisor agreement only at launch. Add option grants in v2 once securities counsel reviewed. | Founder + Securities counsel | Founder direction + counsel review | # going by recommendation. https://fi.co/fast
| F2 | Success-fee triggers allowed without legal review | ⚪ Open | Recommend whitelist: 'Qualified Meeting Held + Accepted', 'Signed Partner Agreement', 'Closed-Won Deal'. Anything else routes to legal review. | Founder + Legal | Legal: confirm whitelist doesn't trigger commission-regulation issues | # let's go with recommendation
| F3 | Late-cancellation window for Consultation = 24 hours | 🟡 Proposed | Per Master Plan §2.8 | Founder | None substantive — confirm window | # ok. agreed. locked.

## G. Payments, Tax, Compliance, EOR

| ID | Decision | Status | Recommendation / Direction | Owner | Validation Required Before Lock |
|---|---|---|---|---|---|
| G1 | Day-1 EOR partner stack: Deel + Remote + Multiplier | 🔴 Needs legal/finance review | Per founder direction (line 106) | Founder + Legal + Finance | Legal: review each partner's master service contract; Finance: validate per-operator monthly cost; Implementation: API integration scope per partner | # we will build it in the backend, but the final wireup will take place at a later stage.
| G2 | Indian payout corridors: Wise USD→INR (Scenario A) + Razorpay INR (Scenario B) | 🔴 Needs legal/finance review | Per Master Plan §5.6 | Founder + Legal + Finance | Legal: FEMA/GST/TDS compliance per scenario; Finance: confirm rail costs and reconciliation; Engineering: integration scope | # I am not sure I understand.
| G3 | Tax-form handling rules (W-9, W-8BEN, W-8BEN-E, GST/PAN, VAT) | 🔴 Needs legal/finance review | Per Master Plan §5.4 | Legal + Finance | Tax counsel for each major corridor (US, EU, UK, India) | # Collect early:

country of residence
tax residency
payout country
payout currency
individual vs entity
Collect later, before paid engagement/payout:

W-9 for US persons
W-8BEN/W-8BEN-E for non-US persons/entities where relevant
PAN/GST/entity docs for India where relevant
VAT/local documents for EU/UK where relevant

| G4 | Currency stance — operator paid USD or local? | 🟡 Proposed | Local where Wise rail exists; USD default elsewhere. FX fixed at SOW signing. | Founder + Finance | Finance: confirm FX-drift absorption policy (≤2% absorbed; >2% triggers re-quote) | # initially, I will accept payment in any terms and I will absorb the fx burden
| G5 | Country tier classification (Tier 1 / 2 / 3) | 🔴 Needs legal/finance review | Per Master Plan §5.5 | Founder + Legal | Legal: confirm contractor risk per Tier-1 country; corridor-specific review for Tier-2 | # let a chatgpt deepresearch on this, but until then we will build it in the backend
| G6 | Compliance modes (7) including B2B Service Provider and EU Platform Worker | 🟡 Proposed | Per Master Plan §5.3 | Founder + Legal | Legal: EU Platform Workers Directive analysis; B2B classification per jurisdiction | #I think we will build this too
| G7 | Trigger conditions sub-table (IR35, EU Platform Worker, PE mismatch) | 🔴 Needs legal/finance review | Per Master Plan §5.3 | Legal | Tax/employment counsel review | # needs more explanation
| G8 | Conversion fee invoicing trigger and timing | 🟡 Proposed | Trigger on accepted offer; invoice due within 90 days of FT start date | Founder + Legal | Legal: enforceability of trigger language | #ok, going with recommendation.

## H. Engineering & Schema

| ID | Decision | Status | Recommendation / Direction | Owner | Validation Required Before Lock |
|---|---|---|---|---|---|
| H1 | Schema migration #1 — split OperatorLane / PackageType into ServiceLane / EngagementType / RetainerFlavour / ServiceTemplateCode | 🟡 Proposed | Per Master Plan §6.1 | Engineering | Engineering: full migration plan including data backfill | # I am not sure on the engineering topics
| H2 | Schema migration #2 — closed OperatorRole enum (replaces String[] functions) | 🟡 Proposed | Per Master Plan §6.1 | Engineering | Engineering: validate against current operator profiles in DB | #
| H3 | Schema migration #3 — MasterServiceAgreement model | 🟡 Proposed | Per Master Plan §6.1 | Engineering + Legal | Legal: confirms MSA layer is needed (gating contract structure decisions in section D) |
| H4 | Schema additions (OperatorTaxProfile, CompensationMode + addendum models, ComplianceMode + audit log, EorPartner, PaymentPlan currency split, extended SowStatus, CancellationEvent, LifecycleEvent) | 🟡 Proposed | Per Master Plan §6.1 | Engineering | Engineering: prioritise within Phase 1/2/3 sequencing |
| H5 | SOW generation v1 — wire to ServiceTemplate table (replaces hardcoded templates) | 🟡 Proposed | Per Master Plan §6.2.A | Engineering | Engineering scope |
| H6 | MSA generation service module | 🟡 Proposed | Per Master Plan §6.2.B | Engineering + Legal | Legal: MSA template content (D2) must lock first |
| H7 | Compliance mode resolver (rule-based at MSA generation) | 🟡 Proposed | Per Master Plan §6.2.C | Engineering + Legal | Rules depend on G5/G6/G7 review |
| H8 | Payout router (Stripe Connect ACH / Wise / Razorpay / EOR partner) | 🟡 Proposed | Per Master Plan §6.2.D | Engineering + Finance | Depends on G1/G2 review |
| H9 | Phase 1 / 2 / 3 build sequencing | 🟡 Proposed | Per Master Plan §6.3 | Engineering + Founder | Engineering capacity confirmation |

## I. Website & Public Communication

| ID | Decision | Status | Recommendation / Direction | Owner | Validation Required Before Lock |
|---|---|---|---|---|---|
| I1 | Approval workflow: drafts → founder approval → engineering → publish | 🟢 Locked | Per founder direction (line 414) | Founder + Marketing + Engineering | None |
| I2 | New FAQ entry on `/for-companies`: *"How is an engagement structured legally?"* with sample MSA + SOW + Pre-SOW Commercial Summary links | 🔴 Needs legal/finance review | Draft in Master Plan §7.1 | Founder + Legal | Legal: confirm public-facing language is accurate and not over-promising | yes, locked. make a draft
| I3 | New FAQ entry on `/for-talent`: *"What contracts will I sign and how do I get paid?"* | 🔴 Needs legal/finance review | Draft in Master Plan §7.1 | Founder + Legal | Same as I2 | #yes, make a draft
| I4 | Update engagement-types card grid on `/for-companies` to 3 types (Hybrid/Success-fee removed as separate cards) | 🟡 Proposed | Per Master Plan §7.1 | Founder + Marketing | None substantive — copy revision | 
| I5 | Resolve unlock-fee inconsistency across all surfaces | 🟡 Proposed | Pin to USD; per E4 | Founder + Engineering | Engineering audit | # yes
| I6 | Name AI diagnosis as a visible product step in matching-flow narrative | 🟡 Proposed | Per Master Plan §7.1 | Founder + Marketing | Copy revision | #ok
| I7 | `/learn` page (full IA per Master Plan §7.3) ships at launch | 🟡 Proposed | 6 sections including wrong-hire-cost calculator and role-engagement matrix | Founder + Marketing + Engineering | Founder approval per section; engineering scope | #ok
| I8 | Public role grouping (6 buckets vs 22 internal roles) | 🟡 Proposed | Per A4 | Founder + Marketing | Same as A4 | #yes, locked
| I9 | Sample MSA + SOW + Pre-SOW Commercial Summary documents to be linked from FAQs | 🔴 Needs legal/finance review | Sample versions of D2/D3/D6 templates | Legal counsel | Final templates lock first |# yes, for now make them and add in the website, make a draft
| I10 | All public compliance language (EOR mention, payment-flow language, conversion-fee description, tax-form mention) | 🔴 Needs legal/finance review | Drafts in Master Plan §7.1 | Founder + Legal | Legal: confirm accuracy and absence of representations BridgeScale cannot guarantee | # for now, go ahead

---

## Summary by Status

| Status | Count | Implication |
|---|---|---|
| 🟢 **Locked** | 13 | Build / draft / publish authorised. |
| 🟡 **Proposed** | 31 | Direction set; do not commit until validation completes. |
| 🔴 **Needs legal/finance review** | 11 | Block all downstream work that depends on these. |
| ⚪ **Open** | 3 | Founder decision required. |
| **Total** | **58** | |

The 11 items in 🔴 are the critical path. They cluster in three areas:
- **Contracts** (D2, D3, D7, I9) — gated on legal counsel
- **Payments / EOR / Tax** (G1, G2, G3, G5, G7) — gated on legal + finance + tax counsel
- **Public communication** (I2, I3, I10) — gated on whatever I9 / D2 / D3 produces

**Recommended sequencing**:
1. Engage cross-border employment counsel (India + EU + US) to lock D2, D3, D7 → unblocks I9, I2, I3
2. In parallel, engage tax counsel per Tier-1 corridor to lock G3, G5, G7 → unblocks G1, G2
3. Once D2 + G1 + G2 lock, finalise I10 and ship the public-facing FAQ entries

Approximate timeline: 3–4 weeks of legal/finance work to clear the 🔴 backlog. Engineering work in 🟡 can proceed in parallel where it doesn't depend on 🔴 items.

---

## How to Update This Register

1. **Single source of truth** — this document is the authoritative status list. The Master Plan §8 references this rather than maintaining its own list.
2. **Status changes** — recorded in the History table below with date and rationale.
3. **New decisions** — added under the appropriate section letter; assigned next ID in sequence.
4. **Weekly review cadence** — founder + outside advisor sweep every 🟡 and 🔴 item; promote to 🟢 where validation has completed; demote to 🟡 if new info raises concern on any 🟢.

---

## History

| Date | Version | Change |
|---|---|---|
| 2026-04-27 | 1.0 | Initial register. Re-graded all decisions from Master Plan §8.1/§8.2 against the three-status taxonomy. Added Pre-SOW Commercial Summary (C4, D6, I9). Adopted revised operator onboarding gate (C2). |

---

#D2/D3/D7/I9: Do not link Knex publicly; create BridgeScale samples.
E3/E4: Lock company fee as ₹8,500, not $100.
E5: Keep placeholder until final pricing.
E6/E7: EOR charge-through locked as business direction; partner/legal review pending.
F1/F2/F3: Lock direction, legal review for final docs.
G1/G2/G3/G5/G7: Build backend abstractions, but keep external/legal status pending.
I2/I3/I9/I10: Draft now, publish only after founder/legal approval