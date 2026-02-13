/**
 * JSON-LD structured data component for verified servers.
 * Embeds Schema.org SoftwareApplication markup for SEO and rich results.
 */

interface JsonLdScriptProps {
  server: {
    name: string;
    description: string;
    slug: string;
    repo_url: string | null;
    docs_url: string | null;
    tags: string[];
    created_at: string;
    updated_at: string;
    verified_at: string | null;
  };
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function JsonLdScript({ server }: JsonLdScriptProps) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/servers/${server.slug}`;
  const verificationPolicyUrl = `${siteUrl}/verification`;

  // Build the JSON-LD object
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: server.name,
    description: server.description,
    url: canonicalUrl,
    dateCreated: server.created_at,
    dateModified: server.updated_at,
    publisher: {
      "@type": "Organization",
      name: "MCP Registry",
    },
    isBasedOn: verificationPolicyUrl,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "verified",
        value: true,
      },
    ],
  };

  // Add optional fields
  if (server.repo_url) {
    jsonLd.codeRepository = server.repo_url;
  }

  if (server.docs_url) {
    jsonLd.softwareHelp = server.docs_url;
  }

  if (server.tags && server.tags.length > 0) {
    jsonLd.keywords = server.tags;
  }

  // Add verified_at if present
  if (server.verified_at) {
    (jsonLd.additionalProperty as Record<string, unknown>[]).push({
      "@type": "PropertyValue",
      name: "verified_at",
      value: server.verified_at,
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
