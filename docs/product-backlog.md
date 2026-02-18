# Product Backlog

> Source report timestamp: 2026-02-15T18:16:45.032Z

## Summary

- **Total Items:** 17
- **Critical:** 0
- **High:** 5
- **Medium:** 7
- **Low:** 5
- **Max Opportunity Score:** 126
- **Avg Opportunity Score:** 68.3

### By Category

- **conversion:** 6
- **friction:** 5
- **navigation:** 6

### Top Offender Routes

- `/submit`: 3 items
- `/servers/github`: 2 items
- `/about`: 1 items
- `/changelog`: 1 items
- `/contributing`: 1 items

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

| Rank | Score    | Item                                 | Route           | Severity | Effort | Suggested Fix                                                                                |
| ---- | -------- | ------------------------------------ | --------------- | -------- | ------ | -------------------------------------------------------------------------------------------- |
| 1    | **126**  | No primary CTA above the fold        | `/docs`         | HIGH     | S      | Move a single primary action higher so users can act without scrolling                       |
| 2    | **105**  | No primary CTA above the fold        | `/verification` | HIGH     | S      | Move a single primary action higher so users can act without scrolling                       |
| 3    | **104**  | No social proof near decision points | `/submit`       | MEDIUM   | S      | Add lightweight social proof such as verification freshness, view count, or usage indicators |
| 4    | **84**   | No primary CTA above the fold        | `/about`        | HIGH     | S      | Move a single primary action higher so users can act without scrolling                       |
| 5    | **73.5** | No primary CTA above the fold        | `/contributing` | HIGH     | S      | Move a single primary action higher so users can act without scrolling                       |

## Execution Tracker

| Score | ID                                              | Severity | Status | Owner | Sprint |
| ----- | ----------------------------------------------- | -------- | ------ | ----- | ------ |
| 126   | `docs-conversion-no-primary-above-fold`         | HIGH     | Todo   | TBD   | TBD    |
| 105   | `verification-conversion-no-primary-above-fold` | HIGH     | Todo   | TBD   | TBD    |
| 104   | `submit-conversion-missing-social-proof`        | MEDIUM   | Todo   | TBD   | TBD    |
| 84    | `about-conversion-no-primary-above-fold`        | HIGH     | Todo   | TBD   | TBD    |
| 73.5  | `contributing-conversion-no-primary-above-fold` | HIGH     | Todo   | TBD   | TBD    |
| 71.5  | `submit-navigation-dead-end`                    | MEDIUM   | Todo   | TBD   | TBD    |
| 66    | `missing-route--servers-filesystem`             | MEDIUM   | Todo   | TBD   | TBD    |
| 66    | `missing-route--servers-github`                 | MEDIUM   | Todo   | TBD   | TBD    |
| 66    | `missing-route--servers-postgres`               | MEDIUM   | Todo   | TBD   | TBD    |
| 66    | `missing-route--servers-slack`                  | MEDIUM   | Todo   | TBD   | TBD    |
| 66    | `missing-route--servers-web-search`             | MEDIUM   | Todo   | TBD   | TBD    |
| 63    | `changelog-conversion-no-primary-above-fold`    | HIGH     | Todo   | TBD   | TBD    |
| 45.5  | `submit-friction-disabled-controls`             | LOW      | Todo   | TBD   | TBD    |
| 45    | `servers-friction-coming-soon`                  | LOW      | Todo   | TBD   | TBD    |
| 42    | `servers-github-friction-disabled-controls`     | LOW      | Todo   | TBD   | TBD    |
| 42    | `signin-friction-disabled-controls`             | LOW      | Todo   | TBD   | TBD    |
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

| Score    | Title                         | Route           | Category   | Effort | Suggested Fix                                                          |
| -------- | ----------------------------- | --------------- | ---------- | ------ | ---------------------------------------------------------------------- |
| **126**  | No primary CTA above the fold | `/docs`         | conversion | S      | Move a single primary action higher so users can act without scrolling |
| **105**  | No primary CTA above the fold | `/verification` | conversion | S      | Move a single primary action higher so users can act without scrolling |
| **84**   | No primary CTA above the fold | `/about`        | conversion | S      | Move a single primary action higher so users can act without scrolling |
| **73.5** | No primary CTA above the fold | `/contributing` | conversion | S      | Move a single primary action higher so users can act without scrolling |
| **63**   | No primary CTA above the fold | `/changelog`    | conversion | S      | Move a single primary action higher so users can act without scrolling |

