import Link from "next/link";

export function Section({ title, count, href, children, right }: { title: string; count?: number; href?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <h2 className="font-bold text-base">
          {title}
          {typeof count === "number" ? <span className="text-slate-400 font-semibold ml-1.5">{count}</span> : null}
        </h2>
        <div className="flex-1" />
        {right}
        {href && (
          <Link href={href} className="text-sm font-medium text-slate-600 hover:text-slate-900">
            See all →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="card p-4 text-sm text-slate-500 text-center">{children}</div>;
}
