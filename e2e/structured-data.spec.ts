import { test, expect } from "@playwright/test";

/**
 * Tests for JSON-LD structured data on server detail pages.
 * Verified servers should have Schema.org SoftwareApplication markup.
 * Unverified servers should NOT have JSON-LD script.
 */
test.describe("JSON-LD structured data", () => {
  test("verified server page should contain valid JSON-LD", async ({
    page,
  }) => {
    // Navigate to a known verified server (github is verified in seed data)
    await page.goto("/servers/github");
    await page.waitForLoadState("networkidle");

    // Check if page loaded correctly (not 404)
    const heading = page.getByRole("heading", { level: 1 });
    const hasHeading = await heading.isVisible().catch(() => false);

    if (!hasHeading) {
      // In CI without DB, server may not exist - skip test
      test.skip();
      return;
    }

    // Find the JSON-LD script (script tags are not "visible" but exist in DOM)
    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toHaveCount(1);

    // Get the script content and parse it
    const scriptContent = await jsonLdScript.textContent();
    expect(scriptContent).toBeTruthy();

    const jsonLd = JSON.parse(scriptContent!);

    // Verify required fields
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("SoftwareApplication");
    expect(jsonLd.name).toBeTruthy();
    expect(jsonLd.description).toBeTruthy();
    expect(jsonLd.url).toContain("/servers/github");
    expect(jsonLd.publisher).toEqual({
      "@type": "Organization",
      name: "MCP Registry",
    });
    expect(jsonLd.isBasedOn).toContain("/verification");

    // Verify additionalProperty includes verified=true
    expect(jsonLd.additionalProperty).toBeInstanceOf(Array);
    const verifiedProp = jsonLd.additionalProperty.find(
      (prop: { name: string; value: unknown }) =>
        prop.name === "verified" && prop.value === true
    );
    expect(verifiedProp).toBeTruthy();
  });

  test("verified server JSON-LD should include optional fields when available", async ({
    page,
  }) => {
    // GitHub server has repo_url, docs_url, and tags in seed data
    await page.goto("/servers/github");
    await page.waitForLoadState("networkidle");

    const heading = page.getByRole("heading", { level: 1 });
    const hasHeading = await heading.isVisible().catch(() => false);

    if (!hasHeading) {
      test.skip();
      return;
    }

    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toHaveCount(1);
    const scriptContent = await jsonLdScript.textContent();
    const jsonLd = JSON.parse(scriptContent!);

    // GitHub server should have these fields from seed data
    expect(jsonLd.codeRepository).toBeTruthy();
    expect(jsonLd.softwareHelp).toBeTruthy();
    expect(jsonLd.keywords).toBeInstanceOf(Array);
    expect(jsonLd.keywords.length).toBeGreaterThan(0);
    expect(jsonLd.dateCreated).toBeTruthy();
    expect(jsonLd.dateModified).toBeTruthy();
  });

  test("unverified server page should NOT contain JSON-LD script", async ({
    page,
  }) => {
    // Navigate to a known unverified server (web-search is unverified in seed data)
    await page.goto("/servers/web-search");
    await page.waitForLoadState("networkidle");

    // Check if page loaded correctly (not 404)
    const heading = page.getByRole("heading", { level: 1 });
    const hasHeading = await heading.isVisible().catch(() => false);

    if (!hasHeading) {
      // In CI without DB, server may not exist - skip test
      test.skip();
      return;
    }

    // Verify JSON-LD script does NOT exist
    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toHaveCount(0);
  });
});
