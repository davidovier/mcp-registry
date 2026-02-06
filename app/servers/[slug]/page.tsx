import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CapabilityBadges,
  ExternalLinks,
  InstallSnippet,
  MetadataCard,
  QuickActionsCard,
  TrustActionsCard,
  VerifiedBadge,
} from "@/components/servers";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import type { McpCapabilities } from "@/lib/supabase/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: server } = await supabase
    .from("mcp_servers")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!server) {
    return {
      title: "Server Not Found",
    };
  }

  return {
    title: server.name,
    description: server.description,
  };
}

export default async function ServerDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: server, error } = await supabase
    .from("mcp_servers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !server) {
    notFound();
  }

  const capabilities = server.capabilities as McpCapabilities;

  return (
    <div>
      {/* Breadcrumb bar */}
      <div className="border-b border-border bg-surface-secondary">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Servers", href: "/servers" },
              { label: server.name },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header section */}
        <header className="mb-8">
          <div className="flex items-start gap-4">
            {/* Avatar initial block */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-800">
              <span className="text-display-md text-brand-600 dark:text-brand-400">
                {server.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              {/* Name + verified */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-display-md text-content-primary">
                  {server.name}
                </h1>
                {server.verified && <VerifiedBadge />}
              </div>

              {/* Slug */}
              <p className="mt-0.5 font-mono text-body-md text-content-tertiary">
                {server.slug}
              </p>

              {/* Description */}
              <p className="mt-2 text-body-lg text-content-secondary">
                {server.description}
              </p>

              {/* Tags */}
              {server.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {server.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/servers?q=${encodeURIComponent(tag)}`}
                    >
                      <Badge variant="default" size="sm">
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Grid layout: main + sidebar */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Installation / usage */}
            <InstallSnippet name={server.name} transport={server.transport} />

            {/* Capabilities */}
            <CapabilityBadges data={capabilities} />

            {/* External links */}
            <ExternalLinks
              homepageUrl={server.homepage_url}
              repoUrl={server.repo_url}
              docsUrl={server.docs_url}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick actions */}
            <QuickActionsCard
              name={server.name}
              transport={server.transport}
              repoUrl={server.repo_url}
            />

            {/* Details metadata */}
            <MetadataCard
              transport={server.transport}
              auth={server.auth}
              verified={server.verified}
              createdAt={server.created_at}
              updatedAt={server.updated_at}
            />

            {/* Trust & ownership */}
            <TrustActionsCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
