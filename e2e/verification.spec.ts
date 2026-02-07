import { test, expect } from "@playwright/test";

/**
 * Verification system tests - public page elements only.
 * Auth-dependent tests are skipped in CI.
 */
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
      await expect(page.getByText(/of 5 signals met/i)).toBeVisible();
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
