import * as fs from "fs";
import * as path from "path";

import { test, Page } from "@playwright/test";

/**
 * Product Inventory Tests (Non-Gating)
 *
 * These tests crawl public pages and generate a comprehensive inventory report.
 * The report captures page metadata, structure, and links for analysis.
 *
 * Output:
 * - e2e/reports/product-inventory.json
 * - e2e/reports/product-gaps.json
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
const GAP_REPORT_PATH = path.join(__dirname, "reports", "product-gaps.json");
const PERF_REPORT_PATH = path.join(__dirname, "reports", "perf-report.json");
const HEURISTICS_REPORT_PATH = path.join(
  __dirname,
  "reports",
  "product-heuristics.json"
);

const EXPECTED_HEADER_NAV_LINKS = [
  "Browse",
  "Docs",
  "API",
  "Changelog",
  "About",
];
const EXPECTED_FOOTER_LINKS = [
  "About",
  "Documentation",
  "API",
  "Verification",
  "Changelog",
  "Contributing",
  "Privacy",
  "Terms",
];

const PERFORMANCE_THRESHOLDS = {
  ttfbMs: 300,
  domContentLoadedMs: 1200,
  resourceCount: 30,
  totalTransferKB: 2500,
  severeTtfbMs: 1000,
  severeDomContentLoadedMs: 3000,
  severeResourceCount: 80,
  severeTotalTransferKB: 4000,
};

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
  metadata: {
    hasDescription: boolean;
    hasOgTitle: boolean;
    hasOgDescription: boolean;
  };
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
  headerLinks: string[];
  footerLinks: string[];
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
  linkValidation?: {
    checkedAt: string;
    linksChecked: number;
    results: {
      ok: number;
      notFound: number;
      errors: number;
    };
    statusByUrl: Record<string, number>;
    brokenLinks: { url: string; status: number }[];
    brokenLinksDetailed: { from: string; to: string; status: number }[];
  };
}

interface ProductGapReport {
  timestamp: string;
  routesAudited: string[];
  brokenLinks: { from: string; to: string; status: number }[];
  missingRoutes: string[];
  navCoverage: {
    headerLinks: string[];
    footerLinks: string[];
    missingInHeader: string[];
    missingInFooter: string[];
  };
  metadataIssues: { route: string; issue: string }[];
  a11yIssuesSummary: Record<
    string,
    {
      issueCount: number;
      missingMainLandmark: number;
      missingH1: number;
      missingSkipLink: number;
      missingHeaderNav: number;
      missingFooter: number;
      consoleErrors: number;
    }
  >;
  performanceFlags: {
    source: string | null;
    thresholds: typeof PERFORMANCE_THRESHOLDS;
    flags: {
      route: string;
      metric:
        | "ttfbMs"
        | "domContentLoadedMs"
        | "resourceCount"
        | "totalTransferKB";
      value: number;
      threshold: number;
      severity: "warning" | "severe";
    }[];
    note: string;
  };
  heuristicGaps?: {
    source: string | null;
    generatedAt: string | null;
    gaps: HeuristicGap[];
    conversion: HeuristicGap[];
    summary: {
      totalGaps: number;
      gapsBySeverity: Record<Severity, number>;
      topOffenders: { route: string; gapCount: number }[];
    };
  };
  notes: string[];
}

type Severity = "critical" | "high" | "medium" | "low";

interface HeuristicGap {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  description: string;
  route: string;
  evidence?: string;
  screenshotPath?: string;
  suggestedFix: string;
  effortEstimate: "S" | "M" | "L";
}

interface HeuristicReport {
  generatedAt: string;
  pages: Array<{ route: string; gaps: HeuristicGap[] }>;
  summary: {
    totalGaps: number;
    gapsBySeverity: Record<Severity, number>;
    topOffenders: { route: string; gapCount: number }[];
  };
}

function sortedUnique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function sortObjectByKey<T>(input: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.entries(input).sort(([a], [b]) => a.localeCompare(b))
  );
}

function normalizeLink(href: string): string {
  return href.split("?")[0].split("#")[0];
}

function normalizeLabel(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

async function collectRegionLinkLabels(
  page: Page,
  selector: string
): Promise<string[]> {
  const labels: string[] = [];
  const links = page.locator(`${selector} a[href]`);
  const count = await links.count().catch(() => 0);

  for (let i = 0; i < count; i++) {
    const label = normalizeLabel((await links.nth(i).textContent()) || "");
    if (label) labels.push(label);
  }

  return sortedUnique(labels);
}

function derivePerformanceFlags(): ProductGapReport["performanceFlags"] {
  if (!fs.existsSync(PERF_REPORT_PATH)) {
    return {
      source: null,
      thresholds: PERFORMANCE_THRESHOLDS,
      flags: [],
      note: "perf-report.json not found",
    };
  }

  try {
    const perfReport = JSON.parse(
      fs.readFileSync(PERF_REPORT_PATH, "utf-8")
    ) as {
      pages?: Record<
        string,
        {
          url?: string;
          ttfbMs?: number;
          domContentLoadedMs?: number;
          resourceCount?: number;
          totalTransferKB?: number;
        }
      >;
    };

    const flags: ProductGapReport["performanceFlags"]["flags"] = [];
    const pages = perfReport.pages || {};

    for (const pageData of Object.values(pages)) {
      const route = pageData.url || "unknown";
      const metrics: Array<{
        metric:
          | "ttfbMs"
          | "domContentLoadedMs"
          | "resourceCount"
          | "totalTransferKB";
        value?: number;
        threshold: number;
        severeThreshold: number;
      }> = [
        {
          metric: "ttfbMs",
          value: pageData.ttfbMs,
          threshold: PERFORMANCE_THRESHOLDS.ttfbMs,
          severeThreshold: PERFORMANCE_THRESHOLDS.severeTtfbMs,
        },
        {
          metric: "domContentLoadedMs",
          value: pageData.domContentLoadedMs,
          threshold: PERFORMANCE_THRESHOLDS.domContentLoadedMs,
          severeThreshold: PERFORMANCE_THRESHOLDS.severeDomContentLoadedMs,
        },
        {
          metric: "resourceCount",
          value: pageData.resourceCount,
          threshold: PERFORMANCE_THRESHOLDS.resourceCount,
          severeThreshold: PERFORMANCE_THRESHOLDS.severeResourceCount,
        },
        {
          metric: "totalTransferKB",
          value: pageData.totalTransferKB,
          threshold: PERFORMANCE_THRESHOLDS.totalTransferKB,
          severeThreshold: PERFORMANCE_THRESHOLDS.severeTotalTransferKB,
        },
      ];

      for (const metric of metrics) {
        if (typeof metric.value !== "number") continue;
        if (metric.value <= metric.threshold) continue;

        flags.push({
          route,
          metric: metric.metric,
          value: metric.value,
          threshold: metric.threshold,
          severity:
            metric.value > metric.severeThreshold ? "severe" : "warning",
        });
      }
    }

    flags.sort((a, b) =>
      `${a.route}:${a.metric}`.localeCompare(`${b.route}:${b.metric}`)
    );

    return {
      source: PERF_REPORT_PATH,
      thresholds: PERFORMANCE_THRESHOLDS,
      flags,
      note: "Performance flags are informative and do not block CI unless severe.",
    };
  } catch {
    return {
      source: PERF_REPORT_PATH,
      thresholds: PERFORMANCE_THRESHOLDS,
      flags: [],
      note: "Failed to parse perf-report.json",
    };
  }
}

function deriveGapReport(report: InventoryReport): ProductGapReport {
  const routesAudited = sortedUnique(report.pages.map((p) => p.url));
  const auditedRouteSet = new Set(routesAudited);
  const statusByUrl = report.linkValidation?.statusByUrl || {};

  const missingRoutes = report.uniqueInternalLinks
    .filter((route) => {
      const status = statusByUrl[route];
      if (status === 404 || status === 0) return true;
      return !auditedRouteSet.has(route);
    })
    .sort((a, b) => a.localeCompare(b));

  const headerLinks = sortedUnique(report.pages.flatMap((p) => p.headerLinks));
  const footerLinks = sortedUnique(report.pages.flatMap((p) => p.footerLinks));

  const missingInHeader = EXPECTED_HEADER_NAV_LINKS.filter(
    (label) => !headerLinks.includes(label)
  );
  const missingInFooter = EXPECTED_FOOTER_LINKS.filter(
    (label) => !footerLinks.includes(label)
  );

  const metadataIssues: ProductGapReport["metadataIssues"] = [];
  for (const page of report.pages) {
    if (!page.title?.trim())
      metadataIssues.push({ route: page.url, issue: "missing title" });
    if (!page.metadata.hasDescription) {
      metadataIssues.push({
        route: page.url,
        issue: "missing meta description",
      });
    }
    if (!page.metadata.hasOgTitle) {
      metadataIssues.push({ route: page.url, issue: "missing og:title" });
    }
    if (!page.metadata.hasOgDescription) {
      metadataIssues.push({ route: page.url, issue: "missing og:description" });
    }
  }
  metadataIssues.sort((a, b) =>
    `${a.route}:${a.issue}`.localeCompare(`${b.route}:${b.issue}`)
  );

  const a11yIssuesSummary = sortObjectByKey(
    Object.fromEntries(
      report.pages.map((page) => {
        const missingMainLandmark = page.a11y.hasMainLandmark ? 0 : 1;
        const missingH1 = page.a11y.hasH1 ? 0 : 1;
        const missingSkipLink = page.a11y.hasSkipLink ? 0 : 1;
        const missingHeaderNav = page.a11y.hasHeaderNav ? 0 : 1;
        const missingFooter = page.a11y.hasFooter ? 0 : 1;
        const consoleErrors = page.errors.length;
        const issueCount =
          missingMainLandmark +
          missingH1 +
          missingSkipLink +
          missingHeaderNav +
          missingFooter +
          consoleErrors;

        return [
          page.url,
          {
            issueCount,
            missingMainLandmark,
            missingH1,
            missingSkipLink,
            missingHeaderNav,
            missingFooter,
            consoleErrors,
          },
        ];
      })
    )
  );

  const performanceFlags = derivePerformanceFlags();
  const brokenLinks = sortedUnique(
    (report.linkValidation?.brokenLinksDetailed || []).map(
      (link) => `${link.from}|${link.to}|${link.status}`
    )
  )
    .map((token) => {
      const [from, to, status] = token.split("|");
      return { from, to, status: Number(status) };
    })
    .sort((a, b) =>
      `${a.from}:${a.to}:${a.status}`.localeCompare(
        `${b.from}:${b.to}:${b.status}`
      )
    );

  const notes: string[] = [];
  if (brokenLinks.length > 0)
    notes.push(`${brokenLinks.length} broken internal links detected`);
  if (missingRoutes.length > 0)
    notes.push(`${missingRoutes.length} linked routes appear missing`);
  if (metadataIssues.length > 0)
    notes.push(`${metadataIssues.length} metadata issues found`);
  if (missingInHeader.length > 0)
    notes.push(`Header nav is missing: ${missingInHeader.join(", ")}`);
  if (missingInFooter.length > 0)
    notes.push(`Footer is missing: ${missingInFooter.join(", ")}`);

  const severePerfFlags = performanceFlags.flags.filter(
    (f) => f.severity === "severe"
  );
  if (severePerfFlags.length > 0) {
    notes.push(`${severePerfFlags.length} severe performance flags found`);
  } else if (performanceFlags.flags.length > 0) {
    notes.push(
      `${performanceFlags.flags.length} warning-level performance flags found`
    );
  }

  const routesWithA11yIssues = Object.values(a11yIssuesSummary).filter(
    (route) => route.issueCount > 0
  ).length;
  if (routesWithA11yIssues > 0) {
    notes.push(`${routesWithA11yIssues} routes have structural a11y issues`);
  }

  const finalNotes = (
    notes.length > 0
      ? notes
      : ["No major product gaps detected in current audit."]
  ).slice(0, 5);

  return {
    timestamp: report.generatedAt,
    routesAudited,
    brokenLinks,
    missingRoutes,
    navCoverage: {
      headerLinks,
      footerLinks,
      missingInHeader,
      missingInFooter,
    },
    metadataIssues,
    a11yIssuesSummary,
    performanceFlags,
    notes: finalNotes,
  };
}

function readHeuristicReport(): HeuristicReport | null {
  if (!fs.existsSync(HEURISTICS_REPORT_PATH)) return null;
  try {
    return JSON.parse(
      fs.readFileSync(HEURISTICS_REPORT_PATH, "utf-8")
    ) as HeuristicReport;
  } catch {
    return null;
  }
}

function sortHeuristicGaps(gaps: HeuristicGap[]): HeuristicGap[] {
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  return [...gaps].sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    const routeDiff = a.route.localeCompare(b.route);
    if (routeDiff !== 0) return routeDiff;
    return a.id.localeCompare(b.id);
  });
}

function mergeHeuristicGaps(report: ProductGapReport): ProductGapReport {
  const heuristics = readHeuristicReport();
  let mergedHeuristicGaps = report.heuristicGaps;

  if (heuristics) {
    const allGaps = sortHeuristicGaps(
      heuristics.pages.flatMap((page) => page.gaps || [])
    );
    const conversion = sortHeuristicGaps(
      allGaps.filter((gap) => gap.category === "conversion")
    );

    mergedHeuristicGaps = {
      source: HEURISTICS_REPORT_PATH,
      generatedAt: heuristics.generatedAt,
      gaps: allGaps,
      conversion,
      summary: heuristics.summary,
    };
  } else if (fs.existsSync(GAP_REPORT_PATH)) {
    try {
      const current = JSON.parse(
        fs.readFileSync(GAP_REPORT_PATH, "utf-8")
      ) as ProductGapReport;
      if (current.heuristicGaps) {
        const safeSummary = current.heuristicGaps.summary;
        if (safeSummary?.gapsBySeverity) {
          mergedHeuristicGaps = {
            ...current.heuristicGaps,
            gaps: sortHeuristicGaps(current.heuristicGaps.gaps || []),
            conversion: sortHeuristicGaps(
              current.heuristicGaps.conversion || []
            ),
          };
        }
      }
    } catch {
      // Ignore and keep derived report without merged heuristics.
    }
  }

  const notes = report.notes.filter(
    (note) => !/critical\/high heuristic gaps detected/i.test(note)
  );
  if (
    mergedHeuristicGaps &&
    mergedHeuristicGaps.summary &&
    mergedHeuristicGaps.summary.totalGaps > 0
  ) {
    const criticalHigh =
      mergedHeuristicGaps.summary.gapsBySeverity.critical +
      mergedHeuristicGaps.summary.gapsBySeverity.high;
    if (criticalHigh > 0) {
      notes.push(`${criticalHigh} critical/high heuristic gaps detected`);
    }
  }

  const normalizedNotes = sortedUnique(notes).slice(0, 8);
  const finalNotes =
    normalizedNotes.length > 0
      ? normalizedNotes
      : ["No major product gaps detected in current audit."];

  return {
    ...report,
    heuristicGaps: mergedHeuristicGaps,
    notes: finalNotes,
  };
}

function writeInventoryAndGapReports(report: InventoryReport) {
  const gapReport = mergeHeuristicGaps(deriveGapReport(report));
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  fs.writeFileSync(GAP_REPORT_PATH, JSON.stringify(gapReport, null, 2));
}

// Helper to collect page inventory
async function collectPageInventory(
  page: Page,
  route: { path: string; name: string }
): Promise<PageInventory> {
  const errors: string[] = [];
  const consoleHandler = (msg: { type(): string; text(): string }) => {
    if (msg.type() === "error") {
      errors.push(msg.text().slice(0, 200));
    }
  };

  // Collect console errors
  page.on("console", consoleHandler);

  const response = await page.goto(route.path);
  await page.waitForLoadState("domcontentloaded");

  const status = response?.status() || 0;
  const title = await page.title().catch(() => null);
  const description = await page
    .locator('meta[name="description"]')
    .first()
    .getAttribute("content")
    .catch(() => null);
  const ogTitle = await page
    .locator('meta[property="og:title"]')
    .first()
    .getAttribute("content")
    .catch(() => null);
  const ogDescription = await page
    .locator('meta[property="og:description"]')
    .first()
    .getAttribute("content")
    .catch(() => null);

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
        const normalized = normalizeLink(href);
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
    .locator(
      'a[href="#main-content"], a:has-text("Skip to content"), a:has-text("Skip to main content")'
    )
    .count()
    .then((count) => count > 0)
    .catch(() => false);

  const hasHeaderNav = await page
    .locator("header nav")
    .isVisible()
    .catch(() => false);

  const hasFooter = await page
    .locator("footer")
    .isVisible()
    .catch(() => false);

  const headerLinks = await collectRegionLinkLabels(page, "header");
  const footerLinks = await collectRegionLinkLabels(page, "footer");

  page.off("console", consoleHandler);

  return {
    url: route.path,
    name: route.name,
    status,
    title,
    metadata: {
      hasDescription: Boolean(description?.trim()),
      hasOgTitle: Boolean(ogTitle?.trim()),
      hasOgDescription: Boolean(ogDescription?.trim()),
    },
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
    headerLinks,
    footerLinks,
    a11y: {
      hasMainLandmark,
      hasH1,
      hasSkipLink,
      hasHeaderNav,
      hasFooter,
    },
    errors: sortedUnique(errors),
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
          metadata: {
            hasDescription: false,
            hasOgTitle: false,
            hasOgDescription: false,
          },
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
          headerLinks: [],
          footerLinks: [],
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

    // Write reports
    writeInventoryAndGapReports(report);
    console.log(`\nReport written to: ${REPORT_PATH}`);
    console.log(`Gap report written to: ${GAP_REPORT_PATH}`);

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
        const report = JSON.parse(
          fs.readFileSync(REPORT_PATH, "utf-8")
        ) as InventoryReport;
        const statusByUrl: Record<string, number> = {};
        linkResults.forEach((result) => {
          statusByUrl[result.url] = result.status;
        });

        const brokenLinksDetailed = linkResults
          .filter((r) => r.status !== 200 && r.status !== 404)
          .flatMap((r) =>
            report.pages
              .filter((p) => p.internalLinks.includes(r.url))
              .map((p) => ({ from: p.url, to: r.url, status: r.status }))
          )
          .sort((a, b) =>
            `${a.from}:${a.to}:${a.status}`.localeCompare(
              `${b.from}:${b.to}:${b.status}`
            )
          );

        report.linkValidation = {
          checkedAt: new Date().toISOString(),
          linksChecked,
          results: {
            ok,
            notFound,
            errors,
          },
          statusByUrl: sortObjectByKey(statusByUrl),
          brokenLinks: linkResults
            .filter((r) => r.status !== 200 && r.status !== 404)
            .map((r) => ({ url: r.url, status: r.status })),
          brokenLinksDetailed,
        };
        writeInventoryAndGapReports(report);
        console.log(`\nLink validation added to report`);
        console.log(`Gap report updated: ${GAP_REPORT_PATH}`);
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
