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
  { path: "/servers?q=github", name: "Browse Servers (Search Results)" },
  { path: "/servers/github", name: "Server Detail" },
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
const severityOrder: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

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
    | "navigation"
    | "conversion";
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
    status: number;
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

type ActionSnapshot = {
  text: string;
  href: string | null;
  className: string;
  top: number;
  isExternal: boolean;
  hasTargetBlank: boolean;
  hasSvgIcon: boolean;
  isPrimaryHint: boolean;
  isSecondaryHint: boolean;
  isButtonLike: boolean;
};

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

async function collectVisibleActions(page: Page): Promise<ActionSnapshot[]> {
  return page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll("main a[href], main button")
    ) as Array<HTMLAnchorElement | HTMLButtonElement>;

    return nodes
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const style = window.getComputedStyle(node);
        return style.visibility !== "hidden" && style.display !== "none";
      })
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const className = node.className || "";
        const href =
          node instanceof HTMLAnchorElement
            ? (node.getAttribute("href") ?? "")
            : null;
        const text = (node.textContent || "").replace(/\s+/g, " ").trim();
        const target =
          node instanceof HTMLAnchorElement
            ? node.getAttribute("target") || ""
            : "";

        const isExternal = Boolean(
          href &&
            (href.startsWith("http://") || href.startsWith("https://")) &&
            !href.includes(window.location.host)
        );
        const hasSvgIcon = node.querySelector("svg") !== null;
        const lowerClass = className.toLowerCase();
        const isPrimaryHint =
          node.getAttribute("data-variant") === "primary" ||
          node.hasAttribute("data-primary-action") ||
          (node instanceof HTMLButtonElement && node.type === "submit") ||
          lowerClass.includes("bg-brand") ||
          (lowerClass.includes("text-white") && lowerClass.includes("bg-"));
        const isSecondaryHint =
          node.getAttribute("data-variant") === "secondary" ||
          (lowerClass.includes("border") && lowerClass.includes("bg-surface"));
        const isButtonLike =
          node.tagName === "BUTTON" ||
          lowerClass.includes("rounded") ||
          lowerClass.includes("px-") ||
          lowerClass.includes("py-");

        return {
          text,
          href,
          className,
          top: Math.round(rect.top),
          isExternal,
          hasTargetBlank: target === "_blank",
          hasSvgIcon,
          isPrimaryHint,
          isSecondaryHint,
          isButtonLike,
        };
      })
      .filter((action) => action.text.length > 0);
  });
}

function isLongFormRoute(route: string): boolean {
  return ["/docs", "/api", "/verification", "/about", "/contributing"].some(
    (value) => route.startsWith(value)
  );
}

