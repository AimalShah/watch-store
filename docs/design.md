# Anfal Watch Store — Design System & Page Spec

> **Source of truth:** [design/anfal_monochrome/DESIGN.md](../design/anfal_monochrome/DESIGN.md) for exact color, typography, and spacing tokens.

## Design Philosophy

Monochrome minimalism where product imagery is the hero. The UI recedes —
typography and whitespace carry the personality. Dark/light mode is first-class
from day one. The brand personality is prestigious, quiet, and authoritative —
a high-end boutique aesthetic where product photography provides the color and
texture.

## Color System (CSS Custom Properties)

See `design/anfal_monochrome/DESIGN.md` for full token list.

```css
:root {
  /* Light mode — MD3 naming */
  --surface:                #f9f9f9;
  --surface-dim:            #dadada;
  --surface-container-low:  #f3f3f3;
  --surface-container:      #eeeeee;
  --surface-container-high: #e8e8e8;
  --on-surface:             #1a1c1c;
  --on-surface-variant:     #444748;
  --outline:                #747878;
  --outline-variant:        #c4c7c7;

  --primary:                #000000;
  --on-primary:             #ffffff;
  --primary-container:      #1c1b1b;
  --secondary:              #5e5e5e;
  --secondary-container:    #e4e2e2;

  --error:                  #ba1a1a;
  --error-container:        #ffdad6;

  --background:             #f9f9f9;
  --on-background:          #1a1c1c;
}

[data-theme="dark"] {
  --surface:                #0a0a0a;
  --surface-dim:            #141414;
  --surface-container-low:  #141414;
  --surface-container:      #1a1a1a;
  --surface-container-high: #222222;
  --on-surface:             #f0f0f0;
  --on-surface-variant:     #999999;
  --outline:                #555555;
  --outline-variant:        #333333;

  --primary:                #ffffff;
  --on-primary:             #000000;
  --primary-container:      #e5e2e1;
  --secondary:              #999999;
  --secondary-container:    #333333;

  --error:                  #ffb4ab;
  --error-container:        #93000a;

  --background:             #0a0a0a;
  --on-background:          #f0f0f0;
}
```

**Depth via tonal layers** — no drop shadows. Elevation is expressed through
surface color shifts (e.g., card on `--surface-container` against
`--background`).

## Typography

| Style           | Font        | Weight | Size   | Line H | Tracking |
|-----------------|-------------|--------|--------|--------|----------|
| display-lg      | Roboto      | 700    | 64px   | 1.1    | -0.02em |
| headline-lg     | Roboto      | 700    | 40px   | 1.2    | -0.01em |
| headline-lg-mob | Roboto      | 700    | 32px   | 1.2    | —       |
| headline-md     | Roboto      | 700    | 24px   | 1.3    | —       |
| price-display   | Roboto      | 700    | 20px   | 1      | —       |
| body-lg         | Inter       | 400    | 18px   | 1.6    | —       |
| body-md         | Inter       | 400    | 16px   | 1.6    | —       |
| label-sm        | Inter       | 600    | 12px   | 1      | 0.05em |

**Labels** use small caps with increased letter spacing for category tags and
specs. Prices always use `price-display`.

## Shapes — Sharp (0)

All elements have **0px border radius**: buttons, inputs, images, cards,
containers. This mirrors precision engineering of horology and creates an
architectural, curated feel.

## Spacing

Tokens from the design system: 4px base.

| Token  | Value  |
|--------|--------|
| xs     | 4px    |
| sm     | 8px    |
| md     | 16px   |
| lg     | 24px   |
| xl     | 32px   |
| xxl    | 64px   |
| section| 128px  |

Container max: 1440px. Gutter: 24px. Desktop margins: min 64px. Mobile margins:
16px.

## Components

**Buttons** — Solid primary color with contrasting text. No rounded corners.
Hover: slight opacity shift or color inversion.

