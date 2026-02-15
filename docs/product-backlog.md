# Product Backlog

> Source report timestamp: 2026-02-15T09:26:17.821Z

## Summary

- **Total Items:** 13
- **Critical:** 0
- **High:** 6
- **Medium:** 2
- **Low:** 5

### By Category

- **conversion:** 7
- **friction:** 5
- **navigation:** 1

### Top Offender Routes

- `/submit`: 3 items
- `/about`: 1 items
- `/api`: 1 items
- `/changelog`: 1 items
- `/contributing`: 1 items

### Related Inputs

- Reports: `e2e/reports/product-gaps.json`
- Heuristics test: `e2e/product-heuristics.spec.ts`
- Generator: `scripts/generate-product-backlog.ts`
- Perf regressions: `e2e/reports/perf-regressions.json`

## Top 5 Next Actions

| Priority | Item                          | Route           | Effort | Suggested Fix                                                          |
| -------- | ----------------------------- | --------------- | ------ | ---------------------------------------------------------------------- |
| 1        | No primary CTA above the fold | `/about`        | S      | Move a single primary action higher so users can act without scrolling |
| 2        | No primary CTA above the fold | `/api`          | S      | Move a single primary action higher so users can act without scrolling |
| 3        | No primary CTA above the fold | `/changelog`    | S      | Move a single primary action higher so users can act without scrolling |
| 4        | No primary CTA above the fold | `/contributing` | S      | Move a single primary action higher so users can act without scrolling |
| 5        | No primary CTA above the fold | `/docs`         | S      | Move a single primary action higher so users can act without scrolling |

## Execution Tracker

| ID                                              | Status | Owner | Sprint | Target Date |
| ----------------------------------------------- | ------ | ----- | ------ | ----------- |
| `about-conversion-no-primary-above-fold`        | Todo   | TBD   | TBD    | TBD         |
| `api-conversion-no-primary-above-fold`          | Todo   | TBD   | TBD    | TBD         |
| `changelog-conversion-no-primary-above-fold`    | Todo   | TBD   | TBD    | TBD         |
| `contributing-conversion-no-primary-above-fold` | Todo   | TBD   | TBD    | TBD         |
| `docs-conversion-no-primary-above-fold`         | Todo   | TBD   | TBD    | TBD         |
| `servers-friction-coming-soon`                  | Todo   | TBD   | TBD    | TBD         |
| `servers-q-github-friction-coming-soon`         | Todo   | TBD   | TBD    | TBD         |
| `servers-github-friction-disabled-controls`     | Todo   | TBD   | TBD    | TBD         |
| `signin-friction-disabled-controls`             | Todo   | TBD   | TBD    | TBD         |
| `submit-conversion-missing-social-proof`        | Todo   | TBD   | TBD    | TBD         |
| `submit-friction-disabled-controls`             | Todo   | TBD   | TBD    | TBD         |
| `submit-navigation-dead-end`                    | Todo   | TBD   | TBD    | TBD         |
| `verification-conversion-no-primary-above-fold` | Todo   | TBD   | TBD    | TBD         |

### Routes Audited

- `/`
- `/about`
- `/api`
- `/changelog`
- `/contributing`
- `/docs`
- `/privacy`
- `/servers`
- `/signin`
- `/submit`
- `/terms`
- `/verification`

## High Priority

| Title                         | Route           | Category   | Effort | Suggested Fix                                                          |
| ----------------------------- | --------------- | ---------- | ------ | ---------------------------------------------------------------------- |
| No primary CTA above the fold | `/about`        | conversion | S      | Move a single primary action higher so users can act without scrolling |
| No primary CTA above the fold | `/api`          | conversion | S      | Move a single primary action higher so users can act without scrolling |
| No primary CTA above the fold | `/changelog`    | conversion | S      | Move a single primary action higher so users can act without scrolling |
| No primary CTA above the fold | `/contributing` | conversion | S      | Move a single primary action higher so users can act without scrolling |
| No primary CTA above the fold | `/docs`         | conversion | S      | Move a single primary action higher so users can act without scrolling |
| No primary CTA above the fold | `/verification` | conversion | S      | Move a single primary action higher so users can act without scrolling |

## Medium Priority

