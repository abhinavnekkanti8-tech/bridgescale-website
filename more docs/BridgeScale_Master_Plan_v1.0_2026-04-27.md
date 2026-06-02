# BridgeScale — Master Plan v1.0
### Single Source of Truth for Planning → Drafting → Website

**Date:** 27 April 2026
**Owner:** BridgeScale Founding Team
**Prepared by:** Outside Advisory
**Status:** Living document. Supersedes the three preceding consultant memos for *operating model and rollout* questions; doc 07 (`Docs/BRIDGESCALE_SERVICE_MODEL/07_SERVICE_ROLE_ENGAGEMENT_PAYMENT_COMPLIANCE_MAPPING.md`) remains the canonical reference for the layered taxonomy and the workbook (`BridgeScale_Operating_Matrix.xlsx`) remains the canonical reference for the lookup matrices.

---

## How to Use This Document

This document is structured for three distinct audiences who will consume different parts of it:

- **Founders / Strategy** — Parts I, II, VIII (executive summary, operating model, decisions/sequencing).
- **Engineering** — Parts II, III, V, VI (operating model, flow, payments/tax/compliance, schema migrations).
- **Marketing / Legal / Founder approval queue** — Parts IV, VII (contract drafts, website-publication plan).

Cross-references inside the document use §X.Y notation. External references use the file path.

---

## Table of Contents

- **Part I — Strategic Foundation**
  - §1.1 What BridgeScale is
  - §1.2 The competitive read in one paragraph
  - §1.3 What we adopt, what we reject, what we keep ours
  - §1.4 Positioning statement
- **Part II — Operating Model**
  - §2.1 The five-layer model
  - §2.2 Service Lanes (3)
  - §2.3 Roles (22)
  - §2.4 Service Templates (10)
  - §2.5 Engagement Types (3, with Retainer in two flavours)
  - §2.6 Compensation Modes (6)
  - §2.7 The combinations matrix (read at runtime)
  - §2.8 Cancellation policy
- **Part III — Marketplace Flow**
  - §3.1 The two symmetric onboarding journeys
  - §3.2 The 30-min call as the qualifying gate
  - §3.3 The MSA layer (one per Company–Operator pair)
  - §3.4 SOW generation — v1 templates, v2 AI from call notes
- **Part IV — Contracts (Draft Skeletons)**
  - §4.1 Master Service Agreement (Tri-Party)
  - §4.2 Scope of Work (per engagement)
  - §4.3 Addenda — Hybrid, Success-Fee, Equity-Only, Conversion
  - §4.4 Cancellation policy in plain English
- **Part V — Payments, Tax & Compliance**
  - §5.1 Platform fee model (Hybrid Option C — locked)
  - §5.2 Pricing summary
  - §5.3 Compliance modes (7) + trigger sub-table
  - §5.4 Tax form decision flow
  - §5.5 EOR — partner stack, charge-through, corridor map
  - §5.6 Indian payout corridors (Wise + Razorpay)
  - §5.7 Currency handling and FX
- **Part VI — Repo & Schema Changes Required**
  - §6.1 Schema migrations (HIGH-severity gaps)
  - §6.2 Service to wire (SOW generation, MSA generation)
  - §6.3 Build sequencing (Phase 1 / 2 / 3)
- **Part VII — Website Communication Plan**
  - §7.1 What changes today
  - §7.2 What ships at launch
  - §7.3 The /learn page IA
  - §7.4 Approval workflow for public copy
- **Part VIII — Open Decisions, Risks, Sequencing**
  - §8.1 Locked decisions
  - §8.2 Open decisions
  - §8.3 Risks
  - §8.4 30 / 60 / 90 day plan
- **Part IX — Appendix**
  - §9.1 Glossary
  - §9.2 Acronyms
  - §9.3 Cross-reference index

---

# Part I — Strategic Foundation

## §1.1 What BridgeScale Is

A curated two-sided marketplace that matches Indian startups and MSMEs going international with vetted Indian-diaspora senior commercial talent on a fractional basis. The platform owns the full lifecycle: intake → AI diagnosis → matching → 30-min qualifying call → tri-party master agreement → per-engagement scope of work → cross-border payments and compliance → engagement workspace → closeout.

What is uniquely BridgeScale's, that competitors can not easily replicate:

- **Diaspora-specific cultural fluency** as a structural feature, not a footnote
- **AI-powered needs diagnosis** before matching — neither Knex nor Activated Scale does this
- **Cross-border payment + tax + EOR infrastructure** built in, not bolted on
- **Bias toward equity / hybrid structures** that fits early-stage Indian startups

## §1.2 The Competitive Read in One Paragraph

Knex sells *trust through structural transparency* (Tri-Party Agreement and 10% fee published openly). Activated Scale sells *authority through buyer education* (per-role hiring playbooks function as their demand-generation engine). 10x sells *clarity through a four-box engagement taxonomy* (Subscription / Solution / Consultation / Mission, each picked in 30 seconds). BridgeScale today is more sophisticated than any of them but communicates with less confidence than the simplest. The work in this plan is largely communications, IA, and contract structure — not net-new product.

## §1.3 What We Adopt, What We Reject, What We Keep Ours

**Adopt:**
- Knex's Tri-Party Master + per-engagement SOW structure (Part IV)
- Knex's transparent fee disclosure pattern (§5.2)
- Activated Scale's buyer-education / per-template playbook content shape, consolidated into one `/learn` page (§7.3)
- 10x's collapsed engagement-type taxonomy — three structural types, two retainer flavours (§2.5)

**Reject:**
- Knex's $499 advisor activation fee — wrong fit for Indian-founder market
- Activated Scale's role-fragmentation across multiple pages — dilutes a narrow positioning
- 10x's hourly billing model — incentive misalignment for senior operators
- Two-sided per-engagement payout deductions (Upwork-style) — degrades operator-acquisition

**Keep ours:**
- Diaspora-only operator pool
- AI diagnosis as a *named* product step, not a backend artefact
- Hybrid cash + equity (FAST) as a first-class compensation mode
- Cross-border infrastructure as a positioning pillar

## §1.4 Positioning Statement

> *Fractional diaspora senior talent. Vetted, scoped, and platform-managed. For Indian startups and MSMEs going international.*

This is the line on the homepage today. It holds. The work below makes the platform deliver on it more visibly.

---

# Part II — Operating Model

## §2.1 The Five-Layer Model

Conflating these layers is the single most common source of confusion in this category. Doc 07 has the right separation. This document adopts it as canonical:

```
Layer 1 — Service Lanes        (what BridgeScale sells)
Layer 2 — Roles                (who fulfils the work)
Layer 3 — Service Templates    (what work is done — productised packages)
Layer 4 — Engagement Types     (how the work is structured)
Layer 5 — Compensation Modes   (how the operator is paid — independent)
```

A buyer's mental path: *"I need [service template]"* → routed to *[role(s) in the right lane]* → structured as *[engagement type]* → priced under *[compensation mode]*. The platform code reads exactly the same path in reverse to validate, generate the SOW, and route the payment.

## §2.2 Service Lanes (3)

Three lanes communicated at launch. Renamed per founder note (the word "Sales" dropped from labels for breadth — operators in BD and CS lanes are not all "sales" in title).

| Lane Code | Display Label | What It Means | Buyer Outcome |
|---|---|---|---|
| `FRACTIONAL_LEADERSHIP` | **Fractional Leadership** | Senior sales/revenue leadership on a fractional basis. Strategy, cadence, team and process leadership. | Direction, cadence, strategy, team / process leadership. |
| `FRACTIONAL_BD_PARTNERSHIPS` | **Fractional BD / Partnerships** | Business development, partnerships, channels, reseller, and market-access work. | Partner pipeline, market access, ecosystem entry. |
| `FRACTIONAL_EXECUTION_OPS` | **Fractional Execution / Operations** | Sales execution, outbound, account conversion, sales ops, revenue ops, customer expansion, enablement. | Pipeline, qualified meetings, process, retention, expansion. |

## §2.3 Roles (22)

Use as the closed enum for `OperatorProfile.roles`. **Note: this is a schema migration** — today `OperatorProfile.functions` is a free-text `String[]` (see §6.1).

### Leadership Lane
| Role Code | Display Label | Tier | Notes |
|---|---|---|---|
| `VP_SALES` | VP Sales | Primary | |
| `VP_REVENUE` | VP Revenue | Primary | |
| `CRO` | CRO | Primary | |
| `HEAD_OF_SALES` | Head of Sales | Primary | |
| `GTM_LEADER` | GTM Leader | Primary | Strategy + execution oversight |
| `FOUNDER_LED_SALES_COACH` | Founder-Led Sales Coach | Secondary | Specific to founder-transition engagements |
| `REVENUE_ADVISOR` | Revenue Advisor | Secondary | Equity-only or advisory engagements |

