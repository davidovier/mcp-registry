import * as fs from "fs";
import * as path from "path";

import { test, Page } from "@playwright/test";

/**
 * Product Inventory Tests (Non-Gating)
 *
 * These tests crawl public pages and generate a comprehensive inventory report.
 * The report captures page metadata, structure, and links for analysis.
 *
 * Output: e2e/reports/product-inventory.json
 *
 * This is non-gating - failures here are logged but don't block CI.
 * The primary purpose is to generate actionable data about the product.
 */

// Public routes to inventory
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
  { path: "/signin", name: "Sign In" },
  { path: "/submit", name: "Submit Server" },
];

// Report output path
const REPORT_PATH = path.join(__dirname, "reports", "product-inventory.json");

// Ensure reports directory exists
function ensureReportsDir() {
  const reportsDir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
}

// Page inventory data structure
interface PageInventory {
  url: string;
  name: string;
  status: number;
  title: string | null;
  h1Text: string | null;
  internalLinkCount: number;
  internalLinks: string[];
  externalLinkCount: number;
  hasBreadcrumbs: boolean;
  hasEmptyState: boolean;
  hasCodeBlock: boolean;
  hasTable: boolean;
  hasForm: boolean;
  hasSearchInput: boolean;
  a11y: {
    hasMainLandmark: boolean;
    hasH1: boolean;
    hasSkipLink: boolean;
    hasHeaderNav: boolean;
    hasFooter: boolean;
  };
  errors: string[];
}

// Full inventory report structure
interface InventoryReport {
  generatedAt: string;
  baseUrl: string;
  pageCount: number;
  totalInternalLinks: number;
  uniqueInternalLinks: string[];
  pages: PageInventory[];
  summary: {
    pagesWithErrors: number;
    pagesWithoutH1: number;
    pagesWithoutMain: number;
    pagesWithEmptyState: number;
    pagesWithCodeBlocks: number;
    pagesWithTables: number;
    pagesWithForms: number;
    pagesWithBreadcrumbs: number;
  };
}

// Helper to collect page inventory
async function collectPageInventory(
  page: Page,
  route: { path: string; name: string }
): Promise<PageInventory> {
  const errors: string[] = [];

  // Collect console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text().slice(0, 200)); // Truncate long errors
    }
  });

  const response = await page.goto(route.path);
  await page.waitForLoadState("domcontentloaded");

  const status = response?.status() || 0;
  const title = await page.title().catch(() => null);

  // Get h1 text
  let h1Text: string | null = null;
  try {
    const h1 = page.locator("main h1").first();
    if (await h1.isVisible().catch(() => false)) {
      h1Text = await h1.textContent();
    }
  } catch {
    // h1 not found
  }

  // Collect internal links
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];

  try {
    const links = await page.locator("a[href]").all();
    for (const link of links) {
      const href = await link.getAttribute("href");
      if (!href) continue;

      if (href.startsWith("/") && !href.startsWith("/_next")) {
        // Normalize and dedupe
        const normalized = href.split("?")[0].split("#")[0];
        if (!internalLinks.includes(normalized)) {
          internalLinks.push(normalized);
        }
      } else if (href.startsWith("http") && !href.includes("localhost")) {
        externalLinks.push(href);
      }
    }
  } catch {
    // Link collection failed
  }

  // Check for various UI elements
  const hasBreadcrumbs = await page
    .getByLabel("Breadcrumb")
    .isVisible()
    .catch(() => false);

  const hasEmptyState = await page
    .getByText(/no .* found|empty|nothing here/i)
    .first()
    .isVisible()
    .catch(() => false);

  const hasCodeBlock = await page
    .locator("pre code")
    .isVisible()
    .catch(() => false);

  const hasTable = await page
    .locator("table")
    .isVisible()
    .catch(() => false);

  const hasForm = await page
    .locator("form")
    .isVisible()
    .catch(() => false);

  const hasSearchInput = await page
    .getByRole("searchbox")
    .isVisible()
    .catch(() => false);

  // A11y checks
  const hasMainLandmark = await page
    .locator("main")
    .isVisible()
    .catch(() => false);

  const hasH1 = await page
    .locator("h1")
    .isVisible()
    .catch(() => false);

  const hasSkipLink = await page
    .locator('a[href="#main-content"], a:has-text("Skip to content")')
    .isVisible()
    .catch(() => false);

  const hasHeaderNav = await page
    .locator("header nav")
    .isVisible()
    .catch(() => false);

  const hasFooter = await page
    .locator("footer")
    .isVisible()
    .catch(() => false);

  return {
    url: route.path,
    name: route.name,
    status,
    title,
    h1Text: h1Text?.trim() || null,
    internalLinkCount: internalLinks.length,
    internalLinks: internalLinks.sort(),
    externalLinkCount: externalLinks.length,
    hasBreadcrumbs,
    hasEmptyState,
    hasCodeBlock,
    hasTable,
    hasForm,
    hasSearchInput,
    a11y: {
      hasMainLandmark,
      hasH1,
      hasSkipLink,
      hasHeaderNav,
      hasFooter,
    },
    errors,
  };
}

