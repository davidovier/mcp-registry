"use server";

import { createClient } from "@/lib/supabase/server";
import {
  validateListing,
  formatValidationErrors,
  CURRENT_SCHEMA_VERSION,
} from "@/lib/validation/listing-schema";

/**
 * Submit a new MCP server for review.
 * Uses the listing schema v1 for validation and normalization.
 */
export async function submitServer(formData: FormData) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to submit a server" };
  }

  // Extract form data
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();
  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const homepage_url = (formData.get("homepage_url") as string)?.trim() || "";
  const repo_url = (formData.get("repo_url") as string)?.trim() || "";
  const docs_url = (formData.get("docs_url") as string)?.trim() || "";
  const tagsRaw = (formData.get("tags") as string)?.trim() || "";
  const transport = formData.get("transport") as string;
  const auth = formData.get("auth") as string;
  const cap_tools = formData.get("cap_tools") === "on";
  const cap_resources = formData.get("cap_resources") === "on";
  const cap_prompts = formData.get("cap_prompts") === "on";

  // Parse tags from comma-separated string
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  // Build raw payload for validation
  const rawPayload = {
    slug,
    name,
    description,
    homepage_url,
    repo_url,
    docs_url,
    tags,
    transport,
    auth,
    capabilities: {
      tools: cap_tools,
      resources: cap_resources,
      prompts: cap_prompts,
    },
  };

  // Validate using the listing schema
  const validationResult = validateListing(rawPayload);

  if (!validationResult.success) {
    const errorMessages = formatValidationErrors(validationResult.errors!);

    // Store submission with validation errors for audit
    await supabase.from("mcp_server_submissions").insert({
      submitted_by: user.id,
      submitted_payload: rawPayload,
      status: "pending",
      schema_version: CURRENT_SCHEMA_VERSION,
      validation_errors: errorMessages,
    });

    return { error: errorMessages[0] || "Validation failed" };
  }

  // Use the normalized/validated data
  const normalizedPayload = validationResult.data!;

  // Insert submission with validated payload
  const { error } = await supabase.from("mcp_server_submissions").insert({
    submitted_by: user.id,
    submitted_payload: normalizedPayload,
    status: "pending",
    schema_version: CURRENT_SCHEMA_VERSION,
    validation_errors: null,
  });

  if (error) {
    console.error("Submission error:", error);
    return { error: "Failed to submit. Please try again." };
  }

  return { success: true };
}
