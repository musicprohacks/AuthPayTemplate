import { getMigrations } from "better-auth/db/migration";
import { auth } from "./auth";

/** Creates or updates Better Auth's tables (user, session, account, verification). */
export async function migrateAuthSchema() {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
}
