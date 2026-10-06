import { loadOverview } from "@/lib/feed/load";
import { listNotes } from "@/lib/notes";
import { NotesPanel } from "@/components/notes-panel";

export const metadata = { title: "Notes" };

export default async function NotesPage() {
  const [o, notes] = await Promise.all([loadOverview(), listNotes()]);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Follow-ups & notes</h1>
        <p className="text-sm text-slate-500">Your own list: things to chase, decisions to make, reminders. Private to this dashboard.</p>
      </div>
      <NotesPanel notes={notes} apps={o.statuses.map((s) => s.app)} />
    </div>
  );
}
