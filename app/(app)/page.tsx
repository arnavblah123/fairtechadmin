import Link from "next/link";
import { loadOverview } from "@/lib/feed/load";
import { oldestPendingHours, type UKpi } from "@/lib/feed/aggregate";
import { AppStatusStrip } from "@/components/app-status";
import { KpiGrid } from "@/components/kpi-strip";
import { ApprovalCard } from "@/components/approval-card";
import { FlagCard } from "@/components/flag-card";
import { ActivityList, MessageList } from "@/components/lists";
import { Section, Empty } from "@/components/section";
import { NotesPanel } from "@/components/notes-panel";
import { listNotes } from "@/lib/notes";
import { inr, plural, todayIST } from "@/lib/format";

export const metadata = { title: "Today" };

export default async function HomePage() {
  const [o, notes] = await Promise.all([loadOverview(), listNotes({ openOnly: true, limit: 5 })]);
  const t = o.totals;
  const oldest = oldestPendingHours(o.approvals);
  const topFlags = o.flags.filter((f) => f.severity !== "info");
  const infoFlags = o.flags.filter((f) => f.severity === "info");
  const watch = o.kpis.filter((k) => k.tone === "bad" || k.tone === "warn");
  const money = o.kpis.filter((k) => k.unit === "₹" && !watch.includes(k));
  const apps = o.statuses.map((s) => s.app);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold">Good {greeting()}.</h1>
          <p className="text-sm text-slate-500">{todayIST()} · everything that needs you, across all apps.</p>
        </div>
      </div>

      {/* Headline numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Link href="/approvals" className={`card p-3 ${t.pendingApprovals ? "border-amber-300 bg-amber-50/40" : ""}`}>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Waiting for you</div>
          <div className="text-2xl font-bold tabular-nums">{t.pendingApprovals}</div>
          <div className="text-xs text-slate-500">
            {t.pendingAmount ? `${inr(t.pendingAmount, { compact: true })} · ` : ""}
            {oldest !== null ? `oldest ${oldest >= 24 ? `${Math.round(oldest / 24)} d` : `${oldest} h`}` : "nothing pending"}
          </div>
        </Link>
        <Link href="/flags" className={`card p-3 ${t.critical ? "border-red-300 bg-red-50/40" : ""}`}>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Flags</div>
          <div className="text-2xl font-bold tabular-nums">
            <span className={t.critical ? "text-red-700" : ""}>{t.critical}</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className={t.warning ? "text-amber-700" : ""}>{t.warning}</span>
          </div>
          <div className="text-xs text-slate-500">critical / warning</div>
        </Link>
        <Link href="/messages" className="card p-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Unread</div>
          <div className="text-2xl font-bold tabular-nums">{t.unreadMessages}</div>
          <div className="text-xs text-slate-500">complaints, AI findings, queries</div>
        </Link>
        <Link href="/settings" className={`card p-3 ${t.appsDown ? "border-red-300 bg-red-50/40" : ""}`}>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">Apps</div>
          <div className="text-2xl font-bold tabular-nums">
            {o.statuses.length - t.appsDown}
            <span className="text-slate-400 text-base font-semibold">/{o.statuses.length}</span>
          </div>
          <div className="text-xs text-slate-500">{t.appsDown ? `${plural(t.appsDown, "app")} not answering` : "all answering"}</div>
        </Link>
      </div>

      <AppStatusStrip statuses={o.statuses} />

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <Section title="Needs your decision" count={o.approvals.length} href="/approvals">
            {o.approvals.length ? (
              <div className="space-y-2">
                {o.approvals.slice(0, 6).map((a) => (
                  <ApprovalCard key={`${a.app.key}:${a.id}`} a={a} />
                ))}
                {o.approvals.length > 6 && (
                  <Link href="/approvals" className="btn btn-neutral w-full">
                    {o.approvals.length - 6} more approvals →
                  </Link>
                )}
              </div>
            ) : (
              <Empty>Nothing waiting for your approval. 🎉</Empty>
            )}
          </Section>

          <Section title="What's wrong right now" count={topFlags.length} href="/flags">
            {topFlags.length ? (
              <div className="space-y-2">
                {topFlags.slice(0, 6).map((f) => (
                  <FlagCard key={`${f.app.key}:${f.id}`} f={f} />
                ))}
                {topFlags.length > 6 && (
                  <Link href="/flags" className="btn btn-neutral w-full">
                    {topFlags.length - 6} more flags →
                  </Link>
                )}
                {infoFlags.length > 0 && (
                  <Link href="/flags" className="block text-center text-sm text-slate-500 hover:text-slate-900">
                    + {plural(infoFlags.length, "info flag")}
                  </Link>
                )}
              </div>
            ) : (
              <Empty>No critical or warning flags.</Empty>
            )}
          </Section>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {watch.length > 0 && (
            <Section title="Numbers to watch" href="/reports">
              <div className="grid grid-cols-2 gap-2">
                {watch.slice(0, 6).map((k) => (
                  <KpiMini key={`${k.app.key}:${k.key}`} k={k} />
                ))}
              </div>
            </Section>
          )}
          {money.length > 0 && (
            <Section title="Money" href="/reports">
              <div className="grid grid-cols-2 gap-2">
                {money.slice(0, 6).map((k) => (
                  <KpiMini key={`${k.app.key}:${k.key}`} k={k} />
                ))}
              </div>
            </Section>
          )}
          <Section title="Inbox" count={t.unreadMessages} href="/messages">
            <MessageList items={o.messages.slice(0, 5)} />
          </Section>
          <Section title="Follow-ups" count={notes.length} href="/notes">
            <NotesPanel notes={notes} apps={apps} compact />
          </Section>
          <Section title="Recent activity" href="/activity">
            <ActivityList items={o.activity.slice(0, 8)} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function greeting() {
  const h = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

function KpiMini({ k }: { k: UKpi }) {
  return <KpiGrid kpis={[k]} showApp />;
}
