"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

import { trackSearch } from "@/lib/analytics";

interface SearchHeroProps {
  totalCount?: number;
  resultsCount?: number;
}

export function SearchHero({ totalCount, resultsCount }: SearchHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQ = searchParams.get("q") || "";
  const hasQuery = currentQ.trim().length > 0;
  const primaryCtaHref = hasQuery
    ? `/servers?q=${encodeURIComponent(currentQ.trim())}&verified=true`
    : "/servers?verified=true";
  const primaryCtaLabel = hasQuery
    ? "View verified matches"
    : "Browse verified servers";
  const purposeLine = hasQuery
    ? `Search results for "${currentQ.trim()}" with trust signals and relevance-first ordering.`
    : "Find trustworthy MCP servers quickly with transparent verification context.";

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const value = inputRef.current?.value.trim() || "";
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
        // Track search event
        trackSearch(value, resultsCount ?? 0);
      } else {
        params.delete("q");
      }
      params.delete("cursor");
      router.push(`/servers?${params.toString()}`);
    },
    [router, searchParams, resultsCount]
  );

  return (
    <section className="bg-surface-secondary">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-2 text-center text-display-lg text-content-primary">
          MCP Server Registry
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-center text-body-lg text-content-secondary">
          Discover and integrate trusted Model Context Protocol servers into
          your applications.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-content-tertiary"
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
            <input
              ref={inputRef}
              type="search"
              name="q"
              defaultValue={currentQ}
              placeholder="Search servers by name or description..."
              aria-label="Search servers"
              className="h-14 w-full rounded-xl border border-border bg-surface-primary pl-12 pr-4 text-body-lg text-content-primary transition-all placeholder:text-content-tertiary focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(13,148,136,0.08)] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </form>

        <div className="mx-auto mt-5 max-w-2xl rounded-xl border border-border bg-surface-primary p-4 shadow-sm">
          <p className="text-body-sm text-content-secondary">{purposeLine}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={primaryCtaHref}
              data-primary-action="servers-hero-action"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-700 px-4 text-body-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400"
            >
              {primaryCtaLabel}
            </Link>
            <p className="text-caption text-content-tertiary">
              Verified listings are reviewed against public quality criteria.
            </p>
          </div>
        </div>

        {totalCount !== undefined && (
          <p className="mt-4 text-center text-body-sm text-content-tertiary">
            {totalCount} {totalCount === 1 ? "server" : "servers"} available
          </p>
        )}
      </div>
    </section>
  );
}
