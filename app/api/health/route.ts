import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listApps } from "@/lib/feed/registry";

export const dynamic = "force-dynamic";

// Public, data-free: is the dashboard up, is its DB reachable, which apps are configured.
export async function GET() {
  let dbOk = false;
  try {
    await db.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch {
    /* reported below */
  }
  const apps = await listApps(true);
  return NextResponse.json({
    ok: dbOk,
    db: dbOk ? "connected" : "unreachable",
    sessionSecret: Boolean(process.env.SESSION_SECRET),
    adminFeedKey: Boolean(process.env.ADMIN_FEED_KEY),
    apps: apps.map((a) => ({ key: a.key, enabled: a.enabled, configured: Boolean(a.baseUrl) })),
    time: new Date().toISOString(),
  });
}
