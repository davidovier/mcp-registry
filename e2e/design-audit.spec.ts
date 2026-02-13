/**
 * Design Audit Test Suite
 *
 * Captures screenshots and computes contrast ratios for design QA.
 * Run with: pnpm exec playwright test design-audit.spec.ts
 */
/* eslint-disable no-console */
import fs from "fs";
import path from "path";

import { Page, test } from "@playwright/test";

import { createContrastCheck, type ContrastCheck } from "./utils/contrast";

// Configuration
const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  mobile: { width: 390, height: 844 },
};

const PUBLIC_PAGES = [
  { name: "homepage", path: "/" },
  { name: "servers", path: "/servers" },
  { name: "server-detail", path: "/servers/github" },
  { name: "signin", path: "/signin" },
  { name: "docs", path: "/docs" },
  { name: "about", path: "/about" },
  { name: "404", path: "/servers/non-existent-slug-xyz" },
];

const AUTH_PAGES = [
  { name: "submit", path: "/submit" },
  { name: "my-submissions", path: "/my/submissions" },
  { name: "admin-submissions", path: "/admin/submissions" },
];

const THEMES = ["light", "dark"] as const;

interface AuditResult {
  page: string;
  viewport: string;
  theme: string;
  screenshot: string;
  contrastChecks: ContrastCheck[];
  styles: Record<string, string>;
}

// Helper to set theme
async function setTheme(page: Page, theme: "light" | "dark") {
  await page.evaluate((t: string) => {
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Also set localStorage to persist
    localStorage.setItem("theme", t);
  }, theme);
  // Wait for theme to apply
  await page.waitForTimeout(100);
}

// Helper to extract computed styles
async function extractStyles(page: Page) {
  return await page.evaluate(() => {
    const body = document.body;
    const bodyStyles = getComputedStyle(body);

    // Find specific elements for contrast checking
    const findElement = (selectors: string[]): Element | null => {
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el) return el;
      }
      return null;
    };

    const getStyles = (el: Element | null) => {
      if (!el) return { color: "", background: "" };
      const s = getComputedStyle(el);
      return {
        color: s.color,
        background: s.backgroundColor,
      };
    };

    // Primary text (main headings)
    const primaryText = findElement([
      "h1",
      "h2",
      "[class*='text-content-primary']",
    ]);
    // Secondary text
    const secondaryText = findElement([
      "[class*='text-content-secondary']",
      "[class*='text-neutral-600']",
      "[class*='text-neutral-400']",
    ]);
    // Tertiary text
    const tertiaryText = findElement([
      "[class*='text-content-tertiary']",
      "[class*='text-neutral-500']",
    ]);
    // Card element
    const card = findElement([
      "[class*='bg-surface-secondary']",
      "[class*='rounded-xl'][class*='border']",
    ]);
    // Button primary
    const btnPrimary = findElement([
      "button[class*='bg-brand']",
      "[class*='bg-brand-700']",
      "[class*='bg-brand-600']",
      "[class*='bg-brand-500']",
    ]);
    // Button secondary
    const btnSecondary = findElement([
      "button[class*='bg-surface-secondary']",
      "button[class*='border-border']",
    ]);
    // Input
    const input = findElement(["input", "textarea"]);
    // Badge - look for specific badge types
    const badgeBrand = findElement([
      "[class*='bg-brand-50']",
      "[class*='bg-brand-900']",
    ]);
    const badgeDefault = findElement([
      "[class*='bg-neutral-100']",
      "[class*='bg-neutral-800']",
    ]);
    const badgeSuccess = findElement([
      "[class*='bg-green-50']",
      "[class*='bg-green-900']",
    ]);
    // Link
    const link = findElement(["a[href]:not([class*='btn'])"]);
    // Alert
    const alert = findElement(["[role='alert']", "[class*='alert']"]);
    // Code block
    const codeBlock = findElement([
      "pre",
      "code",
      "[class*='font-mono']",
      "[class*='bg-neutral-900']",
    ]);
    // Placeholder text (input)
    const inputEl = findElement(["input[placeholder]"]);
    const inputPlaceholder = inputEl
      ? {
          color: getComputedStyle(inputEl, "::placeholder").color || "",
          background: getComputedStyle(inputEl).backgroundColor,
        }
      : { color: "", background: "" };

    return {
      body: {
        background: bodyStyles.backgroundColor,
        color: bodyStyles.color,
      },
      primaryText: getStyles(primaryText),
      secondaryText: getStyles(secondaryText),
      tertiaryText: getStyles(tertiaryText),
      card: getStyles(card),
      btnPrimary: getStyles(btnPrimary),
      btnSecondary: getStyles(btnSecondary),
      input: getStyles(input),
      inputPlaceholder,
      badgeBrand: getStyles(badgeBrand),
      badgeDefault: getStyles(badgeDefault),
      badgeSuccess: getStyles(badgeSuccess),
      link: getStyles(link),
      alert: getStyles(alert),
      codeBlock: getStyles(codeBlock),
    };
  });
}

