# BridgeScale Service Pages — Content Draft (v1.1)

> **For Claude Code:** This document is the source of truth for the three service pages: `/services/sales-leadership`, `/services/sales-execution`, `/services/partnerships-bd`. All three pages already exist and use the shared `ServicePage` component (`frontend/src/components/ServicePage.tsx`) with the `ServiceData` type. The component shape is already correct — only the **content data** in each page file needs to change. No new components are required for this rebuild.

---

# Changelog — v1.0 → v1.1 (2026-05-09)

Every claim on the three pages has been reconciled against `BridgeScale_Operating_Matrix.xlsx` (v0.1, dated 27 April 2026). Each change below is grounded in a specific matrix cell. **All page copy is client-facing — the founder team should review before shipping.**

## A. Factual fixes (the previous draft was wrong)

| # | Page | Old wording | New wording | Source in matrix |
|---|---|---|---|---|
| A1 | Sales Execution / Section 2 | Listed "Senior Closer" as a role | Replaced with "RevOps / Sales Ops" | Sheet `02_Roles` — "Senior Closer" is not in the role taxonomy. RevOps and Sales Ops are matrix-Primary in the Execution lane (rows 19–20). RevOps also matches the lane's full label "Fractional Execution / Operations." |
| A2 | Sales Leadership / Eyebrow | "Fractional Sales Leadership" | "Fractional Leadership" | Sheet `13_Renames_Applied` row 3 — explicit founder rename (founder note line 218), audit trail says it propagates to website copy. |
| A3 | Sales Execution / Eyebrow | "Fractional Sales Execution" | "Fractional Execution / Operations" | Sheet `13_Renames_Applied` row 4 — explicit founder rename (founder note line 220). |
| A4 | Partnerships & BD / Eyebrow | "Fractional Partnerships & BD" | "Fractional BD / Partnerships" | Sheet `01_Service_Lanes` row 4 — canonical lane label is "Fractional BD / Partnerships." Sheet `13` row 6 confirms unchanged. |
| A5 | Sales Leadership / Section 5 (Consultation price) | USD 1,000–1,500 per session | USD 500–1,500 per session | Sheet `06_Combinations` row 3 — VP Sales / GTM Strategy / Consultation is "$500–$1,500 per session." Old draft floor was $500 too high. |
| A6 | Sales Leadership / Section 3 (Retainer minimum) | "60-day minimum, typically 6–12 months. 20+ hours/week." | "3-month minimum." | Sheet `06_Combinations` row 5 — "$8,000–$15,000/mo (3+ mo)." The "20+ hours/week" claim does not appear anywhere in the matrix and has been removed. |
| A7 | Sales Leadership / Section 3 (Consultation) | "First 30 minutes are free." | Removed. | Not in matrix. Cancellation rule for Consultation is in sheet `06` row 3 ("Operator cancel <24h: 5% next-payout penalty + 1 free deferral. Company cancel <48h: 50% session fee.") — no free trial language. |
| A8 | Sales Leadership / Section 3 (intro line) | "Sprints and Operator Retainers don't fit — leadership work is rarely time-boxed in the same way." | "Two engagement shapes are most common for Sales Leadership work." | Sheet `05_Template_x_Engagement` — Sprint **is** supported for GTM Strategy (default), Revenue Cadence Setup, and Founder-Led Sales Transition with Leadership roles. The original wording was factually wrong. |
| A9 | Sales Execution / Section 4 (Outcome) | "Generate $250K+ net new revenue on a $25K ACV product over a single retainer engagement." | "Convert active opportunities into signed deals through a focused retainer, with success-fee triggers tied to closed-won revenue." | Specific revenue and ACV figures are not sourced from the matrix. Sheet `06_Combinations` row 9 (Head of Sales / Closing Support / Retainer) and row 15 (AE / Closing Support / Retainer) support the closed-won + success-fee structure. |
| A10 | Partnerships & BD / Section 5 (Retainer floor) | USD 7,000–10,000/mo | USD 6,000–10,000/mo | Sheet `06_Combinations` row 13 — Channel Lead Partner/Channel Development Retainer is "$6,000–$10,000/mo + per-partner success." Old floor was $1,000 too high. |
| A11 | Partnerships & BD / Section 4 (Outcome) | "Build a target partner map and book 10–15 qualified partner conversations within 60 days." | "Build a target partner map by Day 30 and an active outreach campaign by Day 60." | Sheet `03_Service_Templates` row 9 — Partner/Channel Development 30/60/90 reads "Day 30: channel landscape. Day 60: outreach campaign live. Day 90: first signed partners + revenue." Specific "10–15 conversations" count is not in the matrix. |

