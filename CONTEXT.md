# Anfal Watch Store — Glossary

## Domain

- **Customer**: B2C individual buying watches for personal use.
- **Product**: A model/variant listing that can have multiple identical units in stock (e.g. "Rolex Submariner Black Dial" with stock=5). New, not pre-owned.
- **Category**: Brand label grouping for products. Created and managed by admin. Each category can have multiple products.
- **Cart**: Client-side shopping cart (Zustand + localStorage persistence). Holds items while browsing. Cleared on checkout.
- **Checkout**: Dedicated page with order form (customer name, WhatsApp number, delivery address) reviewing all cart items before submission. Submitting creates a pending order and opens WhatsApp to the admin number with order details.
- **Order**: A purchase session (parent), created on checkout submission. Contains one or more line items. Fulfilled via WhatsApp. Status flow: `pending` → (admin confirms) → `confirmed`.
- **Order Item**: A single product + quantity within an order. Links `order_id` to `product_id` with `quantity` and `unit_price`.
- **Admin**: Non-technical staff who manage products, categories, stock, and fulfill orders. Admin panel is fully isolated from the public site (separate layout, no shared nav/footer).
- **WhatsApp Order Flow**: Customer enters their WhatsApp number at checkout. On submission, admin receives order details via WhatsApp. On confirmation, admin messages the customer directly on their WhatsApp to confirm. Admin can also message any customer from the order panel.
- **Collections (Homepage)**: "Our Collections" section on the homepage dynamically fetches categories from the database. Each brand card uses the first product's image from that category as the card image.

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
- **Order Confirmation**: Admin confirms in admin panel, at which point stock is deducted for all items at once.
- **Hosting**: Vercel (SSR adapter).
- **Visual Identity**: Premium / luxury feel — to be redesigned from the current monochrome.