function routeRequiresSocialProof(route: string): boolean {
  return (
    route === "/" ||
    route === "/servers" ||
    route === "/servers?q=github" ||
    route === "/submit" ||
    route === "/verification" ||
    route.startsWith("/servers/")
  );
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

async function getMainTextLength(page: Page): Promise<number> {
  try {
    const text = (await page.locator("main").textContent()) || "";
    return text.replace(/\s+/g, " ").trim().length;
  } catch {
    return 0;
  }
}

async function detectSocialProof(page: Page): Promise<boolean> {
  const text = (
    (await page
      .locator("main")
      .textContent()
      .catch(() => "")) || ""
  )
    .toLowerCase()
    .replace(/\s+/g, " ");
  return /verified|trusted|reviewed|users viewed|most viewed|confidence|proof|community/.test(
    text
  );
}

async function hasTrustNearPrimaryCta(page: Page): Promise<boolean> {
  return page
    .evaluate(() => {
      const primary = document.querySelector(
        'main button[data-variant="primary"], main [data-primary-action], main button[type="submit"], main a.bg-brand-700, main a.dark\\:bg-brand-500'
      );
      if (!primary) return false;

      const container =
        primary.closest("aside, section, article, div") ||
        primary.parentElement ||
        primary;
      const nearbyText = (container.textContent || "").toLowerCase();
      return /verified|reviewed|trust|users viewed|most viewed|updated/.test(
        nearbyText
      );
    })
    .catch(() => false);
}

async function runHeuristicChecks(
  page: Page,
  route: { path: string; name: string },
  theme: string,
  viewport: string
): Promise<PageHeuristicResult> {
  const gaps: HeuristicGap[] = [];

  const response = await page.goto(route.path, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  const status = response?.status() ?? 0;
  const viewportSize = page.viewportSize() || { width: 1280, height: 720 };
  const visibleActions = await collectVisibleActions(page);
  const primaryActions = visibleActions.filter(
    (action) => action.isPrimaryHint
  );
  const primaryActionsAboveFold = primaryActions.filter(
    (action) => action.top >= 0 && action.top < viewportSize.height
  );
  const secondaryActionsAboveFold = visibleActions.filter(
    (action) =>
      action.isSecondaryHint &&
      action.top >= 0 &&
      action.top < viewportSize.height
  );

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

  // Conversion: no primary CTA above the fold
  if (
    !["/privacy", "/terms", "/signin"].includes(route.path) &&
    status < 400 &&
    primaryActionsAboveFold.length === 0
  ) {
    const screenshotPath = await takeScreenshot(
      page,
      route.path,
      theme,
      viewport,
      "conversion-no-above-fold-cta"
    );
    gaps.push({
      id: generateGapId(route.path, "conversion", "no-primary-above-fold"),
      title: "No primary CTA above the fold",
      severity: route.path === "/" ? "critical" : "high",
      category: "conversion",
      description:
        "No primary call-to-action is visible in the first viewport height",
      route: route.path,
      evidence: `Primary CTA above fold count: ${primaryActionsAboveFold.length}`,
      screenshotPath,
      suggestedFix:
        "Move a single primary action higher so users can act without scrolling",
      effortEstimate: "S",
    });
  }

  // Conversion: CTA color hierarchy mismatch
  if (
    status < 400 &&
    primaryActions.length > 0 &&
    secondaryActionsAboveFold.some((action) =>
      action.className.toLowerCase().includes("bg-brand")
    ) &&
    !primaryActions.some((action) =>
      action.className.toLowerCase().includes("bg-brand")
    )
  ) {
    gaps.push({
      id: generateGapId(route.path, "conversion", "cta-hierarchy-mismatch"),
      title: "CTA hierarchy mismatch",
      severity: "high",
      category: "conversion",
      description:
        "Secondary actions appear visually stronger than the intended primary CTA",
      route: route.path,
      suggestedFix:
        "Keep brand/emphasis styling on only one primary action and tone down secondary actions",
      effortEstimate: "S",
    });
  }

  // Conversion: too many equal-weight CTAs
  const aboveFoldButtonLike = visibleActions.filter(
    (action) =>
      action.top >= 0 && action.top < viewportSize.height && action.isButtonLike
  );
  const strongCtasAboveFold = aboveFoldButtonLike.filter(
    (action) =>
      action.isPrimaryHint ||
      action.className.toLowerCase().includes("bg-brand") ||
      action.className.toLowerCase().includes("text-white")
  );
  if (status < 400 && strongCtasAboveFold.length > 3) {
    gaps.push({
      id: generateGapId(route.path, "conversion", "too-many-equal-buttons"),
      title: "Too many equal-weight actions",
      severity: "medium",
      category: "conversion",
      description:
        "Multiple visually strong actions compete for attention in the first viewport",
      route: route.path,
      evidence: `Strong actions above fold: ${strongCtasAboveFold.length}`,
      suggestedFix:
        "Keep one primary CTA and demote others to secondary/tertiary styling",
      effortEstimate: "S",
    });
  }

  // Conversion: external CTA link not emphasized
  const weakExternalCtas = visibleActions.filter((action) => {
    const lower = action.className.toLowerCase();
    return (
      status < 400 &&
      action.isExternal &&
      action.hasTargetBlank &&
      action.isButtonLike &&
      !action.hasSvgIcon &&
      !lower.includes("underline") &&
      !lower.includes("brand")
    );
  });
  if (weakExternalCtas.length > 0) {
    gaps.push({
      id: generateGapId(
        route.path,
        "conversion",
        "external-link-not-emphasized"
      ),
      title: "External action not visually emphasized",
      severity: "low",
      category: "conversion",
      description:
        "External call-to-action links are visually subtle and may be overlooked",
      route: route.path,
      evidence: `Weak external actions: ${weakExternalCtas.length}`,
      suggestedFix:
        "Add icon/underline or stronger visual treatment for external destination actions",
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

  // Conversion: social proof missing on conversion-sensitive routes
  const hasSocialProof = await detectSocialProof(page);
  if (status < 400 && routeRequiresSocialProof(route.path) && !hasSocialProof) {
    gaps.push({
      id: generateGapId(route.path, "conversion", "missing-social-proof"),
      title: "No social proof near decision points",
      severity: "medium",
      category: "conversion",
      description:
        "Page does not present trust or adoption signals to reinforce action",
      route: route.path,
      suggestedFix:
        "Add lightweight social proof such as verification freshness, view count, or usage indicators",
      effortEstimate: "S",
    });
  }

  // Conversion: search results should highlight match terms
  if (status < 400 && route.path.startsWith("/servers?q=")) {
    const hasSearchResults = await page
      .locator('main a[href^="/servers/"]')
      .first()
      .isVisible()
      .catch(() => false);
    const hasHighlight = await page
      .locator("main mark, main [data-highlight], main .search-highlight")
      .count()
      .then((count) => count > 0)
      .catch(() => false);

    if (hasSearchResults && !hasHighlight) {
      const screenshotPath = await takeScreenshot(
        page,
        route.path,
        theme,
        viewport,
        "conversion-search-no-highlight"
      );
      gaps.push({
        id: generateGapId(
          route.path,
          "conversion",
          "search-match-not-highlighted"
        ),
        title: "Search results do not highlight matches",
        severity: "medium",
        category: "conversion",
        description:
          "Result cards do not visually emphasize why each result matched the query",
        route: route.path,
        screenshotPath,
        suggestedFix:
          "Highlight matched query terms in result titles or descriptions",
        effortEstimate: "M",
      });
    }
  }

  // Conversion: long pages should include sectional CTAs
  const mainTextLength = await getMainTextLength(page);
  const ctasBelowFold = visibleActions.filter(
    (action) => action.isPrimaryHint && action.top >= viewportSize.height
  );
  if (
    status < 400 &&
    isLongFormRoute(route.path) &&
    mainTextLength > 2600 &&
    ctasBelowFold.length === 0
  ) {
    gaps.push({
      id: generateGapId(route.path, "conversion", "missing-sectional-ctas"),
      title: "Long page lacks sectional CTAs",
      severity: "medium",
      category: "conversion",
      description:
        "Long-form page has no action prompts after the first viewport",
      route: route.path,
      evidence: `Main text length: ${mainTextLength} characters`,
      suggestedFix:
        "Add context-aware CTA blocks between major sections to reduce drop-off",
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

  // Conversion: detail pages need trust reinforcement near CTA
  if (status < 400 && route.path.startsWith("/servers/")) {
    const trustNearCta = await hasTrustNearPrimaryCta(page);
    if (!trustNearCta) {
      gaps.push({
        id: generateGapId(route.path, "conversion", "no-trust-near-cta"),
        title: "Detail page lacks trust reinforcement near CTA",
        severity: "high",
        category: "conversion",
        description:
          "Primary action area does not include trust context near the CTA",
        route: route.path,
        suggestedFix:
          "Show trust context near CTA (verification freshness, views, or review-time copy)",
        effortEstimate: "S",
      });
    }
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
      status,
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
    .sort((a, b) => b.gapCount - a.gapCount || a.route.localeCompare(b.route))
    .slice(0, 5);

  // Sort pages by route for determinism
  pages.sort((a, b) => a.route.localeCompare(b.route));

  // Sort gaps within each page by severity then id
  for (const page of pages) {
    page.gaps.sort((a, b) => {
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
    browser,
    baseURL,
  }) => {
    // This sweeps many routes sequentially and can exceed the default test
    // timeout on slower CI runners.
    test.setTimeout(10 * 60 * 1000);

    ensureDir(path.dirname(REPORT_PATH));
    ensureDir(SCREENSHOT_DIR);

    const results: PageHeuristicResult[] = [];
    const theme = "light"; // Could be parameterized
    const viewport = "desktop"; // Could be parameterized

    console.log("\n=== Product Heuristics Analysis ===\n");

    for (const route of PUBLIC_ROUTES) {
      console.log(`Checking: ${route.name} (${route.path})`);

      const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
      });
      const routePage = await context.newPage();

      try {
        // Hard cap route execution so one slow/crashed route cannot block the sweep.
        const result = await Promise.race([
          runHeuristicChecks(routePage, route, theme, viewport),
          new Promise<PageHeuristicResult>((_, reject) =>
            setTimeout(
              () => reject(new Error(`Route heuristics timeout for ${route.path}`)),
              45_000
            )
          ),
        ]);

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
            status: 0,
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
      } finally {
        await routePage.close().catch(() => undefined);
        await context.close().catch(() => undefined);
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
