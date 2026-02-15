import { NextRequest, NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

// Insight severity levels
type Severity = "critical" | "high" | "medium" | "low";

// Insight categories
type Category = "conversion" | "engagement" | "ux" | "performance";

// Single insight/backlog item
interface Insight {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  evidence: string;
  suggested_fix: string;
  metric_value: number;
  threshold: number;
  created_at: string;
}

// Response shape
interface InsightsResponse {
  period: {
    start: string;
    end: string;
    days: number;
  };
  insights: Insight[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

// Thresholds for flagging issues
const THRESHOLDS = {
  // CTA visibility: < 40% means CTA is below fold
  CTA_VISIBILITY_MIN: 40,
  // CTA click-through when visible: < 10% means messaging mismatch
  CTA_CLICKTHROUGH_MIN: 10,
  // Scroll depth: < 30% reaching 50% scroll indicates engagement issues
  SCROLL_50_MIN: 30,
  // Search to view conversion: < 20% indicates discovery issues
  SEARCH_TO_VIEW_MIN: 20,
  // View to submit: < 5% indicates conversion issues
  VIEW_TO_SUBMIT_MIN: 5,
};

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
 * GET /api/metrics/insights
 *
 * Analyzes funnel data and generates actionable backlog items.
 *
 * Query parameters:
 *   - days: Number of days to analyze (default: 7, max: 90)
 *
 * Detects:
 *   - CTA below fold (< 40% visibility)
 *   - CTA messaging mismatch (< 10% click-through when visible)
 *   - Engagement issues (low scroll depth)
 *   - Discovery issues (low search-to-view conversion)
 *   - Conversion issues (low view-to-submit rate)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const days = Math.min(Math.max(parseInt(daysParam || "7", 10) || 7, 1), 90);

    // Skip if Supabase not configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(createEmptyResponse(days), {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        },
      });
    }

    const supabase = createServiceClient();

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch event counts for analysis
    const eventCounts = await fetchEventCounts(supabase, startDate, endDate);

    // Generate insights based on thresholds
    const insights = generateInsights(eventCounts, startDate);

    // Sort by severity
    const severityOrder: Record<Severity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    insights.sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );

    // Build summary
    const summary = {
      critical: insights.filter((i) => i.severity === "critical").length,
      high: insights.filter((i) => i.severity === "high").length,
      medium: insights.filter((i) => i.severity === "medium").length,
      low: insights.filter((i) => i.severity === "low").length,
      total: insights.length,
    };

    const response: InsightsResponse = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
      insights,
      summary,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Fetch event counts for all relevant event types
 */
async function fetchEventCounts(
  supabase: ReturnType<typeof createServiceClient>,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  const eventTypes = [
    "page_view",
    "primary_cta_visible",
    "primary_cta_clicked",
    "search_performed",
    "server_viewed",
    "scroll_25",
    "scroll_50",
    "scroll_75",
    "submit_started",
    "submit_completed",
  ];

  const counts: Record<string, number> = {};

  for (const eventType of eventTypes) {
    const { count, error } = await supabase
      .from("events")
      .select("session_id", { count: "exact", head: true })
      .eq("event_type", eventType)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .not("session_id", "is", null);

    if (error) {
      console.error(`Error counting ${eventType}:`, error);
      counts[eventType] = 0;
    } else {
      counts[eventType] = count || 0;
    }
  }

  return counts;
}

/**
 * Generate insights based on event counts and thresholds
 */
