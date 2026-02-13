import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to desktop size to ensure nav links are visible
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("should display the main heading", async ({ page }) => {
    await page.goto("/");

    // Check that the main heading is visible
    await expect(
      page.getByRole("heading", { name: /mcp registry/i, level: 1 })
    ).toBeVisible();
  });

  test("should have navigation links in header", async ({ page }) => {
    await page.goto("/");

    // Check header navigation - use role navigation or header element
    const header = page.getByRole("banner");
    await expect(header.getByRole("link", { name: /browse/i })).toBeVisible();
    await expect(header.getByRole("link", { name: /docs/i })).toBeVisible();
  });

  test("should have call-to-action buttons", async ({ page }) => {
    await page.goto("/");

    // Check CTA buttons in main section
    const main = page.getByRole("main");
    await expect(
      main.getByRole("link", { name: /browse registry/i })
    ).toBeVisible();
    await expect(
      main.getByRole("link", { name: /documentation/i })
    ).toBeVisible();
  });

  test("should display feature cards", async ({ page }) => {
    await page.goto("/");

    // Check feature cards exist by looking for headings
    await expect(
      page.getByRole("heading", { name: "Discover", level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Share", level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Integrate", level: 2 })
    ).toBeVisible();
  });
});

test.describe("Health API", () => {
  test("should return healthy status", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe("healthy");
    expect(data.timestamp).toBeDefined();
  });
});
