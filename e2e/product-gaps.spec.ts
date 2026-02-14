import * as fs from "fs";
import * as path from "path";

import { test, expect } from "@playwright/test";

const GAP_REPORT_PATH = path.join(__dirname, "reports", "product-gaps.json");
const TEST_RUN_STARTED_AT = Date.now();

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
  notes: string[];
}

function isSorted(values: string[]): boolean {
  return values.every(
    (value, index) => index === 0 || values[index - 1] <= value
  );
}

async function waitForGapReport(
  timeoutMs = 45000,
  minMtimeMs = 0
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(GAP_REPORT_PATH)) {
      const stats = fs.statSync(GAP_REPORT_PATH);
      if (stats.mtimeMs >= minMtimeMs) return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!fs.existsSync(GAP_REPORT_PATH)) return false;
  return fs.statSync(GAP_REPORT_PATH).mtimeMs >= minMtimeMs;
}

test.describe("Product Gap Report (Non-Gating)", () => {
  test("gap report exists and has required shape", async () => {
    const exists = await waitForGapReport(45000, TEST_RUN_STARTED_AT);
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
  });

  test("deterministic arrays are sorted", async () => {
    const exists = await waitForGapReport(45000, TEST_RUN_STARTED_AT);
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
});
