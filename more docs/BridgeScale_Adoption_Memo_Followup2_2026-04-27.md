# BridgeScale — Second Follow-up Memo: EOR Corridors, Fee Model, Cancellation Policy, and Evaluation of Doc 07

**To:** BridgeScale Founding Team
**From:** Outside Advisory (consultant draft)
**Date:** 27 April 2026
**Subject:** Confirmations, EOR deep-dive, fee model recommendation, cancellation policy mechanics, and a structured evaluation of `Docs/BRIDGESCALE_SERVICE_MODEL/07_SERVICE_ROLE_ENGAGEMENT_PAYMENT_COMPLIANCE_MAPPING.md`
**Status:** Draft for discussion. No code changes implied.

---

## 0. Reading Order

§1 confirms the flow. §2 closes out the SOW-AI question with a clean v1/v2 plan. §3 is the EOR deep-dive you asked for — corridors, partners, costs, charge-through model, and W-9/W-8BEN trigger conditions. §4 is the revised A.1 placement (FAQ entries instead of a new page section). §5 is the corrected Service-Templates restructure. §6 is the cancellation policy mechanics, and §7 is the platform fee model recommendation (Option A vs B vs C). §8 is the structured evaluation of doc 07 — what is strong, what to refine, what is missing. §9 is the flexibility-vs-compliance cost note you raised.

---

## 1. Confirmation — The Flow

Confirmed exactly as you stated:

```
Match generated
  → Company sees blurred match previews
  → Company pays unlock fee → matches unblurred
  → Company requests 30-min call with selected operator
  → Operator accepts call  #the operator must have completed his profile to be considered during matching and the operator should have paid the platform fee to view non blurred companies that he could potentially match with. so, the profile completion should be a must.
  → 30-min call happens (free, scheduled by platform)
  → Both parties indicate engagement intent
  → MSA generated (or retrieved if exists for this Company–Operator pair)
  → MSA signed by all three parties
  → SOW generated from service template (v1) / AI-drafted from call notes (v2)
  → SOW reviewed and edited
  → SOW signed by Company and Operator
  → Invoice schedule starts; engagement begins
```

This matches §1.4 of the previous memo and the "Corrected Marketplace Flow" in doc 07. Two things worth pinning explicitly:

