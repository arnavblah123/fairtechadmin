import { loadOverview } from "@/lib/feed/load";
import { ApprovalCard } from "@/components/approval-card";
import { FilterBar, applyFilter } from "@/components/filter-bar";
import { Empty } from "@/components/section";
import { inr, plural } from "@/lib/format";

export const metadata = { title: "Approvals" };

export default async function ApprovalsPage({ searchParams }: { searchParams: Promise<{ app?: string; unit?: string }> }) {
  const [o, f] = await Promise.all([loadOverview(), searchParams]);
  const items = applyFilter(o.approvals, f);
  const amount = items.reduce((s, a) => s + (a.amount ?? 0), 0);
  const byKind = new Map<string, number>();
  for (const a of items) byKind.set(a.kind, (byKind.get(a.kind) ?? 0) + 1);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Approvals</h1>
        <p className="text-sm text-slate-500">
          {plural(items.length, "item")} waiting{amount ? ` · ${inr(amount)}` : ""}. Oldest first. Each decision runs inside the source app, with its own audit trail.
        </p>
      </div>
      <FilterBar base="/approvals" statuses={o.statuses} units={o.units} current={f} />
      {byKind.size > 1 && (
        <div className="flex flex-wrap gap-1.5 text-xs text-slate-600">
          {[...byKind.entries()].map(([k, n]) => (
            <span key={k} className="rounded bg-white border border-slate-200 px-2 py-0.5">
              {k.replace(/_/g, " ")} <b>{n}</b>
            </span>
          ))}
        </div>
      )}
      {items.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((a) => (
            <ApprovalCard key={`${a.app.key}:${a.id}`} a={a} />
          ))}
        </div>
      ) : (
        <Empty>Nothing to approve{f.app || f.unit ? " for this filter" : ""}. 🎉</Empty>
      )}
    </div>
  );
}
