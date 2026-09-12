import { expect, test } from "@playwright/test";
import { BASE_URL } from "./constants";

test("shows a hello-world greeting and a working sign-in dialog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /hello world/i })).toBeVisible();

  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Sign in", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Continue with Google" })).toBeEnabled();
  await expect(dialog.getByLabel("Email")).toBeVisible();
});

test("sign-in button redirects to Google", async ({ page }) => {
  // Stub the provider so the test never leaves localhost.
  await page.route(/accounts\.google\.com/, (route) =>
    route.fulfill({ contentType: "text/html", body: "stub provider" }),
  );

  await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await page.waitForURL(/accounts\.google\.com/);
  const google = new URL(page.url());
  expect(google.searchParams.get("client_id")).toBe("e2e-google-client");
  expect(google.searchParams.get("redirect_uri")).toBe(`${BASE_URL}/api/auth/callback/google`);
  expect(google.searchParams.get("state")).toBeTruthy();
});

test("email sign-in shows a confirmation without RESEND_API_KEY configured", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Sign in", exact: true });

  await dialog.getByLabel("Email").fill("visitor@example.com");
  await dialog.getByRole("button", { name: "Continue with email" }).click();

  await expect(page.getByRole("status")).toContainText("visitor@example.com");
});
