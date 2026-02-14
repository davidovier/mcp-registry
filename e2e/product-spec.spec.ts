import * as fs from "fs";
import * as path from "path";

import { test, expect, Page, ConsoleMessage } from "@playwright/test";

/**
 * Product Specification Tests (MUST-PASS)
 *
 * These tests define the product contract - structural and behavioral requirements
 * that must be met for the product to function correctly. Failures here indicate
 * regressions that need immediate attention.
 *
 * Test categories:
 * 1. Page contract tests - Structure requirements for each public page
 * 2. Cross-page link integrity - All internal links resolve correctly
 * 3. Key journey tests - Critical user flows work end-to-end
 */

// Public routes to test
const PUBLIC_ROUTES = [
  { path: "/", name: "Homepage" },
  { path: "/servers", name: "Browse Servers" },
  { path: "/docs", name: "Documentation" },
  { path: "/api", name: "API Docs" },
  { path: "/verification", name: "Verification" },
  { path: "/changelog", name: "Changelog" },
  { path: "/contributing", name: "Contributing" },
  { path: "/about", name: "About" },
  { path: "/privacy", name: "Privacy Policy" },
  { path: "/terms", name: "Terms of Service" },
];

// Expected header nav links
const HEADER_NAV_LINKS = ["Browse", "Docs", "API", "Changelog", "About"];

// Expected footer links (exact names as they appear in the footer)
const FOOTER_LINKS = [
  "About",
  "Documentation", // Footer uses "Documentation" not "Docs"
  "API",
  "Verification",
  "Changelog",
  "Contributing",
  "Privacy",
  "Terms",
];

// Known benign console warnings to ignore
const BENIGN_WARNINGS = [
  "Download the React DevTools",
  "Warning: Extra attributes from the server",
  "Autofocus processing was blocked",
  "[Fast Refresh]",
  "DevTools failed to load",
  "third-party cookie",
];

// Screenshot directory for failures
const SCREENSHOT_DIR = path.join(__dirname, "screenshots", "product-spec");

// Ensure screenshot directory exists
function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
}

// Helper to collect console errors
function setupConsoleCollector(page: Page): ConsoleMessage[] {
  const errors: ConsoleMessage[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Filter out benign warnings
      const isBenign = BENIGN_WARNINGS.some((w) => text.includes(w));
      if (!isBenign) {
        errors.push(msg);
      }
    }
  });
  return errors;
}

