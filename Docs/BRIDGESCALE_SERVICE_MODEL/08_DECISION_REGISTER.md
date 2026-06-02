# Decision Register

## Purpose

This register prevents strategy ideas from being treated as implementation-ready decisions too early.

BridgeScale is designing a marketplace that touches contracts, cross-border payments, tax documents, equity, contractor classification, and potential EOR/AOR workflows. Some decisions are product/positioning decisions. Others require legal, finance, tax, compliance, vendor, or engineering feasibility review before they can be published or built.

## Status Definitions

### Locked

A decision is `Locked` when BridgeScale is ready to build, communicate, or operationalize it.

Use this only when:

- founder/product direction is clear
- legal/finance review is not required or has been completed
- implementation path is understood
- public copy can safely reflect it

### Proposed

A decision is `Proposed` when it is strategically preferred but not yet fully validated.

Use this when:

- it is the likely direction
- product/UX can be drafted around it
- engineering can estimate it
- public copy should not yet make hard promises

### Needs Legal/Finance Review

A decision is `Needs legal/finance review` when it affects:

- tax forms or reporting
- contractor classification
- EOR/AOR/COR requirements
- equity or securities treatment
- cross-border payment rails
- jurisdiction-specific compliance
- conversion fees
- public claims about tax/compliance handling

These items should not be published as hard commitments until reviewed.

## Why Some Items Should Be Proposed, Not Locked

Several items in the master plan are directionally good but should not be locked yet because they create operational or legal obligations.

Examples:

- Naming specific EOR partners publicly creates an expectation that BridgeScale can route engagements through those partners immediately.
- Saying BridgeScale handles W-9, W-8BEN, 1099-NEC, GST/PAN, or EOR can imply tax/compliance responsibility.
- Declaring Indian payout corridors as final before testing bank, FEMA, GST, TDS, NRE/NRO, and vendor workflows risks failed payouts or bad user expectations.
- Publishing compliance language too early can undermine trust if the product later needs to narrow supported countries or payment routes.

The safer pattern:

> Draft the model now. Mark it proposed. Review with legal/finance/vendors. Then lock and publish.

## Decision Register Table

| ID | Decision | Status | Current Recommendation | Why |
|---|---|---|---|---|
| D01 | Core marketplace positioning | Locked | Diaspora-based fractional commercial talent for Indian startups/MSMEs going international | Existing website and product thesis already align |
| D02 | Service lanes | Locked | Three public lanes: Fractional Sales Leadership, Fractional BD / Partnerships, Fractional Sales Execution & Revenue Operations | Keeps public offer focused while covering current roles |
| D03 | Public role grouping | Locked | Group 22 internal roles into 6-7 public role families | Reduces cognitive load while preserving internal matching detail |
| D04 | Layered taxonomy | Locked | Service Lane -> Role -> Service Template -> Engagement Type -> Compensation Mode -> Compliance/Payment Mode | Corrects earlier category mixing |
| D05 | Retainer variants | Locked | Retainer has Leadership Retainer and Operator Retainer variants | Matches founder direction and current offer |
| D06 | Success fee and hybrid/equity | Locked as taxonomy, review for implementation | Treat as compensation modes/modifiers, not engagement types | Keeps service menu clean |
| D07 | Price bands | Proposed | Use placeholders until first 10-20 signed engagements calibrate real ranges | Avoids false precision |
| D08 | Company unlock fee | Proposed | Keep single company unlock fee, exact amount still needs final confirmation across copy/code | Existing repo has inconsistent amounts |
| D09 | Operator/talent payment gate | Proposed | Keep activation/unlock concept, but define whether it is one-time, subscription, or engagement-based | Impacts pricing and operator conversion |
| D10 | Platform fee model | Proposed | Prefer transparent model; decide company-side only vs hybrid activation + engagement fee | Business model decision not fully settled |
| D11 | Two-sided 70/30 split | Proposed | Evaluate, but do not lock until operator trust and payout statement UX are designed | Can reduce talent trust if poorly communicated |
| D12 | 30-minute call gate | Locked | Match unlock -> call -> mutual engagement intent -> MSA/SOW flow | Fits current marketplace trust flow |
| D13 | MSA before SOW sharing | Locked as flow principle | MSA signed before full SOW is shared for final approval | Founder confirmed |
| D14 | Pre-SOW commercial summary | Locked | Show summary before MSA: service lane, role, template, engagement type, compensation model, indicative price, compliance route | Needed so users understand what they are entering before MSA |
| D15 | Template-driven SOW v1 | Locked | Use service templates now; defer LLM-from-call-notes | Keeps scope feasible |
| D16 | LLM call-note SOW v2 | Proposed | Later: use 30-minute call notes to improve SOW draft after consent and note-taking workflow exist | Valuable but not required for v1 |
| D17 | EOR partners | Needs legal/finance review | Evaluate Deel, Remote, Multiplier, Skuad by corridor; do not publicly lock day-1 partners yet | Vendor, pricing, API, jurisdiction, and liability review required |
| D18 | Indian payout corridors | Needs legal/finance review | Support India payouts as a goal, but validate NRE/NRO/savings/entity, FEMA, GST, TDS, FIRC/eFIRC workflows | High compliance sensitivity |
| D19 | Tax form handling | Needs legal/finance review | Collect basic tax residency early; collect W-9/W-8BEN/KYC before first paid engagement or before payout | Avoids onboarding friction and premature tax responsibility |
| D20 | Public compliance language | Needs legal/finance review | Use cautious language until actual workflows and partners are confirmed | Avoids overpromising |
| D21 | Equity-only engagements | Needs legal/finance review | Support as compensation mode only after equity documentation path is approved | Securities/tax/classification risk |
| D22 | Cash + equity engagements | Needs legal/finance review | Support after hybrid addendum and equity document approach are reviewed | Same as above |
| D23 | Success-fee triggers | Needs legal/finance review | Whitelist simple triggers only after legal review; custom triggers go to deal desk | Commission/revenue attribution risk |
| D24 | Full-time conversion fee | Needs legal/finance review | Define fee basis and restricted period before publishing | Legal and commercial dispute risk |
| D25 | Tax doc timing | Locked | Basic tax residency and payout preference during onboarding; full forms before first paid engagement/payout | Balances conversion and compliance |
| D26 | Public FAQ links to samples | Locked | Add FAQ entries with links to sample MSA, pre-SOW commercial summary, and sample SOW | Founder direction |

## Public Copy Rule

Only `Locked` decisions can appear as firm public statements.

For `Proposed` decisions, use softer language:

- "BridgeScale is designed to..."
- "Depending on engagement structure..."
- "Where supported..."
- "Typical..."

For `Needs legal/finance review`, do not publish specific promises. Use cautious language:

- "Tax and compliance requirements depend on jurisdiction and engagement structure."
- "BridgeScale may support this directly or through approved partners."
- "Final documentation is confirmed before engagement start."

## Current Governance Recommendation

For the next planning pass:

1. Treat the master plan as a strategic draft, not a fully locked operating manual.
2. Use this register to mark which claims can move to website copy.
3. Move EOR partners, Indian payout corridors, tax-form handling, and public compliance claims into legal/finance review.
4. Keep product taxonomy, role grouping, retainer variants, call gate, MSA-before-SOW, and pre-SOW summary as locked product direction.