### BD / Partnerships Lane
| Role Code | Display Label | Tier | Notes |
|---|---|---|---|
| `BD_LEAD` | BD Lead | Primary | |
| `PARTNERSHIPS_LEAD` | Partnerships Lead | Primary | |
| `CHANNEL_LEAD` | Channel Lead | Primary | |
| `ALLIANCES_LEAD` | Alliances Lead | Secondary | |
| `MARKET_ACCESS_LEAD` | Market Access Lead | Secondary | Often regulated industries |

### Execution / Operations Lane
| Role Code | Display Label | Tier | Notes |
|---|---|---|---|
| `AE` | Account Executive (AE) | Primary | |
| `SDR` | SDR | Primary | |
| `BDR` | BDR | Primary | |
| `OUTBOUND_OPERATOR` | Outbound Operator | Primary | Senior outbound specialist |
| `REVOPS` | RevOps | Primary | |
| `SALES_OPS` | Sales Ops | Primary | |
| `CUSTOMER_SUCCESS_OPERATOR` | Customer Success Operator | Primary | |
| `EXPANSION_OPERATOR` | Expansion Operator | Secondary | Renewals + upsell focus |
| `ACCOUNT_MANAGER` | Account Manager | Secondary | |
| `SALES_ENABLEMENT_SOLUTIONS_CONSULTANT` | **Sales Enablement & Solutions Consultant** | Secondary | **NEW.** Single combined role per founder direction. Covers sales enablement (training, content, playbooks), pre-sales (sales engineering, demos, POCs), and solutions consulting. Often paired with RevOps on CRM Cleanup, Founder-Led Sales Transition, and technical-product engagements. |

## §2.4 Service Templates (10)

Productised work packages. Each carries a SOW skeleton, owning roles, and a price band. **Price bands are placeholders to be replaced with real numbers from the first 10–20 engagements.**

| Template Code | Display Label | Buyer Trigger Phrase | 30/60/90 Output |
|---|---|---|---|
| `INTL_MARKET_ENTRY` | International Market Entry | "We need to break into a new geography but we have no team or relationships there." | Day 30: market scan + ICP. Day 60: first 5 qualified meetings. Day 90: pipeline + repeatable motion. |
| `ICP_REFINEMENT` | ICP Refinement | "We're getting demos but pipeline isn't converting. Who should we actually be selling to?" | Day 30: written ICP doc with target accounts, qualification criteria, messaging assumptions, exclusion list. |
| `GTM_STRATEGY` | GTM Strategy | "We need a go-to-market plan for the next 6–12 months." | Day 30: motion + sequencing + resourcing model. Day 60: execution roadmap. Day 90: in-market validation. |
| `PIPELINE_SPRINT` | Pipeline Sprint | "We need qualified meetings in [target market] in the next 6 weeks." | Day 30: outbound sequences live. Day 60: 30+ qualified meetings booked. Day 90: SQLs handed to AE. |
| `FOUNDER_LED_SALES_TRANSITION` | Founder-Led Sales Transition | "I'm the only one selling. We need to move sales off me." | Day 30: process + CRM hygiene. Day 60: first hire / operator running motion. Day 90: founder out of day-to-day deals. |
| `REVENUE_CADENCE_SETUP` | Revenue Cadence Setup | "We don't have a pipeline review or forecast discipline." | Day 30: weekly pipeline review installed. Day 60: forecast cadence + CRM hygiene. Day 90: operating rhythm holds without operator. |
| `PARTNER_CHANNEL_DEVELOPMENT` | Partner / Channel Development | "We need a reseller / distributor / alliance pipeline." | Day 30: channel landscape. Day 60: outreach campaign live. Day 90: first signed partners + revenue. |
| `CUSTOMER_SUCCESS_RETENTION` | Customer Success / Retention | "We're losing customers we should be keeping." | Day 30: churn diagnostic + at-risk list. Day 60: onboarding + retention playbook live. Day 90: renewal + expansion cadence holds. |
| `SALES_PROCESS_CRM_CLEANUP` | Sales Process / CRM Cleanup | "Our CRM is a mess and our sales process isn't documented." | Day 30: CRM audit. Day 60: rebuilt stages + reporting. Day 90: documented process + training delivered. |
| `CLOSING_SUPPORT` | Closing Support | "We have qualified deals stuck. Help us close them." | Per-deal: qualification → negotiation → close-or-disqualify. Typical 4–8 deals over 60 days. |

For each template, the primary owning role(s) and full Role × Template support map live in `BridgeScale_Operating_Matrix.xlsx` sheets `03_Service_Templates` and `04_Role_x_Template`. Notable updates from v0.1 of the workbook:

- **Sales Enablement & Solutions Consultant** is added as Primary owner of `SALES_PROCESS_CRM_CLEANUP` and Secondary on `FOUNDER_LED_SALES_TRANSITION` and `REVENUE_CADENCE_SETUP`.

## §2.5 Engagement Types (3, with Retainer in two flavours)

Three structural types only. **Advisory/Equity and Success-Fee are compensation modifiers, not engagement types** — they layer on top of one of the three. This is a structural simplification adopted per founder direction.

| Engagement Type | Definition | Min Term | Hours/Week | Default Comp |
|---|---|---|---|---|
| **Consultation** | A single paid 60–90 min session with a vetted operator on a specific question. | n/a | n/a | Cash Only |
| **Sprint** | Time-boxed, fixed-fee project — 30 to 60 days, defined deliverable. | 30 days | 15–20 | Cash Only or Cash + Success Fee |
| **Retainer** | Ongoing fractional engagement, monthly cadence. **Two flavours:** | 60 days | varies | varies |
| Retainer ↳ **Leadership flavour** | Senior leader embedded in *leadership rhythm* — board updates, team coaching, strategy ownership. | 60 days | 20+ | Cash Only / Cash + Equity / Cash + Equity + Success Fee |
| Retainer ↳ **Operator flavour** | Senior operator embedded in *operator rhythm* — pipeline calls, daily execution, weekly reporting. | 60 days | 15–20 | Cash Only / Cash + Success Fee / occasionally Cash + Equity |

The flavour distinction is deliberate. It maps cleanly onto:
- the role pool (Leadership lane → Leadership Retainer; BD/Execution lane → Operator Retainer)
- the price band (Leadership Retainer commands a premium)
- the cadence and reporting expectations (board-level vs. operating-level)
- the compliance check (Leadership Retainer >6 months in EU corridors triggers EOR; Operator Retainer is more often legitimate Contractor)

## §2.6 Compensation Modes (6)

Independent of role and engagement type. Each carries an SOW addendum requirement and a legal-review trigger.

| Compensation Mode | Description | SOW Addendum | Legal Review Trigger |
|---|---|---|---|
| **Cash Only** | Fixed session/sprint fee or monthly retainer. | — | None for standard sprints/retainers in Tier-1 corridors. |
| **Cash + Success Fee** | Base cash + defined outcome trigger. | Success-Fee Addendum | If success fee resembles regulated commission OR operator country has commission rules (UK, EU). |
| **Cash + Equity** | Lower cash retainer + documented equity grant via FAST or company-issued instrument. | Hybrid Cash + Equity Addendum + FAST | Always — equity issuance has tax/securities implications per jurisdiction. |
| **Equity Only** | No cash; equity/equity-like instrument only. Typically advisory. | Equity-Only Addendum + FAST | Always — securities + worker classification review. |
| **Cash + Equity + Success Fee** | Combination structure for complex Leadership engagements. | All three addenda | Always. |
| **Other Negotiated Combination** | Custom (e.g., milestone-tranched, deferred). | Custom addendum | Always — bespoke commercial structure. |

## §2.7 The Combinations Matrix (Read at Runtime)

The full Role × Service Template × Engagement Type matrix is in `BridgeScale_Operating_Matrix.xlsx` sheet `06_Combinations`. **The matching engine and the SOW generator should read this matrix at runtime** — anything not on this list routes to deal-desk for legal review with a 5-day SLA.

Cell encoding on the matrix sheets:
- **P** = Primary fulfilment / supported configuration (default)
- **S** = Secondary / allowed but less common
- **L** = Allowed only with explicit legal/finance sign-off
- **(blank)** = Not supported

## §2.8 Cancellation Policy

Adopted from §6 of `BridgeScale_Adoption_Memo_Followup2_2026-04-27.md` with the founder amendment (one free deferral for operators).

### Consultation cancellation (paid 60–90 min sessions)