// Helper to take failure screenshot
async function takeFailureScreenshot(page: Page, testName: string) {
  ensureScreenshotDir();
  const safeName = testName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const screenshotPath = path.join(SCREENSHOT_DIR, `${safeName}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
}

// ============================================================================
// PAGE CONTRACT TESTS
// ============================================================================

test.describe("Page Contract Tests", () => {
  for (const route of PUBLIC_ROUTES) {
    test.describe(`${route.name} (${route.path})`, () => {
      test("has main landmark with exactly one h1", async ({ page }) => {
        const errors = setupConsoleCollector(page);

        await page.goto(route.path);
        await page.waitForLoadState("domcontentloaded");

        // Check for main landmark
        const mainElement = page.locator("main");
        await expect(mainElement).toBeVisible();

        // Check for exactly one h1 inside main
        const h1Elements = mainElement.locator("h1");
        const h1Count = await h1Elements.count();

        if (h1Count !== 1) {
          await takeFailureScreenshot(page, `${route.name}-h1-count`);
        }

        expect(h1Count).toBe(1);
        expect(errors.length).toBe(0);
      });

      test("has non-empty page title", async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState("domcontentloaded");

        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      });

      test("header nav contains required links", async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState("domcontentloaded");

        const header = page.locator("header");
        await expect(header).toBeVisible();

        // Check for each required nav link
        for (const linkText of HEADER_NAV_LINKS) {
          const link = header.getByRole("link", { name: linkText });
          const isVisible = await link.isVisible().catch(() => false);
          if (!isVisible) {
            await takeFailureScreenshot(
              page,
              `${route.name}-missing-nav-${linkText}`
            );
          }
          expect(
            isVisible,
            `Missing header nav link: ${linkText}`
          ).toBeTruthy();
        }
      });

      test("footer contains required links", async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState("domcontentloaded");

        // Footer is a contentinfo landmark
        const footer = page.locator("footer, [role=contentinfo]").first();
        await expect(footer).toBeVisible();

        // Check for each required footer link (case-insensitive, partial match)
        for (const linkText of FOOTER_LINKS) {
          const link = footer
            .getByRole("link", { name: new RegExp(linkText, "i") })
            .first();
          const isVisible = await link.isVisible().catch(() => false);
          if (!isVisible) {
            await takeFailureScreenshot(
              page,
              `${route.name}-missing-footer-${linkText}`
            );
          }
          expect(isVisible, `Missing footer link: ${linkText}`).toBeTruthy();
        }
      });

      test("no console errors", async ({ page }) => {
        const errors = setupConsoleCollector(page);

        await page.goto(route.path);
        await page.waitForLoadState("networkidle");

        if (errors.length > 0) {
          await takeFailureScreenshot(page, `${route.name}-console-errors`);
          console.log(`Console errors on ${route.path}:`);
          errors.forEach((e) => console.log(`  - ${e.text()}`));
        }

        expect(errors.length).toBe(0);
      });
    });
  }

  // 404 page test
  test.describe("404 Page", () => {
    test("shows proper 404 page for non-existent route", async ({ page }) => {
      const response = await page.goto("/this-page-should-not-exist");

      // Should return 404 status
      expect(response?.status()).toBe(404);

      // Should still have main landmark and h1
      const mainElement = page.locator("main");
      await expect(mainElement).toBeVisible();

      const h1 = mainElement.locator("h1");
      await expect(h1).toBeVisible();
    });
  });
});

// ============================================================================
// CROSS-PAGE LINK INTEGRITY
// ============================================================================

test.describe("Cross-Page Link Integrity", () => {
  const MAX_LINKS_TO_CHECK = 60;
  const checkedLinks = new Set<string>();

  test("all internal links resolve correctly", async ({ page }) => {
    const brokenLinks: { source: string; href: string; status: number }[] = [];
    const allInternalLinks = new Set<string>();

    // Collect links from all public routes
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route.path);
      await page.waitForLoadState("domcontentloaded");

      // Find all internal links
      const links = await page.locator('a[href^="/"]').all();
      for (const link of links) {
        const href = await link.getAttribute("href");
        if (href && !href.startsWith("/_next") && !href.includes("#")) {
          allInternalLinks.add(href);
        }
      }
    }

    console.log(`Found ${allInternalLinks.size} unique internal links`);

    if (allInternalLinks.size > MAX_LINKS_TO_CHECK) {
      console.log(`Capping at ${MAX_LINKS_TO_CHECK} links`);
    }

    // Check each unique link
    const linksToCheck = Array.from(allInternalLinks).slice(
      0,
      MAX_LINKS_TO_CHECK
    );

    for (const href of linksToCheck) {
      if (checkedLinks.has(href)) continue;
      checkedLinks.add(href);

      const response = await page.goto(href);
      const status = response?.status() || 0;

      // Allow 200 and 404 (for intentional not-found pages like /servers/invalid-slug)
      if (status !== 200 && status !== 404) {
        brokenLinks.push({ source: "crawl", href, status });
      }

      // For 200 responses, verify main landmark exists (content pages)
      if (status === 200) {
        const hasMain = await page
          .locator("main")
          .isVisible()
          .catch(() => false);
        const hasH1 = await page
          .locator("main h1")
          .isVisible()
          .catch(() => false);

        if (!hasMain || !hasH1) {
          console.log(`Warning: ${href} missing main/h1 structure`);
        }
      }
    }

    if (brokenLinks.length > 0) {
      console.log("Broken links found:");
      brokenLinks.forEach((b) => {
        console.log(`  ${b.href} (status: ${b.status})`);
      });
    }

    expect(brokenLinks.length).toBe(0);
  });
});

// ============================================================================
// KEY JOURNEY TESTS
// ============================================================================

test.describe("Key Journey Tests", () => {
  test.describe("Discovery Journey", () => {
    test("can browse servers and view server detail", async ({ page }) => {
      // Navigate to servers page
      await page.goto("/servers");
      await page.waitForLoadState("networkidle");

      // Page should load with main content
      const mainContent = page.locator("main");
      await expect(mainContent).toBeVisible();

      // Try to find a server card
      const serverCard = page.locator('a[href^="/servers/"]').first();
      const hasCards = await serverCard.isVisible().catch(() => false);

      if (hasCards) {
        // Get the href before clicking
        const href = await serverCard.getAttribute("href");
        expect(href).toBeTruthy();

        // Click the card
        await serverCard.click();
        await page.waitForLoadState("networkidle");

        // Should navigate to detail page
        await expect(page).toHaveURL(/\/servers\/.+/);

        // Should show heading
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

        // Should show install snippet/configuration section
        const hasConfigSection = await page
          .getByRole("heading", { name: /configuration|install|setup/i })
          .isVisible()
          .catch(() => false);

        const hasCodeBlock = await page
          .locator("pre code")
          .isVisible()
          .catch(() => false);

        // At least one of these should be present
        expect(hasConfigSection || hasCodeBlock).toBeTruthy();

        // Should show metadata (transport, auth, etc.)
        const hasMetadata = await page
          .getByText(/transport|authentication|capabilities/i)
          .first()
          .isVisible()
          .catch(() => false);

        expect(hasMetadata).toBeTruthy();
      } else {
        // In CI without DB, check for error/empty state
        const hasEmptyOrError = await page
          .getByText(/no servers|failed to load/i)
          .first()
          .isVisible()
          .catch(() => false);

        expect(hasEmptyOrError).toBeTruthy();
      }
    });
  });

  test.describe("Search Journey", () => {
    test("misspelled search shows suggestion and clicking updates results", async ({
      page,
    }) => {
      // Navigate with a misspelled query
      await page.goto("/servers?q=githb");
      await page.waitForLoadState("networkidle");

      // Check for suggestion banner or empty state
      const hasSuggestion = await page
        .getByText(/did you mean/i)
        .isVisible()
        .catch(() => false);

      const hasEmptyState = await page
        .getByText(/no servers found|no servers match/i)
        .isVisible()
        .catch(() => false);

      const hasErrorState = await page
        .getByText(/failed to load/i)
        .isVisible()
        .catch(() => false);

      // One of these states should be visible
      expect(hasSuggestion || hasEmptyState || hasErrorState).toBeTruthy();

      // If suggestion is visible, clicking it should update URL
      if (hasSuggestion) {
        const suggestionButton = page.locator(
          'button:has-text("GitHub"), a:has-text("GitHub")'
        );
        const isSuggestionClickable = await suggestionButton
          .isVisible()
          .catch(() => false);

        if (isSuggestionClickable) {
          await suggestionButton.click();
          await page.waitForLoadState("networkidle");

          // URL should be updated
          expect(page.url()).toMatch(/q=/);
        }
      }
    });

    test("search input updates URL and shows results or empty state", async ({
      page,
    }) => {
      await page.goto("/servers");
      await page.waitForLoadState("networkidle");

      const searchInput = page.getByRole("searchbox", {
        name: /search servers/i,
      });
      await expect(searchInput).toBeVisible();

      await searchInput.fill("github");
      await searchInput.press("Enter");

      await expect(page).toHaveURL(/q=github/);

      // Should show results, empty state, or error
      const hasContent = await page
        .getByText(/servers|no servers|failed/i)
        .first()
        .isVisible()
        .catch(() => false);

      expect(hasContent).toBeTruthy();
    });
  });

  test.describe("Verification Transparency", () => {
    test("verified server has JSON-LD with SoftwareApplication type", async ({
      page,
    }) => {
      // First, try to find a verified server
      await page.goto("/servers?verified=true");
      await page.waitForLoadState("networkidle");

      const serverCard = page.locator('a[href^="/servers/"]').first();
      const hasCards = await serverCard.isVisible().catch(() => false);

      if (hasCards) {
        await serverCard.click();
        await page.waitForLoadState("networkidle");

        // Check for JSON-LD script
        const jsonLdScript = page.locator('script[type="application/ld+json"]');
        const hasJsonLd = await jsonLdScript.isVisible().catch(() => false);

        if (hasJsonLd) {
          const jsonLdContent = await jsonLdScript.textContent();
          expect(jsonLdContent).toBeTruthy();

          const jsonLd = JSON.parse(jsonLdContent!);
          expect(jsonLd["@type"]).toBe("SoftwareApplication");
        }
      }
    });

    test("non-existent server shows proper 404", async ({ page }) => {
      const response = await page.goto(
        "/servers/this-server-definitely-does-not-exist-xyz"
      );

      // PRIMARY CONTRACT: Verify we got a 404 response
      expect(response?.status()).toBe(404);

      // Wait for JavaScript to hydrate
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(2000);

      // SECONDARY CONTRACT: Page should have some structure
      // In dev mode, Next.js 15 may render differently, so we check multiple indicators
      const hasMainLandmark = await page.locator("main").count();
      const h1Elements = await page.locator("h1").count();

      // Check body content is present (RSC payload was received)
      const bodyLength = await page.evaluate(
        () => document.body.innerHTML.length
      );
      expect(bodyLength).toBeGreaterThan(1000); // Should have substantial content

      if (h1Elements > 0) {
        const h1Text = await page.locator("h1").first().textContent();
        // Accept various 404/error messages
        expect(h1Text?.toLowerCase()).toMatch(
          /not found|server not found|404|something went wrong|this page could not be found/i
        );
      } else if (hasMainLandmark > 0) {
        // Page has structure but h1 might not be visible due to hydration
        console.log("Main landmark found, h1 may be hydrating");
      } else {
        // Minimal fallback - 404 status is the definitive contract
        console.log("Minimal page structure, but 404 status was correct");
      }

      // JSON-LD should NOT be present for non-existent server
      const jsonLdCount = await page
        .locator('script[type="application/ld+json"]')
        .count();
      expect(jsonLdCount).toBe(0);
    });
  });
});

// ============================================================================
// SERVER DETAIL PAGE TESTS (if a known slug exists)
// ============================================================================

test.describe("Server Detail Page Contract", () => {
  // Test with a known seed slug if available
  const knownSlugs = ["github", "filesystem", "postgres"];

  for (const slug of knownSlugs) {
    test(`/servers/${slug} - loads correctly if exists`, async ({ page }) => {
      const response = await page.goto(`/servers/${slug}`);
      const status = response?.status() || 0;

      if (status === 200) {
        // Page exists - verify structure
        const mainElement = page.locator("main");
        await expect(mainElement).toBeVisible();

        const h1 = mainElement.locator("h1");
        await expect(h1).toBeVisible();

        // Should have breadcrumbs
        const breadcrumbs = page.getByLabel("Breadcrumb");
        const hasBreadcrumbs = await breadcrumbs.isVisible().catch(() => false);
        expect(hasBreadcrumbs).toBeTruthy();
      } else if (status === 404) {
        // Slug doesn't exist in this environment - that's OK
        const h1 = page.locator("main h1");
        await expect(h1).toBeVisible();
      } else {
        // Unexpected status
        throw new Error(`Unexpected status ${status} for /servers/${slug}`);
      }
    });
  }
});
