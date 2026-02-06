"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Send a magic link to the user's email address.
 */
export async function signInWithMagicLink(email: string) {
  const supabase = await createClient();
  const headersList = await headers();

  // Get the origin for the redirect URL
  const origin = headersList.get("origin") ?? "http://localhost:3000";

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("Sign in error:", error.message);
    return { error: "Failed to send magic link. Please try again." };
  }

  return { success: true };
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
