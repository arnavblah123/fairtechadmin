import type { OwnerNote } from "@prisma/client";
import { addNoteAction, toggleNoteAction, deleteNoteAction } from "@/lib/actions/notes";
import { fmtDate } from "@/lib/format";
import type { AppRef } from "@/lib/feed/aggregate";

export function NotesPanel({ notes, apps, compact }: { notes: OwnerNote[]; apps: AppRef[]; compact?: boolean }) {
  const byKey = new Map(apps.map((a) => [a.key, a]));
  const now = Date.now();
  return (
    <div className="space-y-2">
      <form action={addNoteAction} className="card p-3 flex flex-col sm:flex-row gap-2">
        <input name="text" className="input flex-1" placeholder="Follow up… (e.g. ask Nilesh about JSW quote validity)" required />
        <div className="flex gap-2">
          <select name="app" className="input !w-auto text-sm" defaultValue="">
            <option value="">Any app</option>
            {apps.map((a) => (
              <option key={a.key} value={a.key}>
                {a.label}
              </option>
            ))}
          </select>
          <input type="date" name="dueAt" className="input !w-auto text-sm" />
          <button className="btn btn-primary">Add</button>
        </div>
      </form>
      {notes.length === 0 && <div className="card p-4 text-sm text-slate-500 text-center">No notes. Use this for things you want to chase.</div>}
      <ul className="space-y-1.5">
        {notes.map((n) => {
          const app = n.app ? byKey.get(n.app) : null;
          const overdue = n.dueAt && !n.done && n.dueAt.getTime() < now;
          return (
            <li key={n.id} className={`card px-3 py-2 flex items-start gap-2 ${n.done ? "opacity-60" : ""} ${overdue ? "border-red-200" : ""}`}>
              <form action={toggleNoteAction}>
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="field" value="done" />
                <button className={`mt-0.5 h-5 w-5 rounded border grid place-items-center text-xs ${n.done ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"}`} aria-label="toggle done">
                  {n.done ? "✓" : ""}
                </button>
              </form>
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${n.done ? "line-through" : ""}`}>{n.text}</div>
                <div className="text-[11px] text-slate-500 flex gap-2 mt-0.5">
                  {app && <span style={{ color: app.color ?? undefined }}>{app.label}</span>}
                  {n.dueAt && <span className={overdue ? "text-red-700 font-semibold" : ""}>due {fmtDate(n.dueAt.toISOString())}</span>}
                  {n.pinned && <span>📌 pinned</span>}
                </div>
              </div>
              {!compact && (
                <>
                  <form action={toggleNoteAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <input type="hidden" name="field" value="pinned" />
                    <button className="btn btn-sm btn-neutral" title="Pin">
                      📌
                    </button>
                  </form>
                  <form action={deleteNoteAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <button className="btn btn-sm btn-neutral" title="Delete">
                      ✕
                    </button>
                  </form>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
