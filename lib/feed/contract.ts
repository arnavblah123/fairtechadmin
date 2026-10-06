// The Admin Feed contract.
//
// Every Fairtech app exposes one small, read-mostly endpoint for the owner's
// dashboard (this repo). The dashboard never touches another app's database:
// it calls `GET {baseUrl}/api/admin-feed` with the shared `x-admin-key`
// header, receives this shape, and renders everything in one screen. When
// the owner approves or rejects something, the dashboard POSTs to
// `{baseUrl}/api/admin-feed/act`, and the source app runs its own business
// logic (ledgers, audit trail, emails) exactly as if the owner had pressed the
// button inside that app.
//
// This file is the single source of truth. docs/FEED_CONTRACT.md explains the
// same thing in prose for whoever adds the endpoint to a new app.

export const FEED_VERSION = 1 as const;

/** Header carrying the shared secret. The source app compares it with ADMIN_FEED_KEY. */
export const FEED_KEY_HEADER = "x-admin-key";

/** Default path of the feed on every app (the registry can override it). */
export const DEFAULT_FEED_PATH = "/api/admin-feed";

export type Tone = "neutral" | "good" | "warn" | "bad";

export type FeedKpi = {
  /** Stable id, unique within the app, e.g. "jobs_in_progress". */
  key: string;
  label: string;
  value: number | string;
  /** "₹", "kg", "%", "hrs", "nos" … shown after the value. */
  unit?: string;
  tone?: Tone;
  /** One line under the number, e.g. "vs 12 last week". */
  hint?: string;
  /** Deep link into the source app (absolute, or relative to its baseUrl). */
  href?: string;
};

export type FeedAction = {
  /** Stable id the source app understands, e.g. "approve", "reject", "query". */
  id: string;
  label: string;
  tone?: "primary" | "danger" | "neutral";
  /** The dashboard forces the owner to type a note before sending. */
  noteRequired?: boolean;
  /** The dashboard lets the owner edit the amount (e.g. partial advance). */
  amountEditable?: boolean;
};

export type FeedApproval = {
  /** Stable id, unique within the app. Encode the kind: "night:ckx…", "expense:42". */
  id: string;
  /** Machine-readable kind, e.g. "night_approval", "wage_advance", "grn". */
  kind: string;
  title: string;
  detail?: string;
  /** Rupees (not paise). */
  amount?: number;
  requestedBy?: string;
  /** ISO 8601. */
  requestedAt: string;
  /** Unit / site label, e.g. "CH1", "Savli". */
  unit?: string;
  href?: string;
  actions: FeedAction[];
};

export type FlagSeverity = "critical" | "warning" | "info";

export type FeedFlag = {
  id: string;
  severity: FlagSeverity;
  /** Machine-readable kind, e.g. "issue_open", "pm_overdue", "low_stock". */
  kind: string;
  title: string;
  detail?: string;
  /** ISO 8601: when the problem started. */
  since?: string;
  unit?: string;
  href?: string;
  /** For rolled-up flags ("14 items below minimum"). */
  count?: number;
  /** Optional actions, e.g. "resolve", "acknowledge". POSTed with flagId. */
  actions?: FeedAction[];
};

export type FeedActivity = {
  id: string;
  /** ISO 8601. */
  at: string;
  actor?: string;
  text: string;
  href?: string;
};

export type FeedMessage = {
  id: string;
  at: string;
  from?: string;
  /** "email" | "whatsapp" | "push" | "in-app" | "ai" | "complaint" … */
  channel?: string;
  text: string;
  href?: string;
  unread?: boolean;
};

export type FeedReport = {
  id: string;
  title: string;
  description?: string;
  /** Link to the report inside the source app. */
  href: string;
  /** e.g. "today", "this month", "last 12 months". */
  period?: string;
};

export type AdminFeed = {
  version: typeof FEED_VERSION;
  /** Short key, e.g. "production". Must match the registry key in this app. */
  app: string;
  /** Human label, e.g. "Production". */
  label: string;
  /** ISO 8601, when the source app built this payload. */
  generatedAt: string;
  /** Unit codes this app knows about, e.g. ["CH1","DH2","SV3"]. */
  units?: string[];
  kpis: FeedKpi[];
  approvals: FeedApproval[];
  flags: FeedFlag[];
  activity: FeedActivity[];
  messages: FeedMessage[];
  reports: FeedReport[];
};

/** Body of `POST {baseUrl}/api/admin-feed/act`. Exactly one of approvalId / flagId is set. */
export type FeedActRequest = {
  approvalId?: string;
  flagId?: string;
  actionId: string;
  note?: string;
  /** Rupees. Only when the action had amountEditable. */
  amount?: number;
  /** Who pressed the button on the dashboard; the source app records it. */
  actor: { name: string; email: string };
};

export type FeedActResponse = {
  ok: boolean;
  /** Short confirmation shown to the owner, e.g. "Advance approved, ₹2,000 posted." */
  message?: string;
  error?: string;
};

/** Minimal runtime check so a half-broken app cannot crash the dashboard. */
export function isAdminFeed(x: unknown): x is AdminFeed {
  if (!x || typeof x !== "object") return false;
  const f = x as Record<string, unknown>;
  return (
    f.version === FEED_VERSION &&
    typeof f.app === "string" &&
    typeof f.label === "string" &&
    typeof f.generatedAt === "string" &&
    Array.isArray(f.kpis) &&
    Array.isArray(f.approvals) &&
    Array.isArray(f.flags) &&
    Array.isArray(f.activity) &&
    Array.isArray(f.messages) &&
    Array.isArray(f.reports)
  );
}

/** Empty, valid feed: what the dashboard shows for an app that returned nothing. */
export function emptyFeed(app: string, label: string): AdminFeed {
  return {
    version: FEED_VERSION,
    app,
    label,
    generatedAt: new Date().toISOString(),
    kpis: [],
    approvals: [],
    flags: [],
    activity: [],
    messages: [],
    reports: [],
  };
}
