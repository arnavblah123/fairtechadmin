import { redirect } from "next/navigation";
import { getOwner } from "@/lib/session";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getOwner()) redirect("/");
  const { next } = await searchParams;
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="card w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white grid place-items-center font-black">F</div>
          <div>
            <div className="font-bold text-lg leading-tight">Fairtech Owner</div>
            <div className="text-sm text-slate-500">Every app, one screen</div>
          </div>
        </div>
        <LoginForm next={next ?? "/"} />
        <p className="text-xs text-slate-400 mt-6">
          Owner only. Use the owner password set on this dashboard, or your Production app (SUPERADMIN) login if connected.
        </p>
      </div>
    </main>
  );
}
