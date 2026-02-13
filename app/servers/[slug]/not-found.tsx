import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function ServerNotFound() {
  return (
    <div>
      {/* Breadcrumb bar */}
      <div className="border-b border-border bg-surface-secondary">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Servers", href: "/servers" },
              { label: "Not Found" },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-content-tertiary">
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
                d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z"
              />
            </svg>
          </div>
          <h1 className="mb-1 text-heading-lg text-content-primary">
            Server Not Found
          </h1>
          <p className="mb-6 max-w-sm text-body-md text-content-secondary">
            The MCP server you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
          <Link
            href="/servers"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-700 px-6 py-2.5 text-body-md font-medium text-white transition-all duration-150 hover:bg-brand-800 active:scale-[0.98] dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400"
          >
            Back to servers
          </Link>
        </div>
      </div>
    </div>
  );
}
