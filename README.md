# OHMI Travel

One app, one schema file, no version confusion. Deploy this and it works.

## STEP 1 — Wipe and rebuild your Supabase database

In Supabase SQL Editor, paste the **entire** `supabase/schema.sql` file and click Run.
This drops every old table and rebuilds everything fresh:
- 10 ranks, exact from your actuarial document
- 2 membership tiers (Explorer R1,499 / Bespoke R2,499)
- 5 sample trips with wholesale pricing
- The full binary payout calculation function (`run_monthly_payout`)
- The trip purchase function (`buy_trip`)
- All Row Level Security policies

## STEP 2 — Make yourself an admin (optional, for running payouts)

After you sign up your first account through the app, run this in SQL Editor:

```sql
insert into public.admin_users (user_id, email)
values ('YOUR-AUTH-USER-UUID', 'you@example.com');
```

Find your UUID in Supabase → Authentication → Users.

## STEP 3 — Wipe your GitHub "Travel" repo

1. Go to your GitHub repo
2. Delete every file in it
3. Upload every file from this download, keeping the folder structure exactly as-is

## STEP 4 — Set environment variables in Vercel

Vercel → your project → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://cpecnyybafbqkzmkawmc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

(Get the anon key from Supabase → Settings → API)

## STEP 5 — Redeploy

Vercel will auto-deploy once you push. Or trigger manually: Deployments → ... → Redeploy.

---

## What's in the app

- **Register** — sign up, optionally enter a sponsor's email, pick left/right leg, pick Explorer or Bespoke
- **Dashboard** with 6 tabs:
  - **Overview** — your rank, payout amount, progress bars to next rank
  - **Tree** — left/right leg counts, your direct downline list, your sponsor link to share
  - **Payouts** — full history
  - **OHMI** — point balance and transaction log
  - **Trips** — browse and book 5 real trips at your tier's discount, booking history
  - **KYC** — submit identity verification, see status

## Running the monthly payout

This has to be triggered manually right now (call the API or run the SQL function directly):

```sql
select run_monthly_payout('2026-07-01');
```

This walks every active member's tree, counts left/right legs, assigns the correct rank, and creates payout + OHMI records automatically — using your exact actuarial numbers.

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase keys
npm run dev
```
