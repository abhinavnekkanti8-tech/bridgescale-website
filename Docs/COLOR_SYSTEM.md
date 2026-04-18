# BridgeScale — Finalized Color System

Live preview: [Docs/color-preview.html](./color-preview.html)

## Tokens

### Primary — crimson family (mono-accent)

| Token | Hex | Role |
|---|---|---|
| `--primary` | `#99081F` | Button fills, borders on selected chips/badges, form focus border, progress bar fill |
| `--primary-text` | `#BA0C2F` | Typography highlights (accented words in headings), primary links |
| `--primary-hover` | `#660013` | Button hover fill (BOTH primary and secondary buttons land here) |
| `--primary-light` | `#D63A56` | Highlight color for use on dark backgrounds |

### Neutrals (kept from existing system)

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#F5F3EF` | Page background (cream) |
| `--surface` | `#FFFFFF` | Card / input backgrounds |
| `--text` | `#0F0F0F` | Primary text |
| `--text-muted` | `#706B65` | Secondary text, muted links |
| `--border` | `#D9D4CC` | Default borders on inputs and unselected chips |
| `--muted-bg` | `#E8E4DE` | Info badge background, progress bar track (NEW token) |

### Error (distinct from brand red)

| Token | Hex | Role |
|---|---|---|
| `--error` | `#EF4444` | Error alert text, error border color |
| `--error-bg` | `rgba(239, 68, 68, 0.08)` | Error alert background |

## Dropped

All `--secondary-*` steel blue tokens (`#7E93B5`, `#6A80A3`, `#92A8C8`, `#EEF2F7`) and their aliases (`--color-accent-amber`, `--color-accent-violet`, `--grad-primary`, `--shadow-glow-amber`). Steel blue is fully removed from the palette — not used anywhere.

**No `--primary-bg` token exists.** There is no pink/rose tint in the system. Anywhere that previously filled with a red-tinted background now uses border + bold text (transparent fill) OR `--muted-bg` neutral.

## Interaction patterns

### Buttons

Primary (filled CTA):
```css
background: var(--primary);        /* #99081F */
color: white;
/* hover */
background: var(--primary-hover);  /* #660013 */
```

Secondary (outlined → filled inversion):
```css
background: transparent;
color: var(--primary);             /* #99081F text */
border: 1px solid var(--primary);  /* #99081F border */
/* hover */
background: var(--primary-hover);  /* #660013 fill */
color: white;
border-color: var(--primary-hover);
```

Both buttons converge on `#660013` at hover. Idle states remain distinct (filled vs outlined). No more "hover to black" — everything interactive lives in the red family.

Ghost (text-only):
```css
background: transparent;
color: var(--text-muted);
/* hover: color becomes var(--primary) */
```

### Chips

Selected state — **no fill tint**, just border + bold red text:
```css
background: transparent;
border: 1px solid var(--primary);
color: var(--primary);
font-weight: 600;
```

Hover state (unselected): `border-color: var(--primary)`.

### Badges

Primary / brand badge — border-only, matches chip pattern:
```css
background: transparent;
border: 1px solid var(--primary);
color: var(--primary);
font-weight: 600;
```

Info / meta badge — neutral fill:
```css
background: var(--muted-bg);
color: var(--text);
```

### Form inputs — red focus ring

```css
input:focus {
  outline: none;
  border-color: var(--primary);                    /* #99081F */
  box-shadow: 0 0 0 3px rgba(153, 8, 31, 0.12);    /* soft red halo */
}
```

### Progress indicator

```css
.progress      { background: var(--muted-bg); }   /* #E8E4DE warm neutral track */
.progress-bar  { background: var(--primary); }    /* #99081F crimson fill */
```

### Typography highlights

`.accent` class for highlighted words in headings uses the brighter text variant so it reads clearly as color at large serif sizes:
```css
.accent { color: var(--primary-text); }           /* #BA0C2F */
```

### Links

Primary link: `color: var(--primary-text)` (`#BA0C2F`), underlined.
Muted link: `color: var(--text-muted)` (`#706B65`).

## Files to update in the app

Central token definitions live in [frontend/src/app/globals.css](../frontend/src/app/globals.css) — lines 10-63.

Follow-up work required when applying:
- Update all components using `--color-accent*` to the new `--primary*` names (or keep the old names as aliases pointing at new values — pick one)
- Remove any hard-coded steel blue values (`#7E93B5`, `#6A80A3`, `#92A8C8`, `#EEF2F7`) across component CSS
- Remove any pink/rose tints (`--primary-bg` equivalents) across component CSS
- Audit error styling to ensure `#EF4444` stays distinct from `#99081F` / `#BA0C2F`
- Review form fields in [auth/login/page.module.css](../frontend/src/app/auth/login/page.module.css), [apply/apply.module.css](../frontend/src/app/for-companies/apply/apply.module.css), and the talent apply page for old steel-blue focus rings

## Why these choices

- **Mono-accent red** — strong brand identity, unified interaction language, no two-color ambiguity
- **Split text/fill shades** — `#BA0C2F` reads as clear *color* at text sizes; `#99081F` carries visual weight at fill sizes without shouting
- **No pink tints** — any low-alpha tint of red becomes pink; we sidestep that by using border-only selected states instead of background tints
- **Neutrals for utility UI** — info states, progress, structural elements use warm grays so they don't compete with the red accent
- **Convergent hover at `#660013`** — primary and secondary buttons both land on the same deep red on hover, giving the system a unified "pressed" feedback