// Helper to perform contrast checks
function performContrastChecks(
  styles: Awaited<ReturnType<typeof extractStyles>>
): ContrastCheck[] {
  const checks: ContrastCheck[] = [];

  // Primary text on body background
  if (styles.body.color && styles.body.background) {
    const check = createContrastCheck(
      "Primary text on body",
      styles.body.color,
      styles.body.background
    );
    if (check) checks.push(check);
  }

  // Secondary text on body background
  if (styles.secondaryText.color && styles.body.background) {
    const check = createContrastCheck(
      "Secondary text on body",
      styles.secondaryText.color,
      styles.body.background
    );
    if (check) checks.push(check);
  }

  // Tertiary text on body background
  if (styles.tertiaryText.color && styles.body.background) {
    const check = createContrastCheck(
      "Tertiary text on body",
      styles.tertiaryText.color,
      styles.body.background
    );
    if (check) checks.push(check);
  }

  // Card text on card background (only if background is not transparent)
  if (
    styles.card.color &&
    styles.card.background &&
    !styles.card.background.includes("0, 0, 0, 0")
  ) {
    const check = createContrastCheck(
      "Card text on card bg",
      styles.card.color,
      styles.card.background
    );
    if (check) checks.push(check);
  }

  // Primary button text on button background
  if (
    styles.btnPrimary.color &&
    styles.btnPrimary.background &&
    !styles.btnPrimary.background.includes("0, 0, 0, 0")
  ) {
    const check = createContrastCheck(
      "Primary button text",
      styles.btnPrimary.color,
      styles.btnPrimary.background
    );
    if (check) checks.push(check);
  }

  // Secondary button text
  if (
    styles.btnSecondary.color &&
    styles.btnSecondary.background &&
    !styles.btnSecondary.background.includes("0, 0, 0, 0")
  ) {
    const check = createContrastCheck(
      "Secondary button text",
      styles.btnSecondary.color,
      styles.btnSecondary.background
    );
    if (check) checks.push(check);
  }

  // Input text
  if (
    styles.input.color &&
    styles.input.background &&
    !styles.input.background.includes("0, 0, 0, 0")
  ) {
    const check = createContrastCheck(
      "Input text",
      styles.input.color,
      styles.input.background
    );
    if (check) checks.push(check);
  }

  // Input placeholder
  if (
    styles.inputPlaceholder.color &&
    styles.inputPlaceholder.background &&
    !styles.inputPlaceholder.background.includes("0, 0, 0, 0")
  ) {
    const check = createContrastCheck(
      "Input placeholder",
      styles.inputPlaceholder.color,
      styles.inputPlaceholder.background
    );
    if (check) checks.push(check);
  }

  // Badge brand
  if (
    styles.badgeBrand.color &&
    styles.badgeBrand.background &&
    !styles.badgeBrand.background.includes("0, 0, 0, 0")
  ) {
    const check = createContrastCheck(
      "Badge (brand)",
      styles.badgeBrand.color,
      styles.badgeBrand.background
    );
    if (check) checks.push(check);
  }

  // Badge default
  if (
    styles.badgeDefault.color &&
    styles.badgeDefault.background &&
    !styles.badgeDefault.background.includes("0, 0, 0, 0")
  ) {
    const check = createContrastCheck(
      "Badge (default)",
      styles.badgeDefault.color,
      styles.badgeDefault.background
    );
    if (check) checks.push(check);
  }

  // Badge success
  if (
    styles.badgeSuccess.color &&
    styles.badgeSuccess.background &&
    !styles.badgeSuccess.background.includes("0, 0, 0, 0")
  ) {
    const check = createContrastCheck(
      "Badge (success)",
      styles.badgeSuccess.color,
      styles.badgeSuccess.background
    );
    if (check) checks.push(check);
  }

  // Link text
  if (styles.link.color && styles.body.background) {
    const check = createContrastCheck(
      "Link text on body",
      styles.link.color,
      styles.body.background
    );
    if (check) checks.push(check);
  }

  // Alert
  if (
    styles.alert.color &&
    styles.alert.background &&
    !styles.alert.background.includes("0, 0, 0, 0")
  ) {
    const check = createContrastCheck(
      "Alert text",
      styles.alert.color,
      styles.alert.background
    );
    if (check) checks.push(check);
  }

  // Code block
  if (
    styles.codeBlock.color &&
    styles.codeBlock.background &&
    !styles.codeBlock.background.includes("0, 0, 0, 0")
  ) {
    const check = createContrastCheck(
      "Code block text",
      styles.codeBlock.color,
      styles.codeBlock.background
    );
    if (check) checks.push(check);
  }

  return checks;
}

