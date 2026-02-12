import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About",
  description:
    "A public registry for MCP servers, built for clarity and trust.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "About" }]}
          className="mb-8"
        />

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-display-md text-content-primary sm:text-display-lg">
            About
          </h1>
          <p className="mt-3 text-body-lg text-content-secondary">
            A public registry for MCP servers, built for clarity and trust.
          </p>
        </div>

        <div className="space-y-10">
          {/* Why this exists */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Why this exists
            </h2>
            <Card padding="lg">
              <p className="mb-4 text-body-md text-content-secondary">
                As the MCP ecosystem grows, discoverability and trust become
                more complex. Common problems include:
              </p>
              <ul className="space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Fragmented listings across repositories and discussions.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Inconsistent metadata.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Unclear authentication requirements.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Difficulty comparing servers.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Limited visibility into maintenance status.
                </li>
              </ul>
              <p className="mt-4 text-body-md text-content-secondary">
                The MCP Registry provides a structured, neutral index for MCP
                servers with consistent metadata and transparent signals.
              </p>
            </Card>
          </section>

          {/* Principles */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Principles
            </h2>
            <p className="mb-4 text-body-md text-content-secondary">
              The registry is built around a few core principles:
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card padding="lg">
                <h3 className="mb-2 text-heading-sm text-content-primary">
                  Precision over noise
                </h3>
                <p className="text-body-md text-content-secondary">
                  Only meaningful metadata is shown. No marketing embellishment.
                </p>
              </Card>
              <Card padding="lg">
                <h3 className="mb-2 text-heading-sm text-content-primary">
                  Semantic transparency
                </h3>
                <p className="text-body-md text-content-secondary">
                  Transport, authentication, and capabilities are clearly
                  declared.
                </p>
              </Card>
              <Card padding="lg">
                <h3 className="mb-2 text-heading-sm text-content-primary">
                  Neutrality
                </h3>
                <p className="text-body-md text-content-secondary">
                  The registry does not favor specific vendors or
                  implementations.
                </p>
              </Card>
              <Card padding="lg">
                <h3 className="mb-2 text-heading-sm text-content-primary">
                  Verifiable signals
                </h3>
                <p className="text-body-md text-content-secondary">
                  Trust indicators are visible and documented.
                </p>
              </Card>
              <Card padding="lg" className="sm:col-span-2">
                <h3 className="mb-2 text-heading-sm text-content-primary">
                  Restraint in design
                </h3>
                <p className="text-body-md text-content-secondary">
                  Branding is minimal. Information hierarchy is prioritized.
                </p>
              </Card>
            </div>
          </section>

          {/* Governance & Verification */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Governance &amp; Verification
            </h2>
            <Card padding="lg">
              <p className="text-body-md text-content-secondary">
                Submissions are reviewed before publication.
              </p>
              <p className="mt-3 text-body-md text-content-secondary">
                Verification is optional and may be requested by a server owner.
                Review focuses on:
              </p>
              <ul className="mt-3 space-y-1.5 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Documentation clarity.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Repository transparency.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Accurate metadata.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Absence of misleading claims.
                </li>
              </ul>
              <p className="mt-4 text-body-sm text-content-tertiary">
                Verification is not a certification. It is a transparency
                signal. As the ecosystem evolves, review criteria may be
                refined.
              </p>
            </Card>
          </section>

          {/* Roadmap */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Roadmap
            </h2>
            <Card padding="lg">
              <p className="mb-4 text-body-md text-content-secondary">
                Planned improvements include:
              </p>
              <ul className="space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Expanded filtering (including capability-based filters).
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Improved search relevance.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Public API documentation.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Registry export formats.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Stronger contribution guidelines.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Additional maintenance signals.
                </li>
              </ul>
              <p className="mt-4 text-body-sm text-content-tertiary">
                Development prioritizes clarity and ecosystem health over rapid
                feature expansion.
              </p>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
