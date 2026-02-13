import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "My Submissions",
  description: "View your MCP server submissions",
};

interface SubmittedPayload {
  slug: string;
  name: string;
  description: string;
}

interface Submission {
  id: string;
  status: string;
  created_at: string;
  submitted_payload: SubmittedPayload;
  review_notes: string | null;
  validation_errors: string[] | null;
}

export default async function MySubmissionsPage() {
  const supabase = await createClient();

  // Require authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/my/submissions");
  }

  // Fetch user's submissions
  const { data: submissions, error } = await supabase
    .from("mcp_server_submissions")
    .select(
      "id, status, created_at, submitted_payload, review_notes, validation_errors"
    )
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching submissions:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-display-md text-content-primary">
            My Submissions
          </h1>
          <p className="text-content-secondary">
            Track the status of your submitted MCP servers
          </p>
        </div>
        <Link
          href="/submit"
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400"
        >
          Submit New
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Failed to load submissions. Please try again later.
        </div>
      )}

      {!error && (!submissions || submissions.length === 0) && (
        <div className="rounded-lg border border-border bg-surface-sunken p-8 text-center">
          <p className="mb-4 text-content-secondary">
            You haven&apos;t submitted any MCP servers yet.
          </p>
          <Link
            href="/submit"
            className="inline-block rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400"
          >
            Submit Your First Server
          </Link>
        </div>
      )}

      {submissions && submissions.length > 0 && (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const sub = submission as unknown as Submission;
            const payload = sub.submitted_payload;

            return (
              <div
                key={sub.id}
                className="rounded-lg border border-border bg-surface-secondary p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h2 className="font-semibold text-content-primary">
                        {payload.name || "(unnamed)"}
                      </h2>
                      <span className="text-sm text-content-tertiary">
                        ({payload.slug || "no-slug"})
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-content-secondary">
                      {payload.description?.slice(0, 150) || "(no description)"}
                      {(payload.description?.length || 0) > 150 ? "..." : ""}
                    </p>
                    <p className="text-xs text-content-tertiary">
                      Submitted {new Date(sub.created_at).toLocaleDateString()}
                    </p>

                    {/* Validation errors for invalid submissions */}
                    {sub.status === "invalid" && sub.validation_errors && (
                      <div className="mt-3 rounded-md border border-orange-200 bg-orange-50 p-3 dark:border-orange-700 dark:bg-orange-900/20">
                        <p className="mb-1 text-xs font-medium text-orange-700 dark:text-orange-400">
                          Validation Errors:
                        </p>
                        <ul className="list-inside list-disc text-sm text-orange-700 dark:text-orange-300">
                          {sub.validation_errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                        <Link
                          href="/submit"
                          className="mt-2 inline-block text-sm font-medium text-orange-700 underline hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                          Submit again with corrections →
                        </Link>
                      </div>
                    )}

                    {/* Admin review notes */}
                    {sub.review_notes && (
                      <div className="mt-3 rounded-md border border-border bg-surface-sunken p-3">
                        <p className="text-xs font-medium text-content-tertiary">
                          Admin Notes:
                        </p>
                        <p className="text-sm text-content-secondary">
                          {sub.review_notes}
                        </p>
                      </div>
                    )}
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: {
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      label: "Pending Review",
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
