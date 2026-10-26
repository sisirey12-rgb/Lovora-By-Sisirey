-- Site-wide switches the owner can change from the app (for example the landing page season).
create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
-- No policies on purpose: only the server (service role) reads and writes this table.

-- The server writes with the service_role key. Make sure it may, and make Supabase notice the table straight away.
grant all on public.site_settings to service_role;
notify pgrst, 'reload schema';