// Helper to write individual result
function writeResult(result: AuditResult) {
  const dir = "e2e/screenshots/results";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filename = `${result.page}-${result.viewport}-${result.theme}.json`;
  fs.writeFileSync(path.join(dir, filename), JSON.stringify(result, null, 2));
}

// Create test for each public page/viewport/theme combination
for (const pageDef of PUBLIC_PAGES) {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const theme of THEMES) {
      test(`audit ${pageDef.name} - ${viewportName} - ${theme}`, async ({
        page,
      }) => {
        // Set viewport
        await page.setViewportSize(viewport);

        // Navigate to page
        await page.goto(pageDef.path, { waitUntil: "networkidle" });

        // Set theme
        await setTheme(page, theme);

        // Wait for any transitions
        await page.waitForTimeout(300);

        // Take screenshot
        const screenshotName = `${pageDef.name}-${viewportName}-${theme}.png`;
        const screenshotPath = `e2e/screenshots/${screenshotName}`;

        // Ensure directory exists
        const dir = path.dirname(screenshotPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });

        // Extract styles and perform contrast checks
        const styles = await extractStyles(page);
        const contrastChecks = performContrastChecks(styles);

        // Store result to individual file
        const result: AuditResult = {
          page: pageDef.name,
          viewport: viewportName,
          theme,
          screenshot: screenshotName,
          contrastChecks,
          styles: {
            bodyBg: styles.body.background,
            bodyColor: styles.body.color,
            secondaryColor: styles.secondaryText.color || "",
            tertiaryColor: styles.tertiaryText.color || "",
          },
        };
        writeResult(result);

        // Log contrast issues (warnings only, don't fail)
        const failures = contrastChecks.filter((c) => c.aa === "FAIL");
        if (failures.length > 0) {
          console.log(
            `\n⚠️  Contrast issues on ${pageDef.name} (${viewportName}, ${theme}):`
          );
          failures.forEach((f) => {
            console.log(
              `   - ${f.element}: ${f.ratio.toFixed(2)}:1 (${f.aa}) [fg: ${f.foreground}, bg: ${f.background}]`
            );
          });
        }

        // Just log critical failures, don't assert (audit mode)
        const criticalFailures = contrastChecks.filter((c) => c.ratio < 3);
        if (criticalFailures.length > 0) {
          console.log(
            `\n🚨 CRITICAL contrast failures on ${pageDef.name} (${viewportName}, ${theme}):`
          );
          criticalFailures.forEach((f) => {
            console.log(
              `   - ${f.element}: ${f.ratio.toFixed(2)}:1 (below 3:1 threshold)`
            );
          });
        }
      });
    }
  }
}

