import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const AUTH_URL = "http://localhost:8787";
// process.env.NODE_ENV === "production"
//   ? "https://026-bookmark-app-d1-drizzle.pages.dev"
//   : "http://localhost:8787";

function getDbFromCloudflare() {
  const { env } = getCloudflareContext();
  const DB = (env as Record<string, unknown>)._026_db as D1Database; // wrangler.jsoncのbinding名
  return drizzle(DB, { schema });
}

let _auth: ReturnType<typeof betterAuth> | null = null;

export function getAuth() {
  if (_auth) return _auth;
  const db = getDbFromCloudflare();
  _auth = betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite", usePlural: true }),
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
    secret: process.env.AUTH_SECRET,
    baseURL: AUTH_URL,
  });
  return _auth;
}
