"use server";

import { redirect } from "next/navigation";
import { login } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  const result = await login(email, password);
  if (!result.ok) return { error: result.error };
  await createSession(result.owner);
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
