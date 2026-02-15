import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { McpServer } from "@/lib/supabase/types";

import { VerifiedBadge } from "./VerifiedBadge";

interface ServerCardProps {
  server: McpServer;
  highlightQuery?: string;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderHighlightedText(text: string, query?: string): React.ReactNode {
  const normalized = (query || "").trim();
  if (!normalized) return text;

  const terms = Array.from(
    new Set(
      normalized
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length >= 2)
    )
  );

  if (terms.length === 0) return text;
  const pattern = new RegExp(`(${terms.map(escapeRegex).join("|")})`, "gi");
  const segments = text.split(pattern);

  return segments.map((segment, index) => {
    const isMatch = terms.some(
      (term) => segment.toLowerCase() === term.toLowerCase()
    );
    if (!isMatch) return <span key={`${segment}-${index}`}>{segment}</span>;
    return (
      <mark
        key={`${segment}-${index}`}
        className="rounded bg-amber-100 px-0.5 text-content-primary dark:bg-amber-900/40"
      >
        {segment}
      </mark>
    );
  });
}

export function ServerCard({ server, highlightQuery }: ServerCardProps) {
  const safeName =
    typeof server.name === "string" && server.name.trim()
      ? server.name
      : "Unnamed server";
  const safeSlug =
    typeof server.slug === "string" && server.slug.trim()
      ? server.slug
      : "unknown";
  const safeDescription =
    typeof server.description === "string" && server.description.trim()
      ? server.description
      : "No description provided.";
  const safeTags = Array.isArray(server.tags) ? server.tags : [];
  const capabilities =
    server.capabilities && typeof server.capabilities === "object"
      ? (server.capabilities as Record<string, boolean>)
      : {};
  const capCount = Object.values(capabilities).filter(Boolean).length;
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(server.updated_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const recentlyUpdated =
    Number.isFinite(daysSinceUpdate) && daysSinceUpdate <= 30;

  return (
    <Card variant="interactive" padding="none" className="group">
      <Link href={`/servers/${safeSlug}`} className="block p-4">
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 text-heading-md font-semibold text-content-secondary dark:from-neutral-800 dark:to-neutral-700">
              {safeName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Card.Title className="truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {renderHighlightedText(safeName, highlightQuery)}
                </Card.Title>
                {server.verified && <VerifiedBadge />}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge
                  size="sm"
                  variant={server.verified ? "brand" : "warning"}
                >
                  {server.verified ? "Verified" : "Unverified"}
                </Badge>
                {server.docs_url && (
                  <Badge size="sm" variant="info">
                    Docs
                  </Badge>
                )}
                {recentlyUpdated && (
                  <Badge size="sm" variant="success">
                    Updated recently
                  </Badge>
                )}
              </div>
              <p className="truncate text-caption text-content-tertiary">
                {safeSlug}
              </p>
            </div>
          </div>
        </Card.Header>

        <Card.Description className="mt-3">
          {renderHighlightedText(safeDescription, highlightQuery)}
        </Card.Description>

        {safeTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {safeTags.slice(0, 3).map((tag) => (
              <Badge key={tag} size="sm" variant="default">
                {tag}
              </Badge>
            ))}
            {safeTags.length > 3 && (
              <Badge size="sm" variant="default">
                +{safeTags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-caption text-content-tertiary">
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {server.transport}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            {server.auth}
          </span>
          {capCount > 0 && (
            <span className="ml-auto flex items-center gap-1">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
              {capCount} {capCount === 1 ? "capability" : "capabilities"}
            </span>
          )}
        </div>
      </Link>
    </Card>
  );
}
