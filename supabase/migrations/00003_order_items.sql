-- Order items table for multi-item orders
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

-- Migrate existing single-item orders to order_items
insert into order_items (order_id, product_id, quantity, unit_price)
select id, product_id, quantity, total_price / quantity
from orders
where status is not null
  and not exists (select 1 from order_items where order_items.order_id = orders.id);

-- Rename total_price to total_amount to clarify it's computed
alter table orders rename column total_price to total_amount;

-- Remove old single-item columns
alter table orders drop column product_id;
alter table orders drop column quantity;

-- Indexes
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_order_items_product on order_items(product_id);