## B. Tightening to source (no factual error, but the wording now matches matrix detail)

| # | Page | Change | Source in matrix |
|---|---|---|---|
| B1 | Sales Leadership / Section 2 | "Fractional VP Sales / CRO" expanded to "Fractional VP Sales / VP Revenue / CRO" | Sheet `02_Roles` rows 3–5 — VP Sales, VP Revenue, and CRO are three distinct Primary roles in the Leadership lane. |
| B2 | Sales Leadership / Section 5 | Retainer band changed from "$8,000–15,000/mo" to "$5,000–15,000/mo depending on scope" | Sheet `06_Combinations` row 6 — Founder-Led Sales Transition Retainer for VP Sales is $5,000–10,000/mo, which is also part of the Leadership Retainer offering on this page. The wider band now covers both engagement shapes. |
| B3 | All three pages / Section 3 | Cash-only / cash + equity / cash + success-fee compensation options noted explicitly per service line, only where they are matrix-allowed | Sheet `07_Compensation_Modes` rows 3–7 — each compensation mode has a specific list of allowed engagement types. Cash + Equity is allowed only on Retainer + Fractional Leadership. Cash + Success Fee is allowed only on Sprint + Retainer. |

## C. Items kept in copy with founder review flag

| # | Item | Why it's flagged |
|---|---|---|
| C1 | URL slugs (`/services/sales-leadership`, `/services/sales-execution`, `/services/partnerships-bd`) | Recap explicitly proposed these slugs. Matrix sheet `13_Renames_Applied` retired "Sales" from internal lane labels. Decision: keep user-chosen slugs (URLs are sticky and the slugs are buyer-friendly) but eyebrow + body copy use the matrix-canonical labels. Founder team should sign off. |
| C2 | "Typical 60–90 minute session" for Consultation | Matrix prices Consultation per session (sheet `06` row 3) but does not specify duration. The "60–90 minute" figure is a buyer-friendly typical anchor; actual duration will be set per SOW. |
| C3 | "20+ hours/week" — REMOVED | The previous draft asserted this as a Leadership Retainer commitment. Matrix has no hours-per-week field. If the founder team has a published expectation, surface it and we will add it back; otherwise it stays out. |

---

# Design principle (unchanged)

Each service page is a **buyer's entry point for that service** — short enough to read in two minutes, structured enough to take to a board. Five fixed sections, no more, no less. No preachy intros. No "we" voice repeated. No marketing fluff.

The buyer's reading order from the homepage:

1. Home → "What we offer" three-card section
2. Click into a service card → land on the service page
3. Read 5 sections → understand roles, engagement shapes, outcomes, price
4. Click "Apply as a company" → convert

The service page **does not need to repeat** what's already on the homepage (positioning, gap, why-BridgeScale). It needs to answer the question the buyer brings to it: *"What exactly does this service look like, who runs it, how is it bought, what's the result, what does it cost?"*

---

# Five-section page template (fixed across all three)

| Section | Content rule |
|---|---|
| **1. What this service is** | One paragraph. Two sentences maximum. No bullets. Terse. |
| **2. Roles you'll work with** | 2–4 role names with one-line descriptions each. All role names sourced from matrix sheet `02_Roles`. |
| **3. How it's typically engaged** | Only the engagement types relevant to *this* service. Don't list all four — show the two or three that fit. Compensation options noted only where matrix-allowed (sheet `07`). |
| **4. Typical outcomes** | 3–4 measurable results. Anchored to matrix sheet `03_Service_Templates` 30/60/90 outputs where applicable. Not "build pipeline" — "First 30 qualified meetings in 60 days." |
| **5. Indicative price** | Single sentence with USD band, sourced from matrix sheet `06_Combinations`. No marketing fluff. |

