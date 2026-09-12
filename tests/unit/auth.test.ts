import { describe, expect, it } from "vitest";
import { auth, enabledProviders } from "@/lib/auth";

describe("auth config", () => {
  it("enables google when credentials are set", () => {
    // vitest.config.mts sets GOOGLE_CLIENT_ID/SECRET for the test env.
    expect(enabledProviders.google).toBe(true);
  });

  it("registers the magic-link plugin", () => {
    const ids = auth.options.plugins?.map((p) => p.id) ?? [];
    expect(ids).toContain("magic-link");
  });
});
