"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import type { McpServer } from "@/lib/supabase/types";

interface ServerListClientProps {
  initialServers: McpServer[];
  initialNextCursor: string | null;
  initialTotal?: number;
  filters: {
    q?: string;
    transport?: string;
    auth?: string;
    verified?: string;
  };
}

export function ServerListClient({
  initialServers,
  initialNextCursor,
  initialTotal,
  filters,
}: ServerListClientProps) {
  const [servers, setServers] = useState(initialServers);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const loadMore = () => {
    if (!nextCursor || isPending) return;

    startTransition(async () => {
      try {
        // Build query string
        const params = new URLSearchParams();
        params.set("cursor", nextCursor);
        params.set("limit", "20");
        if (filters.q) params.set("q", filters.q);
        if (filters.transport) params.set("transport", filters.transport);
        if (filters.auth) params.set("auth", filters.auth);
        if (filters.verified === "true") params.set("verified", "true");

        const response = await fetch(`/api/servers?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to load more servers");
        }

        const data = await response.json();

        setServers((prev) => [...prev, ...data.data]);
        setNextCursor(data.nextCursor);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load more");
      }
    });
  };

  if (servers.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-gray-600 dark:text-gray-400">
          No servers found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      {initialTotal !== undefined && (
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {servers.length} of {initialTotal} servers
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {nextCursor && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 rounded-md px-6 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50"
          >
            {isPending ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

function ServerCard({ server }: { server: McpServer }) {
  const capabilities = server.capabilities as Record<string, boolean>;

  return (
    <Link
      href={`/servers/${server.slug}`}
      className="group block rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="mb-3 flex items-start justify-between">
        <h2 className="group-hover:text-primary-600 dark:group-hover:text-primary-400 font-semibold text-gray-900 dark:text-white">
          {server.name}
        </h2>
        {server.verified && (
          <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            ✓ Verified
          </span>
        )}
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
        {server.description}
      </p>

      <div className="mb-3 flex flex-wrap gap-1">
        {server.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          >
            {tag}
          </span>
        ))}
        {server.tags.length > 4 && (
          <span className="text-xs text-gray-500">
            +{server.tags.length - 4}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
        <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
          {server.transport}
        </span>
        <span className="rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-700">
          {server.auth}
        </span>
        {capabilities.tools && <span title="Provides tools">🔧</span>}
        {capabilities.resources && <span title="Provides resources">📁</span>}
        {capabilities.prompts && <span title="Provides prompts">💬</span>}
      </div>
    </Link>
  );
}
