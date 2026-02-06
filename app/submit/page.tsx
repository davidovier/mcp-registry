import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { SubmitForm } from "./submit-form";

export const metadata = {
  title: "Submit MCP Server",
  description: "Submit a new MCP server to the registry",
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
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Submit MCP Server
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Submit a new MCP server to the registry. Your submission will be
            reviewed by an admin before being published.
          </p>
        </div>

        <SubmitForm />
      </div>
    </div>
  );
}
