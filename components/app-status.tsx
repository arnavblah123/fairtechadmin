import type { AppStatus } from "@/lib/feed/aggregate";
import { timeAgo } from "@/lib/format";

/** One chip per app: green when answering, red when not, with its pending counts. */
export function AppStatusStrip({ statuses }: { statuses: AppStatus[] }) {
  return (
    <div className="flex gap-2 scroll-x pb-1">
      {statuses.map((s) => (
        <a
          key={s.app.key}
          href={s.openUrl}
          target="_blank"
          rel="noreferrer"
          className={`card shrink-0 px-3 py-2 min-w-40 ${s.ok ? "" : "border-red-200 bg-red-50"}`}
          title={s.ok ? `Answered in ${s.latencyMs} ms · data ${timeAgo(s.generatedAt)}` : s.error}
        >
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <span className={`h-2 w-2 rounded-full ${s.ok ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="truncate">{s.app.label}</span>
          </div>
          {s.ok ? (
            <div className="text-xs text-slate-500 mt-0.5 flex gap-2">
              <span>{s.pendingApprovals} to approve</span>
              {s.critical ? <span className="text-red-700 font-semibold">{s.critical} critical</span> : s.warning ? <span className="text-amber-700">{s.warning} warn</span> : <span className="text-emerald-700">clear</span>}
            </div>
          ) : (
            <div className="text-xs text-red-700 mt-0.5 truncate">{s.error}</div>
          )}
        </a>
      ))}
    </div>
  );
}
