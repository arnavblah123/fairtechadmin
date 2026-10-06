"use client";

import { useState } from "react";
import { ackFlagAction } from "@/lib/actions/feed";

/** Hide a flag on this dashboard for a while (the source app is not touched). */
export function SnoozeMenu({ appKey, flagId }: { appKey: string; flagId: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="btn btn-sm btn-neutral" onClick={() => setOpen(true)}>
        Snooze
      </button>
    );
  }
  return (
    <form action={ackFlagAction} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
      <input type="hidden" name="app" value={appKey} />
      <input type="hidden" name="flagId" value={flagId} />
      <select name="hours" className="input !w-auto !py-1 text-sm" defaultValue="24">
        <option value="4">4 hours</option>
        <option value="24">1 day</option>
        <option value="72">3 days</option>
        <option value="168">1 week</option>
        <option value="0">Until it clears</option>
      </select>
      <input name="note" className="input !w-40 !py-1 text-sm" placeholder="why (optional)" />
      <button className="btn btn-sm btn-primary">Snooze</button>
      <button type="button" className="btn btn-sm btn-neutral" onClick={() => setOpen(false)}>
        Cancel
      </button>
    </form>
  );
}
