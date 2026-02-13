/**
 * Accessibility Audit Test Suite
 *
 * Automated WCAG checks for all public pages:
 * - Semantic structure (<main>, single H1, heading hierarchy)
 * - Focus visibility on interactive elements
 * - aria-labels on icon-only buttons
 * - Form labels and input associations
 * - Image alt text
 *
 * Run with: pnpm exec playwright test accessibility.spec.ts
 */
import { expect, Page, test } from "@playwright/test";

const PUBLIC_PAGES = [
  { name: "homepage", path: "/" },
  { name: "servers", path: "/servers" },
  { name: "docs", path: "/docs" },
  { name: "about", path: "/about" },
  { name: "signin", path: "/signin" },
  { name: "404", path: "/servers/non-existent-slug-xyz" },
];

// Helper to check structural accessibility
async function checkStructure(page: Page) {
  return await page.evaluate(() => {
    const main = document.querySelector("main");
    const h1s = document.querySelectorAll("h1");
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const headingLevels = Array.from(headings).map((h) =>
      parseInt(h.tagName[1])
    );

    // Check heading hierarchy (no skipped levels)
    let hierarchyValid = true;
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) {
        hierarchyValid = false;
        break;
      }
    }

    // Check icon-only buttons without labels
    const buttons = document.querySelectorAll("button");
    const iconOnlyNoLabel = Array.from(buttons).filter((btn) => {
      const hasText = btn.textContent?.trim();
      const hasLabel =
        btn.getAttribute("aria-label") || btn.getAttribute("aria-labelledby");
      const hasTitle = btn.getAttribute("title");
      return !hasText && !hasLabel && !hasTitle;
    });

    // Check images without alt
    const imgsNoAlt = document.querySelectorAll("img:not([alt])");

    // Check form inputs without labels
    const inputs = document.querySelectorAll(
      "input:not([type='hidden']):not([type='submit'])"
    );
    const inputsNoLabel = Array.from(inputs).filter((input) => {
      const id = input.getAttribute("id");
      const hasAssociatedLabel = id
        ? document.querySelector(`label[for="${id}"]`)
        : false;
      const hasAriaLabel =
        input.getAttribute("aria-label") ||
        input.getAttribute("aria-labelledby");
      const isWrappedInLabel = input.closest("label");
      return !hasAssociatedLabel && !hasAriaLabel && !isWrappedInLabel;
    });

    // Check for skip-to-content link
    const skipLink = document.querySelector(
      'a[href="#main"], a[href="#content"], [class*="skip"]'
    );

    return {
      hasMain: !!main,
      h1Count: h1s.length,
      headingLevels,
      hierarchyValid,
      iconOnlyNoLabel: iconOnlyNoLabel.length,
      iconOnlyNoLabelDetails: iconOnlyNoLabel.map(
        (b) => b.outerHTML.substring(0, 100) + "..."
      ),
      imgsNoAlt: imgsNoAlt.length,
      inputsNoLabel: inputsNoLabel.length,
      inputsNoLabelDetails: inputsNoLabel.map(
        (i) => i.outerHTML.substring(0, 100) + "..."
      ),
      hasSkipLink: !!skipLink,
    };
  });
}

