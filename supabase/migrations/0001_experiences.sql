-- LOVORA MEOW cloud publishing schema.
-- Run this in the Supabase SQL editor. Keep the service_role key server-side only.
create table if not exists public.experiences (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  is_published boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.experiences enable row level security;

-- Owners can read and edit their own rows, including unpublished drafts.
create policy "Owners can select own experiences"
  on public.experiences for select
  using (auth.uid() = owner_id);

create policy "Owners can insert own experiences"
  on public.experiences for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update own experiences"
  on public.experiences for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Owners can delete own experiences"
  on public.experiences for delete
  using (auth.uid() = owner_id);

-- Public visitors may only fetch the payload of intentionally published experiences.
-- RLS policies do not restrict selected columns, so use a security-barrier view for public reads.
create or replace view public.published_experiences
with (security_barrier = true) as
  select id, payload, updated_at
  from public.experiences
  where is_published = true;

grant select on public.published_experiences to anon, authenticated;

-- NOTE: Direct anon SELECT on experiences is intentionally not granted by this migration.
-- Client code should query the published_experiences view for public links.
