-- Per-brand courier provider credentials (Steadfast, Pathao).
-- Accessed only via the server-side service role.
create table if not exists public.courier_integrations (
  id uuid primary key default gen_random_uuid(),
  brand_clerk_user_id text not null,
  provider text not null,
  credentials jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_clerk_user_id, provider)
);

comment on table public.courier_integrations is 'Per-brand courier provider credentials (Steadfast, Pathao). Accessed via service role only.';

alter table public.courier_integrations enable row level security;

-- If this project enforces RLS on service_role (it does not bypass RLS), the
-- service role needs an explicit policy. anon/authenticated get no access, so the
-- stored API secrets stay server-only.
drop policy if exists "service_role_all_courier_integrations" on public.courier_integrations;
create policy "service_role_all_courier_integrations"
on public.courier_integrations
for all
to service_role
using (true)
with check (true);

-- Courier / recipient columns the integration reads and writes on orders.
alter table public.orders add column if not exists sent_to_courier boolean default false;
alter table public.orders add column if not exists consignment_id text;
alter table public.orders add column if not exists tracking_code text;
alter table public.orders add column if not exists courier_status text;
alter table public.orders add column if not exists courier_name text;
alter table public.orders add column if not exists return_status text;
alter table public.orders add column if not exists return_reason text;
alter table public.orders add column if not exists return_requested_at timestamptz;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists phone text;
alter table public.orders add column if not exists address text;