Below the five sections: a single CTA row (Apply as a company / See sample documents) — already provided by the `ServicePage` component layout.

---

# Page 1 — `/services/sales-leadership`

**URL slug:** `sales-leadership`
**Eyebrow:** Fractional Leadership
**Page title:** Senior commercial leadership, on a fractional basis.

## Section 1 — What this service is

Senior fractional leaders who own revenue. They build the operating cadence, set strategy, and operate as part of your leadership group — without the cost or commitment of a full-time CRO.

## Section 2 — Roles you'll work with

| Role | Description |
|---|---|
| **Fractional VP Sales / VP Revenue / CRO** | Owns the commercial motion end-to-end. Sales process, forecast cadence, team coaching, revenue strategy. |
| **Head of Sales** | Runs pipeline, conversion, and closing for an early commercial team. Stands up the operating rhythm. |
| **GTM Leader** | Builds and sequences the go-to-market plan, motion, and resourcing across geographies and segments. |
| **Founder-Led Sales Coach** | Helps founders move from founder-led to operator-led sales. Codifies what works and hands it off cleanly. |

## Section 3 — How it's typically engaged

Two engagement shapes are most common for Sales Leadership work.

| Engagement | Shape |
|---|---|
| **Consultation** | A focused session for a specific strategic question — second opinion, diagnosis, or sanity-check before a major hiring decision. Typical 60–90 minute session, scoped per SOW. |
| **Leadership Retainer** | Senior leader embedded in your operating rhythm for a 3-month minimum, typically 6–12 months. Cash, cash + equity (FAST-documented), or hybrid structures available. |

## Section 4 — Typical outcomes

- Move from founder-led sales to a repeatable, operator-led commercial motion within one quarter (process and CRM hygiene by Day 30; first operator running the motion by Day 60; founder out of day-to-day deals by Day 90).
- Establish forecast cadence and pipeline review rhythm the leadership team can run on its own.
- Hire and onboard the first one to three commercial team members with a clear ramp plan.
- Stand up an international sales motion — from zero to first ARR — in a target geography.

## Section 5 — Indicative price

Consultations are USD 500–1,500 per session. Leadership Retainers run USD 5,000–15,000 per month depending on scope, with a 3-month minimum and cash + equity structures available for early-stage companies.

---

# Page 2 — `/services/sales-execution`

**URL slug:** `sales-execution`
**Eyebrow:** Fractional Execution / Operations
**Page title:** Operators who build pipeline and close deals.

## Section 1 — What this service is

Hands-on operators who build pipeline and close deals. They run real conversations, qualify accounts, and convert opportunities into revenue — in markets where you don't yet have presence.

## Section 2 — Roles you'll work with

| Role | Description |
|---|---|
| **Account Executive (AE)** | Qualifies, pitches, negotiates, and closes customer opportunities. Best for active demand or qualified-lead conversion. |
| **SDR / BDR** | Finds and qualifies new prospects through outbound research, sequencing, and meeting generation. |
| **Outbound Operator** | Combines account research, sequencing, and live conversations. Senior outbound specialist built for compressed sprints in new markets. |
| **RevOps / Sales Ops** | Cleans the CRM, rebuilds stages and reporting, and installs the cadence that makes the rest of the motion measurable. |

## Section 3 — How it's typically engaged

Sales execution is hands-on commercial work, so engagements are time-boxed or ongoing — not consultative.

| Engagement | Shape |
|---|---|
| **Sprint** | A 30–60 day time-boxed pipeline build with a defined output: target accounts engaged, qualified meetings booked, ICP feedback documented. Cash-only or cash + success fee. |
| **Operator Retainer** | Ongoing monthly engagement for sustained pipeline ownership. Cash-only or cash + success fee, with success triggers defined before SOW signing. |

