import Link from "next/link";
import { requireOwner } from "@/lib/session";
import { loadOverview } from "@/lib/feed/load";
import { SideNav, BottomNav, MoreLinks } from "@/components/nav";
import { AutoRefresh } from "@/components/auto-refresh";
import { RefreshButton } from "@/components/refresh-button";
import { logoutAction } from "@/lib/actions/auth";
import { todayIST } from "@/lib/format";
import { isMockMode } from "@/lib/feed/registry";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const owner = await requireOwner();
  const o = await loadOverview();
  const counts = {
    approvals: o.totals.pendingApprovals,
    flags: o.totals.critical + o.totals.warning,
    inbox: o.totals.unreadMessages,
    down: o.totals.appsDown,
  };
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="h-8 w-8 rounded-lg bg-slate-900 text-white grid place-items-center text-sm">F</span>
            <span className="hidden sm:inline">Fairtech Owner</span>
          </Link>
          <span className="text-xs text-slate-500 hidden sm:inline">{todayIST()}</span>
          {isMockMode() && <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5 text-[11px] font-semibold">DEMO DATA</span>}
          <div className="flex-1" />
          <RefreshButton />
          <form action={logoutAction}>
            <button className="btn btn-neutral btn-sm" title={owner.email}>
              <span className="max-w-24 truncate">{owner.name}</span>
              <span className="text-slate-400">·</span>
              <span>Out</span>
            </button>
          </form>
        </div>
        <div className="md:hidden mx-auto max-w-7xl px-3 pb-2">
          <MoreLinks />
        </div>
      </header>
      <div className="mx-auto max-w-7xl flex">
        <SideNav counts={counts} />
        <main className="flex-1 min-w-0 p-3 sm:p-4 pb-24 md:pb-8">{children}</main>
      </div>
      <BottomNav counts={counts} />
      <AutoRefresh seconds={60} />
    </div>
  );
}
