# Product Backlog

> Source report timestamp: 2026-02-14T23:32:49.180Z

## Summary

- **Total Items:** 6
- **Critical:** 0
- **High:** 0
- **Medium:** 3
- **Low:** 3

### By Category

- **friction:** 3
- **navigation:** 2
- **ux:** 1

### Top Offender Routes

- `/servers`: 3 items
- `/submit`: 2 items
- `/signin`: 1 items

### Related Inputs

- Reports: `e2e/reports/product-gaps.json`
- Heuristics test: `e2e/product-heuristics.spec.ts`
- Generator: `scripts/generate-product-backlog.ts`
- Perf regressions: `e2e/reports/perf-regressions.json`

## Top 5 Next Actions

| Priority | Item                              | Route      | Effort | Suggested Fix                                                          |
| -------- | --------------------------------- | ---------- | ------ | ---------------------------------------------------------------------- |
| 1        | No clear primary action           | `/servers` | S      | Add a prominent primary action button or CTA link in main content      |
| 2        | Dead-end page                     | `/servers` | M      | Add related links or 'next steps' section to guide users               |
| 3        | Dead-end page                     | `/submit`  | M      | Add related links or 'next steps' section to guide users               |
| 4        | Disabled controls in main content | `/signin`  | S      | Review if disabled controls are necessary or should be removed/enabled |
| 5        | Disabled controls in main content | `/submit`  | S      | Review if disabled controls are necessary or should be removed/enabled |

## Execution Tracker

| ID                                  | Status | Owner | Sprint | Target Date |
| ----------------------------------- | ------ | ----- | ------ | ----------- |
| `servers-friction-coming-soon`      | Todo   | TBD   | TBD    | TBD         |
| `servers-navigation-dead-end`       | Todo   | TBD   | TBD    | TBD         |
| `servers-ux-no-primary-action`      | Todo   | TBD   | TBD    | TBD         |
| `signin-friction-disabled-controls` | Todo   | TBD   | TBD    | TBD         |
| `submit-friction-disabled-controls` | Todo   | TBD   | TBD    | TBD         |
| `submit-navigation-dead-end`        | Todo   | TBD   | TBD    | TBD         |

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

## Medium Priority

| Title                   | Route      | Category   | Effort | Suggested Fix                                                     |
| ----------------------- | ---------- | ---------- | ------ | ----------------------------------------------------------------- |
| Dead-end page           | `/servers` | navigation | M      | Add related links or 'next steps' section to guide users          |
| No clear primary action | `/servers` | ux         | S      | Add a prominent primary action button or CTA link in main content |
| Dead-end page           | `/submit`  | navigation | M      | Add related links or 'next steps' section to guide users          |

## Low Priority

| Title                              | Route      | Category | Effort |
| ---------------------------------- | ---------- | -------- | ------ |
| Contains 'Coming Soon' placeholder | `/servers` | friction | M      |
| Disabled controls in main content  | `/signin`  | friction | S      |
| Disabled controls in main content  | `/submit`  | friction | S      |

## Grouped by Route

| Route      | Item Count | Categories               |
| ---------- | ---------- | ------------------------ |
| `/servers` | 3          | friction, navigation, ux |
| `/signin`  | 1          | friction                 |
| `/submit`  | 2          | friction, navigation     |

## Grouped by Category

| Category   | Item Count | Example Routes             |
| ---------- | ---------- | -------------------------- |
| friction   | 3          | /servers, /signin, /submit |
| navigation | 2          | /servers, /submit          |
| ux         | 1          | /servers                   |

## All Items Detail

<details>
<summary>Click to expand full item details</summary>

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

### Dead-end page

- **ID:** `servers-navigation-dead-end`
- **Severity:** MEDIUM
- **Impact:** Polish/usability issue affecting user experience
- **Effort:** Medium (2-8 hours)
- **Route:** `/servers`
- **Category:** navigation
- **Source:** heuristics
- **Screenshot:** `e2e/screenshots/product-heuristics/servers/light/desktop/dead-end.png`
- **Suggested Fix:** Add related links or 'next steps' section to guide users

### No clear primary action

- **ID:** `servers-ux-no-primary-action`
- **Severity:** MEDIUM
- **Impact:** Polish/usability issue affecting user experience
- **Effort:** Small (< 2 hours)
- **Route:** `/servers`
- **Category:** ux
- **Source:** heuristics
- **Screenshot:** `e2e/screenshots/product-heuristics/servers/light/desktop/no-primary-action.png`
- **Suggested Fix:** Add a prominent primary action button or CTA link in main content

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

- Backlog contains actionable optimization items even when no critical contract gaps are present.

---

_Generated by `scripts/generate-product-backlog.ts` from deterministic report inputs._
