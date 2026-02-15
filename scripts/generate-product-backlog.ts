#!/usr/bin/env npx ts-node
/**
 * Product Backlog Generator
 *
 * Reads product intelligence reports and generates docs/product-backlog.md.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GAPS_REPORT_PATH = path.join(
  __dirname,
  "..",
  "e2e",
  "reports",
  "product-gaps.json"
);
const PERF_REGRESSIONS_PATH = path.join(
  __dirname,
  "..",
  "e2e",
  "reports",
  "perf-regressions.json"
);
const INSIGHTS_CACHE_PATH = path.join(
  __dirname,
  "..",
  "e2e",
  "reports",
  "analytics-insights.json"
);
const OUTPUT_PATH = path.join(__dirname, "..", "docs", "product-backlog.md");

// Route importance for traffic estimation (higher = more traffic)
const ROUTE_TRAFFIC_WEIGHT: Record<string, number> = {
  "/": 1.5, // Homepage - highest traffic
  "/servers": 1.5, // Browse - high traffic
  "/docs": 1.2, // Documentation
  "/api": 1.1, // API docs
  "/submit": 1.3, // Submit flow - conversion critical
  "/signin": 1.2, // Auth flow
  "/verification": 1.0,
  "/about": 0.8,
  "/contributing": 0.7,
  "/changelog": 0.6,
  "/privacy": 0.5,
  "/terms": 0.5,
};

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

interface GapReport {
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
      missingMainLandmark?: number;
      missingH1?: number;
      missingSkipLink?: number;
      missingHeaderNav?: number;
      missingFooter?: number;
      consoleErrors?: number;
    }
  >;
  performanceFlags: {
    source: string | null;
    thresholds: Record<string, number>;
    flags: {
      route: string;
      metric: string;
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
    conversion?: HeuristicGap[];
    summary: {
      totalGaps: number;
      gapsBySeverity: Record<Severity, number>;
      topOffenders: { route: string; gapCount: number }[];
    };
  };
  notes: string[];
}

interface PerfRegressionReport {
  summary: {
    totalRegressions: number;
    budgetExceededCount: number;
    trendRegressionCount: number;
  };
  regressions: Array<{
    route: string;
    metric: string;
    currentValue: number;
    budget: number | null;
  }>;
}

interface AnalyticsInsight {
  id: string;
  category: string;
  severity: Severity;
  title: string;
  description: string;
  evidence: string;
  suggested_fix: string;
  metric_value: number;
  threshold: number;
}

interface InsightsReport {
  period: {
    start: string;
    end: string;
    days: number;
  };
  insights: AnalyticsInsight[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

interface BacklogItem {
  id: string;
  title: string;
  severity: Severity;
  impact: string;
  effort: "S" | "M" | "L";
  route: string;
  evidence?: string;
  screenshotPath?: string;
  suggestedFix: string;
  category: string;
  source: "product-gaps" | "heuristics" | "performance" | "analytics";
  opportunityScore: number;
}

const severityWeight: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function severityToLabel(severity: Severity): string {
  return severity.toUpperCase();
}

function severityToImpact(severity: Severity): string {
  switch (severity) {
    case "critical":
      return "Blocks core user journey or causes significant confusion";
    case "high":
      return "Significantly impacts trust, conversion, or usability";
    case "medium":
      return "Polish/usability issue affecting user experience";
    case "low":
      return "Minor consistency or optimization opportunity";
  }
}

function effortToDescription(effort: "S" | "M" | "L"): string {
  switch (effort) {
    case "S":
      return "Small (< 2 hours)";
    case "M":
      return "Medium (2-8 hours)";
    case "L":
      return "Large (> 8 hours)";
  }
}

function sortedUnique(values: string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function compareByOpportunityScore(a: BacklogItem, b: BacklogItem): number {
  // Primary: opportunity score (descending)
  const scoreDiff = b.opportunityScore - a.opportunityScore;
  if (scoreDiff !== 0) return scoreDiff;

  // Secondary: severity (descending)
  const severityDiff = severityWeight[b.severity] - severityWeight[a.severity];
  if (severityDiff !== 0) return severityDiff;

  // Tertiary: route (ascending for stability)
  const routeDiff = a.route.localeCompare(b.route);
  if (routeDiff !== 0) return routeDiff;

  // Fallback: id (ascending for stability)
  return a.id.localeCompare(b.id);
}

function compareByGroupOrder(a: BacklogItem, b: BacklogItem): number {
  const routeDiff = a.route.localeCompare(b.route);
  if (routeDiff !== 0) return routeDiff;

  const categoryDiff = a.category.localeCompare(b.category);
  if (categoryDiff !== 0) return categoryDiff;

  // Use opportunity score within groups
  const scoreDiff = b.opportunityScore - a.opportunityScore;
  if (scoreDiff !== 0) return scoreDiff;

  const severityDiff = severityWeight[b.severity] - severityWeight[a.severity];
  if (severityDiff !== 0) return severityDiff;

  const titleDiff = a.title.localeCompare(b.title);
  if (titleDiff !== 0) return titleDiff;

  return a.id.localeCompare(b.id);
}

function loadPerfRegressionReport(): PerfRegressionReport | null {
  if (!fs.existsSync(PERF_REGRESSIONS_PATH)) return null;
  try {
    return JSON.parse(
      fs.readFileSync(PERF_REGRESSIONS_PATH, "utf-8")
    ) as PerfRegressionReport;
  } catch {
    return null;
  }
}

function loadInsightsReport(): InsightsReport | null {
  if (!fs.existsSync(INSIGHTS_CACHE_PATH)) return null;
  try {
    return JSON.parse(
      fs.readFileSync(INSIGHTS_CACHE_PATH, "utf-8")
    ) as InsightsReport;
  } catch {
    return null;
  }
}

/**
 * Calculate opportunity score for a backlog item.
 *
 * Scoring formula:
 *   Base = (severityWeight × 25) + categoryBoost + effortBoost + dropoffBoost
 *   Final = Base × trafficMultiplier
 *
 * Factors:
 *   - Severity: critical=100, high=75, medium=50, low=25
 *   - Conversion category: +20 points
 *   - Effort efficiency: S=+10, M=+5, L=+0
 *   - Dropoff signal: +30 if route appears in analytics insights
 *   - Traffic multiplier: 0.5-1.5x based on route importance
 */
