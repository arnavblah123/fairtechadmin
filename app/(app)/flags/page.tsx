import { loadOverview } from "@/lib/feed/load";
import { FlagCard } from "@/components/flag-card";
import { FilterBar, applyFilter } from "@/components/filter-bar";
import { Empty, Section } from "@/components/section";
import { plural } from "@/lib/format";

export const metadata = { title: "Flags" };

export default async function FlagsPage({ searchParams }: { searchParams: Promise<{ app?: string; unit?: string; show?: string }> }) {
  const [o, f] = await Promise.all([loadOverview(), searchParams]);
  const items = applyFilter(o.flags, f);
  const hidden = applyFilter(o.hiddenFlags, f);
  const crit = items.filter((x) => x.severity === "critical");
  const warn = items.filter((x) => x.severity === "warning");
  const info = items.filter((x) => x.severity === "info");
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Flags</h1>
        <p className="text-sm text-slate-500">
          {plural(crit.length, "critical")}, {plural(warn.length, "warning")}, {plural(info.length, "info")}
          {hidden.length ? `, ${hidden.length} snoozed` : ""}. Snoozing hides a flag here only; resolving acts in the source app.
        </p>
      </div>
      <FilterBar base="/flags" statuses={o.statuses} units={o.units} current={f} />
      {crit.length > 0 && (
        <Section title="Critical" count={crit.length}>
          <div className="grid md:grid-cols-2 gap-3">
            {crit.map((x) => (
              <FlagCard key={`${x.app.key}:${x.id}`} f={x} />
            ))}
          </div>
        </Section>
      )}
      {warn.length > 0 && (
        <Section title="Warnings" count={warn.length}>
          <div className="grid md:grid-cols-2 gap-3">
            {warn.map((x) => (
              <FlagCard key={`${x.app.key}:${x.id}`} f={x} />
            ))}
          </div>
        </Section>
      )}
      {info.length > 0 && (
        <Section title="Good to know" count={info.length}>
          <div className="grid md:grid-cols-2 gap-3">
            {info.map((x) => (
              <FlagCard key={`${x.app.key}:${x.id}`} f={x} />
            ))}
          </div>
        </Section>
      )}
      {!items.length && <Empty>No flags{f.app || f.unit ? " for this filter" : ""}. All clear.</Empty>}
      {hidden.length > 0 && (
        <Section title="Snoozed" count={hidden.length}>
          <div className="grid md:grid-cols-2 gap-3">
            {hidden.map((x) => (
              <FlagCard key={`${x.app.key}:${x.id}`} f={x} hidden />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
