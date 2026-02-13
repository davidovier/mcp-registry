import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Verification Criteria",
  description:
    "How the MCP Registry signals additional review and confidence in a server listing. Learn what verification means and how to request it.",
  openGraph: {
    title: "MCP Registry — Verification Criteria",
    description:
      "How the MCP Registry signals additional review and confidence in a server listing. Learn what verification means and how to request it.",
  },
};

export default function VerificationPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Verification" }]}
          className="mb-8"
        />

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-display-md text-content-primary sm:text-display-lg">
            Verification
          </h1>
          <p className="mt-3 text-body-lg text-content-secondary">
            Verification is how the MCP Registry signals additional review and
            confidence in a server listing.
          </p>
          <p className="mt-3 text-body-lg text-content-secondary">
            A verified server has been reviewed against a defined set of quality
            and transparency criteria. Verification helps users identify servers
            that meet a higher bar for documentation, clarity, and ecosystem
            fit.
          </p>
          <p className="mt-3 text-body-lg text-content-secondary">
            Verification is not automatic and is not guaranteed. It is requested
            by server owners and approved through manual review.
          </p>
        </div>

        <div className="space-y-10">
          {/* Section 1: What "Verified" Means */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              What &ldquo;Verified&rdquo; means
            </h2>
            <Card padding="lg">
              <p className="mb-4 text-body-md text-content-secondary">
                A verified server has met all of the following criteria at the
                time of review:
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="mb-1 text-heading-sm text-content-primary">
                    1. Public repository or source transparency
                  </h3>
                  <p className="text-body-md text-content-secondary">
                    The server has a publicly accessible repository or clear
                    source reference. Users can inspect how it works.
                  </p>
                </div>

                <div>
                  <h3 className="mb-1 text-heading-sm text-content-primary">
                    2. Documentation exists
                  </h3>
                  <p className="mb-2 text-body-md text-content-secondary">
                    The server provides usable documentation describing:
                  </p>
                  <ul className="space-y-1.5 text-body-md text-content-secondary">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                      What it does
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                      How to install it
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                      How to configure it
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                      Any limitations or constraints
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-1 text-heading-sm text-content-primary">
                    3. Installation is functional
                  </h3>
                  <p className="text-body-md text-content-secondary">
                    Installation steps are clear and reproducible. Configuration
                    examples are valid and consistent with the implementation.
                  </p>
                </div>

                <div>
                  <h3 className="mb-1 text-heading-sm text-content-primary">
                    4. Accurate metadata
                  </h3>
                  <p className="text-body-md text-content-secondary">
                    The listing&apos;s transport type, authentication method,
                    capabilities, and links accurately reflect the server&apos;s
                    behavior.
                  </p>
                </div>

                <div>
                  <h3 className="mb-1 text-heading-sm text-content-primary">
                    5. Reasonable maintenance signal
                  </h3>
                  <p className="text-body-md text-content-secondary">
                    The project shows signs of activity or maintenance
                    appropriate to its purpose. This does not require frequent
                    commits, but it should not appear abandoned or misleading.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Section 2: What "Verified" Does Not Mean */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              What &ldquo;Verified&rdquo; does not mean
            </h2>
            <Card padding="lg">
              <p className="mb-4 text-body-md text-content-secondary">
                Verification does NOT mean:
              </p>
              <ul className="space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  The registry guarantees uptime.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  The registry performed a formal security audit.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  The registry endorses the server&apos;s maintainers.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  The server is free of bugs or vulnerabilities.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  The server is suitable for your specific production
                  environment.
                </li>
              </ul>
              <p className="mt-4 text-body-sm text-content-tertiary">
                Verification is a quality and transparency signal — not a
                warranty.
              </p>
            </Card>
          </section>

          {/* Section 3: How Verification Works */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              How verification works
            </h2>
            <Card padding="lg">
              <ol className="space-y-3 text-body-md text-content-secondary">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                    1
                  </span>
                  <span>A server owner submits a verification request.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                    2
                  </span>
                  <span>
                    The registry reviews the server against the published
                    criteria.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                    3
                  </span>
                  <div>
                    <span>If approved:</span>
                    <ul className="mt-2 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                        The server is marked as verified.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                        A verification date is recorded.
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                    4
                  </span>
                  <div>
                    <span>If rejected:</span>
                    <ul className="mt-2 space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                        Feedback may be provided.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                        The owner can improve the listing and re-request review.
                      </li>
                    </ul>
                  </div>
                </li>
              </ol>
              <p className="mt-4 text-body-sm text-content-tertiary">
                Verification status may be removed if a server becomes
                misleading, abandoned, or violates registry principles.
              </p>
            </Card>
          </section>

          {/* Section 4: Governance & Neutrality */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Governance &amp; neutrality
            </h2>
            <Card padding="lg">
              <p className="text-body-md text-content-secondary">
                The MCP Registry is neutral.
              </p>
              <p className="mt-3 text-body-md text-content-secondary">
                Verification decisions are based on documented criteria — not
                popularity, affiliation, or sponsorship.
              </p>
              <p className="mt-3 text-body-md text-content-secondary">
                The goal of verification is ecosystem clarity, not ranking
                manipulation.
              </p>
            </Card>
          </section>

          {/* Section 5: Re-Verification */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Re-verification
            </h2>
            <Card padding="lg">
              <p className="text-body-md text-content-secondary">
                Verified servers may be re-reviewed periodically or after
                significant changes.
              </p>
              <p className="mt-3 text-body-md text-content-secondary">
                If a server&apos;s documentation, behavior, or ownership changes
                materially, verification may be reassessed.
              </p>
              <p className="mt-3 text-body-sm text-content-tertiary">
                The verification date shown on each server reflects the most
                recent successful review.
              </p>
            </Card>
          </section>

          {/* Section 6: Requesting Verification */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Requesting verification
            </h2>
            <Card padding="lg">
              <p className="mb-4 text-body-md text-content-secondary">
                If you own a server listed in the registry:
              </p>
              <ol className="space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                    1
                  </span>
                  <span>Ensure it meets the published criteria.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                    2
                  </span>
                  <span>
                    Confirm your documentation and metadata are accurate.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-surface-sunken text-caption font-medium text-content-secondary">
                    3
                  </span>
                  <span>
                    Use the &ldquo;Request verification&rdquo; action on your
                    server&apos;s detail page.
                  </span>
                </li>
              </ol>
              <p className="mt-4 text-body-sm text-content-tertiary">
                Verification is optional. Unverified servers can still be high
                quality.
              </p>
              <div className="mt-6 border-t border-border pt-4">
                <Link
                  href="/servers"
                  className="text-body-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                >
                  Browse the registry →
                </Link>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
