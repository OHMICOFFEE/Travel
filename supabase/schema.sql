-- ============================================================
-- OHMI TRAVEL — COMPLETE SCHEMA
-- Run this ONE file in Supabase SQL Editor. That's it.
-- Wipes and rebuilds everything from scratch.
-- ============================================================

-- ── WIPE EXISTING TABLES (clean slate) ──────────────────────
drop table if exists public.ohmi_transactions cascade;
drop table if exists public.purchases cascade;
drop table if exists public.payouts cascade;
drop table if exists public.binary_matches cascade;
drop table if exists public.kyc_submissions cascade;
drop table if exists public.bookings cascade;
drop table if exists public.wishlists cascade;
drop table if exists public.foundation_ledger cascade;
drop table if exists public.payout_batches cascade;
drop table if exists public.products cascade;
drop table if exists public.destinations cascade;
drop table if exists public.members cascade;
drop table if exists public.membership_tiers cascade;
drop table if exists public.ranks cascade;
drop table if exists public.admin_users cascade;

-- ============================================================
-- 1. MEMBERSHIP TIERS
-- ============================================================
create table public.membership_tiers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null unique,
  monthly_fee numeric not null,
  pool_contribution numeric not null default 500,
  foundation_fee numeric not null default 15,
  ohmi_points_monthly integer not null,
  trip_discount_pct numeric not null,
  free_trips_per_year integer not null default 0,
  includes_concierge boolean not null default false
);

insert into public.membership_tiers (name, monthly_fee, ohmi_points_monthly, trip_discount_pct, free_trips_per_year, includes_concierge) values
('Explorer', 1499, 500, 10, 0, false),
('Bespoke', 2499, 1500, 25, 1, true);

-- ============================================================
-- 2. RANKS — exact from OHMI-ACT-2026-003
-- ============================================================
create table public.ranks (
  id serial primary key,
  name text not null unique,
  left_required integer not null,
  right_required integer not null,
  network_required integer not null,
  monthly_income numeric not null,
  discretionary_bonus numeric not null default 0,
  sort_order integer not null
);

insert into public.ranks (name, left_required, right_required, network_required, monthly_income, discretionary_bonus, sort_order) values
('Bronze',           2,    2,     5,      750,       0,        1),
('Silver',           5,    5,     11,     2000,      0,        2),
('Gold',             20,   20,    41,     6000,      4000,     3),
('Platinum',         50,   50,    101,    15000,     10000,    4),
('Emerald',          100,  100,   201,    30000,     15000,    5),
('Sapphire',         200,  200,   401,    60000,     25000,    6),
('Diamond',          500,  500,   1001,   150000,    35000,    7),
('Crown Diamond',    1000, 1000,  2001,   300000,    100000,   8),
('Royal Diamond',    2500, 2500,  5001,   750000,    250000,   9),
('Imperial Diamond', 5000, 5000,  10001,  1500000,   0,        10);

-- ============================================================
-- 3. MEMBERS — the core table
-- ============================================================
create table public.members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,

  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,

  tier_id uuid references public.membership_tiers(id) not null,
  status text not null default 'active' check (status in ('active','inactive','suspended')),
  joined_at timestamptz default now(),

  sponsor_id uuid references public.members(id),
  parent_id uuid references public.members(id),
  leg text check (leg in ('left','right')),
  left_child_id uuid references public.members(id),
  right_child_id uuid references public.members(id),

  current_rank_id integer references public.ranks(id),
  left_leg_count integer not null default 0,
  right_leg_count integer not null default 0,

  ohmi_balance numeric not null default 0,
  ohmi_lifetime numeric not null default 0
);

create index idx_members_user on public.members(user_id);
create index idx_members_parent on public.members(parent_id);
create index idx_members_sponsor on public.members(sponsor_id);

-- ============================================================
-- 4. KYC SUBMISSIONS
-- ============================================================
create table public.kyc_submissions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  member_id uuid references public.members(id) on delete cascade not null,

  full_legal_name text not null,
  id_number text not null,
  id_type text not null default 'id_card' check (id_type in ('id_card','passport','drivers_license')),
  id_document_url text,
  selfie_url text,

  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  reviewed_at timestamptz,

  submitted_at timestamptz default now()
);