## Medium Priority

| Score    | Title                                | Route                 | Category   | Effort | Suggested Fix                                                                                |
| -------- | ------------------------------------ | --------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------- |
| **104**  | No social proof near decision points | `/submit`             | conversion | S      | Add lightweight social proof such as verification freshness, view count, or usage indicators |
| **71.5** | Dead-end page                        | `/submit`             | navigation | M      | Add related links or 'next steps' section to guide users                                     |
| **66**   | Missing route: /servers/filesystem   | `/servers/filesystem` | navigation | M      | Create the missing page or fix the incorrect link                                            |
| **66**   | Missing route: /servers/github       | `/servers/github`     | navigation | M      | Create the missing page or fix the incorrect link                                            |
| **66**   | Missing route: /servers/postgres     | `/servers/postgres`   | navigation | M      | Create the missing page or fix the incorrect link                                            |
| **66**   | Missing route: /servers/slack        | `/servers/slack`      | navigation | M      | Create the missing page or fix the incorrect link                                            |
| **66**   | Missing route: /servers/web-search   | `/servers/web-search` | navigation | M      | Create the missing page or fix the incorrect link                                            |

## Low Priority

| Score | Title                              | Route               | Category | Effort |
| ----- | ---------------------------------- | ------------------- | -------- | ------ |
| 45.5  | Disabled controls in main content  | `/submit`           | friction | S      |
| 45    | Contains 'Coming Soon' placeholder | `/servers`          | friction | M      |
| 42    | Disabled controls in main content  | `/servers/github`   | friction | S      |
| 42    | Disabled controls in main content  | `/signin`           | friction | S      |
| 30    | Contains 'Coming Soon' placeholder | `/servers?q=github` | friction | M      |

## Grouped by Route

| Route                 | Item Count | Categories                       |
| --------------------- | ---------- | -------------------------------- |
| `/about`              | 1          | conversion                       |
| `/changelog`          | 1          | conversion                       |
| `/contributing`       | 1          | conversion                       |
| `/docs`               | 1          | conversion                       |
| `/servers`            | 1          | friction                         |
| `/servers?q=github`   | 1          | friction                         |
| `/servers/filesystem` | 1          | navigation                       |
| `/servers/github`     | 2          | friction, navigation             |
| `/servers/postgres`   | 1          | navigation                       |
| `/servers/slack`      | 1          | navigation                       |
| `/servers/web-search` | 1          | navigation                       |
| `/signin`             | 1          | friction                         |
| `/submit`             | 3          | conversion, friction, navigation |
| `/verification`       | 1          | conversion                       |

## Grouped by Category

| Category   | Item Count | Example Routes                                                                               |
| ---------- | ---------- | -------------------------------------------------------------------------------------------- |
| conversion | 6          | /about, /changelog, /contributing, /docs, /submit                                            |
| friction   | 5          | /servers, /servers/github, /servers?q=github, /signin, /submit                               |
| navigation | 6          | /servers/filesystem, /servers/github, /servers/postgres, /servers/slack, /servers/web-search |

## All Items Detail

<details>
<summary>Click to expand full item details</summary>

### No primary CTA above the fold

- **Opportunity Score:** 126
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

### No social proof near decision points

- **Opportunity Score:** 104
- **ID:** `submit-conversion-missing-social-proof`
- **Severity:** MEDIUM
- **Impact:** Polish/usability issue affecting user experience
- **Effort:** Small (< 2 hours)
- **Route:** `/submit`
- **Category:** conversion
- **Source:** heuristics
- **Suggested Fix:** Add lightweight social proof such as verification freshness, view count, or usage indicators

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

### Dead-end page

