# /learn page — copy + visual spec — v0 DRAFT

> **STATUS — SAMPLE ONLY. v0 DRAFT.**
> Founder approval required before this copy is moved to the website. Per the founder-approval workflow (Master Plan §7.4): drafts → founder approval → engineering → publish.
> Target route in the codebase: `frontend/src/app/learn/page.tsx` (new file).
> Six sections — designed to read top-to-bottom but each section is independently scannable.

---

## Page-level metadata

| Field | Value |
|---|---|
| Route | `/learn` |
| Page title | *Hiring fractional commercial talent for international growth — BridgeScale* |
| Meta description | *Most founders hiring fractional sales, BD, or RevOps talent are doing it for the first time. This is the playbook: when fractional makes sense, what it costs, how engagements are structured, and how to pick the right one.* |
| OG image | `/og/learn-cover.png` *(asset to be produced — title card with the headline)* |

---

## Visual conventions

The page uses the same scroll-reveal pattern, typography, and CSS variable system as the existing `/for-companies` and `/for-talent` pages. Section labels (eyebrow text) above each `h2`. Generous whitespace between sections. The wrong-hire-cost calculator (Section 3) is the only interactive element.

---

# Section 1 — Hero

**Eyebrow:** *The fractional hiring playbook*

**H1:**
> Most founders hiring fractional commercial talent are doing it for the first time. This page is the playbook.

**Sub-H1 (one paragraph):**
> Fractional sales leaders, BD operators, and RevOps specialists work differently from full-time hires. The engagement structures are different. The compensation models are different. The risks are different. Below: when fractional makes sense, when it doesn't, what it costs, and how to pick the right shape for your business.

**Hero CTAs:**
- Primary: *"I'm a company looking for talent →"* — links to `/for-companies/apply`
- Secondary: *"I'm a sales professional"* — links to `/for-talent/apply`

---

# Section 2 — When fractional makes sense (and when it doesn't)

**Eyebrow:** *Is fractional right for you?*

**H2:**
> Three scenarios where fractional is the right call. Three where it isn't.

**Layout:** Two-column. Left column: green-bordered cards. Right column: muted grey-bordered cards. Six cards total (3 + 3).

### When fractional makes sense

**Card 1 — "We need senior expertise but can't justify a full-time hire."**
> A full-time VP of Sales for international expansion costs ₹40–80 lakhs all-in in year one (salary + recruitment + ramp + tools). For most early-stage Indian startups, that's a one-shot bet. A Fractional Leadership Retainer costs a fraction, and lets you prove the motion before you commit to permanent headcount.

**Card 2 — "We need to enter a market where we have no team or relationships."**
> Your product works in India. The US, UK, EU, or APAC are different markets — different ICPs, different buying patterns, different relationships. Fractional diaspora talent who already operate in those markets give you commercial access and cultural fluency without you having to relocate or recruit local.

**Card 3 — "We have 30–60 days of work that needs senior judgement, not a full-time role."**
> ICP refinement, channel mapping, founder-led sales transition, GTM strategy reset — these are scoped projects with defined outputs, not ongoing functions. A fractional Sprint scopes the work, runs it, hands it off, and ends.

### When fractional is *not* the right call

**Card 4 — "We need full-time headcount today and have budget approved."**
> Don't use fractional to buy time. Use a recruiter. Fractional and full-time hiring solve different problems; if you've decided on full-time, decide cleanly.

**Card 5 — "The role is purely domestic, in our home market."**
> BridgeScale's operator pool is the Indian diaspora abroad. If you need a sales rep based in Bengaluru selling to Indian customers, that's a domestic hire. We'd point you to a domestic-focused recruiter.

**Card 6 — "We need someone in our office, 40 hours a week, under direct day-to-day management."**
> That's full-time employment, not fractional. Trying to manage a fractional engagement at 40 hours/week, with full operational control, creates the worst of both worlds: contractor-classification risk *and* employee-style overhead.

### One-line rule of thumb

> **If the role is "we need someone to do X for the next Y weeks/months and own the outcome," fractional fits. If the role is "we need a permanent member of our team," it doesn't.**

---

# Section 3 — The cost of a wrong full-time hire

