import { Suspense } from "react";

import type { SearchMode, Suggestion } from "@/app/api/servers/route";
import { FiltersSidebar } from "@/components/servers/FiltersSidebar";
import { MobileFilters } from "@/components/servers/MobileFilters";
import { SearchHero } from "@/components/servers/SearchHero";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  createCursorFromRow,
  createRankedCursorFromRow,
  CursorData,
  decodeCursor,
  isRankedCursor,
  normalizeSort,
  PAGINATION,
  SortMode,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import type { McpAuth, McpTransport } from "@/lib/supabase/types";

import { ServerListClient } from "./server-list-client";

const PUBLIC_SERVER_COLUMNS =
  "id,slug,name,description,homepage_url,repo_url,docs_url,tags,transport,auth,capabilities,verified,verified_at,created_at,updated_at";

function quotePostgrestLiteral(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

interface SearchParams {
  q?: string;
  transport?: McpTransport;
  auth?: McpAuth;
  verified?: string;
  cursor?: string;
  sort?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export const metadata = {
  title: "Browse MCP Servers",
  description: "Discover and explore Model Context Protocol servers.",
};

export default async function ServersPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-surface-primary">
      <SearchHero />

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop sidebar */}
          <FiltersSidebar className="hidden lg:block" />

          {/* Results area */}
          <div className="flex-1">
            {/* Mobile filter trigger */}
            <div className="mb-4 lg:hidden">
              <MobileFilters />
            </div>

            <Suspense fallback={<ServerGridSkeleton />}>
              <ServerList
                q={params.q}
                transport={params.transport}
                auth={params.auth}
                verified={params.verified}
                cursor={params.cursor}
                sort={params.sort}
              />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}

async function ServerList({
  q,
  transport,
  auth,
  verified,
  cursor: cursorParam,
  sort: sortParam,
}: {
  q?: string;
  transport?: McpTransport;
  auth?: McpAuth;
  verified?: string;
  cursor?: string;
  sort?: string;
}) {
  const supabase = await createClient();
  const limit = PAGINATION.DEFAULT_LIMIT;
  const sort = normalizeSort(sortParam);
  const searchQuery = q?.trim() || null;
  const hasSearchQuery = !!searchQuery;
  const cursor = cursorParam
    ? decodeCursor(cursorParam, sort, hasSearchQuery)
    : null;

  // Use FTS when search query is present
  if (searchQuery) {
    return handleSearchQuery(supabase, {
      q: searchQuery,
      transport,
      auth,
      verified,
      limit,
      sort,
      cursor,
    });
  }

  // Standard query without search
  return handleStandardQuery(supabase, {
    q,
    transport,
    auth,
    verified,
    limit,
    sort,
    cursor,
  });
}

/**
 * Fetch suggestions using trigram similarity
 */
async function fetchSuggestion(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  query: string
): Promise<Suggestion | null> {
  try {
    const { data, error } = await supabase.rpc("suggest_servers", {
      p_query: query,
      p_limit: 1,
    });

    if (error || !data || data.length === 0) {
      return null;
    }

    return {
      name: data[0].name,
      slug: data[0].slug,
    };
  } catch {
    return null;
  }
}

/**
 * Handle search query using FTS RPC function with suggestions
 */
async function handleSearchQuery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  params: {
    q: string;
    transport?: McpTransport;
    auth?: McpAuth;
    verified?: string;
    limit: number;
    sort: SortMode;
    cursor: CursorData | null;
  }
) {
  const { q, transport, auth, verified, limit, sort, cursor } = params;

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
  const verifiedFilter = verified === "true" ? true : null;

  // Call the search_servers RPC function
  const { data, error } = await supabase.rpc("search_servers", {
    search_query: q,
    sort_mode: sort,
    transport_filter: validTransport,
    auth_filter: validAuth,
    verified_filter: verifiedFilter,
    tag_filters: null,
    result_limit: limit + 1,
    cursor_verified: cursorVerified,
    cursor_rank: cursorRank,
    cursor_created_at: cursorCreatedAt,
    cursor_name: cursorName,
    cursor_id: cursorId,
  });

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-body-md text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        <p className="font-medium">Failed to load servers</p>
        <p className="mt-1 text-body-sm">
          Please try refreshing the page or clearing your filters.
        </p>
      </div>
    );
  }

  const hasMore = data && data.length > limit;
  let servers = hasMore ? data.slice(0, limit) : data || [];
  let searchMode: SearchMode = "fts";
  let suggestion: Suggestion | null = null;

  // Fetch suggestion if results are sparse or empty (only on first page)
  const shouldFetchSuggestion = !cursor && servers.length < 3;

  if (shouldFetchSuggestion) {
    suggestion = await fetchSuggestion(supabase, q);
  }

  // If we have 1-2 results and no cursor, try to augment with fallback
  if (!cursor && servers.length > 0 && servers.length < 3) {
    const existingIds = new Set(servers.map((s: { id: string }) => s.id));
    const needed = limit - servers.length;

    // Query additional servers using text search fallback
    const { data: fallbackData } = await supabase
      .from("mcp_servers")
      .select(PUBLIC_SERVER_COLUMNS)
      .textSearch("name", q.split(/\s+/).join(" | "), { type: "websearch" })
      .limit(needed + 5);

    if (fallbackData && fallbackData.length > 0) {
      const newServers = fallbackData
        .filter((s: { id: string }) => !existingIds.has(s.id))
        .slice(0, needed)
        .map((s: Record<string, unknown>) => ({ ...s, rank: 0 }));

      if (newServers.length > 0) {
        servers = [...servers, ...newServers];
        searchMode = "fallback_trgm";
      }
    }
  }

  // If no results, searchMode should be "none" (no ranking to show)
  if (servers.length === 0) {
    searchMode = "none";
  }

  // Only include suggestion if it differs from top result (avoid redundancy)
  if (suggestion && servers.length > 0) {
    const topResult = servers[0] as { slug?: string; name?: string };
    if (
      topResult.slug === suggestion.slug ||
      topResult.name === suggestion.name
    ) {
      suggestion = null;
    }
  }

  // Create next cursor (ranked) - only if not in fallback mode
  let nextCursor: string | null = null;
  if (hasMore && servers.length > 0 && searchMode === "fts") {
    const lastRow = servers[servers.length - 1];
    nextCursor = createRankedCursorFromRow(lastRow, sort);
  }

  // Remove rank from servers (internal field)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sanitizedServers = servers.map((s: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rank, owner_id, ...rest } = s;
    return rest;
  });

  return (
    <ServerListClient
      initialServers={sanitizedServers}
      initialNextCursor={nextCursor}
      initialTotal={undefined}
      initialSuggestion={suggestion}
      initialSearchMode={searchMode}
      filters={{ q, transport, auth, verified }}
      sort={sort}
    />
  );
}

