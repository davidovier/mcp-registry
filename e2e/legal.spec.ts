import { test, expect } from "@playwright/test";

test.describe("Privacy page", () => {
  test("should load and display page header", async ({ page }) => {
    await page.goto("/privacy");

    await expect(
      page.getByRole("heading", { name: "Privacy Policy", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText("Effective date: January 1, 2026")
    ).toBeVisible();
  });

  test("should display all section headings", async ({ page }) => {
    await page.goto("/privacy");

    const sections = [
      "1. Information We Collect",
      "2. Authentication",
      "3. Submissions",
      "4. Cookies",
      "5. Contact",
    ];

    for (const heading of sections) {
      await expect(
        page.getByRole("heading", { name: heading, level: 2 })
      ).toBeVisible();
    }
  });

  test("should display breadcrumb navigation", async ({ page }) => {
    await page.goto("/privacy");

    const breadcrumb = page.getByLabel("Breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("Home")).toBeVisible();
    await expect(breadcrumb.getByText("Privacy Policy")).toBeVisible();
  });

  test("should have main landmark", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("main")).toBeVisible();
  });
});

test.describe("Terms page", () => {
  test("should load and display page header", async ({ page }) => {
    await page.goto("/terms");

    await expect(
      page.getByRole("heading", { name: "Terms of Service", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText("Effective date: January 1, 2026")
    ).toBeVisible();
  });

  test("should display all section headings", async ({ page }) => {
    await page.goto("/terms");

    const sections = [
      "1. Use of the Registry",
      "2. Submissions",
      "3. Moderation",
      "4. Verification",
      "5. Liability",
    ];

    for (const heading of sections) {
      await expect(
        page.getByRole("heading", { name: heading, level: 2 })
      ).toBeVisible();
    }
  });

  test("should display breadcrumb navigation", async ({ page }) => {
    await page.goto("/terms");

    const breadcrumb = page.getByLabel("Breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("Home")).toBeVisible();
    await expect(breadcrumb.getByText("Terms of Service")).toBeVisible();
  });

  test("should have main landmark", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("main")).toBeVisible();
  });
});

test.describe("Footer legal links", () => {
  test("footer Privacy link navigates to /privacy", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await footer.getByRole("link", { name: "Privacy" }).click();
    await expect(page).toHaveURL(/\/privacy/);
    await expect(
      page.getByRole("heading", { name: "Privacy Policy", level: 1 })
    ).toBeVisible();
  });

  test("footer Terms link navigates to /terms", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await footer.getByRole("link", { name: "Terms" }).click();
    await expect(page).toHaveURL(/\/terms/);
    await expect(
      page.getByRole("heading", { name: "Terms of Service", level: 1 })
    ).toBeVisible();
  });
});
