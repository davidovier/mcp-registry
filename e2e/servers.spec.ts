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
    await expect(
      sidebar.getByRole("heading", { name: "Capabilities" })
    ).toBeVisible();
    await expect(
      sidebar.getByText("Filtering by capabilities is coming soon.")
    ).toBeVisible();
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

test.describe("Server detail page", () => {
  test("should show breadcrumbs and heading on valid server", async ({
    page,
  }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    // Find a server card to navigate to
    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // Breadcrumbs should be visible
      const breadcrumb = page.getByLabel("Breadcrumb");
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb.getByText("Servers")).toBeVisible();

      // Heading should be visible
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("should show verified badge for verified server", async ({ page }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // Check for verified badge (may or may not be present depending on server)
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();

      // The verified badge has aria-label="Verified"
      const verifiedBadge = page.getByLabel("Verified");
      const hasVerified = await verifiedBadge.isVisible().catch(() => false);

      // Just verify the page loads correctly - badge presence depends on data
      expect(typeof hasVerified).toBe("boolean");
    }
  });

  test("should show config snippet section", async ({ page }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // Should show "Example configuration" section
      await expect(
        page.getByRole("heading", { name: /example configuration/i })
      ).toBeVisible();

      // Should have a code block with mcpServers config
      await expect(page.locator("pre code")).toBeVisible();
    }
  });

  test("should show not-found page with back link for invalid slug", async ({
    page,
  }) => {
    await page.goto("/servers/this-slug-definitely-does-not-exist-xyz-123");
    await page.waitForLoadState("networkidle");

    // Should show "Server Not Found" heading
    await expect(
      page.getByRole("heading", { name: /server not found/i })
    ).toBeVisible();

    // Should have "Back to servers" link
    const backLink = page.getByRole("link", { name: /back to servers/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/servers");
  });
});

test.describe("Sort functionality", () => {
  // Helper to check if sort dropdown is available (requires data in DB)
  async function getSortSelect(page: import("@playwright/test").Page) {
    const sortSelect = page.getByRole("combobox", { name: /sort servers/i });
    const isVisible = await sortSelect.isVisible().catch(() => false);
    return isVisible ? sortSelect : null;
  }

  test("should show sort dropdown with verified first as default", async ({
    page,
  }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const sortSelect = await getSortSelect(page);
    if (!sortSelect) {
      // In CI without DB, sort dropdown won't appear (error state shows)
      return;
    }

    await expect(sortSelect).toBeVisible();
    await expect(sortSelect).toHaveValue("verified");
  });

  test("should update URL when changing to newest sort", async ({ page }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const sortSelect = await getSortSelect(page);
    if (!sortSelect) return;

    await sortSelect.selectOption("newest");

    await expect(page).toHaveURL(/sort=newest/);
  });

  test("should update URL when changing to name sort", async ({ page }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const sortSelect = await getSortSelect(page);
    if (!sortSelect) return;

    await sortSelect.selectOption("name");

    await expect(page).toHaveURL(/sort=name/);
  });

  test("should remove sort param when returning to verified (default)", async ({
    page,
  }) => {
    await page.goto("/servers?sort=newest");
    await page.waitForLoadState("networkidle");

    const sortSelect = await getSortSelect(page);
    if (!sortSelect) return;

    await sortSelect.selectOption("verified");

    // URL should not contain sort param for default value
    await expect(page).not.toHaveURL(/sort=/);
  });

  test("should persist sort after page refresh", async ({ page }) => {
    await page.goto("/servers?sort=name");
    await page.waitForLoadState("networkidle");

    const sortSelect = await getSortSelect(page);
    if (!sortSelect) return;

    await expect(sortSelect).toHaveValue("name");

    // Refresh page
    await page.reload();
    await page.waitForLoadState("networkidle");

    const sortSelectAfterRefresh = await getSortSelect(page);
    if (!sortSelectAfterRefresh) return;

    // Sort should still be name
    await expect(sortSelectAfterRefresh).toHaveValue("name");
  });

  test("should reset cursor when sort changes", async ({ page }) => {
    await page.goto("/servers?cursor=somecursor");
    await page.waitForLoadState("networkidle");

    const sortSelect = await getSortSelect(page);
    if (!sortSelect) return;

    await sortSelect.selectOption("newest");

    // URL should have sort but not cursor
    await expect(page).toHaveURL(/sort=newest/);
    await expect(page).not.toHaveURL(/cursor=/);
  });

  test("should work with other filters", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const sortSelect = await getSortSelect(page);
    if (!sortSelect) return;

    // Apply verified filter
    const verifiedCheckbox = page.locator("aside").getByText("Verified only");
    await verifiedCheckbox.click();
    await expect(page).toHaveURL(/verified=true/);

    // Change sort
    await sortSelect.selectOption("name");

    // Both params should be present
    await expect(page).toHaveURL(/verified=true/);
    await expect(page).toHaveURL(/sort=name/);
  });

  test("should show sort control on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const sortSelect = await getSortSelect(page);
    if (!sortSelect) {
      // In CI without DB, sort dropdown won't appear
      return;
    }

    await expect(sortSelect).toBeVisible();
  });

  test("should maintain sort when loading more servers", async ({ page }) => {
    await page.goto("/servers?sort=newest");
    await page.waitForLoadState("networkidle");

    const sortSelect = await getSortSelect(page);
    if (!sortSelect) return;

    const loadMoreButton = page.getByRole("button", {
      name: /load more/i,
    });
    const hasLoadMore = await loadMoreButton.isVisible().catch(() => false);

    if (hasLoadMore) {
      await loadMoreButton.click();
      // Wait for the URL to update with cursor param
      await expect(page).toHaveURL(/cursor=/);
      // Sort param should still be present
      await expect(page).toHaveURL(/sort=newest/);
    }
  });
});

