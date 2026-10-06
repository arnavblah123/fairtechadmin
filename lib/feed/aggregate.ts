import type { FeedActivity, FeedApproval, FeedFlag, FeedKpi, FeedMessage, FeedReport } from "@/lib/feed/contract";
import type { FeedResult } from "@/lib/feed/fetch";
import { resolveHref, type AppConfig } from "@/lib/feed/registry";
import { db } from "@/lib/db";

export type AppRef = { key: string; label: string; color: string | null };

export type UApproval = FeedApproval & { app: AppRef; link?: string };
export type UFlag = FeedFlag & { app: AppRef; link?: string; acked?: { by: string; at: string; note?: string | null; until?: string | null } };
export type UActivity = FeedActivity & { app: AppRef; link?: string };
export type UMessage = FeedMessage & { app: AppRef; link?: string };
export type UReport = FeedReport & { app: AppRef; link: string };
export type UKpi = FeedKpi & { app: AppRef; link?: string };

export type AppStatus = {
  app: AppRef;
  ok: boolean;
  error?: string;
  latencyMs: number;
  generatedAt?: string;
  pendingApprovals: number;
  pendingAmount: number;
  critical: number;
  warning: number;
  info: number;
  openUrl?: string;
};

export type Overview = {
  statuses: AppStatus[];
  approvals: UApproval[];
  flags: UFlag[];
  hiddenFlags: UFlag[];
  activity: UActivity[];
  messages: UMessage[];
  reports: UReport[];
  kpis: UKpi[];
  units: string[];
  totals: {
    pendingApprovals: number;
    pendingAmount: number;
    critical: number;
    warning: number;
    unreadMessages: number;
    appsDown: number;
  };
};

const SEVERITY_RANK: Record<string, number> = { critical: 0, warning: 1, info: 2 };

function ref(app: AppConfig): AppRef {
  return { key: app.key, label: app.label, color: app.color };
}

async function loadAcks(): Promise<Map<string, { by: string; at: string; note: string | null; until: string | null }>> {
  const map = new Map<string, { by: string; at: string; note: string | null; until: string | null }>();
  try {
    const rows = await db.flagAck.findMany();
    const now = Date.now();
    for (const r of rows) {
      if (r.until && r.until.getTime() < now) continue; // snooze expired
      map.set(`${r.app}\u0000${r.flagId}`, { by: r.ackedBy, at: r.ackedAt.toISOString(), note: r.note, until: r.until?.toISOString() ?? null });
    }
  } catch (e) {
    console.error("[aggregate] FlagAck read failed:", (e as Error).message);
  }
  return map;
}

export async function buildOverview(results: FeedResult[]): Promise<Overview> {
  const acks = await loadAcks();
  const approvals: UApproval[] = [];
  const flags: UFlag[] = [];
  const hiddenFlags: UFlag[] = [];
  const activity: UActivity[] = [];
  const messages: UMessage[] = [];
  const reports: UReport[] = [];
  const kpis: UKpi[] = [];
  const units = new Set<string>();
  const statuses: AppStatus[] = [];

  for (const r of results) {
    const a = ref(r.app);
    const f = r.feed;
    const status: AppStatus = {
      app: a,
      ok: r.ok,
      error: r.error,
      latencyMs: r.latencyMs,
      generatedAt: f?.generatedAt,
      pendingApprovals: 0,
      pendingAmount: 0,
      critical: 0,
      warning: 0,
      info: 0,
      openUrl: r.app.openUrl || r.app.baseUrl || undefined,
    };
    if (f) {
      for (const u of f.units ?? []) units.add(u);
      for (const k of f.kpis) kpis.push({ ...k, app: a, link: resolveHref(r.app, k.href) });
      for (const ap of f.approvals) {
        approvals.push({ ...ap, app: a, link: resolveHref(r.app, ap.href) });
        status.pendingApprovals += 1;
        status.pendingAmount += typeof ap.amount === "number" ? ap.amount : 0;
      }
      for (const fl of f.flags) {
        const ack = acks.get(`${r.app.key}\u0000${fl.id}`);
        const u: UFlag = { ...fl, app: a, link: resolveHref(r.app, fl.href), acked: ack };
        if (ack) hiddenFlags.push(u);
        else {
          flags.push(u);
          if (fl.severity === "critical") status.critical += 1;
          else if (fl.severity === "warning") status.warning += 1;
          else status.info += 1;
        }
      }
      for (const ac of f.activity) activity.push({ ...ac, app: a, link: resolveHref(r.app, ac.href) });
      for (const m of f.messages) messages.push({ ...m, app: a, link: resolveHref(r.app, m.href) });
      for (const rp of f.reports) {
        const link = resolveHref(r.app, rp.href);
        if (link) reports.push({ ...rp, app: a, link });
      }
    }
    statuses.push(status);
  }

  approvals.sort((x, y) => Date.parse(x.requestedAt) - Date.parse(y.requestedAt)); // oldest first
  flags.sort((x, y) => (SEVERITY_RANK[x.severity] ?? 9) - (SEVERITY_RANK[y.severity] ?? 9) || Date.parse(x.since ?? "") - Date.parse(y.since ?? ""));
  activity.sort((x, y) => Date.parse(y.at) - Date.parse(x.at));
  messages.sort((x, y) => Number(Boolean(y.unread)) - Number(Boolean(x.unread)) || Date.parse(y.at) - Date.parse(x.at));

  return {
    statuses,
    approvals,
    flags,
    hiddenFlags,
    activity,
    messages,
    reports,
    kpis,
    units: [...units].sort(),
    totals: {
      pendingApprovals: approvals.length,
      pendingAmount: approvals.reduce((s, a) => s + (typeof a.amount === "number" ? a.amount : 0), 0),
      critical: flags.filter((f) => f.severity === "critical").length,
      warning: flags.filter((f) => f.severity === "warning").length,
      unreadMessages: messages.filter((m) => m.unread).length,
      appsDown: statuses.filter((s) => !s.ok).length,
    },
  };
}

/** Age in hours of the oldest pending approval, or null. */
export function oldestPendingHours(approvals: UApproval[]): number | null {
  if (!approvals.length) return null;
  const oldest = Math.min(...approvals.map((a) => Date.parse(a.requestedAt)).filter((n) => !Number.isNaN(n)));
  if (!Number.isFinite(oldest)) return null;
  return Math.round((Date.now() - oldest) / 36e5);
}
