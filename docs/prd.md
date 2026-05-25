# Anfal Watch Store — PRD

## Problem Statement

A watch retailer wants an online storefront where customers can browse new watches,
view product details, and initiate purchases via WhatsApp. The admin (non-technical
staff) needs a mobile-friendly panel to manage products, categories, stock, and orders.
No payment gateway or checkout pipeline is needed — all transactions are completed
through WhatsApp chat.

## Solution

A modern Astro SSR site hosted on Vercel, using Supabase for database, auth, and
image storage. Customers browse a monochrome, image-first catalog with category
filters and price sorting. Each product has a detail page with a gallery and an order
form (name, phone, address, quantity). Submitting the form saves the order to the
database and redirects the customer to WhatsApp with a pre-filled message. The admin
panel (shadcn/ui, mobile-responsive) lets staff manage products, categories, orders,
and stock. When an order is confirmed in the panel, stock is deducted and the admin's
WhatsApp opens with the order details to continue the conversation.

## User Stories

### Customer

1. As a customer, I want to see a hero section with featured products on the home
   page, so that I can immediately see what's available.
2. As a customer, I want the home page to have smooth scroll animations, so that
   browsing feels premium and engaging.
3. As a customer, I want to see featured watches in a grid on the home page, so
   that I can quickly discover popular products.
4. As a customer, I want to see a "Why Shop With Us" section on the home page,
   so that I understand the store's value proposition.
5. As a customer, I want to browse all products in a responsive grid with uniform
   cards, so that scanning the catalog is easy on any device.
6. As a customer, I want to filter products by category, so that I can narrow down
   to brands or types I care about.
7. As a customer, I want to search products by name, so that I can find specific
   watches quickly.
8. As a customer, I want to sort products by newest, price low-to-high, and
   price high-to-low, so that I can organize results my way.
9. As a customer, I want to see pagination via "Load More" so that the catalog
   page is fast and doesn't overwhelm me.
10. As a customer, I want to click a product card and see a full detail page
    with a gallery of up to 3 images, so that I can inspect the watch visually.
11. As a customer, I want to see the price, stock status, and description on
    the product detail page, so that I have all info before ordering.
12. As a customer, I want to select a quantity (up to available stock) when
    ordering, so that I can buy multiple units of the same watch.
13. As a customer, I want to fill in my name, phone number, and delivery address
    and submit an order form, so that the seller has my details.
14. As a customer, I want to be redirected to WhatsApp with a pre-filled message
    containing my order details after submitting the form, so that I can confirm
    the purchase directly with the seller.
15. As a customer, I want to visit an About page, so that I can learn the
    store's story.
16. As a customer, I want to visit a Contact page with a WhatsApp link and
    social links, so that I can reach the seller.
17. As a customer, I want to visit an FAQ page with accordion-style answers,
    so that common questions are answered without contacting the seller.
18. As a customer, I want to switch between light and dark mode, with my
    preference remembered, so that I can browse comfortably.
19. As a customer, I want the site to be responsive on mobile, tablet, and
    desktop, so that I can browse on any device.
20. As a customer, I want proper meta tags and OG images when sharing a product
    page on social media or WhatsApp, so that the link preview looks good.
21. As a customer, I want a navigation bar with links to all major pages and a
    mobile hamburger menu, so that I can navigate easily.

### Admin

22. As an admin, I want to log in with email and password via Supabase Auth,
    so that the admin panel is protected.
23. As an admin, I want a dashboard showing total products, total orders, low
    stock items, and pending orders, so that I have an overview at a glance.
24. As an admin, I want to add new products with name, description, price,
    stock quantity, category, up to 3 images, and a featured flag, so that I
    can list new inventory.
25. As an admin, I want to edit existing products (including replacing images),
    so that I can update product details.
26. As an admin, I want to delete products, so that I can remove discontinued
    items.
27. As an admin, I want image compression on the client before upload, so that
    images are fast to store and serve.
28. As an admin, I want to manage categories (create, edit, delete, see product
    count), so that the catalog is organized.
29. As an admin, I want to see all orders in a table with customer details,
    product, quantity, total, and status, so that I can track incoming requests.
30. As an admin, I want to confirm an order, which deducts stock and opens
    WhatsApp with the customer's order info, so that I can chat with the
    customer to complete the sale.
31. As an admin, I want to view stock levels in a dedicated view with quick
    adjustment controls, so that I can manage inventory.
32. As an admin, I want the admin panel to be fully responsive and usable on
    mobile, so that I can manage the store from my phone.
33. As an admin, I want the admin panel to use shadcn/ui components with a
    collapsible sidebar, so that the interface is clean and familiar.

## Implementation Decisions

### Module Architecture

**Supabase Client Layer** — A module that initializes and exports the Supabase
client (using anon key and URL from environment variables). Provides a single
entry point for all database, auth, and storage operations. Configured once,
imported everywhere.

**Product Service** — Encapsulates all product queries and mutations:
- `list(filters: { category?, search?, sort?, page?, limit? })` → paginated
  results with total count
