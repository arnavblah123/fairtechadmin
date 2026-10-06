"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { FeedAction } from "@/lib/feed/contract";
import { actAction, type ActState } from "@/lib/actions/feed";

type Props = {
  appKey: string;
  approvalId?: string;
  flagId?: string;
  title: string;
  amount?: number;
  actions: FeedAction[];
  compact?: boolean;
};

/**
 * The approve / reject buttons on a card. A plain action fires immediately; one
 * that needs a note or an editable amount opens a small inline form first.
 * After the source app answers, the card shows the answer and the list refreshes.
 */
export function ActForm({ appKey, approvalId, flagId, title, amount, actions, compact }: Props) {
  const [state, submit, pending] = useActionState<ActState, FormData>(actAction, null);
  const [open, setOpen] = useState<FeedAction | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      const t = setTimeout(() => router.refresh(), 900);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  if (state?.ok) {
    return <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">✓ {state.message || "Done."}</div>;
  }

  const hidden = (a: FeedAction) => (
    <>
      <input type="hidden" name="app" value={appKey} />
      {approvalId && <input type="hidden" name="approvalId" value={approvalId} />}
      {flagId && <input type="hidden" name="flagId" value={flagId} />}
      <input type="hidden" name="actionId" value={a.id} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="noteRequired" value={a.noteRequired ? "1" : "0"} />
    </>
  );

  const toneClass = (a: FeedAction) => (a.tone === "primary" ? "btn-primary" : a.tone === "danger" ? "btn-danger" : "btn-neutral");

  return (
    <div className="space-y-2">
      {!open && (
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => {
            const needsForm = a.noteRequired || a.amountEditable;
            if (needsForm) {
              return (
                <button key={a.id} type="button" className={`btn ${compact ? "btn-sm" : ""} ${toneClass(a)}`} onClick={() => setOpen(a)} disabled={pending}>
                  {a.label}
                </button>
              );
            }
            return (
              <form key={a.id} action={submit}>
                {hidden(a)}
                <button className={`btn ${compact ? "btn-sm" : ""} ${toneClass(a)}`} disabled={pending}>
                  {pending ? "…" : a.label}
                </button>
              </form>
            );
          })}
        </div>
      )}
      {open && (
        <form action={submit} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
          {hidden(open)}
          <div className="text-sm font-semibold">{open.label}</div>
          {open.amountEditable && (
            <label className="block text-sm">
              <span className="text-slate-600">Amount (₹)</span>
              <input className="input mt-1" name="amount" inputMode="decimal" defaultValue={amount ?? ""} required />
            </label>
          )}
          <label className="block text-sm">
            <span className="text-slate-600">Note {open.noteRequired ? "(required)" : "(optional)"}</span>
            <textarea className="input mt-1" name="note" rows={2} required={open.noteRequired} autoFocus placeholder={open.noteRequired ? "Why?" : "Anything to record…"} />
          </label>
          <div className="flex gap-2">
            <button className={`btn btn-sm ${toneClass(open)}`} disabled={pending}>
              {pending ? "Sending…" : `Confirm ${open.label.toLowerCase()}`}
            </button>
            <button type="button" className="btn btn-sm btn-neutral" onClick={() => setOpen(null)} disabled={pending}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {state && !state.ok && state.error && <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{state.error}</div>}
    </div>
  );
}
