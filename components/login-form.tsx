"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input className="input mt-1" type="email" name="email" autoComplete="username" required autoFocus inputMode="email" />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <input className="input mt-1" type="password" name="password" autoComplete="current-password" required />
      </label>
      {state?.error && <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{state.error}</div>}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
