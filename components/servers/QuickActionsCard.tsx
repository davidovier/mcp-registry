"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface QuickActionsCardProps {
  name: string;
  transport: string;
  repoUrl: string | null;
}

export function QuickActionsCard({
  name,
  transport,
  repoUrl,
}: QuickActionsCardProps) {
  const [copied, setCopied] = useState(false);

  const config = JSON.stringify(
    {
      mcpServers: {
        [name.toLowerCase().replace(/\s+/g, "-")]: {
          ...(transport === "stdio"
            ? {
                command: `npx -y @mcp/${name.toLowerCase().replace(/\s+/g, "-")}`,
              }
            : {
                url: `https://mcp.example.com/${name.toLowerCase().replace(/\s+/g, "-")}/sse`,
              }),
        },
      },
    },
    null,
    2
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(config);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = config;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [config]);

  return (
    <Card padding="md">
      <h3 className="mb-3 text-heading-sm text-content-primary">
        Quick actions
      </h3>
      <div className="space-y-3">
        <Button
          className="w-full"
          variant="primary"
          onClick={handleCopy}
          icon={
            copied ? (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )
          }
        >
          {copied ? "Copied!" : "Copy config"}
        </Button>
        {repoUrl && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-body-md font-medium text-content-primary transition-all duration-150 hover:border-border-strong hover:bg-surface-sunken active:scale-[0.98]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            View source
          </a>
        )}
      </div>
    </Card>
  );
}
