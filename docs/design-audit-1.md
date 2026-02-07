# Design Audit Report - Sprint 1

**Date:** February 7, 2026
**Audit Type:** Premium Color, Contrast & Readability
**Pages Audited:** 16 (4 pages x 2 viewports x 2 themes)
**Tool:** Playwright automated contrast analysis + visual review

---

## Executive Summary

### After Quick-Fix Patch

The MCP Registry UI now has **4 critical contrast failures** (reduced from 8) and **10 total WCAG AA failures** (reduced from 16). The quick-fix commit addresses the most severe issues.

**Remaining issues** are primarily:

1. Signin input placeholder (Supabase Auth UI - external dependency)
2. Light mode primary buttons (3.74:1 - passes large text threshold)

### Original Issues Found

### Top 5 Issues

1. **Homepage "Browse Registry" button is invisible** - Uses undefined `bg-primary-600` class (should be `bg-brand-600`)
   - Screenshot: `homepage-desktop-light.png`

2. **White text on teal brand buttons in dark mode** - 2.28:1 contrast ratio (needs 4.5:1)
   - Screenshot: `server-detail-desktop-dark.png`

3. **White text on brand badges** - 2.49:1 contrast ratio across all modes
   - Screenshot: `server-detail-desktop-light.png`, `server-detail-desktop-dark.png`

4. **Tertiary text too faint in dark mode** - neutral-500 on neutral-950 yields only 4.12:1
   - Screenshot: `servers-desktop-dark.png`

5. **Signin input placeholder unreadable in light mode** - 2.54:1 contrast ratio
   - Screenshot: `signin-desktop-light.png`

---

## Findings Table

| #   | Page          | Mode  | Viewport | Element                | Issue Type  | Evidence                            | Contrast   | Severity    | Recommendation                                    | Effort |
| --- | ------------- | ----- | -------- | ---------------------- | ----------- | ----------------------------------- | ---------- | ----------- | ------------------------------------------------- | ------ |
| 1   | homepage      | light | all      | Browse Registry button | Missing bg  | `bg-primary-600` undefined          | N/A        | **Blocker** | Change to `bg-brand-600`                          | S      |
| 2   | server-detail | dark  | all      | Primary button text    | Contrast    | `#f5f5f4` on `#14b8a6`              | **2.28:1** | **Blocker** | Use dark text on brand-500 in dark mode           | S      |
| 3   | server-detail | both  | all      | Badge (brand)          | Contrast    | `#fff` on `#14b8a6`                 | **2.49:1** | **Blocker** | Use `brand-800` text on `brand-100` bg, or invert | S      |
| 4   | signin        | light | all      | Input placeholder      | Contrast    | `#9ca3af` on `#fff`                 | **2.54:1** | **Blocker** | Darken placeholder to `#6b7280` (neutral-500)     | S      |
| 5   | signin        | dark  | all      | Input placeholder      | Contrast    | `#9ca3af` on `#374151`              | 4.06:1     | Major       | Lighten placeholder to `#d1d5db`                  | S      |
| 6   | servers       | dark  | all      | Tertiary text          | Contrast    | `#78716c` on `#0c0a09`              | 4.12:1     | Major       | Lighten `--text-tertiary` dark to `#a8a29e`       | S      |
| 7   | servers       | dark  | all      | Input placeholder      | Contrast    | `#78716c` on `#0c0a09`              | 4.12:1     | Major       | Same as above - uses tertiary color               | S      |
| 8   | server-detail | dark  | all      | Tertiary text          | Contrast    | `#78716c` on `#0c0a09`              | 4.12:1     | Major       | Same as above                                     | S      |
| 9   | homepage      | light | all      | Feature cards          | Hierarchy   | Dashed border looks cheap           | N/A        | Minor       | Use solid `border-border`                         | S      |
| 10  | server-detail | light | all      | Code block             | Coherence   | Dark bg on light page feels jarring | N/A        | Minor       | Consider light code theme option                  | M      |
| 11  | servers       | both  | all      | Filter sidebar         | Hierarchy   | Checkbox labels cramped             | N/A        | Minor       | Increase spacing                                  | S      |
| 12  | all           | dark  | all      | Brand teal usage       | Coherence   | Too bright/saturated for dark bg    | N/A        | Minor       | Consider muted brand variant for dark             | M      |
| 13  | signin        | both  | all      | Card shadow            | Depth       | No elevation on auth card           | N/A        | Minor       | Add `shadow-card`                                 | S      |
| 14  | server-detail | both  | all      | Capability cards       | Consistency | Different padding from main cards   | N/A        | Minor       | Standardize padding                               | S      |
| 15  | all           | dark  | all      | Footer text            | Hierarchy   | Footer links slightly dim           | N/A        | Minor       | Bump to secondary color                           | S      |

