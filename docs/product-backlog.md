# Product Backlog

> Source report timestamp: 2026-02-15T13:17:04.049Z

## Summary

- **Total Items:** 8
- **Critical:** 0
- **High:** 5
- **Medium:** 0
- **Low:** 3
- **Max Opportunity Score:** 115.5
- **Avg Opportunity Score:** 69.8

### By Category

- **conversion:** 5
- **friction:** 3

### Top Offender Routes

- `/about`: 1 items
- `/api`: 1 items
- `/changelog`: 1 items
- `/contributing`: 1 items
- `/servers`: 1 items

### Opportunity Score

Items are ranked by **Opportunity Score** (0-200), calculated as:

```
Base = (Severity × 25) + CategoryBoost + EffortBoost + DropoffBoost
Score = Base × TrafficMultiplier
```

| Factor              | Values                                   |
| ------------------- | ---------------------------------------- |
| Severity            | Critical=100, High=75, Medium=50, Low=25 |
| Conversion Category | +20 points                               |
| Effort Efficiency   | S=+10, M=+5, L=+0                        |
| Dropoff Signal      | +30 if analytics show dropoff on route   |
| Traffic Multiplier  | 0.5x-1.5x based on route importance      |

### Related Inputs

- Reports: `e2e/reports/product-gaps.json`
- Heuristics test: `e2e/product-heuristics.spec.ts`
- Generator: `scripts/generate-product-backlog.ts`
- Perf regressions: `e2e/reports/perf-regressions.json`

## Top 5 Next Actions (by Opportunity Score)

| Rank | Score     | Item                          | Route           | Severity | Effort | Suggested Fix                                                          |
| ---- | --------- | ----------------------------- | --------------- | -------- | ------ | ---------------------------------------------------------------------- |
| 1    | **115.5** | No primary CTA above the fold | `/api`          | HIGH     | S      | Move a single primary action higher so users can act without scrolling |
| 2    | **105**   | No primary CTA above the fold | `/verification` | HIGH     | S      | Move a single primary action higher so users can act without scrolling |
| 3    | **84**    | No primary CTA above the fold | `/about`        | HIGH     | S      | Move a single primary action higher so users can act without scrolling |
| 4    | **73.5**  | No primary CTA above the fold | `/contributing` | HIGH     | S      | Move a single primary action higher so users can act without scrolling |
| 5    | **63**    | No primary CTA above the fold | `/changelog`    | HIGH     | S      | Move a single primary action higher so users can act without scrolling |

## Execution Tracker

| Score | ID                                              | Severity | Status | Owner | Sprint |
| ----- | ----------------------------------------------- | -------- | ------ | ----- | ------ |
| 115.5 | `api-conversion-no-primary-above-fold`          | HIGH     | Todo   | TBD   | TBD    |
| 105   | `verification-conversion-no-primary-above-fold` | HIGH     | Todo   | TBD   | TBD    |
| 84    | `about-conversion-no-primary-above-fold`        | HIGH     | Todo   | TBD   | TBD    |
| 73.5  | `contributing-conversion-no-primary-above-fold` | HIGH     | Todo   | TBD   | TBD    |
| 63    | `changelog-conversion-no-primary-above-fold`    | HIGH     | Todo   | TBD   | TBD    |
| 45    | `servers-friction-coming-soon`                  | LOW      | Todo   | TBD   | TBD    |
| 42    | `servers-github-friction-disabled-controls`     | LOW      | Todo   | TBD   | TBD    |
| 30    | `servers-q-github-friction-coming-soon`         | LOW      | Todo   | TBD   | TBD    |

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

| Score     | Title                         | Route           | Category   | Effort | Suggested Fix                                                          |
| --------- | ----------------------------- | --------------- | ---------- | ------ | ---------------------------------------------------------------------- |
| **115.5** | No primary CTA above the fold | `/api`          | conversion | S      | Move a single primary action higher so users can act without scrolling |
| **105**   | No primary CTA above the fold | `/verification` | conversion | S      | Move a single primary action higher so users can act without scrolling |
| **84**    | No primary CTA above the fold | `/about`        | conversion | S      | Move a single primary action higher so users can act without scrolling |
| **73.5**  | No primary CTA above the fold | `/contributing` | conversion | S      | Move a single primary action higher so users can act without scrolling |
| **63**    | No primary CTA above the fold | `/changelog`    | conversion | S      | Move a single primary action higher so users can act without scrolling |

