# Ailleurs — Cape Town Travel App

A full-stack immersive travel agency app built with Next.js 14, Supabase, and Tailwind CSS.

## Features
- Email/password auth via Supabase
- Swipeable destination cards with full-screen images and prices
- Detail view with booking form (guests + date)
- Wishlist (heart) per destination
- Bookings history page
- Deployed to Vercel, database on Supabase

---

## Setup — follow these steps in order

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd cape-town-travel
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → open your project
2. Click **SQL Editor** in the left sidebar
3. Paste the entire contents of `supabase/migrations/001_initial_setup.sql`
4. Click **Run** — this creates all tables, policies, and seeds the 5 Cape Town experiences

### 3. Get your Supabase keys

1. In Supabase → **Settings** → **API**
2. Copy **Project URL** and **anon public** key

### 4. Add environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A — Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option B — GitHub integration
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add the three environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**

---

## Adding real destination photos

1. In Supabase → **Storage** → open the `destinations` bucket
2. Upload your images (JPG/PNG)
3. Click an image → copy its public URL
4. In Supabase → **Table Editor** → `destinations` → edit a row → paste the URL into `image_url`

---

## Project structure

```
app/
  page.tsx              → redirects based on auth
  login/page.tsx        → sign in / sign up
  destinations/page.tsx → main swipe experience
  bookings/page.tsx     → booking history
  api/
    bookings/route.ts   → create + list bookings
    destinations/
      wishlist/route.ts → toggle wishlist

components/
  DestinationSwiper.tsx → orchestrates swipe state
  DestinationCard.tsx   → full-screen image + price
  DetailPanel.tsx       → description + booking form
  BottomNav.tsx         → tab bar

lib/supabase/
  client.ts             → browser Supabase client
  server.ts             → server Supabase client
  database.types.ts     → TypeScript types

supabase/migrations/
  001_initial_setup.sql → full DB setup + seed data

middleware.ts           → auth protection on all routes
```
