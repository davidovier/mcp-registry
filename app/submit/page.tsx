import { redirect } from "next/navigation";

import { SubmitForm } from "@/components/submit";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Submit a Server | MCP Registry",
  description: "Submit a new MCP server to the registry for review",
};

export default async function SubmitPage() {
  const supabase = await createClient();

  // Require authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/submit");
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <header className="mb-8 lg:mb-12">
          <h1 className="text-display-md text-content-primary">
            Submit a server
          </h1>
          <p className="mt-2 text-body-lg text-content-secondary">
            All submissions are reviewed before publishing.
          </p>
        </header>

        <SubmitForm />
      </div>
    </div>
  );
}
