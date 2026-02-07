"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

interface VerificationResult {
  success: boolean;
  error_message: string | null;
  request_id: string | null;
}

/**
 * Request verification for a server.
 * The user must be authenticated and be the owner of the server.
 */
export async function requestVerification(
  serverId: string,
  notes?: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to request verification" };
  }

  // Validate server ID format
  if (!serverId || !/^[0-9a-f-]{36}$/i.test(serverId)) {
    return { error: "Invalid server ID" };
  }

  // Call the RPC function
  const { data, error } = await supabase.rpc("request_verification", {
    p_server_id: serverId,
    p_notes: notes || undefined,
  });

  if (error) {
    console.error("RPC error:", error);
    return {
      error: "Failed to submit verification request. Please try again.",
    };
  }

  const result = data as VerificationResult;

  if (!result.success) {
    return { error: result.error_message || "Unknown error" };
  }

  // Revalidate the server page to show updated status
  revalidatePath(`/servers`);

  return { success: true };
}