function calculateOpportunityScore(
  item: Omit<BacklogItem, "opportunityScore">,
  insightsRoutes: Set<string>
): number {
  // Base severity score (25-100)
  const severityScore = severityWeight[item.severity] * 25;

  // Conversion category boost (+20)
  const categoryBoost = item.category === "conversion" ? 20 : 0;

  // Effort efficiency boost (favor quick wins)
  const effortBoost: Record<"S" | "M" | "L", number> = { S: 10, M: 5, L: 0 };
  const effortScore = effortBoost[item.effort];

  // Dropoff signal boost (+30 if route has analytics dropoff)
  const dropoffBoost = insightsRoutes.has(item.route) ? 30 : 0;

  // Calculate base score
  const baseScore = severityScore + categoryBoost + effortScore + dropoffBoost;

  // Apply traffic multiplier
  const trafficMultiplier = getTrafficMultiplier(item.route);

  // Final score (round to 1 decimal)
  return Math.round(baseScore * trafficMultiplier * 10) / 10;
}

/**
 * Get traffic multiplier for a route.
 * Routes not in the map default to 1.0.
 * Server detail pages (/servers/[slug]) get 1.2x.
 */
function getTrafficMultiplier(route: string): number {
  // Direct match
  if (ROUTE_TRAFFIC_WEIGHT[route]) {
    return ROUTE_TRAFFIC_WEIGHT[route];
  }

  // Server detail pages
  if (route.startsWith("/servers/") && route !== "/servers") {
    return 1.2;
  }

  // Default multiplier
  return 1.0;
}

/**
 * Extract routes that have dropoff/conversion issues from insights.
 */
function extractInsightRoutes(insights: InsightsReport | null): Set<string> {
  const routes = new Set<string>();

  if (!insights) return routes;

  // Analytics insights are page-level, map insight categories to routes
  for (const insight of insights.insights) {
    // CTA issues affect homepage and servers
    if (insight.id.includes("cta-")) {
      routes.add("/");
      routes.add("/servers");
    }
    // Scroll engagement affects content pages
    if (insight.id.includes("scroll-")) {
      routes.add("/");
      routes.add("/docs");
      routes.add("/about");
    }
    // Search issues affect servers page
    if (insight.id.includes("search-")) {
      routes.add("/servers");
    }
    // Submit issues affect submit page
    if (insight.id.includes("submit-")) {
      routes.add("/submit");
    }
  }

  return routes;
}

