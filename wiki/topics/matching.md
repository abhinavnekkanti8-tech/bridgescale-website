# Matching

*Sources: `backend/src/matching/` · `backend/src/application-matching/` · `backend/prisma/schema.prisma`*

---

## Purpose
[coverage: high]

Generates ranked shortlists of operator candidates for a company (startup profile). Matching runs in the background after a company submits their application. Results are stored but hidden until the company pays to "unlock matching." The algorithm is deterministic (scoring function, no LLM for ranking itself).

---

## Architecture
[coverage: high]

```
MatchingController          ← admin + startup-facing endpoints
  └── MatchingService
        ├── PrismaService   (load startup profile, all verified operators, write shortlist)
        └── AiService       (getModelName for metadata — not used for scoring)

ApplicationMatchingController  ← thin wrapper for startup to view their shortlist
  └── ApplicationMatchingService
```

The core scoring is a pure function `computeMatchScore(startup, operator)` — no external dependencies, no LLM calls.

---

## Talks To
[coverage: medium]

| Module | How |
|--------|-----|
| `applications` | `triggerInternalMatching` called after company signup |
| `prisma` | Reads `StartupProfile`, all `VERIFIED` `OperatorProfile`s; writes `MatchShortlist` + `MatchCandidate` |
| `sow` | `StatementOfWork` references the `shortlistId` (after operator selection) |

---

## API Surface
[coverage: high]

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/v1/matching/shortlists` | PLATFORM_ADMIN | Generate shortlist for a startup |
| `GET` | `/api/v1/matching/shortlists` | PLATFORM_ADMIN | List all shortlists |
| `GET` | `/api/v1/matching/shortlists/:id` | PLATFORM_ADMIN | Get shortlist with candidates |
| `POST` | `/api/v1/matching/shortlists/:id/publish` | PLATFORM_ADMIN | Publish shortlist to startup |
| `POST` | `/api/v1/matching/candidates/:id/respond` | OPERATOR | Operator accepts/declines interest |
| `POST` | `/api/v1/matching/shortlists/:id/select/:candidateId` | STARTUP_ADMIN | Startup selects an operator |
| `GET` | `/api/v1/application-matching/my-shortlist` | STARTUP_ADMIN | Startup views their shortlist |

---

## Data
[coverage: high]

**Scoring — 7 components, max 100:**

| Component | Max | Signal |
|-----------|-----|--------|
| `laneAlignment` | 20 | Sales motion vs. operator lanes |
| `regionOverlap` | 15 | Startup target markets vs. operator regions |
| `budgetFit` | 15 | Startup budget band |
| `experienceRelevance` | 15 | Operator years experience |
| `availabilityMatch` | 10 | Fixed at 8 (stub — not yet dynamic) |
| `tierBonus` | 15 | Operator tier (A=15, B=10, C=5, Unverified=0) |
| `motionFit` | 10 | Derived from `laneAlignment` |

**Shortlist composition (up to 5 candidates):**
- Hard filter: `laneAlignment > 0` required
- Up to 2 Tier A operators prioritized
- Fill to 4 from top-scored remaining
- 1 "adjacent fit" from the middle of the remaining pool

**Key models:**
- `MatchShortlist` — one per startup profile, status: `DRAFT → PUBLISHED → SELECTION_MADE | EXPIRED`
- `MatchCandidate` — per operator on the shortlist, status: `SHORTLISTED → INTERESTED/DECLINED → SELECTED/PASSED`

---

## Key Decisions
[coverage: high]

**Deterministic scoring, no LLM for ranking:** The match score is computed by `computeMatchScore` — a pure function. LLM is only used for generating the explanation text per candidate (`generateExplanation`). This makes matching fast, reproducible, and auditable.

**Results stored pre-payment:** Matching runs immediately after company signup. The data sits in the DB but the frontend shows blurred cards until `matchingUnlocked = true`. The paywall is enforced in the frontend, not the API.

**Adjacent-fit candidate:** One deliberately lower-scored candidate is included in every shortlist for diversity of perspective. It's flagged in the explanation text.

**Operator selection requires acceptance:** `selectOperator` enforces `candidate.interest === 'ACCEPTED'` — a startup cannot select an operator who hasn't expressed interest.

---

## Gotchas
[coverage: medium]

- `availabilityMatch` is always 8 — the dynamic availability check is not yet implemented.
- The scoring function checks `sMotion === 'PARTNERSHIPS'` but the `SalesMotion` enum uses `PARTNER_LED`. This can cause BD_SPRINT to never score 20 for laneAlignment. Needs alignment.
- `computeMatchScore` casts operator and startup to `Record<string, unknown>` — type safety is weak here.
- There must be at least one `VERIFIED` operator or the endpoint throws `BadRequestException`. Check `OperatorProfile.verification` in the DB if shortlists aren't generating.