function generateInsights(
  counts: Record<string, number>,
  startDate: Date
): Insight[] {
  const insights: Insight[] = [];
  const now = new Date().toISOString();

  const visits = counts.page_view || 0;
  const ctaVisible = counts.primary_cta_visible || 0;
  const ctaClicked = counts.primary_cta_clicked || 0;
  const searches = counts.search_performed || 0;
  const serverViews = counts.server_viewed || 0;
  const scroll50 = counts.scroll_50 || 0;
  const submitStarted = counts.submit_started || 0;
  const submitCompleted = counts.submit_completed || 0;

  // Calculate rates
  const ctaVisibilityRate = visits > 0 ? (ctaVisible / visits) * 100 : 0;
  const ctaClickthroughRate =
    ctaVisible > 0 ? (ctaClicked / ctaVisible) * 100 : 0;
  const scroll50Rate = visits > 0 ? (scroll50 / visits) * 100 : 0;
  const searchToViewRate = searches > 0 ? (serverViews / searches) * 100 : 0;
  const viewToSubmitRate =
    serverViews > 0 ? (submitStarted / serverViews) * 100 : 0;
  const submitCompletionRate =
    submitStarted > 0 ? (submitCompleted / submitStarted) * 100 : 0;

  // Check CTA visibility (below fold detection)
  if (visits > 10 && ctaVisibilityRate < THRESHOLDS.CTA_VISIBILITY_MIN) {
    insights.push({
      id: `cta-below-fold-${startDate.getTime()}`,
      category: "conversion",
      severity: "high",
      title: "Primary CTA below fold",
      description:
        "Less than 40% of visitors see the primary call-to-action without scrolling. The CTA may be positioned too far down the page.",
      evidence: `${ctaVisibilityRate.toFixed(1)}% of visitors see the primary CTA (threshold: ${THRESHOLDS.CTA_VISIBILITY_MIN}%)`,
      suggested_fix:
        "Move the primary CTA above the fold or add a secondary CTA in the hero section. Consider reducing hero content height.",
      metric_value: ctaVisibilityRate,
      threshold: THRESHOLDS.CTA_VISIBILITY_MIN,
      created_at: now,
    });
  }

  // Check CTA click-through (messaging mismatch detection)
  if (
    ctaVisible > 10 &&
    ctaClickthroughRate < THRESHOLDS.CTA_CLICKTHROUGH_MIN
  ) {
    insights.push({
      id: `cta-messaging-mismatch-${startDate.getTime()}`,
      category: "conversion",
      severity: "high",
      title: "CTA messaging mismatch",
      description:
        "Visitors see the CTA but rarely click it. The CTA copy may not be compelling or the value proposition is unclear.",
      evidence: `${ctaClickthroughRate.toFixed(1)}% click-through despite ${ctaVisibilityRate.toFixed(1)}% visibility (threshold: ${THRESHOLDS.CTA_CLICKTHROUGH_MIN}%)`,
      suggested_fix:
        "Rewrite CTA copy to be more action-oriented. Test different value propositions. Consider A/B testing button text and colors.",
      metric_value: ctaClickthroughRate,
      threshold: THRESHOLDS.CTA_CLICKTHROUGH_MIN,
      created_at: now,
    });
  }

  // Check scroll engagement
  if (visits > 10 && scroll50Rate < THRESHOLDS.SCROLL_50_MIN) {
    insights.push({
      id: `low-scroll-engagement-${startDate.getTime()}`,
      category: "engagement",
      severity: "medium",
      title: "Low scroll engagement",
      description:
        "Most visitors don't scroll past 50% of the page. Content below the fold may not be discovered.",
      evidence: `Only ${scroll50Rate.toFixed(1)}% of visitors scroll to 50% (threshold: ${THRESHOLDS.SCROLL_50_MIN}%)`,
      suggested_fix:
        "Add visual cues to encourage scrolling (scroll indicators, partial content preview). Consider moving key content higher.",
      metric_value: scroll50Rate,
      threshold: THRESHOLDS.SCROLL_50_MIN,
      created_at: now,
    });
  }

  // Check search to view conversion
  if (searches > 10 && searchToViewRate < THRESHOLDS.SEARCH_TO_VIEW_MIN) {
    insights.push({
      id: `low-search-conversion-${startDate.getTime()}`,
      category: "ux",
      severity: "medium",
      title: "Low search-to-view conversion",
      description:
        "Users search but rarely click through to view server details. Search results may not be relevant or compelling.",
      evidence: `${searchToViewRate.toFixed(1)}% of searches lead to server views (threshold: ${THRESHOLDS.SEARCH_TO_VIEW_MIN}%)`,
      suggested_fix:
        "Improve search result cards with better descriptions and visual hierarchy. Add preview information to reduce clicks needed.",
      metric_value: searchToViewRate,
      threshold: THRESHOLDS.SEARCH_TO_VIEW_MIN,
      created_at: now,
    });
  }

  // Check view to submit conversion
  if (serverViews > 10 && viewToSubmitRate < THRESHOLDS.VIEW_TO_SUBMIT_MIN) {
    insights.push({
      id: `low-submit-conversion-${startDate.getTime()}`,
      category: "conversion",
      severity: "medium",
      title: "Low view-to-submit conversion",
      description:
        "Users view servers but rarely start the submission flow. The submit CTA may not be visible or compelling.",
      evidence: `${viewToSubmitRate.toFixed(1)}% of server views lead to submissions (threshold: ${THRESHOLDS.VIEW_TO_SUBMIT_MIN}%)`,
      suggested_fix:
        "Add a prominent 'Submit your server' CTA on server detail pages. Consider adding submission prompts after viewing multiple servers.",
      metric_value: viewToSubmitRate,
      threshold: THRESHOLDS.VIEW_TO_SUBMIT_MIN,
      created_at: now,
    });
  }

  // Check submit completion rate
  if (submitStarted > 5 && submitCompletionRate < 50) {
    insights.push({
      id: `low-submit-completion-${startDate.getTime()}`,
      category: "ux",
      severity: "high",
      title: "High form abandonment",
      description:
        "Users start the submission form but don't complete it. The form may be too long or confusing.",
      evidence: `Only ${submitCompletionRate.toFixed(1)}% of started submissions are completed`,
      suggested_fix:
        "Simplify the submission form. Add progress indicators. Consider breaking into steps or adding auto-save.",
      metric_value: submitCompletionRate,
      threshold: 50,
      created_at: now,
    });
  }

  return insights;
}

/**
 * Create empty response for when Supabase is not configured
 */
function createEmptyResponse(days: number): InsightsResponse {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days,
    },
    insights: [],
    summary: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    },
  };
}

// ISR with 5 minute revalidation
export const revalidate = 300;
