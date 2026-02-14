"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function ServerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Server detail page error:", error);
  }, [error]);

  return (
    <div>
      {/* Breadcrumb bar */}
      <div className="border-b border-border bg-surface-secondary">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={[{ label: "Servers", href: "/servers" }, { label: "Error" }]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="mb-1 text-heading-lg text-content-primary">
            Something went wrong
          </h1>
          <p className="mb-6 max-w-sm text-body-md text-content-secondary">
            We couldn&apos;t load this server. This might be a temporary issue.
          </p>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-primary px-6 py-2.5 text-body-md font-medium text-content-primary transition-all duration-150 hover:bg-surface-secondary active:scale-[0.98]"
            >
              Try again
            </button>
            <Link
              href="/servers"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-6 py-2.5 text-body-md font-medium text-white transition-all duration-150 hover:bg-brand-800 active:scale-[0.98] dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400"
            >
              Back to servers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
