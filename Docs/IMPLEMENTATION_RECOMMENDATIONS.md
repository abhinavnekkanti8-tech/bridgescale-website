# Implementation Recommendations — All 14 Changes (v2 — Updated)

This is the revised plan incorporating your feedback and decisions. No code written — this is for your final review.

**Changes from v1:** Full forms (not simplified), assessment before payment for talent, Razorpay with UPI for Indian companies (INR display), Stripe for talent (USD), blurred preview on dashboard, matching algorithm audit results, trend research data.

---

## Table of Contents

1. [The Database — Plain English Recap](#the-database)
2. [Matching Algorithm Audit — What's Already Built](#matching-algorithm-audit)
3. [Trend Research — AI + Fractional Talent Thesis](#trend-research)
4. [New Onboarding Flow — Final Design](#new-onboarding-flow)
5. [FAQ — What to Keep, Where, How](#faq-recommendations)
6. [All 14 Changes — Item by Item](#all-14-changes)
7. [Resolved Questions](#resolved-questions)
8. [Implementation Order](#implementation-order)

---

## The Database

**PostgreSQL** — a proper relational SQL database. Not Airtable, not Google Sheets, not MySQL, not JSON files. Same engine used by Instagram, Shopify, Notion.

Data is stored in structured tables with rows and columns (SQL):

```
Table: applications
┌─────────┬────────┬────────────┬───────────┬──────────────────┐
│   id    │  type  │   email    │  status   │    needArea      │
├─────────┼────────┼────────────┼───────────┼──────────────────┤
│ uuid-1  │COMPANY │ ravi@x.com │ SUBMITTED │ Pipeline gen...  │
│ uuid-2  │TALENT  │ priya@y.com│ APPROVED  │ null             │
└─────────┴────────┴────────────┴───────────┴──────────────────┘
```

You can browse it visually: run `npm run prisma:studio` in the `backend/` folder — it opens a spreadsheet-like web UI for every table.

---

## Matching Algorithm Audit

**Status: FULLY IMPLEMENTED — real production logic, not stubs.**

The matching service (`backend/src/matching/matching.service.ts`) has a working 7-component scoring algorithm:

```
Match Score Breakdown (max 100 points)
──────────────────────────────────────
Lane alignment         max 20    → Matches startup's sales motion to operator's service lanes
Region overlap         max 15    → Compares target markets (EU, US, UK, etc.)
Budget fit             max 15    → Evaluates budget band compatibility
Experience relevance   max 15    → Based on operator's years of experience
Availability match     max 10    → Confirms time commitment
Tier bonus             max 15    → Rewards verified Tier A/B/C operators
Motion fit             max 10    → GTM motion alignment
```

**Shortlist generation logic:**
1. Loads all `VERIFIED` operators from the database
2. Scores every operator against the startup's profile
3. Hard filter: removes candidates with zero lane alignment
4. Selection rules: top 5 matches, at least 2 Tier A if available, plus 1 "adjacent fit" for diversity
5. Creates scored candidates with auto-generated explanations, risk assessments, and package recommendations
6. Stores everything in the `MatchShortlist` + `MatchCandidate` tables

**What this means for blurred previews:**
- The algorithm CAN run internally on free-tier users — it just needs a startup profile and verified operators in the database
- We can show blurred results (match score, anonymised titles, region indicators) without revealing identity or contact details
- After payment, the same shortlist is "unlocked" — no need to re-run the algorithm

**What the algorithm needs as input (from the company form):**
- `targetMarkets` (required — used for region overlap scoring)
- `salesMotion` (used for lane alignment and motion fit)
- `budgetBand` (used for budget fit scoring)
- `industry` and `stage` (used for package recommendation)

This confirms your instinct: **collect the full form data upfront** so the algorithm has everything it needs to run internally before payment.

---

## Trend Research — AI + Fractional Talent Thesis

### Your thesis: "AI is democratizing product development, so demand for fractional sales talent will increase."

**Verdict: The data strongly supports this.**

### The Build Side — AI Is Lowering the Bar

- **70,717 AI startups** worldwide as of 2024 — the barrier to building has never been lower
- "Vibe coding" (natural-language → AI-generated code) allows people without formal engineering training to ship functional products
- McKinsey: AI-enabled product development is accelerating cycles from months to weeks
- Deloitte: AI can compress physical product innovation timelines significantly
- **Result: More products hitting the market, faster, from smaller teams**

### The Sell Side — The Bottleneck Is Shifting

- Bain & Company (2025): **"AI is transforming productivity, but sales remains a new frontier"** — engineering productivity has surged with AI, but sales processes remain fragmented and human-dependent
- Rich Mironov (product strategist): An order-of-magnitude acceleration in development shifts attention toward **"market expertise, aggressive discovery, and taste"** — the commercial side becomes the differentiator
- ICONIQ Growth (State of GTM 2025): Go-to-market remains the bottleneck even as product cycles compress
- Columbia Business School: AI is transforming sales strategies, but human relationships and market fluency remain irreplaceable for complex B2B deals

### Fractional Hiring — The Numbers

| Metric | Data |
|--------|------|
| Global fractional executive market | **$9.4 billion** (2025), projected **$24.7 billion** by 2034 (11.3% CAGR) |
| Fractional professionals (global) | 500,000+ in 2024, **doubled in two years** |
| LinkedIn profiles mentioning "fractional" | 2,000 in 2022 → **110,000 in early 2024** (5,400% increase) |
| Fractional sales leaders (US/Canada) | 5,000 in 2020 → **9,000 in 2024** (80% increase) |
| CMO Survey: full-time share of sales/marketing workforce | Declined from **82.5% (2019) to 77.9% (2025)** |
| Gartner prediction | By 2027, **30%+ of midsize enterprises** will have at least one fractional executive |
| US independent workers | **72 million Americans** performing independent work (2026) |

### How to Use This on the Website

This data supports a powerful marketing message. Suggested section for the home page or for-companies page:

> **Why now: The build-to-sell gap is widening.**
>
> AI has made it possible to build world-class products with small teams. But selling into international markets still requires experienced humans with existing networks, market fluency, and credibility.
>
> The bottleneck has shifted from engineering to commercial execution. The fractional sales market has grown from $5.7B to $9.4B in two years — because companies need senior sales talent without the overhead of full-time hires.
>
> BridgeScale exists at this intersection: connecting Indian companies that can build anything with diaspora talent who can sell it anywhere.

**Data sources:**
- [Bain & Company — AI & Sales (2025)](https://www.bain.com/insights/ai-transforming-productivity-sales-remains-new-frontier-technology-report-2025/)
- [Fractionus — Fractional Work Statistics 2025](https://fractionus.com/blog/fractional-work-statistics-2025-income-market-data)
- [ColumnContent — 100+ Fractional Trends 2026](https://columncontent.com/fractional-work-statistics/)
- [ICONIQ — State of GTM 2025](https://www.iconiq.com/growth/reports/state-of-go-to-market-2025)
- [Dataintelo — Fractional Executive Market Report](https://dataintelo.com/report/fractional-executiveplace-market)
- [Strategic HR Inc — Fractional Talent 2026](https://strategichrinc.com/fractional-talent-workforce/)

---

## New Onboarding Flow — Final Design

### Your Decisions (confirmed)

| Decision | Your Answer |
|----------|-------------|
| Simplified forms? | **No — keep full forms.** Collect all data needed for the matching algorithm. |
| Talent assessment timing? | **Assessment BEFORE payment.** Talent completes profile + assessment freely → pays $50 to enter matching pool. |
| Payment providers? | **Razorpay (with UPI) for Indian companies** (display in ₹), **Stripe for talent** (display in $USD). |
| Dashboard teaser? | **Option B — blurred preview** of potential matches. |
| Dashboard paywall? | Matching details locked behind payment. Internal matching runs freely. |
| Auto-login? | **Yes** — instant login after signup. |
| Human reviewer? | **Not involved until premium is paid.** AI verification/summarization runs automatically. |

### Final Flow

```
COMPANY FLOW
────────────
1. Fill FULL form (all current fields: contact, company, need area, target markets,
   budget, urgency, engagement model, optional diagnosis section)
   → Password created during signup (new field added to form)
   → Account created immediately (SUBMITTED status)
   → Auto-logged-in → lands on /startup/dashboard
   → AI lightweight summary of their needs generated in background

2. Matching algorithm runs internally in background
   → Scores all verified operators against this company's profile
   → Generates ranked shortlist (stored but NOT revealed)

3. Company sees on their dashboard:
   ┌──────────────────────────────────────────────────────┐
   │  Your top matches                                    │
   │                                                      │
   │  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
   │  │ ██████░░ │  │ ██████░░ │  │ ██████░░ │          │
   │  │ Score:87 │  │ Score:82 │  │ Score:75 │          │
   │  │ EU │ SaaS│  │ US │ BD  │  │ UK │Sale│          │
   │  │ 12yr exp │  │ 8yr exp  │  │ 15yr exp │          │
   │  │ ████████ │  │ ████████ │  │ ████████ │          │
   │  │ [LOCKED] │  │ [LOCKED] │  │ [LOCKED] │          │
   │  └──────────┘  └──────────┘  └──────────┘          │
   │                                                      │
   │  🔒 Unlock matching — ₹8,500 ($100) one-time        │
   │     [Pay with UPI / Card / Net Banking]              │
   └──────────────────────────────────────────────────────┘

4. Company pays ₹8,500 (~$100) via Razorpay (UPI, cards, net banking)
   → Shortlist revealed (names, profiles, full match explanations)
   → Full AI diagnosis runs
   → Discovery calls, contracts, engagements unlock
   → Human review may begin (admin notified)


TALENT FLOW
───────────
1. Fill form — Steps 2 (References) and 3 (Assessment) are SKIPPABLE:
   Step 0: Profile (name, email, LinkedIn, role, experience, category) — REQUIRED
   Step 1: Track record (deal history, market confidence, languages) — REQUIRED
   Step 2: References (at least 2 professional references) — SKIPPABLE ("Skip for now")
   Step 3: Assessment (case study response, availability, rates, structures) — SKIPPABLE ("Skip for now")
   → Password created during signup (new field added to form)
   → Account created after Step 0 minimum (SUBMITTED status)
   → Auto-logged-in → lands on /operator/dashboard
   → If assessment was provided, AI pre-screen runs in background

2. Talent sees on their dashboard:
   ┌──────────────────────────────────────────────────────┐
   │  Your profile completion                             │
   │                                                      │
   │  ✅ Profile basics — complete                        │
   │  ✅ Track record — complete                          │
   │  ⬜ References — required before payment             │
   │  ⬜ Assessment — required before payment             │
   │                                                      │
   │  ─────────────────────────────────────────────       │
   │                                                      │
   │  Companies looking for talent like you               │
   │                                                      │
   │  ┌──────────┐  ┌──────────┐                         │
   │  │ ██████░░ │  │ ██████░░ │                         │
   │  │ SaaS     │  │ FinTech  │                         │
   │  │ EU entry │  │ US expan.│                         │
   │  │ Sprint   │  │ Retainer │                         │
   │  │ ████████ │  │ ████████ │                         │
   │  │ [LOCKED] │  │ [LOCKED] │                         │
   │  └──────────┘  └──────────┘                         │
   │                                                      │
   │  🔒 Unlock matching — $50 one-time                   │
   │     [Pay with Card]  ← DISABLED until refs +         │
   │                        assessment complete            │
   └──────────────────────────────────────────────────────┘

3. Talent completes references + assessment from dashboard
   → "Complete references" and "Complete assessment" forms on dashboard
   → Once both are done, "Unlock matching" payment button enables
   → AI pre-screen runs after assessment is submitted

4. Talent pays $50 via Stripe
   → Profile enters the active matching pool
   → Full pre-screen result becomes visible to admins
   → Matched with companies, receives invitations
```

### Why Full Forms + Assessment Before Payment

| Decision | Reasoning |
|----------|-----------|
| **Full company form** | The matching algorithm needs `targetMarkets`, `salesMotion`, `budgetBand`, `industry`, `stage` to score properly. Collecting all upfront = instant internal matching. |
| **Full talent form with skippable assessment** | Assessment quality directly determines match quality. Steps 2 (References) and 3 (Assessment) are skippable during signup — the account is created after Step 0. But both MUST be completed before payment is allowed. This lowers friction at signup while ensuring quality before entering the matching pool. Payment becomes a "join the pool" fee. |
| **Internal matching before payment** | The algorithm runs on free-tier data. Blurred previews show real scores and metadata — this is the teaser that drives conversions. |
| **No human reviewer until payment** | Keeps cost low at scale. AI does the initial scoring/screening. Human review triggers only after payment (where the user has demonstrated real intent). |

### Dual Currency Display

| User Type | Payment Provider | Display Currency | Internal Amount | UPI Support |
|-----------|-----------------|------------------|-----------------|-------------|
| Company (Indian) | **Razorpay** | **₹8,500** (~$100) | 850000 paisa | **Yes** — UPI, cards, net banking, wallets |
| Talent (diaspora) | **Stripe** | **$50 USD** | 5000 cents | No (international) |

Razorpay natively supports UPI as a payment method — no additional integration needed. When the Razorpay modal opens, it shows UPI, debit/credit cards, net banking, and wallets by default.

The company form will show `₹8,500` as the price. The talent form will show `$50`. Both are stored internally in minor units.

### Blurred Preview Design

The blurred preview cards will show **real data** from the matching algorithm (not fake placeholders):

**What's visible (free tier):**
- Match score (e.g. "87/100")
- Region indicator (e.g. "EU", "US", "UK")
- Service lane (e.g. "Pipeline Sprint", "BD Sprint")
- Years of experience (e.g. "12+ years")
- Number of matches found (e.g. "3 matches")

**What's blurred/hidden (unlocked after payment):**
- Name and photo
- Company/employer
- LinkedIn URL
- Full match explanation and risk assessment
- Contact details
- Detailed profile

This uses real data from the `MatchCandidate` table but strips PII. The blur effect is CSS (`filter: blur(8px)` on text, locked icon overlay).

### What Changes in the Backend

| Area | Current | New |
|------|---------|-----|
| Application creation | Creates app with `PENDING_PAYMENT` | Creates app + user + org with `SUBMITTED` status (free) |
| Account creation | After payment confirmation | Immediately on form submit |
| Login | Magic link sent after payment | Auto-login via session cookie in the same response |
| Matching (internal) | Triggered by admin after approval | Runs automatically in background after signup (company only) |
| Matching (revealed) | Shown immediately after generation | Shown only after payment |
| AI diagnosis (company) | After payment | Lightweight summary on signup; full diagnosis after payment |
| AI pre-screen (talent) | After payment | Runs when assessment is submitted (from signup or dashboard); full results shown after payment |
| Payment (company) | Razorpay ₹15,000 at signup | Razorpay ₹8,500 from dashboard (unlock matching) |
| Payment (talent) | Stripe $50 at signup | Stripe $50 from dashboard (join matching pool) |

### Analytics Funnel

```
Free signups with full data (total interest + quality signal)
  └─ Dashboard visits (engagement)
      └─ Blurred preview views (intent — "they looked at matches")
          └─ Payment conversions (commitment)
              └─ Active engagements (retention)
```

---

## FAQ Recommendations

### Source Analysis

Your research file (`ReasearchInfo_Activated.md`) has content from Activated Scale — a US competitor. The content has been adapted for BridgeScale's diaspora-first, cross-border, AI-assisted model. A full draft of all FAQ copy is in **`FAQ_DRAFT.md`** — review it separately.

**Key differences from Activated Scale:**
- Diaspora positioning (not US-domestic)
- AI-powered matching (not manual matching)
- Platform-managed governance (not just marketplace)
- Free signup + paywall model (not upfront fee)
- Cross-border compliance handled (EOR, payments)

### Summary

- **Companies:** 8 FAQs (5 adapted from research + 3 new)
- **Talent:** 7 FAQs (all new — the research file didn't cover talent)
- **Placement:** After the last content section, before the final CTA
- **Design:** Accordion/collapsible, all closed by default

See `FAQ_DRAFT.md` for the full copy to review.

---

## All 14 Changes — Item by Item

### #1 + #15 — Free Signup + Paywalled Services

**Status:** Covered in "New Onboarding Flow" above. Full forms, assessment before payment, blurred previews, dual currency (INR for companies, USD for talent).

---

### #2 — Darken the Font

**Current:**
```css
--color-text-primary:   #0f0f0f  /* almost black — fine */
--color-text-secondary: #706b65  /* warm gray — TOO LIGHT */
--color-text-muted:     #9e9890  /* light gray — TOO LIGHT */
```

**Fix:**
```css
--color-text-secondary: #706b65 → #4a4540  (noticeably darker, still warm-toned)
--color-text-muted:     #9e9890 → #7a756f  (readable instead of faded)
```
Also audit for any font-weight: 300 usage and bump to 400.

---

### #4 — Add FAQ Sections

Full copy in `FAQ_DRAFT.md`. Accordion component + content on both `/for-companies` and `/for-talent` pages.

---

### #5 — Map Signup Buttons on Login Page

```
Current:  "Apply as Startup" → /startup/apply (404)
          "Join as Operator" → /operator/apply (404)

Fix:      "Sign up as a Company" → /for-companies/apply
          "Sign up as Talent"    → /for-talent/apply
```

---

### #6 — "Other" in What You Need → Show Text Box

When "Other" radio is selected → show textarea: `"Describe what you need"`. Store in `needAreaOther` field.

---

### #7 — Normalise Pricing

| Location | Current | New |
|----------|---------|-----|
| Company apply form — fee card | ₹15,000 | **Free** |
| Company apply form — steps | "Pay ₹15,000" | Remove payment step |
| Company apply form — submit button | "Submit — proceed to payment" | **"Create your free account →"** |
| Company apply form — budget bands | ₹5L–₹10L, etc. | $2,000–$5,000 / $5,000–$10,000 / $10,000–$25,000 / $25,000+ |
| For-companies page — bottom CTA | "$200 one-time activation fee" | **"Sign up free. Unlock matching for ₹8,500."** |
| Talent apply form — fee card | $50 | **Free** |
| Talent apply form — submit note | "pay the $50 fee" | Remove |

---

### #8 — "Rest of World" → Show Text Box

When "Rest of World" chip is selected → show text input: `"Which countries or regions?"`. Store in `targetMarketsRoWDetail`.

---

### #9 — Change Tone of "Anything else we should know?"

**New:** Label = **"Additional context"**, placeholder = **"Anything specific about your market, product, or timeline that would help us find the right match..."**

---

### #10 — "Expansion" → "Scaling"

Context-aware replacement across all frontend files. `"international expansion"` → `"international scaling"`, `"market expansion"` → `"market scaling"`, etc.

---

### #11 — Disable Submit Until Mandatory Fields Complete

Both forms: submit/continue button is `disabled` (greyed out) until all required fields for the current step are filled. Enables reactively as fields are completed.

---

### #12 — Talent "Continue" → All 4 Steps Remain (with Skip)

**Updated from v1 + v2:** All 4 steps stay in the signup form. Steps 2 (References) and 3 (Assessment) are **skippable** with a "Skip for now →" link. The account is created after the user completes at least Step 0 (Profile). Skipped steps must be completed from the dashboard before the $50 payment is allowed. The matching algorithm only reveals results after payment.

Flow: Signup (Steps 0-1 required, 2-3 skippable) → Account created → Dashboard shows completion checklist → Complete refs + assessment from dashboard → Pay $50 → Enter matching pool.

---

### #13 — Auto-Login After Signup

Backend returns session cookie with the signup response. Frontend redirects to the appropriate dashboard immediately. No magic link.

---

### #14 — Remove "Request Early Access" Button and Section

- **Nav:** Remove "Request Early Access" → replace with **"Sign up free"** button
- **Home page:** Remove `#signup` section → replace with CTA: "Ready to start?" with two buttons → company / talent signup
- **Footer:** Clean up any references

---

## Resolved Questions

| # | Question | Your Decision |
|---|----------|---------------|
| Q1 | Payment provider | **Razorpay** (INR + UPI) for companies, **Stripe** (USD) for talent |
| Q2 | Budget bands | $2,000–$5,000 / $5,000–$10,000 / $10,000–$25,000 / $25,000+ |
| Q3 | FAQ content | **Option B** — draft in `FAQ_DRAFT.md` for review first |
| Q4 | "Anything else" tone | **Option D** — "Additional context" with descriptive placeholder |
| Q5 | Dashboard teaser | **Option B** — blurred preview with real match data |

---

## Implementation Order

### Phase 1 — Safe, Independent Changes (ship as one PR)
1. **CSS fix** — darken fonts (#2)
2. **Remove early access** (#14) — clean up nav + home page
3. **Fix login signup buttons** (#5) — routing fix
4. **Marketing copy** — $200→free, INR→USD budget bands, expansion→scaling (#7, #10)
5. **Form improvements** — Other textbox, RoW textbox, disable submit, tone (#6, #8, #9, #11)
6. **FAQ sections** — accordion component + content (#4)

### Phase 2 — Structural Change (ship as one PR)
7. **Free signup flow** — remove payment from forms, add password field, auto-login, backend account provisioning (#1, #12, #13, #15)
8. **Dashboard paywall** — blurred preview cards, Razorpay/Stripe unlock flow, internal matching trigger (#1, #15)

Phase 1 changes are independent and low-risk — can ship today.
Phase 2 is the architectural change — needs careful testing.

### Talent Assessment Decision (Final — Updated Post-Review)

| Decision | Detail |
|----------|--------|
| Assessment during signup | **Skippable** — "Skip for now →" link on Steps 2 and 3 |
| Account creation | After Step 0 (Profile) minimum — account exists immediately |
| References requirement | Must be completed **before payment** — not during signup |
| Assessment requirement | Must be completed **before payment** — not during signup |
| Dashboard checklist | Shows completion status for refs + assessment; payment button disabled until both done |
| Payment enables | Only when both references AND assessment are complete |
| Matching visibility | After payment — blurred previews before, full details after |

---

*Task files: `TASKS_PHASE1.md` (8 independent UI/copy tasks) and `TASKS_PHASE2.md` (structural backend/frontend changes).*
