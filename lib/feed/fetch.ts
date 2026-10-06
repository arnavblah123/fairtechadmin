import { FEED_KEY_HEADER, isAdminFeed, type AdminFeed } from "@/lib/feed/contract";
import { feedKeyFor, isMockMode, listApps, type AppConfig } from "@/lib/feed/registry";
import { mockFeed } from "@/lib/feed/mock";

export type FeedResult = {
  app: AppConfig;
  ok: boolean;
  feed: AdminFeed | null;
  error?: string;
  latencyMs: number;
  fetchedAt: string;
};

const TIMEOUT_MS = 9000;

// A short in-process cache so a burst of page loads (the owner tapping around
// on a phone) does not hammer eight apps. Server actions call `invalidate()`
// after an approval so the item disappears on the next render.
const cache = new Map<string, { at: number; result: FeedResult }>();
const CACHE_MS = 20_000;

export function invalidateFeedCache(appKey?: string) {
  if (appKey) cache.delete(appKey);
  else cache.clear();
}

export async function fetchFeed(app: AppConfig, opts: { fresh?: boolean } = {}): Promise<FeedResult> {
  const hit = cache.get(app.key);
  if (!opts.fresh && hit && Date.now() - hit.at < CACHE_MS) return hit.result;

  const started = Date.now();
  const done = (partial: Omit<FeedResult, "app" | "latencyMs" | "fetchedAt">): FeedResult => {
    const result: FeedResult = { app, latencyMs: Date.now() - started, fetchedAt: new Date().toISOString(), ...partial };
    cache.set(app.key, { at: Date.now(), result });
    return result;
  };

  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 80 + Math.random() * 200));
    const m = mockFeed(app.key, app.label);
    return done(m ? { ok: true, feed: m } : { ok: false, feed: null, error: "No demo data for this app." });
  }

  if (!app.baseUrl) return done({ ok: false, feed: null, error: "No URL configured. Add it in Settings → Apps." });
  const key = feedKeyFor(app.key);
  if (!key) return done({ ok: false, feed: null, error: "ADMIN_FEED_KEY is not set on this dashboard." });

  try {
    const res = await fetch(`${app.baseUrl}${app.feedPath}`, {
      headers: { [FEED_KEY_HEADER]: key, accept: "application/json", ...app.extraHeaders },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (res.status === 401) return done({ ok: false, feed: null, error: "Refused the admin key — ADMIN_FEED_KEY differs between the apps." });
    if (res.status === 404) return done({ ok: false, feed: null, error: "No /api/admin-feed on this app yet — deploy its latest version." });
    if (res.status === 503) return done({ ok: false, feed: null, error: "ADMIN_FEED_KEY is not configured on that app." });
    if (!res.ok) return done({ ok: false, feed: null, error: `Answered ${res.status}.` });
    const json: unknown = await res.json();
    if (!isAdminFeed(json)) return done({ ok: false, feed: null, error: "Answered with an unexpected shape (not an AdminFeed v1)." });
    return done({ ok: true, feed: json });
  } catch (e) {
    const msg = e instanceof Error && e.name === "TimeoutError" ? `No answer within ${TIMEOUT_MS / 1000}s.` : "Could not reach the app.";
    return done({ ok: false, feed: null, error: msg });
  }
}

export async function fetchAllFeeds(opts: { fresh?: boolean } = {}): Promise<FeedResult[]> {
  const apps = await listApps();
  return Promise.all(apps.map((a) => fetchFeed(a, opts)));
}