**Eyebrow:** *Why fractional de-risks*

**H2:**
> A wrong full-time hire is a ₹40–80 lakh mistake. Here's the math.

**Sub-H2 paragraph:**
> A senior international sales hire at ₹35 lakh base salary doesn't cost ₹35 lakh. It costs much more, and most of that cost is paid before you know whether the hire was right. Try the calculator. If the answer is uncomfortable, fractional is the de-risked alternative.

**Visual:** Inline calculator widget, single column, clean form-style.

### Calculator inputs

| Input | Default | Type | Notes |
|---|---|---|---|
| Senior cash salary (year 1) | **₹35,00,000** | Slider, ₹15L–₹100L, ₹1L step | Founder direction: starting band reflects typical international-sales senior hire in India |
| Recruitment fee | **20%** | Slider, 0–35%, 1% step | Industry-standard contingent search range |
| Ramp time | **6 months** | Slider, 1–12 months, 1-month step | Default reflects typical international-market ramp |
| Monthly pipeline opportunity cost | **₹5,00,000** | Slider, ₹0–₹20L, ₹50K step | Pipeline that *would* have been built during ramp time, conservative estimate |
| Probability the hire is the wrong fit | **30%** | Slider, 10%–60%, 5% step | Industry data on first-year sales-leader-hire failure rates is in the 25–40% range; 30% is the midpoint |

### Calculator formula (engineering reference)

```
salary_paid_during_ramp     = senior_cash_salary × (ramp_time_months / 12)
recruitment_fee_paid        = senior_cash_salary × (recruitment_fee_percent / 100)
ramp_opportunity_cost       = monthly_pipeline_opportunity_cost × ramp_time_months
wrong_hire_cost_if_failed   = salary_paid_during_ramp + recruitment_fee_paid + ramp_opportunity_cost
expected_wrong_hire_cost    = wrong_hire_cost_if_failed × (probability_wrong_fit_percent / 100)

display_outputs:
  - wrong_hire_cost_if_failed       (₹, headline)
  - expected_wrong_hire_cost        (₹, sub-headline, "expected loss adjusted for probability")
  - breakdown:
      salary_paid_during_ramp
      recruitment_fee_paid
      ramp_opportunity_cost
```

### Calculator output (visual)

```
Headline (large):     ₹ XX,XX,XXX   ← "wrong_hire_cost_if_failed"
Caption:              if the hire doesn't work out

Sub-headline:         ₹ X,XX,XXX expected loss
Caption:              adjusted for the probability the hire is wrong

Breakdown table:
   Salary paid during ramp      ₹ XX,XX,XXX
   Recruitment fee              ₹ XX,XX,XXX
   Pipeline opportunity cost    ₹ XX,XX,XXX
                              ─────────────
   Total wrong-hire exposure    ₹ XX,XX,XXX
```

### CTA below calculator

> **A Fractional Leadership Retainer at USD 8,000–15,000/month tests the same motion at one-third the risk and lets you decide on a full-time hire after you've seen real commercial output.**
>
> *[Button] See engagement types →*  *(scrolls to Section 4)*

---

# Section 4 — Pick your engagement type

**Eyebrow:** *Engagement types*

**H2:**
> Three structural types. Retainer comes in two flavours — pick the one that fits the work.

**Sub-H2 paragraph:**
> BridgeScale offers three engagement structures. Two of them — Consultation and Sprint — are time-boxed; one is ongoing. The Retainer engagement type comes in two flavours depending on whether you need a senior leader embedded in your leadership rhythm, or a senior operator embedded in your operating rhythm.

**Layout:** Four cards in a grid. Each card has the same skeleton: name / one-line / who it's for / typical duration / typical hours / typical price band / compensation modes available / "best for" example.

### Card 1 — Consultation

> **Consultation**
> *A single paid 60–90 minute session with a vetted operator on a specific question.*
>
> **Who it's for:** Founders or commercial leaders who need senior judgement on one decision, not a full engagement.
> **Duration:** 60–90 minutes
> **Hours:** Single session
> **Indicative price:** USD 500–1,500 *[placeholder]*
> **Compensation:** Cash Only (most common). Equity Only (advisory).
>
> **Best for:** *"Validate our US ICP before we hire" / "Should we expand to the UAE or to Singapore first?" / "Pressure-test our channel strategy."*

