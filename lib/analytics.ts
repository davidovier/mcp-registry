/**
 * Lightweight, privacy-respecting analytics for funnel tracking.
 *
 * - Anonymous session IDs (localStorage, no cookies)
 * - No PII collected
 * - Events sent to internal /api/events endpoint
 */

// Event types for funnel tracking
export type EventType =
  | "page_view"
  | "search_performed"
  | "server_viewed"
  | "verification_requested"
  | "submit_started"
  | "submit_completed"
  | "external_link_clicked"
  | "filter_used"
  | "sort_changed"
  // Scroll depth events
  | "scroll_25"
  | "scroll_50"
  | "scroll_75"
  // CTA visibility events
  | "primary_cta_visible"
  | "primary_cta_clicked";

// Event metadata types for type safety
export interface EventMetadata {
  page_view: { referrer?: string };
  search_performed: { query: string; results_count: number };
  server_viewed: { slug: string; verified?: boolean };
  verification_requested: { server_slug: string };
  submit_started: Record<string, never>;
  submit_completed: { server_slug: string };
  external_link_clicked: {
    url: string;
    link_type: "repo" | "homepage" | "docs";
  };
  filter_used: { filter_type: string; value: string };
  sort_changed: { sort_mode: string };
  // Scroll depth metadata
  scroll_25: { page: string };
  scroll_50: { page: string };
  scroll_75: { page: string };
  // CTA visibility metadata
  primary_cta_visible: { cta_id: string; time_to_visible_ms: number };
  primary_cta_clicked: { cta_id: string; time_to_click_ms: number };
}

// Session ID storage key
const SESSION_ID_KEY = "mcp_registry_session_id";

/**
 * Generate a random session ID (UUID v4-like)
 */
function generateSessionId(): string {
  // Use crypto.randomUUID if available, otherwise fallback
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create session ID from localStorage
 */
export function getSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch {
    // localStorage may be disabled (private browsing, etc.)
    return null;
  }
}

/**
 * Check if analytics is enabled (client-side only, non-blocking)
 */
function isAnalyticsEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  // Respect Do Not Track header
  if (navigator.doNotTrack === "1") {
    return false;
  }
  return true;
}

/**
 * Track an analytics event
 *
 * @param eventType - The type of event to track
 * @param metadata - Additional data about the event
 *
 * @example
 * ```ts
 * track('search_performed', { query: 'postgres', results_count: 5 });
 * track('server_viewed', { slug: 'my-server', verified: true });
 * track('external_link_clicked', { url: 'https://github.com/...', link_type: 'repo' });
 * ```
 */
export function track<T extends EventType>(
  eventType: T,
  metadata: EventMetadata[T]
): void {
  if (!isAnalyticsEnabled()) {
    return;
  }

  const sessionId = getSessionId();
  const route = typeof window !== "undefined" ? window.location.pathname : null;

  // Fire and forget - don't block the UI
  const payload = {
    event_type: eventType,
    route,
    metadata,
    session_id: sessionId,
  };

  // Use sendBeacon for reliability (survives page navigation)
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    navigator.sendBeacon("/api/events", blob);
  } else {
    // Fallback to fetch
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silently ignore errors - analytics should never break the app
    });
  }
}

/**
 * Track a page view event
 *
 * Call this on route changes or initial page load.
 */
export function trackPageView(): void {
  const referrer =
    typeof document !== "undefined"
      ? document.referrer || undefined
      : undefined;
  track("page_view", { referrer });
}

/**
 * Track when user performs a search
 */
export function trackSearch(query: string, resultsCount: number): void {
  track("search_performed", { query, results_count: resultsCount });
}

/**
 * Track when user views a server detail page
 */
export function trackServerView(slug: string, verified?: boolean): void {
  track("server_viewed", { slug, verified });
}

/**
 * Track when user requests verification
 */
export function trackVerificationRequest(serverSlug: string): void {
  track("verification_requested", { server_slug: serverSlug });
}

/**
 * Track when user starts submission flow
 */
export function trackSubmitStarted(): void {
  track("submit_started", {});
}

/**
 * Track when user completes submission
 */
export function trackSubmitCompleted(serverSlug: string): void {
  track("submit_completed", { server_slug: serverSlug });
}

/**
 * Track when user clicks an external link (repo, homepage, docs)
 */
export function trackExternalLinkClick(
  url: string,
  linkType: "repo" | "homepage" | "docs"
): void {
  track("external_link_clicked", { url, link_type: linkType });
}

