-- Gift a surprise (prepaid share-link vouchers) and Nepal payments (eSewa, Khalti).
-- Run in the Supabase SQL editor AFTER 0001-0006.

-- One row per redirect payment (eSewa / Khalti) or Razorpay gift order. Only the server (service_role) writes it.
create table if not exists public.payment_intents (
  id text primary key,                         -- transaction uuid (eSewa), purchase order id (Khalti) or the Razorpay order id
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,                      -- esewa | khalti | razorpay
  kind text not null,                          -- share | gift
  experience_id uuid,
  amount integer not null,                     -- in the provider currency (NPR for eSewa/Khalti, INR for Razorpay)
  pidx text,
  status text not null default 'created',      -- created | paid
  ref text,                                    -- the gift code created for a paid gift
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
alter table public.payment_intents enable row level security;
create policy "Owners read own intents" on public.payment_intents for select to authenticated using (owner_id = auth.uid());

-- Gift codes: one code unlocks one share link for whoever redeems it.
create table if not exists public.gift_codes (
  code text primary key,
  created_by uuid not null references auth.users(id) on delete cascade,
  source text not null default 'paid',         -- paid | owner
  payment_ref text,
  created_at timestamptz not null default now(),
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_for uuid,
  redeemed_at timestamptz
);
alter table public.gift_codes enable row level security;
create policy "Creators read own gift codes" on public.gift_codes for select to authenticated using (created_by = auth.uid());
-- No insert/update policies: codes are created and redeemed only by the server.
