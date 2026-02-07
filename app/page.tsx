import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="mb-6 text-display-lg tracking-tight text-content-primary sm:text-5xl">
          MCP Registry
        </h1>
        <p className="mb-8 text-body-lg text-content-secondary">
          Discover, share, and manage Model Context Protocol (MCP) servers and
          tools. The central hub for the MCP ecosystem.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/servers"
            className="inline-flex items-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400"
          >
            Browse Registry
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center rounded-lg border border-border bg-surface-secondary px-6 py-3 text-sm font-semibold text-content-primary shadow-sm transition-colors hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Documentation
          </Link>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Discover"
          description="Find MCP servers and tools created by the community."
        />
        <FeatureCard
          title="Share"
          description="Publish your own MCP servers for others to use."
        />
        <FeatureCard
          title="Integrate"
          description="Easy integration with your AI workflows and applications."
        />
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border p-6 transition-shadow hover:shadow-md">
      <h3 className="mb-2 text-lg font-semibold text-content-primary">
        {title}
      </h3>
      <p className="text-content-secondary">{description}</p>
    </div>
  );
}