## Low Priority

| Score | Title                              | Route               | Category | Effort |
| ----- | ---------------------------------- | ------------------- | -------- | ------ |
| 45    | Contains 'Coming Soon' placeholder | `/servers`          | friction | M      |
| 42    | Disabled controls in main content  | `/servers/github`   | friction | S      |
| 30    | Contains 'Coming Soon' placeholder | `/servers?q=github` | friction | M      |

## Grouped by Route

| Route               | Item Count | Categories |
| ------------------- | ---------- | ---------- |
| `/about`            | 1          | conversion |
| `/api`              | 1          | conversion |
| `/changelog`        | 1          | conversion |
| `/contributing`     | 1          | conversion |
| `/servers`          | 1          | friction   |
| `/servers?q=github` | 1          | friction   |
| `/servers/github`   | 1          | friction   |
| `/verification`     | 1          | conversion |

## Grouped by Category

| Category   | Item Count | Example Routes                                         |
| ---------- | ---------- | ------------------------------------------------------ |
| conversion | 5          | /about, /api, /changelog, /contributing, /verification |
| friction   | 3          | /servers, /servers/github, /servers?q=github           |

## All Items Detail

<details>
<summary>Click to expand full item details</summary>

### No primary CTA above the fold

- **Opportunity Score:** 115.5
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

- **Opportunity Score:** 105
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

### No primary CTA above the fold

- **Opportunity Score:** 84
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

- **Opportunity Score:** 73.5
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

- **Opportunity Score:** 63
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

### Contains 'Coming Soon' placeholder

- **Opportunity Score:** 45
- **ID:** `servers-friction-coming-soon`
- **Severity:** LOW
- **Impact:** Minor consistency or optimization opportunity
- **Effort:** Medium (2-8 hours)
- **Route:** `/servers`
- **Category:** friction
- **Source:** heuristics
- **Evidence:** 1 coming soon blocks
- **Suggested Fix:** Replace placeholder content with actual functionality or remove

### Disabled controls in main content

- **Opportunity Score:** 42
- **ID:** `servers-github-friction-disabled-controls`
- **Severity:** LOW
- **Impact:** Minor consistency or optimization opportunity
- **Effort:** Small (< 2 hours)
- **Route:** `/servers/github`
- **Category:** friction
- **Source:** heuristics
- **Evidence:** 2 disabled controls
- **Suggested Fix:** Review if disabled controls are necessary or should be removed/enabled

### Contains 'Coming Soon' placeholder

- **Opportunity Score:** 30
- **ID:** `servers-q-github-friction-coming-soon`
- **Severity:** LOW
- **Impact:** Minor consistency or optimization opportunity
- **Effort:** Medium (2-8 hours)
- **Route:** `/servers?q=github`
- **Category:** friction
- **Source:** heuristics
- **Evidence:** 1 coming soon blocks
- **Suggested Fix:** Replace placeholder content with actual functionality or remove

</details>

## Performance Regression Snapshot

- **Total Regressions:** 11
- **Budget Exceeded:** 1
- **Trend Regressions (> threshold):** 10

| Route             | Metric             | Current | Budget |
| ----------------- | ------------------ | ------- | ------ |
| `/`               | domContentLoadedMs | 302     | 2500   |
| `/`               | loadEventEndMs     | 757     | 5000   |
| `/docs`           | domContentLoadedMs | 298     | 3000   |
| `/docs`           | fcpMs              | 296     | 1800   |
| `/docs`           | loadEventEndMs     | 431     | 5000   |
| `/docs`           | ttfbMs             | 263     | 1000   |
| `/servers/github` | ttfbMs             | 1487    | 1000   |
| `/verification`   | domContentLoadedMs | 618     | 3000   |
| `/verification`   | fcpMs              | 612     | 1800   |
| `/verification`   | loadEventEndMs     | 745     | 5000   |

## Analysis Notes

- 5 critical/high heuristic gaps detected

---

_Generated by `scripts/generate-product-backlog.ts` from deterministic report inputs._