| Scenario | Policy | Mechanism |
|---|---|---|
| **Operator cancels >24h before** | Full refund to Company OR free rebooking | Refund automatic. |
| **Operator cancels <24h before** | **First time: free deferral, no penalty.** Subsequent: Full refund to Company; operator's *next* consultation booking has 5% payout penalty deducted. | Penalty flag on operator account; visible to operator before next booking. |
| **Operator no-show** | Full refund to Company; operator's next consultation has 10% payout penalty; second no-show pauses operator's profile for review | Penalty + manual review flag. |
| **Company cancels >24h before** | 90% refund (10% retained for operator-time and processing) | Refund issued; 10% retained at platform. |
| **Company cancels <24h before** | 50% refund; operator paid 50% for held time | Reflects operator opportunity cost. |
| **Company no-show** | No refund; operator paid full session fee | Same logic as no-show penalty. |

### Sprint / Retainer (Leadership and Operator) cancellation

Governed by SOW termination clauses, not platform cancellation policy:
- **Sprint:** runs to completion. Either party may terminate for material breach with 7 days' written notice. Operator paid for services rendered up to termination date.
- **Retainer (both flavours):** 30 days' written notice from either party. Operator paid for services rendered up to and including the notice period.

Equity components have separate vesting treatment per the Hybrid Addendum.

---

# Part III — Marketplace Flow

## §3.1 The Two Symmetric Onboarding Journeys

Both sides have parallel structures. The flow below is the canonical version that supersedes the diagrams in earlier memos.

### Operator-side

```
1.  Operator creates account
    (Gmail / Apple / Outlook OAuth, OR email + password with verification link)
2.  Operator gets a welcome email
3.  Operator lands on dashboard
4.  Operator completes profile
       — bio, lanes, regions, references, experience tags, LinkedIn, availability
5.  Operator completes required tax documentation
       — W-9 (US), W-8BEN (non-US individual), W-8BEN-E (entity)
       — OR EOR-managed (no BridgeScale collection)
6.  Profile + tax docs complete
       → Profile enters matching pool
       → Algorithm runs over operator's profile
7.  Operator sees BLURRED matches (companies that could be a good fit)
8.  Operator pays $50 activation fee
       → Matches unblurred
       → Operator can express interest or accept incoming consultation requests
9.  [enters mutual-engagement flow — see §3.2 onwards]
```

**Hard rule:** profile + tax documentation must be complete before profile enters matching pool. This is a code-enforced gate.

### Company-side

```
1.  Company creates account
2.  Company gets a welcome email
3.  Company completes intake
       — stage, industry, sales motion, target markets, budget band
4.  AI diagnosis runs
       — produces a written gap/need diagnosis
5.  Matching algorithm runs against the diagnosis
6.  Company sees BLURRED match shortlist
7.  Company pays $100 unlock fee per shortlist
       → Matches unblurred
       → Company can request a free 30-min call with any matched operator
8.  [enters mutual-engagement flow — see §3.2 onwards]
```

## §3.2 The 30-Min Call as the Qualifying Gate

After both unlock gates have been passed:

```
9.   Company requests 30-min call with selected operator
10.  Operator accepts (must be in active/unblurred state)
11.  Call happens — free to both parties (the operator's time is the friction)
12.  Both parties indicate engagement intent through the platform
13.  → MSA generated (or retrieved if exists for this Company–Operator pair)
14.  → MSA signed by all three parties
15.  → SOW generated from the relevant service template (v1)
       OR AI-drafted from call notes (v2 — see §3.4)
16.  → SOW reviewed and edited collaboratively
17.  → SOW signed by Company and Operator
18.  → Invoice schedule starts
19.  → Engagement begins (Engagement, EngagementMilestone, WorkspaceNote in code)
```

## §3.3 The MSA Layer (one per Company–Operator pair)

This is the structural change with the most leverage and the most code impact. Today the platform has only the SOW layer; Knex's structural-trust model relies on a Master + per-engagement SOW.

**Reuse rule (locked):** *MSA persists per Company–Operator pair. Second and subsequent SOWs between the same Company and Operator reference the existing MSA without re-signing.*

A new MSA *is* required when either party in the pair changes (Company A engages a new Operator B-prime; Operator B engages a new Company A-prime). This is because the conversion-fee, non-circ, and IP terms are operator-specific.

The MSA covers structural terms that don't change per engagement: payments mechanics, platform fee, IP, conversion fee, non-solicitation, non-circumvention, confidentiality, term & termination, limitation of liability, case-study rights, governing law.

The SOW (per engagement) covers everything that changes: scope, deliverables, term, fees, hours cap, reporting cadence, success-fee triggers, equity terms, termination notice for that engagement.

Schema: new `MasterServiceAgreement` model required (see §6.1).

## §3.4 SOW Generation — v1 Templates, v2 AI from Call Notes

**v1 (ship at launch):** templated SOW per service template, populated by structured form fields. This is the lighter-touch evolution of what `contracts.service.ts:generateSow()` already does — today it's keyed on `packageType` (which is mislabelled — see §6.1) and uses hardcoded templates per `getSowTemplate()`. The change is to key it on `serviceTemplateCode` and pull the template from a `ServiceTemplate` model rather than hardcoded strings.

**v2 (later — needs supporting infra first):** LLM ingests the 30-min call transcript/notes plus the structured intake, and produces a SOW draft tailored to what was actually discussed in the call. This requires:
- Reliable call-recording / transcription infrastructure (Fireflies, Otter, or in-house)
- ~20 calls of input data to validate the prompts against
- A platform-operator review step before either party sees the draft

Sequencing: ship v1, instrument 30-min calls to capture notes (manual to start, machine-transcribed once volume justifies it), switch on v2 when training data is sufficient. Do not ship v2 against zero examples — generic AI output erodes trust faster than a good template.

---

# Part IV — Contracts (Draft Skeletons)

