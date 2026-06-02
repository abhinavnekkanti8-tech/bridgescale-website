# BridgeScale Homepage — Final Content & Implementation Spec

> **For Claude Code:** This document is the source of truth for the homepage rebuild. All edits target `frontend/src/app/page.tsx`. CSS edits go in `frontend/src/app/page.module.css`. Reuse existing components and CSS modules wherever possible (`MarketingNav`, `Reveal`, `useReveal`, `GapToggleSection`). Implement section-by-section in the order listed in *Implementation Order* below — show the diff per section before moving on.

---

## Storyline

A founder lands on the homepage. In one scroll, they walk through:

1. **What is BridgeScale** → Hero
2. **What's the gap** for founders and for talent → The Gap
3. **What's the answer** — fractional, as a category → Why Fractional. Why Now.
4. **What BridgeScale specifically offers** → What We Offer (3 services, link to /services/*)
5. **Why BridgeScale beats other fractional networks** — AI-native, managed cross-border → Why BridgeScale
6. **Why you can trust this** → Standards & Principles
7. **Apply** → CTA banner

Numbers stay where they validate the *category* (fractional growth, GTM-talent gap). Numbers do **not** appear as fabricated BridgeScale-specific operational performance.

---

## Strategic positioning notes

- BridgeScale is about **scaling outward** — into a new market, a new industry within a market, or a new segment within an industry. International expansion is the dominant umbrella positioning (because diaspora talent is the unique angle), but the services should not artificially narrow to *new geography* alone.
- Service descriptions cover all three scaling vectors: *new market*, *new industry*, *new segment*.
- Hero stays international-first. If the broader scaling message isn't landing across the rest of the site, that's a separate site-wide revamp — out of scope for this homepage rebuild.



---

# Section-by-section spec

## Section 1 — Hero

**Purpose:** Identify the audience, frame the problem, give both sides a CTA.

**Decision:** Keep three pillar cards (Vetted / Scoped / Managed). Do not add a fourth "fractional" card — fractional gets defined in Section 4.

### Content

**Eyebrow:** For Indian startups going international

**Headline:** The gap between your product and international growth isn't strategy. It's *senior talent* with the networks to open it.

**Tagline:** Fractional diaspora talent. Vetted. Scoped. Managed.

**Sub-paragraph:**
BridgeScale matches Indian startups and MSMEs with vetted diaspora senior talent across sales leadership, sales execution, and partnerships & BD — for fractional, scoped engagements that produce real commercial outcomes in international markets.

**CTAs:**
- Primary: `[I'm a company looking for talent →]` → `/for-companies/apply`
- Secondary: `[I'm a sales professional]` → `/for-talent/apply`

**Three pillar cards (replaces current numerical hero stats):**

| Pillar | Body |
|---|---|
| **Vetted** | Senior diaspora talent. Interview-screened, reference-verified, domain-assessed. Selective intake — the quality of the network is the product. |
| **Scoped** | Defined deliverables. Defined windows. Engagements end when the work ends — not when the budget runs out. |
| **Managed** | Cross-border contracts, payments, FX, GST, and compliance handled by the platform. You see one invoice, one payout. |

### Implementation notes

- Reuse existing `styles.heroStats` / `styles.heroStat` structure.
- Each pillar card uses pillar name as the "stat" (e.g., "Vetted") and body text as the label.
- Drop the current `.heroStatNum` numerical styling; pillars use bold short-label styling instead. May need a new `.heroPillarCard` variant.
- Keep `MarketingNav` as is.
- Keep `useReveal` / `Reveal` hooks for scroll-in.

---

## Section 2 — Marquee

**Purpose:** Visual rhythm + outcome/number reinforcement.

**Decision:** Keep existing content unchanged. Existing `marqueeItems` array is fine.

### Implementation notes

- No changes. Existing `styles.marquee` and `marqueeTrack` keep working.

---

## Section 3 — The Gap

**Purpose:** Pain articulation for both sides. Set up "why fractional is the answer."

**Decision:** Keep the existing 5-point pain structure per side. Sharpen one or two specific lines with concrete language. Keep the existing toggle UX (`GapToggleSection` component). Add the "Not a job board / Not a recruiter / Not an advisory network" tagline above the toggle.

### Content

**Eyebrow:** The gap we're closing

**Heading:** The talent and the demand both exist. The infrastructure to connect them doesn't.

**Sub-paragraph:**
Indian startups need senior international growth talent. Diaspora professionals want to contribute home — on professional terms. Both sides hit the same wall: no managed way to scope, contract, pay, and run cross-border fractional work. So engagements either don't happen, or quietly fade into informal advisory that delivers nothing.

**Tagline (new line — sits between sub-paragraph and toggle):**
*Not a job board. Not a recruiter. Not an advisory network.*

### Toggle: For startups

**Label:** Indian startups & MSMEs going international

**Title:** Serious about going global. Not set up to hire for it full-time.

**Pains (5 — keep existing structure, sharpen 2 with concrete language):**

1. Don't know exactly what commercial capability gap you have — only what role title you think you need.
2. Can't justify a full-time international senior hire — $200K+ before equity is hard to commit to before the market is proven. *(SHARPENED)*
3. No trusted access to senior talent who've already navigated your target markets — job boards return generalists, warm intros produce advisors who attend three calls and disengage. *(SHARPENED)*
4. Need scoped execution, not another informal advisory relationship that ends in suggestions instead of work.
5. Want flexibility — cash, retainer, success-based, or hybrid fractional structures depending on the engagement.

### Toggle: For talent

**Label:** Indian diaspora senior talent

**Title:** Ready to contribute back home. Only on professional terms.

**Pains (5 — keep existing, sharpen 1):**

1. Advisory on diaspora networks goes uncompensated — "pick your brain" calls accumulate, senior talent disengage within weeks.
2. Want structured, scoped, paid fractional engagements — not informal calls that go nowhere.
3. Prefer part-time or project-based formats compatible with your existing full-time role or next challenge.
4. Want equity upside through documented hybrid or FAST structures — not a vague promise.
5. Need cross-border contracting, FX, GST, payments, and EOR handled — friction that today kills engagements before delivery starts. *(SHARPENED)*

### Implementation notes

- `GapToggleSection` component already exists. Do not refactor; just update the data array `gapCards` with new copy.
- The new tagline goes inside `styles.sectionHead`, after the sub-paragraph. May need a new `styles.gapTagline` class for italic, muted styling.
- **State sharing for stateful toggles:** lift the `active` state from `GapToggleSection` to the parent `HomePage` component. Pass `active` and `setActive` as props to both `GapToggleSection` (Section 3) and the new `WhyBridgeScaleToggle` (Section 6). Use React `useState` at HomePage level — no Context needed.

---

## Section 4 — Why Fractional. Why Now.

**Purpose:** Validate fractional as a real category + define what fractional means + host the logo strip.

**Decision:** Slim from 3 stats to 2 stats (drop the redundant `$0` salary stat). Open the section with a clear *definition* of fractional — most Indian founders haven't bought a fractional engagement before. Add a "category proof" logo strip below the stats.

### Content

**Eyebrow:** Why fractional. Why now.

**Heading:** The model has crossed a threshold. The timing is structural.

**Definition paragraph (NEW — opens the section before the stats):**
Fractional means senior talent on a part-time, scoped basis — typically 15–20 hours/week, with a defined deliverable and a defined window. Not a consultant who hands over a deck. Not an advisor who attends quarterly calls. An operator who owns the work and ships the outcome.

**Sub-paragraph (existing intent, kept):**
Fractional hiring isn't a workaround. It's the operating model for companies that need senior talent without the overhead, and for professionals who want to deploy expertise without a career disruption.

**Two stats (slimmed from three):**

| Stat | Body |
|---|---|
| **73%** | of high-growth startups cite lack of senior GTM talent as their primary barrier to international expansion. |
| **4×** | faster time-to-market when companies engage fractional senior talent vs. hiring full-time for new geographies. |

**Source line (kept):** *Sources: McKinsey Global Institute · Fractional Executive Association · Industry benchmark data*

### Logo strip (NEW)

**Header line above logos:** *Fractional commercial talent has built revenue at —*

**Wording rules:**
- Use *"has built revenue at"* — not *"trusted by"*, not *"customers include"*, not *"used by"*.
- The strip is **category proof, not BridgeScale-customer proof.**

**Implementation:**
- Render 6–8 logos in a single horizontal row, greyscale at low contrast (~40% opacity).
- Use placeholder logo images for now (e.g., `placeholder-logo-1.svg` through `placeholder-logo-8.svg`). Final logos will be swapped in before launch.
- Static `<img>` tags or simple flex layout. No animation needed — this isn't a marquee.
- Add a small `styles.logoStrip` class. Mobile: wrap to two rows.

### Implementation notes

- Existing `styles.whyNow` and `styles.statList` patterns should mostly carry over.
- The current 3-stat layout in `stats` array becomes 2 entries.
- Add the definition paragraph in the left column (above the heading) or as a lead paragraph above the asymmetric grid — whichever reads cleaner visually.
- Logo strip sits below the asymmetric grid, before the source line. Source line moves below the logo strip.

---

## Section 5 — What We Offer

**Purpose:** Three services. Outcome-led. Each links to its full /services/* page.

**Decision:** Rewrite outcome lines to cover all three scaling vectors (new market / new industry / new segment), not just geography. Keep the cross-capability strip but slim from 7 to 4. Each service card gets a `[See full service →]` link to its detail page.

### Content

**Eyebrow:** What we offer

**Heading:** Three services. One job: scaling your commercial motion outward.

**Right-side paragraph (asymmetric — sits opposite the heading):**
Every engagement is scoped to a specific outcome — a market opened, a pipeline built, a partnership signed. Not retainers in search of a problem. Whether you're entering a new geography, expanding into a new industry, or moving up-market within one.

### Service cards

**01 — Fractional Sales Leadership**

- *Outcome:* Lead the next phase of your commercial motion — fractionally.
- *Description:* Senior revenue leaders who shape your ICP, build the playbook, and run the operating cadence. Whether you're entering a new market, expanding into a new industry, or scaling past founder-led sales.
- *Roles:* VP Sales · CRO · Head of International · GTM Leader
- *Link:* `[See full service →]` → `/services/sales-leadership`

**02 — Fractional Sales Execution**

- *Outcome:* Build qualified pipeline where you're scaling — new market, new industry, or new segment.
- *Description:* Hands-on operators who prospect, qualify, and progress deals. Networks and fluency to shortcut cold outreach across target geographies, industries, and buyer profiles.
- *Roles:* Account Executive · SDR · BDR · Outbound Operator
- *Link:* `[See full service →]` → `/services/sales-execution`

**03 — Fractional Partnerships & BD**

- *Outcome:* Open new markets, industries, or segments through channels and alliances.
- *Description:* Operators who build reseller, distributor, and strategic partner relationships — opening routes that direct outbound can't reach.
- *Roles:* BD Lead · Partnerships Lead · Channel Lead · Market Access Lead
- *Link:* `[See full service →]` → `/services/partnerships-bd`

### Cross-capability strip (slimmed from 7 to 4)

*Cross-capability areas:*
- GTM strategy & refinement
- ICP & messaging clarity
- Commercial systems & operating cadence
- Revenue operations

**Dropped (already implicit elsewhere):**
- ~~International market entry~~ (implied throughout)
- ~~AI in sales workflow~~ (covered in Standards & Why BridgeScale)
- ~~Founder-led sales transition~~ (already in Sales Leadership service description)

### Implementation notes

- `offerings` data array gets new `outcome` field, new `link` field. Render as: card with number, name, outcome line (bold), description (regular weight), pills row, link at bottom.
- `crossCaps` array slimmed to 4 entries.
- Asymmetric layout: heading column (left, ~1/3 width) + right paragraph (right, ~2/3 width). Service cards below in 3-column grid — but consider a 2/1 split (two cards larger, one smaller offset) for asymmetry. Final visual call belongs to design intuition during implementation.
- Each service card needs a `Link` component to its `/services/*` page.

---

## Section 6 — Why BridgeScale

**Purpose:** Convert the buyer. Differentiate from generic fractional networks.

**Decision:**
- New heading that centers BS positively, not comparatively.
- Replace the current 6-card `advantages` grid with a **situation → support table**.
- **Add a toggle for talent**, mirroring the Gap section's UX. Use stateful toggle (lifted state, syncs with Gap section). Apply a *different* visual treatment from the Gap toggle for visual variation.
- Below the table: inline link row, plain-English corridor strip, removed talent line (now redundant — the toggle handles it).

### Content

**Eyebrow:** Why BridgeScale

**Heading:** An operating layer, not a marketplace.

**Sub-paragraph:**
Most fractional platforms broker introductions. BridgeScale runs an AI-native operating layer — diagnosis, matching, engagement health, contract structure — built specifically for cross-border work between Indian startups and diaspora senior talent.

### Toggle: For startups (default active)

**Label:** Companies scaling commercially

**Heading inside toggle:** What we do that a generic fractional network can't.

**Situation → Support table (six rows):**

| The situation you're in | What BridgeScale does about it |
|---|---|
| **You're building international revenue, but a full-time leader is too slow and too expensive to commit to.** | Start with a 30-day Sprint. If it produces, convert to a Retainer. If it doesn't, you've spent the cost of a Sprint — not the cost of a wrong hire. |
| **You don't know exactly what commercial capability is actually missing.** | Every intake runs through an AI Diagnosis before you see a single profile. The shortlist is built against the gap, not the role title. |
| **You're worried about who you'll actually get matched with.** | Selective intake. Every operator is interview-screened, reference-verified, and assessed on a domain-specific brief. You only ever see vetted talent. |
| **You can't run cross-border contracts, payments, or tax compliance in-house.** | A tri-party MSA covers the legal shape. FX, invoicing, GST, withholding, and EOR are handled through best-in-class providers. You see one invoice, one payout. |
| **Different engagements need different shapes.** | Pick the structure (Consultation / Sprint / Retainer) and the compensation mode (Cash / Hybrid / Success-fee / Equity-only). The platform supports the combinations; you choose. |
| **You don't want to lose a great fractional hire to a competitor — or to full-time.** | If the fit is right and you want to convert, we have a structured path — clear terms, clear window, no surprise. |

### Toggle: For talent

**Label:** Senior diaspora professionals

**Heading inside toggle:** What we do that other fractional networks don't.

**Situation → Support table (six rows):**

| The situation you're in | What BridgeScale does about it |
|---|---|
| **The only "opportunities" arriving are unpaid advisory calls.** | Every engagement is scoped, paid, and contracted — Consultation, Sprint, or Retainer structures only. No "pick your brain" calls disguised as work. |
| **You can't take on engagements without scope or SoW.** | A non-binding Pre-SOW Commercial Summary locks scope before any contract is signed. The engagement either has a defined deliverable or it doesn't happen. |
| **Cross-border invoicing, FX, GST, and tax compliance is enough friction to kill the engagement.** | We handle invoicing, FX, GST/withholding, and EOR where required. ACH, Wise, or Razorpay payouts depending on your residence. You see one payout. |
| **You want equity upside, but only with documented terms.** | Cash + Equity (FAST-documented) and Equity-only structures available on retainer engagements. Always written down, never verbal. |
| **You need fractional work that fits alongside a full-time role.** | 15–20 hours/week, async-friendly, milestone-tracked. Set your availability — engage when the brief matches what you do well, decline when it doesn't. |
| **You want to know who you're working with before saying yes.** | A free 30-minute introductory call before any contract is signed. The Pre-SOW summary documents what you discussed. Decline cleanly if it's not a fit. |

### Below the toggle (visible regardless of selected side)

**Inline link row (small, dot-separated):**
`[Calculate the cost of a wrong full-time hire →]` (links to `/learn` calculator) · `[Read our standard MSA & SOW templates →]` (links to `/learn` FAQ docs)

**Plain-English corridor strip:**
*Markets we cover today: US · UK · Canada · UAE · Singapore · Australia · India.*
*Extended coverage for EU markets through Employer-of-Record partners.*

### Implementation notes

- **New component required:** `WhyBridgeScaleToggle` — mirrors `GapToggleSection` structurally but renders a `situation → support` two-column table instead of a single bullet list.
- **Data shape:**
  ```ts
  type WhyBSEntry = { situation: string; support: string };
  type WhyBSCard = {
    label: string;
    heading: string;
    rows: WhyBSEntry[];
  };
  const whyBSCards: { startups: WhyBSCard; talent: WhyBSCard } = {...};
  ```
- **Stateful toggle:** receives `active` and `setActive` as props from parent `HomePage`. Same state controls the Gap section toggle. When user clicks "For talent" in either section, both update.
- **Different visual treatment from Gap toggle:** Gap uses tab-style toggle bar (rounded pill buttons across top). Why BridgeScale should use a **segmented control** style — two adjacent buttons with a divider line, sliding indicator, or a different shape (e.g., underline-only). Visual variation prevents the page from feeling like the same toggle is repeating.
- The inline link row uses small text (~13–14px), muted color, dot separators.
- The corridor strip uses a thin one-line treatment, italic, muted.
- The full-page situation → support table format may render best on desktop as actual `<table>` markup with two columns. On mobile, stack each row vertically as situation-then-support pairs.

---

## Section 7 — Standards & Principles

**Purpose:** Final trust signal. Closes the AI objection.

**Decision:** Three-cell layout stays. Update the Intelligence cell to handle the inverse AI objection ("why pay humans when AI exists?").

### Content

**Eyebrow:** Standards & principles

**Heading:** How we operate. What we won't compromise.

### Three cells

**Vetting (unchanged)**
- *Title:* Every professional is rigorously screened.
- *Body:* Verified references from past clients and employers. A live expert interview. A domain-specific assessment — case study pitch for sales roles, turnaround narrative for leadership. Selective intake; the quality of the network is the product.

**Intelligence (UPDATED)**
- *Title:* AI does the heavy lifting. Humans own the outcomes.
- *Body:* AI assists with need diagnosis, talent matching, scope drafting, and engagement health monitoring — every recommendation is reviewable and overridable, every shortlist reviewed by platform staff before it reaches you. But the work being delivered — first meetings, partner conversations, deal progression — is where senior humans earn their keep. Agentic AI is a force multiplier on the workflow. It's not a substitute for a vetted operator with the network and instincts to actually open a market.

**Principles (slimmed slightly)**
- *Title:* Fractional-first. Curated, not open.
- *Body:* Diagnosis before matching. Execution is the product. Rewarded engagement, not unpaid mentorship. Built for Indian startups and MSMEs — not enterprises.

### Implementation notes

- `trustCells` data array stays. Update the second entry's body text only.
- Existing `styles.trustGrid` and `styles.trustCell` patterns work as is.
- For asymmetry: consider varying card sizes or staggering vertically. Optional, not required.

---

## Section 8 — CTA Banner

**Purpose:** Final conversion nudge for thorough readers.

**Decision:** Replace the current cardy "Pick your side" CTA section with a thin single-line banner. Compact, unobtrusive, but present.

### Content

**Heading (small, single line):** Ready to apply?

**Sub-line:** Indian startup or MSME going international? Diaspora senior talent looking for structured fractional work? Pick your side.

**Inline buttons (horizontal):**
- `[I'm a company →]` (primary) → `/for-companies/apply`
- `[I'm fractional talent →]` (secondary) → `/for-talent/apply`

### Implementation notes

- Replace the current `styles.ctaSection` two-card block.
- New layout: vertical-compact banner. ~80–100px tall on desktop. Heading + sub on the left, two inline buttons on the right (or stacked on mobile).
- Reuse existing `btn`, `btn-primary`, `btn-secondary` global classes if present, or create `styles.ctaBanner` + `styles.ctaBannerActions`.
- This section sits flush against the footer with minimal vertical padding.

---

## Section 9 — Footer

**Purpose:** Standard footer.

**Decision:** No content changes.

### Implementation notes

- Existing footer markup stays. No edits.

---

# Final structural map

```
1.  Nav                              (existing — no changes)
2.  Hero                             (UPDATED — sub-paragraph mapping to 3 services + 3 themed pillar cards)
3.  Marquee                          (no changes)
4.  The Gap                          (UPDATED — sharpened pains in 5-per-side structure + new positioning tagline + stateful toggle)
5.  Why Fractional. Why Now.         (SLIMMED — definition paragraph + 2 stats + NEW logo strip)
6.  What We Offer                    (UPDATED — outcome-led service cards + slimmed cross-capability + links to /services/*)
7.  Why BridgeScale                  (REPLACED — heading "An operating layer, not a marketplace" + situation→support tables for both startups + talent + stateful toggle (synced with Gap) + segmented-control visual + inline links + plain-English corridor strip)
8.  Standards & Principles           (UPDATED — Intelligence cell handles AI objection)
9.  CTA Banner                       (NEW — slim banner replaces cardy "Pick your side")
10. Footer                           (no changes)
```

---

# Implementation order

Execute in this order. Show diff for each section before moving to the next.

1. **Hero pillar cards** — replace 3 numerical stats with 3 themed pillar cards. Update `styles.heroStat*` if needed for the new layout.
2. **Standards Intelligence cell** — single text update in `trustCells` data array.
3. **Section 4 (Why Fractional)** — add definition paragraph, slim stats array from 3 to 2, add logo strip below grid with placeholder images, move source line below logo strip.
4. **Section 5 (Services)** — update `offerings` array with `outcome` and `link` fields, rewrite copy per spec, slim `crossCaps` from 7 to 4, render `Link` components on each service card.
5. **Section 3 (Gap)** — update `gapCards` data array with sharpened bullets and new titles, add positioning tagline above toggle. Lift toggle state to `HomePage`.
6. **Section 6 (Why BridgeScale)** — full rewrite. Build `WhyBridgeScaleToggle` component. Build `whyBSCards` data structure with both startup and talent tables. Wire stateful toggle to share state with `GapToggleSection`. Apply segmented-control styling. Add inline link row, corridor strip below.
7. **Section 8 (CTA Banner)** — replace cardy CTA section with slim banner. New `styles.ctaBanner` class.
8. **Asymmetric polish pass** — across all sections, review for asymmetric layout opportunities (heading-left/content-right, varied card heights, staggered grids). Apply where it improves rhythm.

---

# Open decisions (defer to implementation phase)

These don't block the build but should be confirmed during implementation:

1. **Logo strip — final logo selection.** Six to eight placeholder logos initially. Final list before launch.
2. **AI Diagnosis branding.** Capitalized as `AI Diagnosis` consistently across homepage and `/for-companies` (where it already lives).
3. **Stateful toggle granularity.** State lifted to `HomePage` is sufficient for now. If shared state is needed across more sections later, refactor to React Context.
4. **Segmented-control styling for Why BridgeScale toggle.** Final visual treatment is a design call during implementation. Goal: distinct from Gap section's tab-style toggle.

---

# Components reference

**Existing components to reuse:**
- `MarketingNav` — top navigation
- `Reveal` + `useReveal` — scroll-in animation wrapper and hook
- `GapToggleSection` — refactor to receive `active` and `setActive` as props (state lifted)
- Global button classes: `btn`, `btn-primary`, `btn-secondary`

**New components to create:**
- `WhyBridgeScaleToggle` — mirrors `GapToggleSection` shape but renders a 2-column situation→support table per side; receives `active` and `setActive` as props
- (Optional) `LogoStrip` — small wrapper if used elsewhere

**Data structures to define:**
- `pillars` — array of three objects for hero pillar cards
- Updated `gapCards` — sharpened bullets per side
- Updated `stats` — slimmed to 2 entries
- `logos` — array of placeholder logo image paths
- Updated `offerings` — with `outcome` and `link` fields
- Slimmed `crossCaps` — 4 entries
- New `whyBSCards` — `{ startups, talent }` structure with rows arrays
- Updated `trustCells` — Intelligence cell body updated

---

# Files in scope

- `frontend/src/app/page.tsx` — main edit target
- `frontend/src/app/page.module.css` — styling additions and updates

**Out of scope for this rebuild:**
- Other pages (`/for-companies`, `/for-talent`, `/services/*`, `/learn`, `/about`)
- Component refactors beyond what's needed for the homepage rebuild
- Site-wide repositioning from "international" to broader scaling
- Backend, API routes, database schema

---

# Quality checks per section

After implementing each section, verify:

- Copy matches the spec exactly. Punctuation and em-dashes matter.
- Links resolve to the correct pages.
- Mobile rendering is intact (single-column on narrow screens).
- Scroll-reveal animation triggers on entry.
- No accessibility regressions: heading hierarchy (`h1` → `h2`), buttons have accessible labels, toggle has correct ARIA roles.
- No console errors or hydration warnings.