## Section 4 — Typical outcomes

- Build the first 30 qualified meetings in 60 days from a focused outbound motion in a new geography.
- Convert active opportunities into signed deals through a focused retainer, with success-fee triggers tied to closed-won revenue.
- Validate ICP in a new geography through real conversations — not desk research.
- Stand up CRM hygiene, pipeline stages, and forecast reporting the leadership team can read on its own.

## Section 5 — Indicative price

Sprints are USD 2,500–6,000 fixed for a 30-day engagement. Operator Retainers run USD 3,000–6,000 per month, with cash + success-fee structures common where the trigger event is well-defined.

---

# Page 3 — `/services/partnerships-bd`

**URL slug:** `partnerships-bd`
**Eyebrow:** Fractional BD / Partnerships
**Page title:** Open channel, partner, and ecosystem doors.

## Section 1 — What this service is

Operators who build channels, alliances, and partner ecosystems. They bring existing relationships in your target markets to shortcut introductions that direct outbound can't reach.

## Section 2 — Roles you'll work with

| Role | Description |
|---|---|
| **BD Lead** | Opens new partner, reseller, and distributor relationships. Builds the partner motion from zero. |
| **Partnerships Lead** | Builds and runs strategic alliance and ecosystem relationships. Manages cadence with named partners over multi-quarter horizons. |
| **Channel Lead** | Develops reseller and distributor channels with documented partner motion, enablement, and revenue attribution. |
| **Market Access Lead** | Provides local introductions and trust in relationship-led markets where founders cannot easily get in the door. |

## Section 3 — How it's typically engaged

Partnerships work fits both time-boxed sprints and ongoing operator engagements. Consultation is a less common shape — partner motion needs continuity.

| Engagement | Shape |
|---|---|
| **Sprint** | A 30–60 day partner build with a defined output: target partner map, qualified partner conversations booked, first agreement scoped. Cash-only, cash + success fee, or cash + equity (for Market Entry-aligned engagements). |
| **Operator Retainer** | Ongoing monthly engagement for sustained channel ownership. Success-fee components common where partner-sourced revenue or signed agreements are the trigger. |

## Section 4 — Typical outcomes

- Build a target partner map by Day 30 and an active outreach campaign by Day 60.
- Sign your first reseller, distributor, or strategic alliance agreement in a new geography.
- Activate a channel motion from zero — partner enablement, attribution, and review cadence in place.
- Close partner-sourced revenue with documented attribution and a clean success-fee trigger.

## Section 5 — Indicative price

Sprints are USD 5,000–10,000 fixed for a 30-day partner build. Operator Retainers run USD 6,000–10,000 per month for ongoing channel ownership, with success-fee components common.

---

# Cross-page consistency rules

These apply to all three service pages:

- **Voice:** Third-person describing the operators ("Senior fractional leaders who own revenue"), not first-person platform voice ("We provide…"). The platform is invisible on a service page; only the operators and the engagement matter.
- **Tense:** Present tense throughout. "Owns the commercial motion," not "will own."
- **No "BridgeScale" name on the page body** — except in nav and footer. The page is about the *service*, not the platform. The platform's role surfaces on the homepage and at apply time.
- **No bullets in Section 1.** It's a paragraph. The temptation to list "what we do" must be resisted.
- **CTAs at the bottom of every page:** `[Apply as a company →]` (primary, → `/for-companies/apply`) and `[See sample documents →]` (secondary, → `/learn` or sample MSA/SOW page if it exists).
- **No section called "Why us" or "How we're different."** That's homepage work. The service page assumes the buyer is past that decision and is now evaluating fit.
- **All role names match matrix sheet `02_Roles` exactly.** No invented titles.
- **All engagement-type labels match matrix sheets `05` and `06` exactly.** "Leadership Retainer" and "Operator Retainer" are buyer-facing renames of the matrix's "Fractional Leadership" and "Retainer" engagement types — keep the rename consistent across the site.
- **All price bands sourced from sheet `06_Combinations`.** No fabricated dollar figures.

---

# Implementation notes

## Files to edit

