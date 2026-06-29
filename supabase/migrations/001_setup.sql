-- Run this entire file in your Supabase SQL Editor

create table if not exists public.destinations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  location text not null,
  description text not null,
  price numeric not null,
  currency text default 'ZAR',
  duration text not null,
  schedule text not null,
  points integer default 0,
  rating numeric(2,1) default 5.0,
  review_count integer default 0,
  image_url text,
  includes text[] default '{}',
  category text default 'adventure',
  featured boolean default false
);

create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  destination_id uuid references public.destinations(id) on delete cascade not null,
  guests integer default 1,
  total_price numeric not null,
  status text default 'pending' check (status in ('pending','confirmed','cancelled')),
  booking_date date not null,
  notes text
);

create table if not exists public.wishlists (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade not null,
  destination_id uuid references public.destinations(id) on delete cascade not null,
  unique(user_id, destination_id)
);

alter table public.destinations enable row level security;
alter table public.bookings enable row level security;
alter table public.wishlists enable row level security;

create policy "Destinations public" on public.destinations for select using (true);
create policy "Users view own bookings" on public.bookings for select using (auth.uid() = user_id);
create policy "Users create bookings" on public.bookings for insert with check (auth.uid() = user_id);
create policy "Users view own wishlist" on public.wishlists for select using (auth.uid() = user_id);
create policy "Users add wishlist" on public.wishlists for insert with check (auth.uid() = user_id);
create policy "Users delete wishlist" on public.wishlists for delete using (auth.uid() = user_id);

insert into public.destinations (name, location, description, price, duration, schedule, points, rating, review_count, includes, category, featured) values
('Table Mountain Sunrise Hike','Table Mountain, Cape Town','Watch the sun rise over the Cape Peninsula from 1,086m. A certified guide leads you up Platteklip Gorge as the city wakes below. Breakfast at the summit with panoramic views of Robben Island and the Winelands.',890,'4–5 hours','Daily at 5:30 AM',320,4.9,312,ARRAY['Certified guide','Summit breakfast','Water and snacks','Hotel pickup','Safety gear','Photo stops'],'adventure',true),
('Boulders Beach Penguin Day Trip','Simon''s Town, Cape Peninsula','Walk among African penguins at their famous granite-boulder colony, then continue to Cape Point where two oceans meet. Return via Chapman''s Peak drive.',1250,'Full day','Tue, Thu and Sat',180,4.8,204,ARRAY['Private guide','Lunch','Cape Point entry','Hotel transfers','Conservation fee','All transport'],'wildlife',false),
('Cape Winelands Private Tour','Stellenbosch and Franschhoek','Three private estates, a Cape Dutch farmhouse lunch, and golden-hour tastings as the valley turns amber.',2100,'Full day','Wed, Fri and Sun',240,4.9,178,ARRAY['3 private estates','Cape Dutch lunch','Wine tastings','Dedicated driver','Hotel transfers','Franschhoek pass'],'wine',false),
('Robben Island Experience','Robben Island, Table Bay','Step inside the cell where Nelson Mandela spent 18 years. Former political prisoners lead the tour.',950,'Half day','Daily at 9:00 AM',280,4.9,524,ARRAY['Ferry crossing','Former prisoner guide','Prison tour','Village walk','Audio guide','Museum entry'],'culture',false),
('Bo-Kaap Sunrise Walk','Bo-Kaap, Cape Town','Wander the cobbled streets of Cape Town''s most colourful neighbourhood as morning light catches the painted facades.',450,'2.5 hours','Mon, Wed and Fri at 7 AM',120,4.7,189,ARRAY['Local guide','Traditional koesisters','Spice market','History talk','Small group (max 8)','Hotel pickup'],'culture',false);
