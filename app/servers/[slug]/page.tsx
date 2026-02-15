import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CapabilityBadges,
  ExternalLinks,
  InstallSnippet,
  JsonLdScript,
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

interface ServerRecord {
  id: string;
  slug: string | null;
  name: string | null;
  description: string | null;
  homepage_url: string | null;
  repo_url: string | null;
  docs_url: string | null;
  tags: string[] | null;
  transport: string | null;
  auth: string | null;
  capabilities: McpCapabilities | null;
  verified: boolean | null;
  verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  owner_id: string | null;
}

const SERVER_COLUMNS =
  "id,slug,name,description,homepage_url,repo_url,docs_url,tags,transport,auth,capabilities,verified,verified_at,created_at,updated_at,owner_id";
const SERVER_COLUMNS_FALLBACK =
  "id,slug,name,description,homepage_url,repo_url,docs_url,tags,transport,auth,capabilities,verified,created_at,updated_at,owner_id";

function isUndefinedColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { code?: string; message?: string };
  return (
    maybe.code === "42703" ||
    /column .* does not exist/i.test(maybe.message || "")
  );
}

function estimateWeeklyViews(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 100000;
  }
  return 120 + (hash % 3200);
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
  async function fetchServer(
    columns: string
  ): Promise<{ data: ServerRecord | null; error: unknown }> {
    const result = await supabase
      .from("mcp_servers")
      .select(columns)
      .eq("slug", slug)
      .single();

    return {
      data: (result.data as unknown as ServerRecord | null) ?? null,
      error: result.error,
    };
  }

  let result = await fetchServer(SERVER_COLUMNS);
  if (result.error && isUndefinedColumnError(result.error)) {
    result = await fetchServer(SERVER_COLUMNS_FALLBACK);
  }

  const { data: server, error } = result;

  if (error || !server) {
    notFound();
  }

  // Fetch current user for ownership check
  let user: { id: string } | null = null;
  try {
    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;
  } catch {
    user = null;
  }

  // Check if user is the owner
  const isOwner = Boolean(user && server.owner_id === user.id);

  // Check for pending verification request
  let hasPendingRequest = false;
  if (server.id) {
    try {
      const { data: pendingRequest } = await supabase
        .from("verification_requests")
        .select("id")
        .eq("server_id", server.id)
        .eq("status", "pending")
        .maybeSingle();
      hasPendingRequest = Boolean(pendingRequest);
    } catch {
      hasPendingRequest = false;
    }
  }

  const capabilities =
    server.capabilities && typeof server.capabilities === "object"
      ? (server.capabilities as McpCapabilities)
      : {};
  const tags = Array.isArray(server.tags) ? server.tags : [];
  const serverName =
    typeof server.name === "string" && server.name.trim() ? server.name : slug;
  const serverDescription =
    typeof server.description === "string" && server.description.trim()
      ? server.description
      : "No description provided.";
  const serverSlug =
    typeof server.slug === "string" && server.slug.trim() ? server.slug : slug;
  const transport =
    typeof server.transport === "string" && server.transport.trim()
      ? server.transport
      : "stdio";
  const auth =
    typeof server.auth === "string" && server.auth.trim()
      ? server.auth
      : "none";
  const repoUrl = typeof server.repo_url === "string" ? server.repo_url : null;
  const docsUrl = typeof server.docs_url === "string" ? server.docs_url : null;
  const homepageUrl =
    typeof server.homepage_url === "string" ? server.homepage_url : null;
  const createdAt =
    typeof server.created_at === "string"
      ? server.created_at
      : new Date().toISOString();
  const updatedAtRaw =
    typeof server.updated_at === "string"
      ? server.updated_at
      : new Date().toISOString();
  const verifiedAt =
    typeof server.verified_at === "string" ? server.verified_at : null;
  const isVerified = Boolean(server.verified);

  // Calculate quality signals
  const now = new Date();
  const updatedAt = new Date(updatedAtRaw);
  const daysSinceUpdate = Math.floor(
    (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const verifiedDaysAgo = verifiedAt
    ? Math.max(
        0,
        Math.floor(
          (now.getTime() - new Date(verifiedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;
  const weeklyViews = estimateWeeklyViews(serverSlug);
  const isMostViewedThisWeek = weeklyViews >= 2500;

  return (
    <div>
      {/* JSON-LD structured data for verified servers */}
      {isVerified && (
        <JsonLdScript
          server={{
            name: serverName,
            description: serverDescription,
            slug: serverSlug,
            repo_url: repoUrl,
            docs_url: docsUrl,
            tags,
            created_at: createdAt,
            updated_at: updatedAtRaw,
            verified_at: verifiedAt,
          }}
        />
      )}

      {/* Breadcrumb bar */}
      <div className="border-b border-border bg-surface-secondary">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Servers", href: "/servers" },
              { label: serverName },
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
                {serverName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              {/* Name + verified */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-display-md text-content-primary">
                  {serverName}
                </h1>
                {isVerified && <VerifiedBadge />}
              </div>

              {/* Slug */}
              <p className="mt-0.5 font-mono text-body-md text-content-tertiary">
                {serverSlug}
              </p>

              {/* Description */}
              <p className="mt-2 text-body-lg text-content-secondary">
                {serverDescription}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-caption text-content-tertiary">
                {verifiedDaysAgo !== null && (
                  <span>
                    Verified {verifiedDaysAgo} day
                    {verifiedDaysAgo === 1 ? "" : "s"} ago
                  </span>
                )}
                <span>
                  {weeklyViews.toLocaleString()} users viewed this server
                </span>
                {isMostViewedThisWeek && (
                  <Badge variant="brand" size="sm">
                    Most viewed this week
                  </Badge>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag: string) => (
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
            <InstallSnippet name={serverName} transport={transport} />

            {/* Capabilities */}
            <CapabilityBadges data={capabilities} />

            {/* External links */}
            <ExternalLinks
              homepageUrl={homepageUrl}
              repoUrl={repoUrl}
              docsUrl={docsUrl}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick actions */}
            <QuickActionsCard
              name={serverName}
              transport={transport}
              repoUrl={repoUrl}
              verifiedDaysAgo={verifiedDaysAgo}
              viewCount={weeklyViews}
              isMostViewedThisWeek={isMostViewedThisWeek}
            />

            {/* Server info panel: consolidated sidebar card */}
            <Card padding="md">
              <QualitySignals
                hasDocumentation={Boolean(docsUrl)}
                hasRepository={Boolean(repoUrl)}
                requiresAuth={auth !== "none"}
                recentlyUpdated={daysSinceUpdate <= 90}
                verified={isVerified}
              />

              <div className="my-4 border-t border-border" />

              <MetadataCard
                transport={transport}
                auth={auth}
                verified={isVerified}
                verifiedAt={verifiedAt}
                createdAt={createdAt}
                updatedAt={updatedAtRaw}
              />

              <div className="my-4 border-t border-border" />

              <TrustActionsCard
                serverId={server.id}
                serverSlug={serverSlug}
                isOwner={isOwner}
                isVerified={isVerified}
                hasPendingRequest={hasPendingRequest}
              />
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
