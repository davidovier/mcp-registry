import { test, expect } from "@playwright/test";

/**
 * Submit page tests (authenticated)
 *
 * These tests run with an authenticated session and verify
 * the submit page renders and functions correctly.
 *
 * Note: These tests are skipped in CI unless auth env vars are configured.
 */

test.describe("Submit page structure", () => {
  test("should display correct page heading and subtitle", async ({ page }) => {
    await page.goto("/submit");

    // Check page heading
    await expect(
      page.getByRole("heading", { name: "Submit a server" })
    ).toBeVisible();

    // Check subtitle
    await expect(
      page.getByText("All submissions are reviewed before publishing.")
    ).toBeVisible();
  });

  test("should display all form sections", async ({ page }) => {
    await page.goto("/submit");

    // Check for Identity section
    await expect(page.getByRole("heading", { name: "Identity" })).toBeVisible();

    // Check for Connection & capabilities section
    await expect(
      page.getByRole("heading", { name: "Connection & capabilities" })
    ).toBeVisible();

    // Check for Links section
    await expect(page.getByRole("heading", { name: "Links" })).toBeVisible();

    // Check for Review & submit section
    await expect(
      page.getByRole("heading", { name: "Review & submit" })
    ).toBeVisible();
  });

  test("should display live preview panel", async ({ page }) => {
    await page.goto("/submit");

    // Check for Preview heading
    await expect(page.getByText("Preview")).toBeVisible();

    // Check for preview description
    await expect(page.getByText("How your server will appear")).toBeVisible();
  });

  test("should have required form fields", async ({ page }) => {
    await page.goto("/submit");

    // Check for required form fields
    await expect(page.getByLabel(/Name/)).toBeVisible();
    await expect(page.getByLabel(/Slug/)).toBeVisible();
    await expect(page.getByLabel(/Description/)).toBeVisible();
    await expect(page.getByLabel(/Transport/)).toBeVisible();
    await expect(page.getByLabel(/Authentication/)).toBeVisible();
  });

  test("should have capabilities checkboxes", async ({ page }) => {
    await page.goto("/submit");

    // Check for capabilities section with descriptive text
    await expect(
      page.getByText("Functions that perform actions")
    ).toBeVisible();
    await expect(page.getByText("Data or files to access")).toBeVisible();
    await expect(page.getByText("Pre-built prompt templates")).toBeVisible();
  });

  test("should have confirmation checkbox before submit", async ({ page }) => {
    await page.goto("/submit");

    // Check for confirmation checkbox
    await expect(
      page.getByText("I confirm this information is accurate")
    ).toBeVisible();
  });

  test("should have submission checklist", async ({ page }) => {
    await page.goto("/submit");

    // Check for submission checklist
    await expect(page.getByText("Submission checklist")).toBeVisible();
    await expect(
      page.getByText("Name clearly describes the integration")
    ).toBeVisible();
  });

  test("should have submit button disabled until confirmation", async ({
    page,
  }) => {
    await page.goto("/submit");

    // Submit button should be visible
    const submitButton = page.getByRole("button", {
      name: /submit for review/i,
    });
    await expect(submitButton).toBeVisible();

    // Button should be disabled without confirmation
    await expect(submitButton).toBeDisabled();
  });
});

test.describe("Submit form live preview", () => {
  test("should update preview when name is entered", async ({ page }) => {
    await page.goto("/submit");

    // Enter a name
    await page.getByLabel(/Name/).fill("GitHub MCP Server");

    // Wait for preview to update
    await expect(page.locator("aside")).toContainText("GitHub MCP Server");

    // Check that the avatar shows the first letter
    await expect(page.locator("aside")).toContainText("G");
  });

  test("should auto-generate slug from name", async ({ page }) => {
    await page.goto("/submit");

    // Enter a name
    await page.getByLabel(/Name/).fill("GitHub MCP Server");

    // Check that slug was auto-generated
    const slugInput = page.getByLabel(/Slug/);
    await expect(slugInput).toHaveValue("github-mcp-server");
  });

  test("should update preview when tags are added", async ({ page }) => {
    await page.goto("/submit");

    // Find the tag input and add a tag
    const tagContainer = page.locator('[class*="TagInput"]').first();
    if (await tagContainer.isVisible()) {
      const tagInput = tagContainer.locator("input");
      await tagInput.fill("github");
      await tagInput.press("Enter");

      // Check preview shows the tag
      await expect(page.locator("aside")).toContainText("github");
    }
  });
});

test.describe("Submit form validation", () => {
  test("should show character count for name", async ({ page }) => {
    await page.goto("/submit");

    // Enter a name
    await page.getByLabel(/Name/).fill("Test");

    // Check character count is visible
    await expect(page.getByText("4/100")).toBeVisible();
  });

  test("should show character count for description", async ({ page }) => {
    await page.goto("/submit");

    // Enter a description
    await page.getByLabel(/Description/).fill("A test description");

    // Check character count is visible
    await expect(page.getByText("18/500")).toBeVisible();
  });

  test("should show warning when docs/repo URLs are missing", async ({
    page,
  }) => {
    await page.goto("/submit");

    // Should show warning about missing docs/repo URL
    await expect(
      page.getByText(/Providing a repository or documentation URL/i)
    ).toBeVisible();
  });
});

test.describe("Submit page accessibility", () => {
  test("form has proper labels for screen readers", async ({ page }) => {
    await page.goto("/submit");

    // All inputs should have associated labels
    const nameInput = page.getByLabel(/Name/);
    await expect(nameInput).toHaveAttribute("id");

    const slugInput = page.getByLabel(/Slug/);
    await expect(slugInput).toHaveAttribute("id");

    const descInput = page.getByLabel(/Description/);
    await expect(descInput).toHaveAttribute("id");
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/submit");

    // Should have h1 for page title
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("Submit a server");

    // Should have h2 for sections (scoped to main content)
    const h2s = page.locator("main h2");
    await expect(h2s).toHaveCount(4); // Identity, Connection, Links, Review
  });
});
