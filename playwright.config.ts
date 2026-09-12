import { defineConfig, devices } from "@playwright/test";
import { BASE_URL, E2E_DB, E2E_SECRET } from "./tests/e2e/constants";

export default defineConfig({
  testDir: "tests/e2e",
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Fresh database for every run.
    command: `rm -f ${E2E_DB} ${E2E_DB}-shm ${E2E_DB}-wal && next dev --port ${new URL(BASE_URL).port}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_PATH: E2E_DB,
      BETTER_AUTH_SECRET: E2E_SECRET,
      BETTER_AUTH_URL: BASE_URL,
      // Dummy credentials: enough to build provider redirect URLs.
      GOOGLE_CLIENT_ID: "e2e-google-client",
      GOOGLE_CLIENT_SECRET: "e2e-google-secret",
      // Explicitly unset so a real key in .env.local doesn't leak into e2e —
      // the email sender then falls back to logging the link.
      RESEND_API_KEY: "",
    },
  },
});
