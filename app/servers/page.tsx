import Link from "next/link";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import type { McpServer, McpTransport, McpAuth } from "@/lib/supabase/types";

interface SearchParams {
  q?: string;
  transport?: McpTransport;
  auth?: McpAuth;
  verified?: string;
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Browse MCP Servers
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover Model Context Protocol servers for your AI applications.
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        currentQ={params.q}
        currentTransport={params.transport}
        currentAuth={params.auth}
        currentVerified={params.verified}
      />

      {/* Server List */}
      <Suspense fallback={<ServerListSkeleton />}>
        <ServerList
          q={params.q}
          transport={params.transport}
          auth={params.auth}
          verified={params.verified === "true"}
        />
      </Suspense>
    </div>
  );
}

function FilterBar({
  currentQ,
  currentTransport,
  currentAuth,
  currentVerified,
}: {
  currentQ?: string;
  currentTransport?: string;
  currentAuth?: string;
  currentVerified?: string;
}) {
  return (
    <form className="mb-8 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="min-w-[200px] flex-1">
          <label
            htmlFor="q"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Search
          </label>
          <input
            type="text"
            id="q"
            name="q"
            defaultValue={currentQ}
            placeholder="Search servers..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Transport filter */}
        <div className="w-40">
          <label
            htmlFor="transport"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Transport
          </label>
          <select
            id="transport"
            name="transport"
            defaultValue={currentTransport}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All</option>
            <option value="stdio">stdio</option>
            <option value="http">http</option>
            <option value="both">both</option>
          </select>
        </div>

        {/* Auth filter */}
        <div className="w-40">
          <label
            htmlFor="auth"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Auth
          </label>
          <select
            id="auth"
            name="auth"
            defaultValue={currentAuth}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All</option>
            <option value="none">none</option>
            <option value="oauth">oauth</option>
            <option value="api_key">api_key</option>
            <option value="other">other</option>
          </select>
        </div>

        {/* Verified filter */}
        <div className="flex items-end">
          <label className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700">
            <input
              type="checkbox"
              name="verified"
              value="true"
              defaultChecked={currentVerified === "true"}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Verified only
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Apply Filters
        </button>
        <Link
          href="/servers"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}

async function ServerList({
  q,
  transport,
  auth,
  verified,
}: {
  q?: string;
  transport?: McpTransport;
  auth?: McpAuth;
  verified?: boolean;
}) {
  const supabase = await createClient();

  let query = supabase
    .from("mcp_servers")
    .select("*")
    .order("verified", { ascending: false })
    .order("created_at", { ascending: false });

  // Apply search filter (case-insensitive search in name and description)
  if (q) {
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  // Apply transport filter
  if (transport) {
    query = query.eq("transport", transport);
  }

  // Apply auth filter
  if (auth) {
    query = query.eq("auth", auth);
  }

  // Apply verified filter
  if (verified) {
    query = query.eq("verified", true);
  }

  const { data: servers, error } = await query;

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        Failed to load servers. Please try again later.
      </div>
    );
  }

  if (!servers || servers.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-gray-600 dark:text-gray-400">
          No servers found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {servers.map((server) => (
        <ServerCard key={server.id} server={server} />
      ))}
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
        <h2 className="font-semibold text-gray-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
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

function ServerListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mb-3 h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mb-4 space-y-2">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="flex gap-2">
            <div className="h-5 w-12 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-5 w-12 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
