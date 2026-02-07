import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { McpServer } from "@/lib/supabase/types";

import { VerifiedBadge } from "./VerifiedBadge";

interface ServerCardProps {
  server: McpServer;
}

export function ServerCard({ server }: ServerCardProps) {
  const capabilities = server.capabilities as Record<string, boolean>;
  const capCount = Object.values(capabilities).filter(Boolean).length;

  return (
    <Card variant="interactive" padding="none" className="group">
      <Link href={`/servers/${server.slug}`} className="block p-4">
        <Card.Header>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 text-heading-md font-semibold text-content-secondary dark:from-neutral-800 dark:to-neutral-700">
              {server.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Card.Title className="truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  {server.name}
                </Card.Title>
                {server.verified && <VerifiedBadge />}
              </div>
              <p className="truncate text-caption text-content-tertiary">
                {server.slug}
              </p>
            </div>
          </div>
        </Card.Header>

        <Card.Description className="mt-3">
          {server.description}
        </Card.Description>

        {server.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {server.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} size="sm" variant="default">
                {tag}
              </Badge>
            ))}
            {server.tags.length > 3 && (
              <Badge size="sm" variant="default">
                +{server.tags.length - 3}
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
