# Open Wine Society

Your personal wine intelligence platform — React + Vite, Supabase (Postgres + Auth + Storage), Claude AI, Vercel.

## What's new in v4.1

* **Multi-user**: full sign up / login / logout / password reset via Supabase Auth. Each user has their own private inventory, tasting history, dashboard, and AI Sommelier context.
* **Public homepage**: philosophy narrative + Login / Create Account, editable via an Admin Console.
* **WSET Level 3 tasting scales**: Intensity/Tannin/Acidity (Low → High), Body (Light → Full), Sweetness (Dry → Luscious) replace the old 0–100 sliders.
* **ABV field** added to Add Wine; **Rating removed** from Add Wine — ratings are now captured only when a bottle is consumed (Tasting History).
* **Brown** added as a wine color (aged/fortified wines).
* **Mathematical taste profile** built from consumed wines, shown as a radar/spider chart in Tasting History. Recommendations are tagged "Within Your Profile" / "Outside Your Profile".
* **Consumption behavior**: when a wine's quantity hits 0, it's removed from active Inventory automatically but its tasting record is permanent.
* **Interactive world map** on the Dashboard — one pin per wine by origin coordinates (free, no API key — `react-simple-maps`).
* **Budget-aware recommendations**: set a typical budget per bottle in Recommendations; Claude respects it.

## Setup

### 1\. Install

```bash
npm install
```

### 2\. Environment variables

```bash
cp .env.example .env
```

```env
VITE\_SUPABASE\_URL=https://ryyhnmllfglxygfdyeya.supabase.co
VITE\_SUPABASE\_ANON\_KEY=your\_anon\_key\_here
```

`ANTHROPIC\_API\_KEY` is set in **Vercel → Settings → Environment Variables** only (no `VITE\_` prefix — it must never reach the browser bundle). For local dev, add it to `.env` too, but never commit that file.

### 3\. Run the database migrations

In Supabase → SQL Editor, run **in order**:

1. `supabase/migrations/001\_initial\_schema.sql`
2. `supabase/migrations/002\_multiuser\_wset\_v41.sql` (schema only — safe to run anytime)

Don't run `003` yet — see step 5.

### 4\. Enable email auth in Supabase

Supabase → Authentication → Providers → make sure **Email** is enabled. Under **URL Configuration**, set your Site URL to `https://openwinesociety.com` (or `http://localhost:5173` for local dev) so password reset links redirect correctly.

### 5\. Migrate your existing data to your account

1. Deploy or run locally, then **sign up** at `openwinesociety@gmail.com` — this becomes the `toddbrad` account.
2. Once that account exists, run `supabase/migrations/003\_migrate\_existing\_data.sql` in Supabase SQL Editor.
3. This reassigns all existing wines, tasting events, and storage locations to `openwinesociety@gmail.com`, and flags it as admin.

### 6\. Run locally

```bash
npm run dev
```

## Deploy to Vercel

Same as before — push to GitHub, Vercel auto-deploys. Environment variables needed:

* `VITE\_SUPABASE\_URL`
* `VITE\_SUPABASE\_ANON\_KEY`
* `ANTHROPIC\_API\_KEY` (server-side only, used by `api/claude.js`)

## Project Structure

```
openwinesociety/
├── api/
│   └── claude.js                # Vercel serverless proxy — holds the Anthropic key server-side
├── src/
│   ├── components/
│   │   ├── WineDetail.jsx
│   │   ├── ConsumeModal.jsx     # Captures WSET scales + rating at consumption
│   │   ├── RadarChart.jsx       # Pure SVG spider chart, no dependency
│   │   └── WorldMap.jsx         # Free SVG world map (react-simple-maps), no API key
│   ├── hooks/
│   │   ├── useAuth.jsx          # Supabase Auth session + profile
│   │   └── useCellar.jsx        # Wines/events/locations, scoped by RLS to the signed-in user
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── db.js                # All database operations, WSET fields, admin/site settings
│   │   ├── claude.js            # Calls /api/claude — recs, aging, sommelier chat
│   │   └── presets.js           # WSET scales, style presets, wine colors, helpers
│   ├── pages/
│   │   ├── Homepage.jsx         # Public
│   │   ├── Login.jsx / SignUp.jsx / PasswordReset.jsx   # Public
│   │   ├── Dashboard.jsx        # Private — includes world map + regional summary
│   │   ├── Inventory.jsx
│   │   ├── AddBottle.jsx        # ABV field, WSET pickers, no Rating
│   │   ├── Recommendations.jsx  # Budget field, Within/Outside Profile badges
│   │   ├── Sommelier.jsx
│   │   ├── TastingHistory.jsx   # Radar chart taste profile
│   │   ├── StorageLocations.jsx
│   │   ├── ImportExport.jsx
│   │   └── AdminConsole.jsx     # Hero image + homepage copy — admin-only
│   ├── App.jsx                  # Public/private routing
│   └── index.css
├── supabase/migrations/
│   ├── 001\_initial\_schema.sql
│   └── 002\_multiuser\_wset\_v41.sql
└── vercel.json
```

## Product decisions on record

* Recommendation engine considers budget; wine **availability** is out of scope.
* No public/private cellar sharing in this release.
* Admin access is role-based (`profiles.is\_admin`), not hardcoded to one email — flip the flag directly in the `profiles` table in Supabase for now.
* 

