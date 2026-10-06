import { NextRequest, NextResponse } from "next/server";
import { cronAllowed } from "@/lib/cron-auth";
import { takeSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  if (!cronAllowed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { overview } = await takeSnapshot();
    return NextResponse.json({ ok: true, apps: overview.statuses.map((s) => ({ app: s.app.key, ok: s.ok, pending: s.pendingApprovals, critical: s.critical })) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
