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

type ChangeType =
  | "Feature"
  | "Fix"
  | "Security"
  | "UI"
  | "Docs"
  | "API"
  | "Infrastructure";

interface ChangelogEntry {
  date: string;
  version: string;
  types: ChangeType[];
  changes: string[];
}

const changeTypeVariants: Record<
  ChangeType,
  "brand" | "success" | "warning" | "error" | "info" | "default"
> = {
  Feature: "brand",
  Fix: "success",
  Security: "error",
  UI: "info",
  Docs: "default",
  API: "warning",
  Infrastructure: "default",
};

const changelogEntries: ChangelogEntry[] = [
  {
    date: "February 14, 2026",
    version: "v1.4",
    types: ["UI", "Docs"],
    changes: [
      "Redesigned public changelog page with improved hierarchy",
      "Added version anchor links for deep linking",
      "Introduced highlighted Latest Release section",
      "Added Support & Feedback section with community links",
    ],
  },
  {
    date: "February 13, 2026",
    version: "v1.3",
    types: ["Feature", "UI"],
    changes: [
      "Added public /verification page",
      "Introduced verified_at timestamp",
      "Display verification date on server detail page",
      "Enhanced Quality Signals counter with progress indicator",
    ],
  },
  {
    date: "February 12, 2026",
    version: "v1.2",
    types: ["Infrastructure", "Docs"],
    changes: [
      "Added JSON-LD structured data for verified servers",
      "Improved OpenGraph metadata across public pages",
      "Extended E2E coverage to structured data",
    ],
  },
  {
    date: "February 11, 2026",
    version: "v1.1",
    types: ["API", "Docs"],
    changes: [
      "Added public /api documentation page",
      "Documented cursor-based pagination",
      "Clarified API caching policy",
      "Added responsible use guidelines",
    ],
  },
  {
    date: "February 10, 2026",
    version: "v1.0",
    types: ["Feature", "UI"],
    changes: [
      "Completed design token migration across all pages",
      "Unified semantic color system",
      "Reduced visual noise on detail sidebar",
      "Introduced motion polish improvements",
    ],
  },
];

function versionToAnchor(version: string): string {
  return version.replace(/\./g, "-").toLowerCase();
}

function ChangelogEntryCard({
  entry,
  highlighted = false,
}: {
  entry: ChangelogEntry;
  highlighted?: boolean;
}) {
  const anchor = versionToAnchor(entry.version);

  return (
    <Card
      padding="lg"
      className={
        highlighted
          ? "border-brand-500 ring-1 ring-brand-500/20 dark:border-brand-400 dark:ring-brand-400/20"
          : undefined
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <a
          id={anchor}
          href={`#${anchor}`}
          className="group flex items-center gap-2"
        >
          <Badge variant="brand" size="sm">
            {entry.version}
          </Badge>
          <span className="text-content-tertiary opacity-0 transition-opacity group-hover:opacity-100">
            #
          </span>
        </a>
        <span className="text-body-sm text-content-tertiary">{entry.date}</span>
        <div className="flex flex-wrap gap-1.5">
          {entry.types.map((type) => (
            <Badge key={type} variant={changeTypeVariants[type]} size="sm">
              {type}
            </Badge>
          ))}
        </div>
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
  );
}

export default function ChangelogPage() {
  const latestEntry = changelogEntries[0];
  const recentEntries = changelogEntries.slice(1);

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

        <div className="space-y-12">
          {/* Section 1: Versioning & Scope */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Versioning &amp; Scope
            </h2>
            <Card padding="lg">
              <p className="mb-4 text-body-md text-content-secondary">
                The MCP Registry evolves regularly to improve discoverability,
                trust signals, and developer experience. Here&apos;s what gets
                logged:
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-body-sm font-medium text-content-primary">
                    What we document
                  </p>
                  <ul className="space-y-1.5 text-body-sm text-content-secondary">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                      New features and capabilities
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                      Breaking API changes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                      Security updates
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                      Verification criteria changes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                      Significant UI updates
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-body-sm font-medium text-content-primary">
                    What we don&apos;t document
                  </p>
                  <ul className="space-y-1.5 text-body-sm text-content-secondary">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                      Minor styling tweaks
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                      Registry data changes (server additions)
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                      Internal refactoring
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                      Dependency updates (unless notable)
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Section 2: Latest Release */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Latest Release
            </h2>
            <ChangelogEntryCard entry={latestEntry} highlighted />
          </section>

          {/* Section 3: Recent Updates */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Recent Updates
            </h2>
            <div className="space-y-4">
              {recentEntries.map((entry) => (
                <ChangelogEntryCard
                  key={`${entry.date}-${entry.version}`}
                  entry={entry}
                />
              ))}
            </div>
          </section>

          {/* Section 4: How to Follow Updates */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              How to Follow Updates
            </h2>
            <Card padding="lg">
              <p className="mb-4 text-body-md text-content-secondary">
                Stay informed about MCP Registry changes:
              </p>
              <ul className="mb-6 space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-content-primary">
                      Watch releases
                    </strong>{" "}
                    — Star the repository and enable release notifications.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-content-primary">
                      GitHub Releases RSS
                    </strong>{" "}
                    — Subscribe to the releases Atom feed in your RSS reader.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-content-primary">
                      Bookmark this page
                    </strong>{" "}
                    — Major infrastructure and governance changes are logged
                    here.
                  </span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="https://github.com/mcp-registry/mcp-registry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-surface-secondary px-3 text-body-sm font-medium text-content-primary transition-all duration-150 hover:-translate-y-[1px] hover:border-border-strong hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub Repository
                </Link>
                <Link
                  href="https://github.com/mcp-registry/mcp-registry/releases.atom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center gap-2 rounded-md px-3 text-body-sm font-medium text-content-secondary transition-all duration-150 hover:-translate-y-[1px] hover:bg-surface-sunken hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6.18 15.64a2.18 2.18 0 110 4.36 2.18 2.18 0 010-4.36zM4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44zm0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93v-2.83z" />
                  </svg>
                  Releases RSS
                </Link>
              </div>
            </Card>
          </section>

          {/* Section 5: Support & Feedback */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Support &amp; Feedback
            </h2>
            <Card padding="lg">
              <p className="mb-4 text-body-md text-content-secondary">
                Found an issue or have a suggestion? We welcome contributions
                and feedback.
              </p>
              <ul className="mb-6 space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Report bugs or request features via{" "}
                    <Link
                      href="https://github.com/mcp-registry/mcp-registry/issues"
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub Issues
                    </Link>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Learn how to submit and verify servers on the{" "}
                    <Link
                      href="/contributing"
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      Contributing page
                    </Link>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Submit pull requests to improve documentation or fix issues.
                  </span>
                </li>
              </ul>
            </Card>
          </section>

          {/* Next Steps */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Next Steps
            </h2>
            <Card padding="lg">
              <p className="mb-6 text-body-md text-content-secondary">
                Explore the registry to discover MCP servers or contribute your
                own.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/servers"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 font-medium text-white transition-all duration-150 hover:-translate-y-[1px] hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400"
                >
                  Browse Servers
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
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
                <Link
                  href="/contributing"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 font-medium text-content-primary transition-all duration-150 hover:-translate-y-[1px] hover:border-border-strong hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  Contribute
                </Link>
              </div>
            </Card>
          </section>

          {/* Back to top */}
          <div className="flex justify-center border-t border-border pt-8">
            <a
              href="#top"
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-body-sm font-medium text-content-secondary transition-all duration-150 hover:-translate-y-[1px] hover:bg-surface-sunken hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
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
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              Back to top
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
