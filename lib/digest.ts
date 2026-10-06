import type { Overview } from "@/lib/feed/aggregate";
import { fmtDate, inr, timeAgo, todayIST } from "@/lib/format";

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

/** Plain-text + HTML morning digest for the owner. */
export function buildDigest(o: Overview, dashboardUrl: string): { subject: string; html: string; text: string } {
  const t = o.totals;
  const subject = `Fairtech morning brief — ${t.pendingApprovals} approvals, ${t.critical} critical, ${t.appsDown ? `${t.appsDown} app${t.appsDown > 1 ? "s" : ""} down` : "all apps up"}`;

  const lines: string[] = [];
  lines.push(`Fairtech owner brief · ${todayIST()}`);
  lines.push("");
  lines.push(`Approvals waiting: ${t.pendingApprovals} (${inr(t.pendingAmount)})`);
  lines.push(`Critical flags: ${t.critical} · Warnings: ${t.warning} · Unread messages: ${t.unreadMessages}`);
  if (t.appsDown) lines.push(`Apps not answering: ${o.statuses.filter((s) => !s.ok).map((s) => `${s.app.label} (${s.error})`).join("; ")}`);
  lines.push("");
  if (o.approvals.length) {
    lines.push("NEEDS YOUR DECISION");
    for (const a of o.approvals.slice(0, 15)) lines.push(`• [${a.app.label}] ${a.title}${a.amount ? ` — ${inr(a.amount)}` : ""} · ${timeAgo(a.requestedAt)}`);
    if (o.approvals.length > 15) lines.push(`… and ${o.approvals.length - 15} more`);
    lines.push("");
  }
  const crit = o.flags.filter((f) => f.severity !== "info");
  if (crit.length) {
    lines.push("FLAGS");
    for (const f of crit.slice(0, 15)) lines.push(`• ${f.severity === "critical" ? "!!" : "!"} [${f.app.label}] ${f.title}${f.since ? ` · since ${fmtDate(f.since)}` : ""}`);
    lines.push("");
  }
  const kpis = o.kpis.filter((k) => k.tone === "bad" || k.tone === "warn");
  if (kpis.length) {
    lines.push("NUMBERS TO WATCH");
    for (const k of kpis.slice(0, 10)) lines.push(`• [${k.app.label}] ${k.label}: ${k.value}${k.unit && k.unit !== "₹" ? ` ${k.unit}` : ""}${k.hint ? ` (${k.hint})` : ""}`);
    lines.push("");
  }
  lines.push(`Open the dashboard: ${dashboardUrl}`);
  const text = lines.join("\n");

  const row = (s: string) => `<li style="margin:4px 0">${s}</li>`;
  const html = `<!doctype html><html><body style="font-family:system-ui,Segoe UI,Roboto,sans-serif;color:#111;max-width:640px;margin:0 auto;padding:16px">
<h2 style="margin:0 0 4px">Fairtech owner brief</h2>
<div style="color:#555;margin-bottom:16px">${esc(todayIST())}</div>
<table style="border-collapse:collapse;width:100%;margin-bottom:16px">
<tr><td style="padding:8px;background:#f3f4f6"><b>${t.pendingApprovals}</b> approvals<br><span style="color:#555">${esc(inr(t.pendingAmount))}</span></td>
<td style="padding:8px;background:#fee2e2"><b>${t.critical}</b> critical</td>
<td style="padding:8px;background:#fef3c7"><b>${t.warning}</b> warnings</td>
<td style="padding:8px;background:#e0e7ff"><b>${t.unreadMessages}</b> unread</td></tr></table>
${t.appsDown ? `<p style="color:#b91c1c"><b>Not answering:</b> ${esc(o.statuses.filter((s) => !s.ok).map((s) => `${s.app.label} (${s.error})`).join("; "))}</p>` : ""}
${o.approvals.length ? `<h3>Needs your decision</h3><ul style="padding-left:18px">${o.approvals.slice(0, 15).map((a) => row(`<b>${esc(a.app.label)}</b> · ${esc(a.title)}${a.amount ? ` — ${esc(inr(a.amount))}` : ""} <span style="color:#777">${esc(timeAgo(a.requestedAt))}</span>`)).join("")}</ul>` : "<p>No approvals waiting. 🎉</p>"}
${crit.length ? `<h3>Flags</h3><ul style="padding-left:18px">${crit.slice(0, 15).map((f) => row(`<span style="color:${f.severity === "critical" ? "#b91c1c" : "#b45309"}">●</span> <b>${esc(f.app.label)}</b> · ${esc(f.title)}${f.since ? ` <span style="color:#777">since ${esc(fmtDate(f.since))}</span>` : ""}`)).join("")}</ul>` : ""}
${kpis.length ? `<h3>Numbers to watch</h3><ul style="padding-left:18px">${kpis.slice(0, 10).map((k) => row(`<b>${esc(k.app.label)}</b> · ${esc(k.label)}: <b>${esc(String(k.value))}${k.unit && k.unit !== "₹" ? ` ${esc(k.unit)}` : ""}</b>${k.hint ? ` <span style="color:#777">(${esc(k.hint)})</span>` : ""}`)).join("")}</ul>` : ""}
<p style="margin-top:24px"><a href="${esc(dashboardUrl)}" style="background:#111;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Open the dashboard</a></p>
</body></html>`;
  return { subject, html, text };
}