- `frontend/src/app/services/sales-leadership/page.tsx`
- `frontend/src/app/services/sales-execution/page.tsx`
- `frontend/src/app/services/partnerships-bd/page.tsx`

## Existing component to reuse

- `frontend/src/components/ServicePage.tsx` exposes the `ServicePage` component and `ServiceData` type. This component already renders five conceptual sections (intro, about, roles, engagements, outcomes, price). **Do not refactor the component**; just update the data passed in.

## ServiceData shape — content mapping

The current `ServiceData` type has these fields. Map the new content into them as follows:

| Field | New content per spec |
|---|---|
| `slug` | unchanged: `sales-leadership` / `sales-execution` / `partnerships-bd` |
| `eyebrow` | **REPLACED** — uses matrix-canonical labels (Fractional Leadership / Fractional Execution / Operations / Fractional BD / Partnerships) |
| `title` | unchanged |
| `intro` | the new "Section 1 — What this service is" paragraph, two sentences max |
| `about` | **DELETED** — the previous over-explanation paragraph is removed; if the `ServicePage` component requires this field, set it to empty string and conditionally hide the rendered block, or refactor the component to make `about` optional |
| `roles` | TRIMMED to 2–4 entries, all sourced from matrix sheet `02_Roles` |
| `engagements` | TRIMMED to relevant types only — Leadership: Consultation + Leadership Retainer; Execution + Partnerships: Sprint + Operator Retainer |
| `outcomes` | 3–4 entries, anchored to matrix sheet `03_Service_Templates` 30/60/90 outputs where applicable |
| `price` | single sentence with USD band, sourced from matrix sheet `06_Combinations` |

## Component change required

The current `ServicePage` component likely renders the `about` paragraph as a separate section after `intro`. Per the new spec, the `about` paragraph is dropped entirely. Two implementation choices:

**Option A — Make `about` optional in the component:**
- Update `ServiceData` type so `about?: string` is optional.
- In `ServicePage.tsx`, conditionally render the about block only if `about` is non-empty.
- Set `about: ''` (or omit) on all three service page data objects.

**Option B — Remove the about block entirely from the component:**
- Delete the about-rendering JSX from `ServicePage.tsx`.
- Delete the `about` field from the `ServiceData` type.
- Remove the `about` property from all three service page data objects.

**Recommendation: Option A.** Lower risk. Preserves the field for any future page that might want it, while letting the three current pages skip it.

## Section ordering inside `ServicePage`

Confirm rendered order matches the spec:

1. Eyebrow + title
2. Intro paragraph (Section 1)
3. Roles (Section 2)
4. Engagements (Section 3)
5. Outcomes (Section 4)
6. Price (Section 5)
7. CTA row (Apply / See sample documents)

If the current order differs, reorder the JSX in `ServicePage.tsx` to match.

## Quality checks per page (pre-publish)

After implementing each page, verify:

- Section 1 is one paragraph, two sentences maximum. Count them.
- Roles count is 2–4. Every role string appears verbatim in matrix sheet `02_Roles`.
- Engagement section lists only the relevant types (Sales Leadership: Consultation + Leadership Retainer; Sales Execution and Partnerships & BD: Sprint + Operator Retainer).
- Outcomes count is 3–4. All measurable. No "build pipeline" — must be specific.
- Price is one sentence with USD band that exists in matrix sheet `06_Combinations`.
- No `BridgeScale` mention in page body (excluding nav/footer).
- No "we" voice in body copy.
- No fabricated metrics (revenue figures, conversion rates, hours-per-week commitments).
- Eyebrow uses the matrix-canonical lane label, not the URL slug text.

---

# What this enables on the rest of the site

Once these three service pages are the buyer's entry point per service, two cleanup moves become possible (out of scope for this draft, flagged for later):

1. **`/for-companies` "Engagement types" matrix** — becomes a small reference card with a "See how each service uses these →" link to the service pages. The matrix currently duplicates what now lives on the service pages.
2. **`/learn` role × engagement matrix** — becomes a single dense reference table at the bottom of `/learn`, not a top-level section. The service pages are the buyer-facing entry; the matrix is the appendix for the technically curious.

