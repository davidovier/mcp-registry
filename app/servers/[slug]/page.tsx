import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CapabilityBadges,
  ExternalLinks,
  InstallSnippet,
  MetadataCard,
  QualitySignals,
  QuickActionsCard,
  TrustActionsCard,
  VerifiedBadge,
} from "@/components/servers";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
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

  // Fetch server data
  const { data: server, error } = await supabase
    .from("mcp_servers")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !server) {
    notFound();
  }

  // Fetch current user for ownership check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user is the owner
  const isOwner = Boolean(user && server.owner_id === user.id);

  // Check for pending verification request
  let hasPendingRequest = false;
  if (server.id) {
    const { data: pendingRequest } = await supabase
      .from("verification_requests")
      .select("id")
      .eq("server_id", server.id)
      .eq("status", "pending")
      .maybeSingle();
    hasPendingRequest = Boolean(pendingRequest);
  }

  const capabilities = server.capabilities as McpCapabilities;

  // Calculate quality signals
  const now = new Date();
  const updatedAt = new Date(server.updated_at);
  const daysSinceUpdate = Math.floor(
    (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

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
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
              <span className="text-display-md text-content-secondary">
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

            {/* Server info panel: consolidated sidebar card */}
            <Card padding="md">
              <QualitySignals
                hasDocumentation={Boolean(server.docs_url)}
                hasRepository={Boolean(server.repo_url)}
                requiresAuth={server.auth !== "none"}
                recentlyUpdated={daysSinceUpdate <= 90}
                verified={server.verified}
              />

              <div className="my-4 border-t border-border" />

              <MetadataCard
                transport={server.transport}
                auth={server.auth}
                verified={server.verified}
                verifiedAt={server.verified_at}
                createdAt={server.created_at}
                updatedAt={server.updated_at}
              />

              <div className="my-4 border-t border-border" />

              <TrustActionsCard
                serverId={server.id}
                isOwner={isOwner}
                isVerified={server.verified}
                hasPendingRequest={hasPendingRequest}
              />
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