- **The 30-min call sits between matching and engagement intent.** It is the qualifying gate. It is free to the company (because they already paid the unlock fee) and free to the operator (because the operator's time is the friction).
- **The MSA is generated and signed *before* the SOW is shared for final approval.** This is correct and matches doc 07. It prevents the awkward case of negotiating SOW commercials before the structural terms are agreed.

---

## 2. SOW Generation — Confirmed v1/v2

Agreed and recorded:

- **v1 (now):** Templated SOW per service template, populated by structured form fields. This is what `contracts.service.ts:generateSow()` already does — it just needs the service-template layer wired in (today it's keyed on `packageType`).
- **v2 (later):** LLM ingests the 30-min call transcript/notes plus the structured intake, and produces a SOW draft tailored to what was actually discussed. This is a powerful product moment — the buyer sees their own words turned into a professional engagement document — but it requires reliable call recording / transcription infrastructure first (Fireflies, Otter, or in-house).

The right way to stage this: ship v1 with templates, instrument the 30-min call to capture notes (manual to start, machine-transcribed once volume justifies it), and switch on AI generation when you have ~20 calls of input data to validate the prompts against. Do not ship AI generation against zero training examples — the failure mode is generic output that erodes trust.

---

## 3. EOR Deep-Dive — Corridors, Partners, Costs, Charge-Through

You said you want to adopt EOR. This section gives you the operating frame.

### 3.1 When EOR is actually required (and when it isn't)

EOR is *not* the default. It is the answer when contractor classification is risky for the corridor. Three triggers:

1. **Local labour law treats long-term high-control engagements as employment.** Germany, France, Netherlands, Spain, Brazil, China are aggressive on this. UK is moderate. US is permissive (1099 contractor is fine for most engagements).
2. **The operator works >X hours/week, exclusively for one company, under day-to-day direction, for >Y months.** Almost any jurisdiction will reclassify this as employment regardless of what the contract says.
3. **The company demands a "real employee" relationship** — payroll, benefits, statutory leave — typically because they want the operator's commitment level to match.

For BridgeScale's typical engagement (15–20 hrs/week, output-based, scoped SOW, 30–90 days for sprints, 6–12 months for retainers), most engagements are **legitimately contractor**. The exceptions cluster in:

- **Long-duration retainers and Leadership engagements** (>6 months, >20 hrs/week) where the relationship looks employment-like
- **Specific high-risk corridors** (see table below)
- **Cases where the company wants to convert** the operator to FT but cannot establish a local entity

### 3.2 Corridor risk map

| Operator country | Contractor risk | Default mode | EOR partner if needed |
|---|---|---|---|
| **United States** | Low | 1099 contractor (W-9, ACH payout) | Deel or Remote (rarely needed) |
| **Canada** | Low–Medium | Contractor (T4A) | Deel, Remote |
| **United Kingdom** | Medium (IR35 risk on long retainers) | Contractor for sprints; EOR for >6mo Leadership | Remote, Deel, Multiplier |
| **Germany / France / Netherlands** | **High** (Scheinselbständigkeit / présomption de salariat) | EOR strongly recommended for any Retainer or Leadership | Remote (best EU presence), Deel |
| **Ireland / Spain / Italy / Portugal** | Medium–High | EOR for Retainer and Leadership | Remote, Deel |
| **UAE / Singapore** | Low–Medium | Contractor for sprints; legal review for Retainer | Multiplier, Deel |
| **Australia / New Zealand** | Medium | Contractor for sprints; review for Retainer | Deel, Remote |
| **India** | Low (when operator is on Indian roll, paid in INR) | Contractor with GST invoice | Multiplier, Skuad (India-domiciled) |

The rule of thumb: **all sprints can be contractor; Retainer and Leadership engagements need a corridor check before signing the MSA.** This needs to be a code check in the MSA-generation flow, not a manual step.

### 3.3 Partner selection — pick one per corridor, not all four

Picking multiple EOR partners creates operational chaos (different invoicing, different onboarding, different SLAs). The category default is one primary per corridor.

| Partner | Geographic strength | Why pick them |
|---|---|---|
| **Deel** | Global breadth (150+ countries) | Best single-partner choice if you only pick one. API-first. Reasonable pricing. |
| **Remote** | EU specifically (Berlin-based, EU compliance depth) | Best for Germany / France / Netherlands / Spain — the high-risk EU corridors |
| **Multiplier** | India-outbound and APAC | Indian-founded, strong India + APAC compliance, founder-friendly pricing |
| **Skuad** | India-domiciled and APAC | Similar to Multiplier; India-strong; useful if your primary corridors are India + Singapore + UAE |
| **Oyster** | EU + Latin America | Compelling if you expand to Latin American operator pool |

**Recommended starter stack for BridgeScale:**

- **Deel** as the global default (covers US, UK, Canada, AU, most of Asia)
- **Remote** for Germany / France / Netherlands / Spain when those corridors come online
- **Multiplier** for India-domiciled operators serving Indian companies (relevant if BridgeScale ever does India-domestic engagements)

You do not need to integrate all three on day one. Sign API contracts with Deel first; add Remote when the first Germany/France/Netherlands engagement appears; add Multiplier only if India-domestic engagements become a real volume. # as I am based out of EU, I defenitely need Remote as well. So, we will probably launch with all of them. BridgeScale will not deal with India-domestic engagements.

### 3.4 Cost model and charge-through

EOR pricing is per-operator, per-month. Typical ranges:

| Partner | Per-operator monthly cost (USD) |
|---|---|
| Deel | $499/operator/mo (full EOR), $49/mo (contractor management) |
| Remote | $599/operator/mo (full EOR), $29/mo (contractor) |
| Multiplier | $400/operator/mo (full EOR) |
| Skuad | $199–$399/operator/mo (full EOR) |

Plus typically a one-time setup fee ($0–$500) and statutory employment costs (employer taxes, social security, mandatory benefits — varies by country, can add 20–40% on top of operator's base salary).

**Charge-through model (recommended):**

> When EOR is required for an engagement, the EOR fee is charged through to the Company on top of the operator's stated rate, separately from BridgeScale's 10% platform fee. The Company sees a transparent line item: "EOR (Deel) — $499/mo." BridgeScale does not absorb this cost.

Three reasons to charge it through, not absorb:

1. **Honesty about cost** — engagements that need EOR genuinely cost the Company more, and pretending otherwise either erodes BridgeScale's margin or misrepresents pricing.
2. **Buyer self-selection** — Companies that aren't willing to pay for EOR will choose corridors that don't require it (US-resident operators), which is operationally simpler for everyone. #explain on this a more. I want to support the demand side as much as I can. 
3. **No cross-subsidy** — Company A's contractor engagement should not subsidise Company B's EOR engagement.

The disclosure on the SOW for an EOR engagement reads:

> *"This engagement runs through [EOR Partner] as Employer of Record for the operator's jurisdiction. The Company pays a monthly EOR fee of $X in addition to the operator's monthly fee and BridgeScale's 10% platform fee. EOR handles all local employment paperwork, payroll, statutory benefits, and tax filings."*

### 3.5 W-9 / W-8BEN — when each is collected

Tax-form collection is operator-onboarding, not per-engagement. Two cases:

| Operator type | Form | Collected by | When |
|---|---|---|---|
| US person (citizen, GC holder, US tax resident) | **W-9** | BridgeScale (or its US payment partner — e.g. Stripe Connect) | At first engagement that triggers a payout |
| Non-US person paid by a US-domiciled payer | **W-8BEN** (individual) or **W-8BEN-E** (entity) | BridgeScale (or its US payment partner) | At first engagement that triggers a payout from a US source |
| Non-US person paid by a non-US payer | Local equivalent only | Operator's local jurisdiction | N/A from US perspective |
| Operator working through EOR | None of the above | EOR partner handles | EOR's onboarding |

**The trigger for collection is "is the payer a US entity making a payment to this operator?"** If BridgeScale's payment processor is Stripe (US-incorporated), then yes — every operator who receives a payout via Stripe needs either W-9 or W-8BEN on file before the first payout clears. Stripe Connect collects this automatically as part of operator onboarding; if you use a different payment route, you need to collect it yourself.

For 1099-NEC issuance: any US operator who received >$600 in a calendar year from BridgeScale must be issued a 1099-NEC by January 31 of the following year. Stripe Connect can do this automatically. If not on Stripe Connect, use Track1099 or similar (~$3 per form).

---

## 4. Revised A.1 Placement — FAQ Entries

Agreed with your simplification. Rather than adding a whole new section to `/for-companies` and `/for-talent`, add **one new FAQ entry on each page** with a link out to the sample documents.

### 4.1 New FAQ entry on `/for-companies`

```
Q: How is an engagement structured legally?

A: Every engagement runs as a tri-party arrangement between BridgeScale,
your company, and the operator. Two documents:

(1) A Master Service Agreement signed once between the three parties —
covers payments, IP, conversion, confidentiality, and non-circumvention.
Doesn't change per engagement.

(2) A Scope of Work signed per engagement — covers scope, deliverables,
timeline, fees, hours cap, and reporting cadence. Drafted from your
diagnosis using our service templates and reviewed by a BridgeScale
operator before being shared with you and your operator for sign-off.

BridgeScale handles invoicing, ACH or local-equivalent payouts, US tax
forms (W-9, W-8BEN, 1099-NEC), and Employer of Record where the
operator's jurisdiction requires it.

→ View sample Master Service Agreement
→ View sample Scope of Work
```

### 4.2 New FAQ entry on `/for-talent`

```
Q: What contracts will I sign and how do I get paid?

A: The first time you start an engagement with a new company, you'll
sign a Master Service Agreement between you, the company, and
BridgeScale. It covers payments, IP, confidentiality, conversion, and
non-circumvention — and is reused if you do future engagements with
the same company.

For each engagement, you'll also review and sign a Scope of Work
covering scope, deliverables, timeline, fees, hours cap, and reporting
cadence. The SOW is drafted by BridgeScale from a service template and
shared with you for review before signing.

Payment runs through BridgeScale. ACH for US-resident operators, Wise
or local rails elsewhere. Required tax forms (W-9 for US persons,
W-8BEN for non-US persons paid via our US flow) are collected during
operator onboarding. For corridors that require it, BridgeScale works
through verified Employer-of-Record partners (Deel, Remote,
Multiplier).

→ View sample Master Service Agreement
→ View sample Scope of Work
```

This is lighter-touch than the new-section approach and gets the trust signal in front of buyers and operators with less design work. Both FAQ links point to the same sample documents (drafted in §5 of the previous memo).

---

## 5. The Restructure — You Are Right, I Was Mixing Layers

I conflated three things in §7 of the prior memo. Doc 07 has it correct. Restating cleanly:

```
Layer 1 — Service Lanes (what BridgeScale sells)
  • Fractional Sales Leadership # Rename to Fractional Leadership
  • Fractional BD / Partnerships
  • Fractional Sales Execution / Operations # Rename to Fractional Execution / Operations
            # look at the current repo and check to tell me whether we are onboarding any roles that doesn't in the any of the above 3 lanes 

Layer 2 — Roles (who fulfils the work)
  • Sales Leadership lane: VP Sales, VP Revenue, CRO, Head of Sales, GTM Leader # rename to Leadership Lane
  • BD / Partnerships lane: BD Lead, Partnerships Lead, Channel Lead, Alliances Lead
  • Execution / Ops lane: AE, SDR, BDR, Outbound Operator, RevOps, Sales Ops, CS Operator

Layer 3 — Service Templates (what work is done — productised packages)
  • International Market Entry # which role/roles usually takes ownership of this ?
  • ICP Refinement ## which role/roles usually takes ownership of this ?
  • GTM Strategy ## which role/roles usually takes ownership of this ?
  • Pipeline Sprint # which role/roles usually takes ownership of this ?
  • Founder-Led Sales Transition # which role/roles usually takes ownership of this ?
  • Revenue Cadence Setup # which role/roles usually takes ownership of this ?
  • Partner / Channel Development # which role/roles usually takes ownership of this ?
  • Customer Success / Retention # which role/roles usually takes ownership of this ?
  • Sales Process / CRM Cleanup # which role/roles usually takes ownership of this ?
  • Closing Support # which role/roles usually takes ownership of this ?

Layer 4 — Engagement Types (how the work is structured)
  • Consultation, Sprint, Retainer, Fractional Leadership Engagement, Fractional Operators Engagement

Layer 5 — Compensation Types (how the operator is paid)
  • Cash Only, Cash + Success Fee, Cash + Equity, Equity Only, Cash + Equity + Success Fee, Other Negotiated
```

**The mistake I made** was in §7.1 of the prior memo: I treated "International Market Entry," "Revenue Operations / Cadence," "GTM Strategy," "ICP Refinement," "Founder-Led Sales Transition," and "Customer Success / Retention" as roles in the same column as VP Sales and SDR. They are not roles. They are **service templates** — productised work packages that can be fulfilled by different roles depending on scope, and structured under different engagement types depending on duration.

Treat my prior §7.1 as obsolete. Use doc 07's "Mapping: Roles, Service Templates, and Engagement Types" table as the canonical version. The mental model is:

> *Service Template + Role → drives Engagement Type → drives Compensation options*

A buyer who comes to BridgeScale typically starts at the service-template level ("we need pipeline in the US") or at the role level ("we need a Fractional VP Sales") or at we don't know what we want in such cases we start off at Diagnosis phase. The platform routes them. The internal database needs to capture all five layers per engagement, which doc 07 §"Required Fields Per Engagement" already specifies correctly.

### 5.1 Why this matters for the website

The current `/for-companies` page lists engagement types but does not list service templates. Service templates are what buyers actually search for. Recommend the `/learn` page surface a directory of service templates, each with: who it's for, typical role(s), typical engagement type, typical price band, typical deliverables. This is also the SEO play — "ICP refinement consultant for SaaS expansion to US" is a real search query; "Sprint" is not.

# I think that even in the website, service templates - outcomes are incorrectly communicated. -- needs evaluation -- very high priority
---

## 6. Cancellation Policy Mechanics

You raised a specific question on consultation cancellation. Here is the recommended policy, calibrated to the trust dynamics of a two-sided marketplace:

### 6.1 Consultation cancellation (paid 60–90 min sessions)

| Scenario | Policy | Mechanism |
|---|---|---|
| **Operator cancels >24h before** | Full refund to Company OR free rebooking with same/different operator | Refund issued automatically; operator's "cancellation strike" counter increments |
| **Operator cancels <24h before** | Full refund to Company; *and* operator's next consultation booking has a payout penalty (5% of session fee deducted from operator's payout on next session) | Same as above plus penalty flag on operator account; visible to operator before they book next | # provide one chance to defer the scheduled call. 
| **Operator no-show** | Full refund to Company; operator's next consultation booking has a 10% payout penalty; second no-show pauses operator's profile for review | Penalty + manual review flag |
| **Company cancels >24h before** | Full refund to Company minus 10% (covers operator's holding-time and platform processing) | Refund issued, 10% retained as platform/operator-time compensation | 
| **Company cancels <24h before** | 50% refund; operator paid 50% of session fee for held time | Reflects operator opportunity cost |
| **Company no-show** | No refund; operator paid full session fee | Same logic as a no-show penalty |

The asymmetry — operator cancellations refund the Company in full, Company cancellations are partially retained — is intentional. The platform protects the *paying side* (Company) more aggressively because they bear the upfront cost; but it also protects the *operator's time* through the late-cancellation deduction.

**The "next-booking-charged-more" pattern** you mentioned for operator cancellation is implemented as a payout deduction on the *next* engagement, not a charge. This is healthier than a charge: the operator does not have to pay BridgeScale out of pocket; they simply receive a smaller payout on their next engagement. Easier to enforce, easier to communicate.

### 6.2 Sprint / Retainer / Leadership cancellation

These are governed by the SOW termination clause, not a cancellation policy. Standard terms (matching Knex):

- **Sprint:** runs to completion. Either party may terminate for material breach with 7 days written notice. Operator paid for services rendered to termination date.
- **Retainer:** 30 days written notice from either party. Operator paid for services rendered up to and including the notice period.
- **Leadership:** 30 days written notice. Same as retainer. Equity component may have different vesting treatment per the Hybrid Addendum.

These are SOW-level terms, not platform policy. Should appear in every SOW.

---

## 7. Platform Fee Model — Recommendation

You asked: are we charging both sides? Doc 07 lays out three options (A: company-only; B: 70/30 two-sided; C: hybrid). Here is my recommendation with reasoning.

### 7.1 The trade-off, stated plainly

Marketplaces fall on a spectrum:

- **Single-sided (Knex, Activated Scale, Toptal):** Charge only the buyer. Operator-friendly. Easier to communicate. Lower take-rate. Better for attracting top talent.
- **Two-sided per-engagement (Upwork, Fiverr):** Charge both sides at engagement time. Higher take-rate. More marketplace-like. Operators dislike payout deductions.
- **Hybrid subscription + buyer fee (LinkedIn, A.Team):** Operator pays subscription/activation; company pays per-engagement fee. Avoids payout deductions. Higher operational complexity.

For BridgeScale, my recommendation is **Option C (Hybrid), with a specific shape**:

```
Operator side:
  • Profile creation: free
  • Get matched: free
  • One-time activation fee: $50 USD when the operator becomes
    eligible to be unblurred to companies (paid once, not recurring)
  • Per-engagement payout deduction: 0%

Company side:
  • Account creation: free
  • Diagnosis + matching: free
  • Unlock fee: $100 USD (or ₹8,500) per match shortlist unblurred
  • Per-engagement platform fee: 10% of operator fee, charged to Company
    on top of the operator rate. Does not reduce operator payout.
  • EOR fees (where applicable): charged through at cost
```
#agreed and locked for Hybrid option C. 

### 7.2 Why this shape, not 70/30

The 70/30 split (Option B in doc 07) is structurally workable, but creates two real costs that I think outweigh the upside:

1. **Top-of-funnel operator quality drops.** Senior diaspora operators — the exact people you want — have many platforms competing for them. The ones that *don't* deduct from payouts win. Knex and Toptal know this; they take their fee from buyers. Operators who feel their stated rate is their stated rate refer other operators. Operators who see a 3% deduction on every payout don't.
2. **Disclosure complexity at scale.** Every payout statement needs to show gross fee, platform fee, processing fees, net payout. Operators ask questions. Each question is support load. Multiply by hundreds of operators.

The unlock fees on both sides ($50 talent / $100 company) are small enough that they read as *commitment signals*, not as platform monetisation. They serve a different function — qualifying intent and reducing tyre-kickers — and are better described that way:

> "We charge a small unlock fee on both sides because both sides need skin in the game for the matching process to work. The bulk of platform revenue is the engagement fee, charged to companies on cash engagements."

### 7.3 The numbers, walked through

Take the same $5,000 sprint that doc 07 used:

| Line item | Option A (Co-only) | Option B (70/30) | **Option C (Hybrid, recommended)** |
|---|---:|---:|---:|
| Operator stated fee | $5,000 | $5,000 | $5,000 |
| Company-side per-engagement fee | $500 (10%) | $350 (7%) | $500 (10%) |
| Talent-side per-engagement fee | $0 | $150 (3%) | $0 |
| Talent-side unlock fee (one-time) | $0 | $0 | $50 amortised across engagements |
| Company-side unlock fee (per shortlist) | $0 (assume) | $0 (assume) | $100 (per shortlist, may match without engaging) |
| **Company pays per engagement** | **$5,500** | **$5,350** | **$5,500** |
| **Operator receives** | **$5,000** | **$4,850** | **$5,000** |
| **BridgeScale earns per engagement** | **$500** | **$500** | **$500** + amortised unlock fees |

Option B and Option C have the same headline take-rate (10%). Option C earns the same per engagement plus the unlock fees on top. Option B earns the same per engagement but pays for it in operator-acquisition friction. Option C's unlock fees pay for the actual cost of generating shortlists (compute + ops review).

### 7.4 What changes on the website if Option C is adopted

The single platform-fee disclosure line, in plain language:

> *"BridgeScale charges a 10% platform fee to companies on cash engagements. This is in addition to the operator's stated rate; it does not come out of the operator's payout. A one-time $100 unlock fee per match shortlist covers the cost of diagnosis and matching. Operators pay a one-time $50 activation fee when their profile becomes eligible to be matched."*

That sentence answers Knex's transparency bar with one extra layer.

---

## 8. Evaluation of Doc 07 — `07_SERVICE_ROLE_ENGAGEMENT_PAYMENT_COMPLIANCE_MAPPING.md`

You asked me to evaluate this specifically. Here is the structured read.

### 8.1 What is strong (keep as canonical)

- **The five-layer separation** (Service Lane → Role → Service Template + additional requirements/templates could come up with diagnosis (for now we start off with service templates and we will try to make the SoW templates for these)→ Engagement Type → Compensation Type) is clean, correct, and prevents exactly the kind of confusion my previous §7 fell into. This should be the single source of truth.
- **The "Required Fields Per Engagement" table** (§"Payment and Compliance Requirements") is excellent. It is the schema the database needs. Every engagement record should carry these 15 fields. Recommend porting this directly into a `EngagementRequirements` Prisma model or as JSON columns on `StatementOfWork`.
- **The 11 advertised combinations** are well-scoped. Together they cover ~90% of what BridgeScale will ever sell. Treat these as the *configurations the platform officially supports* — everything else routes to a "Custom — Legal Review Required" path.
- **The "Open Decisions" list at the bottom** is the right list. All 10 are real and unresolved.

### 8.2 What needs refinement

**A. Service Templates should have outcome statements, not just titles.** # agreed. we will add
Each template entry today is just "what it does" in 1 line. Recommend adding for each: (a) typical buyer trigger phrase, (b) typical 30/60/90-day output, (c) typical price band. This turns the table from internal-ops doc into a public `/learn` page asset. Example:

```
ICP Refinement
  Trigger: "We're getting demos but the pipeline isn't converting."
  Output: written ICP doc with target accounts, qualification criteria,
          messaging assumptions, and exclusion list.
  30/60/90: 30-day sprint; output delivered week 4.
  Typical price: $3,500–$5,000 sprint, cash only.
  Best-fit roles: GTM Leader, VP Sales, RevOps.
```

**B. The "Mapping: Roles, Service Templates, and Engagement Types" table is too sparse.** # agreed, provide me a draft so that I can review.
Today it has ~15 rows. There are 11 roles × 10 service templates × 6 engagement types = 660 theoretical combinations. Most are nonsensical (an SDR doesn't run GTM Strategy). But the table should explicitly *list which combinations are supported and which are not* — a small lookup table that the matching engine and SOW generator can read at runtime. Add a column for "supported / not supported / requires legal review" so the platform code has an authoritative answer.

**C. "Engagement Types" includes both structural categories and compensation modifiers.** # true. I made the changes above.
"Advisory / Equity Engagement" and "Success-Fee Engagement" are not really *engagement structures*; they are *compensation modes applied to a structure*. An Advisory engagement is structurally a Consultation, Sprint, or Retainer that happens to be compensated in equity. A Success-Fee engagement is structurally a Sprint or Retainer with a success-fee addendum.

I'd reduce the engagement types to four pure structural categories (Consultation, Sprint, Retainer, Fractional Leadership) and treat Advisory/Equity and Success-Fee as compensation-mode flags on top. Doc 07 partially does this (compensation types are independent), but the engagement-type list doesn't reflect it. Recommend collapsing.

**D. "Full-Time Conversion" is listed as an engagement type.** # yes, and agreed.
It isn't. It's a state transition out of the platform. Move it to a separate "Lifecycle Events" section, alongside conversion fee, MSA termination, and operator-profile pause. Keeping it in the engagement-type list creates classification confusion.

**E. Compliance modes need an "owner" per row.** # agreed, make a new one for my review
The table lists modes (Contractor / AOR / EOR / Direct Employment / Legal Review) but doesn't say *who decides* or *how decision is recorded*. Recommend: add a "Decision authority" column — Platform-auto / Platform-ops review / Legal counsel review. The MSA generation flow needs to know who is allowed to mark a given engagement as Contractor without escalation.

**F. The "Common Tax Forms / Documents" table conflates obligation and timing.** # agreed. make one for review.
It says "W-9 may apply" but doesn't say *when collected* or *who collects*. Recommend rewriting as a small flowchart in §3.5 of this memo: trigger → form → collected by → stored where → renewal cadence.

**G. The "Two-Sided Platform Fee Model" section presents three options without a recommendation.** # we agree with Option C and I mentioned above too.
This is the central commercial decision and it is the one most likely to drift if not pinned. Recommend the doc commits to one option (or expressly defers to a separate decision memo). My recommendation in §7 above is Option C — write it into doc 07 as the working assumption, even if subject to founder sign-off.

### 8.3 What is missing

- **MSA reuse rule.** The doc says MSA is signed before SOW. It does not say what happens for the *second* engagement between the same Company–Operator pair. Recommend explicit text: "MSA persists per Company–Operator pair; second and subsequent SOWs reference the existing MSA without re-signing." # yes.
- **Cancellation policy.** §6 of this memo covers it; should be incorporated into doc 07. # ok.
- **EOR partner list and corridor map.** §3 of this memo covers it; should be incorporated. #agreed
- **The platform-fee disclosure copy.** Once Option C is locked, the public-facing language belongs in doc 07 §"Recommended Disclosure Copy" — replacing the placeholder text. # for every change that will be made, you will need an approval from me. you will provide me a draft. only after my approval of the draft. draft will be moved to websiet
- **The "Custom — Legal Review Required" path.** Anything that doesn't match one of the 11 advertised combinations needs an explicit handling rule. Recommend: routes to a manual deal-desk queue with a 5-day SLA before MSA generation. # yes.
- **Currency-pair handling.** What happens when Company pays in INR (Razorpay) but operator is paid in USD (Stripe)? Who carries FX risk? Recommend the platform fixes the rate at SOW signing and absorbs intra-month FX drift on amounts <2%, escalates above. # yes, agreed.
- **Onboarding deferral.** The doc assumes operator and company onboarding are complete before matching. The reality is operator might have profile but no W-9 yet. Recommend: matching is allowed, but payout is blocked until tax forms collected. State this as a hard rule.# until the operator completes his profile along with documentation, his profile should not be moved into the matching.

### 8.4 Overall assessment

Doc 07 is the strongest piece of internal product thinking I have seen in the repo. It correctly separates concepts that the prior memos (mine and the existing competitive advisory) had been blurring. With the seven refinements in §8.2 and the seven additions in §8.3, it becomes the canonical operating model — both the source-of-truth for engineering and the spine for the `/learn` page.

Recommend treating doc 07 as the *master*; my memos and the existing competitive advisory as *supplementary*. Where they conflict, doc 07 wins.

---

## 9. Flexibility ↔ Compliance Cost — The Trade-off You Raised

You said:

> "even though we are mapping the services to people to engagement to compensation, we should be pretty flexible. for that to happen, we have to compliant for all the modes of payments types and engagement types"

This is correct, and worth being explicit about because it has real cost implications. Each unique combination of (compensation mode × payment rail × operator country) carries a distinct compliance burden:

| Dimension | Each variant adds |
|---|---|
| **Compensation mode** | Each new mode (Cash + Equity, Success Fee, Equity Only) needs its own SOW addendum, accounting treatment, possibly tax counsel review |
| **Payment rail** | Each new rail (ACH out, Wise, SEPA, UPI for Indian operators) needs its own integration, reconciliation flow, FX handling, failure-mode runbook |
| **Operator country** | Each new country needs corridor analysis, tax-form mapping, EOR partner check, contractor/employment classification rule |

If BridgeScale supports the full matrix on day one — 6 compensation modes × 4 payment rails × 15 countries — that is 360 potential configurations. Most are valid; very few are tested.

**The right approach:** publish the *intent* to support the full flexibility, but **launch with a deliberately narrow supported set**, and add corridors/modes as engagement volume justifies the compliance investment.

# I want to have both Tier 1 and Tier 2. Equity only is a must as it an USP. FAST can be handled by https://fi.co/fast
# if needed we tie up with a firm.
Suggested launch slice:

- Compensation modes: Cash Only, Cash + Success Fee, Cash + Equity (4 of 6)
- Payment rails: Stripe USD ACH out, Razorpay INR in, Wise USD/EUR/GBP out (3 of N)
- Operator countries (Tier 1, day-1 supported): US, UK, Canada, India, UAE, Singapore, Australia (7 of 15+)
- Operator countries (Tier 2, supported with manual review): Germany, France, Netherlands, Spain, Ireland, NZ
- Operator countries (Tier 3, not supported at launch): everywhere else

The website can say "operators in 15+ countries" without lying — it just means Tier 1 + Tier 2. Engagements outside Tier 1 route through deal-desk for a 5-day legal review before MSA generation.

This is the same pattern Stripe uses ("we support 195 countries; we make payouts to 47 of them"). The marketing surface is broad; the operational reality is staged.

---

## 10. Updated Open Decisions

Combining my §9 of the previous memo, doc 07's open decisions, and what surfaced in this round:

1. **Platform fee model** — Option A / B / C? My recommendation is C; doc 07 frames the choice; founders need to commit.
2. **Conversion fee number** — 25% of first-year salary, or different?
3. **Currency stance** — operator always paid in USD, or local where rails exist - yes.
4. **Day-1 EOR partner** — recommend Deel as primary; Remote and Multiplier added as corridors come online.
5. **Modifier-vs-engagement-type** — collapse Advisory/Equity and Success-Fee into compensation modifiers (my recommendation in §8.2C)?
6. **MSA signing UX** — three-party simultaneous signing, or platform pre-signs and counter-signs accept?
7. **`/learn` page priority** — when does this ship?- # along with launch especially because we have the research info
8. **Tier 1 / Tier 2 / Tier 3 corridor classification** — confirm the seven Tier 1 countries (§9 of this memo).
9. **Cancellation policy** — adopt §6 of this memo as written, or modify?
10. **Doc 07 refinements** — adopt the seven refinements in §8.2 and seven additions in §8.3?

---

## 11. Summary

Three sentences if you only read three:

- The flow is locked — match → unblur → 30-min call → mutual intent → MSA → SOW → engagement. Doc 07 has it correctly.
- Adopt EOR with a one-partner-per-corridor model (Deel as default, Remote for high-risk EU, Multiplier for India), charge it through to the Company at cost as a separate line item, and gate it on a corridor-risk check at MSA generation.
- The platform fee model deserves a single decision before anything else moves — my recommendation is hybrid (operator $50 activation, company $100 unlock + 10% per engagement); both unlock fees are commitment signals, the 10% engagement fee is the actual revenue.

Doc 07 is the strongest single source-of-truth in the repo. Treat it as canonical, fold in the seven refinements + seven additions from §8, and lock the open decisions in §10 in one founder working session.

---

*End of memo.*
