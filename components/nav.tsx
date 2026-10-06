"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Count } from "@/components/badges";

export type NavCounts = { approvals: number; flags: number; inbox: number; down: number };

const ITEMS: Array<{ href: string; label: string; icon: React.ReactNode; count?: keyof NavCounts; tone?: "bad" | "warn" | "neutral" }> = [
  { href: "/", label: "Today", icon: <path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2z" /> },
  { href: "/approvals", label: "Approvals", icon: <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />, count: "approvals", tone: "warn" },
  { href: "/flags", label: "Flags", icon: <path d="M4 22V4a1 1 0 0 1 1-1h11l1 2h4v11h-9l-1-2H5" />, count: "flags", tone: "bad" },
  { href: "/messages", label: "Inbox", icon: <path d="M22 12h-6l-2 3h-4l-2-3H2M5 5h14l3 7v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7z" />, count: "inbox", tone: "neutral" },
  { href: "/reports", label: "Reports", icon: <path d="M3 3v18h18M7 14l4-4 4 4 5-6" /> },
  { href: "/activity", label: "Activity", icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> },
  { href: "/notes", label: "Notes", icon: <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5" /> },
  { href: "/history", label: "My decisions", icon: <path d="M12 8v4l3 3M3 12a9 9 0 1 0 3-6.7M3 3v6h6" /> },
  { href: "/settings", label: "Settings", icon: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />, count: "down", tone: "bad" },
];

const MOBILE = ["/", "/approvals", "/flags", "/messages", "/reports"];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function SideNav({ counts }: { counts: NavCounts }) {
  const path = usePathname();
  return (
    <nav className="hidden md:flex flex-col gap-0.5 w-56 shrink-0 p-3 sticky top-14 self-start">
      {ITEMS.map((it) => {
        const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
        const n = it.count ? counts[it.count] : 0;
        return (
          <Link key={it.href} href={it.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-white"}`}>
            <Icon>{it.icon}</Icon>
            <span className="flex-1">{it.label}</span>
            {n ? <Count n={n} tone={active ? "neutral" : it.tone} /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav({ counts }: { counts: NavCounts }) {
  const path = usePathname();
  const items = ITEMS.filter((i) => MOBILE.includes(i.href));
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-200 pb-safe">
      <div className="grid grid-cols-5">
        {items.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          const n = it.count ? counts[it.count] : 0;
          return (
            <Link key={it.href} href={it.href} className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? "text-slate-900" : "text-slate-500"}`}>
              <Icon>{it.icon}</Icon>
              {it.label}
              {n ? (
                <span className="absolute top-1 right-[18%]">
                  <Count n={n} tone={it.tone} />
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MoreLinks() {
  // Items not in the bottom bar, shown in the header menu on phones.
  const path = usePathname();
  return (
    <div className="md:hidden flex gap-1 scroll-x">
      {ITEMS.filter((i) => !MOBILE.includes(i.href)).map((it) => (
        <Link key={it.href} href={it.href} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${path.startsWith(it.href) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`}>
          {it.label}
        </Link>
      ))}
    </div>
  );
}
