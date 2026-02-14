import { NextRequest, NextResponse } from "next/server";

import {
  createCursorFromRow,
  CursorData,
  decodeCursor,
  normalizeLimit,
  normalizeSort,
  SortMode,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

// Route segment config - ISR with 5 minute revalidation
// Note: Vercel edge caches responses (x-vercel-cache: HIT) even though
// Cache-Control header is normalized by Next.js App Router
export const revalidate = 300;

/**
 * GET /api/servers
 *
 * Public API endpoint for listing MCP servers with pagination and filters.
 *
 * Query parameters:
 *   - q: Search query (searches name and description)
 *   - transport: Filter by transport type (stdio, http, both)
 *   - auth: Filter by auth type (none, oauth, api_key, other)
 *   - verified: Filter by verified status (true/false)
 *   - tag: Filter by tag (can be specified multiple times)
 *   - sort: Sort mode (verified, newest, name) - default: verified
 *   - limit: Number of results (default 20, max 50)
 *   - cursor: Pagination cursor from previous response
 *
 * Response:
 *   {
 *     data: [...servers],
 *     nextCursor: string | null,
 *     total?: number (only on first page without cursor)
 *   }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const q = searchParams.get("q")?.trim() || null;
    const transport = searchParams.get("transport");
    const auth = searchParams.get("auth");
    const verifiedParam = searchParams.get("verified");
    const tags = searchParams.getAll("tag").filter(Boolean);
    const limit = normalizeLimit(searchParams.get("limit"));
    const sort = normalizeSort(searchParams.get("sort"));
    const cursorParam = searchParams.get("cursor");

    // Parse verified filter
    let verified: boolean | null = null;
    if (verifiedParam === "true") verified = true;
    if (verifiedParam === "false") verified = false;

    // Decode cursor with sort mode validation
    const cursor = cursorParam ? decodeCursor(cursorParam, sort) : null;

    // Create Supabase client
    const supabase = await createClient();

    // Build query with sort-specific ordering
    let query = supabase
      .from("mcp_servers")
      .select("*", { count: cursor ? undefined : "exact" })
      .limit(limit + 1); // Fetch one extra to determine if there's a next page

    // Apply sort-specific ordering
    query = applySortOrder(query, sort);

    // Apply cursor (keyset pagination)
    if (cursor) {
      query = applyCursorFilter(query, cursor, sort);
    }

    // Apply filters
    if (q) {
      // Use ilike for simple search (could use full-text search for better performance)
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (transport && ["stdio", "http", "both"].includes(transport)) {
      query = query.eq("transport", transport);
    }

    if (auth && ["none", "oauth", "api_key", "other"].includes(auth)) {
      query = query.eq("auth", auth);
    }

    if (verified !== null) {
      query = query.eq("verified", verified);
    }

    if (tags.length > 0) {
      // Filter by tags (contains any of the specified tags)
      query = query.contains("tags", tags);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("API error:", error);
      return NextResponse.json(
        { error: "Failed to fetch servers" },
        { status: 500 }
      );
    }

    // Determine if there's a next page
    const hasMore = data && data.length > limit;
    const servers = hasMore ? data.slice(0, limit) : data || [];

    // Create next cursor
    let nextCursor: string | null = null;
    if (hasMore && servers.length > 0) {
      const lastRow = servers[servers.length - 1];
      nextCursor = createCursorFromRow(lastRow, sort);
    }

    // Build response
    const response: {
      data: typeof servers;
      nextCursor: string | null;
      total?: number;
    } = {
      data: servers,
      nextCursor,
    };

    // Include total count on first page only
    if (!cursor && count !== null) {
      response.total = count;
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Unexpected API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Apply sort-specific ORDER BY clauses
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySortOrder(query: any, sort: SortMode) {
  switch (sort) {
    case "verified":
      // verified DESC, created_at DESC, id DESC
      return query
        .order("verified", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
    case "newest":
      // created_at DESC, id DESC
      return query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
    case "name":
      // name ASC, id ASC
      return query
        .order("name", { ascending: true })
        .order("id", { ascending: true });
  }
}

/**
 * Apply cursor filter for keyset pagination based on sort mode
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyCursorFilter(query: any, cursor: CursorData, sort: SortMode) {
  switch (sort) {
    case "verified": {
      // For verified DESC, created_at DESC, id DESC
      // We want rows that come AFTER the cursor (smaller values for DESC)
      if (cursor.s !== "verified") return query;
      return query.or(
        `verified.lt.${cursor.v},` +
          `and(verified.eq.${cursor.v},created_at.lt.${cursor.c}),` +
          `and(verified.eq.${cursor.v},created_at.eq.${cursor.c},id.lt.${cursor.i})`
      );
    }
    case "newest": {
      // For created_at DESC, id DESC
      if (cursor.s !== "newest") return query;
      return query.or(
        `created_at.lt.${cursor.c},` +
          `and(created_at.eq.${cursor.c},id.lt.${cursor.i})`
      );
    }
    case "name": {
      // For name ASC, id ASC (ascending, so we want GREATER values)
      if (cursor.s !== "name") return query;
      return query.or(
        `name.gt.${cursor.n},` + `and(name.eq.${cursor.n},id.gt.${cursor.i})`
      );
    }
  }
}
