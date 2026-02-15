import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for MCP Registry.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
          className="mb-8"
        />

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-display-md text-content-primary sm:text-display-lg">
            Privacy Policy
          </h1>
          <p className="mt-3 text-body-lg text-content-secondary">
            Effective date: January 1, 2026
          </p>
        </div>

        <div className="space-y-10">
          <p className="text-body-md text-content-secondary">
            MCP Registry does not require personal information to browse the
            public registry.
          </p>

          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              1. Information We Collect
            </h2>
            <p className="mb-4 text-body-md text-content-secondary">
              We collect:
            </p>
            <ul className="space-y-2 text-body-md text-content-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Email address (for authentication)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Server submissions and verification requests
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                Basic usage data required for application functionality
              </li>
            </ul>
            <p className="mt-4 text-body-md text-content-secondary">
              We do not sell or share personal data.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              2. Authentication
            </h2>
            <p className="text-body-md text-content-secondary">
              Authentication is handled securely via Supabase. We store only the
              minimum data required to operate your account.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              3. Submissions
            </h2>
            <p className="text-body-md text-content-secondary">
              When you submit a server listing, the data becomes part of the
              public registry upon approval.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              4. Cookies
            </h2>
            <p className="text-body-md text-content-secondary">
              We use essential cookies for authentication and session management
              only.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              5. Contact
            </h2>
            <p className="text-body-md text-content-secondary">
              For questions, contact:{" "}
              <a
                href="mailto:support@mcp-registry.com"
                className="text-brand-600 transition-colors hover:text-brand-700"
              >
                support@mcp-registry.com
              </a>
            </p>
          </section>

          {/* Related Links */}
          <section className="border-t border-border pt-10">
            <Card padding="lg">
              <p className="mb-6 text-body-md text-content-secondary">
                Continue exploring the MCP Registry.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/servers"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 font-medium text-white transition-all duration-150 hover:-translate-y-[1px] hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400"
                >
                  Browse Servers
                </Link>
                <Link
                  href="/terms"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 font-medium text-content-primary transition-all duration-150 hover:-translate-y-[1px] hover:border-border-strong hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                  Terms of Service
                </Link>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
