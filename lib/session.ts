import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { COOKIE_NAME, signSessionToken, verifySessionToken, type SessionPayload } from "@/lib/session-token";

export type Owner = SessionPayload;

export async function createSession(owner: Owner) {
  const token = await signSessionToken(owner);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export const getOwner = cache(async (): Promise<Owner | null> => {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
});

export async function requireOwner(): Promise<Owner> {
  const owner = await getOwner();
  if (!owner) redirect("/login");
  return owner;
}
