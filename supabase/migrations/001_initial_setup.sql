-- ============================================================
-- Cape Town Travel App — Full Database Setup
-- Run this in your Supabase SQL editor
-- ============================================================

-- 1. DESTINATIONS TABLE
create table if not exists public.destinations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  location text not null,
  description text not null,
  price numeric not null,
  currency text not null default 'ZAR',
  duration text not null,
  schedule text not null,
  points integer not null default 0,
  rating numeric(2,1) not null default 5.0,
  review_count integer not null default 0,
  image_url text,
  includes text[] not null default '{}',
  category text not null default 'adventure',
  featured boolean not null default false
);

-- 2. BOOKINGS TABLE
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  destination_id uuid references public.destinations(id) on delete cascade not null,
  guests integer not null default 1,
  total_price numeric not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  booking_date date not null,
  notes text
);

-- 3. WISHLISTS TABLE
create table if not exists public.wishlists (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  destination_id uuid references public.destinations(id) on delete cascade not null,
  unique(user_id, destination_id)
);

-- 4. STORAGE BUCKET for destination images
insert into storage.buckets (id, name, public)
values ('destinations', 'destinations', true)
on conflict (id) do nothing;

-- 5. ROW LEVEL SECURITY
alter table public.destinations enable row level security;
alter table public.bookings enable row level security;
alter table public.wishlists enable row level security;

-- Destinations: anyone can read, only service role can write
create policy "Destinations are public" on public.destinations
  for select using (true);

-- Bookings: users can only see and manage their own
create policy "Users can view own bookings" on public.bookings
  for select using (auth.uid() = user_id);

create policy "Users can create bookings" on public.bookings
  for insert with check (auth.uid() = user_id);

create policy "Users can update own bookings" on public.bookings
  for update using (auth.uid() = user_id);

-- Wishlists: users manage their own
create policy "Users can view own wishlist" on public.wishlists
  for select using (auth.uid() = user_id);

create policy "Users can add to wishlist" on public.wishlists
  for insert with check (auth.uid() = user_id);

create policy "Users can remove from wishlist" on public.wishlists
  for delete using (auth.uid() = user_id);

-- Storage: public read, authenticated upload
create policy "Public can view images" on storage.objects
  for select using (bucket_id = 'destinations');

create policy "Authenticated users can upload images" on storage.objects
  for insert with check (bucket_id = 'destinations' and auth.role() = 'authenticated');

-- 6. SEED DATA — Cape Town experiences
insert into public.destinations (name, location, description, price, currency, duration, schedule, points, rating, review_count, includes, category, featured) values
(
  'Table Mountain Sunrise Hike',
  'Table Mountain, Cape Town',
  'Watch the sun rise over the Cape Peninsula from 1,086m. A certified guide leads you up Platteklip Gorge as the city wakes below. Breakfast at the summit with panoramic views of Robben Island, the Atlantic, and the Winelands.',
  890,
  'ZAR',
  '4–5 hours',
  'Daily at 5:30 AM',
  320,
  4.9,
  312,
  ARRAY['Certified guide', 'Summit breakfast', 'Water and snacks', 'Hotel pickup', 'Safety gear', 'Photo stops'],
  'adventure',
  true
),
(
  'Boulders Beach Penguin Day Trip',
  'Simon''s Town, Cape Peninsula',
  'Walk among African penguins at their famous granite-boulder colony, then continue to Cape Point where two oceans meet. Return via Chapman''s Peak — one of the world''s most scenic coastal drives.',
  1250,
  'ZAR',
  'Full day',
  'Tue, Thu and Sat',
  180,
  4.8,
  204,
  ARRAY['Private guide', 'Lunch at Simon''s Town', 'Cape Point entry', 'Hotel transfers', 'Conservation fee', 'All transport'],
  'wildlife',
  false
),
(
  'Cape Winelands Private Tour',
  'Stellenbosch and Franschhoek',
  'Three private estates across Stellenbosch and Franschhoek, a Cape Dutch farmhouse lunch, and golden-hour tastings as the valley turns amber. One of the world''s great wine-country experiences, right on your doorstep.',
  2100,
  'ZAR',
  'Full day',
  'Wed, Fri and Sun',
  240,
  4.9,
  178,
  ARRAY['3 private estates', 'Cape Dutch lunch', 'Wine tastings', 'Dedicated driver', 'Hotel transfers', 'Franschhoek pass'],
  'wine',
  false
),
(
  'Robben Island Full Experience',
  'Robben Island, Table Bay',
  'Step inside the cell where Nelson Mandela spent 18 years. Former political prisoners lead the tour, making this one of the most powerful living-history experiences in the world.',
  950,
  'ZAR',
  'Half day',
  'Daily at 9:00 AM',
  280,
  4.9,
  524,
  ARRAY['Ferry crossing', 'Former prisoner guide', 'Prison tour', 'Village walk', 'Audio guide', 'Museum entry'],
  'culture',
  false
),
(
  'Bo-Kaap Sunrise Walking Tour',
  'Bo-Kaap, Cape Town City Bowl',
  'Wander the cobbled streets of Cape Town''s most colourful neighbourhood as the morning light catches the painted facades. Meet local Malay families and taste koesisters fresh from the oven.',
  450,
  'ZAR',
  '2.5 hours',
  'Mon, Wed and Fri at 7:00 AM',
  120,
  4.7,
  189,
  ARRAY['Local guide', 'Traditional koesisters', 'Spice market visit', 'History talk', 'Small group (max 8)', 'Hotel pickup'],
  'culture',
  false
);