**Input fields** — Bottom-border (underline style) or full 1px border. Use
`label-sm` for floating labels.

**Product Cards** — No borders, no shadows. Full-width image (no padding),
text left-aligned underneath with generous padding.

**Chips/Badges** — Rectangular with 1px border, no solid fills except for
critical status ("Sold Out").

**Lists** — Clean dividers using 1px outline. High vertical padding (md/lg).

**Navigation** — Minimalist text links in `label-sm` style. Active state: dot
indicator or underline.

## Pages

---

### 1. Home Page (`/`)

Layout: Full-bleed sections stacked vertically.

1. **Hero** — 100vh.
   - Full-bleed product image with dark gradient overlay.
   - Heading (`display-lg`), tagline (`body-lg`), CTA button.
   - Animation: GSAP slow zoom (1→1.05), content fades up with stagger.
   - Lenis smooth scroll throughout.

2. **Featured Watches** — Grid (2 cols mobile, 3 cols tablet, 4 cols desktop).
   - Featured products (max 8, flagged in admin).
   - GSAP ScrollTrigger: cards fade+slide up on scroll.

3. **Why Shop With Us** — 3-column grid: icons + headings + text.

4. **Social bar** — "Follow us on Instagram" link.

**Footer** — Logo, nav links, "Powered by Anfal Watches", dark/light toggle.

### 2. Catalog Page (`/watches`)

Left sidebar filter + right product grid. Collapses to top bar on mobile.

**Filters:** Search, categories (highlight active), price range, sort (Newest,
Price Low–High, Price High–Low), Clear All.

**Product grid:** Uniform cards (2/3/4 cols), "Load More" pagination, empty state.

**Product Card:**
- Full-bleed 1:1 image (no border/radius)
- Category label (`label-sm`)
- Product name (`headline-md` on desktop, 2-line clamp)
- Price (`price-display`)
- "Buy on WhatsApp" button (full-width, sharp corners)
- Hover: image scale 1.05x

### 3. Product Detail Page (`/watch/:slug`)

Two columns on desktop (image left, info right), single column on mobile.

**Left:** Main image (1:1, click for lightbox), thumbnail strip (max 3).

**Right:** Breadcrumb, product name (`headline-lg`), price (`price-display`),
stock indicator, description (`body-md`), quantity selector (min 1, max =
stock), order form (name, phone with +92 prefix, address). Submit → save to
DB → WhatsApp redirect.

### 4. About / Contact / FAQ Pages

- `/about` — Store story, team photo.
- `/contact` — WhatsApp link, social links, optional form.
- `/faq` — Accordion: common questions.

### 5. Admin Panel (`/admin`)

shadcn/ui React islands in Astro. Collapsible sidebar on mobile.

**Pages:** Dashboard (stats cards + recent orders), Products (table + form),
Categories (table + modal), Orders (table + confirm), Stock (table + quick
adjust).

## Animations (GSAP + Lenis)

| Page   | Element         | Trigger          | Animation                    |
|--------|-----------------|------------------|------------------------------|
| Home   | Hero content    | Page load        | Fade up + stagger (0.2s)     |
| Home   | Hero image      | Page load        | Zoom 1→1.05 (2s)             |
| Home   | Featured cards  | Scroll into view | Fade+slide up, 0.1s stagger  |
| Home   | Why section     | Scroll into view | Icons draw in, text fades up |
| Catalog| Cards           | Scroll into view | Fade+slide up, 0.05s stagger |
| All    | Smooth scroll   | —                | Lenis                        |

## Responsive Breakpoints

| Breakpoint | Width      |
|------------|------------|
| Mobile     | < 640px    |
| Tablet     | 640–1024px |
| Desktop    | > 1024px   |

## Accessibility

- Skip-to-content link
- Focus outlines (keyboard nav)
- ARIA labels on icons/buttons
- WCAG AA contrast on both themes
- Form inputs with visible labels
- Theme toggle respects `prefers-color-scheme` on first visit
