-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric not null,
  stock integer not null default 0,
  category_id uuid references categories(id) on delete set null,
  featured boolean not null default false,
  images text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null,
  total_price numeric not null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_featured on products(featured) where featured = true;
create index if not exists idx_categories_slug on categories(slug);
create index if not exists idx_orders_status on orders(status);
