import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * Singleton Postgres pool + Drizzle client. The pool is cached on globalThis in
 * development so Next.js hot-reloads do not exhaust connections.
 */
const globalForDb = globalThis as unknown as {
  __avokadoPool?: Pool;
};

const pool =
  globalForDb.__avokadoPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: env.NODE_ENV === "production" ? 10 : 5,
  });

if (env.NODE_ENV !== "production") {
  globalForDb.__avokadoPool = pool;
}

export const db = drizzle(pool, { schema, casing: "snake_case" });
export { schema };
export type Database = typeof db;
