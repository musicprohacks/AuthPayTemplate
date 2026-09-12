export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { migrateAuthSchema } = await import("./lib/migrate");
    await migrateAuthSchema();
  }
}
