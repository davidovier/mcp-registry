"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

interface VerificationResult {
  success: boolean;
  error_message: string | null;
  request_id: string | null;
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
 * Approve a verification request using RPC.
 * Sets the server's verified flag to true.
 */
export async function approveVerification(
  requestId: string,
  notes?: string
): Promise<{ success?: boolean; error?: string }> {
  const { error: authError, supabase } = await verifyAdminSession();

  if (authError || !supabase) {
    return { error: authError || "Failed to create client" };
  }

  // Validate request ID format
  if (!requestId || !/^[0-9a-f-]{36}$/i.test(requestId)) {
    return { error: "Invalid request ID" };
  }

  // Call the RPC function
  const { data, error } = await supabase.rpc("approve_verification", {
    p_request_id: requestId,
    p_notes: notes || undefined,
  });

  if (error) {
    console.error("RPC error:", error);
    return { error: "Failed to approve verification. Please try again." };
  }

  const result = data as VerificationResult;

  if (!result.success) {
    return { error: result.error_message || "Unknown error" };
  }

  revalidatePath("/admin/submissions");
  revalidatePath("/servers");

  return { success: true };
}

/**
 * Reject a verification request using RPC.
 */
export async function rejectVerification(
  requestId: string,
  notes: string
): Promise<{ success?: boolean; error?: string }> {
  const { error: authError, supabase } = await verifyAdminSession();

  if (authError || !supabase) {
    return { error: authError || "Failed to create client" };
  }

  // Validate request ID format
  if (!requestId || !/^[0-9a-f-]{36}$/i.test(requestId)) {
    return { error: "Invalid request ID" };
  }

  // Validate notes (also validated in RPC, but fail fast)
  if (!notes?.trim()) {
    return {
      error: "Notes are required when rejecting a verification request",
    };
  }

  // Call the RPC function
  const { data, error } = await supabase.rpc("reject_verification", {
    p_request_id: requestId,
    p_notes: notes.trim(),
  });

  if (error) {
    console.error("RPC error:", error);
    return { error: "Failed to reject verification. Please try again." };
  }

  const result = data as VerificationResult;

  if (!result.success) {
    return { error: result.error_message || "Unknown error" };
  }

  revalidatePath("/admin/submissions");

  return { success: true };
}
