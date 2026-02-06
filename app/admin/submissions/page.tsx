import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { SubmissionCard } from "./submission-card";

export const metadata = {
  title: "Admin: Submissions",
  description: "Review and moderate MCP server submissions",
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
}

export default async function AdminSubmissionsPage() {
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
    // Not an admin - redirect to home
    redirect("/");
  }

  // Fetch all submissions (admins can see all via RLS)
  const { data: submissions, error } = await supabase
    .from("mcp_server_submissions")
    .select(
      "id, status, created_at, submitted_payload, submitted_by, review_notes"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching submissions:", error);
  }

  // Separate by status
  const pending = submissions?.filter((s) => s.status === "pending") || [];
  const reviewed = submissions?.filter((s) => s.status !== "pending") || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Submission Moderation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and approve or reject submitted MCP servers
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Failed to load submissions. Please try again later.
        </div>
      )}

      {/* Pending Submissions */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Pending Review ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-gray-600 dark:text-gray-400">
              No submissions pending review
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission as unknown as Submission}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reviewed Submissions */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Previously Reviewed ({reviewed.length})
        </h2>

        {reviewed.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <p className="text-gray-600 dark:text-gray-400">
              No reviewed submissions yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewed.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission as unknown as Submission}
                readonly
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
