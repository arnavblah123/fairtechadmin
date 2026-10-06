import { db } from "@/lib/db";
import { fetchAllFeeds } from "@/lib/feed/fetch";
import { buildOverview } from "@/lib/feed/aggregate";

/** Fetch every feed fresh and store one Snapshot row per app. Used by the hourly cron. */
export async function takeSnapshot() {
  const results = await fetchAllFeeds({ fresh: true });
  const overview = await buildOverview(results);
  const rows = overview.statuses.map((s) => {
    const r = results.find((x) => x.app.key === s.app.key);
    const kpis = r?.feed?.kpis.map((k) => ({ key: k.key, label: k.label, value: k.value, unit: k.unit })) ?? null;
    return {
      app: s.app.key,
      ok: s.ok,
      latencyMs: s.latencyMs,
      pendingApprovals: s.pendingApprovals,
      pendingAmount: s.pendingAmount,
      criticalFlags: s.critical,
      warningFlags: s.warning,
      kpis: kpis ?? undefined,
    };
  });
  await db.snapshot.createMany({ data: rows });
  // Keep 90 days.
  await db.snapshot.deleteMany({ where: { at: { lt: new Date(Date.now() - 90 * 864e5) } } });
  return { overview, results };
}

export type TrendPoint = { at: string; pendingApprovals: number; critical: number; warning: number; ok: boolean };

export async function trends(days = 14): Promise<Record<string, TrendPoint[]>> {
  const since = new Date(Date.now() - days * 864e5);
  let rows: Awaited<ReturnType<typeof db.snapshot.findMany>> = [];
  try {
    rows = await db.snapshot.findMany({ where: { at: { gte: since } }, orderBy: { at: "asc" } });
  } catch (e) {
    console.error("[trends] read failed:", (e as Error).message);
  }
  const out: Record<string, TrendPoint[]> = {};
  for (const r of rows) {
    (out[r.app] ??= []).push({ at: r.at.toISOString(), pendingApprovals: r.pendingApprovals, critical: r.criticalFlags, warning: r.warningFlags, ok: r.ok });
  }
  return out;
}
