-- Soft-delete flag for products. Archived products are hidden from brand and
-- creator product lists but their coupons, orders, earnings and payouts remain
-- intact (orders reference product_coupons via a restricting foreign key).
alter table public.products add column if not exists archived boolean not null default false;

create index if not exists products_archived_idx on public.products (archived);
