import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link
          href="/servers"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Servers
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">{server.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              {server.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {server.description}
            </p>
          </div>
          {server.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Verified
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Tags */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {server.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/servers?q=${encodeURIComponent(tag)}`}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>

          {/* Capabilities */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Capabilities
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <CapabilityCard
                name="Tools"
                enabled={capabilities.tools}
                icon="🔧"
                description="Provides executable tools"
              />
              <CapabilityCard
                name="Resources"
                enabled={capabilities.resources}
                icon="📁"
                description="Provides data resources"
              />
              <CapabilityCard
                name="Prompts"
                enabled={capabilities.prompts}
                icon="💬"
                description="Provides prompt templates"
              />
            </div>
          </section>

          {/* Links */}
          {(server.homepage_url || server.repo_url || server.docs_url) && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                Links
              </h2>
              <div className="space-y-2">
                {server.homepage_url && (
                  <LinkRow
                    href={server.homepage_url}
                    label="Homepage"
                    icon="🌐"
                  />
                )}
                {server.repo_url && (
                  <LinkRow
                    href={server.repo_url}
                    label="Repository"
                    icon="📦"
                  />
                )}
                {server.docs_url && (
                  <LinkRow
                    href={server.docs_url}
                    label="Documentation"
                    icon="📖"
                  />
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Transport</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  <span className="rounded bg-gray-200 px-2 py-0.5 dark:bg-gray-700">
                    {server.transport}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Auth</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  <span className="rounded bg-gray-200 px-2 py-0.5 dark:bg-gray-700">
                    {server.auth}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Added</dt>
                <dd className="text-gray-900 dark:text-white">
                  {new Date(server.created_at).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Updated</dt>
                <dd className="text-gray-900 dark:text-white">
                  {new Date(server.updated_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions placeholder */}
          <div className="rounded-lg border border-dashed border-gray-300 p-5 text-center dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Actions coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CapabilityCard({
  name,
  enabled,
  icon,
  description,
}: {
  name: string;
  enabled?: boolean;
  icon: string;
  description: string;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        enabled
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
          : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <span>{icon}</span>
        <span
          className={`font-medium ${
            enabled
              ? "text-green-800 dark:text-green-400"
              : "text-gray-500 dark:text-gray-500"
          }`}
        >
          {name}
        </span>
      </div>
      <p
        className={`text-xs ${
          enabled
            ? "text-green-700 dark:text-green-500"
            : "text-gray-400 dark:text-gray-600"
        }`}
      >
        {enabled ? description : "Not available"}
      </p>
    </div>
  );
}

function LinkRow({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <span>{icon}</span>
      <span className="flex-1 font-medium text-gray-900 dark:text-white">
        {label}
      </span>
      <span className="text-gray-400">↗</span>
    </a>
  );
}
