import { test, expect } from "@playwright/test";

/**
 * Stable public page tests - safe for CI
 * These tests do not require authentication and should always pass.
 */
test.describe("Servers page (public)", () => {
  test("should display the servers list heading", async ({ page }) => {
    await page.goto("/servers");

    await expect(
      page.getByRole("heading", { name: /browse mcp servers/i, level: 1 })
    ).toBeVisible();
  });

  test("should have filter controls", async ({ page }) => {
    await page.goto("/servers");

    await expect(page.getByLabel(/search/i)).toBeVisible();
    await expect(page.getByLabel(/transport/i)).toBeVisible();
    await expect(page.getByLabel(/auth/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /apply filters/i })
    ).toBeVisible();
  });

  test("should display server cards or empty state", async ({ page }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    // Either show server cards or "no servers found" message
    const serverCards = page.locator('a[href^="/servers/"]');
    const noServersMessage = page.getByText(/no servers found/i);

    const hasCards = await serverCards
      .first()
      .isVisible()
      .catch(() => false);
    const hasNoServersMessage = await noServersMessage
      .isVisible()
      .catch(() => false);

    expect(hasCards || hasNoServersMessage).toBeTruthy();
  });

  test("should navigate to server detail when cards exist", async ({
    page,
  }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("should show clear filters button", async ({ page }) => {
    await page.goto("/servers");

    await expect(page.getByRole("link", { name: /clear/i })).toBeVisible();
  });
});

test.describe("Sign in page (public)", () => {
  test("should display sign in form", async ({ page }) => {
    await page.goto("/signin");

    await expect(
      page.getByRole("heading", { name: /sign in/i, level: 1 })
    ).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /send magic link/i })
    ).toBeVisible();
  });

  test("should have magic link instructions", async ({ page }) => {
    await page.goto("/signin");

    await expect(page.getByText(/magic link/i)).toBeVisible();
  });
});
