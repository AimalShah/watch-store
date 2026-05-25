# Anfal Watch Store — Glossary

## Domain

- **Customer**: B2C individual buying watches for personal use.
- **Product**: A model/variant listing that can have multiple identical units in stock (e.g. "Rolex Submariner Black Dial" with stock=5). New, not pre-owned.
- **Category**: User-defined grouping for products (brands, types, etc.). Created and managed by admin.
- **Order**: A purchase intent submitted via form on the site, fulfilled through WhatsApp chat.
- **Admin**: Non-technical staff who manage products, categories, stock, and fulfill orders.

## Technical

- **Framework**: Astro 6 (SSR), scaffolded via `create astro`.
- **UI Layer**: shadcn/ui (Radix primitives + Tailwind 4).
- **Forms**: react-hook-form + zod validation.
- **Data Fetching**: TanStack Query (React Query).
- **Notifications**: sonner toasts.
- **Animation**: GSAP + Lenis (smooth scroll).
- **Testing**: Vitest (unit/integration) + Playwright (e2e).
- **Database & Auth**: Supabase (Postgres DB + Auth + Storage).
- **Admin Authentication**: Email/password via Supabase Auth.
- **Admin Location**: `/admin` route within the same Astro app.
- **Image Storage**: Supabase Storage, uploaded through admin panel.
- **Order Confirmation**: Admin confirms in admin panel, at which point stock is deducted.
- **Hosting**: Vercel (SSR adapter).
- **Visual Identity**: Premium / luxury feel — to be redesigned from the current monochrome.
