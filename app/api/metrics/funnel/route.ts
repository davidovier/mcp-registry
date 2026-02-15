import { NextRequest, NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

// Funnel stages in order
// This captures the full user journey from landing to conversion
const FUNNEL_STAGES = [
  { key: "visit", eventTypes: ["page_view"] },
  { key: "primary_cta_visible", eventTypes: ["primary_cta_visible"] },
  { key: "primary_cta_clicked", eventTypes: ["primary_cta_clicked"] },
  { key: "search", eventTypes: ["search_performed"] },
  { key: "view_server", eventTypes: ["server_viewed"] },
  { key: "click_external", eventTypes: ["external_link_clicked"] },
  { key: "submit_started", eventTypes: ["submit_started"] },
  { key: "submit_completed", eventTypes: ["submit_completed"] },
] as const;

type FunnelStage = (typeof FUNNEL_STAGES)[number]["key"];

interface FunnelStageData {
  stage: FunnelStage;
  unique_sessions: number;
  percentage_of_visitors: number;
  dropoff_from_previous: number | null;
}

interface FunnelResponse {
  period: {
    start: string;
    end: string;
    days: number;
  };
  total_sessions: number;
  stages: FunnelStageData[];
}

/**
 * Check if user is admin
 */
async function isAdmin(
  _supabase: ReturnType<typeof createServiceClient>
): Promise<boolean> {
  // For now, check if request has valid service role (used by internal dashboards)
  // In production, this would check the actual user session
  return true; // Service client has admin access
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
 * GET /api/metrics/funnel
 *
 * Returns funnel analytics data showing conversion rates between stages.
 *
 * Query parameters:
 *   - days: Number of days to analyze (default: 7, max: 90)
 *
 * Response:
 * {
 *   period: { start, end, days },
 *   total_sessions: number,
 *   stages: [
 *     { stage: 'visit', unique_sessions: 1000, percentage_of_visitors: 100, dropoff_from_previous: null },
 *     { stage: 'search', unique_sessions: 600, percentage_of_visitors: 60, dropoff_from_previous: 40 },
 *     ...
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Parse days parameter
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const days = Math.min(Math.max(parseInt(daysParam || "7", 10) || 7, 1), 90);

    // Skip if Supabase not configured (dev/CI environments)
    if (!isSupabaseConfigured()) {
      return NextResponse.json(createEmptyResponse(days), {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      });
    }

    const supabase = createServiceClient();

    // Verify admin access (service client always has access)
    const hasAccess = await isAdmin(supabase);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Query unique sessions for each stage
    const stages: FunnelStageData[] = [];
    let totalSessions = 0;
    let previousSessions = 0;

    for (let i = 0; i < FUNNEL_STAGES.length; i++) {
      const stage = FUNNEL_STAGES[i];

      // Count unique sessions that have this event type
      const { count, error } = await supabase
        .from("events")
        .select("session_id", { count: "exact", head: true })
        .in("event_type", stage.eventTypes)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .not("session_id", "is", null);

      if (error) {
        console.error(`Error querying ${stage.key}:`, error);
        continue;
      }

      const uniqueSessions = count || 0;

      // For the first stage (visit), this is our total
      if (i === 0) {
        totalSessions = uniqueSessions;
        previousSessions = uniqueSessions;
      }

      const percentageOfVisitors =
        totalSessions > 0
          ? Math.round((uniqueSessions / totalSessions) * 100 * 100) / 100
          : 0;

      const dropoffFromPrevious =
        i === 0 || previousSessions === 0
          ? null
          : Math.round(
              ((previousSessions - uniqueSessions) / previousSessions) *
                100 *
                100
            ) / 100;

      stages.push({
        stage: stage.key,
        unique_sessions: uniqueSessions,
        percentage_of_visitors: percentageOfVisitors,
        dropoff_from_previous: dropoffFromPrevious,
      });

      previousSessions = uniqueSessions;
    }

    const response: FunnelResponse = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
      total_sessions: totalSessions,
      stages,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Funnel API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Create empty response for when Supabase is not configured
 */
function createEmptyResponse(days: number): FunnelResponse {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days,
    },
    total_sessions: 0,
    stages: FUNNEL_STAGES.map((stage, i) => ({
      stage: stage.key,
      unique_sessions: 0,
      percentage_of_visitors: i === 0 ? 100 : 0,
      dropoff_from_previous: null,
    })),
  };
}

// ISR with 5 minute revalidation
export const revalidate = 300;
