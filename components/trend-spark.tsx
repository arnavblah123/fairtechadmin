import type { TrendPoint } from "@/lib/snapshot";

/** Tiny inline sparkline of pending approvals (bars) with critical flags (red dots). */
export function TrendSpark({ points, width = 160, height = 36 }: { points: TrendPoint[]; width?: number; height?: number }) {
  if (points.length < 2) return <span className="text-[11px] text-slate-400">trend appears after a few hourly snapshots</span>;
  const max = Math.max(1, ...points.map((p) => p.pendingApprovals));
  const step = width / points.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block" role="img" aria-label="pending approvals over time">
      {points.map((p, i) => {
        const h = Math.max(1, (p.pendingApprovals / max) * (height - 6));
        return <rect key={i} x={i * step + 0.5} y={height - h} width={Math.max(1, step - 1)} height={h} fill={p.ok ? "#94a3b8" : "#fca5a5"} />;
      })}
      {points.map((p, i) => (p.critical ? <circle key={`c${i}`} cx={i * step + step / 2} cy={3} r={2} fill="#dc2626" /> : null))}
    </svg>
  );
}