Drafts below are *content templates*, not legal documents. They need a cross-border employment lawyer to finalise (Indian Contract Act + the operator's jurisdiction). Their purpose is to (a) be shown publicly as samples on the website (per §7), (b) act as the AI-drafting target output, (c) be handed to legal counsel as the structural starting point.

## §4.1 Master Service Agreement (Tri-Party)

```
─────────────────────────────────────────────────────────────────────
BRIDGESCALE MASTER SERVICE AGREEMENT
(Tri-Party Engagement Framework)

This Master Service Agreement ("Agreement") is entered into by:
  • BridgeScale, [Legal Entity, Country] ("BridgeScale" or "Platform")
  • [Company Legal Name, Address] ("Company")
  • [Operator Legal Name, Country of Residence] ("Operator")
Effective on the date of acceptance by all three parties ("Effective
Date").

1. STRUCTURE OF SERVICES
Operator will provide commercial services to Company under one or more
Scopes of Work ("SOW"), each of which is an addendum to this Agreement.
BridgeScale facilitates matching, contracting, payments, and
compliance.

2. RELATIONSHIP
Operator is an independent contractor (or, where the SOW so specifies,
employed by an Employer-of-Record partner of BridgeScale). Nothing in
this Agreement creates an employer-employee relationship between
Operator and Company or BridgeScale, except as specifically arranged
through an EOR partner. Operator is responsible for tax filings in
their jurisdiction; BridgeScale will issue applicable tax forms (e.g.
1099-NEC for US-resident Operators) annually.

3. PAYMENTS & PLATFORM FEE
3.1 Company pays all fees through BridgeScale.
3.2 Company pays BridgeScale a platform fee equal to ten percent (10%)
    of all amounts payable to Operator under any SOW under this
    Agreement. The platform fee is in addition to, and does not reduce,
    the Operator's stated fee.
3.3 BridgeScale will disburse Operator payouts via ACH (US),
    Wise/Stripe Connect (other corridors), or via a verified
    Employer-of-Record where applicable.
3.4 Where the SOW requires an Employer-of-Record, the EOR partner's
    monthly fee is charged through to Company at cost as a separate
    line item.
3.5 Standard ACH timing: 3–5 business days. Each SOW will note payment
    due dates accordingly.

4. INTELLECTUAL PROPERTY
4.1 Work Product created specifically for Company under any SOW becomes
    Company property upon full payment.
4.2 Operator retains rights to pre-existing frameworks, methods, and
    tools ("Operator Tools").

5. FULL-TIME CONVERSION FEE
If Company directly hires Operator as a full-time employee within
twelve (12) months after the end of any SOW under this Agreement,
Company shall pay BridgeScale a conversion fee equal to twenty-five
percent (25%) of Operator's first-year annualised cash compensation,
within ninety (90) days of the start of such employment.

6. NON-SOLICITATION & NON-CIRCUMVENTION
6.1 During the term and for twelve (12) months thereafter, neither
    Company nor Operator will solicit BridgeScale's other customers,
    operators, or staff outside the Platform.
6.2 Company and Operator will not engage each other for paid work
    outside the Platform without BridgeScale's prior written consent.
    Violations entitle BridgeScale to the equivalent fees that would
    have been due.

7. CONFIDENTIALITY
Standard mutual confidentiality. Survives termination by three (3)
years.

8. TERM & TERMINATION
8.1 This Agreement remains in effect until terminated.
8.2 Any party may terminate this Agreement on thirty (30) days written
    notice to the other parties. SOW-level termination is governed by
    the relevant SOW.
8.3 Sections 4 (IP), 5 (Conversion Fee), 6 (Non-Solicitation), and 7
    (Confidentiality) survive termination.

9. LIMITATION OF LIABILITY
Each Party's liability under this Agreement is limited to direct
damages, capped at the total fees paid under this Agreement in the 12
months preceding the claim. BridgeScale is not liable for the acts or
omissions of Company or Operator.

10. CASE STUDIES & LOGO USE
With Company's prior written consent, Operator may name Company in
case studies and marketing materials referring to the engagement.

11. GENERAL
Governing law: [India / EU jurisdiction — finalise with counsel].
Disputes resolved in courts of [Bengaluru / EU equivalent].
Amendments require written agreement of all three parties.

ACCEPTED:
[BridgeScale]   [Company]   [Operator]
─────────────────────────────────────────────────────────────────────
```

## §4.2 Scope of Work (per engagement)

```
─────────────────────────────────────────────────────────────────────
SCOPE OF WORK
(Addendum to Master Service Agreement dated [DATE])

Between BridgeScale, [Company], and [Operator].

1. ENGAGEMENT TITLE
[e.g. "Pipeline Sprint — US Mid-Market SaaS"]

2. SERVICE LANE & TEMPLATE
Lane:     [Fractional Leadership / BD-Partnerships / Execution-Ops]
Template: [e.g. PIPELINE_SPRINT, ICP_REFINEMENT, etc.]
Role(s):  [e.g. SDR + AE]

3. ENGAGEMENT TYPE
[ ] Consultation   [✓] Sprint   [ ] Retainer (Leadership)   [ ] Retainer (Operator)

4. SCOPE OF SERVICES
[Plain-English description, drafted from service template + diagnosis +
match context. Reviewed by BridgeScale before sharing with parties.
3–4 paragraphs.]

5. DELIVERABLES (with timeline)
Week 1–2:  ICP mapping; outbound sequence design; CRM hygiene.
Week 3–6:  Outbound execution; weekly pipeline reports.
Week 7–8:  Handoff; final report with recommendations.

6. SUCCESS METRICS
• 30+ qualified meetings booked by week 8
• 8+ SQLs (criteria: $25k+ ACV, decision-maker engaged)
• Pipeline $ created: $750k+

7. TERM
Start: [DATE]    End: [DATE]    Minimum: [30 days for Sprint / 60 days for Retainer]

8. FEES & PAYMENT
Total fee:           USD [PLACEHOLDER]   (Sprint, fixed-fee)
Hours cap:           18 hrs/week
Overage rate:        USD 200/hour, capped at 4 hrs/week, pre-approved
Payment schedule:    50% on signing, 50% on completion (Week 8)
Platform fee:        10% (paid by Company, in addition to above)
Payout method:       ACH to Operator (3–5 business days)
EOR (if applicable): [Partner Name] – USD [PLACEHOLDER]/mo (charged through to Company)

9. COMPENSATION MODE
[ ] Cash Only   [ ] Cash + Success Fee   [ ] Cash + Equity   [ ] Other
(See §4.3 for required addenda per mode.)

10. REPORTING & COMMUNICATION
Primary contact (Company):  [Name, Title, Email]
Cadence:                    Weekly call (Wednesdays, 30 min)
Async updates:              Daily Slack summary by 6pm PT
Reporting tool:             Slack #bridgescale-{company}

11. TERMINATION
Sprint runs to completion. Either party may terminate for material
breach with 7 days' written notice. On termination, Operator is paid
for all services rendered to date.
Retainer: 30 days' written notice from either party.

12. SPECIAL TERMS
[Any one-off provisions — equity component reference, success-fee
trigger details, specific tool requirements, NDAs with Company
customers, etc.]

ACCEPTED (electronic signature):
[Company]    [Operator]
(BridgeScale acknowledges this SOW under MSA #[ID])
─────────────────────────────────────────────────────────────────────
```

## §4.3 Addenda

Each compensation mode beyond Cash Only attaches one or more addenda.

| Compensation Mode | Required Addenda |
|---|---|
| Cash Only | None |
| Cash + Success Fee | **Success-Fee Addendum**: defines trigger event, attribution rule, payout amount, invoicing timing |
| Cash + Equity | **Hybrid Cash + Equity Addendum**: states cash split, equity instrument (FAST advisor agreement is the launch default), vesting schedule, cliff, acceleration |
| Equity Only | **Equity-Only Addendum + FAST**: same as Hybrid but with cash = $0 |
| Cash + Equity + Success Fee | All of the above |

For the **Conversion Fee** event (Company hires Operator full-time within 12 months of SOW end):
- A **Conversion Addendum** is generated automatically when the platform detects the conversion event
- References the existing MSA §5
- Triggers a one-time invoice to Company for 25% of FY1 cash compensation
- Closes the Engagement record with status `CONVERTED_TO_FULLTIME`

Addendum templates need to be drafted by counsel and approved before use. They are not included in this document.

## §4.4 Cancellation Policy in Plain English

For the website (subject to founder approval per §7.4):

```
We protect both sides of the table. Specifically:

For paid 30-min consultations:
  • If your operator cancels with more than 24 hours' notice, you get
    a full refund — or you can rebook with the same operator at no
    extra cost.
  • If your operator cancels at the last minute, the first time we
    waive any penalty. After that, we deduct a small amount from the
    operator's next session payout. You always get a full refund.
  • If your operator no-shows, you get a full refund. Repeated
    no-shows pause an operator's profile for review.
  • If you cancel with more than 24 hours' notice, you get 90% back
    (we keep 10% to cover the operator's reserved time).
  • If you cancel at the last minute, you get 50% back; the operator
    gets 50% for the held time.

For Sprints, Operator Retainers, and Leadership Retainers:
  • These are governed by your Scope of Work, not by platform policy.
  • Sprints run to completion unless one party is in material breach.
  • Retainers can be ended with 30 days' written notice from either
    side.
  • Operators are paid for all work completed up to the end date.
```

---

# Part V — Payments, Tax & Compliance

## §5.1 Platform Fee Model — Hybrid Option C (LOCKED)

| Side | Fee | When Charged | What it Funds |
|---|---|---|---|
| Operator | $50 USD activation | One-time, paid *after* profile + tax docs complete and the operator has seen blurred matches. Pays to unblur. | Vetting, profile maintenance, infrastructure |
| Company | $100 USD unlock | Per match shortlist, paid after AI diagnosis runs and matches are generated. Pays to unblur. | Diagnosis compute + ops review of shortlist |
| Company | 10% of operator fee | Per engagement, on top of operator's stated rate. Does not reduce operator payout. | Contracting, payments, compliance, support, EOR coordination |
| Company | EOR fee at cost | Per engagement, where applicable. Charged through as a separate line item. | EOR partner's monthly fee (Deel / Remote / Multiplier) |

The two unlock fees are **commitment signals**, not the platform's primary revenue. The 10% engagement fee is the actual revenue line.

## §5.2 Pricing Summary

For public disclosure (subject to founder approval per §7.4). Recommended single-paragraph copy:

> *"BridgeScale charges a 10% platform fee to companies on cash engagements. This is in addition to the operator's stated rate; it does not come out of the operator's payout. A one-time $100 unlock fee per match shortlist covers the cost of diagnosis and matching. Operators pay a one-time $50 activation fee when their profile becomes eligible to be matched. For engagements requiring an Employer-of-Record, the EOR partner's monthly fee is charged through at cost as a separate line item."*

## §5.3 Compliance Modes (7) + Trigger Sub-Table

Updated from the workbook with two additions adopted per founder direction.

### Compliance Modes

| Mode | Use When | Decision Authority | SLA |
|---|---|---|---|
| **Contractor (1099 / W-8BEN)** | Short-term, output-based, low control. Sprints; short retainers in Tier-1 corridors. Operator paid as individual. | Platform-auto (rule-based check at MSA generation) | Instant |
| **B2B Service Provider (Operator Entity)** | Operator invoices through their own entity (LLC, GmbH, Pvt Ltd, Ltd Co). Common for senior diaspora operators. Payout to entity bank, not individual. | Platform-auto (with entity verification at onboarding) | Instant |
| **AOR / COR (Agent / Contractor of Record)** | Contractor relationship exists but classification, onboarding, tax, payout managed by EOR partner as 'contractor management' tier. | Platform-ops review | 1 business day |
| **EOR (Employer of Record)** | Relationship looks employment-like, OR local law makes contractor classification risky (DE/FR/NL/ES/IE). | Platform-ops review (corridor lookup) + Founder approval for first engagement in a new corridor | 3 business days |
| **Direct Employment** | Full-time conversion or direct hire by Company outside the platform. Triggers 25% conversion fee. | Platform-ops review (conversion-fee invoice trigger) | n/a |
| **EU Platform Worker (Directive 2024)** | Any first engagement in an EU member state that has transposed the EU Platform Workers Directive. | Legal counsel + Founder sign-off (first engagement per state); platform-ops thereafter | 5 business days first time, 1 day after |
| **Legal Review Required** | Equity issuance; success-fee resembling regulated commission; sensitive data; bespoke commercial structure. | Legal counsel (external) + Founder sign-off | 5 business days |

### Trigger Sub-Table — when does each compliance mode get activated?

| Trigger Condition | Activates Mode |
|---|---|
| Operator's residence country is in Tier 1, role is Operator-flavour, term ≤ 60 days, hours ≤ 20/wk | Contractor |
| Same as above but operator invoices through their own entity | B2B Service Provider |
| Operator's residence country is UK, term > 6 months, hours > 20/wk → IR35 inside-determination by EOR partner | EOR (Remote or Deel) |
| Operator's residence country is UK, IR35 outside-determination | Contractor or B2B (depending on operator entity status) |
| Operator's residence country is Germany / France / Netherlands / Spain / Ireland / Italy / Portugal, engagement is Retainer or Leadership | EOR (Remote primary) |
| Operator's residence country is in EU AND first engagement in that country since EU Platform Workers Directive transposition | EU Platform Worker analysis BEFORE other classification |
| Operator's PE country differs from tax residency country (e.g., US tax resident operating from EU) | Legal Review |
| Compensation mode includes equity in any form | Legal Review (always) |
| Compensation mode includes success-fee in UK / EU corridors | Legal Review |
| Engagement size > $50k or >12 months total commitment | Platform-ops review |
| Company hires operator full-time within 12 months of SOW end | Direct Employment + Conversion Fee invoice |

## §5.4 Tax Form Decision Flow

Tax-form collection runs **once per operator at onboarding**, not per engagement. Storage: encrypted at rest in operator profile (or partner-managed if EOR/AOR).

| Trigger Condition | Form Required | Who Collects | Renewal Cadence | Downstream |
|---|---|---|---|---|
| Operator is US person AND will receive USD payout via BridgeScale's US payment partner | **W-9** | BridgeScale (or Stripe Connect operator onboarding) | On change of legal name / address / TIN; otherwise indefinite | Annual 1099-NEC if total payouts > $600/yr |
| Operator is non-US individual AND will receive payout from a US-domiciled payer | **W-8BEN** | BridgeScale (or Stripe Connect) | Every 3 calendar years (form expires) | May trigger 30% withholding unless tax-treaty article applies; document treaty claim |
| Operator is non-US entity (LLC, GmbH, Pvt Ltd) AND will receive payout from a US-domiciled payer | **W-8BEN-E** | BridgeScale | Every 3 calendar years | Withholding rules per entity classification + treaty |
| Operator works through EOR partner (Deel / Remote / Multiplier) | None collected by BridgeScale | EOR partner | Per partner | Partner issues local employment tax forms |
| Operator is India-domiciled, paid in INR by BridgeScale's Indian entity | **GST invoice + PAN** | BridgeScale | On change of GSTIN / PAN | TDS deduction per Indian Income Tax Act if applicable |
| Operator is in EU/UK and BridgeScale pays via Wise (non-US payer route) | Operator's local tax registration (e.g., VAT number) on invoice | BridgeScale collects on first invoice | On change of tax-registration status | VAT reverse-charge or local treatment per corridor; legal review for first engagement in new EU corridor |

**HARD RULE:** operator profile is not added to the matching pool until profile + required tax documentation are complete. Activation fee is paid AFTER blurred matches are shown to operator.

## §5.5 EOR — Partner Stack, Charge-Through, Corridor Map

### Day-1 launch stack (locked per founder direction)

- **Deel** — global default (covers US, UK, Canada, Australia, most of Asia)
- **Remote** — EU primary (Germany, France, Netherlands, Spain, Italy, Portugal, Ireland)
- **Multiplier** — India-outbound and APAC

### Charge-through model

EOR fees are charged through to the Company at cost as a separate line item on the SOW. BridgeScale does not absorb. Disclosure on the SOW for an EOR engagement:

> *"This engagement runs through [EOR Partner] as Employer of Record for the operator's jurisdiction. The Company pays a monthly EOR fee of $X in addition to the operator's monthly fee and BridgeScale's 10% platform fee. EOR handles all local employment paperwork, payroll, statutory benefits, and tax filings."*

### Country tier map

| Tier | Countries | Default mode (Sprint) | Default mode (Retainer/Leadership) | Primary EOR partner |
|---|---|---|---|---|
| **Tier 1 (auto-supported)** | US, UK, Canada, India, UAE, Singapore, Australia | Contractor (Tier-specific tax form) | Contractor or EOR depending on duration / hours / risk | Deel (Multiplier for India) |
| **Tier 2 (ops-review supported)** | Germany, France, Netherlands, Spain, Ireland, Italy, Portugal, New Zealand | Contractor for short sprints only | EOR (Remote primary) | Remote |
| **Tier 3 (deal-desk only)** | Brazil, other LATAM, China / HK, all others | Deal-desk | Deal-desk | Case-by-case |

The full corridor map with FX rails per country is in `BridgeScale_Operating_Matrix.xlsx` sheet `10_Country_Tier_Map`.

## §5.6 Indian Payout Corridors (Wise + Razorpay)

A common scenario for the diaspora demographic: operator is an Indian citizen abroad (US/UK/EU) and wants payout in INR to their Indian bank account. Two underlying scenarios; different paths.

### Scenario A — Indian citizen abroad, Indian bank account

The operator typically holds an **NRE (Non-Resident External)** account: pre-approved for inward USD/EUR/GBP remittance under FEMA, fully repatriable, INR-denominated, tax-free in India for non-residents. **NRO (Non-Resident Ordinary)** is the alternative when the operator wants to receive Indian-source income; taxable in India, partially repatriable.

**Recommended path:** Wise USD → INR to NRE account.

### Scenario B — Indian-resident operator working remotely for international companies

Service-export scenario. GST applies (typically zero-rated as service export with LUT — Letter of Undertaking). TDS applies if BridgeScale's Indian entity is the payer.

**Recommended path:** Razorpay payout INR → Indian savings/current account.

### Three supported payout paths

| Path | Mechanism | Best for | Notes |
|---|---|---|---|
| **Wise INR corridor** | USD/EUR/GBP → INR via Wise's local rails | Scenario A (NRE deposit), most simple cross-border cases | 1–2 day delivery, transparent FX, ~0.5–1% all-in cost. Works to NRE/NRO/savings. |
| **Razorpay payouts (RazorpayX)** | INR → Indian bank (savings/NRE/NRO) via NEFT / IMPS / RTGS | Scenario B (Indian-resident operator), or when BridgeScale's Indian entity is the payer | Already used for company-side collection — no new vendor. Same-day or instant. ~0.25% per payout. |
| **Stripe Connect India** | USD → INR via Stripe's India entity | Operators already enrolled in Stripe Connect for other currencies | Useful only if Stripe Connect becomes the operator-payout backbone. More complex setup. |

### Compliance baked in

- **FEMA**: governs all inward remittance to India. NRE accounts are pre-approved. Standard savings accounts have receipt limits — flag at operator onboarding.
- **GST treatment for Scenario B**: service exports zero-rated under LUT. Operator must register for GST if turnover > ₹20L/yr. Collect GSTIN at onboarding.
- **TDS**: 10% under section 194J for professional services if BridgeScale Indian entity pays directly. If routed via Wise from BridgeScale's US entity, TDS doesn't apply.
- **DTAA**: operator can claim treaty benefits to avoid double taxation. Form 10F + Tax Residency Certificate required from operator's country of residence.
- **Account-type validation**: at operator onboarding, capture *account type* explicitly (NRE / NRO / Savings / Current) — drives downstream TDS, FEMA, and GST treatment.

## §5.7 Currency Handling and FX

- **Company billing currency**: typically INR (via Razorpay) or USD (via Stripe). Determined by Company's country of incorporation.
- **Operator payout currency**: Operator's local currency where rails exist (Wise corridors); USD by default.
- **FX rate**: fixed at SOW signing using Wise mid-market rate + 0.5% buffer. Recorded as `fxRateAtSigning` on the PaymentPlan record.
- **FX drift**: BridgeScale absorbs intra-month drift on amounts ≤ 2%. Drift > 2% triggers re-quote and SOW amendment.
- **Schema change required**: `PaymentPlan.currency` (single field today) → split into `billingCurrency` + `payoutCurrency` + `fxRateAtSigning` (see §6.1).

---

# Part VI — Repo & Schema Changes Required

## §6.1 Schema Migrations (HIGH-severity gaps)

Three HIGH-severity gaps in the current Prisma schema (`backend/prisma/schema.prisma`) block the operating model from being enforced in code. Listed in dependency order.

### Migration 1 — Fix the Lane / Engagement / Template confusion

```prisma
// REMOVE
enum OperatorLane {
  PIPELINE_SPRINT       // ← these are engagement-shaped, not lane-shaped
  BD_SPRINT
  FRACTIONAL_RETAINER
}

enum PackageType {
  PIPELINE_SPRINT       // ← same problem
  BD_SPRINT
  FRACTIONAL_RETAINER
}

// REPLACE WITH
enum ServiceLane {
  FRACTIONAL_LEADERSHIP
  FRACTIONAL_BD_PARTNERSHIPS
  FRACTIONAL_EXECUTION_OPS
}

enum EngagementType {
  CONSULTATION
  SPRINT
  RETAINER
}

enum RetainerFlavour {
  LEADERSHIP
  OPERATOR
}

enum ServiceTemplateCode {
  INTL_MARKET_ENTRY
  ICP_REFINEMENT
  GTM_STRATEGY
  PIPELINE_SPRINT
  FOUNDER_LED_SALES_TRANSITION
  REVENUE_CADENCE_SETUP
  PARTNER_CHANNEL_DEVELOPMENT
  CUSTOMER_SUCCESS_RETENTION
  SALES_PROCESS_CRM_CLEANUP
  CLOSING_SUPPORT
}
```

Migrate existing rows: map old values to nearest new equivalents (e.g., `PIPELINE_SPRINT` package → `serviceTemplate=PIPELINE_SPRINT, engagementType=SPRINT, retainerFlavour=NULL`).

### Migration 2 — Closed role enum

```prisma
// Replace OperatorProfile.functions String[]
enum OperatorRole {
  // Leadership
  VP_SALES
  VP_REVENUE
  CRO
  HEAD_OF_SALES
  GTM_LEADER
  FOUNDER_LED_SALES_COACH
  REVENUE_ADVISOR
  // BD
  BD_LEAD
  PARTNERSHIPS_LEAD
  CHANNEL_LEAD
  ALLIANCES_LEAD
  MARKET_ACCESS_LEAD
  // Execution / Ops
  AE
  SDR
  BDR
  OUTBOUND_OPERATOR
  REVOPS
  SALES_OPS
  CUSTOMER_SUCCESS_OPERATOR
  EXPANSION_OPERATOR
  ACCOUNT_MANAGER
  SALES_ENABLEMENT_SOLUTIONS_CONSULTANT
}

model OperatorProfile {
  // ...
  roles OperatorRole[]   // replaces `functions String[]`
  // ...
}
```

Validate: every role belongs to exactly one lane. Add a `roleToLane()` helper.

### Migration 3 — Master Service Agreement model

```prisma
enum MsaStatus {
  PENDING_SIGNATURES
  PARTIALLY_SIGNED
  FULLY_EXECUTED
  TERMINATED
}

model MasterServiceAgreement {
  id                    String    @id @default(cuid())
  startupProfileId      String
  operatorId            String
  status                MsaStatus @default(PENDING_SIGNATURES)
  platformFeePercent    Int       @default(10)
  conversionFeePercent  Int       @default(25)
  nonCircMonths         Int       @default(12)
  termNoticeDays        Int       @default(30)
  governingLaw          String    @default("India")
  platformSignedAt      DateTime?
  startupSignedAt       DateTime?
  operatorSignedAt      DateTime?
  fullyExecutedAt       DateTime?
  documentUrl           String?
  watermarked           Boolean   @default(true)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  sows StatementOfWork[]

  @@unique([startupProfileId, operatorId])
  @@map("master_service_agreements")
}

model StatementOfWork {
  // ...
  masterAgreementId String
  msa MasterServiceAgreement @relation(fields: [masterAgreementId], references: [id])
  serviceTemplate ServiceTemplateCode
  engagementType  EngagementType
  retainerFlavour RetainerFlavour?
  // ...
}
```

### Other schema additions (MEDIUM severity)

| Addition | Why |
|---|---|
| `OperatorTaxProfile` model (formType, formStatus, expiresAt, encryptedBlobRef) | Enforce hard rule: no matching pool entry without complete tax docs |
| `CompensationMode` enum + addendum models (`HybridAddendum`, `SuccessFeeAddendum`, `EquityOnlyAddendum`, `ConversionAddendum`) | Currently `PaymentPlanType` covers only 3 modes; need 6 |
| `ComplianceMode` enum + `ComplianceDecisionLog` model | Audit trail for who decided this engagement is Contractor vs EOR |
| `EorPartner` enum + `OperatorEorEnrollment` model | Route operators to Deel / Remote / Multiplier |
| `PaymentPlan.billingCurrency` + `payoutCurrency` + `fxRateAtSigning` | INR-in / USD-out engagement support |
| Extend `SowStatus` enum: add `AI_DRAFT`, `HUMAN_APPROVED`, `SHARED`, `SIGNED`, `ACTIVE`, `COMPLETED`, `TERMINATED` | Reflect the v1/v2 SOW pipeline |
| `CancellationEvent` model | Enforce sheet 2.8 cancellation rules in code |
| `LifecycleEvent` model | Conversion fee invoicing trigger |

The full gap analysis is in `BridgeScale_Operating_Matrix.xlsx` sheet `11_Repo_Schema_Gaps`.

## §6.2 Service Layer to Wire

### A. SOW generation — wire AI service to `contracts.service.ts:generateSow()`

Today's `generateSow()` injects `aiService` but does not call it. For v1, no AI call is needed — change `getSowTemplate()` to read from the new `ServiceTemplate` table rather than hardcoded strings, and key on `serviceTemplate + engagementType + retainerFlavour` rather than the misnamed `packageType`.

For v2 (later), call `aiService.generateSowDraft({ structuredInput })` and store the response as the first `SowVersion` with status `AI_DRAFT`.

### B. MSA generation — new service module

`backend/src/contracts/msa.service.ts`:

- `findOrCreateMsa({ startupProfileId, operatorId })` — returns existing MSA if pair has one, otherwise creates a new draft
- `generateMsaDocument(msaId)` — fills the §4.1 template with the locked terms (10%, 25%, 12mo, 30-day notice) and the party details
- `recordSignature(msaId, party, signatureId)` — updates signature timestamps and transitions status

### C. Compliance mode resolver — runtime check at MSA generation

`backend/src/compliance/compliance.service.ts`:

- `resolveComplianceMode({ operatorCountry, engagementType, retainerFlavour, hours, durationDays, compensationMode })` — returns one of the 7 modes based on the trigger sub-table in §5.3
- For modes that require human review, create a `ComplianceReviewTask` for ops or legal queue

### D. Payout router — pick the rail

`backend/src/payments/payout-router.service.ts`:

- `routePayout({ operator, amount, currency })` — selects from Stripe Connect ACH (US) / Wise corridors / Razorpay India / EOR partner based on operator profile and engagement compliance mode

## §6.3 Build Sequencing

### Phase 1 (must-have for launch)

1. Migration 1 (lane/engagement/template enum split) — 1 week
2. Migration 2 (role enum) — 3 days
3. Migration 3 (MSA model) — 1 week including signing UX
4. SOW generation v1 wired to ServiceTemplate table — 1 week
5. Compliance mode resolver (rule-based, no human-review queue yet) — 1 week
6. Stripe Connect Express setup (covers US ACH in/out + payment splitting + W-9/W-8BEN collection) — 3 weeks
7. Razorpay payout extension (INR out for Indian operators) — 1 week
8. Cancellation policy enforcement — 3 days
9. Operator-onboarding tax-doc gate — 3 days
10. `/learn` page MVP (per §7.3) — 2 weeks parallel

**Phase 1 total: ~6–8 weeks of focused work.**

### Phase 2 (compliance hygiene at scale)

1. Wise corridor integration (EU, UK, AU, NZ, AE, SG payouts) — 2 weeks
2. 1099-NEC issuance (auto via Stripe Connect or via Track1099) — 2 weeks
3. EOR partner integration: Deel first, then Remote, then Multiplier — 4 weeks per partner, can parallelise
4. Conversion fee invoice trigger (LifecycleEvent) — 1 week
5. SOW v2 — AI generation from call notes (after ~20 calls collected) — 3 weeks

### Phase 3 (selective)

1. EU Platform Worker compliance flow (per state, as engagements arrive) — corridor-by-corridor
2. Stripe Connect India (only if Wise+Razorpay combo proves insufficient) — 4 weeks
3. Non-circumvention monitoring — case-by-case manual to start

---

# Part VII — Website Communication Plan

## §7.1 What Changes Today (FAQ-only additions, no new sections)

Per founder direction (line 414 of the prior memo): every public-facing string requires founder approval before going live. Below are *drafts* — not committed copy.

### `/for-companies` — add one new FAQ entry

```
Q: How is an engagement structured legally?

A: Every engagement runs as a tri-party arrangement between
BridgeScale, your company, and the operator. Two documents:

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

### `/for-talent` — add one new FAQ entry

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
or local rails elsewhere, INR via Wise or Razorpay for diaspora
operators wanting payout to an Indian account. Required tax forms
(W-9, W-8BEN, GST/PAN) are collected during operator onboarding. For
corridors that require it, BridgeScale works through verified
Employer-of-Record partners (Deel, Remote, Multiplier).

→ View sample Master Service Agreement
→ View sample Scope of Work
```

### Existing copy that should be updated for consistency

- Resolve the unlock-fee number across `/for-companies` ($100), `/for-talent` ($50), and the prior `CLAUDE.md` reference (₹8,500). Pin to USD across the board.
- Update the engagement-types card grid on `/for-companies` to reflect three types (Consultation / Sprint / Retainer with two flavours), removing Hybrid and Success-fee as separate cards (they are compensation modifiers).
- Name the AI diagnosis step explicitly in the matching-flow narrative.

## §7.2 What Ships at Launch (per founder direction line 471)

The `/learn` page, the sample MSA + SOW (linked from FAQ entries above), and the operator profile / storefront MVP all ship at launch.

## §7.3 The /learn Page IA

URL: `/learn` — *"Hiring fractional commercial talent for international growth."*

```
1. Hero
   "Most founders hiring international fractional talent are doing it
    for the first time. This page is the playbook."

2. When fractional makes sense (and when it doesn't)
   - Three scenarios where fractional is the right call
   - Three scenarios where it isn't
   - One-line rule of thumb

3. The cost of a wrong full-time hire (calculator)
   - Inputs: senior salary band (₹), recruitment fee %, ramp months
   - Output: total wrong-hire cost in INR
   - CTA: "See how a fractional engagement de-risks this"

4. Pick your engagement type (the three-type framework with flavours)
   - Consultation / Sprint / Retainer (Leadership) / Retainer (Operator)
   - One sentence each, one example each, indicative price each

5. Roles, mapped to engagement types and compensation
   - The matrix from §2.3 + §2.7
   - The table buyers will screenshot and share internally

6. How an engagement is structured (tri-party + SOW)
   - The same content as the FAQ entries above, expanded
   - Sample MSA and SOW linked

7. FAQ (deep — replaces today's per-page FAQs, audience-tagged)
   - How matching works (and the AI diagnosis step)
   - How the contracts work
   - How payments work (ACH, INR, 1099, when EOR, Indian payout corridors)
   - Conversion to full-time (how, when, fee)
   - Cancellation and rematch
   - Confidentiality, IP, non-circumvention
```

The audience-specific FAQs on `/for-companies` and `/for-talent` get **shortened** to 4–5 of the highest-frequency questions per audience. Everything else moves to `/learn`.

## §7.4 Approval Workflow for Public Copy

Per founder direction (line 414 of follow-up memo 2):

> *"For every change that will be made, you will need an approval from me. you will provide me a draft. only after my approval of the draft. draft will be moved to website."*

Workflow:

1. **Draft** — Outside Advisory produces a copy draft in this document or a follow-up.
2. **Founder review** — written approval per section. Edits requested inline.
3. **Final draft** — Outside Advisory produces revised copy reflecting edits.
4. **Founder lock** — written sign-off with version stamp.
5. **Engineering implementation** — copy is moved into the codebase by the engineering team.
6. **QA + publish** — verified on staging, then production.

No copy reaches the website without Step 4 sign-off.

---

# Part VIII — Open Decisions, Risks, Sequencing

## §8.1 Locked Decisions (no further work needed)

| # | Decision | Locked Value | Source |
|---|---|---|---|
| L1 | Platform fee model | Hybrid Option C: $50 operator activation + $100 company unlock + 10% engagement fee + EOR charge-through | Founder confirmation |
| L2 | Day-1 EOR partners | Deel + Remote + Multiplier | Founder confirmation |
| L3 | Engagement-type collapse | 3 types, with Retainer in two flavours (Leadership / Operator). Advisory/Equity and Success-Fee become compensation modifiers. | Founder edits + this document §2.5 |
| L4 | `/learn` page priority | Ships at launch | Founder confirmation |
| L5 | Cancellation policy | §2.8 above, with operator's first late-cancel deferred without penalty | Founder confirmation |
| L6 | MSA reuse rule | Persists per Company–Operator pair; second and subsequent SOWs reference existing MSA | Founder confirmation |
| L7 | India-domestic engagements | NOT supported. India-outbound only. | Founder confirmation |
| L8 | Operator profile completeness gate | Profile + tax docs must be complete before profile enters matching pool. Activation fee paid AFTER blurred matches shown. | Founder confirmation |
| L9 | Service lane labels | "Fractional Leadership", "Fractional BD / Partnerships", "Fractional Execution / Operations" — "Sales" removed. | Founder confirmation |
| L10 | Sales Enablement & Solutions Consultant | Single combined role spanning sales engineering, sales enablement, solutions consulting, pre-sales. Lives in Execution / Operations lane. | Founder confirmation |
| L11 | Indian payout corridors | Wise USD→INR for Scenario A (operator abroad with NRE); Razorpay INR for Scenario B (Indian-resident operator). | Founder confirmation |
| L12 | Compliance modes | 7 modes including B2B Service Provider and EU Platform Worker; trigger sub-table in §5.3 | Founder confirmation |
| L13 | Approval workflow for website copy | Drafts → founder approval → only then to engineering | Founder direction |

## §8.2 Open Decisions (founder sign-off needed)

| # | Decision | Recommendation |
|---|---|---|
| O1 | Conversion fee number | 25% of FY1 cash compensation per category benchmark — included in MSA draft §4.1. If different, lock before legal review. |
| O2 | Currency stance — operator paid USD or local? | Local where Wise rail exists; USD default elsewhere. FX fixed at SOW signing. |
| O3 | MSA signing UX | BridgeScale pre-signs platform terms; Company + Operator counter-sign asynchronously. Lower friction than 3-way simultaneous. |
| O4 | Tier 1 / 2 / 3 corridor classification | The 7 Tier-1 countries in §5.5 — confirm before MSA generation goes live. |
| O5 | Equity instruments supported at launch | FAST advisor agreement only. Add option grants in v2 once securities counsel reviewed. |
| O6 | Success-fee triggers allowed without legal review | Whitelist: 'Qualified Meeting Held + Accepted', 'Signed Partner Agreement', 'Closed-Won Deal'. Anything else → legal review. |
| O7 | Late-cancellation window for Consultation | 24h boundary per §2.8. Confirm. |
| O8 | EOR cost — fully charged through, partial absorption to support demand side, or first-engagement subsidy? | (Per founder note line 128) Recommend charged through with a one-time first-engagement subsidy if needed for top-of-funnel acceleration. Needs founder direction. |
| O9 | Public disclosure copy (fee, EOR, cancellation, onboarding) | Drafts in §7.1 above. Founder approval per §7.4 workflow. |
| O10 | Prisma migration window | Phase 1 (§6.3) requires staged rollout. Founder approval needed for migration calendar. |

## §8.3 Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Schema migration regression** — the lane/engagement/template enum rename touches matching, SOW gen, and operator profiles. Any miss breaks matching. | High | Stage in dev with full data backfill; run shadow matching for 1 week before cutover. |
| **MSA signing friction** — 3-way signature flows historically slow down. Risk: operators / companies abandon at the MSA step. | Medium | Pre-sign by platform; allow async counter-signing. Single-click DocuSign or similar. |
| **EOR partner API instability** — Deel/Remote/Multiplier APIs evolve. Direct integration carries maintenance cost. | Medium | Build behind a single internal "EOR provider" interface. Swap providers without touching engagement flow. |
| **Operator onboarding drop-off due to tax-doc gate** — operators may abandon at the W-9/W-8BEN collection step. | Medium | Make it the *last* step before matching pool entry, with clear "you're 90% done" framing and FAQ. |
| **Indian payout compliance error** — FEMA/GST/TDS misclassification could create operator tax liability. | High | Legal review of first 3 engagements per Indian payout path. NRE-only at launch; NRO/Savings later. |
| **Conversion fee dispute** — Companies hire operators full-time without notifying BridgeScale. | Medium | Non-circ clause + monitoring (LinkedIn role-change scrape, operator self-attestation, audit clause). |
| **AI SOW generation hallucination (v2)** — generic or incorrect content erodes trust. | Low (deferred to v2) | Don't ship v2 until 20+ training calls; require platform-operator review of every AI draft pre-share. |
| **Platform fee perception** — operators interpreting the 10% as coming out of their rate despite explicit disclosure. | Low | Clear disclosure copy + payout statement showing operator gross = operator stated rate. |

## §8.4 30 / 60 / 90 Day Plan

### Days 0–30

- Lock the 10 open decisions in §8.2 (single founder working session)
- Engineering: schema migrations 1, 2, 3 (§6.1)
- Legal: review and finalise MSA + SOW + addenda templates (§4)
- Marketing: produce `/learn` page first draft + sample document PDFs
- Resolve unlock-fee inconsistency across CLAUDE.md, /for-companies, /for-talent

### Days 30–60

- Engineering: SOW generation v1 wired to new ServiceTemplate table (§6.2.A)
- Engineering: MSA service module (§6.2.B)
- Engineering: Compliance mode resolver (§6.2.C, rule-based only)
- Engineering: Stripe Connect Express setup (§6.3 Phase 1 item 6)
- Marketing: founder approval and ship FAQ entries (§7.1)
- Operator-side: tax-doc gate enforcement live

### Days 60–90

- Engineering: Razorpay payout extension for Indian operators (§5.6)
- Engineering: Wise corridor integration (Phase 2 item 1)
- Engineering: Cancellation policy enforcement (§2.8)
- Marketing: `/learn` page ships at launch
- Operations: First EOR engagement (Deel) end-to-end, document learnings
- Set up Cancellation + ComplianceDecisionLog audit trails

---

# Part IX — Appendix

## §9.1 Glossary

| Term | Definition |
|---|---|
| **Service Lane** | One of three top-level categories of work BridgeScale sells. (Layer 1.) |
| **Role** | A specific job title an operator holds within a lane. (Layer 2.) |
| **Service Template** | A productised work package — 30/60/90 outputs known in advance. (Layer 3.) |
| **Engagement Type** | The structural shape of the engagement — Consultation, Sprint, or Retainer. (Layer 4.) |
| **Retainer Flavour** | Either Leadership Retainer (senior leader in leadership rhythm) or Operator Retainer (senior operator in operator rhythm). |
| **Compensation Mode** | How the operator is paid — Cash Only / Cash + Success Fee / Cash + Equity / Equity Only / combinations. (Layer 5.) |
| **MSA** | Master Service Agreement. Tri-party agreement between BridgeScale, Company, Operator. Signed once per Company–Operator pair. |
| **SOW** | Scope of Work. Per-engagement addendum to the MSA. |
| **EOR** | Employer of Record. Third-party partner that legally employs the operator in their jurisdiction. |
| **AOR / COR** | Agent / Contractor of Record. EOR partner's lighter-touch contractor-management tier. |
| **FAST** | Founder Advisor Standard Template — the standard equity grant document for advisor engagements. |
| **NRE / NRO** | Non-Resident External / Ordinary — Indian bank account types for non-resident Indians. |
| **DTAA** | Double Taxation Avoidance Agreement. |
| **PE** | Permanent Establishment — tax-residency concept relevant to cross-border engagements. |
| **IR35** | UK off-payroll working rules; determines whether a contractor is "inside" or "outside" employment for tax purposes. |
| **EU Platform Workers Directive** | EU 2024 directive establishing presumption of employment for digital platform workers; transposed by member states 2025–2026. |

## §9.2 Acronyms

ACH (Automated Clearing House) · AE (Account Executive) · AOR (Agent of Record) · AI (Artificial Intelligence) · ARR (Annual Recurring Revenue) · BD (Business Development) · BDR (Business Development Representative) · COR (Contractor of Record) · CRO (Chief Revenue Officer) · CRM (Customer Relationship Management) · CS (Customer Success) · DTAA (Double Taxation Avoidance Agreement) · EOR (Employer of Record) · FAST (Founder Advisor Standard Template) · FEMA (Foreign Exchange Management Act) · FX (Foreign Exchange) · GST (Goods and Services Tax) · GTM (Go-To-Market) · ICP (Ideal Customer Profile) · INR (Indian Rupee) · IP (Intellectual Property) · IR35 (UK off-payroll rules) · LUT (Letter of Undertaking) · MSA (Master Service Agreement) · MSME (Micro, Small, and Medium Enterprises) · NRE / NRO (Non-Resident External / Ordinary) · PAN (Permanent Account Number) · PE (Permanent Establishment) · QBR (Quarterly Business Review) · RevOps (Revenue Operations) · SDR (Sales Development Representative) · SOW (Scope of Work) · SQL (Sales Qualified Lead) · TDS (Tax Deducted at Source) · TIN (Taxpayer Identification Number) · USD (US Dollar) · VP (Vice President)

## §9.3 Cross-Reference Index

This document is the single source of truth for *operating model and rollout planning*. Other documents in the repo are:

| Document | Purpose | Status vs. this doc |
|---|---|---|
| `Docs/BRIDGESCALE_SERVICE_MODEL/07_SERVICE_ROLE_ENGAGEMENT_PAYMENT_COMPLIANCE_MAPPING.md` | Canonical reference for the layered taxonomy (lanes/roles/templates/engagement/compensation) and the 11 advertised combinations | Foundational input. This document supersedes it for any decisions/rollout questions; it remains canonical for taxonomy details. |
| `BridgeScale_Operating_Matrix.xlsx` | Canonical reference for runtime lookup matrices (Role × Template, Template × Engagement, full Combinations, Country Tier Map) | Working artefact. v0.1 is in repo. v0.2 (with Sales Enablement & Solutions Consultant role + Retainer flavour split + B2B/EU Platform Worker compliance modes + Indian payout rows) is the next planned update. |
| `BridgeScale_Adoption_Memo_2026-04-27.md` | First-pass competitive read | Historical. Superseded by this doc for recommendations. |
| `BridgeScale_Adoption_Memo_Followup_2026-04-27.md` | Tri-party adaptation, payments/EOR gap analysis, MSA + SOW drafts | Historical. Drafts incorporated into Part IV of this doc. |
| `BridgeScale_Adoption_Memo_Followup2_2026-04-27.md` | EOR corridors, fee model, cancellation policy, doc 07 evaluation | Historical. Decisions consolidated into Parts V and VIII of this doc. |
| `BridgeScale_Competitive_Advisory.md` | Initial competitive advisory brief | Historical. Adopted recommendations are in Part I of this doc. |
| `Docs/BRIDGESCALE_SERVICE_MODEL/01_REPO_CHANGE_REQUIREMENTS.md` through `06_*.md` | Implementation working notes | Working documents. Cross-reference for engineering. |
| `CLAUDE.md` | Project codebase guide | Reference. The unlock-fee inconsistency flagged in §7.1 needs resolution here too. |
| `frontend/src/app/page.tsx`, `for-companies/page.tsx`, `for-talent/page.tsx` | Live website | Target of §7.1 changes after founder approval. |
| `backend/prisma/schema.prisma` | Live database schema | Target of §6.1 migrations. |
| `backend/src/contracts/contracts.service.ts` | Live SOW generation code | Target of §6.2.A wiring. |
| `backend/src/payments/payments.service.ts` | Live payments code | Target of §6.2.D payout router. |

---

## Document Version History

| Version | Date | Author | Change Summary |
|---|---|---|---|
| 1.0 | 27 April 2026 | Outside Advisory | Initial consolidation. Replaces three preceding follow-up memos as source of truth for operating model + rollout. Incorporates founder confirmations through follow-up memo 2. |

## Next Review Trigger

This document should be re-versioned when any of the following happen:
- A locked decision in §8.1 changes
- An open decision in §8.2 is locked
- Any Phase 1 schema migration ships
- The first 3 EOR engagements complete (calibrate corridor map)
- The first 20 SOWs are signed (replace placeholder price bands with real ranges)

---

*End of Master Plan v1.0.*
