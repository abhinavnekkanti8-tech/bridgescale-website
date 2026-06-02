# Phase 1 — Operating Matrix vs. Seeded Combinations Validation

**Date:** 2026-05-01
**Source of truth:** `BridgeScale_Operating_Matrix.xlsx` → sheet `06_Combinations` (19 curated rows).
**Compared against:** `backend/prisma/seed.ts` → `seedRoleTemplateEngagementCombinations()` (108 generated rows).

## Result

The seed and the matrix **do not agree**.

- **Matrix unique tuples** (after expanding "VP Sales / VP Revenue / CRO" and "SDR / BDR" rows): **33**.
- **Seeded tuples**: **108**.
- **In matrix but missing from seed**: **18** (gaps the matching engine can't satisfy).
- **In seed but not in matrix**: **93** (the seed is over-permissive — combinations the matching engine will surface that legal/ops never approved).

## Gaps — combinations the matrix has but the seed is missing

These eighteen rows mean the matching engine and SOW generator cannot today produce a SOW for an engagement the matrix explicitly endorses:

| Role | Service Template | Engagement |
|---|---|---|
| BDR | PIPELINE_SPRINT | RETAINER |
| CHANNEL_LEAD | PARTNER_CHANNEL_DEVELOPMENT | RETAINER |
| CRO | GTM_STRATEGY | RETAINER |
| CRO | GTM_STRATEGY | SPRINT |
| CRO | REVENUE_CADENCE_SETUP | SPRINT |
| HEAD_OF_SALES | PIPELINE_SPRINT | SPRINT |
| OUTBOUND_OPERATOR | ICP_REFINEMENT | SPRINT |
| PARTNERSHIPS_LEAD | INTL_MARKET_ENTRY | RETAINER |
| PARTNERSHIPS_LEAD | INTL_MARKET_ENTRY | SPRINT |
| REVOPS | REVENUE_CADENCE_SETUP | RETAINER |
| SALES_OPS | REVENUE_CADENCE_SETUP | RETAINER |
| SDR | PIPELINE_SPRINT | RETAINER |
| VP_REVENUE | GTM_STRATEGY | RETAINER |
| VP_REVENUE | GTM_STRATEGY | SPRINT |
| VP_REVENUE | REVENUE_CADENCE_SETUP | SPRINT |
| VP_SALES | GTM_STRATEGY | RETAINER |
| VP_SALES | GTM_STRATEGY | SPRINT |
| VP_SALES | REVENUE_CADENCE_SETUP | SPRINT |

Root cause: the seed treats `service_template.engagementType` as the *single* allowed engagement for each template. The matrix shows the same template often supports multiple engagement types (e.g. GTM_STRATEGY runs as Consultation, Sprint, *and* Retainer). The seed needs a many-to-many shape.

## Over-permissive — combinations the seed allows but the matrix doesn't

93 seeded rows lack matrix backing. A few examples:

- AE × CUSTOMER_SUCCESS_RETENTION × RETAINER (matrix only allows AE × Pipeline Sprint × Sprint and AE × Closing Support × Retainer)
- ALLIANCES_LEAD × PARTNER_CHANNEL_DEVELOPMENT × SPRINT (matrix doesn't list Alliances Lead — only BD Lead, Partnerships Lead, Channel Lead)
- BDR × CLOSING_SUPPORT × RETAINER (matrix only lists Pipeline Sprint for BDRs)
- VP_SALES × INTL_MARKET_ENTRY × CONSULTATION (not in matrix)
- Every leadership role × CLOSING_SUPPORT × RETAINER (matrix only allows Head of Sales for Closing Support)

Root cause: the seed's `combinationsFor(role)` function applies a coarse role-bucket rule (Leadership → 4 templates, BD → 4 templates, Execution → 6 templates), then fans out to every template. The matrix is curated per role, not per bucket.

## Recommendation

Replace `seedRoleTemplateEngagementCombinations()` with a hand-authored list that mirrors the matrix exactly, sourced from the spreadsheet. Two approaches:

**Option A: Inline the matrix as a constant in `seed.ts`** (fastest):
```ts
const MATRIX = [
  { roles: ['VP_SALES','VP_REVENUE','CRO'], template: 'GTM_STRATEGY', engagements: ['CONSULTATION','SPRINT','RETAINER'] },
  { roles: ['VP_SALES','VP_REVENUE','CRO'], template: 'FOUNDER_LED_SALES_TRANSITION', engagements: ['RETAINER'] },
  // ... 17 more rows
];
```

**Option B: Read the xlsx at seed time** via the `xlsx` package. Single source of truth, but adds a build dependency to the seed step.

Pick A unless the matrix is going to change frequently before legal lock.

After the swap, also update the `service_template.engagementType` field — it's currently misleading (says GTM_STRATEGY is only CONSULTATION when the matrix shows it across all three engagement types). Either remove the field, or change it to a "default engagement" hint and let `RoleTemplateEngagementCombination` rows be the authoritative many-to-many.

## How to re-run this validation

```bash
cd backend
npm i -D xlsx        # one-time
npx ts-node scripts/validate-matrix.ts
```

The script (`backend/scripts/validate-matrix.ts`) loads the live `RoleTemplateEngagementCombination` rows from the dev DB and diffs against `BridgeScale_Operating_Matrix.xlsx`. Output is the two lists above.

## What's not in this validation

- **Cell-level details** (price band, comp modes allowed, addenda required, cancellation rule, MSA-required flag). The matrix carries all six per row — the seed only stores the role + template + engagement triple. If those fields matter at runtime (e.g. for the SOW generator), they should be added to the `RoleTemplateEngagementCombination` model and seeded from the matrix's columns D–H.
- **Compensation modes** (sheet 07_Compensation_Modes), **Compliance modes** (08), **Tax form decision** (09), **Country tier map** (10) — those should be Phase 5 deliverables and sit in their own validation passes once counsel returns.

---

**Owner:** Engineering + Founder (deciding which direction to take)
**Suggested next:** Option A swap, then re-run this script to confirm matrix == seed.
