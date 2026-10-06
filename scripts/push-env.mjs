#!/usr/bin/env node
// Push the owner-dashboard environment to every Vercel project in one go.
//
//   VERCEL_TOKEN=xxx node scripts/push-env.mjs deploy.env
//
// deploy.env is a plain KEY=VALUE file (see deploy.env.example). Lines are
// pushed to the fairtechadmin project; ADMIN_FEED_KEY is also pushed to every
// project listed in FEED_PROJECTS. Existing values are overwritten (upsert).
// Optional: VERCEL_TEAM_ID (or VERCEL_TEAM_SLUG) when the projects live in a
// team; CREATE_ADMIN_PROJECT=1 creates the fairtechadmin project from GitHub
// if it does not exist yet.
//
// Needs a Vercel token with access to the account/team that owns the projects:
// https://vercel.com/account/tokens  →  Create  →  scope: the team, expiry: your call.

import fs from "node:fs";

const token = process.env.VERCEL_TOKEN;
if (!token) die("VERCEL_TOKEN is not set. Create one at https://vercel.com/account/tokens");
const file = process.argv[2] ?? "deploy.env";
if (!fs.existsSync(file)) die(`${file} not found. Copy deploy.env.example to ${file} and fill it in.`);

const vars = parseEnv(fs.readFileSync(file, "utf8"));
const adminProject = vars.ADMIN_PROJECT || "fairtechadmin";
const feedProjects = (vars.FEED_PROJECTS || "").split(",").map((s) => s.trim()).filter(Boolean);
const skip = new Set(["ADMIN_PROJECT", "FEED_PROJECTS"]);
const team = process.env.VERCEL_TEAM_ID ? `teamId=${process.env.VERCEL_TEAM_ID}` : process.env.VERCEL_TEAM_SLUG ? `slug=${process.env.VERCEL_TEAM_SLUG}` : "";

const api = async (path, init = {}) => {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`https://api.vercel.com${path}${team ? sep + team : ""}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
};

async function findProject(name) {
  const r = await api(`/v9/projects/${encodeURIComponent(name)}`);
  return r.ok ? r.body : null;
}

async function createAdminProject() {
  const r = await api(`/v11/projects`, {
    method: "POST",
    body: JSON.stringify({ name: adminProject, framework: "nextjs", gitRepository: { type: "github", repo: vars.ADMIN_REPO || "arnavblah123/fairtechadmin" } }),
  });
  if (!r.ok) die(`Could not create project ${adminProject}: ${r.status} ${JSON.stringify(r.body.error || r.body)}`);
  console.log(`created project ${adminProject} from GitHub`);
  return r.body;
}

async function upsert(project, entries) {
  const payload = entries.map(([key, value]) => ({ key, value, type: "encrypted", target: ["production", "preview", "development"] }));
  const r = await api(`/v10/projects/${project.id}/env?upsert=true`, { method: "POST", body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(`${project.name}: ${r.status} ${JSON.stringify(r.body.error || r.body)}`);
  const failed = (r.body.failed || []).map((f) => `${f.error?.key}: ${f.error?.message}`);
  return { created: (r.body.created || []).length, failed };
}

(async () => {
  // 1. The dashboard itself: everything in the file except the control keys.
  let admin = await findProject(adminProject);
  if (!admin && process.env.CREATE_ADMIN_PROJECT === "1") admin = await createAdminProject();
  if (!admin) die(`Vercel project "${adminProject}" not found. Import the repo at https://vercel.com/new (or rerun with CREATE_ADMIN_PROJECT=1).`);
  const adminEntries = Object.entries(vars).filter(([k, v]) => !skip.has(k) && v !== "");
  const a = await upsert(admin, adminEntries);
  console.log(`${adminProject}: ${adminEntries.length} variables pushed${a.failed.length ? `, failed: ${a.failed.join("; ")}` : ""}`);

  // 2. Every app that serves a feed: only the shared key.
  if (!vars.ADMIN_FEED_KEY) die("ADMIN_FEED_KEY is empty in the env file.");
  for (const name of feedProjects) {
    const p = await findProject(name);
    if (!p) {
      console.log(`${name}: not found on Vercel (skipped) — add ADMIN_FEED_KEY there by hand`);
      continue;
    }
    try {
      const r = await upsert(p, [["ADMIN_FEED_KEY", vars.ADMIN_FEED_KEY]]);
      console.log(`${name}: ADMIN_FEED_KEY set${r.failed.length ? ` (${r.failed.join("; ")})` : ""}`);
    } catch (e) {
      console.log(`${name}: ${e.message}`);
    }
  }
  console.log("\nDone. Redeploy each app so the new variables take effect (Vercel → Deployments → Redeploy, or push a commit).");
})().catch((e) => die(e.message));

function parseEnv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    out[key] = value;
  }
  return out;
}

function die(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}
