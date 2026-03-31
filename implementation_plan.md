# Website Content Additions

Add 4 new sections to the landing page and create 2 dedicated pages.

## Landing Page Changes

**Current section flow:**
Nav → Hero → Marquee → Problem → Outcomes → **How It Works** → Two Sides → Categories → Engagement Structures → AI → Pricing → Signup → Footer

**New section flow:**
Nav → Hero → Marquee → Problem → Outcomes → **How It Works (expanded, tabbed)** → **Vetting Process** → Two Sides → Categories → Engagement Structures → **Satisfaction Guarantee** → AI → Pricing → **FAQ** → Signup → Footer

---

### 1. Expanded "How It Works" — Company & Talent Tabs

**Replaces** the existing How It Works section (lines 269–290).

Two clickable tabs: **"For Companies"** | **"For Talent"**, each showing a 4-step flow.

**For Companies:**
| Step | Title | Description |
|------|-------|-------------|
| 01 | Define what you need | Tell us where expert guidance could move the needle — growth, market entry, sales pipeline, channel development |
| 02 | Get matched with vetted talent | AI generates a ranked shortlist. Every recommendation includes explainable rationale — domain fit, geography, pricing alignment |
| 03 | Book a free consultation | Meet your top choices. 30-minute intro calls are always free. If it's not the right fit, come back anytime |
| 04 | Engage with confidence | Customised SoW, milestone tracking, platform oversight. We handle contracting, payments, and compliance |

**For Talent:**
| Step | Title | Description |
|------|-------|-------------|
| 01 | Apply & get vetted | Submit your profile. Complete our structured vetting — references, domain review, and pitch assessment |
| 02 | Get matched to opportunities | AI matches you to relevant companies based on your expertise, market knowledge, and engagement preferences |
| 03 | Engage on your terms | Choose your structure — advisory, sprint, retainer, or hybrid. Set your availability and pricing |
| 04 | Deliver & grow | Milestone-tracked engagements with platform support. Build your reputation and expand your fractional portfolio |

---

### 2. Vetting Process Section (NEW)

**Inserted after** How It Works, **before** Two Sides.

A visual 3-step pipeline showing how talent gets into the network:

| Step | Title | Description |
|------|-------|-------------|
| 01 | Verified references | Every applicant provides references from past clients/employers — including senior leaders and direct reports |
| 02 | Expert interview | A live video interview with a domain expert to assess communication, experience depth, and professionalism |
| 03 | Domain-specific assessment | For sales roles: a case study pitch. For leadership: a turnaround narrative with cross-functional metrics |

**Footer note:** *"Only applicants who pass all stages are accepted. We're selective because our companies need to trust who they hire."*

**Satisfaction Guarantee callout** will appear separately (see below).

---

### 3. Satisfaction Guarantee Badge

**Inserted after** Engagement Structures, **before** AI Section.

A compact, visually distinctive callout:
> **Not the right fit? We rematch at no cost.**
> If a match doesn't work out, we'll connect you with a new professional from our network — no additional fees. We vet and stand by our talent.

Styled as a bordered highlight card with a shield/guarantee icon.

---

### 4. FAQ Accordion Section

**Inserted after** Pricing, **before** Signup.

10 questions in an expandable accordion (click to expand/collapse), grouped:

**For Companies:**
1. What's the difference between an advisor, consultant, and fractional executive?
2. How does the matching process work and how quickly?
3. What if the match isn't right?
4. How does payment work?
5. Can I hire the fractional person full-time?

**For Talent:**
6. What's the vetting process like?
7. What engagement types are available?
8. How does compensation work?
9. Can I work with multiple companies?
10. What's the time commitment?

---

## New Pages

### Page 1: `/for-companies`

A dedicated page for the company audience with deeper content:
- Hero: "Find vetted fractional talent for international growth"
- What we solve (expanded problem statement)
- How matching works (company-focused 4 steps)
- What results to expect (stats: meetings booked, revenue generated)
- Engagement types explained (Consultation / Sprint / Retainer / Hybrid)
- Pricing breakdown
- CTA → links to `#signup` on homepage

### Page 2: `/for-talent`

A dedicated page for the talent audience:
- Hero: "Structured fractional work. Fair compensation. Real impact."
- Why BridgeSales (vs unpaid mentoring, advisory, or angel investing)
- Vetting process (detailed 3-step)
- How engagement works (talent-focused steps)
- Compensation structures (retainer, success-fee, equity, hybrid)
- CTA → links to `#signup` on homepage

---

## Files Changed

| Action | File |
|--------|------|
| MODIFY | `frontend/src/app/page.tsx` — replace How It Works, add Vetting, Guarantee, FAQ sections |
| MODIFY | `frontend/src/app/page.module.css` — add styles for tabs, vetting pipeline, guarantee badge, FAQ accordion |
| NEW | `frontend/src/app/for-companies/page.tsx` |
| NEW | `frontend/src/app/for-companies/companies.module.css` |
| NEW | `frontend/src/app/for-talent/page.tsx` |
| NEW | `frontend/src/app/for-talent/talent.module.css` |
| MODIFY | Nav links in `page.tsx` — link "For companies" and "For talent" to new pages |

## Verification

- `npm run build` — no TypeScript errors
- Visual check in browser for all new sections
- Tab switching works on How It Works
- FAQ accordion expands/collapses
- New pages render and link back to homepage
