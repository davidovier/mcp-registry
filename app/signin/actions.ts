"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Send a magic link to the user's email address.
 */
export async function signInWithMagicLink(email: string) {
  const supabase = await createClient();

  const siteUrl = getSiteUrl();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("Sign in error:", error.message);
    return { error: "Failed to send magic link. Please try again." };
  }

  return { success: true };
}

/**
 * Sign in with email and password.
 */
export async function signInWithPassword(email: string, password: string) {
  const supabase = await createClient();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { error: "Please enter a valid email address" };
  }
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Sign in error:", error.message);
    return { error: "Invalid email or password." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Sign up with email and password.
 */
export async function signUpWithPassword(email: string, password: string) {
  const supabase = await createClient();
  const siteUrl = getSiteUrl();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { error: "Please enter a valid email address" };
  }
  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("Sign up error:", error.message);
    return { error: "Failed to create account. Please try again." };
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
