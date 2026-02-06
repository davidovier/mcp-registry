import { z } from "zod";

/**
 * MCP Listing Schema v1
 *
 * Defines the canonical schema for MCP server listings.
 * Used for validating submissions and ensuring data consistency.
 */

// URL validation regex
const urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

// Slug validation: lowercase letters, numbers, hyphens
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Transport types
export const transportEnum = z.enum(["stdio", "http", "both"]);
export type Transport = z.infer<typeof transportEnum>;

// Auth types
export const authEnum = z.enum(["none", "oauth", "api_key", "other"]);
export type Auth = z.infer<typeof authEnum>;

// Capabilities schema
export const capabilitiesSchema = z.object({
  tools: z.boolean().default(false),
  resources: z.boolean().default(false),
  prompts: z.boolean().default(false),
});
export type Capabilities = z.infer<typeof capabilitiesSchema>;

// Tag normalization: lowercase, trimmed, unique
const normalizeTag = (tag: string) => tag.toLowerCase().trim();

// Tags schema with normalization and truncation
export const tagsSchema = z
  .array(z.string().min(1).max(50))
  .transform((tags) => [...new Set(tags.map(normalizeTag))].slice(0, 10));

// Optional URL field
const optionalUrl = z
  .string()
  .regex(urlRegex, "Must be a valid URL")
  .optional()
  .or(z.literal(""))
  .transform((v) => v || undefined);

/**
 * MCP Listing Schema v1
 */
export const listingSchemaV1 = z.object({
  // Required fields
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(50, "Slug must be 50 characters or less")
    .regex(slugRegex, "Slug must be lowercase letters, numbers, and hyphens"),

  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be 500 characters or less"),

  // Enum fields
  transport: transportEnum,
  auth: authEnum,

  // Optional URL fields
  homepage_url: optionalUrl,
  repo_url: optionalUrl,
  docs_url: optionalUrl,

  // Tags (normalized)
  tags: tagsSchema.default([]),

  // Capabilities
  capabilities: capabilitiesSchema.default({
    tools: false,
    resources: false,
    prompts: false,
  }),
});

export type ListingV1 = z.infer<typeof listingSchemaV1>;

/**
 * Validates and normalizes a listing payload
 */
export function validateListing(data: unknown): {
  success: boolean;
  data?: ListingV1;
  errors?: z.ZodError;
} {
  const result = listingSchemaV1.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

// Schema version constant
export const CURRENT_SCHEMA_VERSION = "v1";
