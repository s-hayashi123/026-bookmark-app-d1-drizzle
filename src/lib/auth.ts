import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const AUTH_URL =
  process.env.NODE_ENV === "production"
    ? "https://026-bookmark-app-d1-drizzle.pages.dev"
    : "http://localhost:3000";

// データベースインスタンスを動的に生成する関数
const getDb = (env: { DB: D1Database }) => {
  return drizzle(env.DB, { schema });
};

// OpenNext Cloudflare から D1 バインディングを取得
const getDbFromCloudflare = () => {
  const { env } = getCloudflareContext();
  const db = (env as any)._026_db as D1Database; // see wrangler.jsonc d1_databases.binding
  return getDb({ DB: db });
};

export const auth = betterAuth({
  adapter: drizzleAdapter(getDbFromCloudflare(), {
    provider: "sqlite",
    usePlural: true,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  secret: process.env.AUTH_SECRET,
  baseURL: AUTH_URL,
});

// ランタイムでデータベースを取得する関数
export const getDbInstance = (env: { DB: D1Database }) => {
  return getDb(env);
};