### Card 2 — Sprint

> **Sprint**
> *Time-boxed, fixed-fee project. Defined deliverable, defined window.*
>
> **Who it's for:** Companies with a specific commercial outcome to produce in a defined window — pipeline built, market entered, channel mapped, CRM cleaned up.
> **Duration:** 30–60 days
> **Hours:** 15–20 hrs/week
> **Indicative price:** USD 2,500–8,000 fixed *[placeholder]*
> **Compensation:** Cash Only / Cash + Success Fee
>
> **Best for:** *"Build first 30 qualified meetings in the EU in 6 weeks" / "Map the partner landscape in North America" / "Refine our ICP and rebuild the outbound sequences."*

### Card 3 — Retainer (Leadership flavour)

> **Leadership Retainer**
> *Senior leader embedded in your leadership rhythm.*
>
> **Who it's for:** Companies that need a Fractional VP of Sales / CRO / Head of Sales to own commercial direction — strategy, board updates, team coaching, hiring, operating cadence.
> **Duration:** 60-day minimum; typical 6–12 months
> **Hours:** 20+ hrs/week
> **Indicative price:** USD 8,000–15,000/month *[placeholder]*
> **Compensation:** Cash Only / Cash + Equity / Cash + Equity + Success Fee
>
> **Best for:** *"Fractional CRO to set up our US sales motion from zero to first ARR" / "Fractional VP Sales while we hire permanently — including hiring our permanent VP."*

### Card 4 — Retainer (Operator flavour)

> **Operator Retainer**
> *Senior operator embedded in your operating rhythm.*
>
> **Who it's for:** Companies that need ongoing commercial execution — pipeline calls, daily outbound, weekly reporting, partner work — at a senior level, fractionally.
> **Duration:** 60-day minimum; typical 3–6 months
> **Hours:** 15–20 hrs/week
> **Indicative price:** USD 5,000–10,000/month *[placeholder]*
> **Compensation:** Cash Only / Cash + Success Fee. Cash + Equity occasionally.
>
> **Best for:** *"Embedded fractional BD lead for the GCC, 6 months" / "Fractional AE on our enterprise pipeline" / "Fractional RevOps installing our forecast cadence."*

### Below the four cards

> **Compensation modes apply across engagement types.** The most common is Cash Only. Cash + Success Fee adds outcome-tied bonuses for Sprint or Retainer engagements (whitelisted triggers: qualified meeting accepted, signed partner agreement, closed-won deal). Cash + Equity replaces a portion of cash with documented equity via the FAST framework. Equity Only is reserved for true advisory engagements, typically Consultations or low-touch Retainers.
>
> *[Link]* See the full role × engagement matrix below ↓

---

# Section 5 — Roles, engagement types, and indicative compensation

**Eyebrow:** *The matrix*

**H2:**
> Six role buckets. Three engagement types. What pairs with what.

**Sub-H2 paragraph:**
> BridgeScale's operator pool is grouped into six public role buckets. Each bucket maps to one or more engagement types and a typical compensation range. Use this matrix to figure out what shape you need before you start an engagement intake.

**Layout:** A two-part visual. Top: a 6-column horizontal strip showing the six role buckets with one-line descriptions. Bottom: a matrix table — rows are role buckets, columns are engagement types, cells show the indicative price band + most common compensation mode for that combination.

### The six role buckets

| Bucket | What's in it | When you'd hire one |
|---|---|---|
| **Sales Leadership** | VP Sales, VP Revenue, CRO, Head of Sales | "We need senior commercial leadership without committing to a full-time hire yet" |
| **Sales Advisors** | GTM Leaders, Founder-Led Sales Coaches, Revenue Advisors | "We need strategic input and judgement, typically as advisors with equity" |
| **Partnerships & BD** | BD Leads, Partnerships Leads, Channel Leads, Alliances, Market Access | "We need to build a partner / reseller / alliance pipeline" |
| **Sales Execution** | AEs, SDRs, BDRs, Outbound Operators | "We need pipeline created and deals closed at senior individual-contributor level" |
| **Sales Operations** | RevOps, Sales Ops, Sales Enablement & Solutions Consultants | "We need our sales process, CRM, forecast, training, and pre-sales cleaned up" |
| **Customer Success** | Customer Success Operators, Expansion Operators, Account Managers | "We need to retain customers and grow accounts" |