---

## Contrast Analysis Summary

### WCAG AA Failures (< 4.5:1 for normal text)

| Element                        | Light Mode      | Dark Mode       | Issue                                  |
| ------------------------------ | --------------- | --------------- | -------------------------------------- |
| Primary button text            | 4.67:1 PASS     | **2.28:1 FAIL** | Dark mode uses light text on brand-500 |
| Badge (brand)                  | **2.49:1 FAIL** | **2.49:1 FAIL** | White text on brand-500 both modes     |
| Tertiary text                  | 4.59:1 PASS     | **4.12:1 FAIL** | Dark mode tertiary too faint           |
| Input placeholder (signin)     | **2.54:1 FAIL** | 4.06:1 FAIL     | Light mode critical, dark marginal     |
| Input placeholder (our inputs) | 4.59:1 PASS     | **4.12:1 FAIL** | Uses tertiary color                    |
| Secondary text                 | 7.30:1 PASS     | 7.83:1 PASS     | Good                                   |
| Primary text                   | 16.74:1 PASS    | 18.11:1 PASS    | Excellent                              |
| Link text                      | 16.99:1 PASS    | 19.76:1 PASS    | Excellent                              |
| Card text                      | 17.49:1 PASS    | 16.03:1 PASS    | Excellent                              |

---

## Token Recommendations (Premium Polish Patch)

### High Priority Token Changes

