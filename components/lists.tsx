import type { UActivity, UMessage, UReport } from "@/lib/feed/aggregate";
import { AppChip } from "@/components/badges";
import { fmtDateTime, timeAgo } from "@/lib/format";

export function ActivityList({ items }: { items: UActivity[] }) {
  if (!items.length) return <div className="card p-4 text-sm text-slate-500 text-center">Nothing happened in the last 24 hours.</div>;
  return (
    <ol className="card divide-y divide-slate-100">
      {items.map((a) => (
        <li key={`${a.app.key}:${a.id}`} className="flex items-start gap-3 px-3 py-2">
          <span className="text-[11px] text-slate-400 tabular-nums w-14 shrink-0 pt-0.5" title={fmtDateTime(a.at)}>
            {timeAgo(a.at)}
          </span>
          <div className="min-w-0 flex-1 text-sm">
            <span className="font-medium">{a.actor ? `${a.actor} ` : ""}</span>
            <span className="text-slate-700">
              {a.link ? (
                <a href={a.link} target="_blank" rel="noreferrer" className="hover:underline">
                  {a.text}
                </a>
              ) : (
                a.text
              )}
            </span>
          </div>
          <AppChip app={a.app} small />
        </li>
      ))}
    </ol>
  );
}

const CHANNEL_ICON: Record<string, string> = {
  ai: "✦",
  complaint: "⚑",
  email: "✉",
  whatsapp: "◉",
  push: "◎",
  incident: "⚠",
  issue: "!",
  flag: "⚑",
  query: "?",
  quote: "₹",
  request: "→",
  grn: "▣",
  error: "✕",
};

export function MessageList({ items }: { items: UMessage[] }) {
  if (!items.length) return <div className="card p-4 text-sm text-slate-500 text-center">No messages in the last 7 days.</div>;
  return (
    <ol className="card divide-y divide-slate-100">
      {items.map((m) => (
        <li key={`${m.app.key}:${m.id}`} className={`flex items-start gap-3 px-3 py-2.5 ${m.unread ? "bg-indigo-50/40" : ""}`}>
          <span className={`h-7 w-7 shrink-0 rounded-full grid place-items-center text-sm font-bold ${m.unread ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`} title={m.channel}>
            {CHANNEL_ICON[m.channel ?? ""] ?? "•"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              {m.from && <span className="font-semibold text-slate-700">{m.from}</span>}
              {m.channel && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">{m.channel}</span>}
              <span title={fmtDateTime(m.at)}>{timeAgo(m.at)}</span>
              <AppChip app={m.app} small />
            </div>
            <p className={`text-sm mt-0.5 ${m.unread ? "font-medium" : "text-slate-700"}`}>
              {m.link ? (
                <a href={m.link} target="_blank" rel="noreferrer" className="hover:underline">
                  {m.text}
                </a>
              ) : (
                m.text
              )}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ReportLinks({ items }: { items: UReport[] }) {
  if (!items.length) return <div className="card p-4 text-sm text-slate-500 text-center">No reports exposed yet.</div>;
  const byApp = new Map<string, UReport[]>();
  for (const r of items) (byApp.get(r.app.key) ?? byApp.set(r.app.key, []).get(r.app.key)!).push(r);
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[...byApp.values()].map((group) => (
        <div key={group[0].app.key} className="card p-3">
          <div className="mb-2">
            <AppChip app={group[0].app} />
          </div>
          <ul className="space-y-1">
            {group.map((r) => (
              <li key={r.id}>
                <a href={r.link} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 text-sm">
                  <span>
                    <span className="font-medium">{r.title}</span>
                    {r.description && <span className="text-slate-500"> — {r.description}</span>}
                  </span>
                  {r.period && <span className="text-[11px] text-slate-400 shrink-0">{r.period}</span>}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
