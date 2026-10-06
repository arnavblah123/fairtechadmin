# Deploying the owner dashboard

Three services are involved: **Vercel** (hosts the dashboard and six of the
apps), **Neon** (the dashboard's own Postgres) and **Supabase** (the purchase
app's backend). Everything below is a copy-paste or a click.

## 1. Collect the values you don't have yet

| Value | Where to get it |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | https://console.neon.tech → **New project** (name `fairtechadmin`, region Singapore) → on the project page press **Connect** → copy the string twice: once with **Pooled connection** ON (→ `DATABASE_URL`), once OFF (→ `DIRECT_URL`). |
| `PRODUCTION_INTEGRATION_KEY` | https://vercel.com → project **fairtechproduction** → Settings → Environment Variables → the value of `INTEGRATION_EXPORT_KEY` (press the eye icon to reveal). |
| `PURCHASE_FEED_URL` | https://supabase.com/dashboard/project/_/settings/api → **Project URL** (looks like `https://abcdefgh.supabase.co`) + `/functions/v1`. |
| `PURCHASE_SUPABASE_ANON_KEY` | Same page → **Project API keys** → `anon` `public`. |
| `SMTP_PASS` | https://myaccount.google.com/apppasswords (2-step verification must be on) → create one named "Fairtech owner dashboard". Or reuse the one already set as `SMTP_PASS` on fairtechproduction. |
| `EPC_APP_URL` | The Vercel URL of the EPC site-manager project (Vercel → that project → Domains). |
| `VERCEL_TOKEN` | https://vercel.com/account/tokens → **Create** → scope: the team that owns the projects. Only needed to run the script in step 3. |

`SESSION_SECRET`, `ADMIN_FEED_KEY`, `CRON_SECRET` and `OWNER_PASSWORD_HASH` are
generated, see the values in your chat or make new ones:

```bash
openssl rand -hex 32                      # SESSION_SECRET, ADMIN_FEED_KEY
openssl rand -hex 24                      # CRON_SECRET
node -e "console.log(require('bcryptjs').hashSync('YOUR-PASSWORD', 10))"   # OWNER_PASSWORD_HASH
```

## 2. Create the Vercel project

https://vercel.com/new → Import **arnavblah123/fairtechadmin** → Framework
Next.js (auto-detected) → **Deploy** (it will fail the first time without
variables; that is fine). Or let the script create it (step 3,
`CREATE_ADMIN_PROJECT=1`).

## 3. Push every variable with one command

```bash
cp deploy.env.example deploy.env     # fill the <<PASTE>> lines
VERCEL_TOKEN=xxxxxxxx node scripts/push-env.mjs deploy.env
# in a team account add VERCEL_TEAM_SLUG=your-team-slug
```

This sets all variables on **fairtechadmin** and `ADMIN_FEED_KEY` on every
project in `FEED_PROJECTS`. Then **Redeploy** each project (Vercel →
Deployments → ⋯ → Redeploy) or merge the `claude/jolly-meitner-mg4cyy`
branches so they deploy on push.

Prefer clicking? Vercel → project → Settings → Environment Variables → paste
the whole block at once: the form accepts multi-line `KEY=VALUE` paste.

## 4. Purchase app (Supabase)

From the `fair-tech-purchase` repo, with the Supabase CLI logged in
(`supabase login`, `supabase link --project-ref PROJECT-REF`):

```bash
supabase db push                                   # applies migration 0062
supabase secrets set ADMIN_FEED_KEY=<same value>
supabase functions deploy admin-feed
```

## 5. Verify

Open the dashboard → **Settings** → press **Test connection** on each app.
Green = key and URL right. 401 = key differs. 404 = that app's branch is not
deployed yet. 503 = `ADMIN_FEED_KEY` missing on that app.
