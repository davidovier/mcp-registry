import { test, expect } from "@playwright/test";

test.describe("About page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("should load and display page header", async ({ page }) => {
    await page.goto("/about");

    await expect(
      page.getByRole("heading", { name: "About", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText(
        "A public registry for MCP servers, built for clarity and trust."
      )
    ).toBeVisible();
  });

  test("should have main landmark", async ({ page }) => {
    await page.goto("/about");

    const main = page.getByRole("main");
    await expect(main).toBeVisible();
  });

  test("should display breadcrumb navigation", async ({ page }) => {
    await page.goto("/about");

    const breadcrumb = page.getByLabel("Breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("Home")).toBeVisible();
    await expect(breadcrumb.getByText("About")).toBeVisible();
  });

  test("should display all key section headings", async ({ page }) => {
    await page.goto("/about");

    const expectedHeadings = [
      "Why this exists",
      "Principles",
      "Governance & Verification",
      "Roadmap",
    ];

    for (const heading of expectedHeadings) {
      await expect(
        page.getByRole("heading", { name: heading, level: 2 })
      ).toBeVisible();
    }
  });

  test("should display principle cards", async ({ page }) => {
    await page.goto("/about");

    await expect(
      page.getByRole("heading", { name: "Precision over noise" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Semantic transparency" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Neutrality" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Verifiable signals" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Restraint in design" })
    ).toBeVisible();
  });

  test("should display roadmap items", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByText(/expanded filtering/i)).toBeVisible();
    await expect(page.getByText(/public api documentation/i)).toBeVisible();
    await expect(page.getByText(/registry export formats/i)).toBeVisible();
  });

  test("should display governance content", async ({ page }) => {
    await page.goto("/about");

    await expect(
      page.getByText(/submissions are reviewed before publication/i)
    ).toBeVisible();
    await expect(
      page.getByText(/verification is not a certification/i)
    ).toBeVisible();
  });

  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/about");

    await expect(
      page.getByRole("heading", { name: "About", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Why this exists", level: 2 })
    ).toBeVisible();
  });

  test("should work in dark mode", async ({ page }) => {
    await page.goto("/about");

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });

    await expect(
      page.getByRole("heading", { name: "About", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Principles", level: 2 })
    ).toBeVisible();
  });
});