- **Opportunity Score:** 71.5
- **ID:** `submit-navigation-dead-end`
- **Severity:** MEDIUM
- **Impact:** Polish/usability issue affecting user experience
- **Effort:** Medium (2-8 hours)
- **Route:** `/submit`
- **Category:** navigation
- **Source:** heuristics
- **Screenshot:** `e2e/screenshots/product-heuristics/submit/light/desktop/dead-end.png`
- **Suggested Fix:** Add related links or 'next steps' section to guide users

### Missing route: /servers/filesystem

- **Opportunity Score:** 66
- **ID:** `missing-route--servers-filesystem`
- **Severity:** MEDIUM
- **Impact:** Linked route returns 404, breaking user navigation
- **Effort:** Medium (2-8 hours)
- **Route:** `/servers/filesystem`
- **Category:** navigation
- **Source:** product-gaps
- **Evidence:** Route /servers/filesystem is linked but returns 404
- **Suggested Fix:** Create the missing page or fix the incorrect link

### Missing route: /servers/github

- **Opportunity Score:** 66
- **ID:** `missing-route--servers-github`
- **Severity:** MEDIUM
- **Impact:** Linked route returns 404, breaking user navigation
- **Effort:** Medium (2-8 hours)
- **Route:** `/servers/github`
- **Category:** navigation
- **Source:** product-gaps
- **Evidence:** Route /servers/github is linked but returns 404
- **Suggested Fix:** Create the missing page or fix the incorrect link

### Missing route: /servers/postgres

- **Opportunity Score:** 66
- **ID:** `missing-route--servers-postgres`
- **Severity:** MEDIUM
- **Impact:** Linked route returns 404, breaking user navigation
- **Effort:** Medium (2-8 hours)
- **Route:** `/servers/postgres`
- **Category:** navigation
- **Source:** product-gaps
- **Evidence:** Route /servers/postgres is linked but returns 404
- **Suggested Fix:** Create the missing page or fix the incorrect link

### Missing route: /servers/slack

- **Opportunity Score:** 66
- **ID:** `missing-route--servers-slack`
- **Severity:** MEDIUM
- **Impact:** Linked route returns 404, breaking user navigation
- **Effort:** Medium (2-8 hours)
- **Route:** `/servers/slack`
- **Category:** navigation
- **Source:** product-gaps
- **Evidence:** Route /servers/slack is linked but returns 404
- **Suggested Fix:** Create the missing page or fix the incorrect link

### Missing route: /servers/web-search

- **Opportunity Score:** 66
- **ID:** `missing-route--servers-web-search`
- **Severity:** MEDIUM
- **Impact:** Linked route returns 404, breaking user navigation
- **Effort:** Medium (2-8 hours)
- **Route:** `/servers/web-search`
- **Category:** navigation
- **Source:** product-gaps
- **Evidence:** Route /servers/web-search is linked but returns 404
- **Suggested Fix:** Create the missing page or fix the incorrect link

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

### Disabled controls in main content

- **Opportunity Score:** 45.5
- **ID:** `submit-friction-disabled-controls`
- **Severity:** LOW
- **Impact:** Minor consistency or optimization opportunity
- **Effort:** Small (< 2 hours)
- **Route:** `/submit`
- **Category:** friction
- **Source:** heuristics
- **Evidence:** 1 disabled controls
- **Suggested Fix:** Review if disabled controls are necessary or should be removed/enabled

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

### Disabled controls in main content

- **Opportunity Score:** 42
- **ID:** `signin-friction-disabled-controls`
- **Severity:** LOW
- **Impact:** Minor consistency or optimization opportunity
- **Effort:** Small (< 2 hours)
- **Route:** `/signin`
- **Category:** friction
- **Source:** heuristics
- **Evidence:** 1 disabled controls
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

- **Total Regressions:** 3
- **Budget Exceeded:** 3
- **Trend Regressions (> threshold):** 0

| Route             | Metric | Current | Budget |
| ----------------- | ------ | ------- | ------ |
| `/api`            | ttfbMs | 1258    | 1000   |
| `/servers`        | ttfbMs | 1288    | 1000   |
| `/servers/github` | ttfbMs | 1553    | 1000   |

## Analysis Notes

- 5 critical/high heuristic gaps detected
- 5 linked routes appear missing

---

_Generated by `scripts/generate-product-backlog.ts` from deterministic report inputs._
