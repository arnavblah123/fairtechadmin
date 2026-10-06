import { db } from "@/lib/db";
import { DEFAULT_FEED_PATH } from "@/lib/feed/contract";

export type AppConfig = {
  key: string;
  label: string;
  baseUrl: string;
  feedPath: string;
  openUrl: string | null;
  extraHeaders: Record<string, string>;
  enabled: boolean;
  sortOrder: number;
  color: string | null;
};

// The apps the owner runs today, in the order they appear in the UI. A row in
// AppSource (Settings → Apps) overrides any of this; the URL comes from the
// matching env var until then so a fresh deploy already shows real data.
export const KNOWN_APPS: Array<{
  key: string;
  label: string;
  envUrl: string;
  defaultUrl?: string;
  feedPath?: string;
  color: string;
  note: string;
}> = [
  { key: "production", label: "Production", envUrl: "PRODUCTION_APP_URL", defaultUrl: "https://fairtechproduction.vercel.app", color: "#2563eb", note: "Jobs, stages, labour, night approvals, wage advances, AI findings." },
  { key: "store", label: "Store & Consumables", envUrl: "STORE_APP_URL", defaultUrl: "https://fairtechconsumablesystem.vercel.app", color: "#0d9488", note: "GRNs, indents, PO changes, stock adjustments, low stock." },
  { key: "pettycash", label: "Petty Cash", envUrl: "PETTY_CASH_APP_URL", defaultUrl: "https://fairtech-petty-cash.vercel.app", color: "#d97706", note: "Expense approvals, fund requests, cash on the street." },
  { key: "machines", label: "Machines & Maintenance", envUrl: "MACHINES_APP_URL", defaultUrl: "https://fairtechmachines.vercel.app", color: "#7c3aed", note: "Breakdown tickets, vendor quotes, repeat alerts, PM due." },
  { key: "epc", label: "EPC Sites", envUrl: "EPC_APP_URL", color: "#db2777", note: "Site advances, expenses, indents, issues, jobs behind plan." },
  { key: "portal", label: "Labour Portal", envUrl: "PORTAL_APP_URL", defaultUrl: "https://fairtechfamily.vercel.app", color: "#059669", note: "Leave and advance requests, complaints, photo attendance." },
  { key: "purchase", label: "Purchase & Material", envUrl: "PURCHASE_FEED_URL", feedPath: "/admin-feed", color: "#ea580c", note: "Plan approvals, quotes, flagged receipts, supplier bills. Supabase edge function: base URL is https://<project>.supabase.co/functions/v1 and the anon key goes in extra headers." },
  { key: "gate", label: "Security Gate", envUrl: "GATE_APP_URL", color: "#475569", note: "Who is inside, incidents, pending labourers. Feed endpoint not yet deployed." },
];

function envHeadersFor(key: string): Record<string, string> {
  // PURCHASE_SUPABASE_ANON_KEY → apikey + Authorization for the Supabase gateway.
  if (key === "purchase") {
    const anon = process.env.PURCHASE_SUPABASE_ANON_KEY;
    if (anon) return { apikey: anon, Authorization: `Bearer ${anon}` };
  }
  return {};
}

function fromEnv(): AppConfig[] {
  return KNOWN_APPS.map((k, i) => {
    const baseUrl = (process.env[k.envUrl] ?? k.defaultUrl ?? "").replace(/\/$/, "");
    return {
      key: k.key,
      label: k.label,
      baseUrl,
      feedPath: k.feedPath ?? DEFAULT_FEED_PATH,
      openUrl: null,
      extraHeaders: envHeadersFor(k.key),
      enabled: Boolean(baseUrl),
      sortOrder: i,
      color: k.color,
    };
  });
}

export function isMockMode(): boolean {
  return process.env.MOCK_FEEDS === "1";
}

/** Env defaults merged with AppSource rows. Rows win; env fills the gaps. */
export async function listApps(includeDisabled = false): Promise<AppConfig[]> {
  const defaults = fromEnv();
  let rows: Awaited<ReturnType<typeof db.appSource.findMany>> = [];
  try {
    rows = await db.appSource.findMany({ orderBy: { sortOrder: "asc" } });
  } catch (e) {
    // No database yet (first deploy, or local preview): env only.
    console.error("[registry] AppSource read failed, using env defaults:", (e as Error).message);
  }
  const byKey = new Map(defaults.map((d) => [d.key, d]));
  for (const r of rows) {
    const d = byKey.get(r.key);
    const extra = (r.extraHeaders && typeof r.extraHeaders === "object" ? r.extraHeaders : {}) as Record<string, string>;
    byKey.set(r.key, {
      key: r.key,
      label: r.label,
      baseUrl: r.baseUrl.replace(/\/$/, ""),
      feedPath: r.feedPath,
      openUrl: r.openUrl,
      extraHeaders: Object.keys(extra).length ? extra : d?.extraHeaders ?? {},
      enabled: r.enabled && Boolean(r.baseUrl),
      sortOrder: r.sortOrder,
      color: r.color ?? d?.color ?? null,
    });
  }
  const all = [...byKey.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  if (isMockMode()) return all.map((a) => ({ ...a, enabled: true }));
  return includeDisabled ? all : all.filter((a) => a.enabled);
}

export async function getApp(key: string): Promise<AppConfig | null> {
  const apps = await listApps(true);
  return apps.find((a) => a.key === key) ?? null;
}

/** The shared secret for an app: ADMIN_FEED_KEY_<KEY> overrides ADMIN_FEED_KEY. */
export function feedKeyFor(appKey: string): string | undefined {
  return process.env[`ADMIN_FEED_KEY_${appKey.toUpperCase()}`] || process.env.ADMIN_FEED_KEY;
}

/** Absolute deep link into an app for a relative href from its feed. */
export function resolveHref(app: AppConfig, href?: string): string | undefined {
  if (!href) return undefined;
  if (/^https?:\/\//i.test(href)) return href;
  const origin = app.openUrl || app.baseUrl;
  if (!origin) return undefined;
  return origin.replace(/\/$/, "") + (href.startsWith("/") ? href : `/${href}`);
}
