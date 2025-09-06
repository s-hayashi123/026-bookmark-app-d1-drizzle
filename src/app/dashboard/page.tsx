import { addBookmark, deleteBookmark } from "@/app/actions";
import { AuthButtons } from "@/components/auth-components";
import { getDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { bookmarks } from "@/lib/db/schema";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const db = getDB({ DB: process.env.DB as any });
  const userBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, session.user.id),
    orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
  });

  return (
    <div className="max-w-2xl mx-auto p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Bookmarks</h1>
        <AuthButtons />
      </header>

      {/* ブックマーク追加フォーム: 送信時に`addBookmark`サーバーアクションが実行される */}
      <form action={addBookmark} className="mb-8 p-4 border rounded-md">
        <h2 className="text-lg font-semibold mb-2">Add New Bookmark</h2>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            name="title"
            placeholder="Title"
            required
            className="p-2 border rounded-md"
          />
          <input
            type="url"
            name="url"
            placeholder="https://example.com"
            required
            className="p-2 border rounded-md"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </form>

      {/* ブックマーク一覧 */}
      <div className="space-y-4">
        {userBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="p-4 border rounded-md flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{bookmark.title}</h3>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:underline"
              >
                {bookmark.url}
              </a>
            </div>
            {/* 削除ボタン: 送信時に`deleteBookmark`サーバーアクションが実行される */}
            <form action={deleteBookmark.bind(null, bookmark.id)}>
              <button type="submit" className="text-red-500 hover:text-red-700">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
