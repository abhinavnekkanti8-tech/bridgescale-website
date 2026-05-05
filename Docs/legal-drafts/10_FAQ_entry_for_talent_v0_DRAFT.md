# FAQ entry copy — `/for-talent` page

> **STATUS — SAMPLE ONLY. v0 DRAFT.**
> Founder approval required before this copy is moved to the website. Per the founder-approval workflow (Master Plan §7.4): drafts → founder approval → engineering → publish.
> Target file in the codebase: `frontend/src/content/faq.ts` — `talentFaqGroups` array, new group "Contracts, payments & compliance" (recommended).

---

## Recommended placement

Add a new FAQ group on `/for-talent`:

**Group heading:** *Contracts, payments & compliance*

Place this group **after** the existing "Engagements & pay" group, so the visual order on the page is:

1. Joining & vetting (existing — keep as is)
2. Engagements & pay (existing — keep as is)
3. **Contracts, payments & compliance** (new — this draft)

The new group has **one** entry at launch (this one).

---

## FAQ Entry — Draft Copy

### Q: What contracts will I sign and how do I get paid?

The first time you start an engagement with a new company, you'll sign a **Master Service Agreement** between you, the company, and BridgeScale. It covers payments, intellectual property, confidentiality, conversion to full-time, and non-circumvention. The MSA is reused if you do future engagements with the same company — you don't sign a new one each time.

For each engagement, you'll also review and sign a **Scope of Work** covering scope, deliverables, timeline, fees, hours cap, and reporting cadence. The SOW is drafted by BridgeScale from a service template after you and the company agree the commercial shape on a 30-minute introductory call. Before the MSA is signed, you and the company both review and confirm a **Pre-SOW Commercial Summary** — a non-binding one-pager that locks the commercial shape so neither side spends time on legal review until both sides are aligned.

Payment runs through BridgeScale. The company pays BridgeScale; BridgeScale pays you on the cadence specified in the SOW (typically the first business day of each month for Retainers; 50/50 for Sprints).

**Where does my payout land?** Pick what works for you:
- ACH (United States), if you're a US-resident operator
- Wise (cross-border), for most non-US payouts
- INR direct via Wise or Razorpay, if you want your payout in your Indian bank account (NRE / NRO / Savings) — useful for diaspora operators based abroad
- Through an Employer-of-Record partner, where your jurisdiction requires it for the engagement type and duration

**Tax forms** (W-9 for US persons, W-8BEN for non-US persons, GST/PAN for India-domiciled, VAT for EU/UK) are collected during operator onboarding before your first paid engagement. We collect basic tax-residency information when you complete your profile, and the full forms before the MSA is signed.

For corridors that require Employer-of-Record arrangements (typically long retainers in Germany / France / Netherlands / Spain / Ireland / Italy / Portugal), BridgeScale works through verified partners — Deel, Remote, or Multiplier. When EOR applies, the partner becomes your Employer of Record for the engagement and handles local employment paperwork, payroll, and statutory benefits. The EOR fee is paid by the company; it does not come out of your stated rate.

**The 10% platform fee** is paid by the company on top of your stated rate. It does not come out of your payout.

→ [View sample Master Service Agreement](/Docs/legal-drafts/01_MSA_BridgeScale_v0_DRAFT.md)
→ [View sample Scope of Work](/Docs/legal-drafts/02_SOW_BridgeScale_v0_DRAFT.md)
→ [View sample Pre-SOW Commercial Summary](/Docs/legal-drafts/03_PreSOW_Commercial_Summary_BridgeScale_v0_DRAFT.md)
→ [View Contracts & Payments FAQ (full)](/Docs/legal-drafts/08_Contracts_Payments_FAQ_BridgeScale_v0_DRAFT.md)

*All sample documents are marked SAMPLE while final versions are under counsel review.*

---

## Existing FAQ entries to update on the same page

These are corrections to the existing copy in `frontend/src/content/faq.ts`. Flow from Decision Register E2 / I5 / I6.

### Update — "Joining & vetting" → "Is it free to join?"

The current copy says: *"Yes. Creating your profile and completing your assessment is completely free. You only pay a one-time $50 fee when you're ready to unlock matching..."*

Change to:

> Yes. Creating your profile is completely free, and your profile gets considered for matching as soon as you complete it (along with basic tax residency and payout-preference information). You'll see blurred matches showing companies that could be a good fit. You pay a one-time **USD 50** activation fee to unblur the matches and start engaging — your full tax forms and KYC documents are collected later, before your first paid engagement.

### Update — "Joining & vetting" → "Do I need to leave my current job?"

The current copy is good — keep as is.

### Update — "Engagements & pay" → "How do I get paid?"

The current copy is good but light. Replace with the more detailed payment language in the new FAQ entry above, or shorten:

> Through BridgeScale's payment infrastructure. Payouts run via ACH (US), Wise (cross-border), or INR direct (Razorpay/Wise) for diaspora operators wanting payout to an Indian bank account. For corridors that require Employer-of-Record, BridgeScale routes through verified partners (Deel, Remote, Multiplier). See "What contracts will I sign and how do I get paid?" in the Contracts, payments & compliance section for full detail.

### Update — "Engagements & pay" → "What markets are in demand?"

The current copy is good — keep as is.

### Update — "Engagements & pay" → "Can a fractional engagement become full-time?"

Add the conversion-fee context to the existing answer:

> Yes — many do. A fractional engagement is the best audition process that exists: both you and the company assess fit through real work, not interviews. When it's the right match, the platform supports a smooth conversion to full-time. The company pays BridgeScale a conversion fee at that point — it does not come out of your future salary, and BridgeScale doesn't take it from your operator payout. The conversion-fee mechanics are spelled out in the Master Service Agreement.

---

## DRAFTER NOTES — REMOVE BEFORE PUBLICATION

- **Pricing numbers** — USD 50 / 10% / 25% reflect founder direction. Final approval needed before website publication.
- **Operator-onboarding gate language** — the "basic tax residency at profile completion; full forms before first paid engagement" framing matches the revised three-stage gate per Decision Register C2 and the founder direction. Counsel review for accuracy.
- **EOR mention** — included to set expectation. Counsel review of the EOR-mention language (per Decision Register I10) before final.
- **Indian payout language** — Wise + Razorpay both mentioned for breadth; refer to Contracts & Payments FAQ for detail. Counsel review of the FEMA/GST/TDS implications language (per Decision Register G2 / G3).
- **Sample-document links** — paths shown are placeholders. URL routing is a P4 task.
- **Tone consistency** — drafted to match existing operator-facing FAQ voice (warm, structural, operator-friendly).
- **The 10% platform fee disclosure to operators** — included explicitly so operators don't worry that the fee comes out of their rate. Critical for talent-acquisition trust per Master Plan §7.
- **Conversion-fee disclosure to operators** — added to clarify that the fee is a Company → BridgeScale flow, not Company → Operator. Operators sometimes worry conversion fees come out of their salary; explicitly addressed.
- **Founder approval workflow** — written approval per section before any of this is implemented in `frontend/src/content/faq.ts`.

---

*End of FAQ entry copy for `/for-talent` v0 DRAFT.*