// Create tests for authenticated pages (will skip if no auth)
const hasAuth =
  process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.E2E_TEST_USER_EMAIL;

for (const pageDef of AUTH_PAGES) {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const theme of THEMES) {
      test(`audit ${pageDef.name} - ${viewportName} - ${theme}`, async ({
        page,
      }) => {
        test.skip(
          !hasAuth,
          "Skipping auth page audit - no auth credentials configured"
        );

        // Set viewport
        await page.setViewportSize(viewport);

        // Navigate to page
        await page.goto(pageDef.path, { waitUntil: "networkidle" });

        // Check if redirected to signin
        if (page.url().includes("/signin")) {
          test.skip(
            true,
            "Skipping - redirected to signin (not authenticated)"
          );
          return;
        }

        // Set theme
        await setTheme(page, theme);
        await page.waitForTimeout(300);

        // Take screenshot
        const screenshotName = `${pageDef.name}-${viewportName}-${theme}.png`;
        const screenshotPath = `e2e/screenshots/${screenshotName}`;

        const dir = path.dirname(screenshotPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        await page.screenshot({
          path: screenshotPath,
          fullPage: true,
        });

        // Extract styles and perform contrast checks
        const styles = await extractStyles(page);
        const contrastChecks = performContrastChecks(styles);

        const result: AuditResult = {
          page: pageDef.name,
          viewport: viewportName,
          theme,
          screenshot: screenshotName,
          contrastChecks,
          styles: {
            bodyBg: styles.body.background,
            bodyColor: styles.body.color,
            secondaryColor: styles.secondaryText.color || "",
            tertiaryColor: styles.tertiaryText.color || "",
          },
        };
        writeResult(result);

        // Log issues
        const failures = contrastChecks.filter((c) => c.aa === "FAIL");
        if (failures.length > 0) {
          console.log(
            `\n⚠️  Contrast issues on ${pageDef.name} (${viewportName}, ${theme}):`
          );
          failures.forEach((f) => {
            console.log(`   - ${f.element}: ${f.ratio.toFixed(2)}:1 (${f.aa})`);
          });
        }
      });
    }
  }
}

// Combine all results into final JSON (run after all tests in serial mode)
test.describe.serial("combine results", () => {
  test("combine all audit results", async () => {
    const resultsDir = "e2e/screenshots/results";
    const allResults: AuditResult[] = [];

    if (fs.existsSync(resultsDir)) {
      const files = fs
        .readdirSync(resultsDir)
        .filter((f) => f.endsWith(".json"));
      for (const file of files) {
        const content = fs.readFileSync(path.join(resultsDir, file), "utf-8");
        allResults.push(JSON.parse(content));
      }
    }

    // Write combined results
    fs.writeFileSync(
      "e2e/design-audit-results.json",
      JSON.stringify(allResults, null, 2)
    );

    // Generate summary
    const totalChecks = allResults.reduce(
      (sum, r) => sum + r.contrastChecks.length,
      0
    );
    const aaFailures = allResults.reduce(
      (sum, r) => sum + r.contrastChecks.filter((c) => c.aa === "FAIL").length,
      0
    );
    const criticalFailures = allResults.reduce(
      (sum, r) => sum + r.contrastChecks.filter((c) => c.ratio < 3).length,
      0
    );

    console.log(`\n📊 Design Audit Summary:`);
    console.log(`   Pages audited: ${allResults.length}`);
    console.log(`   Total contrast checks: ${totalChecks}`);
    console.log(`   AA Failures (< 4.5:1): ${aaFailures}`);
    console.log(`   Critical Failures (< 3:1): ${criticalFailures}`);
    console.log(`\n📁 Results written to e2e/design-audit-results.json`);
    console.log(`📸 Screenshots saved to e2e/screenshots/`);
  });
});
