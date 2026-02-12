import type { Metadata } from "next";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "How to discover, evaluate, and publish MCP servers on the registry.",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Documentation" }]}
          className="mb-8"
        />

        {/* Page header */}
        <div className="mb-12">
          <h1 className="text-display-md text-content-primary sm:text-display-lg">
            Documentation
          </h1>
          <p className="mt-3 text-body-lg text-content-secondary">
            How to discover, evaluate, and publish MCP servers.
          </p>
        </div>

        <div className="space-y-10">
          {/* What is MCP? */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              What is MCP?
            </h2>
            <Card padding="lg">
              <p className="text-body-md text-content-secondary">
                Model Context Protocol (MCP) is a protocol that allows AI
                systems to connect to external tools, resources, and prompts
                through structured servers.
              </p>
              <p className="mt-3 text-body-md text-content-secondary">
                An MCP server exposes capabilities that a model can call or
                reference. These may include:
              </p>
              <ul className="mt-3 space-y-1.5 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-content-primary">Tools</strong>{" "}
                    &mdash; callable functions or actions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-content-primary">Resources</strong>{" "}
                    &mdash; external data or systems
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-content-primary">Prompts</strong>{" "}
                    &mdash; reusable structured prompt templates
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-body-md text-content-secondary">
                Each server defines how it communicates (transport), how it
                authenticates (auth), and what capabilities it provides.
              </p>
            </Card>
          </section>

          {/* Glossary */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Glossary
            </h2>
            <Card padding="none">
              <Table>
                <Table.Head>
                  <Table.Row hoverable={false}>
                    <Table.HeaderCell>Term</Table.HeaderCell>
                    <Table.HeaderCell>Description</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="font-medium">Server</Table.Cell>
                    <Table.Cell>
                      A process or service that exposes tools, resources, or
                      prompts via MCP.
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="align-top font-medium">
                      Transport
                    </Table.Cell>
                    <Table.Cell>
                      <p>How the server communicates:</p>
                      <ul className="mt-1.5 space-y-1">
                        <li>
                          <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                            stdio
                          </code>{" "}
                          &mdash; runs locally via standard input/output
                        </li>
                        <li>
                          <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                            http
                          </code>{" "}
                          &mdash; runs as a network service over HTTP
                        </li>
                        <li>
                          <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                            both
                          </code>{" "}
                          &mdash; supports both modes
                        </li>
                      </ul>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="align-top font-medium">
                      Authentication
                    </Table.Cell>
                    <Table.Cell>
                      <p>How access is controlled:</p>
                      <ul className="mt-1.5 space-y-1">
                        <li>
                          <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                            none
                          </code>{" "}
                          &mdash; no authentication required
                        </li>
                        <li>
                          <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                            oauth
                          </code>{" "}
                          &mdash; OAuth-based flow
                        </li>
                        <li>
                          <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                            api_key
                          </code>{" "}
                          &mdash; static key required
                        </li>
                        <li>
                          <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                            other
                          </code>{" "}
                          &mdash; custom or non-standard authentication
                        </li>
                      </ul>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row hoverable={false}>
                    <Table.Cell className="align-top font-medium">
                      Capabilities
                    </Table.Cell>
                    <Table.Cell>
                      <p>The types of functionality exposed:</p>
                      <ul className="mt-1.5 space-y-1">
                        <li>
                          <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                            tools
                          </code>{" "}
                          &mdash; executable functions
                        </li>
                        <li>
                          <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                            resources
                          </code>{" "}
                          &mdash; external data or systems
                        </li>
                        <li>
                          <code className="font-mono text-mono-sm text-brand-700 dark:text-brand-400">
                            prompts
                          </code>{" "}
                          &mdash; reusable structured prompts
                        </li>
                      </ul>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Card>
          </section>

          {/* Using the Registry */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Using the Registry
            </h2>
            <Card padding="lg">
              <p className="text-body-md text-content-secondary">
                The registry is designed to help you evaluate and compare MCP
                servers quickly.
              </p>

              <h3 className="mb-3 mt-6 text-heading-md text-content-primary">
                Discovering servers
              </h3>
              <ul className="space-y-1.5 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Search by name or description.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Filter by transport and authentication type.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Review tags for domain or integration context.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  See which servers are verified.
                </li>
              </ul>

              <h3 className="mb-3 mt-6 text-heading-md text-content-primary">
                Understanding trust signals
              </h3>
              <p className="text-body-md text-content-secondary">
                Each server page includes signals that help you assess quality:
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="brand">Verified</Badge>
                <Badge variant="default">Repository link</Badge>
                <Badge variant="default">Documentation link</Badge>
                <Badge variant="default">Authentication type</Badge>
                <Badge variant="default">Recently updated</Badge>
              </div>
              <p className="mt-4 text-body-sm text-content-tertiary">
                These are indicators, not guarantees. Always review
                documentation and source code before deploying in production
                environments.
              </p>
            </Card>
          </section>

          {/* Integration Examples */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Integration Examples
            </h2>
            <Alert variant="info">
              Exact configuration depends on your client or runtime. The
              examples below illustrate common patterns.
            </Alert>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Card padding="lg">
                <h3 className="mb-3 text-heading-sm text-content-primary">
                  Example: stdio transport
                </h3>
                <pre className="overflow-x-auto rounded-lg bg-surface-sunken p-4 text-mono-sm text-content-primary">
                  <code>{`{
  "mcpServers": {
    "filesystem": {
      "command": "node",
      "args": ["server.js"]
    }
  }
}`}</code>
                </pre>
                <p className="mt-3 text-body-sm text-content-tertiary">
                  Use this when running a local MCP server as a process.
                </p>
              </Card>

              <Card padding="lg">
                <h3 className="mb-3 text-heading-sm text-content-primary">
                  Example: http transport
                </h3>
                <pre className="overflow-x-auto rounded-lg bg-surface-sunken p-4 text-mono-sm text-content-primary">
                  <code>{`{
  "mcpServers": {
    "web-search": {
      "url": "https://example.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}`}</code>
                </pre>
                <p className="mt-3 text-body-sm text-content-tertiary">
                  Use this when connecting to a remote MCP server over HTTP.
                  Authentication requirements depend on the specific server
                  implementation.
                </p>
              </Card>
            </div>
          </section>

          {/* Submitting a Server */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Submitting a Server
            </h2>
            <Card padding="lg">
              <p className="text-body-md text-content-secondary">
                Anyone can submit an MCP server to the registry.
              </p>

              <h3 className="mb-3 mt-6 text-heading-md text-content-primary">
                The process
              </h3>
              <ol className="space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-caption font-medium text-brand-800 dark:bg-brand-900/50 dark:text-brand-300">
                    1
                  </span>
                  Submit server details through the form.
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-caption font-medium text-brand-800 dark:bg-brand-900/50 dark:text-brand-300">
                    2
                  </span>
                  Validation checks are applied.
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-caption font-medium text-brand-800 dark:bg-brand-900/50 dark:text-brand-300">
                    3
                  </span>
                  A review determines whether it is published.
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-caption font-medium text-brand-800 dark:bg-brand-900/50 dark:text-brand-300">
                    4
                  </span>
                  The server appears in the public registry.
                </li>
              </ol>

              <h3 className="mb-3 mt-6 text-heading-md text-content-primary">
                Good submission checklist
              </h3>
              <p className="mb-3 text-body-md text-content-secondary">
                A good submission:
              </p>
              <ul className="space-y-2 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Has a clear name that matches the integration (e.g.,
                  &ldquo;GitHub MCP Server&rdquo;).
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Uses a URL-safe slug (lowercase letters, numbers, hyphens).
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>
                    Includes a description explaining: what the server does, who
                    it is for, and any constraints or requirements.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Accurately specifies transport and authentication.
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Uses specific, helpful tags (maximum 10).
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Provides a repository URL (strongly recommended).
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Provides documentation (strongly recommended).
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Correctly declares capabilities (tools/resources/prompts).
                </li>
              </ul>
            </Card>

            <Card padding="lg" className="mt-4">
              <h3 className="mb-3 text-heading-sm text-content-primary">
                Common reasons submissions are rejected
              </h3>
              <ul className="space-y-1.5 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Incomplete or unclear descriptions.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Misleading capability claims.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Missing or broken documentation links.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Slug conflicts.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Non-functional or placeholder implementations.
                </li>
              </ul>
            </Card>
          </section>

          {/* Verification */}
          <section>
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Verification
            </h2>
            <p className="mb-4 text-body-md text-content-secondary">
              Verification is an additional review layer.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card padding="lg">
                <h3 className="mb-3 text-heading-sm text-content-primary">
                  What &ldquo;Verified&rdquo; means
                </h3>
                <p className="mb-3 text-body-md text-content-secondary">
                  A verified server has:
                </p>
                <ul className="space-y-1.5 text-body-md text-content-secondary">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                    Been reviewed by registry maintainers.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                    Clear documentation and repository references.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                    Accurate transport and authentication metadata.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                    No misleading or contradictory claims.
                  </li>
                </ul>
                <p className="mt-3 text-body-sm text-content-tertiary">
                  Verification focuses on clarity, transparency, and metadata
                  accuracy.
                </p>
              </Card>

              <Card padding="lg">
                <h3 className="mb-3 text-heading-sm text-content-primary">
                  What &ldquo;Verified&rdquo; does not mean
                </h3>
                <p className="mb-3 text-body-md text-content-secondary">
                  Verification does not guarantee:
                </p>
                <ul className="space-y-1.5 text-body-md text-content-secondary">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                    Security.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                    Uptime.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                    Long-term maintenance.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                    Endorsement of functionality.
                  </li>
                </ul>
                <p className="mt-3 text-body-sm text-content-tertiary">
                  Users remain responsible for evaluating and deploying servers
                  appropriately.
                </p>
              </Card>
            </div>

            <Card padding="lg" className="mt-4">
              <h3 className="mb-3 text-heading-sm text-content-primary">
                Requesting verification
              </h3>
              <p className="text-body-md text-content-secondary">
                If you are the owner of a published server, you can request
                verification from the server detail page.
              </p>
              <p className="mt-3 text-body-md text-content-secondary">
                Review criteria typically include:
              </p>
              <ul className="mt-2 space-y-1.5 text-body-md text-content-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Public source repository.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Clear installation instructions.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Maintained project state.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  Accurate metadata.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-content-tertiary" />
                  No misleading claims.
                </li>
              </ul>
              <p className="mt-3 text-body-sm text-content-tertiary">
                Verification decisions may evolve as the ecosystem grows.
              </p>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
