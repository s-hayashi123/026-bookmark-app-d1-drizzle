import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const getDB = (env: { DB: D1Database }) => drizzle(env.DB, { schema });

export const getDBFromCloudflare = () => {
  const { env } = getCloudflareContext();
  const DB = (env as any)._026_db as D1Database; // wrangler.jsonc の binding 名
  return drizzle(DB, { schema });
};
