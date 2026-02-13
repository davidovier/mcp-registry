import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Changelog — MCP Registry",
  description:
    "A record of updates, infrastructure improvements, and governance changes to the MCP Registry.",
  openGraph: {
    title: "Changelog — MCP Registry",
    description:
      "Track updates to the MCP Registry including API changes, verification updates, and infrastructure improvements.",
  },
};

type ChangelogCategory =
  | "UI"
  | "API"
  | "Governance"
  | "Verification"
  | "Infrastructure";

interface ChangelogEntry {
  date: string;
  version: string;
  category: ChangelogCategory;
  changes: string[];
}

const changelogEntries: ChangelogEntry[] = [
  {
    date: "March 13, 2026",
    version: "v1.3",
    category: "Governance",
    changes: [
      "Added public /verification page",
      "Introduced verified_at timestamp",
      "Display verification date on server detail page",
      "Enhanced Quality Signals counter with progress indicator",
    ],
  },
  {
    date: "March 12, 2026",
    version: "v1.2",
    category: "Infrastructure",
    changes: [
      "Added JSON-LD structured data for verified servers",
      "Improved OpenGraph metadata across public pages",
      "Extended E2E coverage to structured data",
    ],
  },
  {
    date: "March 11, 2026",
    version: "v1.1",
    category: "API",
    changes: [
      "Added public /api documentation page",
      "Documented cursor-based pagination",
      "Clarified API caching policy",
      "Added responsible use guidelines",
    ],
  },
  {
    date: "March 10, 2026",
    version: "v1.0",
    category: "UI",
    changes: [
      "Completed design token migration across all pages",
      "Unified semantic color system",
      "Reduced visual noise on detail sidebar",
      "Introduced motion polish improvements",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Changelog" }]}
          className="mb-8"
        />

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-display-md text-content-primary sm:text-display-lg">
            Changelog
          </h1>
          <p className="mt-3 text-body-lg text-content-secondary">
            A record of updates, infrastructure improvements, and governance
            changes to the MCP Registry. This page documents meaningful changes
            to the UI, API, governance policies, and verification criteria.
          </p>
        </div>

        <div className="space-y-10">
          {/* Section 1: Versioning & Scope */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Versioning &amp; Scope
            </h2>
            <Card padding="lg">
              <p className="mb-4 text-body-md text-content-secondary">
                The MCP Registry evolves regularly to improve discoverability,
                trust signals, and developer experience.
              </p>
              <ul className="space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  UI updates may occur frequently as we refine the experience.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  API endpoints aim to remain stable, with field additions over
                  time.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Registry data changes continuously as servers are added and
                  updated.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Breaking API changes will be documented clearly with advance
                  notice.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Verification criteria updates will be logged here.
                </li>
              </ul>
            </Card>
          </section>

          {/* Section 2: How to Follow Updates */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              How to Follow Updates
            </h2>
            <Card padding="lg">
              <p className="mb-4 text-body-md text-content-secondary">
                Stay informed about MCP Registry changes:
              </p>
              <ul className="space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Watch the{" "}
                    <Link
                      href="https://github.com/mcp-registry/mcp-registry"
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub repository
                    </Link>{" "}
                    for releases and updates.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Star the repository to receive notifications about new
                  releases.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Major infrastructure and governance changes are logged on this
                  page.
                </li>
              </ul>
            </Card>
          </section>

          {/* Section 3: Recent Updates */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Recent Updates
            </h2>
            <div className="space-y-6">
              {changelogEntries.map((entry) => (
                <Card key={`${entry.date}-${entry.version}`} padding="lg">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="text-heading-md text-content-primary">
                      {entry.date} — {entry.version}
                    </span>
                    <Badge variant="default" size="sm">
                      {entry.category}
                    </Badge>
                  </div>
                  <ul className="space-y-2 text-body-md text-content-secondary">
                    {entry.changes.map((change, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                        {change}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
