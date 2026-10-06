// Edge-safe session helpers (no Prisma): middleware imports this file.
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "fairtech_admin_session";

const rawSecret = process.env.SESSION_SECRET;
const missingInProduction = !rawSecret && process.env.NODE_ENV === "production";

const SECRET_MISSING =
  "SESSION_SECRET is not set. Refusing to sign login cookies with a " +
  "publicly-known fallback — add SESSION_SECRET (e.g. `openssl rand -hex 32`) and redeploy.";

if (missingInProduction) console.error(`[session] ${SECRET_MISSING}`);

const secret = new TextEncoder().encode(rawSecret ?? "dev-secret-change-me");

export type SessionPayload = { email: string; name: string };

export async function signSessionToken(p: SessionPayload): Promise<string> {
  if (missingInProduction) throw new Error(SECRET_MISSING);
  return new SignJWT({ email: p.email, name: p.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (missingInProduction) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.email === "string" && typeof payload.name === "string") {
      return { email: payload.email, name: payload.name };
    }
    return null;
  } catch {
    return null;
  }
}
