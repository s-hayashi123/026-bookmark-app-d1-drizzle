"use server";

import { auth } from "@/lib/auth";
import { getDB } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addBookmark(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const url = formData.get("url") as string;
  const title = formData.get("title") as string;

  if (!url || !title) {
    throw new Error("URL and tile are required");
  }

  const db = getDB({ DB: process.env.DB as any });
  await db.insert(bookmarks).values({
    userId: session.user.id,
    url,
    title,
  });

  revalidatePath("/dashboard");
}

export async function deleteBookmark(id: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const db = getDB({ DB: process.env.DB as any });

  await db.delete(bookmarks).where(eq(bookmarks.id, id));

  revalidatePath("/dashboard");
}
