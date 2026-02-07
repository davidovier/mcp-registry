"use client";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface SubmitPreviewProps {
  name: string;
  slug: string;
  description: string;
  tags: string[];
  transport: string;
  auth: string;
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
  };
  className?: string;
}

export function SubmitPreview({
  name,
  slug,
  description,
  tags,
  transport,
  auth,
  capabilities,
  className,
}: SubmitPreviewProps) {
  const capCount = Object.values(capabilities).filter(Boolean).length;
  const hasName = name.trim().length > 0;
  const hasSlug = slug.trim().length > 0;
  const hasDescription = description.trim().length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-caption font-medium uppercase tracking-wide text-content-tertiary">
          Preview
        </h3>
        <span className="text-caption text-content-tertiary">
          How your server will appear
        </span>
      </div>

      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="p-4">
          <Card.Header>
            <div className="flex items-center gap-3">
              {/* Avatar with first letter */}
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-heading-md font-semibold",
                  hasName
                    ? "bg-gradient-to-br from-brand-100 to-brand-200 text-brand-600 dark:from-brand-900 dark:to-brand-800 dark:text-brand-400"
                    : "bg-surface-sunken text-content-tertiary"
                )}
              >
                {hasName ? name.charAt(0).toUpperCase() : "?"}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Card.Title
                    className={cn(
                      "truncate",
                      !hasName && "italic text-content-tertiary"
                    )}
                  >
                    {hasName ? name : "Server name"}
                  </Card.Title>
                  {/* Note: verified badge intentionally NOT shown - new submissions aren't verified */}
                </div>
                <p
                  className={cn(
                    "truncate text-caption",
                    hasSlug
                      ? "text-content-tertiary"
                      : "text-content-tertiary/60 italic"
                  )}
                >
                  {hasSlug ? slug : "server-slug"}
                </p>
              </div>
            </div>
          </Card.Header>

          <Card.Description
            className={cn(
              "mt-3",
              !hasDescription && "text-content-tertiary/60 italic"
            )}
          >
            {hasDescription
              ? description
              : "Describe what your server does and who it's for..."}
          </Card.Description>

          {/* Tags */}
          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} size="sm" variant="default">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge size="sm" variant="default">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          ) : (
            <div className="mt-3 flex gap-1.5">
              <span className="text-content-tertiary/60 inline-flex items-center rounded-full bg-surface-sunken px-2 py-0.5 text-caption italic">
                No tags added
              </span>
            </div>
          )}

          {/* Footer with transport/auth/capabilities */}
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
              <span className={cn(!transport && "italic opacity-60")}>
                {transport || "transport"}
              </span>
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
              <span className={cn(!auth && "italic opacity-60")}>
                {auth || "auth"}
              </span>
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
        </div>

        {/* URL path preview */}
        {hasSlug && (
          <div className="border-t border-border bg-surface-sunken px-4 py-2">
            <p className="font-mono text-mono-sm text-content-tertiary">
              /servers/
              <span className="text-brand-600 dark:text-brand-400">{slug}</span>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
