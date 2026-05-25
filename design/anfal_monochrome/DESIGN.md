---
name: Anfal Monochrome
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e2'
  on-secondary-container: '#646464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1d1b1a'
  on-tertiary-container: '#868381'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e6e1df'
  tertiary-fixed-dim: '#cac6c3'
  on-tertiary-fixed: '#1d1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Roboto
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Roboto
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Roboto
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Roboto
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  price-display:
    fontFamily: Roboto
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 64px
  section: 128px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

The design system focuses on extreme minimalism to ensure that luxury timepieces remain the sole focus of the user's attention. The brand personality is prestigious, quiet, and authoritative, leaning into a high-end boutique aesthetic. By stripping away decorative elements, the UI adopts a "gallery" approach where the product photography provides the color and texture.

The design style is **Minimalism** with a focus on editorial-grade typography and vast whitespace. Every element is intentional, following a strict "less is more" philosophy. The emotional response should be one of calm, exclusivity, and precision—mirroring the mechanical excellence of the watches themselves.

## Colors

The palette is strictly monochrome to maintain a premium, timeless feel. 

- **Primary & Accent:** Pure blacks and whites are used for structural elements and key calls to action. 
- **Subtle Backgrounds:** Light grays (`#F5F5F5`) and deep charcoals (`#141414`) are reserved for sectioning content and hover states without breaking the minimalist flow.
- **Muted Text:** Used for metadata and secondary information to create a clear visual hierarchy against the bold headings.

In dark mode, the contrast is softened slightly (`#F0F0F0` foreground) to ensure long-form readability while maintaining the high-end "night mode" boutique atmosphere.

## Typography

Typography is the primary driver of hierarchy in this design system. **Roboto Bold** is utilized for all high-impact moments: headlines, product titles, and pricing. Its geometric rigidity conveys technical precision. **Inter** provides a neutral, highly legible counterpoint for descriptions and navigation.

- **Scale:** Use `display-lg` for hero sections and limited-edition announcements.
- **Prices:** Always use `price-display` to ensure the value is clear and prominent.
- **Labels:** Small caps and increased letter spacing are used for category tags and technical specifications to evoke the look of watch face engravings.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop to maintain the editorial "lookbook" feel, centered within a 1440px container. 

- **Grid:** A 12-column grid is used for desktop (24px gutters). For mobile, a 2-column grid is preferred for product listings to allow imagery to remain large and detailed.
- **Rhythm:** A strict 4px base unit governs all dimensions.
- **Margins:** Generous page margins (minimum 64px on desktop, 16px on mobile) are mandatory to prevent the UI from feeling cluttered. Large-scale white space (using the `section` unit) should be used between different product collections.

## Elevation & Depth

This design system avoids traditional drop shadows to maintain a flat, modern aesthetic. 

- **Tonal Layers:** Depth is achieved through the use of `bg-subtle` against `bg`. For example, a product specification table might sit on a `#F5F5F5` block against a `#FFFFFF` page.
- **Low-Contrast Outlines:** Subtle 1px borders in `fg-muted` (at 10-20% opacity) are used to define inputs or separate tight list items.
- **Image Priority:** Depth is often simulated within the product photography itself (shadows under the watch), rather than the UI elements surrounding it.

## Shapes

To mirror the precision engineering of horology and maintain a high-fashion editorial feel, this design system uses **Sharp (0)** roundedness. 

All buttons, input fields, images, and card containers must have 0px border radii. This creates a structural, architectural look that feels more premium and "curated" than rounded, consumer-grade interfaces.

## Components

- **Buttons:** Primary buttons are solid `accent` color with `background` text. No rounded corners. Hover states involve a slight opacity shift or a color inversion (white background with black border).
- **Input Fields:** Bottom-border only (underline style) for a cleaner look, or full 1px borders. Use `label-sm` for floating labels.
- **Product Cards:** No borders or shadows. The image should span the full width of the card. Text (Title and Price) should be left-aligned underneath with generous padding.
- **Chips/Badges:** Simple rectangular boxes with 1px borders. No solid fills unless it denotes a critical status like "Sold Out."
- **Lists:** Clean dividers using 1px `bg-subtle`. High vertical padding (`md` or `lg`) to ensure readability.
- **Navigation:** Minimalist text links in `label-sm` style. Use a simple dot indicator or underline for active states.