// Main inventory collection test
test.describe("Product Inventory", () => {
  test("generate comprehensive page inventory", async ({ page, baseURL }) => {
    ensureReportsDir();

    const pages: PageInventory[] = [];
    const allInternalLinks = new Set<string>();

    console.log("\n=== Product Inventory Collection ===\n");

    for (const route of PUBLIC_ROUTES) {
      console.log(`Scanning: ${route.name} (${route.path})`);

      try {
        const inventory = await collectPageInventory(page, route);

        // Sort internal links for deterministic output
        inventory.internalLinks.sort();

        pages.push(inventory);

        // Collect all unique internal links
        inventory.internalLinks.forEach((link) => allInternalLinks.add(link));

        // Log quick summary
        console.log(
          `  Status: ${inventory.status} | H1: ${inventory.h1Text?.slice(0, 30) || "MISSING"} | Links: ${inventory.internalLinkCount}`
        );

        if (inventory.errors.length > 0) {
          console.log(`  Errors: ${inventory.errors.length}`);
        }
      } catch (error) {
        console.log(`  ERROR: ${error}`);
        pages.push({
          url: route.path,
          name: route.name,
          status: 0,
          title: null,
          h1Text: null,
          internalLinkCount: 0,
          internalLinks: [],
          externalLinkCount: 0,
          hasBreadcrumbs: false,
          hasEmptyState: false,
          hasCodeBlock: false,
          hasTable: false,
          hasForm: false,
          hasSearchInput: false,
          a11y: {
            hasMainLandmark: false,
            hasH1: false,
            hasSkipLink: false,
            hasHeaderNav: false,
            hasFooter: false,
          },
          errors: [String(error)],
        });
      }
    }

    // Calculate summary
    const summary = {
      pagesWithErrors: pages.filter((p) => p.errors.length > 0).length,
      pagesWithoutH1: pages.filter((p) => !p.a11y.hasH1).length,
      pagesWithoutMain: pages.filter((p) => !p.a11y.hasMainLandmark).length,
      pagesWithEmptyState: pages.filter((p) => p.hasEmptyState).length,
      pagesWithCodeBlocks: pages.filter((p) => p.hasCodeBlock).length,
      pagesWithTables: pages.filter((p) => p.hasTable).length,
      pagesWithForms: pages.filter((p) => p.hasForm).length,
      pagesWithBreadcrumbs: pages.filter((p) => p.hasBreadcrumbs).length,
    };

    // Build full report
    const report: InventoryReport = {
      generatedAt: new Date().toISOString(),
      baseUrl: baseURL || "http://localhost:3000",
      pageCount: pages.length,
      totalInternalLinks: allInternalLinks.size,
      uniqueInternalLinks: Array.from(allInternalLinks).sort(),
      pages,
      summary,
    };

    // Write report
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`\nReport written to: ${REPORT_PATH}`);

    // Print summary table
    console.log("\n=== Inventory Summary ===\n");
    console.log(`Pages Scanned:       ${report.pageCount}`);
    console.log(`Unique Internal Links: ${report.totalInternalLinks}`);
    console.log(`Pages with Errors:   ${summary.pagesWithErrors}`);
    console.log(`Pages without H1:    ${summary.pagesWithoutH1}`);
    console.log(`Pages without Main:  ${summary.pagesWithoutMain}`);
    console.log(`Pages with Empty State: ${summary.pagesWithEmptyState}`);
    console.log(`Pages with Code Blocks: ${summary.pagesWithCodeBlocks}`);
    console.log(`Pages with Tables:   ${summary.pagesWithTables}`);
    console.log(`Pages with Forms:    ${summary.pagesWithForms}`);
    console.log(`Pages with Breadcrumbs: ${summary.pagesWithBreadcrumbs}`);

    // Print page-by-page table
    console.log("\n=== Page Details ===\n");
    console.log("| Page | Status | H1 | Main | Breadcrumbs | Links |");
    console.log("|------|--------|----|----- |-------------|-------|");

    for (const p of pages) {
      const h1 = p.a11y.hasH1 ? "Y" : "N";
      const main = p.a11y.hasMainLandmark ? "Y" : "N";
      const breadcrumbs = p.hasBreadcrumbs ? "Y" : "N";
      console.log(
        `| ${p.name.padEnd(20)} | ${p.status} | ${h1} | ${main} | ${breadcrumbs} | ${p.internalLinkCount} |`
      );
    }

    console.log("\n");
  });

  test("inventory discovered links (cap at 60)", async ({ page }) => {
    // This test validates that discovered links from the main inventory are reachable
    // It's separated to allow parallel execution

    const MAX_LINKS = 60;
    let linksChecked = 0;
    const linkResults: { url: string; status: number; hasMain: boolean }[] = [];

    // Read the inventory report if it exists
    let uniqueLinks: string[] = [];

    if (fs.existsSync(REPORT_PATH)) {
      try {
        const report = JSON.parse(
          fs.readFileSync(REPORT_PATH, "utf-8")
        ) as InventoryReport;
        uniqueLinks = report.uniqueInternalLinks;
      } catch {
        console.log("Could not read inventory report");
      }
    }

    if (uniqueLinks.length === 0) {
      console.log("No links to check - run main inventory first");
      return;
    }

    console.log(`\n=== Link Validation (max ${MAX_LINKS}) ===\n`);
    console.log(`Total discovered links: ${uniqueLinks.length}`);

    if (uniqueLinks.length > MAX_LINKS) {
      console.log(`Capping at ${MAX_LINKS} links`);
    }

    const linksToCheck = uniqueLinks.slice(0, MAX_LINKS);

    for (const link of linksToCheck) {
      if (linksChecked >= MAX_LINKS) break;

      try {
        const response = await page.goto(link);
        const status = response?.status() || 0;
        const hasMain = await page
          .locator("main")
          .isVisible()
          .catch(() => false);

        linkResults.push({ url: link, status, hasMain });
        linksChecked++;

        if (status !== 200 && status !== 404) {
          console.log(`  WARNING: ${link} returned ${status}`);
        }
      } catch (error) {
        console.log(`  ERROR: ${link} - ${error}`);
        linkResults.push({ url: link, status: 0, hasMain: false });
        linksChecked++;
      }
    }

    // Summary
    const ok = linkResults.filter((r) => r.status === 200).length;
    const notFound = linkResults.filter((r) => r.status === 404).length;
    const errors = linkResults.filter(
      (r) => r.status !== 200 && r.status !== 404
    ).length;

    console.log(`\nLinks checked: ${linksChecked}`);
    console.log(`  200 OK: ${ok}`);
    console.log(`  404 Not Found: ${notFound}`);
    console.log(`  Errors: ${errors}`);

    // Update report with link validation results
    if (fs.existsSync(REPORT_PATH)) {
      try {
        const report = JSON.parse(fs.readFileSync(REPORT_PATH, "utf-8"));
        report.linkValidation = {
          checkedAt: new Date().toISOString(),
          linksChecked,
          results: {
            ok,
            notFound,
            errors,
          },
          brokenLinks: linkResults
            .filter((r) => r.status !== 200 && r.status !== 404)
            .map((r) => ({ url: r.url, status: r.status })),
        };
        fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
        console.log(`\nLink validation added to report`);
      } catch {
        // Report update failed
      }
    }
  });
});

