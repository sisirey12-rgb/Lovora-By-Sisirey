-- LOVORA MEOW live wish jar. Run in the Supabase SQL editor after 0001_experiences.sql.
create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  surprise_id uuid not null references public.experiences(id) on delete cascade,
  name text not null default '' check (char_length(name) <= 30),
  wish_text text not null check (char_length(wish_text) between 2 and 140),
  created_at timestamptz not null default now()
);
create index if not exists wishes_surprise_idx on public.wishes (surprise_id, created_at);

alter table public.wishes enable row level security;

-- Visitors never touch the table directly: no insert/select policy for anon.
-- The surprise's owner can read and delete wishes (moderation) from their own account.
create policy "Owners can read wishes on their surprises" on public.wishes for select
  using (exists (select 1 from public.experiences e where e.id = surprise_id and e.owner_id = auth.uid()));
create policy "Owners can delete wishes on their surprises" on public.wishes for delete
  using (exists (select 1 from public.experiences e where e.id = surprise_id and e.owner_id = auth.uid()));

-- Friends add a wish through this function: only works for published surprises, trims and limits text, max 60 wishes per jar.
create or replace function public.submit_wish(p_id uuid, p_name text, p_text text)
returns void language plpgsql security definer set search_path = public as $$
declare n text := left(btrim(coalesce(p_name, '')), 30); t text := left(btrim(coalesce(p_text, '')), 140);
begin
  if not exists (select 1 from public.experiences where id = p_id and is_published) then raise exception 'not_found'; end if;
  if char_length(t) < 2 then raise exception 'empty'; end if;
  if (select count(*) from public.wishes where surprise_id = p_id) >= 60 then raise exception 'full'; end if;
  if exists (select 1 from public.wishes where surprise_id = p_id and wish_text = t and name = n) then return; end if;
  insert into public.wishes (surprise_id, name, wish_text) values (p_id, n, t);
end $$;

-- The player reads wishes of published surprises through this function.
create or replace function public.get_wishes(p_id uuid)
returns table (name text, wish_text text, created_at timestamptz) language sql stable security definer set search_path = public as $$
  select w.name, w.wish_text, w.created_at from public.wishes w
  join public.experiences e on e.id = w.surprise_id
  where w.surprise_id = p_id and e.is_published order by w.created_at limit 60
$$;

grant execute on function public.submit_wish(uuid, text, text) to anon, authenticated;
grant execute on function public.get_wishes(uuid) to anon, authenticated;
