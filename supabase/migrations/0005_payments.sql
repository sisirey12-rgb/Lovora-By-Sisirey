-- Paid sharing: previewing is free, a public share link needs a payment.
-- Run this in the Supabase SQL editor AFTER 0001-0004.

alter table public.experiences add column if not exists paid boolean not null default false;
alter table public.experiences add column if not exists paid_at timestamptz;

-- Surprises that are already live keep working (grandfathered as paid).
update public.experiences set paid = true, paid_at = coalesce(paid_at, now()) where is_published = true and paid = false;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid not null,
  order_id text not null unique,
  payment_id text,
  amount integer not null,            -- in rupees
  status text not null default 'created',   -- created | paid
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
alter table public.payments enable row level security;
create policy "Owners read own payments" on public.payments for select to authenticated using (owner_id = auth.uid());
-- No insert/update policies: only the server (service_role) writes payments.

-- A creator can never flip `paid` themselves, and an unpaid surprise can never be published.
create or replace function public.guard_paid() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    if tg_op = 'INSERT' then new.paid := false; new.paid_at := null;
    else new.paid := old.paid; new.paid_at := old.paid_at; end if;
    if new.is_published and not new.paid then raise exception 'PAYMENT_REQUIRED'; end if;
  end if;
  return new;
end $$;
drop trigger if exists experiences_guard_paid on public.experiences;
create trigger experiences_guard_paid before insert or update on public.experiences for each row execute function public.guard_paid();
