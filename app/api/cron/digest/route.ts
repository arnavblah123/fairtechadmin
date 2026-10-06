import { NextRequest, NextResponse } from "next/server";
import { cronAllowed } from "@/lib/cron-auth";
import { db } from "@/lib/db";
import { takeSnapshot } from "@/lib/snapshot";
import { buildDigest } from "@/lib/digest";
import { sendOwnerEmail } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 08:00 IST daily (02:30 UTC in vercel.json): snapshot + email brief.
export async function GET(req: NextRequest) {
  if (!cronAllowed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const settings = Object.fromEntries((await db.setting.findMany().catch(() => [])).map((s) => [s.key, s.value]));
    const { overview } = await takeSnapshot();
    if (settings.digest_enabled === "0") return NextResponse.json({ ok: true, skipped: "digest disabled" });
    const url = settings.dashboard_url || process.env.APP_URL || `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? ""}`;
    const d = buildDigest(overview, url);
    const sent = await sendOwnerEmail(d.subject, d.html, d.text);
    return NextResponse.json({ ok: sent.ok, error: sent.error, subject: d.subject });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
