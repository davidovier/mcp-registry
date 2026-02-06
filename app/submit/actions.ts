"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Submit a new MCP server for review.
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
  const homepage_url = (formData.get("homepage_url") as string)?.trim() || null;
  const repo_url = (formData.get("repo_url") as string)?.trim() || null;
  const docs_url = (formData.get("docs_url") as string)?.trim() || null;
  const tagsRaw = (formData.get("tags") as string)?.trim() || "";
  const transport = formData.get("transport") as string;
  const auth = formData.get("auth") as string;
  const cap_tools = formData.get("cap_tools") === "on";
  const cap_resources = formData.get("cap_resources") === "on";
  const cap_prompts = formData.get("cap_prompts") === "on";

  // Server-side validation
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return { error: "Invalid slug format" };
  }

  if (slug.length > 50) {
    return { error: "Slug must be 50 characters or less" };
  }

  if (!name || name.length > 100) {
    return { error: "Name is required and must be 100 characters or less" };
  }

  if (!description || description.length > 500) {
    return {
      error: "Description is required and must be 500 characters or less",
    };
  }

  // URL validation
  const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

  if (homepage_url && !urlRegex.test(homepage_url)) {
    return { error: "Invalid homepage URL format" };
  }

  if (repo_url && !urlRegex.test(repo_url)) {
    return { error: "Invalid repository URL format" };
  }

  if (docs_url && !urlRegex.test(docs_url)) {
    return { error: "Invalid documentation URL format" };
  }

  if (!["stdio", "http", "both"].includes(transport)) {
    return { error: "Invalid transport method" };
  }

  if (!["none", "oauth", "api_key", "other"].includes(auth)) {
    return { error: "Invalid authentication method" };
  }

  // Parse and normalize tags
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0 && t.length <= 30)
    .slice(0, 10); // Max 10 tags

  // Build the submitted payload
  const submitted_payload = {
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

  // Insert submission
  const { error } = await supabase.from("mcp_server_submissions").insert({
    submitted_by: user.id,
    submitted_payload,
    status: "pending",
  });

  if (error) {
    console.error("Submission error:", error);
    return { error: "Failed to submit. Please try again." };
  }

  return { success: true };
}
