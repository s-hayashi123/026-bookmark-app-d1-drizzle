"use server";

import { getAuth } from "@/lib/auth";
import { getDBFromCloudflare } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function addBookmark(formData: FormData) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const url = formData.get("url") as string;
  const title = formData.get("title") as string;

  if (!url || !title) {
    throw new Error("URL and title are required");
  }

  const db = getDBFromCloudflare();
  await db.insert(bookmarks).values({
    userId: session.user.id,
    url,
    title,
  });

  revalidatePath("/dashboard");
}

export async function deleteBookmark(id: number) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const db = getDBFromCloudflare();

  await db.delete(bookmarks).where(eq(bookmarks.id, id));

  revalidatePath("/dashboard");
}
