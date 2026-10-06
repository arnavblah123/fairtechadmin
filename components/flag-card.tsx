import type { UFlag } from "@/lib/feed/aggregate";
import { AppChip, SeverityDot, UnitChip, severityClasses } from "@/components/badges";
import { ActForm } from "@/components/act-form";
import { SnoozeMenu } from "@/components/snooze-menu";
import { fmtDateTime, timeAgo } from "@/lib/format";
import { unackFlagAction } from "@/lib/actions/feed";

export function FlagCard({ f, hidden }: { f: UFlag; hidden?: boolean }) {
  const sev = severityClasses(f.severity);
  return (
    <article className={`card p-3 sm:p-4 border-l-4 ${f.severity === "critical" ? "border-l-red-600" : f.severity === "warning" ? "border-l-amber-500" : "border-l-sky-500"} ${hidden ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-2">
        <SeverityDot severity={f.severity} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <AppChip app={f.app} small />
            <UnitChip unit={f.unit} />
            <span className={`text-[11px] font-semibold ${sev.text}`}>{sev.label}</span>
            {f.since && (
              <span className="text-[11px] text-slate-500" title={fmtDateTime(f.since)}>
                since {timeAgo(f.since)}
              </span>
            )}
          </div>
          <h3 className="font-semibold leading-snug">
            {f.link ? (
              <a href={f.link} target="_blank" rel="noreferrer" className="hover:underline">
                {f.title}
              </a>
            ) : (
              f.title
            )}
          </h3>
          {f.detail && <p className="text-sm text-slate-600 mt-0.5 whitespace-pre-line">{f.detail}</p>}
          {f.acked && (
            <p className="text-xs text-slate-500 mt-1">
              Snoozed by {f.acked.by} {timeAgo(f.acked.at)}
              {f.acked.until ? ` until ${fmtDateTime(f.acked.until)}` : ""}
              {f.acked.note ? ` — “${f.acked.note}”` : ""}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-start gap-2">
        {f.actions?.length ? <ActForm appKey={f.app.key} flagId={f.id} title={`${f.app.label}: ${f.title}`} actions={f.actions} compact /> : null}
        {hidden ? (
          <form action={unackFlagAction}>
            <input type="hidden" name="app" value={f.app.key} />
            <input type="hidden" name="flagId" value={f.id} />
            <button className="btn btn-sm btn-neutral">Show again</button>
          </form>
        ) : (
          <SnoozeMenu appKey={f.app.key} flagId={f.id} />
        )}
      </div>
    </article>
  );
}
