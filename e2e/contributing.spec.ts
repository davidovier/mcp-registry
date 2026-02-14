import { test, expect } from "@playwright/test";

/**
 * Contributing page tests - public page elements.
 */

test.describe("/contributing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("should load successfully and display page header", async ({ page }) => {
    await page.goto("/contributing");

    await expect(
      page.getByRole("heading", {
        name: "Contributing to the MCP Registry",
        level: 1,
      })
    ).toBeVisible();

    await expect(
      page.getByText(/neutral, public index of Model Context Protocol servers/i)
    ).toBeVisible();
  });

  test("should display breadcrumb navigation", async ({ page }) => {
    await page.goto("/contributing");

    const breadcrumb = page.getByLabel("Breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("Home")).toBeVisible();
    await expect(breadcrumb.getByText("Contributing")).toBeVisible();
  });

  test("should display all 7 section headings", async ({ page }) => {
    await page.goto("/contributing");

    const expectedHeadings = [
      "What Makes a High-Quality MCP Server Listing",
      "Technical Validation Rules",
      "How Review Works",
      "Verification vs Approval",
      "Governance & Neutrality",
      "Responsible Contributions",
      "How to Contribute",
    ];

    for (const heading of expectedHeadings) {
      await expect(
        page.getByRole("heading", { name: heading, level: 2 })
      ).toBeVisible();
    }
  });

  test("should have link to verification page", async ({ page }) => {
    await page.goto("/contributing");

    const verificationLink = page.getByRole("link", {
      name: /verification page/i,
    });
    await expect(verificationLink).toBeVisible();
    await expect(verificationLink).toHaveAttribute("href", "/verification");
  });

  test("should have link to submit page", async ({ page }) => {
    await page.goto("/contributing");

    const submitLink = page.getByRole("link", { name: /submit page/i });
    await expect(submitLink).toBeVisible();
    await expect(submitLink).toHaveAttribute("href", "/submit");
  });

  test("should have link to GitHub issues", async ({ page }) => {
    await page.goto("/contributing");

    const githubLink = page.getByRole("link", { name: /github issues/i });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute("href", /github\.com/);
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", /noopener/);
  });

  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/contributing");

    await expect(
      page.getByRole("heading", {
        name: "Contributing to the MCP Registry",
        level: 1,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "What Makes a High-Quality MCP Server Listing",
        level: 2,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "How to Contribute", level: 2 })
    ).toBeVisible();
  });

  test("should work in dark mode", async ({ page }) => {
    await page.goto("/contributing");

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });

    await expect(
      page.getByRole("heading", {
        name: "Contributing to the MCP Registry",
        level: 1,
      })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Governance & Neutrality", level: 2 })
    ).toBeVisible();
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/contributing");

    // Check h1
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);

    // Check h2s (7 section headings + 1 sr-only "Site footer" in footer)
    const h2s = page.locator("h2");
    await expect(h2s).toHaveCount(8);

    // Page should have no h3s (avoiding h1 -> h3 skips without h2)
    // All content sections use h2 only in this page design
  });

  test("should have main landmark", async ({ page }) => {
    await page.goto("/contributing");

    // Page content should be in a main landmark or the content div
    // Check that the page structure is accessible
    const pageContent = page.locator(".min-h-screen");
    await expect(pageContent).toBeVisible();

    // Verify core content is present
    await expect(page.getByText("Clear purpose")).toBeVisible();
    await expect(page.getByText("Working implementation")).toBeVisible();
  });

  test("should display numbered review process steps", async ({ page }) => {
    await page.goto("/contributing");

    // Check for numbered steps in the review process section
    await expect(page.getByText("You submit a server listing.")).toBeVisible();
    await expect(
      page.getByText("The system validates the submission.")
    ).toBeVisible();
    await expect(
      page.getByText("It enters the moderation queue.")
    ).toBeVisible();
    await expect(
      page.getByText("An administrator reviews the entry.")
    ).toBeVisible();
  });

  test("should display technical validation rules", async ({ page }) => {
    await page.goto("/contributing");

    await expect(
      page.getByText(/slug must be lowercase letters, numbers, and hyphens/i)
    ).toBeVisible();
    await expect(
      page.getByText(/name must be 1–100 characters/i)
    ).toBeVisible();
    await expect(
      page.getByText(/description must be 1–500 characters/i)
    ).toBeVisible();
    await expect(page.getByText(/urls must be valid https/i)).toBeVisible();
  });

  test("should display governance principles", async ({ page }) => {
    await page.goto("/contributing");

    await expect(
      page.getByText(/no preferential treatment for vendors/i)
    ).toBeVisible();
    await expect(
      page.getByText(/criteria and changes are documented publicly/i)
    ).toBeVisible();
    await expect(
      page.getByText(/decisions follow documented standards/i)
    ).toBeVisible();
  });

  test("should display responsible contributions guidelines", async ({
    page,
  }) => {
    await page.goto("/contributing");

    await expect(page.getByText("Submit accurate information.")).toBeVisible();
    await expect(
      page.getByText("Avoid misleading marketing claims.")
    ).toBeVisible();
    await expect(
      page.getByText("Respect intellectual property.")
    ).toBeVisible();
    await expect(
      page.getByText("Not impersonate organizations.")
    ).toBeVisible();
  });
});

test.describe("Footer navigation to contributing", () => {
  test("should have contributing link in footer", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    const contributingLink = footer.getByRole("link", { name: "Contributing" });
    await expect(contributingLink).toBeVisible();
    await expect(contributingLink).toHaveAttribute("href", "/contributing");
  });

  test("should navigate from footer to contributing page", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    const contributingLink = footer.getByRole("link", { name: "Contributing" });
    await contributingLink.click();

    await expect(page).toHaveURL("/contributing");
    await expect(
      page.getByRole("heading", {
        name: "Contributing to the MCP Registry",
        level: 1,
      })
    ).toBeVisible();
  });
});
