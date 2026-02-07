import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { SignInForm } from "./signin-form";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your MCP Registry account",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  // Check if user is already signed in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-border bg-surface-secondary p-8 shadow-card">
          <div className="mb-6 text-center">
            <h1 className="mb-2 text-display-md text-content-primary">
              Sign In
            </h1>
            <p className="text-body-sm text-content-secondary">
              Enter your email to receive a magic link
            </p>
          </div>

          {params.error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {params.error === "auth_failed"
                ? "Authentication failed. Please try again."
                : params.error}
            </div>
          )}

          {params.message && (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
              {params.message}
            </div>
          )}

          <SignInForm />
        </div>
      </div>
    </div>
  );
}
