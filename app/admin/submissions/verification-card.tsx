"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import type { VerificationRequestWithServer } from "./page";
import {
  approveVerification,
  rejectVerification,
} from "./verification-actions";

interface VerificationCardProps {
  request: VerificationRequestWithServer;
  readonly?: boolean;
}

export function VerificationCard({ request, readonly }: VerificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const serverName = request.server?.name ?? "Unknown Server";
  const serverSlug = request.server?.slug ?? request.server_id;

  async function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveVerification(request.id, notes || undefined);
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
      const result = await rejectVerification(request.id, notes);
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
            <h3 className="font-semibold text-content-primary">{serverName}</h3>
            <Link
              href={`/servers/${serverSlug}`}
              className="text-sm text-brand-600 hover:underline dark:text-brand-400"
              onClick={(e) => e.stopPropagation()}
            >
              View server
            </Link>
            <StatusBadge status={request.status} />
          </div>
          <p className="mt-1 text-sm text-content-secondary">
            Requested by: {request.requested_by.slice(0, 8)}...
            {" • "}
            {new Date(request.created_at).toLocaleDateString()}
          </p>
        </div>
        <button className="ml-4 text-content-tertiary hover:text-content-secondary">
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-border p-4">
          <div className="space-y-3">
            <DetailRow label="Server" value={serverName} />
            <DetailRow label="Server Slug" value={serverSlug} />
            <DetailRow
              label="Requested"
              value={new Date(request.created_at).toLocaleString()}
            />
            <DetailRow label="Requested By" value={request.requested_by} />

            {request.request_notes && (
              <DetailRow label="Request Notes">
                <p className="text-sm text-content-secondary">
                  {request.request_notes}
                </p>
              </DetailRow>
            )}

            {request.reviewed_at && (
              <>
                <DetailRow
                  label="Reviewed"
                  value={new Date(request.reviewed_at).toLocaleString()}
                />
                {request.reviewed_by && (
                  <DetailRow label="Reviewed By" value={request.reviewed_by} />
                )}
              </>
            )}
          </div>

          {/* Review notes (if already reviewed) */}
          {request.review_notes && (
            <div className="mt-4 rounded-md border border-border bg-surface-sunken p-3">
              <p className="text-xs font-medium text-content-tertiary">
                Review Notes:
              </p>
              <p className="text-sm text-content-secondary">
                {request.review_notes}
              </p>
            </div>
          )}

          {/* Action buttons (only for pending) */}
          {!readonly && request.status === "pending" && (
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
                  {isPending ? "..." : "Approve & Verify"}
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
