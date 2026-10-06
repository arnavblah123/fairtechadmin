import { loadOverview } from "@/lib/feed/load";
import { ActivityList } from "@/components/lists";
import { FilterBar, applyFilter } from "@/components/filter-bar";
import { plural } from "@/lib/format";

export const metadata = { title: "Activity" };

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ app?: string }> }) {
  const [o, f] = await Promise.all([loadOverview(), searchParams]);
  const items = applyFilter(o.activity.map((a) => ({ ...a, unit: undefined as string | undefined })), { app: f.app });
  const actors = new Map<string, number>();
  for (const a of items) if (a.actor) actors.set(a.actor, (actors.get(a.actor) ?? 0) + 1);
  const top = [...actors.entries()].sort((x, y) => y[1] - x[1]).slice(0, 8);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Activity</h1>
        <p className="text-sm text-slate-500">{plural(items.length, "event")} in the last 24 hours across the apps&apos; audit logs.</p>
      </div>
      <FilterBar base="/activity" statuses={o.statuses} units={[]} current={{ app: f.app }} />
      {top.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="text-slate-500 py-0.5">Most active:</span>
          {top.map(([name, n]) => (
            <span key={name} className="rounded bg-white border border-slate-200 px-2 py-0.5">
              {name} <b>{n}</b>
            </span>
          ))}
        </div>
      )}
      <ActivityList items={items} />
    </div>
  );
}
