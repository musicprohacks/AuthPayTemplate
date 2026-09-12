import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// Reuse one connection across dev hot reloads.
const globalForDb = globalThis as unknown as { __helloWorldDb?: Database.Database };

function open(): Database.Database {
  const file =
    process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "app.db");
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }

  const db = new Database(file);
  db.pragma("journal_mode = WAL");

  // Better Auth manages its own tables (user, session, account, verification)
  // — see migrate.ts.
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_credits (
      user_id TEXT PRIMARY KEY,
      balance INTEGER NOT NULL DEFAULT 0,
      stripe_customer_id TEXT UNIQUE,
      updated_at INTEGER NOT NULL
    );

    -- Stripe event IDs already applied, so retried webhooks don't double-grant credits.
    CREATE TABLE IF NOT EXISTS processed_stripe_events (
      event_id TEXT PRIMARY KEY,
      processed_at INTEGER NOT NULL
    );
  `);

  return db;
}

export const db = (globalForDb.__helloWorldDb ??= open());
