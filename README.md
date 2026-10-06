# Fairtech Owner dashboard

One screen for the owner: every approval, flag, number, message and report
from every Fairtech app, with approve / reject / resolve buttons that act
inside the source app.

```
Production · Store & Consumables · Petty Cash · Machines · EPC Sites
Labour Portal · Purchase & Material · Security Gate (when its feed ships)
```

**Stack:** Next.js 15 (App Router) · React 19 · Tailwind 4 · Prisma 6 on
Postgres (Neon) · jose sessions · nodemailer. Deploys to Vercel; mobile-first
PWA like the other Fairtech apps.

## How it works

The dashboard never reads another app's database. Each app exposes one small,
keyed endpoint — the **Admin Feed** — and the dashboard calls it server-side:

```
GET  {app}/api/admin-feed        → kpis, approvals, flags, activity, messages, reports
POST {app}/api/admin-feed/act    → one decision, run through the app's own approve/reject logic
header: x-admin-key: <ADMIN_FEED_KEY>   (same value on every app and here)
```

The contract is in [`docs/FEED_CONTRACT.md`](docs/FEED_CONTRACT.md) and
[`lib/feed/contract.ts`](lib/feed/contract.ts). Every app on the list above
already implements it (see each app's README, section "Owner dashboard feed").
The purchase app's feed is a Supabase edge function, so its base URL is
`https://<project>.supabase.co/functions/v1` with feed path `/admin-feed`.

What the dashboard adds on top of the feeds:

| Page | What it shows |
|---|---|
| **Today** | Headline counts, app health strip, oldest approvals, critical and warning flags, numbers to watch, money tiles, inbox, follow-ups, recent activity. Auto-refreshes every minute. |
| **Approvals** | Everything pending across apps, oldest first, filter by app or unit, inline approve / query / reject with notes and editable amounts. |
| **Flags** | Critical / warning / info, with resolve or acknowledge where the app supports it, and **Snooze** (hides on this dashboard only). |
| **Inbox** | Complaints, AI findings, quote questions, flags, incidents and errors from every app, last 7 days. |
| **Reports** | All ₹ KPIs together, 14-day backlog trend per app (from hourly snapshots), every KPI grouped by app, links into each app's own reports. |
| **Activity** | The apps' audit logs merged, last 24 h, with the most active people. |
| **Notes** | The owner's own follow-up list, optionally tied to an app and a due date. |
| **My decisions** | Audit of every button pressed here, with the source app's answer. |
| **Settings** | Health checks, app registry (URL, headers, test connection), morning digest. |

Plus a **morning digest email** at 08:00 IST and an **hourly snapshot** for
trends, both via Vercel cron (`vercel.json`).

## Setup

1. **Postgres**: create a Neon database; set `DATABASE_URL` (pooled) and
   `DIRECT_URL` (direct). `npm run build` runs `prisma migrate deploy`.
2. **Secrets** (see `.env.example`):
   * `SESSION_SECRET` — `openssl rand -hex 32`
   * `ADMIN_FEED_KEY` — `openssl rand -hex 32`; set the **same** value as
     `ADMIN_FEED_KEY` on every app (Vercel env / `supabase secrets set`).
   * Owner login: `OWNER_EMAIL` + `OWNER_PASSWORD_HASH`
     (`node -e "console.log(require('bcryptjs').hashSync('pw', 10))"`), and/or
     `PRODUCTION_APP_URL` + `PRODUCTION_INTEGRATION_KEY` to accept the
     production app's SUPERADMIN login.
   * `CRON_SECRET` for the cron routes; `SMTP_*` + `MAIL_TO` for the digest.
3. **App URLs**: the `*_APP_URL` env vars pre-fill the registry; anything can
   be changed later in Settings → Apps, including per-app extra headers
   (the purchase app needs the Supabase anon key there or in
   `PURCHASE_SUPABASE_ANON_KEY`).
4. Deploy each app's latest version so `/api/admin-feed` exists, then open
   Settings → **Test connection** on each.

Local preview without any app: set `MOCK_FEEDS=1` and the dashboard shows
realistic sample data for every app (never set this in production).

```bash
npm install
cp .env.example .env   # fill DATABASE_URL, SESSION_SECRET, OWNER_*, MOCK_FEEDS=1
npx prisma migrate deploy
npm run dev
```

## Security notes

* Owner-only. There is one role; no self sign-up.
* `x-admin-key` is checked with a constant-time compare in every app and only
  that key opens the feed — the apps' other integration keys cannot approve
  anything.
* Every action is logged here (`ActionLog`) **and** in the source app's own
  audit trail, attributed to the owner account there.
* `X-Frame-Options: DENY`; cookies are httpOnly, SameSite=Lax, 30 days.

## Adding a new app

Implement the two routes per `docs/FEED_CONTRACT.md`, set `ADMIN_FEED_KEY`,
add the app in Settings → "Add another app". Nothing in this repo needs to
change.
