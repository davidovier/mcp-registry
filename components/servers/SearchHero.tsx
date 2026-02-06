"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";

interface SearchHeroProps {
  totalCount?: number;
}

export function SearchHero({ totalCount }: SearchHeroProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQ = searchParams.get("q") || "";

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const value = inputRef.current?.value.trim() || "";
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.delete("cursor");
      router.push(`/servers?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <section className="border-b border-border bg-surface-secondary">
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
              className="h-14 w-full rounded-xl border border-border bg-surface-primary pl-12 pr-4 text-body-lg text-content-primary transition-all placeholder:text-content-tertiary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </form>

        {totalCount !== undefined && (
          <p className="mt-4 text-center text-body-sm text-content-tertiary">
            {totalCount} {totalCount === 1 ? "server" : "servers"} available
          </p>
        )}
      </div>
    </section>
  );
}