| Title                                | Route     | Category   | Effort | Suggested Fix                                                                                |
| ------------------------------------ | --------- | ---------- | ------ | -------------------------------------------------------------------------------------------- |
| No social proof near decision points | `/submit` | conversion | S      | Add lightweight social proof such as verification freshness, view count, or usage indicators |
| Dead-end page                        | `/submit` | navigation | M      | Add related links or 'next steps' section to guide users                                     |

## Low Priority

| Title                              | Route               | Category | Effort |
| ---------------------------------- | ------------------- | -------- | ------ |
| Contains 'Coming Soon' placeholder | `/servers`          | friction | M      |
| Contains 'Coming Soon' placeholder | `/servers?q=github` | friction | M      |
| Disabled controls in main content  | `/servers/github`   | friction | S      |
| Disabled controls in main content  | `/signin`           | friction | S      |
| Disabled controls in main content  | `/submit`           | friction | S      |

## Grouped by Route

| Route               | Item Count | Categories                       |
| ------------------- | ---------- | -------------------------------- |
| `/about`            | 1          | conversion                       |
| `/api`              | 1          | conversion                       |
| `/changelog`        | 1          | conversion                       |
| `/contributing`     | 1          | conversion                       |
| `/docs`             | 1          | conversion                       |
| `/servers`          | 1          | friction                         |
| `/servers?q=github` | 1          | friction                         |
| `/servers/github`   | 1          | friction                         |
| `/signin`           | 1          | friction                         |
| `/submit`           | 3          | conversion, friction, navigation |
| `/verification`     | 1          | conversion                       |

## Grouped by Category

| Category   | Item Count | Example Routes                                                 |
| ---------- | ---------- | -------------------------------------------------------------- |
| conversion | 7          | /about, /api, /changelog, /contributing, /docs                 |
| friction   | 5          | /servers, /servers/github, /servers?q=github, /signin, /submit |
| navigation | 1          | /submit                                                        |

## All Items Detail

<details>
<summary>Click to expand full item details</summary>

### No primary CTA above the fold

- **ID:** `about-conversion-no-primary-above-fold`
- **Severity:** HIGH
- **Impact:** Significantly impacts trust, conversion, or usability
- **Effort:** Small (< 2 hours)
- **Route:** `/about`
- **Category:** conversion
- **Source:** heuristics
- **Evidence:** Primary CTA above fold count: 0
- **Screenshot:** `e2e/screenshots/product-heuristics/about/light/desktop/conversion-no-above-fold-cta.png`
- **Suggested Fix:** Move a single primary action higher so users can act without scrolling

### No primary CTA above the fold

- **ID:** `api-conversion-no-primary-above-fold`
- **Severity:** HIGH
- **Impact:** Significantly impacts trust, conversion, or usability
- **Effort:** Small (< 2 hours)
- **Route:** `/api`
- **Category:** conversion
- **Source:** heuristics
- **Evidence:** Primary CTA above fold count: 0
- **Screenshot:** `e2e/screenshots/product-heuristics/api/light/desktop/conversion-no-above-fold-cta.png`
- **Suggested Fix:** Move a single primary action higher so users can act without scrolling

### No primary CTA above the fold

- **ID:** `changelog-conversion-no-primary-above-fold`
- **Severity:** HIGH
- **Impact:** Significantly impacts trust, conversion, or usability
- **Effort:** Small (< 2 hours)
- **Route:** `/changelog`
- **Category:** conversion
- **Source:** heuristics
- **Evidence:** Primary CTA above fold count: 0
- **Screenshot:** `e2e/screenshots/product-heuristics/changelog/light/desktop/conversion-no-above-fold-cta.png`
- **Suggested Fix:** Move a single primary action higher so users can act without scrolling

### No primary CTA above the fold

- **ID:** `contributing-conversion-no-primary-above-fold`
- **Severity:** HIGH
- **Impact:** Significantly impacts trust, conversion, or usability
- **Effort:** Small (< 2 hours)
- **Route:** `/contributing`
- **Category:** conversion
- **Source:** heuristics
- **Evidence:** Primary CTA above fold count: 0
- **Screenshot:** `e2e/screenshots/product-heuristics/contributing/light/desktop/conversion-no-above-fold-cta.png`
- **Suggested Fix:** Move a single primary action higher so users can act without scrolling

### No primary CTA above the fold

