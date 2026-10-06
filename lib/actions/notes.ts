"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/session";
import { db } from "@/lib/db";

export async function addNoteAction(formData: FormData) {
  await requireOwner();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;
  const app = String(formData.get("app") ?? "").trim() || null;
  const dueRaw = String(formData.get("dueAt") ?? "");
  const dueAt = dueRaw ? new Date(dueRaw) : null;
  await db.ownerNote.create({ data: { text, app, dueAt: dueAt && !Number.isNaN(dueAt.getTime()) ? dueAt : null, pinned: formData.get("pinned") === "on" } });
  revalidatePath("/", "layout");
}

export async function toggleNoteAction(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  if (!id || (field !== "done" && field !== "pinned")) return;
  const n = await db.ownerNote.findUnique({ where: { id } });
  if (!n) return;
  await db.ownerNote.update({ where: { id }, data: { [field]: !n[field] } });
  revalidatePath("/", "layout");
}

export async function deleteNoteAction(formData: FormData) {
  await requireOwner();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.ownerNote.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/", "layout");
}
