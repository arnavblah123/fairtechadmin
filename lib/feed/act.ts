import { FEED_KEY_HEADER, type FeedActRequest, type FeedActResponse } from "@/lib/feed/contract";
import { feedKeyFor, isMockMode, type AppConfig } from "@/lib/feed/registry";
import { invalidateFeedCache } from "@/lib/feed/fetch";
import { db } from "@/lib/db";
import { mockAct } from "@/lib/feed/mock";

export type ActInput = {
  app: AppConfig;
  approvalId?: string;
  flagId?: string;
  actionId: string;
  title: string;
  note?: string;
  amount?: number;
  actor: { name: string; email: string };
};

/** Send one action to the source app and record it in ActionLog whatever happens. */
export async function actOnApp(input: ActInput): Promise<FeedActResponse> {
  const started = Date.now();
  const body: FeedActRequest = {
    approvalId: input.approvalId,
    flagId: input.flagId,
    actionId: input.actionId,
    note: input.note?.trim() || undefined,
    amount: input.amount,
    actor: input.actor,
  };

  let result: FeedActResponse;
  if (isMockMode()) {
    result = mockAct(input.app.key, body);
  } else {
    const key = feedKeyFor(input.app.key);
    if (!key) {
      result = { ok: false, error: "ADMIN_FEED_KEY is not set on this dashboard." };
    } else {
      try {
        const res = await fetch(`${input.app.baseUrl}${input.app.feedPath}/act`, {
          method: "POST",
          headers: { [FEED_KEY_HEADER]: key, "content-type": "application/json", ...input.app.extraHeaders },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(15000),
          cache: "no-store",
        });
        const text = await res.text();
        let json: Partial<FeedActResponse> = {};
        try {
          json = JSON.parse(text);
        } catch {
          /* non-JSON error page */
        }
        if (res.ok) result = { ok: json.ok !== false, message: json.message, error: json.error };
        else result = { ok: false, error: json.error || `${input.app.label} answered ${res.status}.` };
      } catch (e) {
        result = { ok: false, error: e instanceof Error && e.name === "TimeoutError" ? "Timed out waiting for the app." : "Could not reach the app." };
      }
    }
  }

  try {
    await db.actionLog.create({
      data: {
        actor: input.actor.email,
        app: input.app.key,
        targetId: input.approvalId ?? input.flagId ?? "",
        actionId: input.actionId,
        title: input.title,
        note: body.note,
        amount: input.amount,
        ok: result.ok,
        response: result.message ?? result.error ?? null,
        latencyMs: Date.now() - started,
      },
    });
  } catch (e) {
    console.error("[act] ActionLog write failed:", (e as Error).message);
  }
  invalidateFeedCache(input.app.key);
  return result;
}
