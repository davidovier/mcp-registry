"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

interface ModerationResult {
  success: boolean;
  error_message: string | null;
  server_id: string | null;
}

/**
 * Verify that the current user is authenticated and is an admin.
 * This is defense-in-depth: the RPC functions also verify admin status.
 */
async function verifyAdminSession() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", supabase: null };
  }

  // Quick check before calling RPC (defense in depth)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized: Admin access required", supabase: null };
  }

  return { error: null, supabase };
}

/**
 * Approve a submission atomically using RPC.
 * The RPC function handles validation, insert, and update in a single transaction.
 */
export async function approveSubmission(
  submissionId: string,
  notes?: string
): Promise<{ success?: boolean; error?: string }> {
  const { error: authError, supabase } = await verifyAdminSession();

  if (authError || !supabase) {
    return { error: authError || "Failed to create client" };
  }

  // Validate submission ID format
  if (!submissionId || !/^[0-9a-f-]{36}$/i.test(submissionId)) {
    return { error: "Invalid submission ID" };
  }

  // Call the atomic RPC function
  const { data, error } = await supabase.rpc("approve_submission", {
    p_submission_id: submissionId,
    p_notes: notes || null,
  });

  if (error) {
    console.error("RPC error:", error);
    return { error: "Failed to approve submission. Please try again." };
  }

  const result = data as ModerationResult;

  if (!result.success) {
    return { error: result.error_message || "Unknown error" };
  }

  revalidatePath("/admin/submissions");
  revalidatePath("/servers");

  return { success: true };
}

/**
 * Reject a submission atomically using RPC.
 */
export async function rejectSubmission(
  submissionId: string,
  notes: string
): Promise<{ success?: boolean; error?: string }> {
  const { error: authError, supabase } = await verifyAdminSession();

  if (authError || !supabase) {
    return { error: authError || "Failed to create client" };
  }

  // Validate submission ID format
  if (!submissionId || !/^[0-9a-f-]{36}$/i.test(submissionId)) {
    return { error: "Invalid submission ID" };
  }

  // Validate notes (also validated in RPC, but fail fast)
  if (!notes?.trim()) {
    return { error: "Notes are required when rejecting a submission" };
  }

  // Call the atomic RPC function
  const { data, error } = await supabase.rpc("reject_submission", {
    p_submission_id: submissionId,
    p_notes: notes.trim(),
  });

  if (error) {
    console.error("RPC error:", error);
    return { error: "Failed to reject submission. Please try again." };
  }

  const result = data as ModerationResult;

  if (!result.success) {
    return { error: result.error_message || "Unknown error" };
  }

  revalidatePath("/admin/submissions");

  return { success: true };
}