- **ID:** `docs-conversion-no-primary-above-fold`
- **Severity:** HIGH
- **Impact:** Significantly impacts trust, conversion, or usability
- **Effort:** Small (< 2 hours)
- **Route:** `/docs`
- **Category:** conversion
- **Source:** heuristics
- **Evidence:** Primary CTA above fold count: 0
- **Screenshot:** `e2e/screenshots/product-heuristics/docs/light/desktop/conversion-no-above-fold-cta.png`
- **Suggested Fix:** Move a single primary action higher so users can act without scrolling

### Contains 'Coming Soon' placeholder

- **ID:** `servers-friction-coming-soon`
- **Severity:** LOW
- **Impact:** Minor consistency or optimization opportunity
- **Effort:** Medium (2-8 hours)
- **Route:** `/servers`
- **Category:** friction
- **Source:** heuristics
- **Evidence:** 1 coming soon blocks
- **Suggested Fix:** Replace placeholder content with actual functionality or remove

### Contains 'Coming Soon' placeholder

- **ID:** `servers-q-github-friction-coming-soon`
- **Severity:** LOW
- **Impact:** Minor consistency or optimization opportunity
- **Effort:** Medium (2-8 hours)
- **Route:** `/servers?q=github`
- **Category:** friction
- **Source:** heuristics
- **Evidence:** 1 coming soon blocks
- **Suggested Fix:** Replace placeholder content with actual functionality or remove

### Disabled controls in main content

- **ID:** `servers-github-friction-disabled-controls`
- **Severity:** LOW
- **Impact:** Minor consistency or optimization opportunity
- **Effort:** Small (< 2 hours)
- **Route:** `/servers/github`
- **Category:** friction
- **Source:** heuristics
- **Evidence:** 2 disabled controls
- **Suggested Fix:** Review if disabled controls are necessary or should be removed/enabled

### Disabled controls in main content

- **ID:** `signin-friction-disabled-controls`
- **Severity:** LOW
- **Impact:** Minor consistency or optimization opportunity
- **Effort:** Small (< 2 hours)
- **Route:** `/signin`
- **Category:** friction
- **Source:** heuristics
- **Evidence:** 1 disabled controls
- **Suggested Fix:** Review if disabled controls are necessary or should be removed/enabled

### No social proof near decision points

- **ID:** `submit-conversion-missing-social-proof`
- **Severity:** MEDIUM
- **Impact:** Polish/usability issue affecting user experience
- **Effort:** Small (< 2 hours)
- **Route:** `/submit`
- **Category:** conversion
- **Source:** heuristics
- **Suggested Fix:** Add lightweight social proof such as verification freshness, view count, or usage indicators

### Disabled controls in main content

- **ID:** `submit-friction-disabled-controls`
- **Severity:** LOW
- **Impact:** Minor consistency or optimization opportunity
- **Effort:** Small (< 2 hours)
- **Route:** `/submit`
- **Category:** friction
- **Source:** heuristics
- **Evidence:** 1 disabled controls
- **Suggested Fix:** Review if disabled controls are necessary or should be removed/enabled

### Dead-end page

- **ID:** `submit-navigation-dead-end`
- **Severity:** MEDIUM
- **Impact:** Polish/usability issue affecting user experience
- **Effort:** Medium (2-8 hours)
- **Route:** `/submit`
- **Category:** navigation
- **Source:** heuristics
- **Screenshot:** `e2e/screenshots/product-heuristics/submit/light/desktop/dead-end.png`
- **Suggested Fix:** Add related links or 'next steps' section to guide users

### No primary CTA above the fold

- **ID:** `verification-conversion-no-primary-above-fold`
- **Severity:** HIGH
- **Impact:** Significantly impacts trust, conversion, or usability
- **Effort:** Small (< 2 hours)
- **Route:** `/verification`
- **Category:** conversion
- **Source:** heuristics
- **Evidence:** Primary CTA above fold count: 0
- **Screenshot:** `e2e/screenshots/product-heuristics/verification/light/desktop/conversion-no-above-fold-cta.png`
- **Suggested Fix:** Move a single primary action higher so users can act without scrolling

</details>

## Performance Regression Snapshot

- **Total Regressions:** 2
- **Budget Exceeded:** 2
- **Trend Regressions (> threshold):** 0

| Route             | Metric | Current | Budget |
| ----------------- | ------ | ------- | ------ |
| `/servers`        | ttfbMs | 1133    | 1000   |
| `/servers/github` | ttfbMs | 1560    | 1000   |

## Analysis Notes

- 6 critical/high heuristic gaps detected

---

_Generated by `scripts/generate-product-backlog.ts` from deterministic report inputs._
