import * as fs from "fs";
import * as path from "path";

import { test, Page } from "@playwright/test";

/**
 * Product Heuristics Tests (Non-Gating)
 *
 * These tests run UX/content heuristic checks on all public routes
 * to detect usability, clarity, trust, and content usefulness gaps.
 *
 * Output:
 * - e2e/reports/product-heuristics.json
 * - e2e/screenshots/product-heuristics/<route>/<theme>/<viewport>.png (on failures)
 *
 * This is non-gating - failures here are logged but don't block CI.
 */

// Public routes to check
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

// Content-specific requirements
const CONTENT_REQUIREMENTS: Record<
  string,
  { minCodeBlocks?: number; requiredSections?: string[] }
> = {
  "/docs": {
    minCodeBlocks: 2,
    requiredSections: ["glossary", "getting started", "quick start"],
  },
  "/api": {
    minCodeBlocks: 2,
    requiredSections: ["endpoint", "api"],
  },
  "/about": {
    requiredSections: ["governance", "mission", "team"],
  },
  "/verification": {
    requiredSections: ["what verified means", "criteria", "verified"],
  },
  "/contributing": {
    requiredSections: ["high-quality listing", "quality", "guidelines"],
  },
  "/changelog": {
    requiredSections: ["latest", "release"],
  },
};

// Report paths
const REPORT_PATH = path.join(__dirname, "reports", "product-heuristics.json");
const SCREENSHOT_DIR = path.join(
  __dirname,
  "screenshots",
  "product-heuristics"
);

// Severity levels
type Severity = "critical" | "high" | "medium" | "low";

// Gap structure
interface HeuristicGap {
  id: string;
  title: string;
  severity: Severity;
  category:
    | "ux"
    | "content"
    | "trust"
    | "friction"
    | "performance"
    | "navigation";
  description: string;
  route: string;
  evidence?: string;
  screenshotPath?: string;
  suggestedFix: string;
  effortEstimate: "S" | "M" | "L";
}

// Page check result
interface PageHeuristicResult {
  route: string;
  name: string;
  theme: string;
  viewport: string;
  timestamp: string;
  checks: {
    h1Count: number;
    hasPrimaryAction: boolean;
    primaryActionType?: string;
    hasNextStepNavigation: boolean;
    nextStepLinkCount: number;
    codeBlockCount: number;
    hasRequiredSections: boolean;
    missingSections: string[];
    linksToVerification: boolean;
    verificationLinkLocation?: string;
    comingSoonCount: number;
    disabledControlCount: number;
    domContentLoadedMs: number;
    largestContentfulPaintMs?: number;
  };
  gaps: HeuristicGap[];
}

// Full report structure
interface HeuristicReport {
  generatedAt: string;
  baseUrl: string;
  pages: PageHeuristicResult[];
  summary: {
    totalPages: number;
    totalGaps: number;
    gapsBySeverity: Record<Severity, number>;
    topOffenders: { route: string; gapCount: number }[];
  };
}

