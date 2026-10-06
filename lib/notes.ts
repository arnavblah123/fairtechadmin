import { db } from "@/lib/db";
import type { OwnerNote } from "@prisma/client";

export async function listNotes(opts: { openOnly?: boolean; limit?: number } = {}): Promise<OwnerNote[]> {
  try {
    return await db.ownerNote.findMany({
      where: opts.openOnly ? { done: false } : undefined,
      orderBy: [{ done: "asc" }, { pinned: "desc" }, { dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
      take: opts.limit,
    });
  } catch (e) {
    console.error("[notes] read failed:", (e as Error).message);
    return [];
  }
}
