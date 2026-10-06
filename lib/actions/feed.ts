"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { getApp } from "@/lib/feed/registry";
import { actOnApp } from "@/lib/feed/act";
import { invalidateFeedCache } from "@/lib/feed/fetch";
import { db } from "@/lib/db";

export type ActState = { ok: boolean; message?: string; error?: string; id?: string } | null;

/** Approve / reject / resolve: forwards to the source app and logs the outcome. */
export async function actAction(_prev: ActState, formData: FormData): Promise<ActState> {
  const owner = await requireOwner();
  const appKey = String(formData.get("app") ?? "");
  const approvalId = String(formData.get("approvalId") ?? "") || undefined;
  const flagId = String(formData.get("flagId") ?? "") || undefined;
  const actionId = String(formData.get("actionId") ?? "");
  const title = String(formData.get("title") ?? "");
  const note = String(formData.get("note") ?? "").trim() || undefined;
  const noteRequired = formData.get("noteRequired") === "1";
  const amountRaw = String(formData.get("amount") ?? "").replace(/[^\d.]/g, "");
  const amount = amountRaw ? Number(amountRaw) : undefined;
  const id = approvalId ?? flagId;

  if (!appKey || !id || !actionId) return { ok: false, error: "Incomplete request.", id };
  if (noteRequired && !note) return { ok: false, error: "A note is required for this action.", id };
  if (amount !== undefined && (!Number.isFinite(amount) || amount <= 0)) return { ok: false, error: "Enter a valid amount.", id };

  const app = await getApp(appKey);
  if (!app) return { ok: false, error: "Unknown app.", id };

  const result = await actOnApp({ app, approvalId, flagId, actionId, title, note, amount, actor: owner });
  revalidatePath("/", "layout");
  return { ...result, id };
}

/** Hide a flag on this dashboard only (the source app is untouched). */
export async function ackFlagAction(formData: FormData) {
  const owner = await requireOwner();
  const app = String(formData.get("app") ?? "");
  const flagId = String(formData.get("flagId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const hours = Number(formData.get("hours") ?? 0);
  if (!app || !flagId) return;
  const until = hours > 0 ? new Date(Date.now() + hours * 36e5) : null;
  await db.flagAck.upsert({
    where: { app_flagId: { app, flagId } },
    create: { app, flagId, ackedBy: owner.email, note, until },
    update: { ackedBy: owner.email, ackedAt: new Date(), note, until },
  });
  revalidatePath("/", "layout");
}

export async function unackFlagAction(formData: FormData) {
  await requireOwner();
  const app = String(formData.get("app") ?? "");
  const flagId = String(formData.get("flagId") ?? "");
  if (!app || !flagId) return;
  await db.flagAck.deleteMany({ where: { app, flagId } });
  revalidatePath("/", "layout");
}

export async function refreshAction() {
  await requireOwner();
  invalidateFeedCache();
  revalidatePath("/", "layout");
}