### The matrix

> *Cells show the indicative price band and the most common compensation mode. Greyed cells indicate the combination is not typically offered. All numbers are indicative — final pricing in your Pre-SOW Commercial Summary.*

| Role bucket ↓  /  Engagement type → | Consultation | Sprint | Leadership Retainer | Operator Retainer |
|---|---|---|---|---|
| **Sales Leadership** | $1,000–$1,500 / session<br>*Cash* | $5,000–$8,000 fixed<br>*Cash* | $8,000–$15,000/mo<br>*Cash + Equity* | — |
| **Sales Advisors** | $500–$1,500 / session<br>*Cash or Equity Only* | — | $4,000–$8,000/mo<br>*Cash + Equity* | — |
| **Partnerships & BD** | $750–$1,500 / session<br>*Cash* | $5,000–$10,000 fixed<br>*Cash + Success Fee* | $7,000–$10,000/mo<br>*Cash* | $5,000–$10,000/mo<br>*Cash + Success Fee* |
| **Sales Execution** | — | $2,500–$6,000 fixed<br>*Cash + Success Fee* | — | $3,000–$6,000/mo<br>*Cash + Success Fee* |
| **Sales Operations** | — | $2,500–$5,000 fixed<br>*Cash* | — | $3,500–$6,000/mo<br>*Cash* |
| **Customer Success** | — | $3,500–$6,000 fixed<br>*Cash* | — | $4,000–$7,000/mo<br>*Cash + Success Fee* |

*All USD bands are placeholders pending founder + finance lock. The ₹8,500 unlock fee and 10% platform fee apply across all paid engagements.*

### Below the matrix

> **Don't see your case?** Engagements that don't match a standard combination route to BridgeScale's deal-desk for a 5-business-day legal review. We tell you up-front whether we can support your engagement and at what shape.
>
> *[Button] Apply as a company →* — links to `/for-companies/apply`

---

# Section 6 — Frequently asked questions

**Eyebrow:** *Everything else*

**H2:**
> The detailed FAQ.

**Sub-H2 paragraph:**
> Audience-specific questions for companies and operators are on `/for-companies` and `/for-talent`. The questions below cover the cross-cutting topics: matching, contracts, payments, conversion to full-time, cancellation, IP, and corridor handling.

**Layout:** Accordion-style. Each question expands to its answer. Group headings split the FAQ into five sections.

### Group 1 — How matching works

**Q: How is BridgeScale's matching different from a job board?**
A: BridgeScale runs an AI-powered needs diagnosis on every Company intake before generating a shortlist. The diagnosis surfaces the commercial gap you actually have — not just the role title you typed in. Matches are then ranked against a pool of vetted operators, and the top candidates are reviewed by platform staff before you see them. You see four to seven blurred matches; pay the ₹8,500 unlock fee per shortlist; meet who you want, free, in 30-minute calls.

**Q: Why a 30-minute introductory call?**
A: It's the qualifying gate. The call is free to both parties (you've paid the unlock; the operator's friction is their time). It's also the input to the Pre-SOW Commercial Summary that locks the engagement shape before any contract is signed.

**Q: What is the AI diagnosis? Can I see it?**
A: Yes. After your intake, BridgeScale generates a written diagnosis covering your commercial situation, the gap we believe you have, and the recommended outcome shape (Sprint vs. Retainer vs. Leadership). You see the diagnosis before the matches; it's the input to the matching algorithm.

### Group 2 — Contracts

**Q: What documents does BridgeScale use?**
A: A Master Service Agreement signed once between BridgeScale, your company, and the operator — covers structural terms (payments, IP, conversion, non-circumvention, confidentiality). A Scope of Work signed per engagement — covers the work itself. A non-binding Pre-SOW Commercial Summary issued before the MSA, to confirm the commercial shape.