// Additional inventory tests for specific features
test.describe("Feature Inventory", () => {
  test("server detail pages structure check", async ({ page }) => {
    // Navigate to servers page to find detail page links
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    const serverLinks = await page.locator('a[href^="/servers/"]').all();
    const detailPages: {
      slug: string;
      hasJsonLd: boolean;
      hasBadge: boolean;
      hasCode: boolean;
    }[] = [];

    // Check up to 5 server detail pages
    const linksToCheck = serverLinks.slice(0, 5);

    for (const link of linksToCheck) {
      const href = await link.getAttribute("href");
      if (!href || href === "/servers") continue;

      const slug = href.replace("/servers/", "");

      await page.goto(href);
      await page.waitForLoadState("domcontentloaded");

      const hasJsonLd = await page
        .locator('script[type="application/ld+json"]')
        .isVisible()
        .catch(() => false);

      const hasBadge = await page
        .getByLabel("Verified")
        .isVisible()
        .catch(() => false);

      const hasCode = await page
        .locator("pre code")
        .isVisible()
        .catch(() => false);

      detailPages.push({ slug, hasJsonLd, hasBadge, hasCode });
    }

    if (detailPages.length > 0) {
      console.log("\n=== Server Detail Page Inventory ===\n");
      console.log("| Slug | JSON-LD | Verified Badge | Code Block |");
      console.log("|------|---------|----------------|------------|");

      for (const p of detailPages) {
        const jsonLd = p.hasJsonLd ? "Y" : "N";
        const badge = p.hasBadge ? "Y" : "N";
        const code = p.hasCode ? "Y" : "N";
        console.log(
          `| ${p.slug.padEnd(20)} | ${jsonLd} | ${badge} | ${code} |`
        );
      }
    } else {
      console.log("No server detail pages found to inventory");
    }
  });
});
