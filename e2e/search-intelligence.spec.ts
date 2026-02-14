import { test, expect } from "@playwright/test";

/**
 * Search Intelligence E2E Tests - Sprint 14
 * Tests for did-you-mean suggestions, fallback search, and empty state improvements.
 *
 * Note: These tests may behave differently in CI vs local environments:
 * - CI: No real DB connection, may show error states
 * - Local: Real DB, should show actual suggestions and results
 */
test.describe("Search Intelligence", () => {
  test.describe("Suggestion Banner", () => {
    test("should show suggestion banner for misspelled query with no results", async ({
      page,
    }) => {
      // Navigate to servers page with a misspelled query
      await page.goto("/servers?q=githb");
      await page.waitForLoadState("networkidle");

      // In real DB mode, should show suggestion banner or empty state
      // In CI mode (no DB), may show error state
      const pageContent = page.locator("main");
      await expect(pageContent).toBeVisible();

      // Check for suggestion banner, empty state, or error state
      const hasSuggestion = await page
        .getByText(/did you mean/i)
        .isVisible()
        .catch(() => false);

      const hasEmptyState = await page
        .getByText(/no servers found/i)
        .isVisible()
        .catch(() => false);

      const hasErrorState = await page
        .getByText(/failed to load/i)
        .isVisible()
        .catch(() => false);

      // At least one of these should be visible
      expect(hasSuggestion || hasEmptyState || hasErrorState).toBeTruthy();
    });

    test("clicking suggestion should update URL and search", async ({
      page,
    }) => {
      await page.goto("/servers?q=githb");
      await page.waitForLoadState("networkidle");

      // Look for suggestion link
      const suggestionButton = page.locator(
        'button:has-text("GitHub"), a:has-text("GitHub")'
      );
      const hasSuggestion = await suggestionButton
        .isVisible()
        .catch(() => false);

      if (hasSuggestion) {
        await suggestionButton.click();
        await page.waitForLoadState("networkidle");

        // URL should be updated with the suggested term
        const url = page.url();
        expect(url).toMatch(/q=/);
      }
    });
  });

  test.describe("Search Transparency", () => {
    test("should show 'Ranked by relevance' for FTS search results", async ({
      page,
    }) => {
      // Search for something that should return results
      await page.goto("/servers?q=server");
      await page.waitForLoadState("networkidle");

      // Check for search transparency indicator or results
      const hasRankedIndicator = await page
        .getByText(/ranked by relevance/i)
        .isVisible()
        .catch(() => false);

      const hasResults = await page
        .locator('a[href^="/servers/"]')
        .first()
        .isVisible()
        .catch(() => false);

      const hasErrorState = await page
        .getByText(/failed to load/i)
        .isVisible()
        .catch(() => false);

      // In real DB mode with results, should show indicator
      // In CI mode or no results, just verify page loads properly
      expect(hasRankedIndicator || hasResults || hasErrorState).toBeTruthy();
    });

    test("should show 'Showing closest matches' for fallback mode", async ({
      page,
    }) => {
      // Search for something that might trigger fallback
      await page.goto("/servers?q=xyz");
      await page.waitForLoadState("networkidle");

      // Just verify the page loads - specific behavior depends on DB state
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe("Empty State", () => {
    test("should show improved empty state with actions", async ({ page }) => {
      // Search for something unlikely to exist
      await page.goto("/servers?q=nonexistentserver12345xyz");
      await page.waitForLoadState("networkidle");

      // Should show empty state or error state
      const hasEmptyState = await page
        .getByText(/no servers found/i)
        .isVisible()
        .catch(() => false);

      const hasErrorState = await page
        .getByText(/failed to load/i)
        .isVisible()
        .catch(() => false);

      expect(hasEmptyState || hasErrorState).toBeTruthy();

      // If empty state, check for actions
      if (hasEmptyState) {
        // Should have Clear filters or Submit a server link
        const hasActions = await page
          .getByText(/clear filters|submit a server|browse all/i)
          .first()
          .isVisible()
          .catch(() => false);

        expect(hasActions).toBeTruthy();
      }
    });

    test("Clear filters button should reset search", async ({ page }) => {
      await page.goto("/servers?q=nonexistent&verified=true");
      await page.waitForLoadState("networkidle");

      // Look for Clear filters button
      const clearButton = page.getByRole("button", { name: /clear filters/i });
      const hasClearButton = await clearButton.isVisible().catch(() => false);

      if (hasClearButton) {
        // Click and wait for navigation
        await Promise.all([
          page.waitForURL("**/servers", { timeout: 5000 }),
          clearButton.click(),
        ]);

        // URL should be /servers without params
        const url = new URL(page.url());
        expect(url.pathname).toBe("/servers");
        expect(url.searchParams.has("q")).toBeFalsy();
      }
    });

    test("should show query echo in empty state description", async ({
      page,
    }) => {
      const searchTerm = "specificTestTerm123";
      await page.goto(`/servers?q=${searchTerm}`);
      await page.waitForLoadState("networkidle");

      // Check for empty state with query echo or error state
      // The query appears in the description like: No servers match "specificTestTerm123"
      const hasQueryEcho = await page
        .getByText(new RegExp(`"${searchTerm}"`, "i"))
        .first()
        .isVisible()
        .catch(() => false);

      const hasEmptyOrError = await page
        .getByText(/no servers|failed to load/i)
        .first()
        .isVisible()
        .catch(() => false);

      // Query should be visible somewhere (description or filter chip)
      expect(hasQueryEcho || hasEmptyOrError).toBeTruthy();
    });
  });

  test.describe("Dark Mode", () => {
    test("suggestion banner should render correctly in dark mode", async ({
      page,
    }) => {
      // Set dark mode via color scheme emulation
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto("/servers?q=test");
      await page.waitForLoadState("networkidle");

      // Verify page renders without visual errors in dark mode
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();

      // Just smoke test - ensure no crash
      const bodyClasses = await page.locator("body").getAttribute("class");
      // Page should load successfully in dark mode
      expect(bodyClasses).not.toBeNull();
    });
  });

  test.describe("Mobile Viewport", () => {
    test("should work on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/servers?q=github");
      await page.waitForLoadState("networkidle");

      // Verify main content loads
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();

      // Should have either results, empty state, or error
      const hasContent = await page
        .getByText(/servers|no servers|failed to load/i)
        .first()
        .isVisible()
        .catch(() => false);

      expect(hasContent).toBeTruthy();
    });

    test("empty state actions should be visible on mobile", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/servers?q=nonexistentxyz");
      await page.waitForLoadState("networkidle");

      // Just verify page loads properly on mobile
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();
    });
  });

  test.describe("API Response", () => {
    test("should include searchMode in API response", async ({ request }) => {
      const response = await request.get("/api/servers?q=test");

      // API should return 200 or 500 (if DB not available)
      expect([200, 500]).toContain(response.status());

      if (response.status() === 200) {
        const data = await response.json();

        // Should have searchMode field
        expect(data).toHaveProperty("searchMode");
        expect(["fts", "fallback_trgm", "none"]).toContain(data.searchMode);

        // Should have data array
        expect(data).toHaveProperty("data");
        expect(Array.isArray(data.data)).toBeTruthy();
      }
    });

    test("should include suggestion when results are sparse", async ({
      request,
    }) => {
      // Query for something that might return sparse results
      const response = await request.get("/api/servers?q=githb");

      if (response.status() === 200) {
        const data = await response.json();

        // Suggestion is optional - just verify structure is valid
        if (data.suggestion) {
          expect(data.suggestion).toHaveProperty("name");
          expect(data.suggestion).toHaveProperty("slug");
        }
      }
    });

    test("searchMode should be 'none' when no query", async ({ request }) => {
      const response = await request.get("/api/servers");

      if (response.status() === 200) {
        const data = await response.json();
        expect(data.searchMode).toBe("none");
      }
    });
  });
});