→ *See the full Contracts & Payments FAQ for detail. [Link]*

**Q: Why three documents instead of one?**
A: Because the structural terms (payments mechanics, conversion fee, non-circ) should be settled once and reused. Renegotiating those terms every engagement is expensive and creates ambiguity. The MSA fixes them; the SOW only captures what changes per engagement.

**Q: Do I sign a new MSA for every engagement?**
A: No. The MSA persists per Company–Operator pair. If you do a second engagement with the same operator, the existing MSA is reused; only a new SOW is signed.

### Group 3 — Payments

**Q: What does BridgeScale charge?**
A: A 10% platform fee on cash engagements, paid by the Company on top of the operator's stated rate. A one-time ₹8,500 unlock fee per match shortlist. A one-time USD 50 operator activation fee, paid by the operator. Where Employer-of-Record applies, the EOR partner's monthly fee is charged through to the Company at cost.

**Q: How do operators get paid?**
A: Through BridgeScale. ACH for US-resident operators; Wise for cross-border; INR direct via Wise or Razorpay for diaspora operators wanting payout to an Indian bank account; through an Employer-of-Record partner where required. Standard payout timing is 3–5 business days after invoice payment.

**Q: When does Employer-of-Record apply?**
A: When the operator's residence country and the engagement's duration / hours / nature create employment-classification risk. Long Retainer engagements in Germany / France / Netherlands / Spain / Ireland / Portugal / Italy typically trigger EOR; most US, UK, Canada, India, UAE, Singapore, and Australia engagements do not. The decision is made by BridgeScale at MSA generation. Day-1 partners: Deel, Remote, Multiplier.

**Q: What about Indian operators based abroad who want INR payouts?**
A: Supported. BridgeScale's US Stripe entity pays USD; Wise converts to INR and deposits to your Indian bank account (typically NRE for non-resident Indians). For Indian-resident operators working remotely for international clients, Razorpay handles INR-direct payouts (with GST + TDS handled per Indian Income Tax rules).

### Group 4 — Conversion to full-time

**Q: Can a fractional engagement become full-time?**
A: Yes — many do. A fractional engagement is the best audition process that exists. If you decide to hire the operator full-time within 12 months of the SOW ending, the Company pays BridgeScale a 25% conversion fee on the operator's first-year cash compensation. It's invoiced within 90 days of the operator's start date and due within 30 days of invoice.

**Q: Does the conversion fee come out of the operator's salary?**
A: No. It's a Company → BridgeScale fee. It does not come out of the operator's salary or any future operator payouts.

**Q: What if I want to hire the operator outside BridgeScale during or just after the engagement?**
A: That's not allowed under the MSA's non-circumvention clause for 12 months after the engagement ends. Run all engagements with the operator through the platform; convert to full-time through the platform.

### Group 5 — Cancellation, IP, and edge cases

**Q: What if the match doesn't work out?**
A: BridgeScale offers a satisfaction guarantee — we'll re-match you with a new operator at no additional unlock fee. The guarantee applies within the first 4 weeks of an engagement (locked window per the cancellation policy).

**Q: What's the cancellation policy for a 30-minute introductory call?**
A: For paid Consultations: full refund if the operator cancels with 24+ hours' notice; 90% refund if the company cancels with 24+ hours' notice; 50% refund if the company cancels within 24 hours; no refund for company no-show. The first late-cancel by an operator is waived without penalty.

**Q: Who owns the work the operator produces?**
A: Your company — once the operator has been paid in full for the engagement. Pre-existing tools and frameworks the operator brings to the engagement remain theirs; the Company gets a non-exclusive licence to use them as part of the Work Product.

**Q: What if my engagement doesn't fit any of these standard combinations?**
A: It routes to BridgeScale's deal-desk for legal review. We aim for a 5-business-day turnaround. If we can't support the engagement at standard structure, we'll tell you and either propose an alternative shape or decline cleanly.

**Q: What if BridgeScale's standard combinations don't yet cover my operator's country?**
A: BridgeScale is launching with Tier 1 corridors (US, UK, Canada, India, UAE, Singapore, Australia) supported automatically. Tier 2 corridors (Germany, France, Netherlands, Spain, Ireland, Italy, Portugal, New Zealand) are supported with platform-ops review and EOR partner involvement. Other countries route to deal-desk for a corridor-specific review before MSA generation.

