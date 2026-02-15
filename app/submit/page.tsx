import Link from "next/link";
import { redirect } from "next/navigation";

import { SubmitForm } from "@/components/submit";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Submit a Server | MCP Registry",
  description: "Submit a new MCP server to the registry for review",
};

export default async function SubmitPage() {
  const supabase = await createClient();

  // Require authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/submit");
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <section className="mb-8 rounded-2xl border border-border bg-surface-secondary p-5 lg:mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-heading-md text-content-primary">
                Submit your MCP server for review
              </h2>
              <p className="mt-1 text-body-sm text-content-secondary">
                Takes ~3 minutes. Our team reviews every listing before it goes
                live.
              </p>
            </div>
            <p className="text-caption text-content-tertiary">
              Reviewed within 48 hours.
            </p>
          </div>
          <div className="mt-4 grid gap-2 text-body-sm text-content-secondary sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-surface-primary px-3 py-2">
              1. Describe your server
            </div>
            <div className="rounded-lg border border-border bg-surface-primary px-3 py-2">
              2. We review
            </div>
            <div className="rounded-lg border border-border bg-surface-primary px-3 py-2">
              3. It goes live
            </div>
          </div>
        </section>

        {/* Page header */}
        <header className="mb-8 lg:mb-12">
          <h1 className="text-display-md text-content-primary">
            Submit a server
          </h1>
          <p className="mt-2 text-body-lg text-content-secondary">
            Takes ~3 minutes. All submissions are reviewed before publishing.
          </p>
        </header>

        <SubmitForm />

        {/* Help section */}
        <section className="mt-12 border-t border-border pt-8">
          <Card padding="lg">
            <h2 className="mb-4 text-heading-md text-content-primary">
              Need help?
            </h2>
            <p className="mb-6 text-body-md text-content-secondary">
              Review our guidelines for submitting high-quality server listings,
              or browse existing servers for inspiration.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contributing"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 font-medium text-content-primary transition-all duration-150 hover:-translate-y-[1px] hover:border-border-strong hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Submission Guidelines
              </Link>
              <Link
                href="/servers"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 font-medium text-content-primary transition-all duration-150 hover:-translate-y-[1px] hover:border-border-strong hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Browse Servers
              </Link>
              <Link
                href="/verification"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 font-medium text-content-primary transition-all duration-150 hover:-translate-y-[1px] hover:border-border-strong hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Verification Criteria
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
