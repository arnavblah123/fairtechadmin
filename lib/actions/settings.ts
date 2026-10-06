"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { db } from "@/lib/db";
import { invalidateFeedCache } from "@/lib/feed/fetch";
import { getApp } from "@/lib/feed/registry";
import { fetchFeed } from "@/lib/feed/fetch";
import { sendOwnerEmail } from "@/lib/email";
import { buildDigest } from "@/lib/digest";
import { fetchAllFeeds } from "@/lib/feed/fetch";
import { buildOverview } from "@/lib/feed/aggregate";

export type SettingsState = { ok?: string; error?: string } | null;

export async function saveAppAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireOwner();
  const key = String(formData.get("key") ?? "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const label = String(formData.get("label") ?? "").trim();
  const baseUrl = String(formData.get("baseUrl") ?? "").trim().replace(/\/$/, "");
  const feedPath = String(formData.get("feedPath") ?? "/api/admin-feed").trim() || "/api/admin-feed";
  const openUrl = String(formData.get("openUrl") ?? "").trim().replace(/\/$/, "") || null;
  const color = String(formData.get("color") ?? "").trim() || null;
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  const enabled = formData.get("enabled") === "on";
  const headersRaw = String(formData.get("extraHeaders") ?? "").trim();
  if (!key || !label) return { error: "Key and label are required." };
  if (baseUrl && !/^https?:\/\//.test(baseUrl)) return { error: "Base URL must start with http(s)://" };
  let extraHeaders: Record<string, string> | null = null;
  if (headersRaw) {
    try {
      const parsed = JSON.parse(headersRaw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
      extraHeaders = parsed;
    } catch {
      return { error: "Extra headers must be a JSON object, e.g. {\"apikey\":\"…\"}" };
    }
  }
  await db.appSource.upsert({
    where: { key },
    create: { key, label, baseUrl, feedPath, openUrl, color, sortOrder, enabled, extraHeaders: extraHeaders ?? undefined },
    update: { label, baseUrl, feedPath, openUrl, color, sortOrder, enabled, extraHeaders: extraHeaders ?? undefined },
  });
  invalidateFeedCache(key);
  revalidatePath("/", "layout");
  return { ok: `Saved ${label}.` };
}

export async function deleteAppAction(formData: FormData) {
  await requireOwner();
  const key = String(formData.get("key") ?? "");
  if (!key) return;
  await db.appSource.deleteMany({ where: { key } });
  invalidateFeedCache(key);
  revalidatePath("/", "layout");
}

export async function testAppAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  await requireOwner();
  const key = String(formData.get("key") ?? "");
  const app = await getApp(key);
  if (!app) return { error: "Unknown app." };
  const r = await fetchFeed(app, { fresh: true });
  if (!r.ok) return { error: `${app.label}: ${r.error}` };
  const f = r.feed!;
  return { ok: `${app.label} answered in ${r.latencyMs} ms: ${f.approvals.length} approvals, ${f.flags.length} flags, ${f.kpis.length} KPIs, ${f.activity.length} activity rows.` };
}

export async function saveSettingAction(formData: FormData) {
  await requireOwner();
  const entries = ["digest_enabled", "dashboard_url"] as const;
  for (const k of entries) {
    const v = formData.get(k);
    if (v === null) continue;
    await db.setting.upsert({ where: { key: k }, create: { key: k, value: String(v) }, update: { value: String(v) } });
  }
  revalidatePath("/settings");
}

export async function sendDigestNowAction(): Promise<SettingsState> {
  await requireOwner();
  const results = await fetchAllFeeds({ fresh: true });
  const overview = await buildOverview(results);
  const url = (await db.setting.findUnique({ where: { key: "dashboard_url" } }).catch(() => null))?.value || process.env.APP_URL || "";
  const d = buildDigest(overview, url);
  const r = await sendOwnerEmail(d.subject, d.html, d.text);
  return r.ok ? { ok: "Digest sent." } : { error: `Could not send: ${r.error}` };
}
