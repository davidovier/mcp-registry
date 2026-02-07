"use client";

import { useState, useTransition } from "react";

import { approveSubmission, rejectSubmission } from "./actions";
import type { Submission } from "./page";

interface SubmissionCardProps {
  submission: Submission;
  readonly?: boolean;
}

export function SubmissionCard({ submission, readonly }: SubmissionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const payload = submission.submitted_payload;

  async function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveSubmission(submission.id, notes || undefined);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  async function handleReject() {
    if (!notes.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectSubmission(submission.id, notes);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface-secondary">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-content-primary">
              {payload.name}
            </h3>
            <span className="text-sm text-content-tertiary">
              ({payload.slug})
            </span>
            <StatusBadge status={submission.status} />
          </div>
          <p className="text-sm text-content-secondary">
            {payload.description.slice(0, 100)}
            {payload.description.length > 100 ? "..." : ""}
          </p>
        </div>
        <button className="ml-4 text-content-tertiary hover:text-content-secondary">
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Left column - Server details */}
            <div className="space-y-3">
              <DetailRow label="Slug" value={payload.slug} />
              <DetailRow label="Name" value={payload.name} />
              <DetailRow label="Description">
                <p className="text-sm text-content-secondary">
                  {payload.description}
                </p>
              </DetailRow>
              <DetailRow label="Transport" value={payload.transport} />
              <DetailRow label="Auth" value={payload.auth} />
              <DetailRow label="Tags">
                <div className="flex flex-wrap gap-1">
                  {payload.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-surface-sunken px-2 py-0.5 text-xs text-content-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </DetailRow>
              <DetailRow label="Capabilities">
                <div className="flex gap-2 text-sm">
                  {payload.capabilities.tools && (
                    <span className="text-green-600">Tools ✓</span>
                  )}
                  {payload.capabilities.resources && (
                    <span className="text-green-600">Resources ✓</span>
                  )}
                  {payload.capabilities.prompts && (
                    <span className="text-green-600">Prompts ✓</span>
                  )}
                </div>
              </DetailRow>
            </div>

            {/* Right column - URLs and metadata */}
            <div className="space-y-3">
              {payload.homepage_url && (
                <DetailRow label="Homepage">
                  <a
                    href={payload.homepage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:underline"
                  >
                    {payload.homepage_url}
                  </a>
                </DetailRow>
              )}
              {payload.repo_url && (
                <DetailRow label="Repository">
                  <a
                    href={payload.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:underline"
                  >
                    {payload.repo_url}
                  </a>
                </DetailRow>
              )}
              {payload.docs_url && (
                <DetailRow label="Documentation">
                  <a
                    href={payload.docs_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:underline"
                  >
                    {payload.docs_url}
                  </a>
                </DetailRow>
              )}
              <DetailRow
                label="Submitted"
                value={new Date(submission.created_at).toLocaleString()}
              />
              <DetailRow label="Submitted By" value={submission.submitted_by} />
              {submission.schema_version && (
                <DetailRow
                  label="Schema Version"
                  value={submission.schema_version}
                />
              )}
            </div>
          </div>

          {/* Validation errors (if any) */}
          {submission.validation_errors &&
            submission.validation_errors.length > 0 && (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20">
                <p className="mb-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  Validation Errors:
                </p>
                <ul className="list-inside list-disc text-sm text-amber-700 dark:text-amber-300">
                  {submission.validation_errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Review notes (if already reviewed) */}
          {submission.review_notes && (
            <div className="mt-4 rounded-md border border-border bg-surface-sunken p-3">
              <p className="text-xs font-medium text-content-tertiary">
                Review Notes:
              </p>
              <p className="text-sm text-content-secondary">
                {submission.review_notes}
              </p>
            </div>
          )}

          {/* Action buttons (only for pending) */}
          {!readonly && submission.status === "pending" && (
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-content-primary">
                  Notes (required for rejection)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add optional notes for approval, or required reason for rejection..."
                  rows={2}
                  disabled={isPending}
                  className="w-full rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm text-content-primary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isPending ? "..." : "Approve"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isPending ? "..." : "Reject"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-content-tertiary">{label}</dt>
      <dd className="text-sm text-content-primary">{value || children}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: {
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      label: "Pending",
    },
    approved: {
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      label: "Approved",
    },
    rejected: {
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      label: "Rejected",
    },
    invalid: {
      className:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      label: "Invalid",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    className: "bg-surface-sunken text-content-secondary",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