/**
 * Handle standard (non-search) query using PostgREST
 */
async function handleStandardQuery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  params: {
    q?: string;
    transport?: McpTransport;
    auth?: McpAuth;
    verified?: string;
    limit: number;
    sort: SortMode;
    cursor: CursorData | null;
  }
) {
  const { q, transport, auth, verified, limit, sort, cursor } = params;

  let query = supabase
    .from("mcp_servers")
    .select(PUBLIC_SERVER_COLUMNS, { count: cursor ? undefined : "exact" })
    .limit(limit + 1);

  // Apply sort-specific ordering
  query = applySortOrder(query, sort);

  // Apply cursor (keyset pagination)
  if (cursor) {
    query = applyCursorFilter(query, cursor, sort);
  }

  if (transport) {
    query = query.eq("transport", transport);
  }

  if (auth) {
    query = query.eq("auth", auth);
  }

  if (verified === "true") {
    query = query.eq("verified", true);
  }

  const { data, error, count } = await query;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-body-md text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        <p className="font-medium">Failed to load servers</p>
        <p className="mt-1 text-body-sm">
          Please try refreshing the page or clearing your filters.
        </p>
      </div>
    );
  }

  const hasMore = data && data.length > limit;
  const servers = hasMore ? data.slice(0, limit) : data || [];

  let nextCursor: string | null = null;
  if (hasMore && servers.length > 0) {
    const lastRow = servers[servers.length - 1];
    nextCursor = createCursorFromRow(lastRow, sort);
  }

  return (
    <ServerListClient
      initialServers={servers}
      initialNextCursor={nextCursor}
      initialTotal={count ?? undefined}
      initialSearchMode="none"
      filters={{ q, transport, auth, verified }}
      sort={sort}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applySortOrder(query: any, sort: SortMode) {
  switch (sort) {
    case "verified":
      return query
        .order("verified", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
    case "newest":
      return query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
    case "name":
      return query
        .order("name", { ascending: true })
        .order("id", { ascending: true });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyCursorFilter(query: any, cursor: CursorData, sort: SortMode) {
  switch (sort) {
    case "verified": {
      if (cursor.s !== "verified") return query;
      if (!("v" in cursor)) return query;
      return query.or(
        `verified.lt.${cursor.v},` +
          `and(verified.eq.${cursor.v},created_at.lt.${quotePostgrestLiteral(cursor.c)}),` +
          `and(verified.eq.${cursor.v},created_at.eq.${quotePostgrestLiteral(cursor.c)},id.lt.${cursor.i})`
      );
    }
    case "newest": {
      if (cursor.s !== "newest") return query;
      return query.or(
        `created_at.lt.${quotePostgrestLiteral(cursor.c)},` +
          `and(created_at.eq.${quotePostgrestLiteral(cursor.c)},id.lt.${cursor.i})`
      );
    }
    case "name": {
      if (cursor.s !== "name") return query;
      if (!("n" in cursor)) return query;
      return query.or(
        `name.gt.${quotePostgrestLiteral(cursor.n)},` +
          `and(name.eq.${quotePostgrestLiteral(cursor.n)},id.gt.${cursor.i})`
      );
    }
  }
}

function ServerGridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton.Card key={i} />
        ))}
      </div>
    </div>
  );
}