Defer those edits until after the three service pages and the homepage rebuild ship.

---

# Summary

Three pages. Five sections each. Every claim sourced to a specific cell in `BridgeScale_Operating_Matrix.xlsx` (v0.1). Eleven factual fixes (Section A of changelog), three tightening edits (Section B), three items flagged for founder review (Section C). No new components needed — only the page data and a small change to make the `about` field optional. Total scope: three files in `frontend/src/app/services/*/page.tsx` and one component file (`ServicePage.tsx`).

---

# Implementation hand-off — for Claude Code

> Read this section before opening any file. The page bodies above describe the *content* in spec form. This section describes how that content lands in the actual TypeScript, including five gotchas that aren't obvious from the spec alone.

## 1. Field mapping — resolves the `intro` vs `about` ambiguity

The current `ServicePage` component (`frontend/src/components/ServicePage.tsx`) renders **both** `intro` and `about` — they are not the same field. `intro` is the hero subtitle (above the fold, under the title). `about` is the body Section 1 paragraph ("What this service is").

This document calls the new "What this service is" paragraph **Section 1**. Map it as follows:

| Spec section | TypeScript field | Renders where |
|---|---|---|
| Eyebrow | `eyebrow` | Hero, above the title |
| Page title | `title` | Hero, large heading |
| Hero subtitle (a one-line teaser, ≤ 20 words) | `intro` | Hero, under the title |
| **Section 1 — What this service is** (the two-sentence paragraph from the spec body) | `about` | Body, first section after hero |
| Section 2 — Roles you'll work with | `roles` | Body |
| Section 3 — How it's typically engaged | `engagements` | Body |
| Section 4 — Typical outcomes | `outcomes` | Body |
| Section 5 — Indicative price | `price` | Body |

**Do NOT delete `about`** (the v1.1 changelog said "DELETED" — that was based on a wrong assumption about the component shape). Keep the field populated with the Section 1 paragraph from the spec. The component does not need refactoring.

The `intro` field still needs a value. Use these short hero subtitles (one line each, NOT the same as the Section 1 paragraph):

- **Sales Leadership:** `Senior leaders who own revenue, on a fractional commitment.`
- **Sales Execution:** `Operators who build pipeline and close deals in markets where you have no presence.`
- **Partnerships & BD:** `Operators with existing relationships in your target markets.`

## 2. `metadata` block — must be updated alongside `data`

Each `page.tsx` has a top-level `export const metadata: Metadata = {...}` with `title` and `description`. Update all three:

### `sales-leadership/page.tsx`
```ts
export const metadata: Metadata = {
  title: 'Fractional Leadership — BridgeScale',
  description:
    'Senior fractional leaders who own revenue. VPs, CROs, GTM leaders, and founder-led sales coaches who build the operating cadence and lead the team.',
};
```

### `sales-execution/page.tsx`
```ts
export const metadata: Metadata = {
  title: 'Fractional Execution / Operations — BridgeScale',
  description:
    'Hands-on operators who build pipeline and close deals. AEs, SDR/BDRs, outbound specialists, and RevOps in markets where you have no presence.',
};
```

### `partnerships-bd/page.tsx`
```ts
export const metadata: Metadata = {
  title: 'Fractional BD / Partnerships — BridgeScale',
  description:
    'BD leads, partnerships managers, channel specialists, and market-access leads with existing relationships in your target markets.',
};
```

## 3. One-line edit required in `ServicePage.tsx`

Line 92–94 currently reads:

```tsx
<div className={styles.engagementNote}>
  Add-ons (success-fee, equity, conversion to full-time) layer on top of any structure where the trigger is well-defined.
</div>
```

Replace with:

```tsx
<div className={styles.engagementNote}>
  Add-ons (success-fee, equity) layer on top of any structure where the trigger is well-defined. Full-time conversion is handled separately as a lifecycle event.
</div>
```

