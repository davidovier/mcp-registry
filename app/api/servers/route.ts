import { NextRequest, NextResponse } from "next/server";

import {
  createCursorFromRow,
  createRankedCursorFromRow,
  CursorData,
  decodeCursor,
  isRankedCursor,
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
 *   - q: Search query (uses full-text search with ranking when present)
 *   - transport: Filter by transport type (stdio, http, both)
 *   - auth: Filter by auth type (none, oauth, api_key, other)
 *   - verified: Filter by verified status (true/false)
 *   - tag: Filter by tag (can be specified multiple times)
 *   - sort: Sort mode (verified, newest, name) - default: verified
 *   - limit: Number of results (default 20, max 50)
 *   - cursor: Pagination cursor from previous response
 *
 * When q is present, results are ranked by relevance using Postgres FTS.
 * Ranking interacts with sort modes:
 *   - verified: verified DESC, rank DESC, created_at DESC, id DESC
 *   - newest: rank DESC, created_at DESC, id DESC
 *   - name: rank DESC, name ASC, id ASC
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

    // Decode cursor with sort mode validation and search mode awareness
    const hasSearchQuery = !!q;
    const cursor = cursorParam
      ? decodeCursor(cursorParam, sort, hasSearchQuery)
      : null;

    // Create Supabase client
    const supabase = await createClient();

    // Use FTS when search query is present
    if (q) {
      return handleSearchQuery(supabase, {
        q,
        transport,
        auth,
        verified,
        tags,
        limit,
        sort,
        cursor,
      });
    }

    // Non-search query: use standard PostgREST approach
    return handleStandardQuery(supabase, {
      transport,
      auth,
      verified,
      tags,
      limit,
      sort,
      cursor,
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
 * Handle search query using FTS RPC function
 */
async function handleSearchQuery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  params: {
    q: string;
    transport: string | null;
    auth: string | null;
    verified: boolean | null;
    tags: string[];
    limit: number;
    sort: SortMode;
    cursor: CursorData | null;
  }
) {
  const { q, transport, auth, verified, tags, limit, sort, cursor } = params;

  // Prepare cursor fields for the RPC call
  let cursorVerified: boolean | null = null;
  let cursorRank: number | null = null;
  let cursorCreatedAt: string | null = null;
  let cursorName: string | null = null;
  let cursorId: string | null = null;

  if (cursor && isRankedCursor(cursor)) {
    cursorId = cursor.i;
    cursorRank = cursor.r;

    switch (cursor.s) {
      case "verified":
        cursorVerified = cursor.v;
        cursorCreatedAt = cursor.c;
        break;
      case "newest":
        cursorCreatedAt = cursor.c;
        break;
      case "name":
        cursorName = cursor.n;
        break;
    }
  }

  // Validate transport and auth values
  const validTransport =
    transport && ["stdio", "http", "both"].includes(transport)
      ? transport
      : null;
  const validAuth =
    auth && ["none", "oauth", "api_key", "other"].includes(auth) ? auth : null;

  // Call the search_servers RPC function
  const { data, error } = await supabase.rpc("search_servers", {
    search_query: q,
    sort_mode: sort,
    transport_filter: validTransport,
    auth_filter: validAuth,
    verified_filter: verified,
    tag_filters: tags.length > 0 ? tags : null,
    result_limit: limit + 1,
    cursor_verified: cursorVerified,
    cursor_rank: cursorRank,
    cursor_created_at: cursorCreatedAt,
    cursor_name: cursorName,
    cursor_id: cursorId,
  });

  if (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search servers" },
      { status: 500 }
    );
  }

  // Determine if there's a next page
  const hasMore = data && data.length > limit;
  const servers = hasMore ? data.slice(0, limit) : data || [];

  // Create next cursor (ranked)
  let nextCursor: string | null = null;
  if (hasMore && servers.length > 0) {
    const lastRow = servers[servers.length - 1];
    nextCursor = createRankedCursorFromRow(lastRow, sort);
  }

  // Remove rank from response (internal field)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitizedServers = servers.map((s: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rank, ...rest } = s;
    return rest;
  });

  // Build response (no total for search queries - too expensive)
  const response: {
    data: typeof sanitizedServers;
    nextCursor: string | null;
  } = {
    data: sanitizedServers,
    nextCursor,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}

/**
 * Handle standard (non-search) query using PostgREST
 */
async function handleStandardQuery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  params: {
    transport: string | null;
    auth: string | null;
    verified: boolean | null;
    tags: string[];
    limit: number;
    sort: SortMode;
    cursor: CursorData | null;
  }
) {
  const { transport, auth, verified, tags, limit, sort, cursor } = params;

  // Build query with sort-specific ordering
  let query = supabase
    .from("mcp_servers")
    .select("*", { count: cursor ? undefined : "exact" })
    .limit(limit + 1);

  // Apply sort-specific ordering
  query = applySortOrder(query, sort);

  // Apply cursor (keyset pagination)
  if (cursor) {
    query = applyCursorFilter(query, cursor, sort);
  }

  // Apply filters
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
      if (!("v" in cursor)) return query;
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
      if (!("n" in cursor)) return query;
      return query.or(
        `name.gt.${cursor.n},` + `and(name.eq.${cursor.n},id.gt.${cursor.i})`
      );
    }
  }
}
