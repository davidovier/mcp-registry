/* eslint-disable no-console */
import fs from "fs";
import path from "path";

import { test } from "@playwright/test";

const PERF_TRENDS_REPORT_PATH = path.join(
  __dirname,
  "reports",
  "perf-trends.json"
);

const KEY_ROUTES: Array<{ name: string; path: string }> = [
  { name: "homepage", path: "/" },
  { name: "servers", path: "/servers" },
  { name: "servers_github", path: "/servers/github" },
  { name: "docs", path: "/docs" },
  { name: "api", path: "/api" },
  { name: "verification", path: "/verification" },
];

interface RoutePerfSnapshot {
  route: string;
  name: string;
  status: number | null;
  ttfbMs: number | null;
  domContentLoadedMs: number | null;
  loadEventEndMs: number | null;
  fcpMs: number | null;
  jsRequestCount: number;
  cssRequestCount: number;
  totalTransferredBytesApprox: number;
  totalResourceCount: number;
  note: string | null;
}

interface PerfTrendsReport {
  generatedAt: string;
  nonGating: true;
  routes: RoutePerfSnapshot[];
  summary: {
    routeCount: number;
    routesWithErrors: number;
    avgTtfbMs: number | null;
    avgDomContentLoadedMs: number | null;
    avgFcpMs: number | null;
  };
}

function ensureReportsDir() {
  const reportsDir = path.dirname(PERF_TRENDS_REPORT_PATH);
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
}

function roundMetric(value: unknown): number | null {
  if (
    typeof value !== "number" ||
    Number.isNaN(value) ||
    !Number.isFinite(value)
  ) {
    return null;
  }
  return Math.round(value);
}

function average(values: Array<number | null>): number | null {
  const valid = values.filter(
    (value): value is number => typeof value === "number"
  );
  if (valid.length === 0) return null;
  return Math.round(
    valid.reduce((sum, value) => sum + value, 0) / valid.length
  );
}

test.describe("Performance Trends (Non-Gating)", () => {
  test("collect key route performance snapshots", async ({ page }) => {
    ensureReportsDir();

    const snapshots: RoutePerfSnapshot[] = [];

    for (const route of KEY_ROUTES) {
      let jsRequestCount = 0;
      let cssRequestCount = 0;
      let totalTransferredBytesApprox = 0;

      const responseHandler = async (response: {
        request(): { resourceType(): string };
        headers(): Record<string, string>;
      }) => {
        const resourceType = response.request().resourceType();
        if (resourceType === "script") jsRequestCount += 1;
        if (resourceType === "stylesheet") cssRequestCount += 1;

        const headers = response.headers();
        const contentLength = headers["content-length"];
        if (!contentLength) return;

        const parsed = Number.parseInt(contentLength, 10);
        if (!Number.isNaN(parsed) && parsed > 0) {
          totalTransferredBytesApprox += parsed;
        }
      };

      page.on("response", responseHandler);

      let status: number | null = null;
      let note: string | null = null;

      try {
        const response = await page.goto(route.path, {
          waitUntil: "load",
          timeout: 30000,
        });
        await page
          .waitForLoadState("networkidle", { timeout: 10000 })
          .catch(() => {
            // Keep the run non-gating and continue with partial timing data.
          });
        status = response?.status() ?? null;
      } catch (error) {
        status = null;
        note = String(error);
      }

      const timing = await page
        .evaluate(() => {
          const nav = performance.getEntriesByType("navigation")[0] as
            | PerformanceNavigationTiming
            | undefined;
          const paintEntries = performance.getEntriesByType("paint");
          const fcp = paintEntries.find(
            (entry) => entry.name === "first-contentful-paint"
          );
          const resources = performance.getEntriesByType("resource");

          return {
            ttfbMs: nav ? nav.responseStart - nav.requestStart : null,
            domContentLoadedMs: nav
              ? nav.domContentLoadedEventEnd - nav.startTime
              : null,
            loadEventEndMs: nav ? nav.loadEventEnd - nav.startTime : null,
            fcpMs: fcp ? fcp.startTime : null,
            totalResourceCount: resources.length,
          };
        })
        .catch(() => ({
          ttfbMs: null,
          domContentLoadedMs: null,
          loadEventEndMs: null,
          fcpMs: null,
          totalResourceCount: 0,
        }));

      page.off("response", responseHandler);

      snapshots.push({
        route: route.path,
        name: route.name,
        status,
        ttfbMs: roundMetric(timing.ttfbMs),
        domContentLoadedMs: roundMetric(timing.domContentLoadedMs),
        loadEventEndMs: roundMetric(timing.loadEventEndMs),
        fcpMs: roundMetric(timing.fcpMs),
        jsRequestCount,
        cssRequestCount,
        totalTransferredBytesApprox,
        totalResourceCount: timing.totalResourceCount,
        note,
      });
    }

    snapshots.sort((a, b) => a.route.localeCompare(b.route));

    const report: PerfTrendsReport = {
      generatedAt: new Date().toISOString(),
      nonGating: true,
      routes: snapshots,
      summary: {
        routeCount: snapshots.length,
        routesWithErrors: snapshots.filter((snapshot) => snapshot.note !== null)
          .length,
        avgTtfbMs: average(snapshots.map((snapshot) => snapshot.ttfbMs)),
        avgDomContentLoadedMs: average(
          snapshots.map((snapshot) => snapshot.domContentLoadedMs)
        ),
        avgFcpMs: average(snapshots.map((snapshot) => snapshot.fcpMs)),
      },
    };

    fs.writeFileSync(PERF_TRENDS_REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(
      `\n📁 Perf trends report written to ${PERF_TRENDS_REPORT_PATH}`
    );
  });
});