---

## Footer CTA strip

```
              Want to start an engagement?
        I'm a company looking for talent →
            I'm a sales professional →
```

---

## Visual & engineering notes for implementation

- **Existing visual system** — pages live at `/learn` reuse the typography, color tokens, and scroll-reveal pattern of `/for-companies` and `/for-talent`. New components: `LearnHero`, `WhenFractionalCards`, `WrongHireCostCalculator`, `EngagementTypeCards`, `RoleEngagementMatrix`, `LearnFAQ`. All in `frontend/src/app/learn/` or factored into `frontend/src/components/learn/` if reused elsewhere.
- **Calculator state** — local React state, no backend call. Sliders update on every change; outputs recalc in real time. Format INR with the `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })` formatter.
- **Matrix rendering** — straightforward HTML table styled with CSS Grid for responsive collapse on mobile (each row becomes a card on screens <768px).
- **FAQ accordion** — reuse the existing `FaqSection` component from `frontend/src/components/FaqSection.tsx`, extended to support links inside answers (e.g., the "[Link]" reference in the Contracts group).
- **Anchor links** — Section 4 CTA scrolls to Section 4; Section 4 closing CTA scrolls to Section 5; matrix CTA links out to `/for-companies/apply`.
- **Mobile considerations** — the four engagement-type cards stack to a single column on mobile; the role-engagement matrix scrolls horizontally.
- **Performance** — lazy-load below-fold sections; calculator is interactive but lightweight.

---

## DRAFTER NOTES — REMOVE BEFORE PUBLICATION

- **All ₹ and USD figures are placeholders.** Calculator defaults reflect founder direction at the time of drafting; final values pending founder + finance lock. The instruction to engineering is to ship with placeholders that are visibly editable in code, so they can be swapped at publication time without component changes.
- **Calculator probability of wrong fit** — 30% default is industry-data-informed. Founder may want to adjust higher or lower; counsel may want a citation source.
- **Six role buckets** — names locked per Decision Register A4 / I8: Sales Leadership / Sales Advisors / Partnerships & BD / Sales Execution / Sales Operations / Customer Success. Internal 22-role enum unaffected.
- **Engagement-type cards** — four cards because Retainer splits into two flavours; this is by design (per founder edits to the master plan §2.5).
- **The matrix** — placeholder bands. Each cell corresponds to a row in the Combinations sheet of the Operating Matrix workbook; engineering should consider whether the matrix renders from the same data source the matching engine reads (per Decision Register B8).
- **Wrong-hire cost framing** — the ₹40–80 lakh range used in section copy is a rough founder-direction band; the calculator produces the precise number. Counsel: confirm the framing doesn't make a representation BridgeScale can be held to.
- **FAQ overlap with `/for-companies` and `/for-talent`** — the audience pages should be shortened to 4–5 audience-specific questions each; the heavyweight cross-cutting questions live here. Per Decision Register P0.10.
- **CTA hierarchy** — primary CTA on hero is "I'm a company"; secondary is "I'm a sales professional". Mirrors `/for-companies` and `/for-talent` conventions. Founder may want both at equal weight; flagged for review.
- **Sample-document links inside Group 2 FAQ** — paths to `/Docs/legal-drafts/...` are placeholders; final URLs depend on Phase 4 hosting.
- **Tone** — direct, structural, no marketing fluff. Matches existing site voice.
- **Mobile-first matrix** — engineering: at <768px, render as cards rather than a matrix table.
- **OG image** — needs design produced as part of P4.7.
- **A/B testing** — the calculator is a candidate for A/B test once traffic exists (e.g., probability default 30% vs 25% vs 35%). Out of scope for v0.
- **Localisation** — at launch in English only. Translation strategy deferred.
- **Content versioning** — once approved and published, every numeric value in the calculator and the matrix should be sourced from a single config file in the repo (e.g., `frontend/src/content/learn-config.ts`) so updates are one-line.

---

*End of /learn page copy v0 DRAFT.*