- `getBySlug(slug)` → single product with category name
- `create(data)`, `update(id, data)`, `delete(id)`
- Business logic: validates stock is non-negative, generates slug from name,
  handles image ordering

**Category Service** — CRUD for categories:
- `list()` → all categories with product count
- `create(data)`, `update(id, data)`, `delete(id)`
- Business logic: prevents deletion if products are assigned

**Order Service** — Order lifecycle:
- `create(data)` → inserts order, returns order record
- `list(filters: { status? })` → orders with product details
- `confirm(id)` → deducts product stock, returns order + WhatsApp link
- Business logic: validates stock >= quantity before confirmation, prevents
  double-confirmation

**Auth Service** — Wraps Supabase Auth:
- `signIn(email, password)`, `signOut()`, `getSession()`
- Server-side middleware checks session before rendering admin pages

**Image Service** — Storage operations:
- `upload(productId, file)` → uploads to Supabase Storage bucket, returns
  public URL
- `delete(url)` → removes from storage
- Client-side: `compress(file)` → uses a compression library (browser-image-compression
  or similar) to reduce file size before upload, max 3 images per product,
  replaces on re-upload

**WhatsApp Link Builder** — Pure function (deep module):
- `buildAdminUrl(order)` → returns `wa.me/{admin_number}?text={encoded_message}`
- `buildCustomerUrl(order)` → returns customer-facing link with confirmation
  message
- Message template includes product name, price, quantity, total, customer
  name, phone, address
- Easily testable, simple interface, unlikely to change

**SEO Helpers** — Generates meta/OG tags per page type:
- `generateProductMeta(product)` → title, description, OG image, OG type
- `generatePageMeta(page)` → standard page meta

### Schema

**products** table:
- id (uuid, PK, default gen_random_uuid())
- name (text, not null)
- slug (text, unique, not null)
- description (text)
- price (numeric, not null)
- stock (integer, not null, default 0)
- category_id (uuid, FK → categories.id)
- featured (boolean, default false)
- images (text[] — array of Supabase Storage URLs, max 3)
- created_at (timestamptz, default now())
- updated_at (timestamptz, default now())

**categories** table:
- id (uuid, PK)
- name (text, unique, not null)
- slug (text, unique, not null)
- created_at (timestamptz, default now())

**orders** table:
- id (uuid, PK)
- product_id (uuid, FK → products.id)
- quantity (integer, not null)
- total_price (numeric, not null)
- customer_name (text, not null)
- customer_phone (text, not null)
- delivery_address (text, not null)
- status (text, default 'pending') — values: 'pending', 'confirmed'
- created_at (timestamptz, default now())

### Routes

Public (Astro SSR pages):
- `/` — Home page
- `/watches` — Catalog page
- `/watch/[slug]` — Product detail page
- `/about` — About page
- `/contact` — Contact page
- `/faq` — FAQ page

Admin (Astro SSR pages with auth guard):
- `/admin` — Dashboard
- `/admin/products` — Product list
- `/admin/products/new` — Create product
- `/admin/products/[id]/edit` — Edit product
- `/admin/categories` — Categories management
- `/admin/orders` — Orders list
- `/admin/stock` — Stock management

API (Astro API endpoints):
- `POST /api/orders` — Create order (from customer form)
- `POST /api/orders/[id]/confirm` — Admin confirms order
- `POST /api/auth/login` — Admin login
- `POST /api/auth/logout` — Admin logout
- `POST /api/upload` — Image upload (admin, authenticated)
- `GET /api/products` — Product listing (JSON, supports filter/sort/pagination)

### Design Decisions

- Monochrome palette: CSS custom properties for light and dark themes.
  `data-theme` attribute on `<html>` toggles between them. Preference stored
  in localStorage, respects `prefers-color-scheme` on first visit.
- Typography: Roboto Bold for headings, Inter for body. Both loaded from Google
  Fonts with `display=swap`.
- Admin panel: shadcn/ui React components rendered as Astro islands. Sidebar
  layout, collapsible on mobile.
- Animations: GSAP + Lenis for landing page. ScrollTrigger for card reveals.
  CSS transitions for page changes and theme toggle.
- Product images: 1:1 aspect ratio, object-fit cover, uniform cards.
- No payment, no shipping fee, no tax calculation.
- No newsletter signup or email automation.

## Testing Decisions

No automated tests will be written for this project. Testing will be done
manually through development and review.

## Out of Scope

- Payment gateway integration
- Shipping fee or tax calculation
- Email notifications or newsletters
- User registration or customer accounts
- Inventory forecasting or purchase orders
- Reviews or ratings
- Multi-language or multi-currency support
- Blog or CMS
- Automated testing suite

## Further Notes

- The WhatsApp link builder is a deep module worth getting right early — it
  encodes the core business handoff and should be built and verified before
  any pages depend on it.
- The admin number should be configurable via environment variable
  (`PUBLIC_ADMIN_WHATSAPP_NUMBER`).
- Image compression happens on the client (browser) before upload to Supabase
  Storage to save bandwidth and storage costs.
- Products use a `slug` field for URL paths. Slugs should be auto-generated
  from the product name but editable by admin.
