# BridgeScale Legal Drafts

This folder holds **placeholder versions** of every legal/commercial document that will eventually be linked from the BridgeScale website or used in the engagement flow. They are produced before legal counsel finalises them, so the build can proceed in parallel with legal review.

## Status of every document in this folder

| Document | Status | Final form expected |
|---|---|---|
| `01_MSA_BridgeScale_v0_DRAFT.md` | DRAFT — for founder review | Phase 5 (after counsel) |
| `02_SOW_BridgeScale_v0_DRAFT.md` | Pending | Phase 5 |
| `03_PreSOW_Commercial_Summary_BridgeScale_v0_DRAFT.md` | Pending | Phase 5 |
| `04_Addendum_Hybrid_Cash_Equity_v0_DRAFT.md` | Pending | Phase 5 |
| `05_Addendum_Success_Fee_v0_DRAFT.md` | Pending | Phase 5 |
| `06_Addendum_Equity_Only_v0_DRAFT.md` | Pending | Phase 5 |
| `07_Addendum_Conversion_v0_DRAFT.md` | Pending | Phase 5 |
| `08_Contracts_Payments_FAQ_BridgeScale_v0_DRAFT.md` | Pending | Phase 5 |
| `09_Cancellation_Policy_Plain_English_v0_DRAFT.md` | Pending | Phase 5 |

## Strict authorship rules

1. **All documents are BridgeScale-rewritten.** Knex (or any other platform's) document text must never appear verbatim. Knex documents in `BridgeScale Research Docs/` are reference only — used to inform structure, never copied.
2. **Every document carries a "SAMPLE — being finalised" banner** until it passes Phase 5 legal review.
3. **No claim made in a placeholder is binding** until counsel has reviewed it. Each document has a "Counsel Review Status" line at the top.
4. **Versioning** — `_v0_DRAFT` for placeholders; `_v1_REVIEWED` after founder evaluation; `_v2_LEGAL_APPROVED` after counsel. Never overwrite previous versions; create new files alongside the old.
5. **Naming convention** — `NN_DocumentName_BridgeScale_vN_STATUS.md`. The two-digit prefix orders the folder; the document name is descriptive; the version + status give clear lineage.

## Workflow per document

```
Outside Advisor produces v0_DRAFT
  → Founder reviews and marks up inline (# comments)
  → Outside Advisor produces v1_REVIEWED with edits
  → Linked from website with "SAMPLE" banner (Phase 4)
  → Sent to legal counsel (Phase 5)
  → Counsel produces v2_LEGAL_APPROVED
  → Replaces placeholder URL on website (Phase 6)
```

## File-format note

Markdown is the working format inside this folder — easy to diff, easy to mark up. PDF/DOCX renders for the website are produced from the approved markdown at Phase 4 (placeholder publishing) and Phase 6 (final publishing). Do not maintain parallel Word and Markdown copies — Markdown is canonical.
