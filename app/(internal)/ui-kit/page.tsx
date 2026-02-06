"use client";

import { useState } from "react";

import {
  Alert,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Checkbox,
  CursorPagination,
  EmptyState,
  Input,
  PageNav,
  Select,
  Skeleton,
  Table,
  Toast,
} from "@/components/ui";

export default function UIKitPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(3);
  const [showToast, setShowToast] = useState(false);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-surface-primary pb-20">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-border bg-surface-secondary">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <div>
              <h1 className="text-display-md text-content-primary">
                UI Kit Showcase
              </h1>
              <p className="text-body-sm text-content-secondary">
                Precision Trust Design System Primitives
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setDarkMode(!darkMode)}
              icon={
                darkMode ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )
              }
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </Button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl space-y-16 px-4 py-12">
          {/* Buttons Section */}
          <Section title="Buttons" id="buttons">
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-heading-sm text-content-secondary">
                  Variants
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-heading-sm text-content-secondary">
                  Sizes
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-heading-sm text-content-secondary">
                  States
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                  <Button
                    icon={
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    }
                  >
                    With Icon
                  </Button>
                  <Button
                    icon={
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    }
                    iconPosition="right"
                  >
                    Icon Right
                  </Button>
                </div>
              </div>
            </div>
          </Section>

          {/* Inputs Section */}
          <Section title="Inputs" id="inputs">
            <div className="grid gap-6 sm:grid-cols-2">
              <Input label="Default Input" placeholder="Enter text..." />
              <Input
                label="With Hint"
                placeholder="Enter email..."
                hint="We'll never share your email"
              />
              <Input
                label="With Error"
                placeholder="Enter password..."
                error="Password is required"
                defaultValue="short"
              />
              <Input
                label="With Icon"
                placeholder="Search..."
                icon={
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                }
              />
              <Input label="Disabled" placeholder="Disabled..." disabled />
            </div>
          </Section>

          {/* Select Section */}
          <Section title="Select" id="select">
            <div className="grid gap-6 sm:grid-cols-2">
              <Select
                label="Transport Type"
                placeholder="Select transport..."
                options={[
                  { value: "stdio", label: "Standard I/O" },
                  { value: "sse", label: "Server-Sent Events" },
                  { value: "http", label: "HTTP" },
                ]}
              />
              <Select
                label="With Error"
                error="Please select an option"
                options={[
                  { value: "a", label: "Option A" },
                  { value: "b", label: "Option B" },
                ]}
              />
              <Select
                label="Disabled"
                disabled
                options={[{ value: "disabled", label: "Disabled option" }]}
              />
            </div>
          </Section>

          {/* Checkbox Section */}
          <Section title="Checkbox" id="checkbox">
            <div className="space-y-4">
              <Checkbox label="Default checkbox" />
              <Checkbox label="Checked checkbox" defaultChecked />
              <Checkbox
                label="With description"
                description="This is a helpful description for the checkbox option."
              />
              <Checkbox label="Disabled checkbox" disabled />
              <Checkbox label="Disabled checked" disabled defaultChecked />
            </div>
          </Section>

          {/* Badge Section */}
          <Section title="Badge" id="badge">
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-heading-sm text-content-secondary">
                  Variants
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="brand">Brand</Badge>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-heading-sm text-content-secondary">
                  With Dot
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success" dot>
                    Active
                  </Badge>
                  <Badge variant="warning" dot>
                    Pending
                  </Badge>
                  <Badge variant="error" dot>
                    Offline
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-heading-sm text-content-secondary">
                  Sizes
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-heading-sm text-content-secondary">
                  Removable
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Badge removable onRemove={() => {}}>
                    Tag 1
                  </Badge>
                  <Badge variant="brand" removable onRemove={() => {}}>
                    Tag 2
                  </Badge>
                </div>
              </div>
            </div>
          </Section>

          {/* Card Section */}
          <Section title="Card" id="card">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <Card.Header>
                  <Card.Title>Default Card</Card.Title>
                </Card.Header>
                <Card.Description className="mt-2">
                  This is a basic card with default styling and padding.
                </Card.Description>
              </Card>

              <Card variant="interactive">
                <Card.Header>
                  <Card.Title>Interactive Card</Card.Title>
                </Card.Header>
                <Card.Description className="mt-2">
                  Hover me! I have a shadow and scale effect.
                </Card.Description>
                <Card.Footer>
                  <Badge variant="brand" size="sm">
                    stdio
                  </Badge>
                  <Badge size="sm">api</Badge>
                </Card.Footer>
              </Card>

              <Card variant="selected">
                <Card.Header>
                  <Card.Title>Selected Card</Card.Title>
                </Card.Header>
                <Card.Description className="mt-2">
                  This card appears selected with a brand border.
                </Card.Description>
              </Card>
            </div>
          </Section>

          {/* Table Section */}
          <Section title="Table" id="table">
            <Card padding="none">
              <Table>
                <Table.Head>
                  <Table.Row hoverable={false}>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Transport</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell align="right">Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Filesystem Server</Table.Cell>
                    <Table.Cell>
                      <Badge size="sm">stdio</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="success" dot size="sm">
                        Active
                      </Badge>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>GitHub API</Table.Cell>
                    <Table.Cell>
                      <Badge size="sm">http</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="warning" dot size="sm">
                        Pending
                      </Badge>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Database Connector</Table.Cell>
                    <Table.Cell>
                      <Badge size="sm">sse</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="error" dot size="sm">
                        Error
                      </Badge>
                    </Table.Cell>
                    <Table.Cell align="right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Card>
          </Section>

          {/* Pagination Section */}
          <Section title="Pagination" id="pagination">
            <div className="space-y-8">
              <div>
                <h4 className="mb-2 text-heading-sm text-content-secondary">
                  CursorPagination (Primary)
                </h4>
                <p className="mb-4 text-body-sm text-content-tertiary">
                  Use for cursor-based APIs. This is the default for /servers.
                </p>
                <CursorPagination
                  hasNextPage={true}
                  hasPrevPage={true}
                  onNext={() => {}}
                  onPrev={() => {}}
                />
              </div>
              <div>
                <h4 className="mb-2 text-heading-sm text-content-secondary">
                  PageNav (Numbered)
                </h4>
                <p className="mb-4 text-body-sm text-content-tertiary">
                  Only use when total count is known. Not for /servers.
                </p>
                <PageNav
                  currentPage={currentPage}
                  totalPages={10}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </Section>

          {/* Toast & Alert Section */}
          <Section title="Toast & Alert" id="toast-alert">
            <div className="space-y-8">
              <div>
                <h4 className="mb-2 text-heading-sm text-content-secondary">
                  Alert (Inline, Persistent)
                </h4>
                <p className="mb-4 text-body-sm text-content-tertiary">
                  For contextual messages within content. Not dismissible.
                </p>
                <div className="space-y-4">
                  <Alert variant="info" title="Information">
                    This is an informational alert message.
                  </Alert>
                  <Alert variant="success" title="Success">
                    Your changes have been saved successfully.
                  </Alert>
                  <Alert variant="warning" title="Warning">
                    Please review your submission before continuing.
                  </Alert>
                  <Alert variant="error" title="Error">
                    There was an error processing your request.
                  </Alert>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-heading-sm text-content-secondary">
                  Toast (Transient, Dismissible)
                </h4>
                <p className="mb-4 text-body-sm text-content-tertiary">
                  For temporary feedback after actions. Auto-dismiss or manual
                  close.
                </p>
                <div className="space-y-4">
                  <Button onClick={() => setShowToast(true)}>Show Toast</Button>
                  {showToast && (
                    <div className="max-w-sm">
                      <Toast
                        variant="success"
                        title="Server published!"
                        message="Your server is now live and available in the registry."
                        onClose={() => setShowToast(false)}
                        action={{
                          label: "View Server",
                          onClick: () => setShowToast(false),
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* Empty State Section */}
          <Section title="Empty State" id="empty-state">
            <Card>
              <EmptyState
                icon={
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                    />
                  </svg>
                }
                title="No servers found"
                description="Try adjusting your search or filters to find what you're looking for."
                action={{ label: "Clear filters", onClick: () => {} }}
              />
            </Card>
          </Section>

          {/* Skeleton Section */}
          <Section title="Skeleton" id="skeleton">
            <div className="space-y-8">
              <div>
                <h4 className="mb-4 text-heading-sm text-content-secondary">
                  Basic Skeletons
                </h4>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-4">
                    <Skeleton variant="circular" className="h-10 w-10" />
                    <Skeleton variant="rectangular" className="h-10 w-32" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-heading-sm text-content-secondary">
                  Card Skeleton
                </h4>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Skeleton.Card />
                  <Skeleton.Card />
                  <Skeleton.Card />
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-heading-sm text-content-secondary">
                  Row Skeleton
                </h4>
                <Card padding="none">
                  <Skeleton.Row />
                  <Skeleton.Row />
                  <Skeleton.Row />
                </Card>
              </div>
            </div>
          </Section>

          {/* Breadcrumbs Section */}
          <Section title="Breadcrumbs" id="breadcrumbs">
            <div className="space-y-4">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Servers", href: "/servers" },
                  { label: "filesystem-server" },
                ]}
              />
              <Breadcrumbs
                items={[
                  { label: "Admin", href: "/admin" },
                  { label: "Submissions", href: "/admin/submissions" },
                  { label: "Review #123" },
                ]}
              />
            </div>
          </Section>

          {/* Typography Section */}
          <Section title="Typography" id="typography">
            <div className="space-y-6">
              <div>
                <span className="text-caption text-content-tertiary">
                  display-xl
                </span>
                <p className="text-display-xl text-content-primary">
                  Display Extra Large
                </p>
              </div>
              <div>
                <span className="text-caption text-content-tertiary">
                  display-lg
                </span>
                <p className="text-display-lg text-content-primary">
                  Display Large
                </p>
              </div>
              <div>
                <span className="text-caption text-content-tertiary">
                  display-md
                </span>
                <p className="text-display-md text-content-primary">
                  Display Medium
                </p>
              </div>
              <div>
                <span className="text-caption text-content-tertiary">
                  heading-lg
                </span>
                <p className="text-heading-lg text-content-primary">
                  Heading Large
                </p>
              </div>
              <div>
                <span className="text-caption text-content-tertiary">
                  heading-md
                </span>
                <p className="text-heading-md text-content-primary">
                  Heading Medium
                </p>
              </div>
              <div>
                <span className="text-caption text-content-tertiary">
                  heading-sm
                </span>
                <p className="text-heading-sm text-content-primary">
                  Heading Small
                </p>
              </div>
              <div>
                <span className="text-caption text-content-tertiary">
                  body-lg
                </span>
                <p className="text-body-lg text-content-primary">
                  Body Large - The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              <div>
                <span className="text-caption text-content-tertiary">
                  body-md
                </span>
                <p className="text-body-md text-content-primary">
                  Body Medium - The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              <div>
                <span className="text-caption text-content-tertiary">
                  body-sm
                </span>
                <p className="text-body-sm text-content-primary">
                  Body Small - The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              <div>
                <span className="text-caption text-content-tertiary">
                  caption
                </span>
                <p className="text-caption text-content-primary">
                  Caption text - The quick brown fox jumps over the lazy dog.
                </p>
              </div>
              <div>
                <span className="text-caption text-content-tertiary">
                  mono-md
                </span>
                <p className="font-mono text-mono-md text-content-primary">
                  Monospace Medium - npx mcp-server install
                </p>
              </div>
            </div>
          </Section>

          {/* Colors Section */}
          <Section title="Colors" id="colors">
            <div className="space-y-8">
              <div>
                <h4 className="mb-4 text-heading-sm text-content-secondary">
                  Brand Colors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(
                    (shade) => (
                      <div key={shade} className="text-center">
                        <div
                          className={`h-12 w-12 rounded-lg bg-brand-${shade}`}
                          style={{
                            backgroundColor: `var(--color-primary-${shade})`,
                          }}
                        />
                        <span className="text-caption text-content-tertiary">
                          {shade}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-heading-sm text-content-secondary">
                  Surfaces
                </h4>
                <div className="flex flex-wrap gap-4">
                  <div className="text-center">
                    <div className="h-16 w-24 rounded-lg border border-border bg-surface-primary" />
                    <span className="text-caption text-content-tertiary">
                      primary
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="h-16 w-24 rounded-lg border border-border bg-surface-secondary" />
                    <span className="text-caption text-content-tertiary">
                      secondary
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="h-16 w-24 rounded-lg border border-border bg-surface-elevated" />
                    <span className="text-caption text-content-tertiary">
                      elevated
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="h-16 w-24 rounded-lg border border-border bg-surface-sunken" />
                    <span className="text-caption text-content-tertiary">
                      sunken
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-heading-sm text-content-secondary">
                  Text Colors
                </h4>
                <div className="space-y-2">
                  <p className="text-content-primary">
                    content-primary - Primary text color
                  </p>
                  <p className="text-content-secondary">
                    content-secondary - Secondary text color
                  </p>
                  <p className="text-content-tertiary">
                    content-tertiary - Tertiary text color
                  </p>
                </div>
              </div>
            </div>
          </Section>
        </main>
      </div>
    </div>
  );
}

function Section({
  title,
  id,
  children,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id}>
      <h2 className="mb-6 border-b border-border pb-2 text-display-md text-content-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}
