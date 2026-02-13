"use client";

import Link from "next/link";
import { useState, useTransition, useCallback, useRef, useEffect } from "react";

import { submitServer } from "@/app/submit/actions";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  listingSchemaV1,
  type Transport,
  type Auth,
} from "@/lib/validation/listing-schema";

import { FormSection } from "./FormSection";
import { SubmitPreview } from "./SubmitPreview";
import { TagInput } from "./TagInput";

// Field error types matching the schema
interface FieldErrors {
  slug?: string;
  name?: string;
  description?: string;
  homepage_url?: string;
  repo_url?: string;
  docs_url?: string;
  tags?: string;
  transport?: string;
  auth?: string;
  capabilities?: string;
}

// Transport options with descriptions
const transportOptions = [
  {
    value: "stdio",
    label: "stdio",
    description: "Runs as a local process, communicates via stdin/stdout",
  },
  {
    value: "http",
    label: "http",
    description: "Runs as an HTTP server, communicates via HTTP requests",
  },
  {
    value: "both",
    label: "both",
    description: "Supports both stdio and HTTP transports",
  },
];

// Auth options with descriptions
const authOptions = [
  {
    value: "none",
    label: "None",
    description: "No authentication required",
  },
  {
    value: "oauth",
    label: "OAuth",
    description: "Uses OAuth 2.0 for authentication",
  },
  {
    value: "api_key",
    label: "API Key",
    description: "Requires an API key for access",
  },
  {
    value: "other",
    label: "Other",
    description: "Uses a different authentication method",
  },
];