create index idx_kyc_member on public.kyc_submissions(member_id);
create index idx_kyc_status on public.kyc_submissions(status);

-- ============================================================
-- 5. DESTINATIONS (trips)
-- ============================================================
create table public.destinations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  location text not null,
  description text not null,
  retail_price numeric not null,
  wholesale_price numeric not null,
  days text not null,
  nights integer not null default 1,
  schedule text not null,
  category text not null default 'adventure',
  image_url text,
  itinerary text[] default '{}',
  includes text[] default '{}',
  featured boolean not null default false
);

insert into public.destinations (name, location, description, retail_price, wholesale_price, days, nights, schedule, category, image_url, itinerary, includes, featured) values
('Cape Town City & Mountain', 'Cape Town, Western Cape', 'Table Mountain sunrise, Robben Island, Cape Point and the Waterfront.', 6800, 5100, '4 days', 3, 'Mon & Thu departures', 'adventure', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=85', ARRAY['Table Mountain sunrise hike','Robben Island ferry tour','Cape Point and Boulders Beach','V&A Waterfront and Bo-Kaap'], ARRAY['3 nights hotel','Breakfast daily','All transfers','Guided hikes'], true),
('Kruger Big Five Safari', 'Mpumalanga', 'Track the Big Five across 20,000km² with expert rangers.', 22500, 16875, '6 days', 5, 'Sunday departures', 'wildlife', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=85', ARRAY['Dawn and dusk game drives','Bush walk with ranger','Panorama Route','Night spotlight drive'], ARRAY['5 nights safari lodge','All meals','Game drives','Flights from Joburg'], true),
('Cape Winelands Escape', 'Stellenbosch', 'Private estate tastings and Cape Dutch farmhouse dining.', 9200, 6900, '4 days', 3, 'Wed & Sat departures', 'wine', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=85', ARRAY['Private cellar tours','Franschhoek Wine Tram','Cooking class','Blending session'], ARRAY['3 nights wine estate','Breakfasts and 2 dinners','Private guide'], false),
('Drakensberg Trek', 'KwaZulu-Natal', 'Hike the Amphitheatre and ancient San rock art trails.', 8400, 6300, '5 days', 4, 'Friday departures', 'adventure', 'https://images.unsplash.com/photo-1574068468668-a05a11f871da?w=1200&q=85', ARRAY['Tugela Falls hike','Amphitheatre summit','San rock art trail','Giant''s Castle reserve'], ARRAY['4 nights mountain lodge','All meals','Certified guide'], false),
('Garden Route Journey', 'George to Port Elizabeth', 'South Africa''s most spectacular coastal drive.', 14500, 10875, '7 days', 6, 'Sunday departures', 'culture', 'https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=1200&q=85', ARRAY['Knysna lagoon cruise','Bloukrans bungee jump','Tsitsikamma canopy tour','Addo Elephant Park'], ARRAY['6 nights guesthouses','Breakfasts','Hire car included'], false);

-- ============================================================
-- 6. PURCHASES (trips bought by members)
-- ============================================================
create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  member_id uuid references public.members(id) on delete cascade not null,
  destination_id uuid references public.destinations(id) not null,

  retail_price numeric not null,
  wholesale_price numeric not null,
  tier_discount_pct numeric not null default 0,
  final_price numeric not null,
  company_margin numeric not null,

  ohmi_earned numeric not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),

  booking_date date
);

create index idx_purchases_member on public.purchases(member_id);

-- ============================================================
-- 7. BINARY MATCHES — recorded each payout cycle
-- ============================================================
create table public.binary_matches (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  member_id uuid references public.members(id) on delete cascade not null,
  cycle_month date not null,
  left_count integer not null default 0,
  right_count integer not null default 0,
  rank_id integer references public.ranks(id),
  is_qualified boolean not null default false,
  unique(member_id, cycle_month)
);

-- ============================================================
-- 8. PAYOUTS
-- ============================================================
create table public.payouts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  member_id uuid references public.members(id) on delete cascade not null,
  cycle_month date not null,
  payout_date date not null,
  rank_id integer references public.ranks(id) not null,
  monthly_income numeric not null default 0,
  discretionary_bonus numeric not null default 0,
  total_rand numeric not null default 0,
  ohmi_allocated numeric not null default 0,
  status text not null default 'pending' check (status in ('pending','paid')),
  paid_at timestamptz,
  unique(member_id, cycle_month)
);