| Token             | Current (Light)         | Current (Dark)          | Proposed (Dark)         | Rationale                     |
| ----------------- | ----------------------- | ----------------------- | ----------------------- | ----------------------------- |
| `--text-tertiary` | `neutral-500` (#78716c) | `neutral-500` (#78716c) | `neutral-400` (#a8a29e) | Improve from 4.12:1 to 7.83:1 |

### Component-Level Fixes

1. **Button.tsx (Dark mode primary variant)**

   ```diff
   - dark:bg-brand-500 dark:hover:bg-brand-600
   + dark:bg-brand-500 dark:text-brand-950 dark:hover:bg-brand-400
   ```

   This changes dark mode primary buttons from white text to dark text on teal.

2. **Badge.tsx (Brand variant)**

   ```diff
   - brand: "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
   + brand: "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-300"
   ```

   Improves contrast for brand badges.

3. **Homepage page.tsx**

   ```diff
   - className="bg-primary-600 hover:bg-primary-700 ..."
   + className="bg-brand-600 hover:bg-brand-700 ..."
   ```

   Fixes undefined color class.

4. **Signin component** (uses Supabase Auth UI)
   - The signin input styles appear to come from `@supabase/auth-ui-shared` - may need custom theme override.

---

## Component Consistency Notes

### Button Heights (Verified Consistent)

- sm: 32px (h-8)
- md: 40px (h-10)
- lg: 48px (h-12)

### Border Radius (Verified Consistent)

- Buttons: rounded-md (sm), rounded-lg (md/lg)
- Cards: rounded-xl
- Badges: rounded-full
- Inputs: rounded-lg

### Focus States

- Consistent 2px ring with `brand-500` color
- Offset of 2px
- Visible in both light and dark modes

---

## Dark Mode Credibility Assessment

| Aspect           | Status      | Notes                                    |
| ---------------- | ----------- | ---------------------------------------- |
| Glowy brand      | Minor issue | Brand-500 slightly bright but acceptable |
| Border strength  | Good        | Uses neutral-800, subtle but visible     |
| Text readability | Issues      | Tertiary text needs lightening           |
| Code blocks      | Good        | Excellent contrast (16:1)                |
| Card surfaces    | Good        | Clear separation between surface levels  |

---

## 3-Step Action Plan

### Step 1: Token Patch (This Sprint - Immediate)

Apply these changes to `globals.css`:

```css
.dark {
  /* Fix: Lighten tertiary text for better contrast */
  --text-tertiary: var(--color-neutral-400); /* was neutral-500 */
}
```

### Step 2: Component Fixes (This Sprint - Immediate)

1. Fix `app/page.tsx` - Change `bg-primary-600` to `bg-brand-600`
2. Fix `components/ui/Button.tsx` - Add dark text color for primary variant in dark mode
3. Fix `components/ui/Badge.tsx` - Improve brand variant contrast

### Step 3: Regression Testing

After fixes are applied:

```bash
pnpm exec playwright test design-audit.spec.ts
```

Verify:

- All contrast checks should pass AA (> 4.5:1)
- No critical failures (all > 3:1)
- Re-capture screenshots for visual comparison

---

## Appendix: Screenshot Inventory

| Filename                        | Page            | Viewport | Theme |
| ------------------------------- | --------------- | -------- | ----- |
| homepage-desktop-light.png      | /               | 1440x900 | light |
| homepage-desktop-dark.png       | /               | 1440x900 | dark  |
| homepage-mobile-light.png       | /               | 390x844  | light |
| homepage-mobile-dark.png        | /               | 390x844  | dark  |
| servers-desktop-light.png       | /servers        | 1440x900 | light |
| servers-desktop-dark.png        | /servers        | 1440x900 | dark  |
| servers-mobile-light.png        | /servers        | 390x844  | light |
| servers-mobile-dark.png         | /servers        | 390x844  | dark  |
| server-detail-desktop-light.png | /servers/github | 1440x900 | light |
| server-detail-desktop-dark.png  | /servers/github | 1440x900 | dark  |
| server-detail-mobile-light.png  | /servers/github | 390x844  | light |
| server-detail-mobile-dark.png   | /servers/github | 390x844  | dark  |
| signin-desktop-light.png        | /signin         | 1440x900 | light |
| signin-desktop-dark.png         | /signin         | 1440x900 | dark  |
| signin-mobile-light.png         | /signin         | 390x844  | light |
| signin-mobile-dark.png          | /signin         | 390x844  | dark  |

All screenshots stored in: `e2e/screenshots/`

---

## Appendix: Contrast Computation Method

Contrast ratios computed using WCAG 2.1 relative luminance formula:

```typescript
// Relative luminance
L = 0.2126 * R + 0.7152 * G + 0.0722 * B;

// Contrast ratio
ratio = (L1 + 0.05) / (L2 + 0.05);
```

Where L1 is the lighter color and L2 is the darker color.

Thresholds:

- **4.5:1** - Normal text (< 18pt or < 14pt bold)
- **3:1** - Large text (>= 18pt or >= 14pt bold) and UI components

---

## Quick-Fix Patch Applied

The following changes were applied as part of this audit:

### Files Changed

1. **`app/globals.css`** - Lightened dark mode tertiary text from neutral-500 to neutral-400
2. **`app/page.tsx`** - Fixed undefined `bg-primary-600` to `bg-brand-600` (homepage button was invisible)
3. **`components/ui/Button.tsx`** - Added dark text color for primary variant in dark mode
4. **`components/ui/Badge.tsx`** - Improved brand variant contrast
5. **`components/servers/VerifiedBadge.tsx`** - Changed from white to dark text on brand background

### Results After Fix

| Metric                    | Before | After | Improvement               |
| ------------------------- | ------ | ----- | ------------------------- |
| Critical Failures (< 3:1) | 8      | 4     | -50%                      |
| AA Failures (< 4.5:1)     | 16     | 10    | -38%                      |
| Total Contrast Checks     | 108    | 116   | +8 (more elements tested) |

### Remaining Issues

1. **Signin input placeholder** (2.54:1 light / 4.06:1 dark) - Supabase Auth UI external dependency
2. **Light mode primary button text** (3.74:1) - White on brand-600, passes large text but fails normal text
3. **Light mode badge (brand)** (3.74:1) - Same issue as button

These remaining issues require either:

- Darkening the brand button color (design decision)
- Custom Supabase Auth UI theme
- Treating buttons as "large text" UI elements (borderline acceptable)

---

## Test Infrastructure Added

- `e2e/design-audit.spec.ts` - Automated contrast audit test suite
- `e2e/utils/contrast.ts` - WCAG contrast calculation utilities
- `e2e/screenshots/` - Screenshot artifacts for visual review
- `e2e/design-audit-results.json` - Machine-readable audit results
