# FAQ entry copy — `/for-companies` page

> **STATUS — SAMPLE ONLY. v0 DRAFT.**
> Founder approval required before this copy is moved to the website. Per the founder-approval workflow (Master Plan §7.4): drafts → founder approval → engineering → publish.
> Target file in the codebase: `frontend/src/content/faq.ts` — `companiesFaqGroups` array, group "Working with our talent" or a new group "Contracts, payments & compliance" (recommended).

---

## Recommended placement

Add a new FAQ group on `/for-companies`:

**Group heading:** *Contracts, payments & compliance*

Place this group **after** the existing "Pricing & process" group, so the visual order on the page is:

1. Working with our talent (existing — keep as is)
2. Pricing & process (existing — keep as is, but update unlock fee to **₹8,500** per separate task P0.2)
3. **Contracts, payments & compliance** (new — this draft)

The new group has **one** entry at launch (this one). Additional FAQ entries may be added later as patterns emerge from real buyer questions.

---

## FAQ Entry — Draft Copy

### Q: How is an engagement structured legally?

Every engagement runs as a tri-party arrangement between BridgeScale, your company, and the operator. Two main documents:

**(1) Master Service Agreement.** Signed once between the three parties. Covers payments, intellectual property, conversion to full-time, confidentiality, and non-circumvention. Doesn't change per engagement — it's reused if you do future engagements with the same operator.

**(2) Scope of Work.** Signed per engagement. Covers scope, deliverables, timeline, fees, hours cap, and reporting cadence. Drafted by BridgeScale from a service template after you and the operator agree the commercial shape on a 30-minute introductory call.

Before either is signed, BridgeScale issues a **non-binding Pre-SOW Commercial Summary** — a one-pager that confirms the engagement type, indicative fee, term, and compensation mode. Both parties confirm the summary, then the MSA is signed, then the SOW is drafted and signed.

BridgeScale handles invoicing, ACH or local-equivalent payouts, US tax forms (W-9, W-8BEN, 1099-NEC), and Employer of Record where the operator's jurisdiction requires it. EOR fees, where applicable, are charged through to your company at cost as a separate line item.

→ [View sample Master Service Agreement](/Docs/legal-drafts/01_MSA_BridgeScale_v0_DRAFT.md)
→ [View sample Scope of Work](/Docs/legal-drafts/02_SOW_BridgeScale_v0_DRAFT.md)
→ [View sample Pre-SOW Commercial Summary](/Docs/legal-drafts/03_PreSOW_Commercial_Summary_BridgeScale_v0_DRAFT.md)
→ [View Contracts & Payments FAQ (full)](/Docs/legal-drafts/08_Contracts_Payments_FAQ_BridgeScale_v0_DRAFT.md)

*All sample documents are marked SAMPLE while final versions are under counsel review.*

---

## Existing FAQ entries to update on the same page

These are not new entries; they are corrections to the existing copy in `frontend/src/content/faq.ts`. They flow from Decision Register entries E2 / E3 / E4 / I5.

### Update — "Pricing & process" → "What does it cost?"

The current copy says: *"Signing up is free. You pay a one-time $100 fee to unlock matching..."*

Change to:

> Signing up is free. You pay a one-time **₹8,500** fee to unlock your match shortlist — this covers your AI-powered needs diagnosis and curated talent shortlist. Engagement pricing varies: Sprints from USD 2,500 for a 30–60 day project, Retainers from USD 5,000/month, with two flavours (Leadership Retainer for senior-leader engagements, Operator Retainer for execution work). Hybrid cash + equity, success-fee, and pure-equity advisory structures are also available. The platform charges a 10% service fee to the company on cash engagements — this is in addition to the operator's stated rate and does not reduce their payout. EOR fees, where applicable, are charged through at cost. No hidden costs.

### Update — "Working with our talent" → "What happens if I'm not satisfied with my match?"

The current copy is good — keep as is. The cancellation-policy specifics live in the new Contracts & Payments FAQ.

### Update — "Pricing & process" → "How quickly can I be matched?"

The current copy is good — keep as is.

---

## DRAFTER NOTES — REMOVE BEFORE PUBLICATION

- **Pricing numbers** — ₹8,500 / USD 50 / 10% / 25% all reflect founder direction at the time of drafting. Final approval needed before website publication.
- **EOR mention** — included to set expectation. Counsel review of the EOR-mention language (per Decision Register I10) before final.
- **Sample-document links** — paths shown above are placeholders pointing to the markdown drafts. At website publication time, these will resolve to PDFs hosted under `/legal/` or similar; URL routing is a P4 task.
- **"All sample documents are marked SAMPLE..." disclaimer** — keep this line. It manages buyer expectation.
- **Tone consistency** — drafted to match the existing FAQ voice (clear, structural, no marketing fluff).
- **Engagement-type language** — Sprint / Retainer with two flavours / Consultation. Stays consistent with master plan §2.5 and the website engagement-type cards (which need their own update per P4.1).
- **No mention of operator activation fee ($50)** — appropriate for a company-side FAQ; that fee is operator-facing.
- **Founder approval workflow** — written approval per section before any of this is implemented in `frontend/src/content/faq.ts`.

---

*End of FAQ entry copy for `/for-companies` v0 DRAFT.*