// Ensure directories exist
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sanitizeRoutePath(routePath: string): string {
  return routePath === "/"
    ? "homepage"
    : routePath.replace(/\//g, "-").slice(1);
}

function generateGapId(route: string, category: string, issue: string): string {
  const sanitized = `${sanitizeRoutePath(route)}-${category}-${issue}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 64);
  return sanitized;
}

async function takeScreenshot(
  page: Page,
  route: string,
  theme: string,
  viewport: string,
  suffix: string
): Promise<string> {
  const routeDir = path.join(
    SCREENSHOT_DIR,
    sanitizeRoutePath(route),
    theme,
    viewport
  );
  ensureDir(routeDir);

  const filename = `${suffix}.png`;
  const filepath = path.join(routeDir, filename);

  await page.screenshot({ path: filepath, fullPage: true });

  // Return relative path from e2e directory
  return path.relative(path.join(__dirname, ".."), filepath);
}

async function checkPrimaryAction(page: Page): Promise<{
  hasPrimaryAction: boolean;
  primaryActionType?: string;
}> {
  // Check for primary button variants
  const primaryButton = page.locator(
    'main button[data-variant="primary"], main button.btn-primary, main [data-primary-action], main a[data-primary-action]'
  );
  if ((await primaryButton.count()) > 0) {
    return { hasPrimaryAction: true, primaryActionType: "primary-button" };
  }

  // Check for prominent CTA buttons (common patterns)
  const ctaPatterns = [
    'main a[href="/servers"]',
    'main a[href="/submit"]',
    'main button[type="submit"]',
    'main a:has-text("Get Started")',
    'main a:has-text("Browse")',
    'main a:has-text("Submit")',
    'main a:has-text("Sign In")',
    'main a:has-text("Learn More")',
  ];

  for (const pattern of ctaPatterns) {
    try {
      const element = page.locator(pattern).first();
      if (await element.isVisible().catch(() => false)) {
        return { hasPrimaryAction: true, primaryActionType: "cta-link" };
      }
    } catch {
      // Continue checking
    }
  }

  // Check for any button in main content
  const anyButton = page.locator("main button:visible").first();
  if (await anyButton.isVisible().catch(() => false)) {
    return { hasPrimaryAction: true, primaryActionType: "generic-button" };
  }

  return { hasPrimaryAction: false };
}

async function checkNextStepNavigation(page: Page): Promise<{
  hasNextStepNavigation: boolean;
  nextStepLinkCount: number;
}> {
  // Count internal links in main content (excluding header/footer)
  const mainLinks = page.locator('main a[href^="/"]');
  const count = await mainLinks.count();

  // Filter out same-page anchors and obvious navigation
  let validNextSteps = 0;
  for (let i = 0; i < count && i < 50; i++) {
    try {
      const href = await mainLinks.nth(i).getAttribute("href");
      if (href && href !== "/" && !href.includes("#")) {
        validNextSteps++;
      }
    } catch {
      // Skip
    }
  }

  return {
    hasNextStepNavigation: validNextSteps > 0,
    nextStepLinkCount: validNextSteps,
  };
}

async function countCodeBlocks(page: Page): Promise<number> {
  return await page
    .locator("main pre code, main pre.hljs, main .code-block")
    .count();
}

async function checkRequiredSections(
  page: Page,
  route: string
): Promise<{ hasRequiredSections: boolean; missingSections: string[] }> {
  const requirements = CONTENT_REQUIREMENTS[route];
  if (!requirements?.requiredSections) {
    return { hasRequiredSections: true, missingSections: [] };
  }

  const pageText = (await page.locator("main").textContent()) || "";
  const lowerText = pageText.toLowerCase();

  const missingSections: string[] = [];
  let foundAny = false;

  for (const section of requirements.requiredSections) {
    if (lowerText.includes(section.toLowerCase())) {
      foundAny = true;
    } else {
      missingSections.push(section);
    }
  }

  // Consider it passing if at least one required section is found
  // (some pages may use different terminology)
  return {
    hasRequiredSections: foundAny || missingSections.length === 0,
    missingSections: foundAny ? [] : missingSections,
  };
}

async function checkTrustDiscoverability(
  page: Page,
  _route: string
): Promise<{
  linksToVerification: boolean;
  verificationLinkLocation?: string;
}> {
  // Check if page links to /verification
  const verificationLink = page.locator('a[href="/verification"]');
  const count = await verificationLink.count();

  if (count === 0) {
    return { linksToVerification: false };
  }

  // Determine where the link is located
  const inMain = await page
    .locator('main a[href="/verification"]')
    .count()
    .catch(() => 0);
  const inFooter = await page
    .locator('footer a[href="/verification"]')
    .count()
    .catch(() => 0);

  let location: string;
  if (inMain > 0) {
    location = "main-content";
  } else if (inFooter > 0) {
    location = "footer";
  } else {
    location = "other";
  }

  return { linksToVerification: true, verificationLinkLocation: location };
}

async function countFrictionElements(page: Page): Promise<{
  comingSoonCount: number;
  disabledControlCount: number;
}> {
  const comingSoon = await page
    .locator('main:has-text("coming soon"), main:has-text("Coming Soon")')
    .count()
    .catch(() => 0);

  const disabled = await page
    .locator("main button:disabled, main input:disabled, main select:disabled")
    .count()
    .catch(() => 0);

  return {
    comingSoonCount: comingSoon > 0 ? 1 : 0,
    disabledControlCount: disabled,
  };
}

async function measurePerformance(page: Page): Promise<{
  domContentLoadedMs: number;
  largestContentfulPaintMs?: number;
}> {
  try {
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");
      const lcp = paint.find((p) => p.name === "largest-contentful-paint");

      return {
        domContentLoadedMs: nav?.domContentLoadedEventEnd
          ? Math.round(nav.domContentLoadedEventEnd - nav.startTime)
          : 0,
        largestContentfulPaintMs: lcp ? Math.round(lcp.startTime) : undefined,
      };
    });
    return timing;
  } catch {
    return { domContentLoadedMs: 0 };
  }
}

async function runHeuristicChecks(
  page: Page,
  route: { path: string; name: string },
  theme: string,
  viewport: string
): Promise<PageHeuristicResult> {
  const gaps: HeuristicGap[] = [];

  await page.goto(route.path);
  await page.waitForLoadState("domcontentloaded");

  // H1 count check
  const h1Count = await page.locator("main h1").count();
  if (h1Count !== 1) {
    const screenshotPath = await takeScreenshot(
      page,
      route.path,
      theme,
      viewport,
      "h1-issue"
    );
    gaps.push({
      id: generateGapId(route.path, "ux", "h1-count"),
      title: `${h1Count === 0 ? "Missing" : "Multiple"} H1 heading`,
      severity: "high",
      category: "ux",
      description: `Page has ${h1Count} h1 elements (expected exactly 1)`,
      route: route.path,
      evidence: `h1 count: ${h1Count}`,
      screenshotPath,
      suggestedFix:
        h1Count === 0
          ? "Add a single descriptive h1 heading to the page"
          : "Consolidate multiple h1 headings into a single main heading",
      effortEstimate: "S",
    });
  }

  // Primary action check
  const { hasPrimaryAction, primaryActionType } =
    await checkPrimaryAction(page);
  if (
    !hasPrimaryAction &&
    route.path !== "/privacy" &&
    route.path !== "/terms"
  ) {
    const screenshotPath = await takeScreenshot(
      page,
      route.path,
      theme,
      viewport,
      "no-primary-action"
    );
    gaps.push({
      id: generateGapId(route.path, "ux", "no-primary-action"),
      title: "No clear primary action",
      severity: route.path === "/" ? "critical" : "medium",
      category: "ux",
      description: "Page lacks a clear primary call-to-action button or link",
      route: route.path,
      screenshotPath,
      suggestedFix:
        "Add a prominent primary action button or CTA link in main content",
      effortEstimate: "S",
    });
  }

  // Next-step navigation check
  const { hasNextStepNavigation, nextStepLinkCount } =
    await checkNextStepNavigation(page);
  if (!hasNextStepNavigation && route.path !== "/signin") {
    const screenshotPath = await takeScreenshot(
      page,
      route.path,
      theme,
      viewport,
      "dead-end"
    );
    gaps.push({
      id: generateGapId(route.path, "navigation", "dead-end"),
      title: "Dead-end page",
      severity: "medium",
      category: "navigation",
      description: "Page has no internal links to guide users to next steps",
      route: route.path,
      screenshotPath,
      suggestedFix: "Add related links or 'next steps' section to guide users",
      effortEstimate: "M",
    });
  }

  // Content usefulness (code blocks)
  const codeBlockCount = await countCodeBlocks(page);
  const requirements = CONTENT_REQUIREMENTS[route.path];
  if (
    requirements?.minCodeBlocks &&
    codeBlockCount < requirements.minCodeBlocks
  ) {
    gaps.push({
      id: generateGapId(route.path, "content", "missing-code-examples"),
      title: "Insufficient code examples",
      severity: "high",
      category: "content",
      description: `Page has ${codeBlockCount} code blocks (expected >= ${requirements.minCodeBlocks})`,
      route: route.path,
      evidence: `Found ${codeBlockCount} code blocks`,
      suggestedFix:
        "Add more practical code examples to improve documentation usefulness",
      effortEstimate: "M",
    });
  }

  // Required sections check
  const { hasRequiredSections, missingSections } = await checkRequiredSections(
    page,
    route.path
  );
  if (!hasRequiredSections && missingSections.length > 0) {
    gaps.push({
      id: generateGapId(route.path, "content", "missing-sections"),
      title: "Missing expected content sections",
      severity: "medium",
      category: "content",
      description: `Page is missing expected sections: ${missingSections.join(", ")}`,
      route: route.path,
      evidence: `Missing: ${missingSections.join(", ")}`,
      suggestedFix: `Add sections for: ${missingSections.join(", ")}`,
      effortEstimate: "M",
    });
  }

  // Trust discoverability (check relevant pages)
  const { linksToVerification, verificationLinkLocation } =
    await checkTrustDiscoverability(page, route.path);

  // For /servers page, verification link should be present
  if (route.path === "/servers" && !linksToVerification) {
    gaps.push({
      id: generateGapId(route.path, "trust", "no-verification-link"),
      title: "No link to verification page",
      severity: "high",
      category: "trust",
      description: "Servers page should link to verification criteria",
      route: route.path,
      suggestedFix:
        "Add a link to /verification to explain what verified means",
      effortEstimate: "S",
    });
  }

  // Friction flags
  const { comingSoonCount, disabledControlCount } =
    await countFrictionElements(page);
  if (comingSoonCount > 0) {
    gaps.push({
      id: generateGapId(route.path, "friction", "coming-soon"),
      title: "Contains 'Coming Soon' placeholder",
      severity: "low",
      category: "friction",
      description: `Page contains ${comingSoonCount} 'Coming Soon' blocks`,
      route: route.path,
      evidence: `${comingSoonCount} coming soon blocks`,
      suggestedFix:
        "Replace placeholder content with actual functionality or remove",
      effortEstimate: "M",
    });
  }

  if (disabledControlCount > 0) {
    gaps.push({
      id: generateGapId(route.path, "friction", "disabled-controls"),
      title: "Disabled controls in main content",
      severity: "low",
      category: "friction",
      description: `Page has ${disabledControlCount} disabled interactive controls`,
      route: route.path,
      evidence: `${disabledControlCount} disabled controls`,
      suggestedFix:
        "Review if disabled controls are necessary or should be removed/enabled",
      effortEstimate: "S",
    });
  }

  // Performance sanity check
  const { domContentLoadedMs, largestContentfulPaintMs } =
    await measurePerformance(page);
  if (domContentLoadedMs > 3000) {
    gaps.push({
      id: generateGapId(route.path, "performance", "slow-dcl"),
      title: "Slow page load",
      severity: "medium",
      category: "performance",
      description: `DOMContentLoaded took ${domContentLoadedMs}ms (threshold: 3000ms)`,
      route: route.path,
      evidence: `DCL: ${domContentLoadedMs}ms`,
      suggestedFix:
        "Investigate page load performance - reduce JS bundle, optimize images",
      effortEstimate: "L",
    });
  }

  // Changelog-specific check
  if (route.path === "/changelog") {
    const entries = await page
      .locator("main article, main section > div, main h2, main h3")
      .count();
    if (entries < 4) {
      gaps.push({
        id: generateGapId(route.path, "content", "insufficient-changelog"),
        title: "Insufficient changelog entries",
        severity: "low",
        category: "content",
        description: `Changelog has fewer than 4 visible entries`,
        route: route.path,
        evidence: `${entries} entries detected`,
        suggestedFix: "Ensure changelog displays enough historical entries",
        effortEstimate: "S",
      });
    }
  }

  return {
    route: route.path,
    name: route.name,
    theme,
    viewport,
    timestamp: new Date().toISOString(),
    checks: {
      h1Count,
      hasPrimaryAction,
      primaryActionType,
      hasNextStepNavigation,
      nextStepLinkCount,
      codeBlockCount,
      hasRequiredSections,
      missingSections,
      linksToVerification,
      verificationLinkLocation,
      comingSoonCount,
      disabledControlCount,
      domContentLoadedMs,
      largestContentfulPaintMs,
    },
    gaps,
  };
}

function buildReport(
  pages: PageHeuristicResult[],
  baseUrl: string
): HeuristicReport {
  const allGaps = pages.flatMap((p) => p.gaps);

  const gapsBySeverity: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const gap of allGaps) {
    gapsBySeverity[gap.severity]++;
  }

  // Top offenders (routes with most gaps)
  const gapsByRoute = new Map<string, number>();
  for (const gap of allGaps) {
    gapsByRoute.set(gap.route, (gapsByRoute.get(gap.route) || 0) + 1);
  }

  const topOffenders = Array.from(gapsByRoute.entries())
    .map(([route, gapCount]) => ({ route, gapCount }))
    .sort((a, b) => b.gapCount - a.gapCount)
    .slice(0, 5);

  // Sort pages by route for determinism
  pages.sort((a, b) => a.route.localeCompare(b.route));

  // Sort gaps within each page by severity then id
  for (const page of pages) {
    page.gaps.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff =
        severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return a.id.localeCompare(b.id);
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    pages,
    summary: {
      totalPages: pages.length,
      totalGaps: allGaps.length,
      gapsBySeverity,
      topOffenders,
    },
  };
}

// Main test suite
test.describe("Product Heuristics (Non-Gating)", () => {
  test("run heuristic checks on all public routes", async ({
    page,
    baseURL,
  }) => {
    ensureDir(path.dirname(REPORT_PATH));
    ensureDir(SCREENSHOT_DIR);

    const results: PageHeuristicResult[] = [];
    const theme = "light"; // Could be parameterized
    const viewport = "desktop"; // Could be parameterized

    console.log("\n=== Product Heuristics Analysis ===\n");

    for (const route of PUBLIC_ROUTES) {
      console.log(`Checking: ${route.name} (${route.path})`);

      try {
        const result = await runHeuristicChecks(page, route, theme, viewport);
        results.push(result);

        if (result.gaps.length > 0) {
          console.log(`  Found ${result.gaps.length} gap(s):`);
          for (const gap of result.gaps) {
            console.log(`    - [${gap.severity.toUpperCase()}] ${gap.title}`);
          }
        } else {
          console.log("  No gaps detected");
        }
      } catch (error) {
        console.log(`  ERROR: ${error}`);
        results.push({
          route: route.path,
          name: route.name,
          theme,
          viewport,
          timestamp: new Date().toISOString(),
          checks: {
            h1Count: 0,
            hasPrimaryAction: false,
            hasNextStepNavigation: false,
            nextStepLinkCount: 0,
            codeBlockCount: 0,
            hasRequiredSections: false,
            missingSections: [],
            linksToVerification: false,
            comingSoonCount: 0,
            disabledControlCount: 0,
            domContentLoadedMs: 0,
          },
          gaps: [
            {
              id: generateGapId(route.path, "ux", "page-error"),
              title: "Page failed to load",
              severity: "critical",
              category: "ux",
              description: `Error loading page: ${String(error).slice(0, 200)}`,
              route: route.path,
              suggestedFix: "Investigate and fix the page loading error",
              effortEstimate: "M",
            },
          ],
        });
      }
    }

    const report = buildReport(results, baseURL || "http://localhost:3000");

    // Write report
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`\nHeuristics report written to: ${REPORT_PATH}`);

    // Print summary
    console.log("\n=== Summary ===\n");
    console.log(`Total pages checked: ${report.summary.totalPages}`);
    console.log(`Total gaps found: ${report.summary.totalGaps}`);
    console.log("\nGaps by severity:");
    console.log(`  Critical: ${report.summary.gapsBySeverity.critical}`);
    console.log(`  High: ${report.summary.gapsBySeverity.high}`);
    console.log(`  Medium: ${report.summary.gapsBySeverity.medium}`);
    console.log(`  Low: ${report.summary.gapsBySeverity.low}`);

    if (report.summary.topOffenders.length > 0) {
      console.log("\nTop offenders:");
      for (const offender of report.summary.topOffenders) {
        console.log(`  ${offender.route}: ${offender.gapCount} gaps`);
      }
    }

    console.log("\n");
  });
});
