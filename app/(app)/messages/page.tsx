import { loadOverview } from "@/lib/feed/load";
import { MessageList } from "@/components/lists";
import { FilterBar, applyFilter } from "@/components/filter-bar";
import { plural } from "@/lib/format";

export const metadata = { title: "Inbox" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ app?: string; unit?: string }> }) {
  const [o, f] = await Promise.all([loadOverview(), searchParams]);
  const items = applyFilter(o.messages.map((m) => ({ ...m, unit: undefined as string | undefined })), { app: f.app });
  const unread = items.filter((m) => m.unread).length;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Inbox</h1>
        <p className="text-sm text-slate-500">
          {plural(unread, "unread")} of {items.length}. Complaints, AI findings, quote questions, flags and alerts from every app, last 7 days.
        </p>
      </div>
      <FilterBar base="/messages" statuses={o.statuses} units={[]} current={{ app: f.app }} />
      <MessageList items={items} />
    </div>
  );
}
