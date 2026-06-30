alter table public.products
add column if not exists target_gender text not null default 'all';

alter table public.products
drop constraint if exists products_target_gender_check;

alter table public.products
add constraint products_target_gender_check
check (target_gender in ('all', 'women', 'men', 'kids'));

create index if not exists products_target_gender_idx
on public.products (target_gender);
