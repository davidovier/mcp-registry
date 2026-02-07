import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E tests.
 *
 * Test organization:
 *   - e2e/homepage.spec.ts - Homepage tests (public)
 *   - e2e/servers.spec.ts - Public server browsing tests (public)
 *   - e2e/api.spec.ts - API tests (public)
 *   - e2e/submit.spec.ts - Submit page tests (authenticated)
 *   - e2e/auth.spec.ts - Auth redirect tests (skip in CI unless auth configured)
 *   - e2e/auth.setup.ts - Authentication setup for authenticated tests
 *
 * Environment variables for authenticated tests:
 *   - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin operations
 *   - E2E_TEST_USER_EMAIL: Test user email
 *   - E2E_TEST_USER_PASSWORD: Test user password
 *
 * @see https://playwright.dev/docs/test-configuration
 */

// Check if auth testing is available (all required env vars present)
const hasAuthConfig =
  !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !!process.env.E2E_TEST_USER_EMAIL &&
  !!process.env.E2E_TEST_USER_PASSWORD;

// Skip auth tests in CI unless explicitly configured
const skipAuthTests =
  process.env.CI_SKIP_AUTH_TESTS === "true" ||
  (!hasAuthConfig && !!process.env.CI);

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
    // Setup project for authentication
    ...(skipAuthTests
      ? []
      : [
          {
            name: "setup",
            testMatch: /auth\.setup\.ts/,
            use: { ...devices["Desktop Chrome"] },
          },
        ]),

    // Public tests - no authentication required
    {
      name: "chromium",
      testMatch: /^(?!.*auth\.).*\.spec\.ts$/,
      testIgnore: skipAuthTests ? [/auth\.spec\.ts/, /submit\.spec\.ts/] : [],
      use: { ...devices["Desktop Chrome"] },
    },

    // Authenticated tests - depend on setup project
    ...(skipAuthTests
      ? []
      : [
          {
            name: "authenticated",
            testMatch: [/submit\.spec\.ts/],
            dependencies: ["setup"],
            use: {
              ...devices["Desktop Chrome"],
              storageState: "playwright/.auth/user.json",
            },
          },
        ]),
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
