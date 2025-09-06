import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";

const AUTH_URL =
  process.env.NODE_ENV === "production"
    ? "https://<YOUR_APP_URL>.pages.dev"
    : "http://localhost:3000";

// データベースインスタンスを動的に生成する関数
const getDb = (env: { DB: D1Database }) => {
  return drizzle(env.DB, { schema });
};

export const auth = betterAuth({
  database: drizzleAdapter(getDb({ DB: process.env.DB as any }), {
    provider: "sqlite",
    usePlural: true,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  secret: process.env.AUTH_SECRET,
  baseURL: AUTH_URL,
});
