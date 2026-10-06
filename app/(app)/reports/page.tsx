import { loadOverview } from "@/lib/feed/load";
import { trends } from "@/lib/snapshot";
import { KpiGrid } from "@/components/kpi-strip";
import { ReportLinks } from "@/components/lists";
import { Section } from "@/components/section";
import { AppChip } from "@/components/badges";
import { TrendSpark } from "@/components/trend-spark";
import { inr } from "@/lib/format";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const [o, tr] = await Promise.all([loadOverview(), trends(14)]);
  const money = o.kpis.filter((k) => k.unit === "₹");
  const totalMoney = money.reduce((s, k) => s + (typeof k.value === "number" ? k.value : 0), 0);
  const byApp = new Map<string, typeof o.kpis>();
  for (const k of o.kpis) (byApp.get(k.app.key) ?? byApp.set(k.app.key, []).get(k.app.key)!).push(k);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Reports & numbers</h1>
        <p className="text-sm text-slate-500">Live KPIs from every app, 14-day backlog trend, and one-tap links to each app&apos;s own reports.</p>
      </div>

      {money.length > 0 && (
        <Section title="Money across the business" right={<span className="text-xs text-slate-500">sum of ₹ tiles: {inr(totalMoney, { compact: true })}</span>}>
          <KpiGrid kpis={money} showApp />
        </Section>
      )}

      <Section title="Backlog trend (14 days)">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {o.statuses.map((s) => {
            const pts = tr[s.app.key] ?? [];
            const first = pts[0]?.pendingApprovals;
            const last = pts[pts.length - 1]?.pendingApprovals;
            const delta = first !== undefined && last !== undefined ? last - first : null;
            const uptime = pts.length ? Math.round((pts.filter((p) => p.ok).length / pts.length) * 100) : null;
            return (
              <div key={s.app.key} className="card p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <AppChip app={s.app} />
                  <div className="text-xs text-slate-500 mt-1">
                    now <b className="text-slate-800">{s.pendingApprovals}</b> pending
                    {delta !== null && delta !== 0 && <span className={delta > 0 ? "text-amber-700" : "text-emerald-700"}> ({delta > 0 ? "+" : ""}{delta} vs 14 d ago)</span>}
                    {uptime !== null && <span> · {uptime}% up</span>}
                  </div>
                </div>
                <TrendSpark points={pts} />
              </div>
            );
          })}
        </div>
      </Section>

      {[...byApp.entries()].map(([key, kpis]) => (
        <Section key={key} title={kpis[0].app.label}>
          <KpiGrid kpis={kpis} />
        </Section>
      ))}

      <Section title="Open a report">
        <ReportLinks items={o.reports} />
      </Section>
    </div>
  );
}
