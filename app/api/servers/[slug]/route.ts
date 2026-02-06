import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/servers/[slug]
 *
 * Public API endpoint for fetching a single MCP server by slug.
 *
 * Response:
 *   - 200: Server object
 *   - 404: Server not found
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validate slug format
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        { error: "Invalid slug format" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Fetch server by slug
    const { data, error } = await supabase
      .from("mcp_servers")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return NextResponse.json(
          { error: "Server not found" },
          { status: 404 }
        );
      }
      console.error("API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch server" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    // Return with cache headers (5 minutes for public data)
    const res = NextResponse.json(data);
    res.headers.set(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=60"
    );
    return res;
  } catch (error) {
    console.error("Unexpected API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
