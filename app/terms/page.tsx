import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for MCP Registry.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
          className="mb-8"
        />

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-display-md text-content-primary sm:text-display-lg">
            Terms of Service
          </h1>
          <p className="mt-3 text-body-lg text-content-secondary">
            Effective date: January 1, 2026
          </p>
        </div>

        <div className="space-y-10">
          <p className="text-body-md text-content-secondary">
            By using MCP Registry, you agree to the following terms.
          </p>

          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              1. Use of the Registry
            </h2>
            <p className="text-body-md text-content-secondary">
              The registry is provided as-is for informational purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              2. Submissions
            </h2>
            <p className="mb-4 text-body-md text-content-secondary">
              You represent that:
            </p>
            <ul className="space-y-2 text-body-md text-content-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                You have the right to submit the content
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                The information is accurate
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                The project complies with applicable laws
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              3. Moderation
            </h2>
            <p className="text-body-md text-content-secondary">
              We reserve the right to approve, reject, or remove listings at our
              discretion.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              4. Verification
            </h2>
            <p className="text-body-md text-content-secondary">
              Verification indicates registry review, not endorsement or
              guarantee.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              5. Liability
            </h2>
            <p className="text-body-md text-content-secondary">
              We are not responsible for third-party servers listed in the
              registry.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