/**
 * Track when user uses a filter
 */
export function trackFilterUsed(filterType: string, value: string): void {
  track("filter_used", { filter_type: filterType, value });
}

/**
 * Track when user changes sort mode
 */
export function trackSortChanged(sortMode: string): void {
  track("sort_changed", { sort_mode: sortMode });
}

// ============================================================================
// Scroll Depth Tracking
// ============================================================================

// Track which scroll thresholds have been fired (per page)
const firedScrollThresholds = new Set<string>();

/**
 * Get scroll percentage of the page
 */
function getScrollPercentage(): number {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return 0;
  }

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  if (scrollHeight <= 0) return 100; // Page fits in viewport
  return Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
}

/**
 * Track scroll depth events (25%, 50%, 75%)
 * Call this from a scroll event handler.
 */
export function trackScrollDepth(): void {
  if (!isAnalyticsEnabled()) return;

  const percentage = getScrollPercentage();
  const page = typeof window !== "undefined" ? window.location.pathname : "";

  const thresholds = [
    { percent: 25, event: "scroll_25" as const },
    { percent: 50, event: "scroll_50" as const },
    { percent: 75, event: "scroll_75" as const },
  ];

  for (const { percent, event } of thresholds) {
    const key = `${page}:${percent}`;
    if (percentage >= percent && !firedScrollThresholds.has(key)) {
      firedScrollThresholds.add(key);
      track(event, { page });
    }
  }
}

/**
 * Reset scroll tracking for the current page (call on route change)
 */
export function resetScrollTracking(): void {
  const page = typeof window !== "undefined" ? window.location.pathname : "";
  // Remove all entries for this page
  for (const key of firedScrollThresholds) {
    if (key.startsWith(`${page}:`)) {
      firedScrollThresholds.delete(key);
    }
  }
}

// ============================================================================
// CTA Visibility Tracking
// ============================================================================

// Track CTA visibility state
const ctaVisibilityState = new Map<
  string,
  { visible: boolean; visibleAt: number | null; pageLoadTime: number }
>();

/**
 * Track when a primary CTA becomes visible
 */
export function trackCTAVisible(ctaId: string, pageLoadTime: number): void {
  const now = Date.now();
  const timeToVisible = now - pageLoadTime;

  const state = ctaVisibilityState.get(ctaId);
  if (state?.visible) {
    // Already tracked as visible
    return;
  }

  ctaVisibilityState.set(ctaId, {
    visible: true,
    visibleAt: now,
    pageLoadTime,
  });

  track("primary_cta_visible", {
    cta_id: ctaId,
    time_to_visible_ms: timeToVisible,
  });
}

/**
 * Track when a primary CTA is clicked
 */
export function trackCTAClicked(ctaId: string, pageLoadTime: number): void {
  const now = Date.now();
  const timeToClick = now - pageLoadTime;

  track("primary_cta_clicked", {
    cta_id: ctaId,
    time_to_click_ms: timeToClick,
  });
}

/**
 * Reset CTA tracking state (call on route change)
 */
export function resetCTATracking(): void {
  ctaVisibilityState.clear();
}

/**
 * Create an IntersectionObserver for tracking CTA visibility
 *
 * @param ctaId - Unique identifier for the CTA
 * @param pageLoadTime - Timestamp when page loaded (Date.now())
 * @returns IntersectionObserver instance or null if not supported
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const pageLoadTime = Date.now();
 *   const observer = createCTAVisibilityObserver('browse-registry', pageLoadTime);
 *   const element = document.querySelector('[data-cta="browse-registry"]');
 *   if (observer && element) {
 *     observer.observe(element);
 *     return () => observer.disconnect();
 *   }
 * }, []);
 * ```
 */
export function createCTAVisibilityObserver(
  ctaId: string,
  pageLoadTime: number
): IntersectionObserver | null {
  if (
    typeof window === "undefined" ||
    typeof IntersectionObserver === "undefined"
  ) {
    return null;
  }

  return new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          trackCTAVisible(ctaId, pageLoadTime);
        }
      }
    },
    {
      threshold: 0.5, // CTA is 50% visible
      rootMargin: "0px",
    }
  );
}

/**
 * Selector for primary CTA elements
 */
export const PRIMARY_CTA_SELECTOR = "[data-primary-action]";

/**
 * Get CTA ID from element
 */
export function getCTAId(element: Element): string | null {
  return element.getAttribute("data-primary-action");
}
