// Demo data for every app, used when MOCK_FEEDS=1 (local preview, screenshots,
// and the first run before any app has the endpoint deployed). Shapes mirror
// what each app's real /api/admin-feed returns.
import { FEED_VERSION, type AdminFeed, type FeedActRequest, type FeedActResponse } from "@/lib/feed/contract";

const h = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 36e5).toISOString();
const decided = new Set<string>();

const feeds: Record<string, () => AdminFeed> = {
  production: () => ({
    version: FEED_VERSION, app: "production", label: "Production", generatedAt: h(0), units: ["CH1", "DH2", "SV3"],
    kpis: [
      { key: "jobs_in_progress", label: "Jobs in progress", value: 17, hint: "4 due this week", href: "/jobs" },
      { key: "ready_dispatch", label: "Ready to dispatch", value: 3, tone: "good", href: "/jobs?status=READY_TO_DISPATCH" },
      { key: "present_today", label: "Workers present", value: 86, unit: "nos", hint: "of 97 active", tone: "neutral" },
      { key: "on_time_pct", label: "On-time this month", value: 78, unit: "%", tone: "warn", hint: "7 of 9 jobs" },
      { key: "open_issues", label: "Open issues", value: 5, tone: "bad", href: "/issues" },
      { key: "wip_value", label: "WIP order value", value: 18_40_000, unit: "₹", href: "/planner" },
    ],
    approvals: [
      { id: "night:1", kind: "night_approval", title: "Night work past 10 PM — Fit-up J-1042", detail: "Supervisor Suresh asks to keep 4 workers till 1 AM to finish fit-up for Thursday dispatch.", requestedBy: "Suresh (CH1)", requestedAt: h(1.5), unit: "CH1", href: "/", actions: [{ id: "approve", label: "Approve", tone: "primary" }, { id: "decline", label: "Decline", tone: "danger", noteRequired: true }] },
      { id: "advance:88", kind: "wage_advance", title: "Advance ₹3,000 — Ramesh Yadav (E-041)", detail: "Reason: daughter's school fees. Mode: petty cash.", amount: 3000, requestedBy: "Vikas (DH2)", requestedAt: h(26), unit: "DH2", href: "/salaries", actions: [{ id: "approve", label: "Approve", tone: "primary", amountEditable: true }, { id: "decline", label: "Decline", tone: "danger", noteRequired: true }] },
      { id: "advance:89", kind: "wage_advance", title: "Advance ₹1,500 — Sanjay Kumar (E-112)", detail: "Reason: medical.", amount: 1500, requestedBy: "Vikas (DH2)", requestedAt: h(5), unit: "DH2", href: "/salaries", actions: [{ id: "approve", label: "Approve", tone: "primary", amountEditable: true }, { id: "decline", label: "Decline", tone: "danger", noteRequired: true }] },
    ],
    flags: [
      { id: "issue:501", severity: "critical", kind: "issue_open", title: "Material shortage — J-1040 (Tata Projects)", detail: "12 mm plates for base frames not received. Stage Marking paused since yesterday.", since: h(31), unit: "SV3", href: "/issues", actions: [{ id: "resolve", label: "Mark resolved", noteRequired: true }] },
      { id: "job_overdue:1033", severity: "warning", kind: "job_overdue", title: "J-1033 is 4 days past expected completion", detail: "Client: L&T. Stage Painting active.", since: h(96), unit: "CH1", href: "/jobs/1033" },
      { id: "finding:77", severity: "warning", kind: "ai_finding", title: "J-1038 has had no update for 3 days", detail: "AI monitor: last job update 1 Oct, stage Welding active with 0 logged hours since.", since: h(20), unit: "DH2", actions: [{ id: "acknowledge", label: "Acknowledge" }] },
      { id: "waiting:drawing", severity: "info", kind: "drawing_pending", title: "3 jobs waiting for drawings", count: 3, href: "/jobs?drawingPending=1" },
      { id: "issue:502", severity: "warning", kind: "issue_open", title: "Labour shortage — J-1044", detail: "Need 2 fitters from Monday.", since: h(8), unit: "CH1", href: "/issues", actions: [{ id: "resolve", label: "Mark resolved", noteRequired: true }] },
    ],
    activity: [
      { id: "a1", at: h(0.3), actor: "Suresh", text: "Completed stage Fit-up on J-1041", href: "/jobs/1041" },
      { id: "a2", at: h(1.1), actor: "Vikas", text: "Raised wage advance for Sanjay Kumar" },
      { id: "a3", at: h(2.4), actor: "System", text: "Attendance synced: 86 punches from CH1/DH2/SV3" },
      { id: "a4", at: h(3.2), actor: "Priya (Accounts)", text: "Recorded salary payment batch for September" },
      { id: "a5", at: h(6), actor: "Suresh", text: "Dispatched J-1029 (2 trucks, 14.2 t)", href: "/jobs/1029" },
    ],
    messages: [
      { id: "m1", at: h(20), from: "AI monitor", channel: "ai", text: "Welding stage on J-1038 shows 0 hours for 3 days while 3 workers are assigned.", unread: true },
      { id: "m2", at: h(30), from: "Sanjay Kumar", channel: "complaint", text: "Delay on J-1040 blamed on late crane availability (labour complaint, no wage cut)." },
      { id: "m3", at: h(44), from: "AI monitor", channel: "ai", text: "J-1033 expected completion was 30 Sep; consider informing the client." },
    ],
    reports: [
      { id: "prod", title: "Production report", href: "/reports?view=production", period: "today" },
      { id: "planning", title: "Planning vs execution", href: "/reports?view=planning", period: "this week" },
      { id: "kpi", title: "KPIs", href: "/reports?view=kpis", period: "this month" },
      { id: "scorecard", title: "Owner's scorecard", href: "/planner" },
      { id: "staff", title: "Staff scorecard", href: "/staff-scorecard", period: "this month" },
      { id: "audit", title: "Audit trail", href: "/audit" },
    ],
  }),
  store: () => ({
    version: FEED_VERSION, app: "store", label: "Store & Consumables", generatedAt: h(0), units: ["CH1", "DH2", "SV3"],
    kpis: [
      { key: "stock_value", label: "Stock value", value: 42_60_000, unit: "₹", href: "/reports" },
      { key: "issue_today", label: "Issued today", value: 18_400, unit: "₹", hint: "31 issues" },
      { key: "below_min", label: "Items below min", value: 14, tone: "warn", href: "/reports" },
      { key: "grn_month", label: "GRNs this month", value: 23, hint: "₹6.1 L" },
    ],
    approvals: [
      { id: "grn:311", kind: "grn", title: "GRN #311 — Shree Welding Supplies ₹48,200", detail: "Electrodes 3.15 mm ×40 boxes, grinding wheels ×100. Bill photo attached.", amount: 48200, requestedBy: "Store CH1", requestedAt: h(3), unit: "CH1", href: "/approvals", actions: [{ id: "approve", label: "Pass", tone: "primary" }, { id: "query", label: "Query", tone: "danger", noteRequired: true }] },
      { id: "indent:IND-SV3-019", kind: "indent", title: "Indent IND-SV3-019 — 7 lines, est ₹22,900", detail: "Paint primer 20 L ×6, thinner ×10, brushes…", amount: 22900, requestedBy: "Mahesh (SV3)", requestedAt: h(50), unit: "SV3", href: "/purchase-approvals", actions: [{ id: "approve", label: "Approve", tone: "primary" }, { id: "query", label: "Query", noteRequired: true }, { id: "reject", label: "Reject", tone: "danger", noteRequired: true }] },
      { id: "stockadj:14", kind: "stock_adjust", title: "Stock count correction — CO2 gas cylinders DH2 (12 → 9)", detail: "Physical count differs; 3 cylinders returned to vendor without entry.", requestedBy: "Store DH2", requestedAt: h(9), unit: "DH2", href: "/stock-approvals", actions: [{ id: "approve", label: "Approve", tone: "primary" }, { id: "reject", label: "Reject", tone: "danger", noteRequired: true }] },
    ],
    flags: [
      { id: "lowstock:CH1", severity: "warning", kind: "low_stock", title: "9 items below minimum at CH1", detail: "Est. reorder ₹38,000", count: 9, unit: "CH1", href: "/reports" },
      { id: "lowstock:SV3", severity: "warning", kind: "low_stock", title: "5 items below minimum at SV3", count: 5, unit: "SV3", href: "/reports" },
      { id: "challan_nobill", severity: "warning", kind: "challan_without_bill", title: "4 challans older than 7 days without a bill", count: 4, href: "/approvals" },
      { id: "transfer:88", severity: "warning", kind: "transfer_in_transit", title: "Transfer CH1 → DH2 in transit for 3 days", since: h(72), href: "/transfers" },
      { id: "petty_awaiting", severity: "info", kind: "petty_awaiting_inward", title: "2 petty purchases awaiting inward", count: 2 },
    ],
    activity: [
      { id: "s1", at: h(0.5), actor: "Store CH1", text: "Issued 6 electrodes boxes to J-1041 (Ramesh)" },
      { id: "s2", at: h(2), actor: "Mahesh", text: "Created indent IND-SV3-019" },
      { id: "s3", at: h(4), actor: "Store DH2", text: "GRN #310 received — Ganesh Hardware ₹12,300" },
    ],
    messages: [
      { id: "sm1", at: h(3), from: "Store app", channel: "grn", text: "GRN #311 from Shree Welding Supplies awaits your approval (₹48,200)." },
      { id: "sm2", at: h(40), from: "Store app", channel: "error", text: "Client error on /issue page (TypeError) — 2 occurrences", unread: true },
    ],
    reports: [
      { id: "reports", title: "Store reports", href: "/reports", period: "this month" },
      { id: "machine", title: "Machine reports", href: "/machine-reports" },
      { id: "audit", title: "Audit log", href: "/admin/audit" },
    ],
  }),
  pettycash: () => ({
    version: FEED_VERSION, app: "pettycash", label: "Petty Cash", generatedAt: h(0),
    kpis: [
      { key: "waiting_count", label: "Waiting for approval", value: 6, tone: "warn", href: "/console/approvals" },
      { key: "waiting_amt", label: "Waiting amount", value: 23_450, unit: "₹" },
      { key: "street", label: "Cash on the street", value: 1_12_300, unit: "₹", href: "/console/people" },
      { key: "approved_month", label: "Approved this month", value: 2_84_900, unit: "₹", href: "/console/analysis" },
      { key: "reconcile", label: "Need reconcile", value: 1, tone: "bad" },
    ],
    approvals: [
      { id: "expense:1201", kind: "expense", title: "Diesel for crane — ₹4,800 (Ganesh)", detail: "Unit: SV3 · Payee: HP pump · Receipt photo ✓", amount: 4800, requestedBy: "Ganesh", requestedAt: h(2), unit: "SV3", href: "/console/approvals", actions: [{ id: "approve", label: "Approve", tone: "primary" }, { id: "query", label: "Query", noteRequired: true }, { id: "reject", label: "Reject", tone: "danger", noteRequired: true }] },
      { id: "expense:1198", kind: "expense", title: "Transport — ₹2,650 (Vikas)", detail: "Unit: DH2 · No receipt photo", amount: 2650, requestedBy: "Vikas", requestedAt: h(70), unit: "DH2", href: "/console/approvals", actions: [{ id: "approve", label: "Approve", tone: "primary" }, { id: "query", label: "Query", noteRequired: true }, { id: "reject", label: "Reject", tone: "danger", noteRequired: true }] },
      { id: "fund:33", kind: "fund_request", title: "Cash request ₹15,000 — Ganesh (SV3)", detail: "In hand ₹1,200. Needs cash for site consumables this week.", amount: 15000, requestedBy: "Ganesh", requestedAt: h(12), unit: "SV3", href: "/console/funds", actions: [{ id: "approve", label: "Approve", tone: "primary", amountEditable: true }, { id: "reject", label: "Reject", tone: "danger", noteRequired: true }] },
    ],
    flags: [
      { id: "reconcile:u7", severity: "warning", kind: "needs_reconcile", title: "Vikas has spent ₹1,850 more than given", detail: "In hand is negative; approve a top-up or reverse an entry.", href: "/console/people" },
      { id: "flag:91", severity: "warning", kind: "expense_flag", title: "Flag on expense #1187 by Admin (Priya)", detail: "\"Same bill number as #1180 — duplicate?\"", since: h(30), href: "/console/approvals", actions: [{ id: "resolve", label: "Resolve flag", noteRequired: true }] },
      { id: "undocumented", severity: "info", kind: "no_receipt", title: "7 approved purchases without a receipt photo (30 d)", count: 7, href: "/console/analysis" },
    ],
    activity: [
      { id: "p1", at: h(2), actor: "Ganesh", text: "Added expense Diesel for crane ₹4,800" },
      { id: "p2", at: h(12), actor: "Ganesh", text: "Requested cash ₹15,000" },
      { id: "p3", at: h(28), actor: "Priya", text: "Flagged expense #1187" },
    ],
    messages: [
      { id: "pm1", at: h(30), from: "Priya (admin)", channel: "flag", text: "Same bill number as #1180 — duplicate?", unread: true },
    ],
    reports: [
      { id: "analysis", title: "Spend analysis", href: "/console/analysis", period: "12 months" },
      { id: "reports", title: "Reports & export", href: "/console/reports" },
      { id: "people", title: "Cash in hand by person", href: "/console/people" },
    ],
  }),
  machines: () => ({
    version: FEED_VERSION, app: "machines", label: "Machines & Maintenance", generatedAt: h(0), units: ["CHINCHWAD_UNIT_1", "DEHU_UNIT_2", "SAVLI_UNIT_3"],
    kpis: [
      { key: "working", label: "Machines working", value: 61, tone: "good" },
      { key: "down", label: "Down / in repair", value: 4, tone: "bad", href: "/tickets" },
      { key: "open_tickets", label: "Open tickets", value: 7, href: "/tickets" },
      { key: "spend_month", label: "Spend this month", value: 1_38_500, unit: "₹", href: "/admin/reports" },
      { key: "downtime", label: "Downtime this month", value: 142, unit: "hrs", tone: "warn" },
    ],
    approvals: [
      { id: "quote:T-0231", kind: "quote", title: "Quote ₹28,500 — Plasma cutter M-014 (Hypertherm consumable kit + service)", detail: "Vendor: Precision Cut Services, 5 days. Flow: QUOTE.", amount: 28500, requestedBy: "Vikas (DH2)", requestedAt: h(18), unit: "DEHU_UNIT_2", href: "/approvals", actions: [{ id: "approve", label: "Approve quote", tone: "primary" }, { id: "query", label: "Ask question", noteRequired: true }] },
      { id: "req:17", kind: "machine_request", title: "Add machine — Magnetic drill (new, CH1)", detail: "Make: Metabo, purchase year 2026. Requested by Suresh.", requestedBy: "Suresh", requestedAt: h(40), unit: "CHINCHWAD_UNIT_1", href: "/approvals", actions: [{ id: "approve", label: "Approve", tone: "primary" }, { id: "reject", label: "Reject", tone: "danger", noteRequired: true }] },
    ],
    flags: [
      { id: "ticket:T-0228", severity: "critical", kind: "breakdown_open", title: "BREAKDOWN — Overhead crane 10 t (M-002) down 2 days", detail: "Hoist motor burnt. Vendor pickup done, awaiting quote.", since: h(50), unit: "CHINCHWAD_UNIT_1", href: "/tickets/T-0228" },
      { id: "alert:9", severity: "warning", kind: "repeat_alert", title: "Repeat problem: Angle grinder M-041 — 3 bearing failures in 30 days", since: h(10), href: "/admin", actions: [{ id: "checked", label: "Mark checked", noteRequired: true }] },
      { id: "overdue:T-0219", severity: "warning", kind: "vendor_return_overdue", title: "Vendor return overdue 6 days — Welding machine M-023", since: h(144), href: "/tickets/T-0219" },
      { id: "pm:SV3", severity: "info", kind: "pm_overdue", title: "8 machines overdue for preventive maintenance at Savli", count: 8, href: "/pm" },
      { id: "signoff", severity: "info", kind: "awaiting_signoff", title: "3 repaired machines awaiting supervisor sign-off", count: 3, href: "/tickets" },
    ],
    activity: [
      { id: "mc1", at: h(1), actor: "Vikas", text: "Quote received for T-0231 (₹28,500)" },
      { id: "mc2", at: h(6), actor: "Suresh", text: "Signed off T-0225 — Bench grinder M-033 repaired" },
    ],
    messages: [
      { id: "mm1", at: h(16), from: "Vikas", channel: "quote", text: "Answer on T-0231: yes, the old kit is beyond repair; vendor confirmed.", unread: true },
    ],
    reports: [
      { id: "dash", title: "Maintenance dashboard", href: "/admin" },
      { id: "cost", title: "Monthly cost per machine", href: "/admin/reports", period: "this month" },
      { id: "pm", title: "PM due list", href: "/pm" },
    ],
  }),
  epc: () => ({
    version: FEED_VERSION, app: "epc", label: "EPC Sites", generatedAt: h(0), units: ["Nagpur site", "Hazira site"],
    kpis: [
      { key: "present", label: "Site workers present", value: 42, hint: "planned 48", tone: "warn" },
      { key: "cash_street", label: "Cash on street", value: 86_000, unit: "₹", href: "/cash" },
      { key: "spend_month", label: "Site spend this month", value: 6_42_000, unit: "₹", href: "/expenses" },
      { key: "jobs_behind", label: "Jobs behind plan", value: 2, tone: "bad" },
      { key: "open_issues", label: "Open issues", value: 3, tone: "warn" },
    ],
    approvals: [
      { id: "expense:e77", kind: "expense", title: "Scaffolding hire ₹18,000 — Nagpur", detail: "Category: Equipment hire · Bill #442 · Paid from worker cash", amount: 18000, requestedBy: "Rakesh (site in-charge)", requestedAt: h(7), unit: "Nagpur site", href: "/expenses", actions: [{ id: "approve", label: "Approve", tone: "primary" }, { id: "query", label: "Query", noteRequired: true }, { id: "reject", label: "Reject", tone: "danger", noteRequired: true }] },
      { id: "petty:p12", kind: "petty_request", title: "Petty cash top-up ₹25,000 — Hazira", detail: "Balance ₹3,100, below threshold ₹10,000.", amount: 25000, requestedBy: "Imran", requestedAt: h(20), unit: "Hazira site", href: "/petty-cash", actions: [{ id: "approve", label: "Approve", tone: "primary" }, { id: "reject", label: "Reject", tone: "danger", noteRequired: true }] },
      { id: "indent:i5", kind: "indent", title: "Material indent — 9 lines (Hazira)", detail: "Welding rods, grinding discs, PPE.", requestedBy: "Imran", requestedAt: h(33), unit: "Hazira site", href: "/consumables", actions: [{ id: "approve", label: "Approve", tone: "primary" }, { id: "reject", label: "Reject", tone: "danger", noteRequired: true }] },
    ],
    flags: [
      { id: "issue:x1", severity: "critical", kind: "issue_open", title: "WORK STOPPED — Client hold at Nagpur (escalated)", detail: "Client QA has stopped erection pending drawing revision R3. 52 h old.", since: h(52), unit: "Nagpur site", href: "/issues" },
      { id: "behind:j2", severity: "warning", kind: "job_behind", title: "Hazira pipe rack 11% behind plan", unit: "Hazira site", href: "/jobs" },
      { id: "dpr:nagpur", severity: "warning", kind: "dpr_missing", title: "DPR missing for yesterday — Nagpur", unit: "Nagpur site", href: "/dpr" },
      { id: "petty_low:hazira", severity: "warning", kind: "petty_low", title: "Petty cash below threshold at Hazira (₹3,100)", unit: "Hazira site", href: "/petty-cash" },
      { id: "lowstock:hazira", severity: "info", kind: "low_stock", title: "4 consumables at reorder level — Hazira", count: 4, unit: "Hazira site" },
    ],
    activity: [
      { id: "e1", at: h(1), actor: "Rakesh", text: "Submitted DPR for Nagpur (3 Oct)" },
      { id: "e2", at: h(7), actor: "Rakesh", text: "Added expense Scaffolding hire ₹18,000" },
    ],
    messages: [
      { id: "em1", at: h(52), from: "Rakesh", channel: "issue", text: "Client QA stopped erection — needs drawing R3 from design office.", unread: true },
    ],
    reports: [
      { id: "dash", title: "Site dashboard", href: "/" },
      { id: "cash", title: "Cash holders", href: "/cash" },
      { id: "wages", title: "Wage sheets", href: "/wages" },
      { id: "audit", title: "Audit log", href: "/admin/audit" },
    ],
  }),
  portal: () => ({
    version: FEED_VERSION, app: "portal", label: "Labour Portal", generatedAt: h(0), units: ["CH1", "DH2", "SV3"],
    kpis: [
      { key: "leave_pending", label: "Leave requests", value: 2, href: "/admin/requests" },
      { key: "advance_pending", label: "Advance requests", value: 1, href: "/admin/advances" },
      { key: "details_pending", label: "Detail submissions", value: 3, href: "/admin/details" },
      { key: "complaints_open", label: "Open complaints", value: 1, tone: "bad", href: "/admin/complaints" },
      { key: "photo_cover", label: "Photo check-ins today", value: 71, hint: "of 86 punched", tone: "warn", href: "/admin/photos" },
    ],
    approvals: [
      { id: "leave:l9", kind: "leave_request", title: "Leave 7–12 Oct — Dinesh Pal (E-077)", detail: "Reason: village festival. Kind: leave.", requestedBy: "Dinesh Pal", requestedAt: h(15), unit: "CH1", href: "/admin/requests", actions: [{ id: "noted", label: "Noted / allow", tone: "primary" }, { id: "declined", label: "Decline", tone: "danger", noteRequired: true }] },
      { id: "advance:a4", kind: "advance_request", title: "Advance ₹2,000 — Mohan Lal (E-019)", detail: "Reason: rent.", amount: 2000, requestedBy: "Mohan Lal", requestedAt: h(4), unit: "SV3", href: "/admin/advances", actions: [{ id: "noted", label: "Noted", tone: "primary" }, { id: "declined", label: "Decline", tone: "danger", noteRequired: true }] },
      { id: "details:d3", kind: "detail_submission", title: "Bank details submitted — Arjun Singh (E-130)", requestedBy: "Arjun Singh", requestedAt: h(48), unit: "DH2", href: "/admin/details", actions: [{ id: "entered", label: "Mark entered", tone: "primary" }] },
    ],
    flags: [
      { id: "complaint:c2", severity: "warning", kind: "complaint_open", title: "Complaint from Mohan Lal: drinking water not available at SV3 shed", since: h(26), unit: "SV3", href: "/admin/complaints", actions: [{ id: "close", label: "Close with note", noteRequired: true }] },
      { id: "nophoto", severity: "warning", kind: "punched_no_photo", title: "15 workers punched in but no photo check-in today", count: 15, href: "/admin/photos" },
      { id: "locked", severity: "info", kind: "locked_accounts", title: "2 portal accounts locked after wrong PINs", count: 2 },
    ],
    activity: [
      { id: "pt1", at: h(0.7), actor: "admin@dh2", text: "Reset PIN for E-130" },
      { id: "pt2", at: h(4), actor: "Mohan Lal", text: "Requested advance ₹2,000" },
    ],
    messages: [
      { id: "pm1", at: h(26), from: "Mohan Lal", channel: "complaint", text: "Drinking water not available at SV3 shed since 2 days.", unread: true },
    ],
    reports: [
      { id: "photos", title: "Photo attendance", href: "/admin/photos", period: "today" },
      { id: "audit", title: "Portal audit log", href: "/admin/audit" },
    ],
  }),
  purchase: () => ({
    version: FEED_VERSION, app: "purchase", label: "Purchase & Material", generatedAt: h(0), units: ["CH1", "DH2", "SV3"],
    kpis: [
      { key: "plans_pending", label: "Plans pending", value: 2, tone: "warn", href: "/approvals" },
      { key: "ordered_kg", label: "Ordered this month", value: 48_200, unit: "kg" },
      { key: "received_kg", label: "Received this month", value: 31_900, unit: "kg" },
      { key: "bills_out", label: "Supplier bills outstanding", value: 14_80_000, unit: "₹", href: "/cashflow" },
      { key: "bills_overdue", label: "Overdue bills", value: 3_20_000, unit: "₹", tone: "bad", href: "/cashflow" },
      { key: "ai_spend", label: "AI spend this month", value: 1_240, unit: "₹" },
    ],
    approvals: [
      { id: "plan:pl-88", kind: "plan_approval", title: "Plan v2 — J-1044 Tata Projects (18.4 t plates, 3.1 t sections)", detail: "Dual sign-off done (Purchase: Nilesh, Supervisor: Suresh). 2 flagged rows resolved.", requestedBy: "Nilesh", requestedAt: h(22), unit: "CH1", href: "/approvals", actions: [{ id: "approve", label: "Approve plan", tone: "primary" }, { id: "send_back", label: "Send back", tone: "danger", noteRequired: true }] },
      { id: "quote:pl-85:q1", kind: "quote_choice", title: "Quote ₹9,84,000 — JSW Steel (7 days) for Plan J-1041", detail: "Alternatives: Essar ₹10,12,000 (4 days). Validity 10 Oct.", amount: 984000, requestedBy: "Nilesh", requestedAt: h(30), unit: "DH2", href: "/approvals", actions: [{ id: "choose", label: "Choose this quote", tone: "primary" }, { id: "send_back", label: "Send back", tone: "danger", noteRequired: true }] },
      { id: "quote:pl-85:q2", kind: "quote_choice", title: "Quote ₹10,12,000 — Essar (4 days) for Plan J-1041", detail: "Faster delivery, +₹28,000.", amount: 1012000, requestedBy: "Nilesh", requestedAt: h(30), unit: "DH2", href: "/approvals", actions: [{ id: "choose", label: "Choose this quote", tone: "primary" }] },
      { id: "mcr:5", kind: "material_change", title: "Material change — J-1040: 12 mm IS2062 → 12 mm E350", requestedBy: "Suresh", requestedAt: h(9), unit: "SV3", actions: [{ id: "approve", label: "Approve", tone: "primary" }, { id: "reject", label: "Reject", tone: "danger", noteRequired: true }] },
    ],
    flags: [
      { id: "receipt:r402", severity: "warning", kind: "receipt_flagged", title: "Over-receipt: 1,240 kg vs 1,000 kg planned — 10 mm plate, J-1039", since: h(14), unit: "CH1", href: "/admin/flags", actions: [{ id: "reviewed", label: "Mark reviewed" }] },
      { id: "bill:b77", severity: "warning", kind: "bill_overdue", title: "Bill #SB-2211 JSW ₹3,20,000 overdue 9 days", since: h(216), href: "/cashflow" },
      { id: "issue:i3", severity: "critical", kind: "production_issue", title: "Material shortage — J-1040 (synced from production)", since: h(31), unit: "SV3" },
      { id: "rate_missing", severity: "info", kind: "plates_rate_missing", title: "6 plates in yard without a rate", count: 6, href: "/yard" },
    ],
    activity: [
      { id: "pu1", at: h(2), actor: "Nilesh", text: "Submitted plan v2 for J-1044 for approval" },
      { id: "pu2", at: h(5), actor: "Store CH1", text: "Receipt: 2,400 kg 10 mm plate against PO-0199" },
    ],
    messages: [
      { id: "pum1", at: h(9), from: "Suresh", channel: "request", text: "Need E350 grade for J-1040 columns as per client revision.", unread: true },
    ],
    reports: [
      { id: "dash", title: "Purchase dashboard", href: "/admin" },
      { id: "cashflow", title: "Cashflow & bills", href: "/cashflow" },
      { id: "flags", title: "Flags", href: "/admin/flags" },
      { id: "yard", title: "Yard", href: "/yard" },
    ],
  }),
  gate: () => ({
    version: FEED_VERSION, app: "gate", label: "Security Gate", generatedAt: h(0), units: ["dehu", "savli"],
    kpis: [
      { key: "labour_inside", label: "Labour inside", value: 83 },
      { key: "visitors_inside", label: "Visitors inside", value: 4 },
      { key: "vehicles_inside", label: "Vehicles inside", value: 6 },
      { key: "visitors_today", label: "Visitors today", value: 11 },
      { key: "incidents", label: "Incidents (7 d)", value: 1, tone: "bad" },
    ],
    approvals: [
      { id: "labourer:l77", kind: "labourer_pending", title: "New person at gate — Rahul Verma (Contractor: Shiv Enterprises, Savli)", requestedBy: "Guard Pawan", requestedAt: h(1), unit: "savli", href: "/admin/labourers", actions: [{ id: "approve", label: "Approve", tone: "primary" }, { id: "reject", label: "Reject", tone: "danger", noteRequired: true }] },
    ],
    flags: [
      { id: "incident:9", severity: "critical", kind: "incident", title: "Injury reported at Dehu gate — minor hand cut", detail: "First aid given; worker sent to clinic.", since: h(20), unit: "dehu" },
      { id: "vehicle:v31", severity: "warning", kind: "vehicle_overstay", title: "MH-12-AB-4421 (material out) inside 5 h 20 m", since: h(5.3), unit: "dehu", href: "/admin" },
      { id: "double:dehu", severity: "warning", kind: "double_entry", title: "3 double IN/OUT entries today at Dehu", count: 3, unit: "dehu" },
      { id: "device:lock", severity: "info", kind: "device_locked", title: "1 guard phone locked after wrong PINs", count: 1 },
    ],
    activity: [
      { id: "g1", at: h(0.2), actor: "Guard Pawan", text: "Vehicle IN GJ-05-CD-1180 (raw material) — Savli" },
      { id: "g2", at: h(0.6), actor: "Guard Ramu", text: "Visitor IN: 2 persons from Tata Projects to meet Suresh — Dehu" },
    ],
    messages: [
      { id: "gm1", at: h(20), from: "Guard Ramu", channel: "incident", text: "Injury: minor hand cut while unloading; first aid given.", unread: true },
    ],
    reports: [
      { id: "live", title: "Live gate view", href: "/admin" },
      { id: "labourers", title: "Labourers register", href: "/admin/labourers" },
    ],
  }),
};

export function mockFeed(appKey: string, label: string): AdminFeed | null {
  const f = feeds[appKey]?.();
  if (!f) return null;
  f.label = label;
  f.approvals = f.approvals.filter((a) => !decided.has(`${appKey}:${a.id}`));
  f.flags = f.flags.filter((a) => !decided.has(`${appKey}:${a.id}`));
  return f;
}

export function mockAct(appKey: string, body: FeedActRequest): FeedActResponse {
  const id = body.approvalId ?? body.flagId;
  if (!id) return { ok: false, error: "Missing id" };
  const k = `${appKey}:${id}`;
  if (decided.has(k)) return { ok: false, error: "Already decided" };
  decided.add(k);
  return { ok: true, message: `Demo: '${body.actionId}' recorded on ${id}${body.amount ? ` for ₹${body.amount}` : ""}.` };
}
