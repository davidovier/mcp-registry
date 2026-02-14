import { Suspense } from "react";

import { FiltersSidebar } from "@/components/servers/FiltersSidebar";
import { MobileFilters } from "@/components/servers/MobileFilters";
import { SearchHero } from "@/components/servers/SearchHero";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  createCursorFromRow,
  decodeCursor,
  normalizeSort,
  PAGINATION,
  SortMode,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import type { McpAuth, McpTransport } from "@/lib/supabase/types";

import { ServerListClient } from "./server-list-client";

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
  const cursor = cursorParam ? decodeCursor(cursorParam, sort) : null;

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

  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
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
function applyCursorFilter(query: any, cursor: any, sort: SortMode) {
  switch (sort) {
    case "verified": {
      if (cursor.s !== "verified") return query;
      return query.or(
        `verified.lt.${cursor.v},` +
          `and(verified.eq.${cursor.v},created_at.lt.${cursor.c}),` +
          `and(verified.eq.${cursor.v},created_at.eq.${cursor.c},id.lt.${cursor.i})`
      );
    }
    case "newest": {
      if (cursor.s !== "newest") return query;
      return query.or(
        `created_at.lt.${cursor.c},` +
          `and(created_at.eq.${cursor.c},id.lt.${cursor.i})`
      );
    }
    case "name": {
      if (cursor.s !== "name") return query;
      return query.or(
        `name.gt.${cursor.n},` + `and(name.eq.${cursor.n},id.gt.${cursor.i})`
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
