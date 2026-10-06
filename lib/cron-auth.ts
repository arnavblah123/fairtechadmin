import type { NextRequest } from "next/server";

/** Vercel cron sends `authorization: Bearer <CRON_SECRET>`; manual calls must send the same. */
export function cronAllowed(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production" || Boolean(req.headers.get("x-vercel-cron"));
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
