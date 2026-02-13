import { test, expect } from "@playwright/test";

/**
 * Changelog page tests - public page elements only.
 * No auth required.
 */

test.describe("Changelog page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("should load page successfully", async ({ page }) => {
    const response = await page.goto("/changelog");

    expect(response?.status()).toBe(200);
  });

  test("should display H1 heading 'Changelog'", async ({ page }) => {
    await page.goto("/changelog");

    await expect(
      page.getByRole("heading", { name: "Changelog", level: 1 })
    ).toBeVisible();
  });

  test("should display breadcrumb navigation with Home / Changelog", async ({
    page,
  }) => {
    await page.goto("/changelog");

    const breadcrumb = page.getByLabel("Breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("Home")).toBeVisible();
    await expect(breadcrumb.getByText("Changelog")).toBeVisible();
  });

  test("should display Versioning & Scope section", async ({ page }) => {
    await page.goto("/changelog");

    await expect(
      page.getByRole("heading", { name: "Versioning & Scope", level: 2 })
    ).toBeVisible();

    // Check for content within the section
    await expect(
      page.getByText(/The MCP Registry evolves regularly/i)
    ).toBeVisible();
  });

  test("should display How to Follow Updates section", async ({ page }) => {
    await page.goto("/changelog");

    await expect(
      page.getByRole("heading", { name: "How to Follow Updates", level: 2 })
    ).toBeVisible();

    // Check for GitHub link
    await expect(
      page.getByRole("link", { name: /GitHub repository/i })
    ).toBeVisible();
  });

  test("should display Recent Updates section", async ({ page }) => {
    await page.goto("/changelog");

    await expect(
      page.getByRole("heading", { name: "Recent Updates", level: 2 })
    ).toBeVisible();
  });

  test("should render at least 4 changelog entries", async ({ page }) => {
    await page.goto("/changelog");

    // Look for date/version patterns in changelog entries
    const entries = [
      "March 13, 2026 — v1.3",
      "March 12, 2026 — v1.2",
      "March 11, 2026 — v1.1",
      "March 10, 2026 — v1.0",
    ];

    for (const entry of entries) {
      await expect(page.getByText(entry)).toBeVisible();
    }
  });

  test("should display changelog entry components (date, version, category badge)", async ({
    page,
  }) => {
    await page.goto("/changelog");

    // Check for a date line
    await expect(page.getByText("March 13, 2026 — v1.3")).toBeVisible();

    // Check for category badges (Badge component with text)
    await expect(page.getByText("Governance").first()).toBeVisible();
    await expect(page.getByText("Infrastructure").first()).toBeVisible();
    await expect(page.getByText("API").first()).toBeVisible();
    await expect(page.getByText("UI").first()).toBeVisible();
  });

  test("should have Changelog link in header navigation", async ({ page }) => {
    await page.goto("/changelog");

    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "Changelog" })).toBeVisible();
  });

  test("should have Changelog link in footer resources", async ({ page }) => {
    await page.goto("/changelog");

    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Changelog" })).toBeVisible();
  });

  test("should work in dark mode", async ({ page }) => {
    await page.goto("/changelog");

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });

    await expect(
      page.getByRole("heading", { name: "Changelog", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recent Updates", level: 2 })
    ).toBeVisible();

    // Verify changelog entries are still visible
    await expect(page.getByText("March 13, 2026 — v1.3")).toBeVisible();
  });

  test("should work on mobile viewport (375x667)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/changelog");

    await expect(
      page.getByRole("heading", { name: "Changelog", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Versioning & Scope", level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recent Updates", level: 2 })
    ).toBeVisible();
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/changelog");

    // Check h1
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);

    // Check h2s (3 section headings + 1 sr-only "Site footer" in footer)
    const h2s = page.locator("h2");
    await expect(h2s).toHaveCount(4);
  });

  test("should have external GitHub link with proper attributes", async ({
    page,
  }) => {
    await page.goto("/changelog");

    const githubLink = page.getByRole("link", { name: /GitHub repository/i });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
