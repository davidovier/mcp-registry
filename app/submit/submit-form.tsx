"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { submitServer } from "./actions";

interface FormErrors {
  slug?: string;
  name?: string;
  description?: string;
  homepage_url?: string;
  repo_url?: string;
  docs_url?: string;
  tags?: string;
  transport?: string;
  auth?: string;
}

export function SubmitForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setErrors({});
    setGeneralError(null);
    setSuccess(false);

    // Client-side validation
    const slug = formData.get("slug") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const homepage_url = formData.get("homepage_url") as string;
    const repo_url = formData.get("repo_url") as string;
    const docs_url = formData.get("docs_url") as string;
    const _tags = formData.get("tags") as string; // Validated server-side only
    const transport = formData.get("transport") as string;
    const auth = formData.get("auth") as string;

    const newErrors: FormErrors = {};

    // Slug validation
    if (!slug) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      newErrors.slug =
        "Slug must be lowercase letters, numbers, and hyphens only (e.g., my-server)";
    } else if (slug.length > 50) {
      newErrors.slug = "Slug must be 50 characters or less";
    }

    // Name validation
    if (!name) {
      newErrors.name = "Name is required";
    } else if (name.length > 100) {
      newErrors.name = "Name must be 100 characters or less";
    }

    // Description validation
    if (!description) {
      newErrors.description = "Description is required";
    } else if (description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    // URL validation (optional fields)
    const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    if (homepage_url && !urlRegex.test(homepage_url)) {
      newErrors.homepage_url = "Please enter a valid URL";
    }
    if (repo_url && !urlRegex.test(repo_url)) {
      newErrors.repo_url = "Please enter a valid URL";
    }
    if (docs_url && !urlRegex.test(docs_url)) {
      newErrors.docs_url = "Please enter a valid URL";
    }

    // Transport validation
    if (!transport || !["stdio", "http", "both"].includes(transport)) {
      newErrors.transport = "Please select a transport method";
    }

    // Auth validation
    if (!auth || !["none", "oauth", "api_key", "other"].includes(auth)) {
      newErrors.auth = "Please select an authentication method";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit to server
    startTransition(async () => {
      const result = await submitServer(formData);

      if (result.error) {
        setGeneralError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-900/20">
        <h2 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-400">
          Submission Received!
        </h2>
        <p className="mb-4 text-green-700 dark:text-green-500">
          Your MCP server has been submitted for review. You can track its
          status on your submissions page.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/my/submissions"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            View My Submissions
          </Link>
          <Link
            href="/servers"
            className="rounded-md border border-green-600 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400"
          >
            Browse Registry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {generalError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {generalError}
        </div>
      )}

      {/* Slug */}
      <div>
        <label
          htmlFor="slug"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          placeholder="my-mcp-server"
          pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
          maxLength={50}
          required
          disabled={isPending}
          className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.slug}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          URL-safe identifier (lowercase, hyphens allowed)
        </p>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="My MCP Server"
          maxLength={100}
          required
          disabled={isPending}
          className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="A brief description of what your MCP server does..."
          maxLength={500}
          required
          disabled={isPending}
          className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.description}
          </p>
        )}
      </div>

      {/* URLs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label
            htmlFor="homepage_url"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Homepage URL
          </label>
          <input
            type="url"
            id="homepage_url"
            name="homepage_url"
            placeholder="https://..."
            disabled={isPending}
            className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {errors.homepage_url && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.homepage_url}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="repo_url"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Repository URL
          </label>
          <input
            type="url"
            id="repo_url"
            name="repo_url"
            placeholder="https://github.com/..."
            disabled={isPending}
            className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {errors.repo_url && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.repo_url}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="docs_url"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Documentation URL
          </label>
          <input
            type="url"
            id="docs_url"
            name="docs_url"
            placeholder="https://..."
            disabled={isPending}
            className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {errors.docs_url && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.docs_url}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="tags"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Tags
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          placeholder="ai, tools, database"
          disabled={isPending}
          className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.tags}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Comma-separated list of tags
        </p>
      </div>

      {/* Transport and Auth */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="transport"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Transport <span className="text-red-500">*</span>
          </label>
          <select
            id="transport"
            name="transport"
            required
            disabled={isPending}
            defaultValue=""
            className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="" disabled>
              Select transport...
            </option>
            <option value="stdio">stdio</option>
            <option value="http">http</option>
            <option value="both">both</option>
          </select>
          {errors.transport && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.transport}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="auth"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Authentication <span className="text-red-500">*</span>
          </label>
          <select
            id="auth"
            name="auth"
            required
            disabled={isPending}
            defaultValue=""
            className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="" disabled>
              Select auth method...
            </option>
            <option value="none">None</option>
            <option value="oauth">OAuth</option>
            <option value="api_key">API Key</option>
            <option value="other">Other</option>
          </select>
          {errors.auth && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.auth}
            </p>
          )}
        </div>
      </div>

      {/* Capabilities */}
      <div>
        <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Capabilities
        </span>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="cap_tools"
              disabled={isPending}
              className="text-primary-600 focus:ring-primary-500 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Tools
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="cap_resources"
              disabled={isPending}
              className="text-primary-600 focus:ring-primary-500 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Resources
            </span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="cap_prompts"
              disabled={isPending}
              className="text-primary-600 focus:ring-primary-500 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Prompts
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 flex-1 rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 sm:flex-none"
        >
          {isPending ? "Submitting..." : "Submit for Review"}
        </button>
        <Link
          href="/servers"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