function convertToBacklogItems(
  report: GapReport,
  insights: InsightsReport | null
): BacklogItem[] {
  const insightRoutes = extractInsightRoutes(insights);
  const items: Omit<BacklogItem, "opportunityScore">[] = [];

  for (const link of report.brokenLinks) {
    items.push({
      id: `broken-link-${link.from.replace(/\//g, "-")}-${link.to.replace(/\//g, "-")}`,
      title: `Broken internal link: ${link.to}`,
      severity: "high",
      impact: "Broken navigation causes user frustration and harms SEO",
      effort: "S",
      route: link.from,
      evidence: `Link from ${link.from} to ${link.to} returns status ${link.status}`,
      suggestedFix: `Fix or remove the broken link to ${link.to}`,
      category: "navigation",
      source: "product-gaps",
    });
  }

  for (const route of report.missingRoutes) {
    items.push({
      id: `missing-route-${route.replace(/\//g, "-")}`,
      title: `Missing route: ${route}`,
      severity: "medium",
      impact: "Linked route returns 404, breaking user navigation",
      effort: "M",
      route,
      evidence: `Route ${route} is linked but returns 404`,
      suggestedFix: "Create the missing page or fix the incorrect link",
      category: "navigation",
      source: "product-gaps",
    });
  }

  for (const missing of report.navCoverage.missingInHeader) {
    items.push({
      id: `nav-header-missing-${missing.toLowerCase()}`,
      title: `Header nav missing: ${missing}`,
      severity: "medium",
      impact: "Important navigation link not accessible from header",
      effort: "S",
      route: "/",
      evidence: `Expected \"${missing}\" link not found in header navigation`,
      suggestedFix: `Add \"${missing}\" link to header navigation`,
      category: "navigation",
      source: "product-gaps",
    });
  }

  for (const missing of report.navCoverage.missingInFooter) {
    items.push({
      id: `nav-footer-missing-${missing.toLowerCase()}`,
      title: `Footer missing: ${missing}`,
      severity: "low",
      impact: "Footer navigation incomplete",
      effort: "S",
      route: "/",
      evidence: `Expected \"${missing}\" link not found in footer`,
      suggestedFix: `Add \"${missing}\" link to footer`,
      category: "navigation",
      source: "product-gaps",
    });
  }

  for (const issue of report.metadataIssues) {
    items.push({
      id: `metadata-${issue.route.replace(/\//g, "-")}-${issue.issue.replace(/\s+/g, "-")}`,
      title: `Metadata issue: ${issue.issue}`,
      severity: "low",
      impact: "Missing metadata affects SEO and social sharing",
      effort: "S",
      route: issue.route,
      evidence: `Page ${issue.route} is ${issue.issue}`,
      suggestedFix: `Add ${issue.issue.replace("missing ", "")} to page metadata`,
      category: "seo",
      source: "product-gaps",
    });
  }

  for (const [route, issues] of Object.entries(report.a11yIssuesSummary)) {
    if (issues.issueCount <= 0) continue;

    const issueList: string[] = [];
    if (issues.missingMainLandmark) issueList.push("missing main landmark");
    if (issues.missingH1) issueList.push("missing h1");
    if (issues.missingSkipLink) issueList.push("missing skip link");
    if (issues.missingHeaderNav) issueList.push("missing header nav");
    if (issues.missingFooter) issueList.push("missing footer");
    if (issues.consoleErrors)
      issueList.push(`${issues.consoleErrors} console errors`);
    if (issueList.length === 0) continue;

    items.push({
      id: `a11y-${route.replace(/\//g, "-") || "homepage"}`,
      title: `Accessibility issues on ${route || "/"}`,
      severity:
        issues.missingH1 || issues.missingMainLandmark ? "high" : "medium",
      impact: "Accessibility issues affect users with disabilities",
      effort: "S",
      route,
      evidence: issueList.join(", "),
      suggestedFix: `Fix: ${issueList.join(", ")}`,
      category: "accessibility",
      source: "product-gaps",
    });
  }

  for (const flag of report.performanceFlags.flags) {
    items.push({
      id: `perf-${flag.route.replace(/\//g, "-")}-${flag.metric}`,
      title: `Performance: ${flag.metric} on ${flag.route}`,
      severity: flag.severity === "severe" ? "high" : "medium",
      impact:
        flag.severity === "severe"
          ? "Severely slow page load impacts user experience"
          : "Slow page load may impact user experience",
      effort: "L",
      route: flag.route,
      evidence: `${flag.metric}: ${flag.value} (threshold: ${flag.threshold})`,
      suggestedFix: `Investigate and optimize ${flag.metric}`,
      category: "performance",
      source: "performance",
    });
  }

  const heuristicGaps = report.heuristicGaps?.gaps || [];

  for (const gap of heuristicGaps) {
    items.push({
      id: gap.id,
      title: gap.title,
      severity: gap.severity,
      impact: severityToImpact(gap.severity),
      effort: gap.effortEstimate,
      route: gap.route,
      evidence: gap.evidence,
      screenshotPath: gap.screenshotPath,
      suggestedFix: gap.suggestedFix,
      category: gap.category,
      source: "heuristics",
    });
  }

  // Add analytics insights as backlog items
  if (insights) {
    for (const insight of insights.insights) {
      // Map insight to route
      let route = "/";
      if (insight.id.includes("search-")) route = "/servers";
      else if (insight.id.includes("submit-")) route = "/submit";

      items.push({
        id: `analytics-${insight.id}`,
        title: insight.title,
        severity: insight.severity,
        impact: insight.description,
        effort: "M", // Default to medium for analytics-driven items
        route,
        evidence: insight.evidence,
        suggestedFix: insight.suggested_fix,
        category: insight.category,
        source: "analytics",
      });
    }
  }

  // Calculate opportunity scores and deduplicate
  const seen = new Set<string>();
  const scoredItems: BacklogItem[] = items
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .map((item) => ({
      ...item,
      opportunityScore: calculateOpportunityScore(item, insightRoutes),
    }));

  // Sort by opportunity score (descending)
  return scoredItems.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

function getTopRoutes(
  items: BacklogItem[]
): Array<{ route: string; count: number }> {
  const map = new Map<string, number>();
  for (const item of items) map.set(item.route, (map.get(item.route) || 0) + 1);
  return Array.from(map.entries())
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => a.route.localeCompare(b.route));
}

