"use client";

import { useEffect, useRef } from "react";

import {
  createCTAVisibilityObserver,
  getCTAId,
  PRIMARY_CTA_SELECTOR,
  resetCTATracking,
  trackCTAClicked,
} from "@/lib/analytics";

/**
 * Tracks primary CTA visibility and clicks.
 * Uses IntersectionObserver to detect when CTAs enter the viewport.
 *
 * Mark CTAs with data-primary-action="unique-id" attribute.
 *
 * @example
 * ```tsx
 * // In your page
 * <CTAVisibilityTracker />
 *
 * // On your CTA button
 * <Link href="/servers" data-primary-action="browse-registry">
 *   Browse Registry
 * </Link>
 * ```
 */
export function CTAVisibilityTracker() {
  const pageLoadTimeRef = useRef<number>(Date.now());
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map());
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reset tracking on route change
    const currentPath = window.location.pathname;
    if (lastPathRef.current !== currentPath) {
      resetCTATracking();
      pageLoadTimeRef.current = Date.now();
      lastPathRef.current = currentPath;

      // Clean up old observers
      for (const observer of observersRef.current.values()) {
        observer.disconnect();
      }
      observersRef.current.clear();
    }

    // Find all primary CTAs
    const ctaElements = document.querySelectorAll(PRIMARY_CTA_SELECTOR);

    // Create observers for each CTA
    ctaElements.forEach((element) => {
      const ctaId = getCTAId(element);
      if (!ctaId) return;

      // Skip if already observing
      if (observersRef.current.has(ctaId)) return;

      const observer = createCTAVisibilityObserver(
        ctaId,
        pageLoadTimeRef.current
      );

      if (observer) {
        observer.observe(element);
        observersRef.current.set(ctaId, observer);
      }
    });

    // Handle CTA clicks
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Element;
      const ctaElement = target.closest(PRIMARY_CTA_SELECTOR);

      if (ctaElement) {
        const ctaId = getCTAId(ctaElement);
        if (ctaId) {
          trackCTAClicked(ctaId, pageLoadTimeRef.current);
        }
      }
    };

    document.addEventListener("click", handleClick, { capture: true });

    // Copy ref value for cleanup
    const currentObservers = observersRef.current;

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });

      // Disconnect all observers
      for (const observer of currentObservers.values()) {
        observer.disconnect();
      }
    };
  }, []);

  return null;
}
