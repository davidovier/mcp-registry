import { test, expect } from "@playwright/test";

/**
 * Auth-dependent tests - may be skipped in CI
 *
 * These tests verify protected routes redirect properly.
 * They don't require a real authenticated session, but behavior
 * may vary based on environment configuration.
 *
 * To run only in local development:
 *   pnpm test:e2e e2e/auth.spec.ts
 *
 * Skip in CI by setting: CI_SKIP_AUTH_TESTS=true
 */

const skipInCI = process.env.CI_SKIP_AUTH_TESTS === "true";

test.describe("Protected routes (unauthenticated)", () => {
  test.skip(skipInCI, "Skipped in CI - auth tests can be flaky");

  test("should redirect /submit to signin", async ({ page }) => {
    await page.goto("/submit");

    // Should redirect to signin with next parameter
    await expect(page).toHaveURL(/\/signin/);
  });

  test("should redirect /my/submissions to signin", async ({ page }) => {
    await page.goto("/my/submissions");

    await expect(page).toHaveURL(/\/signin/);
  });

  test("should redirect /admin/submissions when not admin", async ({
    page,
  }) => {
    await page.goto("/admin/submissions");

    // Should redirect (either to signin or home, depending on auth state)
    await expect(page).not.toHaveURL(/\/admin\/submissions$/);
  });
});

test.describe("Header navigation (unauthenticated)", () => {
  test.skip(skipInCI, "Skipped in CI - auth tests can be flaky");

  test("should show Sign In button when logged out", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("should not show Submit link when logged out", async ({ page }) => {
    await page.goto("/");

    // Submit link should not be visible for unauthenticated users
    const submitLink = page.getByRole("link", { name: /^submit$/i });
    await expect(submitLink).not.toBeVisible();
  });

  test("should not show Admin link when logged out", async ({ page }) => {
    await page.goto("/");

    const adminLink = page.getByRole("link", { name: /admin/i });
    await expect(adminLink).not.toBeVisible();
  });
});
