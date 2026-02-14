"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

import type { SearchMode, Suggestion } from "@/app/api/servers/route";
import { FilterChip } from "@/components/servers/FilterChip";
import { ServerCard } from "@/components/servers/ServerCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { SORT_OPTIONS, SortMode } from "@/lib/pagination";
import type { McpServer } from "@/lib/supabase/types";

interface ServerListClientProps {
  initialServers: McpServer[];
  initialNextCursor: string | null;
  initialTotal?: number;
  initialSuggestion?: Suggestion | null;
  initialSearchMode?: SearchMode;
  filters: {
    q?: string;
    transport?: string;
    auth?: string;
    verified?: string;
  };
  sort: SortMode;
}

export function ServerListClient({
  initialServers,
  initialNextCursor,
  initialTotal,
  initialSuggestion,
  initialSearchMode,
  filters,
  sort,
}: ServerListClientProps) {
  const [servers, setServers] = useState(initialServers);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<SearchMode | undefined>(
    initialSearchMode
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFilters: { key: string; label: string }[] = [];
  if (filters.transport)
    activeFilters.push({ key: "transport", label: filters.transport });
  if (filters.auth) activeFilters.push({ key: "auth", label: filters.auth });
  if (filters.verified === "true")
    activeFilters.push({ key: "verified", label: "Verified" });
  if (filters.q) activeFilters.push({ key: "q", label: `"${filters.q}"` });

  const removeFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      params.delete("cursor");
      router.push(`/servers?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    router.push("/servers");
  }, [router]);

  const handleSuggestionClick = useCallback(
    (suggestion: Suggestion) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", suggestion.name);
      params.delete("cursor");
      router.push(`/servers?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSort = e.target.value as SortMode;
      const params = new URLSearchParams(searchParams.toString());

      // Update sort param (remove if default)
      if (newSort === "verified") {
        params.delete("sort");
      } else {
        params.set("sort", newSort);
      }

      // Always reset cursor when sort changes
      params.delete("cursor");

      router.push(`/servers?${params.toString()}`);
    },
    [router, searchParams]
  );

  const loadMore = () => {
    if (!nextCursor || isPending) return;

    startTransition(async () => {
      try {
        const params = new URLSearchParams();
        params.set("cursor", nextCursor);
        params.set("limit", "20");
        if (filters.q) params.set("q", filters.q);
        if (filters.transport) params.set("transport", filters.transport);
        if (filters.auth) params.set("auth", filters.auth);
        if (filters.verified === "true") params.set("verified", "true");
        // Include sort in pagination request
        if (sort !== "verified") params.set("sort", sort);

        const response = await fetch(`/api/servers?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to load more servers");
        }

        const data = await response.json();

        setServers((prev) => [...prev, ...data.data]);
        setNextCursor(data.nextCursor);
        setSearchMode(data.searchMode);
        setError(null);

        // Update URL with new cursor for shareability
        const urlParams = new URLSearchParams(searchParams.toString());
        urlParams.set("cursor", nextCursor);
        window.history.replaceState(
          null,
          "",
          `/servers?${urlParams.toString()}`
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load more");
      }
    });
  };

  if (servers.length === 0) {
    const hasQuery = !!filters.q;
    const description = hasQuery
      ? `No servers match "${filters.q}". Try clearing filters or searching by a different term.`
      : "Try adjusting your filters or search terms to find what you're looking for.";

    return (
      <div>
        <HeaderBar
          filters={activeFilters}
          sort={sort}
          searchMode={searchMode}
          hasQuery={hasQuery}
          onSortChange={handleSortChange}
          onRemoveFilter={removeFilter}
        />

        {/* Suggestion banner */}
        {hasQuery && initialSuggestion && (
          <div className="mb-4">
            <Alert variant="info">
              No results for &ldquo;{filters.q}&rdquo;. Did you mean{" "}
              <button
                onClick={() => handleSuggestionClick(initialSuggestion)}
                className="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                {initialSuggestion.name}
              </button>
              ?
            </Alert>
          </div>
        )}

        <EmptyState
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
          title="No servers found"
          description={description}
          action={
            activeFilters.length > 0
              ? { label: "Clear filters", onClick: clearAllFilters }
              : undefined
          }
          className="rounded-xl border border-border"
        />

        {/* Additional actions */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/submit"
            className="text-body-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Submit a server
          </Link>
          {activeFilters.length > 0 && (
            <Link
              href="/servers"
              className="text-body-sm font-medium text-content-secondary hover:text-content-primary"
            >
              Browse all servers
            </Link>
          )}
        </div>
      </div>
    );
  }

  const hasQuery = !!filters.q;

  return (
    <div>
      <HeaderBar
        filters={activeFilters}
        totalCount={initialTotal}
        shownCount={servers.length}
        sort={sort}
        searchMode={searchMode}
        hasQuery={hasQuery}
        onSortChange={handleSortChange}
        onRemoveFilter={removeFilter}
      />

      {/* Suggestion banner for sparse results */}
      {hasQuery && initialSuggestion && servers.length < 3 && (
        <div className="mb-4">
          <Alert variant="info">
            Few results for &ldquo;{filters.q}&rdquo;. Did you mean{" "}
            <button
              onClick={() => handleSuggestionClick(initialSuggestion)}
              className="font-medium text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
            >
              {initialSuggestion.name}
            </button>
            ?
          </Alert>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-body-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {nextCursor && (
        <div className="mt-8 flex justify-center border-t border-border pt-8">
          <Button
            variant="secondary"
            onClick={loadMore}
            loading={isPending}
            size="md"
          >
            Load more servers
          </Button>
        </div>
      )}
    </div>
  );
}

function HeaderBar({
  filters,
  totalCount,
  shownCount,
  sort,
  searchMode,
  hasQuery,
  onSortChange,
  onRemoveFilter,
}: {
  filters: { key: string; label: string }[];
  totalCount?: number;
  shownCount?: number;
  sort: SortMode;
  searchMode?: SearchMode;
  hasQuery?: boolean;
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onRemoveFilter: (key: string) => void;
}) {
  let countLabel: string | null = null;
  if (totalCount !== undefined) {
    if (shownCount !== undefined && shownCount < totalCount) {
      countLabel = `Showing ${shownCount} of ${totalCount} servers`;
    } else {
      countLabel = `${totalCount} ${totalCount === 1 ? "server" : "servers"}`;
    }
  } else if (shownCount !== undefined) {
    countLabel = `Showing ${shownCount} ${shownCount === 1 ? "server" : "servers"}`;
  }

  // Search transparency indicator
  let searchIndicator: string | null = null;
  if (hasQuery && searchMode) {
    if (searchMode === "fts") {
      searchIndicator = "Ranked by relevance";
    } else if (searchMode === "fallback_trgm") {
      searchIndicator = "Showing closest matches";
    }
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Results count and sort control */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          {countLabel && (
            <span className="text-body-sm text-content-tertiary">
              {countLabel}
            </span>
          )}
          {searchIndicator && (
            <span className="text-caption text-content-tertiary">
              {searchIndicator}
            </span>
          )}
        </div>
        {!countLabel && !searchIndicator && <div />}

        <div className="w-full sm:w-auto">
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onChange={onSortChange}
            aria-label="Sort servers"
            className="text-body-sm"
          />
        </div>
      </div>

      {/* Active filter chips */}
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              onRemove={() => onRemoveFilter(filter.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
