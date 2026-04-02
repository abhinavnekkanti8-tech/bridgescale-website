# BridgeScale Landing Page — Change Documentation

## Brand Changes

| Before | After |
|--------|-------|
| BridgeSales | **BridgeScale** |
| "senior operator" | **"senior talent"** |
| Accent: gradient (amber/blue) | **Accent: steel blue #7E93B5** |
| Font: Plus Jakarta Sans | **Headings: Playfair Display (serif), Body: DM Sans** |

---

## Structural Changes

### Sections Kept on Landing Page (in order)

| # | Section | Layout | Notes |
|---|---------|--------|-------|
| 1 | **Sticky Nav** | Horizontal | Links: For Companies, For Talent, About, Blog, CTA |
| 2 | **Hero** | Left-aligned | New headline + tagline + description + stat strip |
| 3 | **Marquee Strip** | Horizontal scroll | Outcomes + numbers alternating (not role names) |
| 4 | **The Gap** | Left-aligned header + split mosaic | Two-column problem cards |
| 5 | **Why Now** | Inverted dark bg, asymmetric 2-col | Text left, stat figures right as rows |
| 6 | **What We Offer** | Split header + 3-col numbered grid | Categories with pills + cross-capability strip |
| 7 | **Why BridgeScale** | Asymmetric left/right, 2×3 grid | Compact: title + proof line only, no paragraphs |
| 8 | **Standards & Principles** | Left-aligned header + 3-col grid | Merged: Vetting + AI + Principles |
| 9 | **Early Access CTA** | Asymmetric left/right | Two CTA cards routing to sub-pages |
| 10 | **Footer** | Dark bg | Brand + nav links |

### Sections Removed from Landing Page

| Section | Disposition |
|---------|-------------|
| How It Works (tabbed) | → Move to For Companies / For Talent pages |
| Our Vetting Standard (full) | → Condensed into Standards & Principles trust block |
| Two Sides. One Platform. | → Removed (redundant with sub-pages) |
| Fractional Engagement Structures | → Move to For Companies / For Talent pages |
| Satisfaction Guarantee | → Move to For Companies page |
| AI-Native Platform (full) | → Condensed into Standards & Principles trust block |
| Pricing | → Removed from landing page nav; pricing info on sub-pages |
| FAQs | → Move to For Companies / For Talent pages |
| Platform Principles (full) | → Condensed into Standards & Principles trust block |
| Signup Form | → Forms live on For Companies / For Talent pages only |

### Sections Added

| Section | Description |
|---------|-------------|
| **Why Now** | New inverted section with fractional hiring trend data + stat figures |
| **Standards & Principles** | New merged trust block (vetting + AI + principles in 3 cells) |

---

## Hero Text

**Headline:**
> The gap between your product and international growth isn't strategy. It's senior talent with the networks to open it.

**Tagline:**
> Fractional diaspora talent. Vetted & Scoped. Platform-managed.

**Description:**
> BridgeScale matches Indian startups and MSMEs with vetted diaspora sales leaders, pipeline builders, and BD operators — for fractional, scoped engagements that produce real commercial outcomes in international markets.

---

## Style & Layout Direction

### Anti-AI-Slop Principles Applied
- **No excessive centered layouts** — section headers are left-aligned, layouts vary per section
- **No uniform rounded corners** — sharp edges, 1px gap mosaics
- **No gradient backgrounds** — single accent color (#7E93B5), inverted dark for one section only
- **No Inter/generic sans** — Playfair Display serif for headings, DM Sans for body
- **Varying section rhythm** — asymmetric grids, split headers, different density per section

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| ink | `#0f0f0f` | Primary text, dark backgrounds |
| paper | `#f5f3ef` | Page background |
| smoke | `#706b65` | Secondary text |
| mute | `#9e9890` | Tertiary text |
| rule | `#d9d4cc` | Borders, dividers |
| steel | `#7E93B5` | Accent — labels, numbers, hover states |
| steel-dark | `#6a80a3` | Accent hover (buttons) |
| dark | `#111111` | Inverted section bg, footer bg |

### Typography
| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headings | Playfair Display | 600–700 | clamp(1.7rem–4rem) |
| Body | DM Sans | 300–400 | 0.875rem–1.1rem |
| Labels | DM Sans | 600 | 10.5–11px, uppercase, tracked |
| Stat figures | Playfair Display | 700 | 2–3.2rem |

### Layout Patterns
| Section | Layout Type |
|---------|------------|
| Hero | Full-width left-aligned |
| The Gap | Left header → full-width split mosaic |
| Why Now | Asymmetric 2-col (1fr / 1.4fr) on dark bg |
| Offerings | Split header (left/right) → 3-col grid |
| Why BridgeScale | Asymmetric 2-col (1fr / 1.6fr), sticky left, 2×3 grid right |
| Standards | Left header → 3-col grid |
| CTA | Asymmetric 2-col (1.2fr / 1fr) |

### Animations & Hover Effects
| Element | Effect |
|---------|--------|
| Sections | Fade-up on scroll (IntersectionObserver) |
| Nav links | Growing underline from left |
| Problem cards | Background lightens on hover |
| Offering cards | Bottom border sweeps from left + pills turn accent |
| Advantage cells | Bottom border sweep + background lightens |
| Stat figures | Color lightens on hover |
| Advantage rows (previous) | Translate right on hover |
| Side CTA cards | Arrow translates right + fades in |
| All buttons | Background/border color transition |
| Marquee | Continuous horizontal scroll, 50s loop |

### Marquee Content (alternating outcomes + numbers)
- Pipeline Generation · **73% cite GTM talent as #1 barrier**
- International Market Entry · **4× faster time-to-market**
- Channel & Partner Development · **6-week avg. to first activity**
- ICP Validation In-Market · **340% fractional hiring growth since 2020**
- Outbound Pipeline Build · **15% acceptance rate**
- Revenue Operating Cadence · **$0 full-time salary required**

---

## Nav Changes

| Before | After |
|--------|-------|
| How it works | Removed |
| For companies | **For Companies** (links to /for-companies) |
| For talent | **For Talent** (links to /for-talent) |
| Pricing | Replaced with **About** |
| — | Added **Blog** |
| Request early access | **Request Early Access** (links to #signup) |

---

## Pages Affected

| Page | Change |
|------|--------|
| **Landing page** (`/`) | Full restructure as documented above |
| **For Companies** (`/for-companies`) | Will receive: How It Works, Engagement Structures, FAQs, Signup Form (future) |
| **For Talent** (`/for-talent`) | Will receive: How It Works, FAQs, Signup Form (future) |
| **About** (`/about`) | New page (future) |
| **Blog** (`/blog`) | New page (future) |

---

## Files Changed

| File | Change Type |
|------|-------------|
| `frontend/src/app/page.tsx` | Full rewrite — new structure, copy, and components |
| `frontend/src/app/page.module.css` | Full rewrite — new styles matching prototype |
| `frontend/src/app/globals.css` | Updated — new CSS variables, font imports, accent colors |
| `frontend/src/app/layout.tsx` | Updated — font imports if needed |
