import { AuthButtons } from "@/components/auth-components";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/lib/db/schema";

function getDbFromCloudflare() {
  const { env } = getCloudflareContext();
  const DB = (env as Record<string, unknown>)._026_db as D1Database;
  return drizzle(DB, { schema });
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Bookmark APpp</h1>
      <AuthButtons />
    </main>
  );
}
