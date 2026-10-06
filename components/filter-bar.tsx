import Link from "next/link";
import type { AppStatus } from "@/lib/feed/aggregate";

/** App / unit filter chips driven by the URL (?app=…&unit=…), so links are shareable. */
export function FilterBar({ base, statuses, units, current }: { base: string; statuses: AppStatus[]; units: string[]; current: { app?: string; unit?: string } }) {
  const link = (patch: { app?: string; unit?: string }) => {
    const p = new URLSearchParams();
    const app = patch.app === undefined ? current.app : patch.app;
    const unit = patch.unit === undefined ? current.unit : patch.unit;
    if (app) p.set("app", app);
    if (unit) p.set("unit", unit);
    const q = p.toString();
    return q ? `${base}?${q}` : base;
  };
  const chip = (href: string, active: boolean, label: string, color?: string | null) => (
    <Link key={href + label} href={href} className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`}>
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? "#fff" : color }} />}
      {label}
    </Link>
  );
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5 scroll-x pb-0.5">
        {chip(link({ app: "" }), !current.app, "All apps")}
        {statuses.map((s) => chip(link({ app: s.app.key }), current.app === s.app.key, s.app.label, s.app.color))}
      </div>
      {units.length > 1 && (
        <div className="flex gap-1.5 scroll-x pb-0.5">
          {chip(link({ unit: "" }), !current.unit, "All units")}
          {units.map((u) => chip(link({ unit: u }), current.unit === u, u))}
        </div>
      )}
    </div>
  );
}

export function applyFilter<T extends { app: { key: string }; unit?: string }>(items: T[], f: { app?: string; unit?: string }): T[] {
  return items.filter((i) => (!f.app || i.app.key === f.app) && (!f.unit || (i.unit ?? "").toLowerCase() === f.unit.toLowerCase()));
}
