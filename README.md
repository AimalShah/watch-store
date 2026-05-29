# AZ Watch Hub — Luxury Watch Store

An Astro-powered e-commerce store for luxury watches with Supabase backend, WhatsApp order flow, and admin panel.

## Features

- **Public catalog** — Browse watches with category and price filters
- **Product detail** — View images, specs, and add to cart
- **Cart & checkout** — WhatsApp-based order flow with +92 phone validation
- **Admin panel** — Manage products, categories, stock, and orders
- **Order management** — Confirm orders, auto-deduct stock, WhatsApp notification to buyer
- **Homepage** — Live featured products and brand collections from Supabase
- **GSAP animations** — Scroll-triggered reveals and smooth Lenis scrolling

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | [Astro](https://astro.build) 6 (SSR) |
| UI | React 19 + Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel (`@astrojs/vercel`) |
| Animations | GSAP + Lenis |
| State | Zustand (cart) |
| Forms | react-hook-form |
| Tables | @tanstack/react-table |

## Getting Started

```sh
npm install
npm run dev        # local dev at localhost:4321
npm run build      # production build
npm run preview    # preview production build
npm test           # run tests
```

## Environment Variables

```env
PUBLIC_SUPABASE_URL=          # Supabase project URL
PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon key
PUBLIC_ADMIN_WHATSAPP_NUMBER= # Admin WhatsApp for new order notifications
```

## Project Structure

```
src/
├── components/
│   ├── admin/          # Admin dashboard, products, orders, stock, categories
│   ├── ui/             # shadcn-style primitives (button, card, input, etc.)
│   ├── home-page.tsx   # Homepage with live data
│   ├── checkout-page.tsx
│   └── public-catalog.tsx
├── layouts/
├── lib/
│   ├── supabase.ts     # Supabase client
│   └── whatsapp.ts     # WhatsApp URL builders
├── pages/
│   ├── api/            # Orders, products, categories, admin/stats endpoints
│   └── admin/          # Admin route pages
├── stores/             # Zustand cart store
└── utils/
```

## Database

Run migrations via Supabase dashboard SQL editor. Migrations in `supabase/migrations/`.

## Deployment

Connected to Vercel. Set environment variables in Vercel dashboard.
