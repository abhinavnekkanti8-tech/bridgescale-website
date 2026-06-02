# Founder Copy Approval Tracker

**Date initiated:** 2026-05-01
**Maintained by:** Marketing/engineering during Phase 4 ship work; updated weekly.
**Per:** Implementation Plan §P4.10 — every public-facing string requires founder approval before publication.

## How to use this tracker

Every time a public-facing string is added or changed, log a row below with:
- **Surface** — page or component (e.g. `/learn`, `for-companies/page.tsx`).
- **Element** — section name or specific element.
- **Status** — `Draft` / `Pending Approval` / `Approved` / `Blocked by legal review`.
- **Reviewer** — who approved (or who's blocking).
- **Date** — when status last changed.
- **Notes** — anything that changes the meaning (legal claim, payment number, EOR mention, etc.).

Anything **Blocked by legal review** must reference a specific Phase-5 task in the Implementation Plan (P5.1–P5.11). Anything **Approved** must have a written sign-off (Slack message, email, PR comment) linked in Notes.

---

## High-risk copy areas (require legal review before approval)

These require either Phase 5 sign-off or counsel review **before** they leave Draft:

| Area | Why high-risk | Phase 5 dependency |
|---|---|---|
| 1099-NEC handling | US tax law representation | P5.4 (tax counsel) |
| EOR availability per corridor | Implies platform can deliver in jurisdictions before partner contracts signed | P5.6 (partner contracts) + P5.7 (Indian payout corridor rules) |
| Tax-form handling (W-9 / W-8BEN / GST/PAN / VAT) | Direct tax advice | P5.4 |
| Corridor-specific compliance claims | Per-country tier risk language | P5.5 |
| Conversion fee enforceability (25%, 12-month window) | Contract enforceability | P5.10 |
| Non-circumvention (12-month) | Enforceability varies by jurisdiction | P5.11 |
| INR payout language (NRE / NRO / Razorpay direct) | FEMA / GST / TDS / DTAA implications | P5.7 |
| Pre-SOW Summary "non-binding" framing | Must hold in target jurisdictions | P5.9 |

---

## Tracker rows

### `/for-companies`

| Element | Status | Reviewer | Date | Notes |
|---|---|---|---|---|
| Hero copy ("Find vetted fractional talent for international growth") | Draft | — | 2026-05-01 | Existing copy; pre-Phase-4 |
| "How matching works" steps (Step 01 = AI Diagnosis) | Draft | — | 2026-05-01 | Renamed in Phase 4 sweep |
| Engagement-types grid (Consultation / Sprint / Retainer + flavours) | Draft | — | 2026-05-01 | New 3-card structure |
| Add-ons strip (Success-fee / Equity-only / Conversion to full-time) | Draft | — | 2026-05-01 | Mentions conversion fee — flag for P5.10 |
| FAQ "What does it cost?" answer (₹8,500 INR) | Draft | — | 2026-05-01 | Pricing copy |
| FAQ "Contracts, payments & compliance" group | **Blocked by legal review** | — | 2026-05-01 | Links to sample MSA / SOW / Pre-SOW / Contracts FAQ. Holds for P5.1, P5.2, P5.4 |

### `/for-talent`

| Element | Status | Reviewer | Date | Notes |
|---|---|---|---|---|
| Hero copy | Draft | — | 2026-05-01 | Existing |
| Six public role buckets (names locked per Decision Register A4 / I8) | Draft | — | 2026-05-01 | Names locked, descriptions need approval |
| FAQ "Is it free to join?" ($50 activation) | Draft | — | 2026-05-01 | Pricing |
| FAQ "Contracts & payment" group | **Blocked by legal review** | — | 2026-05-01 | Same legal block as the company-side group |

### `/learn`

| Element | Status | Reviewer | Date | Notes |
|---|---|---|---|---|
| Hero copy | Draft | — | 2026-05-01 | New page |
| When-fractional-makes-sense cards (3 + 3) | Draft | — | 2026-05-01 | Includes ₹40–80 lakh wrong-hire framing — flag for legal sanity check |
| Wrong-hire-cost calculator defaults (₹35L / 20% / 6mo / ₹5L / 30%) | Draft | — | 2026-05-01 | Numbers need founder + finance sign-off |
| Engagement-type cards (4 — Retainer split into Leadership/Operator) | Draft | — | 2026-05-01 | USD bands are placeholders pending finance lock |
| Role × engagement matrix (USD bands per cell) | Draft | — | 2026-05-01 | All USD bands placeholders |
| Cross-cutting FAQ — How matching works | Draft | — | 2026-05-01 | Includes "AI Diagnosis" phrasing |
| Cross-cutting FAQ — Contracts | **Blocked by legal review** | — | 2026-05-01 | P5.1 / P5.2 |
| Cross-cutting FAQ — Payments (10% fee, ₹8,500 unlock, USD 50 activation, EOR routing) | **Blocked by legal review** | — | 2026-05-01 | EOR list of countries (DE/FR/NL/ES/IE/PT/IT) needs P5.5 + P5.6 confirmation before publication |
| Cross-cutting FAQ — Conversion to full-time (25% fee, 12-month window) | **Blocked by legal review** | — | 2026-05-01 | P5.10 |
| Cross-cutting FAQ — Cancellation, IP, edge cases | Draft | — | 2026-05-01 | Cancellation rules need finance review on refund tiers |

### Sample legal documents (`frontend/public/legal/`)

| Document | Status | Notes |
|---|---|---|
| `msa-sample.pdf` | **Sample only — finalised version coming soon** | Source: `Docs/legal-drafts/01_MSA_BridgeScale_v0_DRAFT.md`. Watermarked. Replace per P6.1 once P5.1 returns final template. |
| `sow-sample.pdf` | **Sample only** | Per P6.1 / P5.2 |
| `pre-sow-summary-sample.pdf` | **Sample only** | Per P6.1 / P5.9 |
| `contracts-payments-faq-sample.pdf` | **Sample only** | Per P6.1 / P5.4 |
| `addendum-hybrid-cash-equity-sample.pdf` | **Sample only** | Per P6.1 / P5.3 (securities counsel) |
| `addendum-success-fee-sample.pdf` | **Sample only** | Per P6.1 / P5.3 |
| `addendum-equity-only-sample.pdf` | **Sample only** | Per P6.1 / P5.3 (securities counsel) |
| `addendum-conversion-sample.pdf` | **Sample only** | Per P6.1 / P5.10 |

---

## Source-of-truth decision

- **Editorial source of truth:** `Docs/legal-drafts/*.md`. Update copy here first.
- **Served-to-public source of truth:** `frontend/public/legal/*.pdf`. Regenerate from the markdown via `outputs/md_to_pdf.py`.

When Phase 5 returns finalised templates:
1. Update markdown in `Docs/legal-drafts/`.
2. Regenerate the PDFs (rename script's NAME_MAP to point at new files, drop the SAMPLE watermark).
3. Move PDFs to `frontend/public/legal/` (overwriting samples).
4. Bump version reference in this tracker and in `frontend/src/content/faq.ts` (`sampleDocs`).

---

## What is *not* covered here

- In-app strings (dashboards, panels, modals). Most are operational rather than marketing — they don't need founder approval per the plan, but high-claim copy (legal/payment/tax/EOR) should still be flagged.
- Email templates and notification copy — covered by a separate email-copy review process (TBD).
- Error messages — engineering owns these directly.

---

## History

| Date | Change |
|---|---|
| 2026-05-01 | Initial tracker. All current Phase-4 copy logged as Draft or Blocked by legal review. |
