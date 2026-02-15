import * as fs from "fs";
import * as path from "path";

import { test, expect } from "@playwright/test";

const GAP_REPORT_PATH = path.join(__dirname, "reports", "product-gaps.json");
const HEURISTICS_REPORT_PATH = path.join(
  __dirname,
  "reports",
  "product-heuristics.json"
);

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
  baseUrl: string;
  pages: {
    route: string;
    name: string;
    gaps: HeuristicGap[];
  }[];
  summary: {
    totalPages: number;
    totalGaps: number;
    gapsBySeverity: Record<Severity, number>;
    topOffenders: { route: string; gapCount: number }[];
  };
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
  a11yIssuesSummary: Record<string, { issueCount: number }>;
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
    conversion: HeuristicGap[];
    summary: {
      totalGaps: number;
      gapsBySeverity: Record<Severity, number>;
      topOffenders: { route: string; gapCount: number }[];
    };
  };
  notes: string[];
}

function isSorted(values: string[]): boolean {
  return values.every(
    (value, index) => index === 0 || values[index - 1] <= value
  );
}

function readHeuristicsReport(): HeuristicReport | null {
  if (!fs.existsSync(HEURISTICS_REPORT_PATH)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(HEURISTICS_REPORT_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function mergeHeuristicsIntoGapReport(gapReport: GapReport): GapReport {
  const heuristics = readHeuristicsReport();

  if (!heuristics) {
    gapReport.heuristicGaps = {
      source: null,
      generatedAt: null,
      gaps: [],
      conversion: [],
      summary: {
        totalGaps: 0,
        gapsBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
        topOffenders: [],
      },
    };
    return gapReport;
  }

  // Collect all gaps and sort deterministically
  const allGaps = heuristics.pages
    .flatMap((p) => p.gaps)
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff =
        severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      const routeDiff = a.route.localeCompare(b.route);
      if (routeDiff !== 0) return routeDiff;
      return a.id.localeCompare(b.id);
    });

  const conversionGaps = allGaps
    .filter((gap) => gap.category === "conversion")
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const severityDiff =
        severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      const routeDiff = a.route.localeCompare(b.route);
      if (routeDiff !== 0) return routeDiff;
      return a.id.localeCompare(b.id);
    });

  gapReport.heuristicGaps = {
    source: HEURISTICS_REPORT_PATH,
    generatedAt: heuristics.generatedAt,
    gaps: allGaps,
    conversion: conversionGaps,
    summary: heuristics.summary,
  };

  // Add heuristic summary to notes if there are critical/high gaps
  const criticalHigh =
    heuristics.summary.gapsBySeverity.critical +
    heuristics.summary.gapsBySeverity.high;
  gapReport.notes = gapReport.notes.filter(
    (note) => !/critical\/high heuristic gaps detected/i.test(note)
  );
  if (criticalHigh > 0) {
    gapReport.notes.push(
      `${criticalHigh} critical/high heuristic gaps detected`
    );
  }
  if (heuristics.summary.totalGaps > 0) {
    gapReport.notes = gapReport.notes.filter(
      (note) => note !== "No major product gaps detected in current audit."
    );
  }

  // Keep notes deterministic, unique, and capped
  gapReport.notes = Array.from(new Set(gapReport.notes))
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 8);

  return gapReport;
}

async function waitForGapReport(timeoutMs = 45000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(GAP_REPORT_PATH)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return fs.existsSync(GAP_REPORT_PATH);
}

