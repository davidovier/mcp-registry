import { test, expect } from "@playwright/test";

test.describe("API Documentation page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("should load and display page header", async ({ page }) => {
    await page.goto("/api");

    await expect(
      page.getByRole("heading", { name: "API", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText(
        "The MCP Registry provides a public API for discovering MCP servers"
      )
    ).toBeVisible();
  });

  test("should have main landmark", async ({ page }) => {
    await page.goto("/api");

    const main = page.getByRole("main");
    await expect(main).toBeVisible();
  });

  test("should display breadcrumb navigation", async ({ page }) => {
    await page.goto("/api");

    const breadcrumb = page.getByLabel("Breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("Home")).toBeVisible();
    await expect(breadcrumb.getByText("API")).toBeVisible();
  });

  test("should display all major section headings", async ({ page }) => {
    await page.goto("/api");

    const expectedHeadings = [
      "Base URL",
      "Endpoints",
      "Query Parameters",
      "Pagination Model",
      "Response Shape",
      "Errors",
      "Caching & Freshness",
      "API Stability",
      "Responsible Use",
      "Related",
    ];

    for (const heading of expectedHeadings) {
      await expect(
        page.getByRole("heading", { name: heading, level: 2 })
      ).toBeVisible();
    }
  });

  test("should display code blocks with API examples", async ({ page }) => {
    await page.goto("/api");

    // Check for at least 2 code blocks (as per requirements)
    const codeBlocks = page.locator("pre code");
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Verify specific code content
    await expect(page.getByText("GET /api/servers").first()).toBeVisible();
    await expect(
      page.getByText("GET /api/servers/{slug}").first()
    ).toBeVisible();
    await expect(
      page.getByText("https://mcp-registry.vercel.app")
    ).toBeVisible();
  });

  test("should have working link to /servers", async ({ page }) => {
    await page.goto("/api");

    const browseLink = page.getByRole("link", { name: /Browse the registry/i });
    await expect(browseLink).toBeVisible();
    await browseLink.click();

    await expect(page).toHaveURL(/\/servers/);
  });

  test("should have working link to /verification", async ({ page }) => {
    await page.goto("/api");

    const verificationLink = page.getByRole("link", {
      name: /Learn verification criteria/i,
    });
    await expect(verificationLink).toBeVisible();
    await verificationLink.click();

    await expect(page).toHaveURL(/\/verification/);
  });

  test("should display query parameters table", async ({ page }) => {
    await page.goto("/api");

    // Check for parameter names in the table
    await expect(page.getByText("transport").first()).toBeVisible();
    await expect(page.getByText("verified").first()).toBeVisible();
    await expect(page.getByText("cursor").first()).toBeVisible();
    await expect(page.getByText("limit").first()).toBeVisible();
  });

  test("should display error status codes", async ({ page }) => {
    await page.goto("/api");

    await expect(page.getByText("400")).toBeVisible();
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText("500")).toBeVisible();
  });

  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/api");

    await expect(
      page.getByRole("heading", { name: "API", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Base URL", level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Endpoints", level: 2 })
    ).toBeVisible();
  });

  test("should work in dark mode", async ({ page }) => {
    await page.goto("/api");

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });

    await expect(
      page.getByRole("heading", { name: "API", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Base URL", level: 2 })
    ).toBeVisible();

    // Verify code blocks are still readable
    await expect(page.getByText("GET /api/servers").first()).toBeVisible();
  });

  test("should have API link in header navigation", async ({ page }) => {
    await page.goto("/api");

    const nav = page.locator("header nav");
    await expect(nav.getByRole("link", { name: "API" })).toBeVisible();
  });

  test("should have API link in footer resources", async ({ page }) => {
    await page.goto("/api");

    const footer = page.locator("footer");
    // The footer has API in both Product and Resources sections
    const apiLinks = footer.getByRole("link", { name: "API" });
    const count = await apiLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
