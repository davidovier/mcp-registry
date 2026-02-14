#!/usr/bin/env npx ts-node
/**
 * Product Backlog Generator
 *
 * Reads the product-gaps.json report and generates a prioritized
 * backlog document at docs/product-backlog.md
 *
 * Usage:
 *   npx ts-node scripts/generate-product-backlog.ts
 *   pnpm product:backlog
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
const OUTPUT_PATH = path.join(__dirname, "..", "docs", "product-backlog.md");

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
    summary: {
      totalGaps: number;
      gapsBySeverity: Record<Severity, number>;
      topOffenders: { route: string; gapCount: number }[];
    };
  };
  notes: string[];
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
}

function severityToEmoji(severity: Severity): string {
  switch (severity) {
    case "critical":
      return "CRITICAL";
    case "high":
      return "HIGH";
    case "medium":
      return "MEDIUM";
    case "low":
      return "LOW";
  }
}

function severityToImpact(severity: Severity, _category: string): string {
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

function convertToBacklogItems(report: GapReport): BacklogItem[] {
  const items: BacklogItem[] = [];

  // Convert broken links to backlog items
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
    });
  }

  // Convert missing routes to backlog items
  for (const route of report.missingRoutes) {
    items.push({
      id: `missing-route-${route.replace(/\//g, "-")}`,
      title: `Missing route: ${route}`,
      severity: "medium",
      impact: "Linked route returns 404, breaking user navigation",
      effort: "M",
      route: route,
      evidence: `Route ${route} is linked but returns 404`,
      suggestedFix: `Create the missing page or fix the incorrect link`,
      category: "navigation",
    });
  }

  // Convert nav coverage issues
  for (const missing of report.navCoverage.missingInHeader) {
    items.push({
      id: `nav-header-missing-${missing.toLowerCase()}`,
      title: `Header nav missing: ${missing}`,
      severity: "medium",
      impact: "Important navigation link not accessible from header",
      effort: "S",
      route: "/",
      evidence: `Expected "${missing}" link not found in header navigation`,
      suggestedFix: `Add "${missing}" link to header navigation`,
      category: "navigation",
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
      evidence: `Expected "${missing}" link not found in footer`,
      suggestedFix: `Add "${missing}" link to footer`,
      category: "navigation",
    });
  }

  // Convert metadata issues
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
    });
  }

  // Convert a11y issues
  for (const [route, issues] of Object.entries(report.a11yIssuesSummary)) {
    if (issues.issueCount > 0) {
      const issueList: string[] = [];
      if (issues.missingMainLandmark) issueList.push("missing main landmark");
      if (issues.missingH1) issueList.push("missing h1");
      if (issues.missingSkipLink) issueList.push("missing skip link");
      if (issues.missingHeaderNav) issueList.push("missing header nav");
      if (issues.missingFooter) issueList.push("missing footer");
      if (issues.consoleErrors)
        issueList.push(`${issues.consoleErrors} console errors`);

      if (issueList.length > 0) {
        items.push({
          id: `a11y-${route.replace(/\//g, "-") || "homepage"}`,
          title: `Accessibility issues on ${route || "/"}`,
          severity:
            issues.missingH1 || issues.missingMainLandmark ? "high" : "medium",
          impact: "Accessibility issues affect users with disabilities",
          effort: "S",
          route: route,
          evidence: issueList.join(", "),
          suggestedFix: `Fix: ${issueList.join(", ")}`,
          category: "accessibility",
        });
      }
    }
  }

  // Convert performance flags
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
    });
  }

  // Convert heuristic gaps
  if (report.heuristicGaps?.gaps) {
    for (const gap of report.heuristicGaps.gaps) {
      items.push({
        id: gap.id,
        title: gap.title,
        severity: gap.severity,
        impact: severityToImpact(gap.severity, gap.category),
        effort: gap.effortEstimate,
        route: gap.route,
        evidence: gap.evidence,
        screenshotPath: gap.screenshotPath,
        suggestedFix: gap.suggestedFix,
        category: gap.category,
      });
    }
  }

  // Sort by severity (critical first), then by route
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  items.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return a.route.localeCompare(b.route);
  });

  // Deduplicate by id
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function generateMarkdown(items: BacklogItem[], report: GapReport): string {
  const lines: string[] = [];

  lines.push("# Product Backlog");
  lines.push("");
  lines.push(
    `> Auto-generated from product gap analysis on ${new Date(report.timestamp).toLocaleDateString()}`
  );
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");

  const bySeverity = {
    critical: items.filter((i) => i.severity === "critical").length,
    high: items.filter((i) => i.severity === "high").length,
    medium: items.filter((i) => i.severity === "medium").length,
    low: items.filter((i) => i.severity === "low").length,
  };

  lines.push(`- **Total Items:** ${items.length}`);
  lines.push(`- **Critical:** ${bySeverity.critical}`);
  lines.push(`- **High:** ${bySeverity.high}`);
  lines.push(`- **Medium:** ${bySeverity.medium}`);
  lines.push(`- **Low:** ${bySeverity.low}`);
  lines.push("");

  // Routes audited
  lines.push("### Routes Audited");
  lines.push("");
  for (const route of report.routesAudited) {
    lines.push(`- \`${route}\``);
  }
  lines.push("");

  // Critical items (if any)
  const criticalItems = items.filter((i) => i.severity === "critical");
  if (criticalItems.length > 0) {
    lines.push("## Critical Issues (Immediate Action Required)");
    lines.push("");
    for (const item of criticalItems) {
      lines.push(`### ${item.title}`);
      lines.push("");
      lines.push(`| Field | Value |`);
      lines.push(`| ----- | ----- |`);
      lines.push(`| **ID** | \`${item.id}\` |`);
      lines.push(`| **Severity** | ${severityToEmoji(item.severity)} |`);
      lines.push(`| **Impact** | ${item.impact} |`);
      lines.push(`| **Effort** | ${effortToDescription(item.effort)} |`);
      lines.push(`| **Route** | \`${item.route}\` |`);
      lines.push(`| **Category** | ${item.category} |`);
      if (item.evidence) {
        lines.push(`| **Evidence** | ${item.evidence} |`);
      }
      if (item.screenshotPath) {
        lines.push(`| **Screenshot** | \`${item.screenshotPath}\` |`);
      }
      lines.push("");
      lines.push(`**Suggested Fix:** ${item.suggestedFix}`);
      lines.push("");
      lines.push("---");
      lines.push("");
    }
  }

  // High priority items
  const highItems = items.filter((i) => i.severity === "high");
  if (highItems.length > 0) {
    lines.push("## High Priority");
    lines.push("");
    lines.push("| Title | Route | Category | Effort | Suggested Fix |");
    lines.push("| ----- | ----- | -------- | ------ | ------------- |");
    for (const item of highItems) {
      const title = item.title.replace(/\|/g, "\\|");
      const fix = item.suggestedFix.replace(/\|/g, "\\|").slice(0, 60);
      lines.push(
        `| ${title} | \`${item.route}\` | ${item.category} | ${item.effort} | ${fix} |`
      );
    }
    lines.push("");
  }

  // Medium priority items
  const mediumItems = items.filter((i) => i.severity === "medium");
  if (mediumItems.length > 0) {
    lines.push("## Medium Priority");
    lines.push("");
    lines.push("| Title | Route | Category | Effort | Suggested Fix |");
    lines.push("| ----- | ----- | -------- | ------ | ------------- |");
    for (const item of mediumItems) {
      const title = item.title.replace(/\|/g, "\\|");
      const fix = item.suggestedFix.replace(/\|/g, "\\|").slice(0, 60);
      lines.push(
        `| ${title} | \`${item.route}\` | ${item.category} | ${item.effort} | ${fix} |`
      );
    }
    lines.push("");
  }

  // Low priority items
  const lowItems = items.filter((i) => i.severity === "low");
  if (lowItems.length > 0) {
    lines.push("## Low Priority");
    lines.push("");
    lines.push("| Title | Route | Category | Effort |");
    lines.push("| ----- | ----- | -------- | ------ |");
    for (const item of lowItems) {
      const title = item.title.replace(/\|/g, "\\|");
      lines.push(
        `| ${title} | \`${item.route}\` | ${item.category} | ${item.effort} |`
      );
    }
    lines.push("");
  }

  // All items detail (expandable)
  lines.push("## All Items Detail");
  lines.push("");
  lines.push("<details>");
  lines.push("<summary>Click to expand full item details</summary>");
  lines.push("");

  for (const item of items) {
    lines.push(`### ${item.title}`);
    lines.push("");
    lines.push(`- **ID:** \`${item.id}\``);
    lines.push(`- **Severity:** ${severityToEmoji(item.severity)}`);
    lines.push(`- **Impact:** ${item.impact}`);
    lines.push(`- **Effort:** ${effortToDescription(item.effort)}`);
    lines.push(`- **Route:** \`${item.route}\``);
    lines.push(`- **Category:** ${item.category}`);
    if (item.evidence) {
      lines.push(`- **Evidence:** ${item.evidence}`);
    }
    if (item.screenshotPath) {
      lines.push(`- **Screenshot:** \`${item.screenshotPath}\``);
    }
    lines.push(`- **Suggested Fix:** ${item.suggestedFix}`);
    lines.push("");
  }

  lines.push("</details>");
  lines.push("");

  // Notes from gap analysis
  if (report.notes.length > 0) {
    lines.push("## Analysis Notes");
    lines.push("");
    for (const note of report.notes) {
      lines.push(`- ${note}`);
    }
    lines.push("");
  }

  // Footer
  lines.push("---");
  lines.push("");
  lines.push(
    `*Generated by \`scripts/generate-product-backlog.ts\` at ${new Date().toISOString()}*`
  );
  lines.push("");

  return lines.join("\n");
}

function main() {
  console.log("Product Backlog Generator");
  console.log("=========================\n");

  // Check if gaps report exists
  if (!fs.existsSync(GAPS_REPORT_PATH)) {
    console.error(`Error: Gap report not found at ${GAPS_REPORT_PATH}`);
    console.error(
      "Run 'pnpm test:e2e:inventory' first to generate the gap report."
    );
    process.exit(1);
  }

  // Read report
  const report: GapReport = JSON.parse(
    fs.readFileSync(GAPS_REPORT_PATH, "utf-8")
  );
  console.log(`Read gap report from: ${GAPS_REPORT_PATH}`);
  console.log(`Report timestamp: ${report.timestamp}`);

  // Convert to backlog items
  const items = convertToBacklogItems(report);
  console.log(`Converted to ${items.length} backlog items`);

  // Generate markdown
  const markdown = generateMarkdown(items, report);

  // Ensure docs directory exists
  const docsDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Write output
  fs.writeFileSync(OUTPUT_PATH, markdown);
  console.log(`\nBacklog written to: ${OUTPUT_PATH}`);

  // Summary
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
}

main();
