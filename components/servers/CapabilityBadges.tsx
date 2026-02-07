import { Card } from "@/components/ui/Card";
import type { McpCapabilities } from "@/lib/supabase/types";

const capabilities = [
  {
    key: "tools" as const,
    label: "Tools",
    description: "Executable tools",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11.42 15.17l-5.1-5.1a2.25 2.25 0 113.18-3.18l5.1 5.1m-6.36 6.36l6.36-6.36m-6.36 6.36a2.25 2.25 0 003.18 0l6.36-6.36a2.25 2.25 0 000-3.18L14.83 2.73a2.25 2.25 0 00-3.18 0L5.29 9.09a2.25 2.25 0 000 3.18l6.13 6.13z"
        />
      </svg>
    ),
  },
  {
    key: "resources" as const,
    label: "Resources",
    description: "Data resources",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.06-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
        />
      </svg>
    ),
  },
  {
    key: "prompts" as const,
    label: "Prompts",
    description: "Prompt templates",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
        />
      </svg>
    ),
  },
];

interface CapabilityBadgesProps {
  data: McpCapabilities;
}

export function CapabilityBadges({ data }: CapabilityBadgesProps) {
  return (
    <section>
      <h2 className="mb-3 text-heading-lg text-content-primary">
        Capabilities
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {capabilities.map((cap) => {
          const enabled = data[cap.key];
          return (
            <Card key={cap.key} padding="sm">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                    enabled
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                      : "bg-surface-sunken text-content-tertiary"
                  }`}
                >
                  {cap.icon}
                </div>
                <div>
                  <p className="text-body-sm font-medium text-content-primary">
                    {cap.label}
                  </p>
                  <p className="text-caption text-content-tertiary">
                    {enabled ? cap.description : "Not available"}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