export function SubmitForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Form state for live preview
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [transport, setTransport] = useState<Transport | "">("");
  const [auth, setAuth] = useState<Auth | "">("");
  const [capabilities, setCapabilities] = useState({
    tools: false,
    resources: false,
    prompts: false,
  });

  // URL fields
  const [homepageUrl, setHomepageUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");

  // Auto-generate slug from name
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      setName(newName);

      // Only auto-generate if slug hasn't been manually edited
      if (!slug || slug === generateSlug(name)) {
        setSlug(generateSlug(newName));
      }
    },
    [name, slug]
  );

  // Generate a valid slug from a name
  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);
  }

  // Client-side preflight validation using Zod
  const validateClient = useCallback((): FieldErrors => {
    const result = listingSchemaV1.safeParse({
      slug,
      name,
      description,
      homepage_url: homepageUrl || undefined,
      repo_url: repoUrl || undefined,
      docs_url: docsUrl || undefined,
      tags,
      transport: transport || undefined,
      auth: auth || undefined,
      capabilities,
    });

    if (result.success) {
      return {};
    }

    const newErrors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const path = issue.path[0];
      if (typeof path === "string") {
        const fieldName = path as keyof FieldErrors;
        if (!newErrors[fieldName]) {
          newErrors[fieldName] = issue.message;
        }
      }
    }

    // Add transport/auth errors if not selected
    if (!transport) {
      newErrors.transport = "Please select a transport method";
    }
    if (!auth) {
      newErrors.auth = "Please select an authentication method";
    }

    return newErrors;
  }, [
    slug,
    name,
    description,
    homepageUrl,
    repoUrl,
    docsUrl,
    tags,
    transport,
    auth,
    capabilities,
  ]);

  // Focus first error field
  useEffect(() => {
    if (Object.keys(errors).length > 0 && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
  }, [errors]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Reset state
    setErrors({});
    setGeneralError(null);

    // Client-side validation
    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    if (!confirmAccurate) {
      setGeneralError("Please confirm that the information is accurate.");
      return;
    }

    // Build form data for server action
    const formData = new FormData();
    formData.set("slug", slug);
    formData.set("name", name);
    formData.set("description", description);
    formData.set("homepage_url", homepageUrl);
    formData.set("repo_url", repoUrl);
    formData.set("docs_url", docsUrl);
    formData.set("tags", tags.join(","));
    formData.set("transport", transport);
    formData.set("auth", auth);
    if (capabilities.tools) formData.set("cap_tools", "on");
    if (capabilities.resources) formData.set("cap_resources", "on");
    if (capabilities.prompts) formData.set("cap_prompts", "on");

    startTransition(async () => {
      const result = await submitServer(formData);

      if (result.error) {
        // Try to map server error to field
        const errorLower = result.error.toLowerCase();
        if (errorLower.includes("slug")) {
          setErrors({ slug: result.error });
        } else if (errorLower.includes("name")) {
          setErrors({ name: result.error });
        } else if (errorLower.includes("description")) {
          setErrors({ description: result.error });
        } else {
          setGeneralError(result.error);
        }
      } else {
        setSuccess(true);
      }
    });
  }

  // Success state
  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
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
        </div>
        <h2 className="mb-2 text-heading-md text-green-800 dark:text-green-400">
          Submission received
        </h2>
        <p className="mb-6 text-body-md text-green-700 dark:text-green-500">
          Your server has been submitted for review. You&apos;ll be notified
          when it&apos;s approved.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/my/submissions"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 font-medium text-white transition-all duration-150 hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98] dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400"
          >
            View my submissions
          </Link>
          <Link
            href="/servers"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-4 font-medium text-content-primary transition-all duration-150 hover:border-border-strong hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Browse registry
          </Link>
        </div>
      </div>
    );
  }

  // Check if missing docs/repo (show warning)
  const missingDocsOrRepo = !docsUrl && !repoUrl;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
      {/* Form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex-1 space-y-8"
        noValidate
      >
        {/* Error summary for screen readers */}
        {(generalError || Object.keys(errors).length > 0) && (
          <div
            ref={errorSummaryRef}
            tabIndex={-1}
            role="alert"
            aria-live="polite"
          >
            {generalError && (
              <Alert variant="error" title="Submission error">
                {generalError}
              </Alert>
            )}
          </div>
        )}

        {/* Section 1: Identity */}
        <FormSection
          title="Identity"
          description="How your server will be identified in the registry"
          alwaysOpen
        >
          <Input
            label="Name"
            value={name}
            onChange={handleNameChange}
            placeholder="GitHub MCP Server"
            maxLength={100}
            showCount
            error={errors.name}
            hint="A clear, descriptive name for your server"
            disabled={isPending}
            required
          />

          <Input
            label="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="github"
            maxLength={50}
            showCount
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            error={errors.slug}
            hint="URL-safe identifier: lowercase letters, numbers, hyphens"
            disabled={isPending}
            required
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provides access to GitHub repositories, issues, and pull requests. Ideal for developers who want to integrate GitHub data into their AI workflows."
            maxLength={500}
            showCount
            error={errors.description}
            hint="Explain what your server does, who it's for, and any notable constraints"
            disabled={isPending}
            required
          />

          <TagInput
            label="Tags"
            value={tags}
            onChange={setTags}
            maxTags={10}
            error={errors.tags}
            hint="Press Enter or comma to add. Tags help users discover your server."
            disabled={isPending}
          />
        </FormSection>

        {/* Section 2: Connection & Capabilities */}
        <FormSection
          title="Connection & capabilities"
          description="How users will connect to and use your server"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Transport"
              value={transport}
              onChange={(e) => setTransport(e.target.value as Transport)}
              options={transportOptions.map((opt) => ({
                value: opt.value,
                label: `${opt.label}`,
              }))}
              placeholder="Select transport..."
              error={errors.transport}
              hint={
                transport
                  ? transportOptions.find((o) => o.value === transport)
                      ?.description
                  : "How the server communicates"
              }
              disabled={isPending}
              required
            />

            <Select
              label="Authentication"
              value={auth}
              onChange={(e) => setAuth(e.target.value as Auth)}
              options={authOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              placeholder="Select auth method..."
              error={errors.auth}
              hint={
                auth
                  ? authOptions.find((o) => o.value === auth)?.description
                  : "What credentials users need"
              }
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="block text-body-sm font-medium text-content-primary">
              Capabilities
            </label>
            <p className="text-caption text-content-tertiary">
              Select what your server provides to MCP clients
            </p>
            <div className="flex flex-wrap gap-6">
              <Checkbox
                label="Tools"
                description="Functions that perform actions"
                checked={capabilities.tools}
                onChange={(e) =>
                  setCapabilities((c) => ({ ...c, tools: e.target.checked }))
                }
                disabled={isPending}
              />
              <Checkbox
                label="Resources"
                description="Data or files to access"
                checked={capabilities.resources}
                onChange={(e) =>
                  setCapabilities((c) => ({
                    ...c,
                    resources: e.target.checked,
                  }))
                }
                disabled={isPending}
              />
              <Checkbox
                label="Prompts"
                description="Pre-built prompt templates"
                checked={capabilities.prompts}
                onChange={(e) =>
                  setCapabilities((c) => ({ ...c, prompts: e.target.checked }))
                }
                disabled={isPending}
              />
            </div>
          </div>
        </FormSection>

        {/* Section 3: Links */}
        <FormSection
          title="Links"
          description="Help users and reviewers learn more about your server"
        >
          {missingDocsOrRepo && (
            <Alert variant="warning">
              Providing a repository or documentation URL helps reviewers verify
              your submission and users understand how to use it.
            </Alert>
          )}

          <Input
            label="Homepage URL"
            type="url"
            value={homepageUrl}
            onChange={(e) => setHomepageUrl(e.target.value)}
            placeholder="https://example.com/my-server"
            error={errors.homepage_url}
            hint="Main website or landing page for your server"
            disabled={isPending}
          />

          <Input
            label="Repository URL"
            type="url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/username/my-mcp-server"
            error={errors.repo_url}
            hint="Source code repository (GitHub, GitLab, etc.)"
            disabled={isPending}
          />

          <Input
            label="Documentation URL"
            type="url"
            value={docsUrl}
            onChange={(e) => setDocsUrl(e.target.value)}
            placeholder="https://docs.example.com/my-server"
            error={errors.docs_url}
            hint="Setup guides, API reference, or usage examples"
            disabled={isPending}
          />
        </FormSection>

        {/* Section 4: Review & Submit */}
        <FormSection
          title="Review & submit"
          description="Confirm your submission is ready for review"
        >
          <div className="rounded-lg border border-border bg-surface-sunken p-4">
            <h3 className="mb-3 text-body-sm font-medium text-content-primary">
              Submission checklist
            </h3>
            <ul className="space-y-2 text-body-sm text-content-secondary">
              <li className="flex items-start gap-2">
                <span
                  className={
                    name.length > 0 ? "text-green-500" : "text-content-tertiary"
                  }
                >
                  {name.length > 0 ? "✓" : "○"}
                </span>
                Name clearly describes the integration
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={
                    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
                      ? "text-green-500"
                      : "text-content-tertiary"
                  }
                >
                  {/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? "✓" : "○"}
                </span>
                Slug is valid and stable
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={
                    description.length >= 20
                      ? "text-green-500"
                      : "text-content-tertiary"
                  }
                >
                  {description.length >= 20 ? "✓" : "○"}
                </span>
                Description explains what it does and who it&apos;s for
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={
                    repoUrl || docsUrl ? "text-green-500" : "text-amber-500"
                  }
                >
                  {repoUrl || docsUrl ? "✓" : "!"}
                </span>
                Repository or documentation URL provided
                {!repoUrl && !docsUrl && (
                  <span className="text-amber-500"> (recommended)</span>
                )}
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={
                    transport && auth
                      ? "text-green-500"
                      : "text-content-tertiary"
                  }
                >
                  {transport && auth ? "✓" : "○"}
                </span>
                Transport and authentication specified
              </li>
            </ul>
          </div>

          <Checkbox
            label="I confirm this information is accurate"
            description="Submissions are reviewed before publishing. Inaccurate information may delay approval."
            checked={confirmAccurate}
            onChange={(e) => setConfirmAccurate(e.target.checked)}
            disabled={isPending}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isPending}
              disabled={!confirmAccurate}
              className="flex-1 sm:flex-none"
            >
              {isPending ? "Submitting..." : "Submit for review"}
            </Button>
            <Link
              href="/servers"
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-surface-secondary px-6 text-body-lg font-medium text-content-primary transition-all duration-150 hover:border-border-strong hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 active:scale-[0.98] sm:flex-none"
            >
              Cancel
            </Link>
          </div>
        </FormSection>
      </form>

      {/* Live Preview - sticky on desktop */}
      <aside className="lg:sticky lg:top-8 lg:h-fit lg:w-80 xl:w-96">
        <SubmitPreview
          name={name}
          slug={slug}
          description={description}
          tags={tags}
          transport={transport}
          auth={auth}
          capabilities={capabilities}
        />
      </aside>
    </div>
  );
}
