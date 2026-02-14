import type { Metadata } from "next";
import Link from "next/link";

import { Alert } from "@/components/ui/Alert";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";

export const metadata: Metadata = {
  title: "API",
  description:
    "Public API documentation for the MCP Registry. Discover MCP servers and integrate registry data into your tools.",
  openGraph: {
    title: "API | MCP Registry",
    description:
      "Public API documentation for the MCP Registry. Discover MCP servers and integrate registry data into your tools.",
  },
};

const listResponseExample = `{
  "data": [
    {
      "id": "uuid",
      "slug": "filesystem",
      "name": "Filesystem MCP Server",
      "description": "...",
      "homepage_url": "https://...",
      "repo_url": "https://...",
      "docs_url": "https://...",
      "tags": ["filesystem", "tools"],
      "transport": "stdio",
      "auth": "none",
      "capabilities": { "tools": true, "resources": false, "prompts": false },
      "verified": true,
      "verified_at": "2026-02-13T12:34:56.000Z",
      "created_at": "...",
      "updated_at": "..."
    }
  ],
  "nextCursor": "opaque-string-or-null",
  "total": 123
}`;

const detailResponseExample = `{
  "id": "uuid",
  "slug": "filesystem",
  "name": "Filesystem MCP Server",
  "description": "...",
  "homepage_url": "https://...",
  "repo_url": "https://...",
  "docs_url": "https://...",
  "tags": ["filesystem", "tools"],
  "transport": "stdio",
  "auth": "none",
  "capabilities": { "tools": true, "resources": false, "prompts": false },
  "verified": true,
  "verified_at": "2026-02-13T12:34:56.000Z",
  "created_at": "...",
  "updated_at": "..."
}`;

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "API" }]}
          className="mb-8"
        />

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-display-md text-content-primary sm:text-display-lg">
            API
          </h1>
          <p className="mt-3 text-body-lg text-content-secondary">
            The MCP Registry provides a public API for discovering MCP servers
            and integrating registry data into your own tools, clients, and
            workflows.
          </p>
          <p className="mt-2 text-body-md text-content-tertiary">
            The API is read-only and publicly cacheable.
          </p>
        </div>

        <div className="space-y-10">
          {/* Base URL */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Base URL
            </h2>
            <Card padding="lg">
              <pre className="overflow-x-auto rounded-lg bg-surface-sunken p-4 text-mono-md text-content-primary">
                <code>https://mcp-registry-mu.vercel.app</code>
              </pre>
              <Alert variant="info" className="mt-4">
                You can use the API directly from scripts, dashboards,
                documentation tooling, or other registries. If you&apos;re
                building something on top of MCP, this is the most direct
                integration point.
              </Alert>
            </Card>
          </section>

          {/* Endpoints */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Endpoints
            </h2>
            <Card padding="lg">
              <div className="space-y-6">
                <div>
                  <h3 className="text-heading-md text-content-primary">
                    List servers
                  </h3>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-sunken p-4 text-mono-md text-content-primary">
                    <code>GET /api/servers</code>
                  </pre>
                  <p className="mt-2 text-body-md text-content-secondary">
                    Returns a paginated list of MCP servers.
                  </p>
                </div>
                <div>
                  <h3 className="text-heading-md text-content-primary">
                    Get a server by slug
                  </h3>
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-sunken p-4 text-mono-md text-content-primary">
                    <code>GET /api/servers/{"{slug}"}</code>
                  </pre>
                  <p className="mt-2 text-body-md text-content-secondary">
                    Returns a single server object by slug (e.g.{" "}
                    <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                      filesystem
                    </code>
                    ,{" "}
                    <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                      github
                    </code>
                    ).
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* Query Parameters */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Query Parameters
            </h2>
            <p className="mb-4 text-body-md text-content-secondary">
              All parameters are optional for{" "}
              <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                GET /api/servers
              </code>
              .
            </p>
            <Card padding="none">
              <Table>
                <Table.Head>
                  <Table.Row hoverable={false}>
                    <Table.HeaderCell>Parameter</Table.HeaderCell>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Description</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-mono text-mono-sm">
                      q
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      string
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      Searches name and description (case-insensitive)
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-mono text-mono-sm">
                      transport
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      enum
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      One of:{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        stdio
                      </code>{" "}
                      |{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        http
                      </code>{" "}
                      |{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        both
                      </code>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-mono text-mono-sm">
                      auth
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      enum
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      One of:{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        none
                      </code>{" "}
                      |{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        oauth
                      </code>{" "}
                      |{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        api_key
                      </code>{" "}
                      |{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        other
                      </code>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-mono text-mono-sm">
                      verified
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      boolean
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        true
                      </code>{" "}
                      |{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        false
                      </code>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-mono text-mono-sm">
                      tag
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      string
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      Repeatable parameter to filter by tags
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-mono text-mono-sm">
                      sort
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      enum
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      One of:{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        verified
                      </code>{" "}
                      (default) |{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        newest
                      </code>{" "}
                      |{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        name
                      </code>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-mono text-mono-sm">
                      limit
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      integer
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      Number of results per page (default 20, max 50)
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-mono text-mono-sm">
                      cursor
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      string
                    </Table.Cell>
                    <Table.Cell className="text-content-secondary">
                      Opaque cursor from the previous response
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Card>

            <div className="mt-4 space-y-3">
              <p className="text-body-sm text-content-secondary">
                <strong className="text-content-primary">Examples:</strong>
              </p>
              <pre className="overflow-x-auto rounded-lg bg-surface-sunken p-4 text-mono-sm text-content-primary">
                <code>{`/api/servers?q=github
/api/servers?transport=stdio
/api/servers?auth=oauth&verified=true
/api/servers?tag=database&tag=postgres
/api/servers?sort=newest
/api/servers?sort=name&limit=20`}</code>
              </pre>
            </div>
          </section>

          {/* Pagination */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Pagination Model
            </h2>
            <Card padding="lg">
              <p className="text-body-md text-content-secondary">
                The MCP Registry uses cursor pagination (sometimes called keyset
                pagination). This is stable and efficient for large registries.
              </p>
              <p className="mt-3 text-body-md text-content-secondary">
                You paginate by passing the{" "}
                <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                  nextCursor
                </code>{" "}
                value returned by the previous request back into the next
                request:
              </p>
              <ol className="mt-4 space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-body-sm font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    1
                  </span>
                  <span>Request page 1</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-body-sm font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    2
                  </span>
                  <span>
                    Receive{" "}
                    <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                      nextCursor
                    </code>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-body-sm font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    3
                  </span>
                  <span>
                    Request page 2 with{" "}
                    <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                      cursor=nextCursor
                    </code>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-body-sm font-medium text-brand-700 dark:bg-brand-900 dark:text-brand-300">
                    4
                  </span>
                  <span>
                    Repeat until{" "}
                    <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                      nextCursor
                    </code>{" "}
                    is{" "}
                    <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                      null
                    </code>
                  </span>
                </li>
              </ol>
              <p className="mt-4 text-body-sm text-content-tertiary">
                This avoids page-number drift when new servers are added.
              </p>
            </Card>
          </section>

          {/* Response Shape */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Response Shape
            </h2>
            <div className="space-y-6">
              <Card padding="lg">
                <h3 className="text-heading-md text-content-primary">
                  GET /api/servers (200)
                </h3>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-surface-sunken p-4 text-mono-sm text-content-primary">
                  <code>{listResponseExample}</code>
                </pre>
                <ul className="mt-4 space-y-1.5 text-body-sm text-content-secondary">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                    <span>
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        total
                      </code>{" "}
                      is included on the first page (when no cursor is
                      provided).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                    <span>
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        nextCursor
                      </code>{" "}
                      is{" "}
                      <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                        null
                      </code>{" "}
                      when there are no more results.
                    </span>
                  </li>
                </ul>
              </Card>

              <Card padding="lg">
                <h3 className="text-heading-md text-content-primary">
                  GET /api/servers/{"{slug}"} (200)
                </h3>
                <pre className="mt-3 overflow-x-auto rounded-lg bg-surface-sunken p-4 text-mono-sm text-content-primary">
                  <code>{detailResponseExample}</code>
                </pre>
              </Card>
            </div>
          </section>

          {/* Errors */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Errors
            </h2>
            <Card padding="none">
              <Table>
                <Table.Head>
                  <Table.Row hoverable={false}>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Response</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-medium">
                      400 &mdash; Invalid slug format
                    </Table.Cell>
                    <Table.Cell>
                      <code className="font-mono text-mono-sm text-content-secondary">
                        {`{ "error": "Invalid slug format" }`}
                      </code>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-medium">
                      404 &mdash; Not found
                    </Table.Cell>
                    <Table.Cell>
                      <code className="font-mono text-mono-sm text-content-secondary">
                        {`{ "error": "Server not found" }`}
                      </code>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-medium">
                      500 &mdash; Internal error
                    </Table.Cell>
                    <Table.Cell>
                      <code className="font-mono text-mono-sm text-content-secondary">
                        {`{ "error": "Internal server error" }`}
                      </code>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Card>
          </section>

          {/* Caching */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Caching &amp; Freshness
            </h2>
            <Card padding="lg">
              <ul className="space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Responses are cached at the edge for performance.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  List and detail endpoints are cacheable.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Data may remain cached briefly after updates.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  The registry prioritizes reliability and fast reads over
                  immediate propagation.
                </li>
              </ul>
              <p className="mt-4 text-body-md text-content-secondary">
                If you need stricter freshness in your integration, consider:
              </p>
              <ul className="mt-2 space-y-1.5 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Re-requesting after a delay
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  Storing server objects by slug and updating periodically
                </li>
              </ul>
            </Card>
          </section>

          {/* Stability */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              API Stability
            </h2>
            <Card padding="lg">
              <ul className="space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  The public API is designed to be stable.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Field additions may occur over time.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Breaking changes will be avoided whenever possible.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  If a breaking change is necessary, it will be documented
                  publicly.
                </li>
              </ul>
            </Card>
          </section>

          {/* Responsible Use */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Responsible Use
            </h2>
            <Card padding="lg">
              <p className="text-body-md text-content-secondary">
                Please use the API responsibly:
              </p>
              <ul className="mt-3 space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Avoid aggressive polling.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Prefer caching in your own clients when possible.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  If you need higher throughput or specialized endpoints, open
                  an issue with your use case.
                </li>
              </ul>
            </Card>
          </section>

          {/* Links */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Related
            </h2>
            <Card padding="lg">
              <ul className="space-y-2 text-body-md">
                <li>
                  <Link
                    href="/servers"
                    className="text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    Browse the registry &rarr;
                  </Link>
                </li>
                <li>
                  <Link
                    href="/verification"
                    className="text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                  >
                    Learn verification criteria &rarr;
                  </Link>
                </li>
              </ul>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
