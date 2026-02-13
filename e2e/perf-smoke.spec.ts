/**
 * Performance Smoke Test Suite
 *
 * Captures and validates basic performance metrics:
 * - TTFB and DOMContentLoaded timing
 * - Network request count and transfer size
 * - API caching headers
 *
 * Conservative thresholds designed to catch extreme regressions only.
 * Run with: pnpm exec playwright test perf-smoke.spec.ts
 */
/* eslint-disable no-console */
import fs from "fs";

import { expect, test } from "@playwright/test";

// Conservative thresholds (dev mode is slower than production)
const THRESHOLDS = {
  maxWallClockMs: 15000, // Very conservative for dev mode
  maxTTFBMs: 5000,
  maxDOMContentLoadedMs: 10000,
  maxResourceCount: 50,
  maxTransferKB: 10000,
};

const PAGES = [
  { name: "homepage", path: "/" },
  { name: "servers", path: "/servers" },
  { name: "docs", path: "/docs" },
  { name: "about", path: "/about" },
  { name: "signin", path: "/signin" },
];

interface PerfResult {
  page: string;
  url: string;
  wallClockMs: number;
  ttfbMs: number | null;
  domContentLoadedMs: number | null;
  resourceCount: number;
  totalTransferKB: number;
  statusCode: number | null;
}

const allResults: PerfResult[] = [];

for (const pageDef of PAGES) {
  test(`perf: ${pageDef.name} loads within thresholds`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    const startTime = Date.now();
    const response = await page.goto(pageDef.path, {
      waitUntil: "networkidle",
      timeout: THRESHOLDS.maxWallClockMs,
    });
    const wallClockMs = Date.now() - startTime;

    const timing = await page.evaluate(() => {
      const entries = performance.getEntriesByType("navigation");
      const nav =
        entries.length > 0 ? (entries[0] as PerformanceNavigationTiming) : null;
      const resources = performance.getEntriesByType("resource");

      return {
        ttfb: nav ? Math.round(nav.responseStart - nav.requestStart) : null,
        domContentLoaded: nav
          ? Math.round(nav.domContentLoadedEventEnd - nav.startTime)
          : null,
        resourceCount: resources.length,
        totalTransferSize: resources.reduce(
          (sum, r) =>
            sum + ((r as PerformanceResourceTiming).transferSize || 0),
          0
        ),
      };
    });

    const result: PerfResult = {
      page: pageDef.name,
      url: pageDef.path,
      wallClockMs,
      ttfbMs: timing.ttfb,
      domContentLoadedMs: timing.domContentLoaded,
      resourceCount: timing.resourceCount,
      totalTransferKB: Math.round(timing.totalTransferSize / 1024),
      statusCode: response ? response.status() : null,
    };

    allResults.push(result);

    // Log metrics
    console.log(`\n📊 ${pageDef.name}:`);
    console.log(`   Wall clock: ${wallClockMs}ms`);
    console.log(`   TTFB: ${timing.ttfb}ms`);
    console.log(`   DOMContentLoaded: ${timing.domContentLoaded}ms`);
    console.log(`   Resources: ${timing.resourceCount}`);
    console.log(`   Transfer: ${result.totalTransferKB}KB`);

    // Assert thresholds
    expect(wallClockMs).toBeLessThan(THRESHOLDS.maxWallClockMs);
    if (timing.ttfb !== null) {
      expect(timing.ttfb).toBeLessThan(THRESHOLDS.maxTTFBMs);
    }
    if (timing.domContentLoaded !== null) {
      expect(timing.domContentLoaded).toBeLessThan(
        THRESHOLDS.maxDOMContentLoadedMs
      );
    }
    expect(timing.resourceCount).toBeLessThan(THRESHOLDS.maxResourceCount);
    expect(result.totalTransferKB).toBeLessThan(THRESHOLDS.maxTransferKB);
  });
}

test("perf: API /api/servers has proper cache headers", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  const apiResult = await page.evaluate(async () => {
    const res = await fetch("/api/servers?limit=10");
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k] = v;
    });
    return {
      status: res.status,
      cacheControl: headers["cache-control"] || "none",
      bodySize: (await res.text()).length,
    };
  });

  console.log(`\n📊 API /api/servers:`);
  console.log(`   Status: ${apiResult.status}`);
  console.log(`   Cache-Control: ${apiResult.cacheControl}`);
  console.log(`   Body size: ${apiResult.bodySize} bytes`);

  expect(apiResult.status).toBe(200);
  // API should have public caching
  expect(apiResult.cacheControl).toContain("s-maxage");
});

// Write combined results after all tests
test.afterAll(() => {
  if (allResults.length > 0) {
    const reportDir = "e2e/reports";
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(
      `${reportDir}/perf-smoke-results.json`,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          thresholds: THRESHOLDS,
          results: allResults,
        },
        null,
        2
      )
    );
    console.log(`\n📁 Results written to ${reportDir}/perf-smoke-results.json`);
  }
});