create index idx_payouts_member on public.payouts(member_id);

-- ============================================================
-- 9. OHMI TRANSACTIONS
-- ============================================================
create table public.ohmi_transactions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  member_id uuid references public.members(id) on delete cascade not null,
  type text not null check (type in ('monthly_allocation','trip_earn','trip_redeem','rand_convert')),
  points numeric not null,
  balance_after numeric not null,
  notes text
);

create index idx_ohmi_member on public.ohmi_transactions(member_id);

-- ============================================================
-- 10. ADMIN USERS
-- ============================================================
create table public.admin_users (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  email text not null,
  is_active boolean not null default true
);

-- ============================================================
-- 11. ROW LEVEL SECURITY
-- ============================================================
alter table public.membership_tiers enable row level security;
alter table public.ranks enable row level security;
alter table public.members enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.destinations enable row level security;
alter table public.purchases enable row level security;
alter table public.binary_matches enable row level security;
alter table public.payouts enable row level security;
alter table public.ohmi_transactions enable row level security;
alter table public.admin_users enable row level security;

create policy "public_read_tiers" on public.membership_tiers for select using (true);
create policy "public_read_ranks" on public.ranks for select using (true);
create policy "public_read_destinations" on public.destinations for select using (true);

create policy "member_read_own" on public.members for select using (auth.uid() = user_id);
create policy "member_update_own" on public.members for update using (auth.uid() = user_id);

create policy "kyc_read_own" on public.kyc_submissions for select using (
  member_id in (select id from public.members where user_id = auth.uid())
);
create policy "kyc_insert_own" on public.kyc_submissions for insert with check (
  member_id in (select id from public.members where user_id = auth.uid())
);

create policy "purchases_read_own" on public.purchases for select using (
  member_id in (select id from public.members where user_id = auth.uid())
);
create policy "purchases_insert_own" on public.purchases for insert with check (
  member_id in (select id from public.members where user_id = auth.uid())
);

create policy "matches_read_own" on public.binary_matches for select using (
  member_id in (select id from public.members where user_id = auth.uid())
);
create policy "payouts_read_own" on public.payouts for select using (
  member_id in (select id from public.members where user_id = auth.uid())
);
create policy "ohmi_read_own" on public.ohmi_transactions for select using (
  member_id in (select id from public.members where user_id = auth.uid())
);

create policy "admin_full_members" on public.members for all using (
  auth.uid() in (select user_id from public.admin_users where is_active = true)
);
create policy "admin_full_kyc" on public.kyc_submissions for all using (
  auth.uid() in (select user_id from public.admin_users where is_active = true)
);
create policy "admin_full_purchases" on public.purchases for all using (
  auth.uid() in (select user_id from public.admin_users where is_active = true)
);
create policy "admin_full_payouts" on public.payouts for all using (
  auth.uid() in (select user_id from public.admin_users where is_active = true)
);
create policy "admin_full_ohmi" on public.ohmi_transactions for all using (
  auth.uid() in (select user_id from public.admin_users where is_active = true)
);
create policy "admin_full_matches" on public.binary_matches for all using (
  auth.uid() in (select user_id from public.admin_users where is_active = true)
);
create policy "admin_full_destinations" on public.destinations for all using (
  auth.uid() in (select user_id from public.admin_users where is_active = true)
);

-- ============================================================
-- 12. CORE FUNCTION — calculate and run monthly payout
-- ============================================================
create or replace function public.run_monthly_payout(p_cycle_month date)
returns integer language plpgsql security definer as $$
declare
  v_member record;
  v_left integer;
  v_right integer;
  v_rank record;
  v_qualified boolean;
  v_count integer := 0;