function getCountsByCategory(
  items: BacklogItem[]
): Array<{ category: string; count: number }> {
  const map = new Map<string, number>();
  for (const item of items)
    map.set(item.category, (map.get(item.category) || 0) + 1);
  return Array.from(map.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

function getTopActions(items: BacklogItem[]): BacklogItem[] {
  // Sort by opportunity score (descending) - already includes severity, effort, etc.
  return [...items].sort(compareByOpportunityScore).slice(0, 5);
}

function getItemsBySeverity(
  items: BacklogItem[],
  severity: Severity
): BacklogItem[] {
  return items
    .filter((item) => item.severity === severity)
    .sort(compareByGroupOrder);
}

function buildAnalysisNotes(items: BacklogItem[], report: GapReport): string[] {
  const notes = [...report.notes];
  if (items.length > 0) {
    return notes.filter(
      (note) => !/no major product gaps detected/i.test(note)
    );
  }
  return notes;
}

function renderPriorityTable(
  lines: string[],
  title: string,
  items: BacklogItem[]
): void {
  if (items.length === 0) return;
  lines.push(`## ${title}`);
  lines.push("");
  lines.push("| Score | Title | Route | Category | Effort | Suggested Fix |");
  lines.push("| ----- | ----- | ----- | -------- | ------ | ------------- |");
  // Sort by opportunity score within the priority group
  const sortedItems = [...items].sort(compareByOpportunityScore);
  sortedItems.forEach((item) => {
    lines.push(
      `| **${item.opportunityScore}** | ${escapeCell(item.title)} | \`${item.route}\` | ${item.category} | ${item.effort} | ${escapeCell(item.suggestedFix)} |`
    );
  });
  lines.push("");
}

function generateMarkdown(
  items: BacklogItem[],
  report: GapReport,
  perfRegressions: PerfRegressionReport | null,
  insights: InsightsReport | null
): string {
  const lines: string[] = [];
  // Sort by opportunity score (primary sort)
  const stableItems = [...items].sort(compareByOpportunityScore);
  const bySeverity = {
    critical: stableItems.filter((i) => i.severity === "critical").length,
    high: stableItems.filter((i) => i.severity === "high").length,
    medium: stableItems.filter((i) => i.severity === "medium").length,
    low: stableItems.filter((i) => i.severity === "low").length,
  };
  const byCategory = getCountsByCategory(stableItems);
  const topRoutes = getTopRoutes(stableItems);
  const topActions = getTopActions(stableItems);
  const stableRoutesAudited = sortedUnique(report.routesAudited);

  lines.push("# Product Backlog");
  lines.push("");
  lines.push(`> Source report timestamp: ${report.timestamp}`);
  lines.push("");

  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total Items:** ${stableItems.length}`);
  lines.push(`- **Critical:** ${bySeverity.critical}`);
  lines.push(`- **High:** ${bySeverity.high}`);
  lines.push(`- **Medium:** ${bySeverity.medium}`);
  lines.push(`- **Low:** ${bySeverity.low}`);
  if (stableItems.length > 0) {
    const maxScore = Math.max(...stableItems.map((i) => i.opportunityScore));
    const avgScore =
      stableItems.reduce((sum, i) => sum + i.opportunityScore, 0) /
      stableItems.length;
    lines.push(`- **Max Opportunity Score:** ${maxScore}`);
    lines.push(`- **Avg Opportunity Score:** ${avgScore.toFixed(1)}`);
  }
  if (insights) {
    lines.push(
      `- **Analytics Insights:** ${insights.summary.total} dropoff signals`
    );
  }
  lines.push("");

  if (byCategory.length > 0) {
    lines.push("### By Category");
    lines.push("");
    byCategory.forEach((entry) =>
      lines.push(`- **${entry.category}:** ${entry.count}`)
    );
    lines.push("");
  }

  if (topRoutes.length > 0) {
    lines.push("### Top Offender Routes");
    lines.push("");
    [...topRoutes]
      .sort((a, b) => b.count - a.count || a.route.localeCompare(b.route))
      .slice(0, 5)
      .forEach((entry) => {
        lines.push(`- \`${entry.route}\`: ${entry.count} items`);
      });
    lines.push("");
  }

  lines.push("### Opportunity Score");
  lines.push("");
  lines.push(
    "Items are ranked by **Opportunity Score** (0-200), calculated as:"
  );
  lines.push("");
  lines.push("```");
  lines.push(
    "Base = (Severity × 25) + CategoryBoost + EffortBoost + DropoffBoost"
  );
  lines.push("Score = Base × TrafficMultiplier");
  lines.push("```");
  lines.push("");
  lines.push("| Factor | Values |");
  lines.push("| ------ | ------ |");
  lines.push("| Severity | Critical=100, High=75, Medium=50, Low=25 |");
  lines.push("| Conversion Category | +20 points |");
  lines.push("| Effort Efficiency | S=+10, M=+5, L=+0 |");
  lines.push("| Dropoff Signal | +30 if analytics show dropoff on route |");
  lines.push("| Traffic Multiplier | 0.5x-1.5x based on route importance |");
  lines.push("");

  lines.push("### Related Inputs");
  lines.push("");
  lines.push("- Reports: `e2e/reports/product-gaps.json`");
  lines.push("- Heuristics test: `e2e/product-heuristics.spec.ts`");
  lines.push("- Generator: `scripts/generate-product-backlog.ts`");
  if (perfRegressions)
    lines.push("- Perf regressions: `e2e/reports/perf-regressions.json`");
  if (insights)
    lines.push("- Analytics insights: `e2e/reports/analytics-insights.json`");
  lines.push("");

  if (topActions.length > 0) {
    lines.push("## Top 5 Next Actions (by Opportunity Score)");
    lines.push("");
    lines.push(
      "| Rank | Score | Item | Route | Severity | Effort | Suggested Fix |"
    );
    lines.push(
      "| ---- | ----- | ---- | ----- | -------- | ------ | ------------- |"
    );
    topActions.forEach((item, index) => {
      lines.push(
        `| ${index + 1} | **${item.opportunityScore}** | ${escapeCell(item.title)} | \`${item.route}\` | ${severityToLabel(item.severity)} | ${item.effort} | ${escapeCell(item.suggestedFix)} |`
      );
    });
    lines.push("");
  }

  if (stableItems.length > 0) {
    lines.push("## Execution Tracker");
    lines.push("");
    lines.push("| Score | ID | Severity | Status | Owner | Sprint |");
    lines.push("| ----- | -- | -------- | ------ | ----- | ------ |");
    stableItems.forEach((item) => {
      lines.push(
        `| ${item.opportunityScore} | \`${item.id}\` | ${severityToLabel(item.severity)} | Todo | TBD | TBD |`
      );
    });
    lines.push("");
  }

  lines.push("### Routes Audited");
  lines.push("");
  stableRoutesAudited.forEach((route) => lines.push(`- \`${route}\``));
  lines.push("");

  const criticalItems = getItemsBySeverity(stableItems, "critical");
  if (criticalItems.length > 0) {
    lines.push("## Critical Issues (Immediate Action Required)");
    lines.push("");
    for (const item of criticalItems) {
      lines.push(`### ${item.title}`);
      lines.push("");
      lines.push("| Field | Value |");
      lines.push("| ----- | ----- |");
      lines.push(`| **ID** | \`${item.id}\` |`);
      lines.push(`| **Severity** | ${severityToLabel(item.severity)} |`);
      lines.push(`| **Impact** | ${item.impact} |`);
      lines.push(`| **Effort** | ${effortToDescription(item.effort)} |`);
      lines.push(`| **Route** | \`${item.route}\` |`);
      lines.push(`| **Category** | ${item.category} |`);
      lines.push(`| **Source** | ${item.source} |`);
      if (item.evidence)
        lines.push(`| **Evidence** | ${escapeCell(item.evidence)} |`);
      if (item.screenshotPath)
        lines.push(`| **Screenshot** | \`${item.screenshotPath}\` |`);
      lines.push("");
      lines.push(`**Suggested Fix:** ${item.suggestedFix}`);
      lines.push("");
      lines.push("---");
      lines.push("");
    }
  }

  renderPriorityTable(
    lines,
    "High Priority",
    getItemsBySeverity(stableItems, "high")
  );
  renderPriorityTable(
    lines,
    "Medium Priority",
    getItemsBySeverity(stableItems, "medium")
  );

  const lowItems = getItemsBySeverity(stableItems, "low");
  if (lowItems.length > 0) {
    lines.push("## Low Priority");
    lines.push("");
    lines.push("| Score | Title | Route | Category | Effort |");
    lines.push("| ----- | ----- | ----- | -------- | ------ |");
    const sortedLowItems = [...lowItems].sort(compareByOpportunityScore);
    sortedLowItems.forEach((item) => {
      lines.push(
        `| ${item.opportunityScore} | ${escapeCell(item.title)} | \`${item.route}\` | ${item.category} | ${item.effort} |`
      );
    });
    lines.push("");
  }

  if (stableItems.length > 0) {
    lines.push("## Grouped by Route");
    lines.push("");
    lines.push("| Route | Item Count | Categories |");
    lines.push("| ----- | ---------- | ---------- |");
    topRoutes.forEach((entry) => {
      const categories = sortedUnique(
        stableItems
          .filter((item) => item.route === entry.route)
          .map((item) => item.category)
      ).join(", ");
      lines.push(
        `| \`${entry.route}\` | ${entry.count} | ${escapeCell(categories)} |`
      );
    });
    lines.push("");

    lines.push("## Grouped by Category");
    lines.push("");
    lines.push("| Category | Item Count | Example Routes |");
    lines.push("| -------- | ---------- | -------------- |");
    byCategory.forEach((entry) => {
      const routes = sortedUnique(
        stableItems
          .filter((item) => item.category === entry.category)
          .map((item) => item.route)
      )
        .slice(0, 5)
        .join(", ");
      lines.push(
        `| ${entry.category} | ${entry.count} | ${escapeCell(routes)} |`
      );
    });
    lines.push("");
  }

  lines.push("## All Items Detail");
  lines.push("");
  lines.push("<details>");
  lines.push("<summary>Click to expand full item details</summary>");
  lines.push("");

  stableItems.forEach((item) => {
    lines.push(`### ${item.title}`);
    lines.push("");
    lines.push(`- **Opportunity Score:** ${item.opportunityScore}`);
    lines.push(`- **ID:** \`${item.id}\``);
    lines.push(`- **Severity:** ${severityToLabel(item.severity)}`);
    lines.push(`- **Impact:** ${item.impact}`);
    lines.push(`- **Effort:** ${effortToDescription(item.effort)}`);
    lines.push(`- **Route:** \`${item.route}\``);
    lines.push(`- **Category:** ${item.category}`);
    lines.push(`- **Source:** ${item.source}`);
    if (item.evidence) lines.push(`- **Evidence:** ${item.evidence}`);
    if (item.screenshotPath)
      lines.push(`- **Screenshot:** \`${item.screenshotPath}\``);
    lines.push(`- **Suggested Fix:** ${item.suggestedFix}`);
    lines.push("");
  });

  lines.push("</details>");
  lines.push("");

  if (perfRegressions) {
    lines.push("## Performance Regression Snapshot");
    lines.push("");
    lines.push(
      `- **Total Regressions:** ${perfRegressions.summary.totalRegressions}`
    );
    lines.push(
      `- **Budget Exceeded:** ${perfRegressions.summary.budgetExceededCount}`
    );
    lines.push(
      `- **Trend Regressions (> threshold):** ${perfRegressions.summary.trendRegressionCount}`
    );
    if (perfRegressions.regressions.length > 0) {
      lines.push("");
      lines.push("| Route | Metric | Current | Budget |");
      lines.push("| ----- | ------ | ------- | ------ |");
      [...perfRegressions.regressions]
        .sort(
          (a, b) =>
            a.route.localeCompare(b.route) || a.metric.localeCompare(b.metric)
        )
        .slice(0, 10)
        .forEach((regression) => {
          lines.push(
            `| \`${regression.route}\` | ${regression.metric} | ${regression.currentValue} | ${regression.budget ?? "n/a"} |`
          );
        });
    }
    lines.push("");
  }

  const analysisNotes = buildAnalysisNotes(stableItems, report);
  if (analysisNotes.length > 0) {
    lines.push("## Analysis Notes");
    lines.push("");
    analysisNotes.forEach((note) => lines.push(`- ${note}`));
    lines.push("");
  } else if (stableItems.length > 0) {
    lines.push("## Analysis Notes");
    lines.push("");
    lines.push(
      "- Backlog contains actionable optimization items even when no critical contract gaps are present."
    );
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Generated by `scripts/generate-product-backlog.ts` from deterministic report inputs.*"
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  console.log("Product Backlog Generator");
  console.log("=========================\n");

  if (!fs.existsSync(GAPS_REPORT_PATH)) {
    console.error(`Error: Gap report not found at ${GAPS_REPORT_PATH}`);
    console.error(
      "Run 'pnpm test:e2e:inventory' first to generate the gap report."
    );
    process.exit(1);
  }

  const report: GapReport = JSON.parse(
    fs.readFileSync(GAPS_REPORT_PATH, "utf-8")
  );
  console.log(`Read gap report from: ${GAPS_REPORT_PATH}`);
  console.log(`Report timestamp: ${report.timestamp}`);

  const perfRegressions = loadPerfRegressionReport();
  const insights = loadInsightsReport();

  if (insights) {
    console.log(
      `Loaded analytics insights: ${insights.summary.total} dropoff signals`
    );
  } else {
    console.log(`No analytics insights found (optional)`);
  }

  const items = convertToBacklogItems(report, insights);
  console.log(`Converted to ${items.length} backlog items`);

  if (items.length > 0) {
    const maxScore = Math.max(...items.map((i) => i.opportunityScore));
    const avgScore =
      items.reduce((sum, i) => sum + i.opportunityScore, 0) / items.length;
    console.log(`Max opportunity score: ${maxScore}`);
    console.log(`Avg opportunity score: ${avgScore.toFixed(1)}`);
  }

  const markdown = generateMarkdown(items, report, perfRegressions, insights);

  const docsDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, markdown);
  console.log(`\nBacklog written to: ${OUTPUT_PATH}`);

  console.log("\nSummary:");
  console.log(`  Total items: ${items.length}`);
  console.log(
    `  Critical: ${items.filter((i) => i.severity === "critical").length}`
  );
  console.log(`  High: ${items.filter((i) => i.severity === "high").length}`);
  console.log(
    `  Medium: ${items.filter((i) => i.severity === "medium").length}`
  );
  console.log(`  Low: ${items.filter((i) => i.severity === "low").length}`);

  if (items.length > 0) {
    console.log("\nTop 5 by Opportunity Score:");
    items.slice(0, 5).forEach((item, i) => {
      console.log(
        `  ${i + 1}. [${item.opportunityScore}] ${item.title} (${item.route})`
      );
    });
  }
}

main();
