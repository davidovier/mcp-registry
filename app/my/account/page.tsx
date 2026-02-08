import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { DeleteAccountSection } from "./delete-account-section";
import { PasswordForm } from "./password-form";
import { ProfileForm } from "./profile-form";

export const metadata = {
  title: "Account Settings",
  description: "Manage your MCP Registry account",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?next=/my/account");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  // Detect auth provider to conditionally show password section
  const isEmailProvider = user.app_metadata.provider === "email";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-display-md text-content-primary">
        Account Settings
      </h1>

      {/* Profile section */}
      <section className="mb-8 rounded-lg border border-border bg-surface-secondary p-6">
        <h2 className="mb-4 text-heading-sm text-content-primary">Profile</h2>
        <ProfileForm
          initialDisplayName={profile?.display_name ?? null}
          initialEmail={user.email ?? ""}
        />
      </section>

      {/* Password section (only for email/password users) */}
      {isEmailProvider && (
        <section className="mb-8 rounded-lg border border-border bg-surface-secondary p-6">
          <h2 className="mb-4 text-heading-sm text-content-primary">
            Change Password
          </h2>
          <PasswordForm />
        </section>
      )}

      {/* Danger zone */}
      <section className="rounded-lg border border-red-200 bg-surface-secondary p-6 dark:border-red-800">
        <h2 className="mb-4 text-heading-sm text-red-600 dark:text-red-400">
          Danger Zone
        </h2>
        <DeleteAccountSection />
      </section>
    </div>
  );
}
