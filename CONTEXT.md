# Anfal Watch Store — Glossary

## Domain

- **Customer**: B2C individual buying watches for personal use.
- **Product**: A model/variant listing that can have multiple identical units in stock (e.g. "Rolex Submariner Black Dial" with stock=5). New, not pre-owned.
- **Category**: User-defined grouping for products (brands, types, etc.). Created and managed by admin.
- **Order**: A purchase intent submitted via form on the site, fulfilled through WhatsApp chat.
- **Admin**: Non-technical staff who manage products, categories, stock, and fulfill orders.

## Technical

- **Framework**: Astro.
- **Database & Auth**: Supabase (Postgres DB + Auth + Storage).
- **Admin Authentication**: Email/password via Supabase Auth.
- **Admin Location**: `/admin` route within the same Astro app.
- **Image Storage**: Supabase Storage, uploaded through admin panel.
- **Order Confirmation**: Admin confirms in admin panel, at which point stock is deducted.
- **Design System**: See `design/anfal_monochrome/DESIGN.md` for tokens.
- **Design Assets**: Page mockups (code + screenshots) in `design/*/`.
  | Catalog | `design/catalog_watches/` |
  | Home hero | `design/home_page_new_hero_design/` |
  | Product detail | `design/product_detail_25store/` |
  | Admin dashboard | `design/admin_dashboard_25store/` |
- **Design**: Monochrome palette with light/dark mode; focus on product imagery.
- **Typography**: Roboto Bold (headings), Inter (body).
- **Hosting**: Vercel (SSR adapter).
