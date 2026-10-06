import { db } from "@/lib/db";
import { loadOverview } from "@/lib/feed/load";
import { AppChip } from "@/components/badges";
import { fmtDateTime, inr } from "@/lib/format";

export const metadata = { title: "My decisions" };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ app?: string }> }) {
  const [o, f] = await Promise.all([loadOverview(), searchParams]);
  const apps = new Map(o.statuses.map((s) => [s.app.key, s.app]));
  let rows: Awaited<ReturnType<typeof db.actionLog.findMany>> = [];
  try {
    rows = await db.actionLog.findMany({ where: f.app ? { app: f.app } : undefined, orderBy: { at: "desc" }, take: 200 });
  } catch (e) {
    console.error("[history] read failed:", (e as Error).message);
  }
  const week = rows.filter((r) => r.at.getTime() > Date.now() - 7 * 864e5);
  const okCount = week.filter((r) => r.ok).length;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">My decisions</h1>
        <p className="text-sm text-slate-500">
          Everything decided from this dashboard. This week: {week.length} actions, {okCount} succeeded{week.length - okCount ? `, ${week.length - okCount} failed` : ""}.
        </p>
      </div>
      {rows.length === 0 ? (
        <div className="card p-4 text-sm text-slate-500 text-center">No decisions yet.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">App</th>
                <th className="px-3 py-2">What</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const app = apps.get(r.app) ?? { key: r.app, label: r.app, color: null };
                return (
                  <tr key={r.id} className={r.ok ? "" : "bg-red-50/50"}>
                    <td className="px-3 py-2 whitespace-nowrap text-slate-500">{fmtDateTime(r.at.toISOString())}</td>
                    <td className="px-3 py-2">
                      <AppChip app={app} small />
                    </td>
                    <td className="px-3 py-2 max-w-md">
                      <div className="truncate" title={r.title}>
                        {r.title}
                      </div>
                      {r.note && <div className="text-xs text-slate-500 truncate">“{r.note}”</div>}
                    </td>
                    <td className="px-3 py-2 font-medium">{r.actionId}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{r.amount ? inr(Number(r.amount)) : ""}</td>
                    <td className="px-3 py-2">
                      <span className={r.ok ? "text-emerald-700" : "text-red-700"}>{r.ok ? "✓" : "✕"}</span> <span className="text-slate-600">{r.response}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
