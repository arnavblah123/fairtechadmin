"use client";

import { useEffect } from "react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="card p-6 max-w-lg mx-auto mt-10 text-center space-y-3">
      <h2 className="font-bold text-lg">Something went wrong</h2>
      <p className="text-sm text-slate-600">
        Usually this means the dashboard&apos;s own database is not reachable (notes, snoozes and history need it) or an app took too long to answer. The apps themselves are unaffected.
      </p>
      {error.digest && <p className="text-[11px] text-slate-400">ref {error.digest}</p>}
      <div className="flex justify-center gap-2">
        <button className="btn btn-primary btn-sm" onClick={() => reset()}>
          Try again
        </button>
        <a className="btn btn-neutral btn-sm" href="/settings">
          Check health
        </a>
      </div>
    </div>
  );
}
