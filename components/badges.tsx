import type { AppRef } from "@/lib/feed/aggregate";
import type { FlagSeverity } from "@/lib/feed/contract";

export function AppChip({ app, small }: { app: AppRef; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 font-medium text-slate-700 bg-white ${small ? "text-[11px] py-0" : "text-xs py-0.5"}`}
      style={{ borderColor: app.color ? `${app.color}55` : "#e2e8f0" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: app.color ?? "#94a3b8" }} />
      {app.label}
    </span>
  );
}

export function UnitChip({ unit }: { unit?: string }) {
  if (!unit) return null;
  return <span className="inline-flex items-center rounded bg-slate-100 text-slate-600 px-1.5 py-0.5 text-[11px] font-medium">{unit}</span>;
}

const SEV: Record<FlagSeverity, { dot: string; text: string; label: string; bg: string }> = {
  critical: { dot: "bg-red-600", text: "text-red-700", label: "Critical", bg: "bg-red-50 border-red-200" },
  warning: { dot: "bg-amber-500", text: "text-amber-700", label: "Warning", bg: "bg-amber-50 border-amber-200" },
  info: { dot: "bg-sky-500", text: "text-sky-700", label: "Info", bg: "bg-sky-50 border-sky-200" },
};

export function SeverityDot({ severity }: { severity: FlagSeverity }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${SEV[severity].dot}`} aria-label={SEV[severity].label} />;
}

export function severityClasses(severity: FlagSeverity) {
  return SEV[severity];
}

export function Count({ n, tone = "neutral" }: { n: number; tone?: "neutral" | "bad" | "warn" | "good" }) {
  if (!n) return null;
  const c = tone === "bad" ? "bg-red-600 text-white" : tone === "warn" ? "bg-amber-500 text-white" : tone === "good" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-800";
  return <span className={`inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${c}`}>{n > 99 ? "99+" : n}</span>;
}
