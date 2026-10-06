import bcrypt from "bcryptjs";
import type { Owner } from "@/lib/session";

// Who may log in to the owner dashboard.
//
// 1. The owner account from env: OWNER_EMAIL + OWNER_PASSWORD_HASH (bcrypt)
//    or, for a quick start, OWNER_PASSWORD in plain text.
// 2. Optionally, any SUPERADMIN of the production app: when
//    PRODUCTION_APP_URL + PRODUCTION_INTEGRATION_KEY are set, the password is
//    checked against production's /api/integration/verify-login, so the owner
//    has one password everywhere. Only role SUPERADMIN is accepted.

export type LoginResult = { ok: true; owner: Owner } | { ok: false; error: string };

export async function login(emailRaw: string, password: string): Promise<LoginResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!email || !password) return { ok: false, error: "Enter your email and password." };

  const envEmail = (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
  if (envEmail && email === envEmail) {
    const hash = process.env.OWNER_PASSWORD_HASH;
    const plain = process.env.OWNER_PASSWORD;
    const good = hash ? await bcrypt.compare(password, hash) : plain ? password === plain : false;
    if (good) return { ok: true, owner: { email, name: process.env.OWNER_NAME || "Owner" } };
    if (!hash && !plain) {
      return { ok: false, error: "OWNER_PASSWORD_HASH (or OWNER_PASSWORD) is not set on the server." };
    }
    // Wrong password for the env owner: still allow the production check below.
  }

  const prodUrl = (process.env.PRODUCTION_APP_URL ?? "").replace(/\/$/, "");
  const prodKey = process.env.PRODUCTION_INTEGRATION_KEY;
  if (prodUrl && prodKey) {
    try {
      const res = await fetch(`${prodUrl}/api/integration/verify-login`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-integration-key": prodKey },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });
      if (res.ok) {
        const data = (await res.json()) as { ok?: boolean; name?: string; role?: string };
        if (data.ok && data.role === "SUPERADMIN") {
          return { ok: true, owner: { email, name: data.name || "Owner" } };
        }
        if (data.ok) return { ok: false, error: "Only the owner (SUPERADMIN) can open this dashboard." };
      }
    } catch (e) {
      console.error("[auth] production verify-login failed:", e);
    }
  }

  return { ok: false, error: "Wrong email or password." };
}
