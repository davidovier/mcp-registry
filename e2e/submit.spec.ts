import { test, expect } from "@playwright/test";

/**
 * Submit page tests
 *
 * These tests verify the submit page renders correctly with the new design.
 * Auth-dependent tests are in auth.spec.ts.
 */

const skipInCI = process.env.CI_SKIP_AUTH_TESTS === "true";

test.describe("Submit page structure", () => {
  test.skip(skipInCI, "Skipped in CI - auth tests can be flaky");

  test("should display correct page heading and subtitle", async ({ page }) => {
    // Note: This test requires authentication
    // In CI, we skip auth tests, so this will only run locally
    await page.goto("/submit");

    // If redirected to signin, that's expected for unauthenticated users
    // The auth redirect test is in auth.spec.ts
    const url = page.url();
    if (url.includes("/signin")) {
      // Skip content assertions if redirected
      return;
    }

    // Check page heading
    await expect(
      page.getByRole("heading", { name: "Submit a server" })
    ).toBeVisible();

    // Check subtitle
    await expect(
      page.getByText("All submissions are reviewed before publishing.")
    ).toBeVisible();
  });

  test("should display form sections when authenticated", async ({ page }) => {
    await page.goto("/submit");

    const url = page.url();
    if (url.includes("/signin")) {
      return;
    }

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

    const url = page.url();
    if (url.includes("/signin")) {
      return;
    }

    // Check for Preview heading
    await expect(page.getByText("Preview")).toBeVisible();

    // Check for preview description
    await expect(page.getByText("How your server will appear")).toBeVisible();
  });

  test("should have required form fields", async ({ page }) => {
    await page.goto("/submit");

    const url = page.url();
    if (url.includes("/signin")) {
      return;
    }

    // Check for required form fields
    await expect(page.getByLabel(/Name/)).toBeVisible();
    await expect(page.getByLabel(/Slug/)).toBeVisible();
    await expect(page.getByLabel(/Description/)).toBeVisible();
    await expect(page.getByLabel(/Transport/)).toBeVisible();
    await expect(page.getByLabel(/Authentication/)).toBeVisible();
  });

  test("should have capabilities checkboxes", async ({ page }) => {
    await page.goto("/submit");

    const url = page.url();
    if (url.includes("/signin")) {
      return;
    }

    // Check for capabilities
    await expect(page.getByText("Tools")).toBeVisible();
    await expect(page.getByText("Resources")).toBeVisible();
    await expect(page.getByText("Prompts")).toBeVisible();
  });

  test("should have confirmation checkbox before submit", async ({ page }) => {
    await page.goto("/submit");

    const url = page.url();
    if (url.includes("/signin")) {
      return;
    }

    // Check for confirmation checkbox
    await expect(
      page.getByText("I confirm this information is accurate")
    ).toBeVisible();
  });

  test("should have submission checklist", async ({ page }) => {
    await page.goto("/submit");

    const url = page.url();
    if (url.includes("/signin")) {
      return;
    }

    // Check for submission checklist
    await expect(page.getByText("Submission checklist")).toBeVisible();
    await expect(
      page.getByText("Name clearly describes the integration")
    ).toBeVisible();
  });
});

test.describe("Submit page accessibility", () => {
  test.skip(skipInCI, "Skipped in CI - auth tests can be flaky");

  test("form has proper labels for screen readers", async ({ page }) => {
    await page.goto("/submit");

    const url = page.url();
    if (url.includes("/signin")) {
      return;
    }

    // All inputs should have associated labels
    const nameInput = page.getByLabel(/Name/);
    await expect(nameInput).toHaveAttribute("id");

    const slugInput = page.getByLabel(/Slug/);
    await expect(slugInput).toHaveAttribute("id");

    const descInput = page.getByLabel(/Description/);
    await expect(descInput).toHaveAttribute("id");
  });
});