Reason: matrix sheet `13_Renames_Applied` row 9 — "Full-Time Conversion" was retired as an engagement type and moved to a separate row in sheet `06_Combinations` as a lifecycle event with its own conversion fee (25% of FY1 cash comp). Keeping the original wording mis-classifies it.

## 4. Items requiring founder confirmation before publish

These are NOT to be auto-edited by Claude Code. Surface them in the PR description for founder sign-off.

### 4a. Hardcoded "10% platform fee" footnote in `ServicePage.tsx`

Line 122–124 reads: *"BridgeScale charges a 10% platform fee on cash engagements, paid by the company on top of the operator's stated rate. EOR and partner fees, where applicable, are passed through at cost as a separate line item."*

This 10% figure does not appear in `BridgeScale_Operating_Matrix.xlsx`. Confirm with the founder team that 10% is current before this is exposed on three new buyer-facing pages. If the figure has changed, update the line. If the figure is correct but should be expressed differently (e.g., as a range, or a fee schedule), do that here.

### 4b. Hardcoded section subheadings in `ServicePage.tsx`

Three `<h2 className={styles.sectionHeading}>` elements are hardcoded across all service pages:

- Line 67: `Senior commercial talent, mapped to outcomes.`
- Line 83: `Pick the structure that matches the work.`
- Line 102: `What success looks like.`

The first one ("Senior commercial talent") reads awkwardly on the Sales Execution page where the role list includes SDRs and BDRs — these are not "senior" roles in the matrix taxonomy. Two options:

- **Option A:** leave hardcoded, accept the slight mismatch (low risk, no code change).
- **Option B:** make the section heading data-driven (add a `rolesHeading: string` to `ServiceData`, render `data.rolesHeading` in the component). For Sales Leadership use "Senior commercial talent, mapped to outcomes." For Sales Execution use "Operators who do the work." For Partnerships & BD use "Operators with the relationships."

Recommend Option A unless the founder team specifically wants it tightened. Surface the call.

## 5. Acceptance checklist (run before opening PR)

Per page (`sales-leadership`, `sales-execution`, `partnerships-bd`):

- [ ] `eyebrow` matches matrix-canonical lane label (no "Sales" prefix on Leadership or Execution).
- [ ] `metadata.title` and `metadata.description` updated to match the eyebrow.
- [ ] `intro` is a one-line hero subtitle (≤ 20 words), distinct from the Section 1 paragraph.
- [ ] `about` is the two-sentence Section 1 paragraph from the spec.
- [ ] `roles` array has 2–4 entries, every role name appears verbatim in matrix sheet `02_Roles`.
- [ ] `engagements` array contains only the engagement types listed in the spec for *this* page (Leadership: Consultation + Leadership Retainer; Execution and Partnerships: Sprint + Operator Retainer).
- [ ] `outcomes` array has 3–4 entries, all measurable, no fabricated numbers.
- [ ] `price` is a single sentence with a USD band sourced from sheet `06_Combinations`.
- [ ] No "Senior Closer" or other invented role names.
- [ ] No "first 30 minutes free" claim.
- [ ] No "20+ hours/week" or "60-day minimum" claim on the Leadership Retainer.
- [ ] No `BridgeScale` mention in the page body (excluding nav, footer, CTA section, and any platform-fee footnote).

In `ServicePage.tsx`:

- [ ] Line 92–94 engagementNote updated per Section 3 above.
- [ ] `about` field remains required in `ServiceData` type (do NOT make it optional — it is the body Section 1).
- [ ] No other component changes.

In the PR description:

- [ ] Item 4a (10% platform fee) flagged for founder review.
- [ ] Item 4b (section subheadings) flagged for founder review with Option A/B choice.
- [ ] Item C1 from the changelog (URL slugs vs matrix lane labels) flagged for founder review.

## 6. Out-of-scope for this PR

Do not touch in this PR — these are flagged for later in the changelog Section C and the "What this enables" section above:

- `/for-companies` "Engagement types" section (deferred cleanup).
- `/learn` role × engagement matrix (deferred cleanup).
- Homepage "What we offer" three-card section (separate homepage PR).
- Any change to `MarketingNav` or footer.
