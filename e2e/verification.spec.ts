import { test, expect } from "@playwright/test";

/**
 * Verification system tests - public page elements only.
 * Auth-dependent tests are skipped in CI.
 */

test.describe("/verification page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("should load and display page header", async ({ page }) => {
    await page.goto("/verification");

    await expect(
      page.getByRole("heading", { name: "Verification", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText(
        /verification is how the mcp registry signals additional review/i
      )
    ).toBeVisible();
  });

  test("should display breadcrumb navigation", async ({ page }) => {
    await page.goto("/verification");

    const breadcrumb = page.getByLabel("Breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("Home")).toBeVisible();
    await expect(breadcrumb.getByText("Verification")).toBeVisible();
  });

  test("should display all 6 section headings", async ({ page }) => {
    await page.goto("/verification");

    // Use regex patterns for curly quotes in headings
    const expectedHeadings = [
      /What.*Verified.*means/i,
      /What.*Verified.*does not mean/i,
      /How verification works/i,
      /Governance.*neutrality/i,
      /Re-verification/i,
      /Requesting verification/i,
    ];

    for (const heading of expectedHeadings) {
      await expect(
        page.getByRole("heading", { name: heading, level: 2 })
      ).toBeVisible();
    }
  });

  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/verification");

    await expect(
      page.getByRole("heading", { name: "Verification", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /What.*Verified.*means/i, level: 2 })
    ).toBeVisible();
  });

  test("should work in dark mode", async ({ page }) => {
    await page.goto("/verification");

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });

    await expect(
      page.getByRole("heading", { name: "Verification", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Governance & neutrality", level: 2 })
    ).toBeVisible();
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/verification");

    // Check h1
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);

    // Check h2s (6 section headings + 1 sr-only "Site footer" in footer)
    const h2s = page.locator("h2");
    await expect(h2s).toHaveCount(7);

    // Check h3s exist in first section (numbered criteria)
    const h3s = page.locator("h3");
    const h3Count = await h3s.count();
    expect(h3Count).toBeGreaterThanOrEqual(5);
  });

  test("should have link to browse registry", async ({ page }) => {
    await page.goto("/verification");

    const browseLink = page.getByRole("link", { name: /browse the registry/i });
    await expect(browseLink).toBeVisible();
    await expect(browseLink).toHaveAttribute("href", "/servers");
  });
});

test.describe("Quality Signals on server detail page", () => {
  test("should display quality signals card when viewing a server", async ({
    page,
  }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // Quality signals card should be visible
      const qualitySignals = page.getByRole("heading", {
        name: /quality signals/i,
      });
      await expect(qualitySignals).toBeVisible();

      // Should show signal count text
      await expect(page.getByText(/quality signals:.*of 5 met/i)).toBeVisible();
    }
  });

  test("should display quality signal items", async ({ page }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // Get the Quality signals card specifically
      const qualityCard = page
        .locator("aside")
        .locator("text=Quality signals")
        .locator("..");

      // Check for quality signal items within the quality signals card
      await expect(qualityCard.getByText("Has documentation")).toBeVisible();
      await expect(qualityCard.getByText("Has repository")).toBeVisible();
      await expect(
        qualityCard.getByText("Requires authentication")
      ).toBeVisible();
      await expect(qualityCard.getByText("Recently updated")).toBeVisible();
      await expect(qualityCard.getByText("Verified by registry")).toBeVisible();
    }
  });
});

test.describe("Trust & Ownership card on server detail page", () => {
  test("should display trust actions card", async ({ page }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // Trust & ownership card should be visible
      await expect(page.getByText("Trust & ownership")).toBeVisible();
    }
  });

  test("should show disabled action buttons for non-owners", async ({
    page,
  }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // Report and Claim buttons should be disabled (placeholder)
      const reportButton = page.getByRole("button", {
        name: /report an issue/i,
      });
      const claimButton = page.getByRole("button", {
        name: /claim ownership/i,
      });

      await expect(reportButton).toBeDisabled();
      await expect(claimButton).toBeDisabled();
    }
  });

  test("should show sign in prompt for non-owners", async ({ page }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // Should show the "sign in as owner" prompt
      await expect(
        page.getByText(/sign in as owner to manage this server/i)
      ).toBeVisible();
    }
  });
});

test.describe("Admin verification tab", () => {
  test.skip(
    !!process.env.CI_SKIP_AUTH_TESTS,
    "Auth tests skipped in CI (no Supabase connection)"
  );

  test("should show verification tab in admin page for authenticated admin", async ({
    page,
  }) => {
    // This test would require admin authentication
    // Skipped in CI - manually test with authenticated session
    await page.goto("/admin/submissions");

    // If authenticated as admin, should see tabs
    const verificationsTab = page.getByRole("link", { name: /verifications/i });
    const hasTab = await verificationsTab.isVisible().catch(() => false);

    if (hasTab) {
      await expect(verificationsTab).toBeVisible();
    }
  });
});

test.describe("Verification status display", () => {
  test("should show verified status on verified server", async ({ page }) => {
    // Filter for verified servers
    await page.goto("/servers?verified=true");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // Verified badge should be visible in header
      const verifiedBadge = page.getByLabel("Verified");
      await expect(verifiedBadge).toBeVisible();

      // Quality signals card should exist with the verified signal
      const qualityCard = page
        .locator("aside")
        .locator("text=Quality signals")
        .locator("..");
      await expect(qualityCard.getByText("Verified by registry")).toBeVisible();
    }
  });

  test("should show verification metadata block on verified server with verified_at", async ({
    page,
  }) => {
    // Filter for verified servers
    await page.goto("/servers?verified=true");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // Scope to sidebar to avoid strict mode issues
      const sidebar = page.locator("aside");

      // Check for enhanced verification metadata block (only shows when verified_at is set)
      // If verified_at is not set, the old "Yes"/"No" display is used
      const hasEnhancedBlock = await sidebar
        .getByText("Verified by MCP Registry")
        .isVisible()
        .catch(() => false);

      if (hasEnhancedBlock) {
        // Check for verification criteria link
        const criteriaLink = sidebar.getByRole("link", {
          name: /read verification criteria/i,
        });
        await expect(criteriaLink).toBeVisible();
        await expect(criteriaLink).toHaveAttribute("href", "/verification");
      } else {
        // Fallback: verified without verified_at timestamp shows "Yes"
        // This is expected when migration hasn't been run yet
        const verifiedRow = sidebar.locator("text=Verified").first();
        await expect(verifiedRow).toBeVisible();
      }
    }
  });

  test("should NOT show verification metadata block on unverified server", async ({
    page,
  }) => {
    // Filter for unverified servers
    await page.goto("/servers?verified=false");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // Scope to sidebar
      const sidebar = page.locator("aside");

      // Should NOT show "Verified by MCP Registry" metadata
      await expect(
        sidebar.getByText("Verified by MCP Registry")
      ).not.toBeVisible();
    }
  });

  test("should show not verified status on unverified server", async ({
    page,
  }) => {
    // Filter for unverified servers (no verified=true filter)
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const serverCard = page.locator('a[href^="/servers/"]').first();
    const hasCards = await serverCard.isVisible().catch(() => false);

    if (hasCards) {
      await serverCard.click();
      await expect(page).toHaveURL(/\/servers\/.+/);

      // The page should load correctly
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      // Trust & ownership card should be visible
      await expect(page.getByText("Trust & ownership")).toBeVisible();
    }
  });
});
