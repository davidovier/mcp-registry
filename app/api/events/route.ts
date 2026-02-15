import { NextRequest, NextResponse } from "next/server";

import type { Json } from "@/lib/supabase/database.types";
import { createServiceClient } from "@/lib/supabase/service";

// Valid event types
const VALID_EVENT_TYPES = new Set([
  "page_view",
  "search_performed",
  "server_viewed",
  "verification_requested",
  "submit_started",
  "submit_completed",
  "external_link_clicked",
  "filter_used",
  "sort_changed",
  // Scroll depth events
  "scroll_25",
  "scroll_50",
  "scroll_75",
  // CTA visibility events
  "primary_cta_visible",
  "primary_cta_clicked",
]);

// Max metadata size (prevent abuse)
const MAX_METADATA_SIZE = 4096;

// Rate limiting: max events per session per minute (in-memory, resets on restart)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_EVENTS = 30;
const sessionEventCounts = new Map<
  string,
  { count: number; resetAt: number }
>();

/**
 * Check rate limit for a session
 */
function checkRateLimit(sessionId: string | null): boolean {
  if (!sessionId) {
    // Anonymous sessions get a default limit
    return true;
  }

  const now = Date.now();
  const entry = sessionEventCounts.get(sessionId);

  if (!entry || now > entry.resetAt) {
    // New window
    sessionEventCounts.set(sessionId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_EVENTS) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Validate event payload
 */
function validateEvent(body: unknown): {
  valid: boolean;
  error?: string;
  data?: {
    event_type: string;
    route: string | null;
    metadata: Json;
    session_id: string | null;
  };
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const { event_type, route, metadata, session_id } = body as Record<
    string,
    unknown
  >;

  // Validate event_type
  if (typeof event_type !== "string" || !VALID_EVENT_TYPES.has(event_type)) {
    return { valid: false, error: "Invalid event_type" };
  }

  // Validate route (optional string)
  if (route !== null && route !== undefined && typeof route !== "string") {
    return { valid: false, error: "Invalid route" };
  }

  // Validate metadata (optional object)
  const parsedMetadata =
    metadata && typeof metadata === "object" ? metadata : {};
  const metadataStr = JSON.stringify(parsedMetadata);
  if (metadataStr.length > MAX_METADATA_SIZE) {
    return { valid: false, error: "Metadata too large" };
  }

  // Validate session_id (optional string, max 64 chars)
  if (session_id !== null && session_id !== undefined) {
    if (typeof session_id !== "string" || session_id.length > 64) {
      return { valid: false, error: "Invalid session_id" };
    }
  }

  return {
    valid: true,
    data: {
      event_type,
      route: typeof route === "string" ? route : null,
      metadata: parsedMetadata as Json,
      session_id: typeof session_id === "string" ? session_id : null,
    },
  };
}

/**
 * Check if Supabase is configured
 */
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return (
    !!url &&
    !!serviceKey &&
    !url.includes("placeholder") &&
    !url.includes("your-project")
  );
}

/**
 * POST /api/events
 *
 * Receives analytics events from the client and stores them in Supabase.
 * Supports both JSON body and sendBeacon (blob).
 */
export async function POST(request: NextRequest) {
  try {
    // Parse body (supports both JSON and sendBeacon blob)
    let body: unknown;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      // sendBeacon sends as text/plain sometimes
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
      }
    }

    // Validate event
    const validation = validateEvent(body);
    if (!validation.valid || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { event_type, route, metadata, session_id } = validation.data;

    // Rate limit check
    if (!checkRateLimit(session_id)) {
      // Silently accept but don't store (don't reveal rate limiting)
      return NextResponse.json({ success: true }, { status: 202 });
    }

    // Skip storage if Supabase not configured (dev/CI environments)
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true }, { status: 202 });
    }

    // Store event in Supabase
    const supabase = createServiceClient();
    const { error } = await supabase.from("events").insert({
      event_type,
      route,
      metadata,
      session_id,
    });

    if (error) {
      console.error("Failed to store event:", error);
      // Still return success to client - analytics errors shouldn't affect UX
      return NextResponse.json({ success: true }, { status: 202 });
    }

    return NextResponse.json({ success: true }, { status: 202 });
  } catch (error) {
    console.error("Event API error:", error);
    // Always return success to client
    return NextResponse.json({ success: true }, { status: 202 });
  }
}

// Disable caching for this endpoint
export const dynamic = "force-dynamic";
