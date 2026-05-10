# BridgeScale — Follow-up Memo: Adapting Tri-Party, Payments/EOR, and Engagement-Type Specs

**To:** BridgeScale Founding Team
**From:** Outside Advisory (consultant draft)
**Date:** 27 April 2026
**Subject:** Detailed answers to follow-ups on tri-party adoption, payments/EOR gap, single education page, role mapping, and engagement-type requirements
**Status:** Draft for discussion. No code changes implied.

---

## 0. Reading Order & Scope

This memo answers, in order: (1) how the Tri-Party Master + SOW model adapts to BridgeScale's current process and what the AI inputs to the SOW generator should be, (2) the payments/EOR gap analysis for ACH / 1099 / EOR, (3) how the website communication should change for the trust additions (your A.1 question), (4) draft skeletons for the Master Service Agreement and the Scope of Work (your A.3 ask), (5) a single education-page IA in lieu of three playbook pages, (6) the role × engagement × compensation mapping, and (7) the engagement-type spec sheet — inputs, process, outputs, compensation requirements, payment requirements — which you correctly identified as the central gap.

I have grounded everything below in the actual code: `backend/src/sow/sow.service.ts`, `backend/src/contracts/contracts.service.ts`, `backend/src/payments/payments.service.ts`, `backend/src/ai/`, and the relevant `Prisma` models. Where I am recommending something the code does not do today, I say so explicitly.

---

## 1. Adapting the Tri-Party Model to BridgeScale

### 1.1 The Knex model in plain terms

Knex's structure has two layers:

- **Tri-Party Service Agreement (Master)** — signed once between the Platform, the Company, and the Operator. Fixed. Covers: scope-of-services framework, contractor relationship, payments mechanics & 10% fee, IP, conversion fee, non-solicitation/non-circumvention, confidentiality, term & termination, limitation of liability, case-study rights, governing law.
- **Scope of Work (Operating document)** — signed per engagement, attached as an addendum to the Master. Covers: project title, services & deliverables, term (start/end + minimum 90 days), termination notice, fees & hours cap, payment timing, reporting & communication cadence.

The key insight is that the Master *never changes per engagement* — that is what makes the cycle fast. The SOW *always changes* — that is where collaboration happens.

### 1.2 What BridgeScale has today (factual, from the repo)

From `backend/prisma/schema.prisma`:

- `StatementOfWork` — single document carrying scope, deliverables, timeline, weeklyHours, totalPriceUsd, nonCircumvention boolean, status. Has `promptVersion` and `modelName` fields, suggesting AI-generation was intended, but is not yet wired.
- `SowVersion` — versioning is in place. Good.
- `Contract` — one per SOW, tracks signature state for startup and operator. **Does not represent a master agreement; it represents the executed SOW.**
- `PaymentPlan` → `Invoice` → `PaymentEvent`.
- `Engagement` → `EngagementMilestone`.

In `contracts.service.ts` `generateSow()` — today this is a hardcoded template per `packageType` (`PIPELINE_SPRINT`, `BD_SPRINT`, `FRACTIONAL_RETAINER`). The `aiService` is injected but **not actually called** by `generateSow`. The schema's `promptVersion`/`modelName` fields are populated as `'sow_gen_v1.0'` but the AI pipeline is a stub.

**The gap, stated cleanly:** BridgeScale has the SOW layer. It does not yet have a Master Agreement layer. And the SOW layer is not actually AI-generated — it is template-substituted.

### 1.3 Recommended adaptation

Two changes. Neither requires a re-architecture; both fit into the existing Prisma model.

**Change 1 — Introduce a Master Service Agreement layer.**

A new model that represents a one-time, three-party agreement between BridgeScale, a specific Company, and a specific Operator. All future SOWs between that Company–Operator pair reference the same Master. New SOWs between the same Company and a *different* Operator require a *new* Master (because the conversion-fee, non-circ, and IP terms are operator-specific).

```prisma
model MasterServiceAgreement {
  id                    String   @id @default(cuid())
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
```

Then add `masterAgreementId String` to `StatementOfWork`. The SOW becomes the *addendum*; the MSA is the *parent*. UI changes: first engagement between a Company and Operator triggers the MSA + SOW signing flow. Subsequent engagements between the same pair only trigger SOW signing.

**Change 2 — Move signature/state tracking to the right layer.**

