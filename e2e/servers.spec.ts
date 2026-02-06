import { test, expect } from "@playwright/test";

/**
 * Stable public page tests - safe for CI
 * These tests do not require authentication and should always pass.
 */
test.describe("Servers page (public)", () => {
  test("should display the hero heading and search", async ({ page }) => {
    await page.goto("/servers");

    await expect(
      page.getByRole("heading", {
        name: /mcp server registry/i,
        level: 1,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("searchbox", { name: /search servers/i })
    ).toBeVisible();
  });

  test("should display server cards or empty state", async ({ page }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // Either server cards exist or the empty state is shown
    const hasCards = await page
      .locator('a[href^="/servers/"]')
      .first()
      .isVisible()
      .catch(() => false);

    if (!hasCards) {
      // In CI (no DB), error state shows; locally, empty state shows
      const hasEmptyOrError = await page
        .getByText(/no servers found|failed to load/i)
        .first()
        .isVisible()
        .catch(() => false);
      expect(hasEmptyOrError).toBeTruthy();
    }
  });

  test("should have filter sidebar on desktop", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/servers");

    // Scope to aside to avoid matching mobile dialog elements
    const sidebar = page.locator("aside");
    await expect(sidebar.getByText("Transport")).toBeVisible();
    await expect(sidebar.getByText("Authentication")).toBeVisible();
    await expect(sidebar.getByText("Verified only")).toBeVisible();
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

  test("should filter by verified and change URL", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    // Click the Verified only checkbox in the sidebar
    const verifiedCheckbox = page.locator("aside").getByText("Verified only");
    await verifiedCheckbox.click();

    // URL should now contain verified=true
    await expect(page).toHaveURL(/verified=true/);
  });

  test("should show mobile filter button on small viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/servers");

    await expect(page.getByRole("button", { name: /filters/i })).toBeVisible();
  });

  test("should search and update URL params", async ({ page }) => {
    await page.goto("/servers");

    const searchInput = page.getByRole("searchbox", {
      name: /search servers/i,
    });
    await searchInput.fill("test");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/q=test/);
  });

  test("should show capabilities coming soon in sidebar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/servers");

    const sidebar = page.locator("aside");
    await expect(sidebar.getByText("Capabilities")).toBeVisible();
    await expect(sidebar.getByText(/coming soon/i)).toBeVisible();
  });

  test("should update URL cursor when loading more", async ({ page }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const loadMoreButton = page.getByRole("button", {
      name: /load more/i,
    });
    const hasLoadMore = await loadMoreButton.isVisible().catch(() => false);

    if (hasLoadMore) {
      await loadMoreButton.click();
      // Wait for the URL to update with cursor param
      await expect(page).toHaveURL(/cursor=/);
    }
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

  test("should have magic link button", async ({ page }) => {
    await page.goto("/signin");

    // Be more specific - look for the button
    await expect(
      page.getByRole("button", { name: /send magic link/i })
    ).toBeVisible();
  });
});
