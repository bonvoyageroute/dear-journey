# Dear Journey

A little book for every journey. Next.js + Supabase.

## 1. Run it without any accounts (demo mode)

Leave the Supabase variables empty and the book runs on sample data saved in your browser.
Good for a first look, not for a real trip.

## 2. Connect Supabase (real saving)

1. supabase.com → **New project** (free). Wait for it to finish building.
2. **SQL editor → New query** → paste everything in `supabase/schema.sql` → **Run**.
3. **Project settings → API** → copy *Project URL* and *anon public* key.
4. In Vercel → your project → **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deployments → … → Redeploy**.
6. Open the site → `/login` → type your email → open the link in the email.

## 3. Deploy on Vercel

1. github.com → **New repository** → upload this folder.
2. vercel.com → **Add New → Project** → import that repository → **Deploy**.
3. Open the URL on your phone → Share → **Add to Home Screen**.

## 4. Auto-fill place photos (optional)

Without any setup, a stop in Plan only gets a photo if you paste a link into
"Your own photo link". Add a Google Places API key and the app finds a real
photo of the place automatically instead — you never have to hunt one down.

1. console.cloud.google.com → create/select a project → **Billing** → attach
   a billing account (required by Google even within the free tier) →
   **APIs & Services → Library** → enable **Places API (New)**.
2. **APIs & Services → Credentials → Create credentials → API key**. Restrict
   it to "Places API (New)" if you can, so it can't be used for anything else.
3. In Vercel → your project → **Settings → Environment Variables**, add
   `GOOGLE_PLACES_API_KEY` (server-side only — never prefix it with
   `NEXT_PUBLIC_`, or the key would ship to every visitor's browser).
4. **Deployments → … → Redeploy**.

**Cost.** Google charges per photo actually fetched: about US$7 per 1,000
photo requests (the first 1,000 each month are free), roughly $5.60/1,000
once you're past 100k in a month. Each stop's photo is fetched once and then
cached by the browser for 30 days, so re-opening a page doesn't re-charge
you. There's also a small Text Search cost to look the place up the first
time, which Google doesn't publish as one flat number — as a safety net,
set a **budget alert** in Google Cloud (Billing → Budgets & alerts) so
you'd be notified long before it became meaningful for personal use.

Leave the key unset and nothing breaks — stops just show the blank polaroid
card until you paste a photo link by hand, exactly like before.

## Local development

```bash
npm install
cp .env.example .env.local   # optional, for Supabase
npm run dev
```

## What is inside

- `app/(book)/plan` days, stops, planned cost, place polaroids (auto-filled from Google Places if a key is set, see below — or paste your own link)
- `app/(book)/calendar` the month grid — trip days shaded, tap a day to open it in Plan
- `app/(book)/today` next stop, later today, spent today
- `app/(book)/expense` summary, by day (planned vs actual), split
- `app/(book)/moodboard` place photos kept as links, not uploads
- `app/(book)/settings` trip title, dates, currency, budget
