import { listApps, KNOWN_APPS, isMockMode, feedKeyFor } from "@/lib/feed/registry";
import { db } from "@/lib/db";
import { mailConfigured } from "@/lib/email";
import { AppForm, DigestButton } from "@/components/settings-forms";
import { deleteAppAction, saveSettingAction } from "@/lib/actions/settings";
import { Section } from "@/components/section";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const apps = await listApps(true);
  let settings: Record<string, string> = {};
  let dbOk = true;
  try {
    settings = Object.fromEntries((await db.setting.findMany()).map((s) => [s.key, s.value]));
  } catch {
    dbOk = false;
  }
  const notes = new Map(KNOWN_APPS.map((k) => [k.key, k.note]));
  const checks = [
    { label: "Database", ok: dbOk, hint: dbOk ? "connected" : "DATABASE_URL not reachable — settings, notes, snoozes and history will not persist" },
    { label: "Session secret", ok: Boolean(process.env.SESSION_SECRET), hint: process.env.SESSION_SECRET ? "set" : "SESSION_SECRET missing (login refused in production)" },
    { label: "Admin feed key", ok: Boolean(process.env.ADMIN_FEED_KEY), hint: process.env.ADMIN_FEED_KEY ? "set — must equal ADMIN_FEED_KEY on every app" : "ADMIN_FEED_KEY missing — no app will answer" },
    { label: "Owner login", ok: Boolean(process.env.OWNER_EMAIL && (process.env.OWNER_PASSWORD_HASH || process.env.OWNER_PASSWORD)) || Boolean(process.env.PRODUCTION_APP_URL && process.env.PRODUCTION_INTEGRATION_KEY), hint: "OWNER_EMAIL + OWNER_PASSWORD_HASH, or PRODUCTION_APP_URL + PRODUCTION_INTEGRATION_KEY" },
    { label: "Email digest", ok: mailConfigured(), hint: mailConfigured() ? `to ${process.env.MAIL_TO || process.env.OWNER_EMAIL}` : "SMTP_USER / SMTP_PASS / MAIL_TO not set" },
    { label: "Cron secret", ok: Boolean(process.env.CRON_SECRET), hint: process.env.CRON_SECRET ? "set" : "CRON_SECRET missing — Vercel cron calls are still accepted by header, but manual calls are refused" },
    { label: "Demo data", ok: !isMockMode(), hint: isMockMode() ? "MOCK_FEEDS=1 — showing sample data, not real apps" : "off" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500">Connected apps, health of this dashboard, and the morning digest.</p>
      </div>

      <Section title="Health">
        <ul className="card divide-y divide-slate-100">
          {checks.map((c) => (
            <li key={c.label} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className={`h-2.5 w-2.5 rounded-full ${c.ok ? "bg-emerald-500" : "bg-red-500"}`} />
              <span className="font-medium w-36">{c.label}</span>
              <span className="text-slate-600">{c.hint}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Connected apps">
        <p className="text-sm text-slate-600 -mt-1">
          Each app needs its latest version deployed (it adds <code className="text-xs bg-slate-100 px-1 rounded">/api/admin-feed</code>) and the same <code className="text-xs bg-slate-100 px-1 rounded">ADMIN_FEED_KEY</code> in its environment. URLs below default from env vars; saving here overrides them.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {apps.map((a) => (
            <div key={a.key} className="space-y-1">
              <AppForm app={a} note={notes.get(a.key)} />
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>key source: {feedKeyFor(a.key) ? (process.env[`ADMIN_FEED_KEY_${a.key.toUpperCase()}`] ? `ADMIN_FEED_KEY_${a.key.toUpperCase()}` : "ADMIN_FEED_KEY") : "none"}</span>
                <form action={deleteAppAction}>
                  <input type="hidden" name="key" value={a.key} />
                  <button className="hover:text-red-700">reset to env default</button>
                </form>
              </div>
            </div>
          ))}
          <AppForm app={null} isNew />
        </div>
      </Section>

      <Section title="Morning digest">
        <div className="card p-4 space-y-3">
          <p className="text-sm text-slate-600">
            Every day at 8:00 IST the dashboard emails you a brief: approvals waiting, critical flags, numbers to watch, apps that are down. It also takes an hourly snapshot for the trend charts. Both run from Vercel cron (see <code className="text-xs bg-slate-100 px-1 rounded">vercel.json</code>).
          </p>
          <form action={saveSettingAction} className="flex flex-wrap items-end gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="hidden" name="digest_enabled" value="" />
              <select name="digest_enabled" className="input !w-auto" defaultValue={settings.digest_enabled ?? "1"}>
                <option value="1">Digest on</option>
                <option value="0">Digest off</option>
              </select>
            </label>
            <label className="text-sm flex-1 min-w-60">
              <span className="text-slate-600">Dashboard URL (for links in the mail)</span>
              <input name="dashboard_url" className="input mt-1" defaultValue={settings.dashboard_url ?? process.env.APP_URL ?? ""} placeholder="https://owner.fairtech.in" />
            </label>
            <button className="btn btn-primary btn-sm" disabled={!dbOk}>
              Save
            </button>
          </form>
          <DigestButton />
        </div>
      </Section>
    </div>
  );
}
