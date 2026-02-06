import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E tests.
 *
 * Test organization:
 *   - e2e/homepage.spec.ts - Homepage tests (stable)
 *   - e2e/servers.spec.ts - Public server browsing tests (stable)
 *   - e2e/auth.spec.ts - Auth-dependent tests (skip in CI with CI_SKIP_AUTH_TESTS=true)
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["list"], ["github"]]
    : [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  outputDir: "test-results",
  // Increase timeout for CI
  timeout: process.env.CI ? 60000 : 30000,
  expect: {
    timeout: process.env.CI ? 10000 : 5000,
  },
});
