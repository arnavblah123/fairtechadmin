import type { UApproval } from "@/lib/feed/aggregate";
import { AppChip, UnitChip } from "@/components/badges";
import { ActForm } from "@/components/act-form";
import { ageHours, inr, timeAgo } from "@/lib/format";

export function ApprovalCard({ a }: { a: UApproval }) {
  const age = ageHours(a.requestedAt) ?? 0;
  const stale = age > 48;
  return (
    <article className={`card p-3 sm:p-4 ${stale ? "border-amber-300" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <AppChip app={a.app} small />
            <UnitChip unit={a.unit} />
            <span className={`text-[11px] ${stale ? "text-amber-700 font-semibold" : "text-slate-500"}`}>
              {timeAgo(a.requestedAt)}
              {stale ? " · waiting long" : ""}
            </span>
          </div>
          <h3 className="font-semibold leading-snug">
            {a.link ? (
              <a href={a.link} target="_blank" rel="noreferrer" className="hover:underline">
                {a.title}
              </a>
            ) : (
              a.title
            )}
          </h3>
          {a.detail && <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-line">{a.detail}</p>}
          {a.requestedBy && <p className="text-xs text-slate-500 mt-1">Asked by {a.requestedBy}</p>}
        </div>
        {typeof a.amount === "number" && <div className="text-right shrink-0 font-bold text-lg tabular-nums">{inr(a.amount)}</div>}
      </div>
      <div className="mt-3">
        <ActForm appKey={a.app.key} approvalId={a.id} title={`${a.app.label}: ${a.title}`} amount={a.amount} actions={a.actions} />
      </div>
    </article>
  );
}
