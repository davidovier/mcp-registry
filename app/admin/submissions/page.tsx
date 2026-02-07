import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { SubmissionCard } from "./submission-card";
import { VerificationCard } from "./verification-card";

export const metadata = {
  title: "Admin: Submissions & Verifications",
  description:
    "Review and moderate MCP server submissions and verification requests",
};

interface SubmittedPayload {
  slug: string;
  name: string;
  description: string;
  homepage_url: string | null;
  repo_url: string | null;
  docs_url: string | null;
  tags: string[];
  transport: string;
  auth: string;
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
  };
}

export interface Submission {
  id: string;
  status: string;
  created_at: string;
  submitted_payload: SubmittedPayload;
  submitted_by: string;
  review_notes: string | null;
  schema_version: string | null;
  validation_errors: string[] | null;
}

export interface VerificationRequestWithServer {
  id: string;
  server_id: string;
  requested_by: string;
  status: string;
  request_notes: string | null;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  server: {
    name: string;
    slug: string;
  } | null;
}

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

export default async function AdminSubmissionsPage({ searchParams }: Props) {
  const { tab = "submissions" } = await searchParams;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/admin/submissions");
  }

  // Check admin status - MUST verify server-side
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  // Fetch submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from("mcp_server_submissions")
    .select(
      "id, status, created_at, submitted_payload, submitted_by, review_notes, schema_version, validation_errors"
    )
    .order("created_at", { ascending: false });

  // Fetch verification requests with server info
  const { data: verificationRequests, error: verificationsError } =
    await supabase
      .from("verification_requests")
      .select(
        `
      id,
      server_id,
      requested_by,
      status,
      request_notes,
      review_notes,
      created_at,
      reviewed_at,
      reviewed_by,
      server:mcp_servers(name, slug)
    `
      )
      .order("created_at", { ascending: false });

  // Separate submissions by status
  const pendingSubmissions =
    submissions?.filter((s) => s.status === "pending") || [];
  const invalidSubmissions =
    submissions?.filter((s) => s.status === "invalid") || [];
  const reviewedSubmissions =
    submissions?.filter(
      (s) => s.status === "approved" || s.status === "rejected"
    ) || [];

  // Separate verification requests by status
  const pendingVerifications =
    verificationRequests?.filter((v) => v.status === "pending") || [];
  const reviewedVerifications =
    verificationRequests?.filter(
      (v) => v.status === "approved" || v.status === "rejected"
    ) || [];

  const activeTab = tab === "verifications" ? "verifications" : "submissions";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-display-md text-content-primary">
          Admin Moderation
        </h1>
        <p className="text-content-secondary">
          Review submissions and verification requests
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-border">
        <nav className="-mb-px flex gap-4">
          <Link
            href="/admin/submissions?tab=submissions"
            className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "submissions"
                ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                : "border-transparent text-content-tertiary hover:border-border-strong hover:text-content-secondary"
            }`}
          >
            Submissions
            {pendingSubmissions.length > 0 && (
              <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                {pendingSubmissions.length}
              </span>
            )}
          </Link>
          <Link
            href="/admin/submissions?tab=verifications"
            className={`border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "verifications"
                ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                : "border-transparent text-content-tertiary hover:border-border-strong hover:text-content-secondary"
            }`}
          >
            Verifications
            {pendingVerifications.length > 0 && (
              <span className="ml-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                {pendingVerifications.length}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* Error states */}
      {(submissionsError || verificationsError) && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Failed to load data. Please try again later.
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === "submissions" && (
        <>
          {/* Pending Submissions */}
          <section className="mb-12">
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Pending Review ({pendingSubmissions.length})
            </h2>

            {pendingSubmissions.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface-sunken p-6 text-center">
                <p className="text-content-secondary">
                  No submissions pending review
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSubmissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission as unknown as Submission}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Invalid Submissions */}
          {invalidSubmissions.length > 0 && (
            <section className="mb-12">
              <details className="group">
                <summary className="mb-4 cursor-pointer text-heading-lg text-content-primary">
                  Invalid Submissions ({invalidSubmissions.length})
                  <span className="ml-2 text-body-sm font-normal text-content-tertiary">
                    (click to expand)
                  </span>
                </summary>
                <p className="mb-4 text-body-sm text-content-tertiary">
                  These submissions failed validation and were automatically
                  marked as invalid. No admin action required.
                </p>
                <div className="space-y-4">
                  {invalidSubmissions.map((submission) => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission as unknown as Submission}
                      readonly
                    />
                  ))}
                </div>
              </details>
            </section>
          )}

          {/* Reviewed Submissions */}
          {reviewedSubmissions.length > 0 && (
            <section>
              <details className="group">
                <summary className="mb-4 cursor-pointer text-heading-lg text-content-primary">
                  Previously Reviewed ({reviewedSubmissions.length})
                  <span className="ml-2 text-body-sm font-normal text-content-tertiary">
                    (click to expand)
                  </span>
                </summary>
                <div className="mb-2 flex gap-4 text-sm text-content-tertiary">
                  <span className="text-green-600 dark:text-green-400">
                    {
                      reviewedSubmissions.filter((s) => s.status === "approved")
                        .length
                    }{" "}
                    approved
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    {
                      reviewedSubmissions.filter((s) => s.status === "rejected")
                        .length
                    }{" "}
                    rejected
                  </span>
                </div>
                <div className="space-y-4">
                  {reviewedSubmissions
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map((submission) => (
                      <SubmissionCard
                        key={submission.id}
                        submission={submission as unknown as Submission}
                        readonly
                      />
                    ))}
                </div>
              </details>
            </section>
          )}
        </>
      )}

      {/* Verifications Tab */}
      {activeTab === "verifications" && (
        <>
          {/* Pending Verifications */}
          <section className="mb-12">
            <h2 className="mb-4 text-heading-lg text-content-primary">
              Pending Verification Requests ({pendingVerifications.length})
            </h2>

            {pendingVerifications.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface-sunken p-6 text-center">
                <p className="text-content-secondary">
                  No verification requests pending review
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingVerifications.map((request) => (
                  <VerificationCard
                    key={request.id}
                    request={
                      request as unknown as VerificationRequestWithServer
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* Reviewed Verifications */}
          {reviewedVerifications.length > 0 && (
            <section>
              <details className="group">
                <summary className="mb-4 cursor-pointer text-heading-lg text-content-primary">
                  Previously Reviewed ({reviewedVerifications.length})
                  <span className="ml-2 text-body-sm font-normal text-content-tertiary">
                    (click to expand)
                  </span>
                </summary>
                <div className="mb-2 flex gap-4 text-sm text-content-tertiary">
                  <span className="text-green-600 dark:text-green-400">
                    {
                      reviewedVerifications.filter(
                        (v) => v.status === "approved"
                      ).length
                    }{" "}
                    approved
                  </span>
                  <span className="text-red-600 dark:text-red-400">
                    {
                      reviewedVerifications.filter(
                        (v) => v.status === "rejected"
                      ).length
                    }{" "}
                    rejected
                  </span>
                </div>
                <div className="space-y-4">
                  {reviewedVerifications
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map((request) => (
                      <VerificationCard
                        key={request.id}
                        request={
                          request as unknown as VerificationRequestWithServer
                        }
                        readonly
                      />
                    ))}
                </div>
              </details>
            </section>
          )}
        </>
      )}
    </div>
  );
}