Today, `Contract` tracks signatures on the SOW. After this change:
- `MasterServiceAgreement` carries platform/startup/operator signature state (3 parties)
- `Contract` (rename: `SowExecution`) carries startup/operator signature state on the SOW itself (2 parties — platform doesn't need to sign each SOW, only the Master)

This matches Knex's mental model and removes the awkwardness of asking BridgeScale to "sign" every per-engagement SOW.

### 1.4 The flow, end-to-end, after the change

1. Match approved → Engagement intent confirmed by both parties.
2. **If no MSA exists for this Company–Operator pair** → MSA generated from a fixed template, three-party signature flow.
3. SOW generated (AI-drafted, human-reviewed — see §2), references MSA by ID.
4. SOW signed by Company and Operator.
5. Engagement starts; payments flow under the terms of the MSA, scoped by the SOW.

This is exactly Knex's flow, mapped onto your existing models with one new table and one renamed table.

---

## 2. AI-Generated SOW: What Inputs the LLM Should Receive

You asked specifically what we are giving to the LLM today. The honest answer is *nothing yet* — `contracts.service.ts` does not call the AI service for SOW generation; it returns a hardcoded template per package type. The `promptVersion` field on the SOW model is a placeholder for future use.

This is a feature, not a bug — it means we can design the prompt input schema cleanly before wiring it.

### 2.1 The input schema (proposed)

The LLM should receive a single structured JSON payload. Every field below either already lives in the database or is collected during diagnosis/matching, so this is data assembly, not new collection.

```jsonc
{
  "msa": {
    "platformFeePercent": 10,
    "conversionFeePercent": 25,
    "nonCircMonths": 12,
    "termNoticeDays": 30,
    "governingLaw": "India"
  },
  "company": {
    "legalName": "Acme Technologies Pvt. Ltd.",
    "stage": "SERIES_A",
    "industry": "B2B SaaS",
    "salesMotion": "OUTBOUND_SDR_LED",
    "targetMarkets": ["US", "UK"],
    "primaryContact": { "name": "...", "title": "Founder & CEO", "email": "..." },
    "currencyOfPayment": "USD"
  },
  "operator": {
    "legalName": "...",
    "lane": "SALES_EXECUTION",
    "tier": "SENIOR",
    "countryOfResidence": "US",
    "timeZone": "PT",
    "payoutCurrency": "USD",
    "payoutMethod": "ACH"
  },
  "engagement": {
    "packageType": "SPRINT",
    "proposedStartDate": "2026-05-15",
    "proposedEndDate": "2026-06-14",
    "minimumTermDays": 30,
    "weeklyHoursCap": 18,
    "overageHourlyRateUsd": 200,
    "totalFeeUsd": 5000,
    "paymentSchedule": "MONTHLY_IN_ADVANCE",
    "equityComponent": null
  },
  "diagnosis": {
    "primaryGap": "No qualified pipeline in US mid-market",
    "recommendedOutcome": "30 SQLs at $25k+ ACV in 6 weeks",
    "successMetrics": ["Qualified meetings booked", "SQL conversion rate", "Pipeline $ created"]
  },
  "match": {
    "matchScore": 0.87,
    "rationale": "Operator has 8 years of US SaaS sales experience selling $25k–$100k ACV; previously built outbound function at two YC-backed Indian SaaS companies expanding to US.",
    "relevantExperienceSnippets": ["...", "..."]
  },
  "buyerPreferences": {
    "specificDeliverablesRequested": ["Weekly pipeline call on Wednesdays", "Slack-based daily updates"],
    "reportingTool": "Slack",
    "communicationCadence": "Weekly + async daily"
  }
}
```

The LLM is *not* asked to invent terms. It is asked to:

- Write a 3–4 paragraph **scope** in plain English, grounded in the diagnosis and the operator's actual experience.
- Produce a **week-by-week deliverables** list calibrated to the package type and weekly hours.
- Suggest **success metrics** consistent with the diagnosis.
- Propose a **communication cadence** that matches buyerPreferences.
- Flag any **terms that look unusual** for a platform reviewer (e.g. weekly hours significantly above the cap for the package type, fee outside the standard band, unusual equity terms).

The LLM does **not** generate fees, payment schedule, or governance language — those come from the MSA + structured engagement input. This separation keeps the AI in the role of *describing the engagement*, not *setting commercial terms*.

### 2.2 The pipeline

```
[Match approved]
  → generateSowDraft({ structuredInput })
    → AI: produce scope/deliverables/metrics/cadence as JSON
    → Validate AI output against schema, flag anomalies
  → Save as SowVersion v1, status = AI_DRAFT
  → Platform Operator review (admin UI) — accept, edit, or regenerate
  → On accept → status = HUMAN_APPROVED
  → Send to Company + Operator → both review, can request edits
  → On both-party approval → status = SIGNED → Contract.fullySignedAt
```

This adds two intermediate states to the existing `SowStatus` enum (today: `DRAFT`, `APPROVED`): `AI_DRAFT` and `HUMAN_APPROVED`. Small enum change, no migration drama.

### 2.3 Why AI here is a real feature, not a gimmick

A new `Diagnosis` already exists per company. A new `MatchCandidate` already carries a rationale. The two together contain everything needed to write a SOW that is specific to *this* company, *this* operator, *this* gap. A template SOW that says "Structured 8-week outbound sales campaign targeting ICP-aligned prospects in designated diaspora markets" — which is what `contracts.service.ts:74` returns today — is generic. An AI-generated SOW grounded in the actual diagnosis and matching context is materially better. This is one of the cleanest demonstrations of why the AI step matters; surface it.

---

## 3. Payments / EOR — Gap Analysis (ACH, 1099s, EOR)

### 3.1 What exists in code today

| Capability | Where in code | State |
|---|---|---|
| Stripe integration (talent payouts, USD) | `payments.service.ts` (mocked), Stripe IDs in `Invoice.stripeId/stripeUrl` | Stub / dummy mode |
| Razorpay integration (company billing, INR) | `payments/razorpay.service.ts` | Real but minimal |
| Payment plan structure | `PaymentPlan` (totalAmountUsd, planType: CASH_SPRINT_FEE / MONTHLY_RETAINER / SUCCESS_FEE_ADDENDUM) | Built |
| Invoice lifecycle | `Invoice` (DRAFT → ISSUED → PAID / OVERDUE / CANCELLED) | Built |
| Idempotent webhook handler | `handleStripeWebhook()` | Built (basic) |
| `DUMMY_PAYMENT_MODE` for dev | env var | Working |

### 3.2 What does NOT exist today (the build list)

| # | Capability | Required for | Build effort |
|---|---|---|---|
| 1 | **ACH Direct Debit (US, company-side)** for paying the platform | US-incorporated companies paying USD invoices | Stripe ACH (microdeposits or Plaid Link). 2–3 weeks |
| 2 | **ACH payout (US, operator-side)** for paying the operator | All US-resident operators | Stripe Connect Express + bank link via Plaid. 2–4 weeks |
| 3 | **Payment splitting (multi-leg ledger)** | One charge that splits into operator payout + platform fee retention | Stripe Connect `application_fee_amount`. Schema change: split `Invoice` into `operatorPayoutUsd` + `platformFeeUsd`. 1 week |
| 4 | **Vendor / operator onboarding flow** | KYC, bank link, tax form collection — Knex calls this "vendor onboarding post contract execution" | New onboarding wizard tied to first MSA execution. New `OperatorTaxProfile` model. 2 weeks |
| 5 | **W-9 / W-8BEN collection** | Required before any USD payout | Form collection in onboarding wizard; encrypted at rest. 1 week |
| 6 | **1099-NEC issuance (annual)** | Required for US contractors >$600/year | Either Stripe Connect 1099 auto-issuance, or Track1099 / Tipalti integration. 2 weeks if Stripe Connect; 4+ weeks otherwise |
| 7 | **EOR integration** | Operators in countries where contractor payment is risky (employment misclassification, tax) | Pick one provider — Deel, Remote, Multiplier, Skuad, Oyster. API-level integration. 4–8 weeks per provider |
| 8 | **Currency model on PaymentPlan** | Operator payout currency ≠ company billing currency (Razorpay INR in, Stripe USD out) | Add `billingCurrency` and `payoutCurrency` to `PaymentPlan`. Add FX conversion ledger. 1 week schema, 2 weeks implementation |
| 9 | **ACH timing notification in invoice UI** | Knex SOW explicitly notes 5-business-day ACH lag — set buyer expectation | Copy + a "Funds clear in 3–5 business days" badge on ACH invoices. 0.5 week |
| 10 | **Conversion-fee invoice trigger** | When Company hires Operator full-time within 12 months, auto-issue 25%-of-salary invoice | New event type, admin trigger, new `InvoiceType` enum value. 1 week |
| 11 | **Non-circumvention monitoring (light)** | Detect off-platform engagement attempts | Out of scope for v1; flag for v2 |

### 3.3 Recommended sequencing

The right path is *not* to build all eleven before going live. The right path is:

**Phase 1 (must-have for cash engagements with US operators):** Items 4, 5, 8, 9, plus a Stripe Connect Express setup that covers items 1, 2, 3 simultaneously. Approximately 4–6 weeks of focused work. After this, you can actually run a cash engagement with a US-resident operator end-to-end through the platform.

**Phase 2 (compliance hygiene at scale):** Item 6 (1099 issuance) — required by January after the first US tax year in which you pay >$600 to any operator. Item 10 (conversion-fee invoicing).

**Phase 3 (selective, when the geography demands it):** Item 7 (EOR). Only worth integrating once you have committed operator volume in a specific country where contractor classification is risky. The category default is to pick **one** EOR partner per corridor — Deel for global breadth, Multiplier or Skuad for India-outbound, Remote for EU. EOR is expensive (~$300–500/operator/month). Charge it through, do not absorb it.

### 3.4 What to communicate now (before the build)

You can — and should — communicate the *intent* now, even before implementation:

> "BridgeScale handles cross-border invoicing, USD/INR collection, ACH payouts to operators, and US 1099-NEC tax forms at year-end. For corridors that require it, we work through verified Employer-of-Record partners. Operators do not need to invoice you separately. Companies pay one invoice; operators receive one payout."

This is what Knex says in their FAQ. It is a positioning statement. The buyer trusts it because the platform claims it. You then have a credibility window to actually build it. Don't waste the window.

---

## 4. Your A.1 Question — How to Change the Website Communication

To be specific about my A1 recommendation: **I am suggesting an addition, not a rewrite.** The current `for-companies/page.tsx` and `for-talent/page.tsx` are well-structured and the voice is right. What's missing is a section that addresses the structural-trust question that Knex addresses up-front.

### 4.1 Where to add it (no rewrites)

On `/for-companies`, today the page sequence is: Hero → Problem → How matching works → Results → Engagement types → FAQ → Guarantee → CTA.

Insert a new section **between "Engagement types" and "FAQ"** titled *"How an engagement is structured."* This is where buyers' commercial-comfort questions cluster, and it pre-empts the legal anxiety that today only gets addressed if they read the FAQ accordion.

On `/for-talent`, today the sequence is: Hero → Why → Vetting → How engagement works → Compensation → Roles → FAQ → CTA.

Insert the same section **between "Compensation" and "Roles"** titled *"How you'll engage and get paid."* Same content, audience-flipped.

### 4.2 What that section says (copy)

```
─── How an engagement is structured ────────────────────────────────

A two-document structure. Signed once, then per engagement.

01  Master Service Agreement
    Signed once between BridgeScale, your company, and the operator
    you've chosen. Covers payments, IP, conversion, confidentiality,
    and non-circumvention. Doesn't change per engagement.

02  Scope of Work (per engagement)
    A short, plain-English document covering scope, deliverables,
    timeline, fees, hours cap, and reporting cadence. AI-drafted from
    your diagnosis, reviewed by a BridgeScale operator, then agreed
    by you and the operator before signing.

What this means in practice:
  • One contract structure across every engagement. No bespoke
    legal review.
  • One payment flow. You pay BridgeScale; we pay the operator on
    the agreed cadence.
  • One point of accountability. If something goes wrong, the
    platform is on the hook.
  • Cross-border compliance, invoicing, ACH payouts, and 1099 forms
    handled — operators don't bill you separately.

  [ View sample Master Agreement ]   [ View sample SOW ]
─────────────────────────────────────────────────────────────────────
```

The two CTAs at the bottom open redacted samples (see §5 for drafts). This is a high-trust, low-effort addition — three paragraphs, two sample-document links.

### 4.3 What you do *not* change

- The hero, the engagement-type cards, the vetting narrative, the FAQ — all stay. The current copy is good.
- Nothing about the AI-diagnosis story changes here; that belongs in the "How matching works" section, where Step 01 should be renamed from "Define what you need" to "Define what you need · AI diagnosis" and have the AI step explicitly named in the description.

---

## 5. Master Service Agreement & Scope of Work — Draft Skeletons

These are *content drafts*, not legal documents. They need a cross-border employment lawyer to finalise (Indian Contract Act + the operator's jurisdiction). The point here is to show structure and language that a buyer can read in three minutes.

### 5.1 Master Service Agreement (BridgeScale Tri-Party) — Draft

```
─────────────────────────────────────────────────────────────────────
BRIDGESCALE MASTER SERVICE AGREEMENT
(Tri-Party Engagement Framework)

This Master Service Agreement ("Agreement") is entered into by:
  • BridgeScale, [Legal Entity, India] ("BridgeScale" or "Platform")
  • [Company Legal Name, Address] ("Company")
  • [Operator Legal Name, Country of Residence] ("Operator")
Effective on the date of acceptance by all three parties ("Effective
Date").

1. STRUCTURE OF SERVICES
Operator will provide commercial services to Company under one or
more Scopes of Work ("SOW"), each of which is an addendum to this
Agreement. BridgeScale facilitates matching, contracting, payments,
and compliance.

2. RELATIONSHIP
Operator is an independent contractor. Nothing in this Agreement
creates an employer-employee relationship between Operator and
Company or BridgeScale. Operator is responsible for tax filings in
their jurisdiction; BridgeScale will issue applicable tax forms
(e.g. 1099-NEC for US-resident Operators) annually.

3. PAYMENTS & PLATFORM FEE
3.1 Company pays all fees through BridgeScale.
3.2 Company pays BridgeScale a platform fee equal to ten percent
    (10%) of all amounts payable to Operator under any SOW under
    this Agreement. The platform fee is in addition to, and does
    not reduce, the Operator's stated fee.
3.3 BridgeScale will disburse Operator payouts via ACH (US),
    Wise/Stripe Connect (other corridors), or via a verified
    Employer-of-Record where applicable.
3.4 Standard ACH timing: 3–5 business days. Each SOW will note
    payment due dates accordingly.

4. INTELLECTUAL PROPERTY
4.1 Work Product created specifically for Company under any SOW
    becomes Company property upon full payment.
4.2 Operator retains rights to pre-existing frameworks, methods,
    and tools. ("Operator Tools").

5. FULL-TIME CONVERSION FEE
If Company directly hires Operator as a full-time employee within
twelve (12) months after the end of any SOW under this Agreement,
Company shall pay BridgeScale a conversion fee equal to twenty-five
percent (25%) of Operator's first-year annualised cash compensation,
within ninety (90) days of the start of such employment.

6. NON-SOLICITATION & NON-CIRCUMVENTION
6.1 During the term and for twelve (12) months thereafter, neither
    Company nor Operator will solicit BridgeScale's other
    customers, operators, or staff outside the Platform.
6.2 Company and Operator will not engage each other for paid work
    outside the Platform without BridgeScale's prior written
    consent. Violations entitle BridgeScale to the equivalent fees
    that would have been due.

7. CONFIDENTIALITY
Standard mutual confidentiality. Survives termination by three (3)
years.

8. TERM & TERMINATION
8.1 This Agreement remains in effect until terminated.
8.2 Any party may terminate this Agreement on thirty (30) days
    written notice to the other parties. SOW-level termination is
    governed by the relevant SOW.
8.3 Sections 4 (IP), 5 (Conversion Fee), 6 (Non-Solicitation),
    and 7 (Confidentiality) survive termination.

9. LIMITATION OF LIABILITY
Each Party's liability under this Agreement is limited to direct
damages, capped at the total fees paid under this Agreement in the
12 months preceding the claim. BridgeScale is not liable for the
acts or omissions of Company or Operator.

10. CASE STUDIES & LOGO USE
With Company's prior written consent, Operator may name Company in
case studies and marketing materials referring to the engagement.

11. GENERAL
Governing law: India. Disputes resolved in courts of [Bengaluru].
Amendments require written agreement of all three parties.

ACCEPTED:
[BridgeScale]   [Company]   [Operator]
─────────────────────────────────────────────────────────────────────
```

### 5.2 Scope of Work (Per-engagement Addendum) — Draft

```
─────────────────────────────────────────────────────────────────────
SCOPE OF WORK
(Addendum to Master Service Agreement dated [DATE])

Between BridgeScale, [Company], and [Operator].

1. ENGAGEMENT TITLE
[e.g. "Pipeline Sprint — US Mid-Market SaaS"]

2. PACKAGE TYPE
[ ] Consultation   [✓] Sprint   [ ] Retainer   [ ] Leadership

3. SCOPE OF SERVICES
[AI-drafted from diagnosis + match context, reviewed by BridgeScale,
agreed by both parties. Plain English. 3–4 paragraphs.]

4. DELIVERABLES
Week 1–2:  ICP mapping; outbound sequence design; CRM hygiene.
Week 3–6:  Outbound execution; weekly pipeline reports.
Week 7–8:  Handoff; final report with recommendations.

5. SUCCESS METRICS
• 30+ qualified meetings booked by week 8
• 8+ SQLs (criteria: $25k+ ACV, decision-maker engaged)
• Pipeline $ created: $750k+

6. TERM
Start: [DATE]    End: [DATE]    Minimum: 30 days

7. FEES & PAYMENT
Total fee:           USD 5,000  (Sprint, fixed-fee)
Hours cap:           18 hrs/week
Overage rate:        USD 200/hour, capped at 4 hrs/week, pre-approved
Payment schedule:    50% on signing, 50% on completion (Week 8)
Platform fee:        10% (paid by Company, in addition to above)
Payout method:       ACH to Operator (3–5 business days)

8. REPORTING & COMMUNICATION
Primary contact (Company):  [Name, Title, Email]
Cadence:                    Weekly call (Wednesdays, 30 min)
Async updates:              Daily Slack summary by 6pm PT
Reporting tool:             Slack #bridgescale-{company}

9. TERMINATION
Sprint runs to completion. Either party may terminate for material
breach with 7 days written notice. On termination, Operator is paid
for all services rendered to date.

10. SPECIAL TERMS
[Any one-off provisions — equity component, success fee modifier,
specific tool requirements, NDAs with Company customers, etc.]

ACCEPTED (electronic signature):
[Company]    [Operator]
(BridgeScale acknowledges this SOW under MSA #[ID])
─────────────────────────────────────────────────────────────────────
```

These are skeletons designed to be (a) shown publicly as samples, (b) used as the AI-drafting target output, (c) handed to legal counsel to finalise once the structure is locked.

---

## 6. Single Education / FAQ Page — Information Architecture

You said one consolidated page rather than three role playbooks. That is the right call for now — three pages risk thin content and dilute SEO authority. One deep page wins.

### 6.1 Recommended URL & title

`/learn` — *"Hiring fractional commercial talent for international growth."*

Alternative: `/how-it-works` if you want the page to also serve operational explanation.

### 6.2 Page outline (one page, six sections)

```
1. Hero
   "Most founders hiring international fractional talent are doing
    it for the first time. This page is the playbook."

2. When fractional makes sense (and when it doesn't)
   - Three scenarios where fractional is the right call
   - Three scenarios where it isn't (use a recruiter; hire full-time;
     don't hire at all)
   - One-line rule of thumb

3. The cost of a wrong full-time hire (calculator)
   - Inputs: senior salary band (₹), recruitment fee %, ramp months
   - Output: total wrong-hire cost in INR
   - CTA: "See how a fractional engagement de-risks this"
   - This is the single highest-leverage SEO asset; it earns
     backlinks because there is no Indian-context equivalent today.

4. Pick your engagement type (the four-box framework — see §7)
   - Consultation / Sprint / Retainer / Leadership
   - One sentence each, one example each, indicative price each

5. Roles, mapped to engagement types and compensation
   - The matrix from §7. This is the table buyers will screenshot
     and share internally.

6. FAQ (deep — replaces today's per-page FAQs)
   - How matching works (and the AI diagnosis step)
   - How the contracts work (Master + SOW; samples linked)
   - How payments work (ACH, INR-to-USD, 1099, when EOR)
   - Conversion to full-time (how, when, fee)
   - What happens if the match doesn't work (rematch terms)
   - Confidentiality, IP, non-circumvention — explained simply
```

The audience-specific FAQs on `/for-companies` and `/for-talent` get **shortened** to 4–5 of the highest-frequency questions per audience. Everything else moves to `/learn`. This avoids the "FAQ drift" problem where the same question gets answered slightly differently in two places.

### 6.3 What goes on the audience pages, what goes on /learn

| Content | /for-companies | /for-talent | /learn |
|---|---|---|---|
| Conversion-pitch hero | ✓ | ✓ | — |
| Matching flow | ✓ (4 steps) | ✓ (4 steps) | Detailed |
| Engagement types | ✓ (4-card grid) | — | Detailed with examples |
| Vetting | — | ✓ (3-stage) | Summary |
| Pricing / comp | ✓ (range) | ✓ (range) | Detailed bands by engagement |
| Tri-party + SOW explainer | ✓ (short) | ✓ (short) | Full + sample documents |
| FAQ | ✓ (5 audience-specific) | ✓ (5 audience-specific) | Comprehensive (~25 Qs) |
| Cost-of-wrong-hire calculator | — | — | ✓ (anchor section) |
| Role × engagement × comp matrix | — | — | ✓ |

This gives you one page that does the heavy lifting on SEO and trust, and lets the audience pages focus on conversion.

---

## 7. Role × Engagement Type × Compensation Mapping

You correctly identified that today's roles, engagement types, and compensation structures aren't explicitly mapped to each other on the site — and that this is what creates buyer confusion.

### 7.1 The matrix

This is the table that should sit on `/learn` and that internal teams should use as the source of truth.

| Role | Lane | Best fit engagement(s) | Typical compensation | Typical commitment |
|---|---|---|---|---|
| **Fractional VP Sales / CRO** | Sales Leadership | Leadership, Retainer | $8,000–$15,000/mo, optional equity (FAST) | 20+ hrs/wk, 6+ months |
| **Head of Sales (international)** | Sales Leadership | Leadership, Retainer | $7,000–$12,000/mo | 20+ hrs/wk, 6+ months |
| **Fractional BD / Partnerships Lead** | Partnerships & BD | Retainer, Sprint | $5,000–$10,000/mo or $5,000–$8,000 sprint | 15–20 hrs/wk |
| **Account Executive (AE)** | Sales Execution | Sprint, Retainer, Success-fee modifier | $4,000–$8,000/mo or success fee | 15–20 hrs/wk |
| **SDR / BDR (outbound)** | Sales Execution | Sprint, Retainer | $3,000–$5,000/mo or $3,000–$5,000 sprint | 15–20 hrs/wk |
| **Channel / Reseller Development** | Partnerships & BD | Sprint, Retainer | $5,000–$8,000/mo | 15–20 hrs/wk |
| **Alliance / Partnership Ops** | Partnerships & BD | Retainer | $4,000–$7,000/mo | 15 hrs/wk |
| **International Market Entry Lead** | Partnerships & BD or Sales Leadership | Sprint then Retainer | $5,000 sprint → $7,000–$10,000/mo | Phased |
| **Revenue Operations / Cadence** | Sales Execution | Sprint, Retainer | $3,500–$6,000/mo | 10–15 hrs/wk |
| **GTM Strategy / ICP Refinement** | Sales Leadership | Consultation, Sprint | $500–$1,500/session or $3,000–$5,000 sprint | One-off or 30 days |
| **Founder-led Sales Transition** | Sales Leadership | Retainer | $5,000–$8,000/mo | 15–20 hrs/wk |
| **Customer Success / Retention** | Sales Execution | Retainer | $4,000–$7,000/mo | 15 hrs/wk |

### 7.2 Compensation modifiers (independent of role)

These layer on top of the base structure:

| Modifier | Applies to | What it does |
|---|---|---|
| **Hybrid (cash + equity)** | Retainer, Leadership | Reduces cash retainer by 30–50%; adds documented equity grant via FAST template |
| **Success fee** | Sprint, Retainer | Adds outcome-tied bonus (deals closed, $ pipeline, partnerships activated). Documented in SOW §10. |
| **Overage** | All except Consultation | Pre-approved hourly rate (typically $150–$250) for hours over the cap |

### 7.3 The simplification this gives you

When a buyer comes in saying "I need an SDR for the US," you can route them in 30 seconds:

> SDR → Sales Execution lane → Sprint or Retainer → $3K–$5K/mo or fixed sprint → 15–20 hrs/wk → Stripe Connect ACH payout → 1099-NEC.

That clarity does not exist on the site today. It is the single biggest content fix.

---

## 8. Engagement-Type Spec Sheet — Inputs, Process, Outputs, Compensation, Payments

This is, I think, the most important section of this memo — it is the gap you correctly identified. Each engagement type below has exactly the same five rows, so they compare directly.

### 8.1 Consultation

| Row | Specification |
|---|---|
| **Inputs (to scope it)** | Company stage, target market, *one* specific question to answer; operator lane; mutual availability slot (60–90 min) |
| **Process** | (1) Buyer books a session via operator profile → (2) Operator confirms → (3) Pre-read shared async (1-page brief) → (4) Live session 60–90 min → (5) Async follow-up note within 24 hrs |
| **Outputs** | A 1–2 page memo with operator's recommendation, key risks, and next-step suggestion (sprint, full retainer, or "don't proceed") |
| **Compensation** | Fixed fee per session: $500–$1,500 depending on operator tier. Operator paid in full on session completion. |
| **Payments** | Charge upfront on booking (Stripe / Razorpay). Refunded if operator cancels. Platform fee (10%) deducted at payout. No 1099 implication unless operator total YTD >$600. |

### 8.2 Sprint

| Row | Specification |
|---|---|
| **Inputs (to scope it)** | Diagnosis output, target market(s), defined commercial outcome (e.g. "30 SQLs in 6 weeks"), ICP definition, available CRM/tool stack, operator availability for the window |
| **Process** | (1) MSA + SOW signed → (2) Week 1–2 setup (ICP, list, sequences) → (3) Week 3–6 execution → (4) Weekly pipeline calls + async updates → (5) Week 7–8 handoff + final report → (6) Closeout review |
| **Outputs** | Weekly pipeline reports; documented ICP; outbound sequence library; CRM hygiene; final report with metrics + recommendations; (typical) 30+ qualified meetings, 8+ SQLs |
| **Compensation** | Fixed fee, $2,500–$8,000 depending on lane and operator tier. Hours cap 15–20/wk; overage at pre-approved rate. Optional success-fee modifier in SOW §10. |
| **Payments** | 50% on SOW signing, 50% on Week 8 completion. Operator paid via ACH (US) or Wise (other corridors). Platform fee (10%) charged separately to Company. ACH 3–5 business day timing noted in SOW. |

### 8.3 Retainer

| Row | Specification |
|---|---|
| **Inputs (to scope it)** | Diagnosis output, ongoing commercial function to own (e.g. "outbound BD function for the GCC"), KPIs and reporting cadence, expected duration, budget band |
| **Process** | (1) MSA + SOW signed (90-day minimum) → (2) Month 1 onboarding + initial wins → (3) Monthly cadence: weekly call, async daily, monthly QBR → (4) Quarterly renewal review → (5) 30-day termination notice either side |
| **Outputs** | Monthly pipeline / activity reports; quarterly business review; ongoing CRM hygiene; documented playbooks; sustained pipeline contribution at agreed KPI |
| **Compensation** | Monthly retainer, $5,000–$10,000/mo. Hours cap 15–20/wk. Overage pre-approved. Hybrid cash+equity modifier supported (lower cash, FAST equity). |
| **Payments** | Invoice issued 5 business days before each month start; due on month start (per Knex SOW pattern). Operator paid first day of each month, ACH. Platform fee 10% charged separately. ACH timing buffer built into invoice cadence. |

### 8.4 Leadership

| Row | Specification |
|---|---|
| **Inputs (to scope it)** | Mandate (e.g. "Build US sales motion from zero to $1M ARR pipeline in 6 months"), authority scope (hiring, budget, partnerships), team to manage if any, stakeholder map, board reporting expectation |
| **Process** | (1) MSA + SOW signed (6-month minimum) → (2) Month 1 strategy + team assessment → (3) Months 2–6 execution: hiring, process design, pipeline building, board reporting → (4) Quarterly reviews with founder + board → (5) Path to full-time conversion explicitly tracked |
| **Outputs** | Documented sales strategy & operating cadence; hires made; team coached; pipeline built; board updates delivered; quarterly business reviews; conversion-readiness assessment |
| **Compensation** | $8,000–$15,000/mo cash. Hybrid strongly recommended (50–70% of cash + meaningful equity via FAST). Conversion fee on full-time hire: 25% of first-year salary, paid by Company to BridgeScale. |
| **Payments** | Monthly cadence, same as Retainer. Equity component documented as FAST grant addendum to SOW. Conversion-fee invoice triggered when full-time offer accepted; due within 90 days of start date. |

### 8.5 What this spec sheet enables

Two things that don't exist today:

1. **Operationally**: anyone on your team — onboarding, sales, ops, support — can answer "what should I do for this engagement type?" by reading the same single page. Today this knowledge is in scattered code (`contracts.service.ts`, `payments.service.ts`) and Notion (presumably).
2. **Externally**: the same spec sheet, lightly polished, becomes the `/learn` page's "Pick your engagement type" section. Buyers see exactly what they're committing to before they pay anything.

---

## 9. Open Decisions This Memo Surfaces

To move forward cleanly, I'd put these back to the founding team for explicit decisions:

1. **Conversion-fee number.** 25% is the category benchmark and is what's drafted into the MSA in §5.1. If you want a different number, decide before the MSA template gets reviewed by counsel.
2. **Currency stance.** Are operators always paid in USD regardless of residence, or in their local currency where ACH equivalents exist? This affects FX handling in `PaymentPlan` (gap item #8 in §3.2).
3. **EOR partner choice.** Which corridors actually need EOR? US-resident operators don't (1099 contractor is fine). UK and EU may, depending on the operator's local labour law. India-domiciled operators serving Indian companies definitely do. Pick the geographies first; pick the partner second.
4. **Conversion of 7-engagement-types to 4.** Are Hybrid and Success-fee modifiers (as I recommend in §7.2) or top-level types? Modifiers reduce cognitive load; top-level types preserve the "we offer 7" marketing claim.
5. **Master Agreement signing UX.** Do you require all three parties to sign within X days, or can the platform pre-sign and let the company + operator counter-sign asynchronously? The latter is faster and is what Knex effectively does.
6. **Education-page priority.** `/learn` is real work — calculator, matrix, full FAQ, sample documents — probably 2 weeks of focused content + design. Worth doing once vs. dripping out blog posts. Decide cadence.

---

## 10. Summary — What Changed From the First Memo

The first memo identified themes. This memo grounds them in code, drafts the documents, and produces the operational spec.

The three highest-leverage moves you can make in the next 60 days, given everything above:

1. **Ship the Master Service Agreement layer.** New Prisma model, two routes, a signing flow, and a redacted public sample. This unlocks the entire structural-trust narrative and is a 2-week sprint.
2. **Wire the AI service to actually generate SOWs**, with the input schema in §2.1 and the pipeline in §2.2. Today the code calls the service stub but uses hardcoded templates. This is the single most valuable AI surface on the platform — make it real.
3. **Ship the `/learn` page** with the §6.2 outline, the cost-of-wrong-hire calculator, the role × engagement matrix from §7.1, and the engagement-type spec sheet from §8. One page. High-trust. Long shelf-life.

Payments/EOR is on a longer build clock (4–6 weeks for Phase 1, see §3.3). Start the contract-and-content work now; let the payments work run in parallel.

---

*End of memo. Open decisions in §9 are the bottleneck — recommend the founding team resolve them in a single 60-minute working session before any of the implementation work begins.*
