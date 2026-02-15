"use client";

import { useEffect } from "react";

import { trackServerView } from "@/lib/analytics";

interface ServerViewTrackerProps {
  slug: string;
  verified: boolean;
}

/**
 * Client component that tracks server page views.
 * Renders nothing visible - purely for analytics.
 */
export function ServerViewTracker({ slug, verified }: ServerViewTrackerProps) {
  useEffect(() => {
    trackServerView(slug, verified);
  }, [slug, verified]);

  return null;
}
