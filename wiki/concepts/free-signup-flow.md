# Concept: Free Signup Flow

*Cross-cuts: applications · auth · frontend-startup · frontend-operator · payments*

---

## What it is

Phase 2's central change: signup is free, matching is paid later. Before Phase 2, users had to pay at the point of application. Now:

1. `POST /api/v1/applications` creates the application + user + org + membership in one transaction
2. Session cookie is set immediately → user is auto-logged in
3. Frontend hard-redirects to `/startup/dashboard` or `/operator/dashboard`
4. Matching runs in the background (stored but hidden)
5. User pays ₹8,500 (company) or $50 (talent) from the dashboard to unlock their matches

---

## State machine

```
Signup
  │
  ├── Company:    SUBMITTED ──────────────────────→ (review) → APPROVED
  │                                                              ↓
  │                                               pays → matchingUnlocked=true
  │
  └── Talent:
        ├── All steps done:  SUBMITTED ──────────→ (review) → APPROVED
        │                                                         ↓
        │                                        pays → matchingUnlocked=true
        │
        └── Steps skipped:  AWAITING_COMPLETION
                                 ↓
                    /complete-assessment + /complete-references
                                 ↓
                             SUBMITTED
```

---

## Key flags on `Application`

| Flag | Meaning |
|------|---------|
| `assessmentSkipped` | Talent skipped case study at signup |
| `referencesSkipped` | Talent skipped references at signup |
| `assessmentCompletedAt` | When talent completed assessment from dashboard |
| `referencesCompletedAt` | When talent completed references from dashboard |
| `matchingUnlocked` | True after payment confirmed |
| `matchingUnlockedAt` | When unlocked |

---

## What "unlock matching" does

On payment confirmation (`unlockMatching()` in ApplicationsService):
1. Sets `application.matchingUnlocked = true` + `matchingUnlockedAt = now`
2. For companies: triggers `generateDiagnosisForApplication` (async)
3. Frontend re-fetches and shows unblurred match cards

---

## Pending work (as of 2026-04-27)

- `BlurredMatchCard.tsx` — component not yet extracted (inline in startup dashboard)
- `UnlockMatchingCTA.tsx` — component not yet extracted (inline in startup dashboard)
- `CompletionChecklist.tsx` — component not yet extracted (inline in operator dashboard)
- Operator unlock payment button — missing from operator dashboard (Task 2.8)
- Match score display — not yet shown on match cards (Task 2.7)
