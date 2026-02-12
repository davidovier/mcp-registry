import { test, expect } from "@playwright/test";

test.describe("Docs page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("should load and display page header", async ({ page }) => {
    await page.goto("/docs");

    await expect(
      page.getByRole("heading", { name: "Documentation", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByText("How to discover, evaluate, and publish MCP servers.")
    ).toBeVisible();
  });

  test("should have main landmark", async ({ page }) => {
    await page.goto("/docs");

    const main = page.getByRole("main");
    await expect(main).toBeVisible();
  });

  test("should display breadcrumb navigation", async ({ page }) => {
    await page.goto("/docs");

    const breadcrumb = page.getByLabel("Breadcrumb");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("Home")).toBeVisible();
    await expect(breadcrumb.getByText("Documentation")).toBeVisible();
  });

  test("should display all key section headings", async ({ page }) => {
    await page.goto("/docs");

    const expectedHeadings = [
      "What is MCP?",
      "Glossary",
      "Using the Registry",
      "Integration Examples",
      "Submitting a Server",
      "Verification",
    ];

    for (const heading of expectedHeadings) {
      await expect(
        page.getByRole("heading", { name: heading, level: 2 })
      ).toBeVisible();
    }
  });

  test("should display glossary table with key terms", async ({ page }) => {
    await page.goto("/docs");

    await expect(
      page.getByText("Server", { exact: true }).first()
    ).toBeVisible();
    await expect(page.getByText("Transport").first()).toBeVisible();
    await expect(page.getByText("Authentication").first()).toBeVisible();
    await expect(page.getByText("Capabilities").first()).toBeVisible();
  });

  test("should display integration code examples", async ({ page }) => {
    await page.goto("/docs");

    await expect(
      page.getByRole("heading", { name: /stdio transport/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /http transport/i })
    ).toBeVisible();

    // Verify code blocks contain expected content
    await expect(page.getByText('"mcpServers"').first()).toBeVisible();
  });

  test("should display good submission checklist", async ({ page }) => {
    await page.goto("/docs");

    await expect(
      page.getByRole("heading", { name: /good submission checklist/i })
    ).toBeVisible();
    await expect(page.getByText(/clear name that matches/i)).toBeVisible();
    await expect(page.getByText(/URL-safe slug/i)).toBeVisible();
  });

  test("should display verification sections", async ({ page }) => {
    await page.goto("/docs");

    await expect(
      page.getByRole("heading", { name: /what .verified. means/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /what .verified. does not mean/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /requesting verification/i })
    ).toBeVisible();
  });

  test("should work on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/docs");

    await expect(
      page.getByRole("heading", { name: "Documentation", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "What is MCP?", level: 2 })
    ).toBeVisible();
  });

  test("should work in dark mode", async ({ page }) => {
    await page.goto("/docs");

    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });

    await expect(
      page.getByRole("heading", { name: "Documentation", level: 1 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "What is MCP?", level: 2 })
    ).toBeVisible();
  });
});
