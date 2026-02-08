"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Update the user's display name.
 */
export async function updateProfile(displayName: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName || null })
    .eq("id", user.id);

  if (error) {
    console.error("Update profile error:", error.message);
    return { error: "Failed to update profile." };
  }

  return { success: true };
}

/**
 * Update the user's email address (sends confirmation email).
 */
export async function updateEmail(newEmail: string) {
  const supabase = await createClient();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!newEmail || !emailRegex.test(newEmail)) {
    return { error: "Please enter a valid email address" };
  }

  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) {
    console.error("Update email error:", error.message);
    return { error: "Failed to update email. Please try again." };
  }

  return { success: true };
}

/**
 * Update the user's password.
 */
export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.error("Update password error:", error.message);
    return { error: "Failed to update password. Please try again." };
  }

  return { success: true };
}

/**
 * Permanently delete the user's account.
 */
export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("Delete account error:", error.message);
    return { error: "Failed to delete account. Please try again." };
  }

  // Sign out and redirect
  await supabase.auth.signOut();
  redirect("/");
}