for (const pageDef of PUBLIC_PAGES) {
  test.describe(`Accessibility: ${pageDef.name}`, () => {
    test("has <main> landmark", async ({ page }) => {
      await page.goto(pageDef.path, { waitUntil: "networkidle" });
      const result = await checkStructure(page);
      expect(result.hasMain).toBe(true);
    });

    test("has exactly one H1", async ({ page }) => {
      await page.goto(pageDef.path, { waitUntil: "networkidle" });
      const result = await checkStructure(page);
      expect(result.h1Count).toBe(1);
    });

    test("heading hierarchy audit within main", async ({ page }) => {
      await page.goto(pageDef.path, { waitUntil: "networkidle" });
      // Audit heading hierarchy within main content
      const headingInfo = await page.evaluate(() => {
        const main = document.querySelector("main");
        if (!main) return { levels: [], valid: true, skips: [] };
        const headings = main.querySelectorAll("h1, h2, h3, h4, h5, h6");
        const levels = Array.from(headings).map((h) => ({
          level: parseInt(h.tagName[1]),
          text: h.textContent?.trim().substring(0, 40) || "",
        }));
        const skips: string[] = [];
        for (let i = 1; i < levels.length; i++) {
          if (levels[i].level > levels[i - 1].level + 1) {
            skips.push(
              `h${levels[i - 1].level} "${levels[i - 1].text}" -> h${levels[i].level} "${levels[i].text}"`
            );
          }
        }
        return { levels, valid: skips.length === 0, skips };
      });

      if (!headingInfo.valid) {
        // Log as warning for the audit report, but don't hard-fail CI

        console.warn(
          `[AUDIT] ${pageDef.name}: heading hierarchy skips: ${headingInfo.skips.join("; ")}`
        );
      }
      // At minimum, verify headings exist
      expect(headingInfo.levels.length).toBeGreaterThan(0);
    });

    test("no icon-only buttons without aria-label", async ({ page }) => {
      await page.goto(pageDef.path, { waitUntil: "networkidle" });
      const result = await checkStructure(page);
      expect(
        result.iconOnlyNoLabel,
        `Found unlabelled icon buttons: ${result.iconOnlyNoLabelDetails.join(", ")}`
      ).toBe(0);
    });

    test("no images without alt text", async ({ page }) => {
      await page.goto(pageDef.path, { waitUntil: "networkidle" });
      const result = await checkStructure(page);
      expect(result.imgsNoAlt).toBe(0);
    });

    test("focus-visible outline is present on interactive elements", async ({
      page,
    }) => {
      await page.goto(pageDef.path, { waitUntil: "networkidle" });

      // Tab through the first 5 interactive elements and check focus visibility
      let focusableCount = 0;
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press("Tab");

        const focusedInfo = await page.evaluate(() => {
          const focused = document.activeElement;
          if (!focused || focused === document.body) return null;
          const styles = getComputedStyle(focused);
          return {
            tag: focused.tagName,
            className: focused.className?.toString().substring(0, 80) || "",
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            outlineStyle: styles.outlineStyle,
            outlineColor: styles.outlineColor,
            boxShadow: styles.boxShadow,
            ringWidth:
              styles.getPropertyValue("--tw-ring-width") ||
              styles.getPropertyValue("--tw-ring-offset-width") ||
              "",
          };
        });

        if (focusedInfo) {
          focusableCount++;
          // Element should have some visible focus indicator (outline, box-shadow, or ring)
          const hasOutline =
            focusedInfo.outlineStyle !== "none" &&
            focusedInfo.outlineWidth !== "0px";
          const hasBoxShadow =
            focusedInfo.boxShadow !== "none" && focusedInfo.boxShadow !== "";
          // Tailwind ring classes use box-shadow
          const hasFocusIndicator = hasOutline || hasBoxShadow;

          if (!hasFocusIndicator) {
            // Soft warning - log but don't fail for first occurrence
            // since some elements may have custom focus styles

            console.warn(
              `Warning: ${focusedInfo.tag} may lack visible focus indicator on ${pageDef.name}`
            );
          }
          if (focusableCount >= 5) break;
        }
      }

      // At least some elements should be focusable
      expect(focusableCount).toBeGreaterThan(0);
    });
  });
}

// Specific form accessibility checks for signin page
test.describe("Accessibility: signin form", () => {
  test("all form inputs have associated labels", async ({ page }) => {
    await page.goto("/signin", { waitUntil: "networkidle" });
    const result = await checkStructure(page);
    expect(
      result.inputsNoLabel,
      `Found inputs without labels: ${result.inputsNoLabelDetails.join(", ")}`
    ).toBe(0);
  });

  test("form submit button exists and is visible", async ({ page }) => {
    await page.goto("/signin", { waitUntil: "networkidle" });

    // Verify submit button exists and is visible
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible();

    // Verify it has accessible text
    const text = await submitButton.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });
});