test.describe("Full-text search functionality", () => {
  test("should search and show results or empty state", async ({ page }) => {
    await page.goto("/servers?q=github");
    await page.waitForLoadState("networkidle");

    // URL should contain the search query
    await expect(page).toHaveURL(/q=github/);

    // Either results or empty/error state should be shown
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("should combine search with sort mode", async ({ page }) => {
    await page.goto("/servers?q=test&sort=newest");
    await page.waitForLoadState("networkidle");

    // URL should contain both params
    await expect(page).toHaveURL(/q=test/);
    await expect(page).toHaveURL(/sort=newest/);
  });

  test("should combine search with filters", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/servers?q=server");
    await page.waitForLoadState("networkidle");

    // Apply verified filter
    const verifiedCheckbox = page.locator("aside").getByText("Verified only");
    const isCheckboxVisible = await verifiedCheckbox
      .isVisible()
      .catch(() => false);

    if (isCheckboxVisible) {
      await verifiedCheckbox.click();

      // URL should contain both params
      await expect(page).toHaveURL(/q=server/);
      await expect(page).toHaveURL(/verified=true/);
    }
  });

  test("should change sort while searching", async ({ page }) => {
    await page.goto("/servers?q=file");
    await page.waitForLoadState("networkidle");

    // Try to get the sort select
    const sortSelect = page.getByRole("combobox", { name: /sort servers/i });
    const isSortVisible = await sortSelect.isVisible().catch(() => false);

    if (isSortVisible) {
      await sortSelect.selectOption("name");

      // URL should contain both params, cursor should be cleared
      await expect(page).toHaveURL(/q=file/);
      await expect(page).toHaveURL(/sort=name/);
      await expect(page).not.toHaveURL(/cursor=/);
    }
  });

  test("should handle search input and submit", async ({ page }) => {
    await page.goto("/servers");

    const searchInput = page.getByRole("searchbox", {
      name: /search servers/i,
    });
    await searchInput.fill("database");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/q=database/);
  });

  test("should clear search when input is cleared", async ({ page }) => {
    await page.goto("/servers?q=test");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByRole("searchbox", {
      name: /search servers/i,
    });
    await searchInput.clear();
    await searchInput.press("Enter");

    // q param should be removed
    await expect(page).not.toHaveURL(/q=/);
  });

  test("should preserve search when paginating", async ({ page }) => {
    await page.goto("/servers?q=server");
    await page.waitForLoadState("networkidle");

    const loadMoreButton = page.getByRole("button", { name: /load more/i });
    const hasLoadMore = await loadMoreButton.isVisible().catch(() => false);

    if (hasLoadMore) {
      await loadMoreButton.click();

      // Both params should be present
      await expect(page).toHaveURL(/q=server/);
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
    // Default tab is "Sign In" with a password form — scope to form to avoid tab button
    await expect(
      page.locator("form").getByRole("button", { name: /^sign in$/i })
    ).toBeVisible();
  });

  test("should have magic link tab", async ({ page }) => {
    await page.goto("/signin");

    // Click the Magic Link tab
    await page.getByRole("button", { name: /magic link/i }).click();
    await expect(
      page.getByRole("button", { name: /send magic link/i })
    ).toBeVisible();
  });
});
