-- LOVORA MEOW creator stats. Run in the Supabase SQL editor after 0001 and 0002.
create table if not exists public.surprise_views (
  id uuid primary key default gen_random_uuid(),
  surprise_id uuid not null references public.experiences(id) on delete cascade,
  viewer text not null check (char_length(viewer) between 8 and 64),
  device text not null default 'unknown' check (device in ('mobile', 'desktop', 'unknown')),
  opened_at timestamptz not null default now(),
  seconds int not null default 0 check (seconds between 0 and 7200),
  furthest int not null default 0 check (furthest between 0 and 60),
  scenes_total int not null default 0 check (scenes_total between 0 and 60),
  replays int not null default 0 check (replays between 0 and 200)
);
create index if not exists surprise_views_idx on public.surprise_views (surprise_id, opened_at desc);
alter table public.surprise_views enable row level security;

-- Visitors never touch the table directly; only the owner can read their surprise's rows.
drop policy if exists "Owners can read views of their surprises" on public.surprise_views;
create policy "Owners can read views of their surprises" on public.surprise_views for select
  using (exists (select 1 from public.experiences e where e.id = surprise_id and e.owner_id = auth.uid()));

-- A visitor opens a published surprise: record it (same browser within 30 minutes counts once).
create or replace function public.track_view(p_id uuid, p_viewer text, p_device text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v uuid; d text := case when p_device in ('mobile', 'desktop') then p_device else 'unknown' end;
begin
  if not exists (select 1 from public.experiences where id = p_id and is_published) then return null; end if;
  select id into v from public.surprise_views where surprise_id = p_id and viewer = left(p_viewer, 64) and opened_at > now() - interval '30 minutes' order by opened_at desc limit 1;
  if v is not null then return v; end if;
  if (select count(*) from public.surprise_views where surprise_id = p_id and opened_at > now() - interval '1 hour') >= 300 then return null; end if;
  insert into public.surprise_views (surprise_id, viewer, device) values (p_id, left(p_viewer, 64), d) returning id into v;
  return v;
end $$;

-- Progress pings: watch time, furthest scene, replays. Values only ever go up and are clamped.
create or replace function public.update_view(p_view uuid, p_seconds int, p_furthest int, p_total int, p_replays int)
returns void language sql security definer set search_path = public as $$
  update public.surprise_views set
    seconds = least(7200, greatest(seconds, coalesce(p_seconds, 0))),
    furthest = least(60, greatest(furthest, coalesce(p_furthest, 0))),
    scenes_total = least(60, greatest(scenes_total, coalesce(p_total, 0))),
    replays = least(200, greatest(replays, coalesce(p_replays, 0)))
  where id = p_view
$$;

-- Summary for the creator (raises 'forbidden' for anyone else).
create or replace function public.get_stats(p_id uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_tot int; v_res json;
begin
  if not exists (select 1 from public.experiences where id = p_id and owner_id = auth.uid()) then raise exception 'forbidden'; end if;
  select coalesce(max(scenes_total), 0) into v_tot from public.surprise_views where surprise_id = p_id;
  select json_build_object(
    'opens', count(*), 'viewers', count(distinct viewer), 'avg_seconds', coalesce(round(avg(seconds)), 0),
    'completed', count(*) filter (where scenes_total > 0 and furthest >= scenes_total - 1),
    'replays', coalesce(sum(replays), 0), 'last_opened', max(opened_at), 'total', v_tot,
    'mobile', count(*) filter (where device = 'mobile'),
    'reach', (select coalesce(json_agg(x.c order by x.i), '[]'::json) from (select g.i, count(v.id) as c from generate_series(0, greatest(v_tot - 1, 0)) g(i) left join public.surprise_views v on v.surprise_id = p_id and v.furthest >= g.i group by g.i) x),
    'recent', (select coalesce(json_agg(r), '[]'::json) from (select opened_at, seconds, device from public.surprise_views where surprise_id = p_id order by opened_at desc limit 8) r)
  ) into v_res from public.surprise_views where surprise_id = p_id;
  return v_res;
end $$;

grant execute on function public.track_view(uuid, text, text) to anon, authenticated;
grant execute on function public.update_view(uuid, int, int, int, int) to anon, authenticated;
grant execute on function public.get_stats(uuid) to authenticated;
