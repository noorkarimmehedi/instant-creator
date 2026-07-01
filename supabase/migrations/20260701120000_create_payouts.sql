-- Manual influencer payouts approved by a brand admin.
-- Each row records one disbursement the brand approved and paid out to a creator.
-- Accessed only via the server-side service role.
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  brand_clerk_user_id text not null,
  influencer_clerk_user_id text not null,
  amount numeric not null check (amount > 0),
  note text,
  created_at timestamptz not null default now()
);

comment on table public.payouts is 'Manual influencer payouts approved by a brand admin. Accessed via service role only.';

create index if not exists payouts_brand_idx on public.payouts (brand_clerk_user_id);

alter table public.payouts enable row level security;

-- Service role only; anon/authenticated get no access so payout records stay server-only.
drop policy if exists "service_role_all_payouts" on public.payouts;
create policy "service_role_all_payouts"
on public.payouts
for all
to service_role
using (true)
with check (true);