test.describe("Product Gap Report (Non-Gating)", () => {
  test("gap report exists and has required shape", async () => {
    const exists = await waitForGapReport(45000);
    expect(exists).toBeTruthy();

    const report = JSON.parse(
      fs.readFileSync(GAP_REPORT_PATH, "utf-8")
    ) as GapReport;

    expect(typeof report.timestamp).toBe("string");
    expect(Array.isArray(report.routesAudited)).toBeTruthy();
    expect(Array.isArray(report.brokenLinks)).toBeTruthy();
    expect(Array.isArray(report.missingRoutes)).toBeTruthy();
    expect(Array.isArray(report.metadataIssues)).toBeTruthy();
    expect(Array.isArray(report.notes)).toBeTruthy();

    expect(Array.isArray(report.navCoverage.headerLinks)).toBeTruthy();
    expect(Array.isArray(report.navCoverage.footerLinks)).toBeTruthy();
    expect(Array.isArray(report.navCoverage.missingInHeader)).toBeTruthy();
    expect(Array.isArray(report.navCoverage.missingInFooter)).toBeTruthy();

    expect(typeof report.a11yIssuesSummary).toBe("object");
    expect(typeof report.performanceFlags.note).toBe("string");
    expect(Array.isArray(report.performanceFlags.flags)).toBeTruthy();

    // heuristicGaps may or may not be present yet (added after merge test)
    if (report.heuristicGaps) {
      expect(Array.isArray(report.heuristicGaps.gaps)).toBeTruthy();
      if (report.heuristicGaps.conversion) {
        expect(Array.isArray(report.heuristicGaps.conversion)).toBeTruthy();
      }
      expect(typeof report.heuristicGaps.summary).toBe("object");
    }
  });

  test("deterministic arrays are sorted", async () => {
    const exists = await waitForGapReport(45000);
    expect(exists).toBeTruthy();

    const report = JSON.parse(
      fs.readFileSync(GAP_REPORT_PATH, "utf-8")
    ) as GapReport;

    expect(isSorted(report.routesAudited)).toBeTruthy();
    expect(isSorted(report.missingRoutes)).toBeTruthy();
    expect(isSorted(report.navCoverage.headerLinks)).toBeTruthy();
    expect(isSorted(report.navCoverage.footerLinks)).toBeTruthy();
    expect(isSorted(report.navCoverage.missingInHeader)).toBeTruthy();
    expect(isSorted(report.navCoverage.missingInFooter)).toBeTruthy();

    const metadataSortTokens = report.metadataIssues.map(
      (issue) => `${issue.route}:${issue.issue}`
    );
    expect(isSorted(metadataSortTokens)).toBeTruthy();

    const brokenSortTokens = report.brokenLinks.map(
      (link) => `${link.from}:${link.to}:${link.status}`
    );
    expect(isSorted(brokenSortTokens)).toBeTruthy();

    const perfSortTokens = report.performanceFlags.flags.map(
      (flag) => `${flag.route}:${flag.metric}`
    );
    expect(isSorted(perfSortTokens)).toBeTruthy();
  });

  test("merge heuristics data into gap report", async () => {
    const exists = await waitForGapReport(45000);
    expect(exists).toBeTruthy();

    // Read current gap report
    let report = JSON.parse(
      fs.readFileSync(GAP_REPORT_PATH, "utf-8")
    ) as GapReport;

    // Merge heuristics data
    report = mergeHeuristicsIntoGapReport(report);

    // Write merged report
    fs.writeFileSync(GAP_REPORT_PATH, JSON.stringify(report, null, 2));

    console.log("\n=== Gap Report Merged ===\n");
    console.log(
      `Heuristic gaps source: ${report.heuristicGaps?.source || "none"}`
    );
    console.log(
      `Total heuristic gaps: ${report.heuristicGaps?.summary.totalGaps || 0}`
    );

    if (report.heuristicGaps?.summary.totalGaps) {
      console.log("\nGaps by severity:");
      console.log(
        `  Critical: ${report.heuristicGaps.summary.gapsBySeverity.critical}`
      );
      console.log(
        `  High: ${report.heuristicGaps.summary.gapsBySeverity.high}`
      );
      console.log(
        `  Medium: ${report.heuristicGaps.summary.gapsBySeverity.medium}`
      );
      console.log(`  Low: ${report.heuristicGaps.summary.gapsBySeverity.low}`);
    }

    // Verify structure
    expect(report.heuristicGaps).toBeDefined();
    expect(Array.isArray(report.heuristicGaps?.gaps)).toBeTruthy();
    expect(Array.isArray(report.heuristicGaps?.conversion)).toBeTruthy();
    expect(report.heuristicGaps?.summary).toBeDefined();

    // Verify gaps are sorted if present
    if (report.heuristicGaps?.gaps.length) {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      let isSortedBySeverity = true;
      for (let i = 1; i < report.heuristicGaps.gaps.length; i++) {
        const prev = report.heuristicGaps.gaps[i - 1];
        const curr = report.heuristicGaps.gaps[i];
        const prevOrder = severityOrder[prev.severity];
        const currOrder = severityOrder[curr.severity];
        if (prevOrder > currOrder) {
          isSortedBySeverity = false;
          break;
        }
      }
      expect(isSortedBySeverity).toBeTruthy();
    }

    if (report.heuristicGaps?.conversion.length) {
      const tokenized = report.heuristicGaps.conversion.map(
        (gap) => `${gap.severity}:${gap.route}:${gap.id}`
      );
      expect(isSorted(tokenized)).toBeTruthy();
    }

    console.log(`\nMerged report written to: ${GAP_REPORT_PATH}`);
  });
});
