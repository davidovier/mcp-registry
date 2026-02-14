import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Contributing | MCP Registry",
  description:
    "Guidelines for submitting, reviewing, and verifying MCP servers in the MCP Registry.",
  openGraph: {
    title: "Contributing | MCP Registry",
    description:
      "Learn how to submit and verify MCP servers in the MCP Registry.",
    type: "website",
  },
};

export default function ContributingPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Contributing" }]}
          className="mb-8"
        />

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-display-md text-content-primary sm:text-display-lg">
            Contributing to the MCP Registry
          </h1>
          <p className="mt-3 text-body-lg text-content-secondary">
            The MCP Registry is a neutral, public index of Model Context
            Protocol servers. We welcome high-quality contributions from
            developers and teams building MCP integrations.
          </p>
          <p className="mt-3 text-body-lg text-content-secondary">
            This page explains what makes a strong submission, how review works,
            and how to contribute responsibly.
          </p>
        </div>

        <div className="space-y-10">
          {/* What Makes a High-Quality MCP Server Listing */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              What Makes a High-Quality MCP Server Listing
            </h2>
            <p className="mb-4 text-body-md text-content-secondary">
              A strong submission should meet the following criteria:
            </p>
            <ul className="space-y-2 text-body-md text-content-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                <span>
                  <strong className="text-content-primary">
                    Clear purpose
                  </strong>{" "}
                  — The description explains what the server does and who it is
                  for.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                <span>
                  <strong className="text-content-primary">
                    Working implementation
                  </strong>{" "}
                  — The server is functional and installable.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                <span>
                  <strong className="text-content-primary">
                    Accessible documentation
                  </strong>{" "}
                  — A README or documentation page explains setup and usage.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                <span>
                  <strong className="text-content-primary">
                    Transparent authentication model
                  </strong>{" "}
                  — Auth type is accurately declared.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                <span>
                  <strong className="text-content-primary">
                    Honest capabilities
                  </strong>{" "}
                  — Tools, resources, and prompts reflect actual functionality.
                </span>
              </li>
            </ul>
            <Card padding="lg" className="mt-6">
              <p className="text-body-md text-content-secondary">
                A good submission should answer three questions clearly:
              </p>
              <ul className="mt-3 space-y-1.5 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  What problem does this server solve?
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Who should use it?
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  How do I integrate it?
                </li>
              </ul>
            </Card>
          </section>

          {/* Technical Validation Rules */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Technical Validation Rules
            </h2>
            <p className="mb-4 text-body-md text-content-secondary">
              All submissions are validated against the Registry schema before
              entering review.
            </p>
            <ul className="space-y-2 text-body-md text-content-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Slug must be lowercase letters, numbers, and hyphens.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Name must be 1–100 characters.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Description must be 1–500 characters.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Tags are normalized (lowercase, deduplicated, max 10).
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                URLs must be valid https:// links.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Transport must be stdio, http, or both.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Auth must be none, oauth, api_key, or other.
              </li>
            </ul>
            <p className="mt-4 text-body-sm text-content-tertiary">
              Invalid submissions are stored but marked as invalid and will not
              enter review until corrected.
            </p>
          </section>

          {/* How Review Works */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              How Review Works
            </h2>
            <ol className="space-y-3 text-body-md text-content-secondary">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                  1
                </span>
                <span>You submit a server listing.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                  2
                </span>
                <span>The system validates the submission.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                  3
                </span>
                <span>It enters the moderation queue.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                  4
                </span>
                <span>An administrator reviews the entry.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                  5
                </span>
                <span>
                  It is approved, rejected, or returned for correction.
                </span>
              </li>
            </ol>
            <p className="mt-4 text-body-md text-content-secondary">
              Approval adds the listing to the public registry. Rejection
              includes a short explanation.
            </p>
          </section>

          {/* Verification vs Approval */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Verification vs Approval
            </h2>
            <p className="mb-4 text-body-md text-content-secondary">
              Approval means a submission meets structural and formatting
              requirements. Verification is separate.
            </p>
            <p className="mb-4 text-body-md text-content-secondary">
              Verified servers:
            </p>
            <ul className="space-y-2 text-body-md text-content-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                Meet documentation standards
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                Demonstrate stable behavior
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                Provide transparent ownership
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                Pass additional quality checks
              </li>
            </ul>
            <p className="mt-4 text-body-md text-content-secondary">
              Verification can be requested after approval. Learn more on the{" "}
              <Link
                href="/verification"
                className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Verification page
              </Link>
              .
            </p>
          </section>

          {/* Governance & Neutrality */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Governance &amp; Neutrality
            </h2>
            <p className="mb-4 text-body-md text-content-secondary">
              The MCP Registry operates under these principles:
            </p>
            <ul className="space-y-2 text-body-md text-content-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                <span>
                  <strong className="text-content-primary">Neutrality</strong> —
                  No preferential treatment for vendors.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                <span>
                  <strong className="text-content-primary">Transparency</strong>{" "}
                  — Criteria and changes are documented publicly.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                <span>
                  <strong className="text-content-primary">
                    Reproducibility
                  </strong>{" "}
                  — Decisions follow documented standards.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                <span>
                  <strong className="text-content-primary">Stability</strong> —
                  Public API contracts are versioned and backward compatible.
                </span>
              </li>
            </ul>
            <p className="mt-4 text-body-sm text-content-tertiary">
              The registry is not an endorsement platform. Verification does not
              imply legal certification, security audit, or guarantee.
            </p>
          </section>

          {/* Responsible Contributions */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Responsible Contributions
            </h2>
            <p className="mb-4 text-body-md text-content-secondary">
              Contributors must:
            </p>
            <ul className="space-y-2 text-body-md text-content-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Submit accurate information.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Avoid misleading marketing claims.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Respect intellectual property.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Not impersonate organizations.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Avoid spam or duplicate entries.
              </li>
            </ul>
            <p className="mt-4 text-body-sm text-content-tertiary">
              Abuse or repeated low-quality submissions may result in moderation
              restrictions.
            </p>
          </section>

          {/* How to Contribute */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              How to Contribute
            </h2>
            <p className="mb-4 text-body-md text-content-secondary">
              You can contribute by:
            </p>
            <ul className="space-y-2 text-body-md text-content-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                <span>
                  Submitting a new MCP server via the{" "}
                  <Link
                    href="/submit"
                    className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    Submit page
                  </Link>
                  .
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                Requesting verification for an approved server.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                <span>
                  Reporting incorrect information via{" "}
                  <Link
                    href="https://github.com/mcp-registry/mcp-registry/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    GitHub issues
                  </Link>
                  .
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                Proposing improvements to registry documentation.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
