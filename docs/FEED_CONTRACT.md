# Admin Feed contract

The owner dashboard (this repo, `fairtechadmin`) shows every Fairtech app in
one screen. It does **not** read any other app's database. Instead each app
exposes one small endpoint and the dashboard calls it server-to-server.

The TypeScript source of truth is `lib/feed/contract.ts`. Copy the types into
the source app (or re-type them in JS / Deno) — the shape is small.

## Endpoints every app exposes

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/api/admin-feed` | Return the `AdminFeed` JSON below. |
| `POST` | `/api/admin-feed/act` | Perform one approval / flag action. Body: `FeedActRequest`. Returns `FeedActResponse`. |

Both are authenticated by the header **`x-admin-key`**, compared with the
env var **`ADMIN_FEED_KEY`** on the source app. Fail closed:

* `503 { error: "ADMIN_FEED_KEY not configured" }` when the env var is unset
* `401 { error: "Unauthorized" }` when the header is missing or wrong

The same value of `ADMIN_FEED_KEY` is set on every app and on the dashboard
(`openssl rand -hex 32`). No cookies, no CORS needed — the dashboard calls from
its server.

These paths must be exempt from the app's login middleware (same as the
existing `/api/integration/*` or `/api/health` routes).

## `GET /api/admin-feed` → `AdminFeed`

```jsonc
{
  "version": 1,
  "app": "production",            // registry key, lowercase
  "label": "Production",
  "generatedAt": "2026-10-04T05:00:00.000Z",
  "units": ["CH1", "DH2", "SV3"],  // optional

  "kpis": [
    { "key": "jobs_in_progress", "label": "Jobs in progress", "value": 14,
      "tone": "neutral", "hint": "3 due this week", "href": "/jobs" }
  ],

  "approvals": [
    { "id": "advance:ckx123", "kind": "wage_advance",
      "title": "Advance ₹2,000 — Ramesh (E-041)",
      "detail": "Reason: medical. Before 25th.",
      "amount": 2000, "requestedBy": "Suresh (supervisor)",
      "requestedAt": "2026-10-03T11:20:00.000Z", "unit": "CH1",
      "href": "/salaries",
      "actions": [
        { "id": "approve", "label": "Approve", "tone": "primary", "amountEditable": true },
        { "id": "decline", "label": "Decline", "tone": "danger", "noteRequired": true }
      ] }
  ],

  "flags": [
    { "id": "issue:ckx999", "severity": "critical", "kind": "issue_open",
      "title": "Material shortage — Job J-1042", "detail": "Plates 12mm not received",
      "since": "2026-10-01T03:00:00.000Z", "unit": "DH2", "href": "/issues",
      "actions": [ { "id": "resolve", "label": "Mark resolved", "noteRequired": true } ] },
    { "id": "low_stock", "severity": "warning", "kind": "low_stock",
      "title": "14 items below minimum stock", "count": 14, "href": "/reports/reorder" }
  ],

  "activity": [
    { "id": "audit:1", "at": "2026-10-04T04:55:00.000Z", "actor": "Suresh",
      "text": "Completed stage Fit-up on J-1040", "href": "/jobs/ckx" }
  ],

  "messages": [
    { "id": "finding:7", "at": "2026-10-04T01:00:00.000Z", "from": "AI monitor",
      "channel": "ai", "text": "J-1038 has had no update for 3 days", "unread": true }
  ],

  "reports": [
    { "id": "daily", "title": "Daily production report", "href": "/reports?view=production", "period": "today" }
  ]
}
```

Rules of thumb:

* **Amounts are rupees**, numbers, never paise and never strings.
* **Dates are ISO 8601** strings (UTC is fine; the dashboard renders IST).
* **Ids are stable** across calls and encode the kind: `"<kind>:<dbId>"`.
  The dashboard uses them to dedupe, to remember acknowledgements and to send
  `act` requests back.
* **`href`** may be absolute or relative to the app's base URL.
* Keep lists short: approvals = everything pending (complete), flags = what
  is wrong right now (complete), activity = last 24h capped at ~40 rows,
  messages = last 7 days capped at ~30.
* Severity: `critical` = work stopped / money at risk / safety; `warning` =
  needs attention this week; `info` = good to know.
* Compute cheaply: the dashboard polls every minute.

## `POST /api/admin-feed/act`

```jsonc
{ "approvalId": "advance:ckx123",   // or "flagId": "issue:ckx999"
  "actionId": "approve",
  "note": "ok, deduct from Nov salary",   // when noteRequired, or optional
  "amount": 1500,                          // rupees, only when amountEditable
  "actor": { "name": "Arnav", "email": "fairtechindia@gmail.com" } }
```

Response: `{ "ok": true, "message": "Advance approved." }` or
`{ "ok": false, "error": "Already decided" }` (HTTP 200 with ok:false for
business errors, 4xx/5xx for bad requests / crashes).

The source app must run the **same code path** as its own UI button (ledger
postings, audit log rows, emails), attributing the action to its owner /
superadmin account (look it up by `actor.email`, or fall back to the seeded
superadmin), and must be idempotent: acting twice on the same id returns
`ok:false, error:"Already decided"` rather than double-posting.

## Checklist for adding the endpoint to an app

1. Add `ADMIN_FEED_KEY=` to `.env.example` and mention it in the README.
2. Create the two routes; exempt them from auth middleware.
3. Build the payload from the same queries the app's own admin dashboard uses.
4. Wire `act` to the existing approve / reject functions.
5. `curl -H "x-admin-key: $ADMIN_FEED_KEY" https://<app>/api/admin-feed | jq .`
6. In the dashboard → Settings → Apps, add the app's base URL. Done.
