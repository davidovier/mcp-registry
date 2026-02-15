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

    // Check for the two-column layout content
    await expect(page.getByText("What we document")).toBeVisible();
    await expect(page.getByText("What we don't document")).toBeVisible();
  });

  test("should display Latest Release section with highlighted card", async ({
    page,
  }) => {
    await page.goto("/changelog");

    await expect(
      page.getByRole("heading", { name: "Latest Release", level: 2 })
    ).toBeVisible();

    // Check that the latest version badge is visible
    await expect(page.getByText("v1.4")).toBeVisible();
  });

  test("should display Recent Updates section", async ({ page }) => {
    await page.goto("/changelog");

    await expect(
      page.getByRole("heading", { name: "Recent Updates", level: 2 })
    ).toBeVisible();
  });

  test("should display How to Follow Updates section", async ({ page }) => {
    await page.goto("/changelog");

    await expect(
      page.getByRole("heading", { name: "How to Follow Updates", level: 2 })
    ).toBeVisible();

    // Check for GitHub link
    await expect(
      page.getByRole("link", { name: /GitHub Repository/i })
    ).toBeVisible();

    // Check for RSS feed link
    await expect(
      page.getByRole("link", { name: /Releases RSS/i })
    ).toBeVisible();
  });

  test("should display Support & Feedback section", async ({ page }) => {
    await page.goto("/changelog");

    await expect(
      page.getByRole("heading", { name: "Support & Feedback", level: 2 })
    ).toBeVisible();

    // Check for Contributing page link
    await expect(
      page.getByRole("link", { name: /Contributing page/i })
    ).toBeVisible();

    // Check for GitHub Issues link
    await expect(
      page.getByRole("link", { name: /GitHub Issues/i })
    ).toBeVisible();
  });

  test("should render at least 4 changelog entries", async ({ page }) => {
    await page.goto("/changelog");

    // Look for version badges in changelog entries
    const versions = ["v1.4", "v1.3", "v1.2", "v1.1"];

    for (const version of versions) {
      await expect(page.getByText(version).first()).toBeVisible();
    }
  });

  test("should display changelog entry components (version badge, date, type badges)", async ({
    page,
  }) => {
    await page.goto("/changelog");

    // Check for a version badge
    await expect(page.getByText("v1.4").first()).toBeVisible();

    // Check for a date
    await expect(page.getByText("February 14, 2026")).toBeVisible();

    // Check for type badges (Feature, Fix, Security, UI, Docs, API, Infrastructure)
    await expect(page.getByText("UI").first()).toBeVisible();
    await expect(page.getByText("Docs").first()).toBeVisible();
    await expect(page.getByText("Feature").first()).toBeVisible();
    await expect(page.getByText("API").first()).toBeVisible();
    await expect(page.getByText("Infrastructure").first()).toBeVisible();
  });

  test("should have anchor links for each version", async ({ page }) => {
    await page.goto("/changelog");

    // Check that version anchors exist
    const v14Anchor = page.locator("#v1-4");
    await expect(v14Anchor).toBeAttached();

    const v13Anchor = page.locator("#v1-3");
    await expect(v13Anchor).toBeAttached();

    const v12Anchor = page.locator("#v1-2");
    await expect(v12Anchor).toBeAttached();

    const v11Anchor = page.locator("#v1-1");
    await expect(v11Anchor).toBeAttached();
  });

  test("should navigate to anchor when clicking version link", async ({
    page,
  }) => {
    await page.goto("/changelog");

    // Click on the v1.1 anchor link
    const v11Link = page.locator('a[href="#v1-1"]');
    await v11Link.click();

    // Check that URL has the hash
    await expect(page).toHaveURL(/\/changelog#v1-1$/);

    // The anchor element should be in view
    const anchor = page.locator("#v1-1");
    await expect(anchor).toBeInViewport();
  });

  test("should have Back to top link", async ({ page }) => {
    await page.goto("/changelog");

    const backToTopLink = page.getByRole("link", { name: /Back to top/i });
    await expect(backToTopLink).toBeVisible();
    await expect(backToTopLink).toHaveAttribute("href", "#top");
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

    // Verify key elements are still visible
    await expect(
      page.getByRole("heading", { name: "Changelog", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Latest Release", level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recent Updates", level: 2 })
    ).toBeVisible();

    // Verify changelog entries are still visible
    await expect(page.getByText("v1.4").first()).toBeVisible();
    await expect(page.getByText("v1.3").first()).toBeVisible();
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
      page.getByRole("heading", { name: "Latest Release", level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Recent Updates", level: 2 })
    ).toBeVisible();
  });

  test("should have proper heading hierarchy (1 H1, 6 H2s for sections)", async ({
    page,
  }) => {
    await page.goto("/changelog");

    // Check h1
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);

    // Check h2s (6 section headings + 1 sr-only "Site footer" in footer = 7)
    // Sections: Versioning & Scope, Latest Release, Recent Updates,
    // How to Follow Updates, Support & Feedback, Next Steps
    const h2s = page.locator("h2");
    await expect(h2s).toHaveCount(7);
  });

  test("should have external GitHub links with proper attributes", async ({
    page,
  }) => {
    await page.goto("/changelog");

    // Check GitHub Repository link
    const githubRepoLink = page.getByRole("link", {
      name: /GitHub Repository/i,
    });
    await expect(githubRepoLink).toBeVisible();
    await expect(githubRepoLink).toHaveAttribute("target", "_blank");
    await expect(githubRepoLink).toHaveAttribute("rel", "noopener noreferrer");

    // Check Releases RSS link
    const rssLink = page.getByRole("link", { name: /Releases RSS/i });
    await expect(rssLink).toBeVisible();
    await expect(rssLink).toHaveAttribute("target", "_blank");
    await expect(rssLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("should have no console errors on page load", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/changelog");
    await page.waitForLoadState("networkidle");

    // Filter out known acceptable errors (e.g., third-party script errors)
    const relevantErrors = consoleErrors.filter(
      (error) => !error.includes("favicon")
    );

    expect(relevantErrors).toHaveLength(0);
  });

  test("should have Contributing page link pointing to /contributing", async ({
    page,
  }) => {
    await page.goto("/changelog");

    const contributingLink = page.getByRole("link", {
      name: /Contributing page/i,
    });
    await expect(contributingLink).toBeVisible();
    await expect(contributingLink).toHaveAttribute("href", "/contributing");
  });
});
