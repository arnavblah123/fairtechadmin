"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { refreshAction } from "@/lib/actions/feed";

export function RefreshButton({ fetchedAt }: { fetchedAt?: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-neutral btn-sm"
      title={fetchedAt ? `Last fetched ${new Date(fetchedAt).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}` : "Refresh"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          await refreshAction();
          router.refresh();
        })
      }
    >
      <svg className={`h-4 w-4 ${pending ? "spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 3v6h-6" />
      </svg>
      <span className="hidden sm:inline">Refresh</span>
    </button>
  );
}
