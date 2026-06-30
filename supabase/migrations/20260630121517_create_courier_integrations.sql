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

-- In this project the service_role is RLS-enforced (it does not bypass RLS),
-- so it needs an explicit policy — mirroring service_role_all_orders. anon and
-- authenticated get no access, keeping the stored API secrets server-only.
create policy "service_role_all_courier_integrations"
on public.courier_integrations
for all
to service_role
using (true)
with check (true);
