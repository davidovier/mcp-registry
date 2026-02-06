"use client";

import { useCallback, useState } from "react";

interface InstallSnippetProps {
  name: string;
  transport: string;
}

export function InstallSnippet({ name, transport }: InstallSnippetProps) {
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
      // Fallback for older browsers
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
    <section>
      <h2 className="mb-3 text-heading-lg text-content-primary">
        Example configuration
      </h2>
      <div className="group relative">
        <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-mono-md text-neutral-100">
          <code>{config}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 rounded-md bg-neutral-800 p-2 text-neutral-400 opacity-0 transition-all hover:bg-neutral-700 hover:text-neutral-200 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 group-hover:opacity-100"
          aria-label={copied ? "Copied to clipboard" : "Copy configuration"}
        >
          {copied ? (
            <svg
              className="h-4 w-4 text-green-400"
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
          )}
        </button>
      </div>
      <p className="mt-2 text-body-sm text-content-tertiary">
        Add this to your MCP client configuration file. Adjust the{" "}
        <code className="rounded bg-surface-sunken px-1 py-0.5 text-mono-sm">
          {transport === "stdio" ? "command" : "url"}
        </code>{" "}
        to match your setup.
      </p>
    </section>
  );
}
