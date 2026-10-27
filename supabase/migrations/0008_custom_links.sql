-- Optional personalised share keywords. Run after migrations 0001–0007.
-- All writes happen through server endpoints using the service-role key.
create table if not exists public.custom_links (
  slug text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{2,23}$'),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  payment_id text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists custom_links_experience_id_idx on public.custom_links(experience_id);
alter table public.custom_links enable row level security;
-- No client policies: public lookup and paid creation are handled by the API.
create table if not exists public.custom_link_orders (
  id text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{2,23}$'),
  amount integer not null default 5000,
  status text not null default 'created' check (status in ('created','paid')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
alter table public.custom_link_orders enable row level security;