begin
  for v_member in
    select m.*, t.ohmi_points_monthly
    from public.members m
    join public.membership_tiers t on t.id = m.tier_id
    where m.status = 'active'
  loop
    -- count active members on left leg (recursive)
    with recursive left_tree as (
      select id, status from public.members where id = v_member.left_child_id
      union all
      select m2.id, m2.status from public.members m2
      inner join left_tree lt on m2.parent_id = lt.id
    )
    select count(*) into v_left from left_tree where status = 'active';

    with recursive right_tree as (
      select id, status from public.members where id = v_member.right_child_id
      union all
      select m2.id, m2.status from public.members m2
      inner join right_tree rt on m2.parent_id = rt.id
    )
    select count(*) into v_right from right_tree where status = 'active';

    -- find highest rank both legs qualify for
    select * into v_rank from public.ranks
    where left_required <= v_left and right_required <= v_right
    order by sort_order desc limit 1;

    v_qualified := v_rank.id is not null;

    update public.members
    set left_leg_count = v_left, right_leg_count = v_right,
        current_rank_id = case when v_qualified then v_rank.id else current_rank_id end
    where id = v_member.id;

    insert into public.binary_matches (member_id, cycle_month, left_count, right_count, rank_id, is_qualified)
    values (v_member.id, p_cycle_month, v_left, v_right, v_rank.id, v_qualified)
    on conflict (member_id, cycle_month) do update
      set left_count = excluded.left_count, right_count = excluded.right_count,
          rank_id = excluded.rank_id, is_qualified = excluded.is_qualified;

    if v_qualified then
      insert into public.payouts (member_id, cycle_month, payout_date, rank_id, monthly_income, discretionary_bonus, total_rand, ohmi_allocated, status)
      values (
        v_member.id, p_cycle_month,
        (p_cycle_month + interval '1 month' + interval '14 days')::date,
        v_rank.id, v_rank.monthly_income, v_rank.discretionary_bonus,
        v_rank.monthly_income + v_rank.discretionary_bonus,
        v_member.ohmi_points_monthly, 'pending'
      )
      on conflict (member_id, cycle_month) do update
        set rank_id = excluded.rank_id, monthly_income = excluded.monthly_income,
            discretionary_bonus = excluded.discretionary_bonus, total_rand = excluded.total_rand;

      insert into public.ohmi_transactions (member_id, type, points, balance_after, notes)
      values (v_member.id, 'monthly_allocation', v_member.ohmi_points_monthly,
              v_member.ohmi_balance + v_member.ohmi_points_monthly, 'Monthly allocation');

      update public.members
      set ohmi_balance = ohmi_balance + v_member.ohmi_points_monthly,
          ohmi_lifetime = ohmi_lifetime + v_member.ohmi_points_monthly
      where id = v_member.id;
    end if;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- ============================================================
-- 13. FUNCTION — process a trip purchase
-- ============================================================
create or replace function public.buy_trip(
  p_member_id uuid,
  p_destination_id uuid
) returns uuid language plpgsql security definer as $$
declare
  v_dest record;
  v_tier record;
  v_final numeric;
  v_ohmi numeric;
  v_purchase_id uuid;
begin
  select * into v_dest from public.destinations where id = p_destination_id;
  select t.* into v_tier from public.members m
    join public.membership_tiers t on t.id = m.tier_id
    where m.id = p_member_id;

  v_final := v_dest.retail_price * (1 - v_tier.trip_discount_pct / 100);
  v_ohmi := v_final * (case when v_tier.name = 'Bespoke' then 0.2 else 0.1 end);

  insert into public.purchases (member_id, destination_id, retail_price, wholesale_price, tier_discount_pct, final_price, company_margin, ohmi_earned, payment_status, booking_date)
  values (p_member_id, p_destination_id, v_dest.retail_price, v_dest.wholesale_price, v_tier.trip_discount_pct, v_final, v_dest.retail_price - v_dest.wholesale_price, v_ohmi, 'paid', current_date)
  returning id into v_purchase_id;

  insert into public.ohmi_transactions (member_id, type, points, balance_after, notes)
  values (p_member_id, 'trip_earn', v_ohmi,
    (select ohmi_balance from public.members where id = p_member_id) + v_ohmi,
    'Trip purchase: ' || v_dest.name);

  update public.members set ohmi_balance = ohmi_balance + v_ohmi, ohmi_lifetime = ohmi_lifetime + v_ohmi where id = p_member_id;

  return v_purchase_id;
end;
$$;

select 'OHMI Travel schema installed successfully' as result;
