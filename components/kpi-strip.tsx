import type { UKpi } from "@/lib/feed/aggregate";
import { kpiValue } from "@/lib/format";

const TONE: Record<string, string> = {
  good: "text-emerald-700",
  warn: "text-amber-700",
  bad: "text-red-700",
  neutral: "text-slate-900",
};

export function KpiTile({ k, showApp }: { k: UKpi; showApp?: boolean }) {
  const inner = (
    <>
      {showApp && (
        <div className="text-[10px] font-semibold truncate" style={{ color: k.app.color ?? "#64748b" }}>
          {k.app.label}
        </div>
      )}
      <div className="text-[11px] uppercase tracking-wide text-slate-500 leading-tight line-clamp-2">{k.label}</div>
      <div className={`text-xl font-bold tabular-nums leading-tight mt-0.5 ${TONE[k.tone ?? "neutral"]}`}>{kpiValue(k.value, k.unit)}</div>
      {k.hint && <div className="text-xs text-slate-500 truncate">{k.hint}</div>}
    </>
  );
  const cls = "card px-3 py-2.5 min-w-0";
  return k.link ? (
    <a href={k.link} target="_blank" rel="noreferrer" className={`${cls} hover:border-slate-400`}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

export function KpiGrid({ kpis, showApp }: { kpis: UKpi[]; showApp?: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
      {kpis.map((k) => (
        <KpiTile key={`${k.app.key}:${k.key}`} k={k} showApp={showApp} />
      ))}
    </div>
  );
}
