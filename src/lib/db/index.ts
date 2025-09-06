import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const getDB = (env: { DB: D1Database }) => {
  const db = drizzle(env.DB, { schema });
  return db;
};
