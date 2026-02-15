"use client";

import { useEffect, useRef } from "react";

import { resetScrollTracking, trackScrollDepth } from "@/lib/analytics";

/**
 * Tracks scroll depth events (25%, 50%, 75%) for the current page.
 * Renders nothing visible - purely for analytics.
 *
 * Add this component to any page where you want to track scroll engagement.
 */
export function ScrollDepthTracker() {
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Reset tracking on route change
    const currentPath = window.location.pathname;
    if (lastPathRef.current !== currentPath) {
      resetScrollTracking();
      lastPathRef.current = currentPath;
    }

    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          trackScrollDepth();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Check initial scroll position (for users who navigate to scrolled pages)
    trackScrollDepth();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}
