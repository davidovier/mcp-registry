# MCP Registry — Full Product Audit Report

**Audit Sprint:** 2
**Date:** 2026-02-13
**Auditor:** Automated (Playwright MCP + manual review)
**Environment:** Local dev server (pnpm dev) against Supabase production

---

## Executive Summary

**What's great:**

- Clean, cohesive "Precision Trust" design system with consistent semantic tokens
- Strong structural accessibility: every page has `<main>`, single `<h1>`, proper landmarks
- No icon-only buttons without `aria-label` across any audited page
- No images without alt text
- API caching is well-configured (`s-maxage=300, stale-while-revalidate=60`)
- 404/not-found page is well-designed with clear recovery path
- Performance is excellent: all pages load under 1.1s locally, TTFB under 100ms
- Dark mode is comprehensive and mostly well-executed

**What's risky:**

- Two WCAG AA contrast failures affect core interactive elements (primary buttons, tertiary text in dark mode)
- Primary button contrast (3.74:1) is below the 4.5:1 threshold in light mode — this affects the most important CTAs on the site
- Heading hierarchy skips (h1 -> h3) on homepage and servers page
- Inconsistent dark mode button styles between Button component, homepage CTAs, and 404 page CTA
- Footer links to `/privacy`, `/terms`, and `/api` return 404 (pages don't exist yet)
- Missing `favicon.ico` causes a 404 console error on every page load
- No skip-to-content link for keyboard navigation

---

## Scorecard

| Dimension          | Score (0–10) | Notes                                                                                                                             |
| ------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Visual cohesion    | 8            | Consistent tokens, warm neutrals, teal brand. Minor inconsistencies in button styling across pages.                               |
| Readability        | 7            | Primary and secondary text excellent. Tertiary text borderline in light mode (4.59:1), failing in dark (4.12:1).                  |
| Accessibility      | 6            | Good structure (landmarks, labels), but contrast failures on interactive elements and heading hierarchy gaps. No skip link.       |
| Navigation clarity | 8            | Clean header nav, breadcrumbs on detail/404 pages, logical footer. Mobile nav works.                                              |
| Form usability     | 7            | Sign-in form is clean with tabs (signin/signup/magic-link), OAuth providers, and clear labels. No inline validation feedback yet. |
| Performance        | 9            | Sub-100ms TTFB, low resource count (9-10 per page), proper API caching. Dev mode ~2MB transfer is expected.                       |
| Reliability        | 7            | Core pages work. 404 handling is good. Footer links to unbuilt pages (/privacy, /terms). Missing favicon.                         |

---

## Top 10 Issues

| #   | Issue                                                                | Impact | Effort | Details                                                                                                                                                                |
| --- | -------------------------------------------------------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Primary button contrast fails WCAG AA (3.74:1)**                   | High   | S      | White text on `brand-600` (#0d9488) is 3.74:1. Affects all primary CTAs, Sign In button, Browse Registry link. Fix: use `brand-700` (#0f766e) for ~5.99:1.             |
| 2   | **Dark mode tertiary text contrast fails WCAG AA (4.12:1)**          | High   | S      | `neutral-500` on `neutral-950` = 4.12:1. Used for footer copyright, filter labels, metadata. Fix: change dark `--text-tertiary` to `neutral-400` (#a8a29e) for 5.92:1. |
| 3   | **404 page "Back to servers" button missing dark text in dark mode** | High   | S      | Link uses `dark:bg-brand-500` but keeps `text-white` instead of `dark:text-neutral-950`. Results in 2.49:1 contrast ratio (critical failure).                          |
| 4   | **Heading hierarchy skips h2 on homepage and servers**               | Med    | S      | Homepage: h1 "MCP Registry" -> h3 "Discover". Servers: h1 -> h3 in server cards. Screen readers announce hierarchy to users.                                           |
| 5   | **Footer links to non-existent pages**                               | Med    | S      | `/privacy`, `/terms`, `/api` all return 404. Either create placeholder pages or remove the links.                                                                      |
| 6   | **Missing favicon**                                                  | Low    | S      | Every page load produces a `404 /favicon.ico` console error. Add a favicon or a `<link>` tag to prevent the request.                                                   |
| 7   | **No skip-to-content link**                                          | Med    | S      | Keyboard users must tab through entire header nav to reach main content. Add a visually-hidden skip link.                                                              |
| 8   | **Inconsistent button dark mode styling**                            | Med    | S      | Button component uses `dark:text-neutral-950`, homepage CTA uses `dark:text-neutral-950`, but 404 CTA and some inline styles omit it. Standardize.                     |
| 9   | **Sign-in form missing autocomplete attributes**                     | Low    | S      | Browser console warns about missing `autocomplete` on email/password inputs. Add `autocomplete="email"` and `autocomplete="current-password"`.                         |
| 10  | **Footer h3 headings skip h2 level**                                 | Low    | M      | Footer uses h3 for "Product", "Resources", "Legal" without preceding h2. Not a critical issue but semantically imprecise.                                              |

---

## Per-Page Findings

### Homepage (`/`)

- **Visual:** Clean, centered hero with clear hierarchy. Feature cards are simple and effective.
- **Contrast:** Light mode button is 3.74:1 (FAIL). Dark mode tertiary text 4.12:1 (FAIL).
- **A11y:** Has `<main>`, single h1. Heading skip: h1 -> h3 (feature cards). No skip link.
- **Mobile:** Stacks well. CTAs become full-width appropriately.
- **Screenshot refs:** `audit-sprint-2/homepage-{desktop,mobile}-{light,dark}.png`

### Servers Listing (`/servers`)

- **Visual:** Two-column layout (sidebar + cards) works well. Cards are information-dense but scannable.
- **Contrast:** Same button/tertiary issues as homepage.
- **A11y:** Has `<main>`, single h1. Server card headings are h3 (skip from h1). Filter labels are clear.
- **Mobile:** Sidebar collapses to "Filters" button. Cards stack to single column. Good.
- **Functionality:** Search works, filters apply via URL params, pagination present.
- **Screenshot refs:** `audit-sprint-2/servers-{desktop,mobile}-{light,dark}.png`

### Docs (`/docs`)

- **Visual:** Dense content page, well-structured with clear section hierarchy.
- **Contrast:** Code blocks have good contrast. Body text is excellent.
- **A11y:** Has `<main>`, single h1, proper heading hierarchy within main.
- **Content:** Comprehensive: What is MCP, Glossary, Using the Registry, Integration Examples, Submitting, Verification.
- **Screenshot refs:** `audit-sprint-2/docs-{desktop,mobile}-{light,dark}.png`

### About (`/about`)

- **Visual:** Well-structured with principle cards and roadmap items.
- **Contrast:** Standard token usage, same global issues apply.
- **A11y:** Has `<main>`, single h1, proper heading hierarchy.
- **Screenshot refs:** `audit-sprint-2/about-{desktop,mobile}-{light,dark}.png`

### Sign In (`/signin`)

- **Visual:** Clean centered card with OAuth + email tabs. Professional feel.
- **Contrast:** Input fields have good contrast. Button has the standard 3.74:1 issue.
- **A11y:** Has `<main>`, single h1. Form inputs have associated labels. Missing autocomplete attributes.
- **Form UX:** Tab switching (Sign In / Sign Up / Magic Link) is smooth. Error states work.
- **Screenshot refs:** `audit-sprint-2/signin-{desktop,mobile}-{light,dark}.png`

### 404 / Server Not Found (`/servers/non-existent-slug-xyz`)

- **Visual:** Clean empty state with icon, message, and recovery CTA. Well done.
- **Contrast:** "Back to servers" button has critical failure in dark mode (2.49:1) due to missing `dark:text-neutral-950`.
- **A11y:** Has `<main>`, single h1, breadcrumbs for context.
- **Screenshot refs:** `audit-sprint-2/404-{desktop,mobile}-{light,dark}.png`

---

## Concrete Recommendations

### Must Fix (Contrast Failures)

1. **Change primary button background from `brand-600` to `brand-700` in light mode.**
   - Why: 3.74:1 fails WCAG AA. 4.5:1 is the minimum for normal text.
   - Fix: In `Button.tsx` and all inline primary button classes, change `bg-brand-600` to `bg-brand-700` and `hover:bg-brand-700` to `hover:bg-brand-800`.
   - Impact: ~5.99:1 contrast ratio.

2. **Change dark mode `--text-tertiary` from `neutral-500` to `neutral-400`.**
   - Why: 4.12:1 fails WCAG AA. Footer copyright, metadata, and filter hints are illegible.
   - Fix: In `globals.css` `.dark` block, change `--text-tertiary: var(--color-neutral-500)` to `var(--color-neutral-400)`.
   - Impact: ~5.92:1 contrast ratio.

3. **Add `dark:text-neutral-950` to 404 page CTA.**
   - Why: 2.49:1 is a critical failure. The button is essentially unreadable in dark mode.
   - Fix: Add `dark:text-neutral-950` to the Link class in `not-found.tsx`.

### Should Fix

4. **Add skip-to-content link** in layout or header component.
5. **Fix heading hierarchy** on homepage (change feature card h3 to h2).
6. **Add autocomplete attributes** to sign-in form inputs.
7. **Remove or create** `/privacy`, `/terms`, `/api` pages.

### Nice to Have

8. **Add favicon** to prevent 404 console errors.
9. **Standardize button styling** — use the Button component everywhere instead of inline classes.
10. **Footer heading levels** — consider using `<h2 class="text-sm ...">` or an alternative pattern.

---

## Machine-Readable Reports

| Report             | Path                                  | Contents                                           |
| ------------------ | ------------------------------------- | -------------------------------------------------- |
| Contrast report    | `e2e/reports/contrast-report.json`    | WCAG AA/AAA pass/fail for 14 element pairs         |
| Performance report | `e2e/reports/perf-report.json`        | TTFB, DOMContentLoaded, resource counts per page   |
| Perf smoke results | `e2e/reports/perf-smoke-results.json` | Auto-generated by perf-smoke.spec.ts               |
| Design audit JSON  | `e2e/design-audit-results.json`       | Combined contrast checks from design-audit.spec.ts |

## Screenshot References

All screenshots saved to `e2e/screenshots/audit-sprint-2/`:

| Page     | Desktop Light                | Desktop Dark                | Mobile Light                | Mobile Dark                |
| -------- | ---------------------------- | --------------------------- | --------------------------- | -------------------------- |
| Homepage | `homepage-desktop-light.png` | `homepage-desktop-dark.png` | `homepage-mobile-light.png` | `homepage-mobile-dark.png` |
| Servers  | `servers-desktop-light.png`  | `servers-desktop-dark.png`  | `servers-mobile-light.png`  | `servers-mobile-dark.png`  |
| Docs     | `docs-desktop-light.png`     | `docs-desktop-dark.png`     | `docs-mobile-light.png`     | `docs-mobile-dark.png`     |
| About    | `about-desktop-light.png`    | `about-desktop-dark.png`    | `about-mobile-light.png`    | `about-mobile-dark.png`    |
| Sign In  | `signin-desktop-light.png`   | `signin-desktop-dark.png`   | `signin-mobile-light.png`   | `signin-mobile-dark.png`   |
| 404      | `404-desktop-light.png`      | `404-desktop-dark.png`      | `404-mobile-light.png`      | `404-mobile-dark.png`      |

---

## Test Coverage Added

| Spec File                   | Tests | Purpose                                                                                                                                   |
| --------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `e2e/accessibility.spec.ts` | 38    | Structural a11y checks per page: main landmark, h1 count, heading hierarchy, icon button labels, image alt, focus visibility, form labels |
| `e2e/perf-smoke.spec.ts`    | 6     | Performance thresholds per page + API cache header validation                                                                             |
| `e2e/design-audit.spec.ts`  | 29+   | Screenshots + contrast checks for 7 pages × 2 viewports × 2 themes (extended from 4 pages)                                                |

All tests pass in CI-compatible mode (no auth required for public pages).
