"use client";

import { useActionState } from "react";
import type { AppConfig } from "@/lib/feed/registry";
import { saveAppAction, testAppAction, sendDigestNowAction, type SettingsState } from "@/lib/actions/settings";

function Msg({ s }: { s: SettingsState }) {
  if (!s) return null;
  return s.error ? <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{s.error}</div> : <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">{s.ok}</div>;
}

export function AppForm({ app, note, isNew }: { app: AppConfig | null; note?: string; isNew?: boolean }) {
  const [save, saveAct, saving] = useActionState<SettingsState, FormData>(saveAppAction, null);
  const [test, testAct, testing] = useActionState<SettingsState, FormData>(testAppAction, null);
  return (
    <form action={saveAct} className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full" style={{ background: app?.color ?? "#94a3b8" }} />
        <h3 className="font-semibold">{isNew ? "Add another app" : app?.label}</h3>
        {app && !app.enabled && <span className="text-xs rounded bg-slate-100 px-2 py-0.5">not connected</span>}
      </div>
      {note && <p className="text-xs text-slate-500">{note}</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">
          <span className="text-slate-600">Key</span>
          <input name="key" className="input mt-1" defaultValue={app?.key ?? ""} readOnly={!isNew} required pattern="[a-z0-9_-]+" />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Label</span>
          <input name="label" className="input mt-1" defaultValue={app?.label ?? ""} required />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">Base URL (where /api/admin-feed lives)</span>
          <input name="baseUrl" className="input mt-1" defaultValue={app?.baseUrl ?? ""} placeholder="https://fairtechproduction.vercel.app" inputMode="url" />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Feed path</span>
          <input name="feedPath" className="input mt-1" defaultValue={app?.feedPath ?? "/api/admin-feed"} />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Open-links URL (if different)</span>
          <input name="openUrl" className="input mt-1" defaultValue={app?.openUrl ?? ""} placeholder="https://purchase.fairtech.in" />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="text-slate-600">Extra headers (JSON, e.g. Supabase anon key)</span>
          <input name="extraHeaders" className="input mt-1 font-mono text-xs" defaultValue={app && Object.keys(app.extraHeaders).length ? JSON.stringify(app.extraHeaders) : ""} placeholder='{"apikey":"…","Authorization":"Bearer …"}' />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Colour</span>
          <input name="color" className="input mt-1" defaultValue={app?.color ?? ""} placeholder="#2563eb" />
        </label>
        <label className="text-sm">
          <span className="text-slate-600">Order</span>
          <input name="sortOrder" type="number" className="input mt-1" defaultValue={app?.sortOrder ?? 99} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="enabled" defaultChecked={app ? app.enabled || !app.baseUrl : true} /> Enabled
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        <button className="btn btn-primary btn-sm" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {app && (
          <button className="btn btn-neutral btn-sm" formAction={testAct} disabled={testing}>
            {testing ? "Testing…" : "Test connection"}
          </button>
        )}
      </div>
      <Msg s={save} />
      <Msg s={test} />
    </form>
  );
}

export function DigestButton() {
  const [state, act, pending] = useActionState<SettingsState, FormData>(async () => sendDigestNowAction(), null);
  return (
    <form action={act} className="space-y-2">
      <button className="btn btn-neutral btn-sm" disabled={pending}>
        {pending ? "Sending…" : "Send me the digest now"}
      </button>
      <Msg s={state} />
    </form>
  );
}
