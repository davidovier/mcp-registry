import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display the main heading", async ({ page }) => {
    await page.goto("/");

    // Check that the main heading is visible
    await expect(
      page.getByRole("heading", { name: /mcp registry/i, level: 1 })
    ).toBeVisible();
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");

    // Check header navigation
    await expect(page.getByRole("link", { name: /browse/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /docs/i })).toBeVisible();
  });

  test("should have call-to-action buttons", async ({ page }) => {
    await page.goto("/");

    // Check CTA buttons
    await expect(
      page.getByRole("link", { name: /browse registry/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /documentation/i })
    ).toBeVisible();
  });

  test("should display feature cards", async ({ page }) => {
    await page.goto("/");

    // Check feature cards
    await expect(page.getByText("Discover")).toBeVisible();
    await expect(page.getByText("Share")).toBeVisible();
    await expect(page.getByText("Integrate")).toBeVisible();
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
