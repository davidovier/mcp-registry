/**
 * Database types for Supabase.
 *
 * This file re-exports generated types and adds custom type helpers.
 * To regenerate types after schema changes:
 *   pnpm supabase:types
 */

// Re-export all generated types
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  Json,
} from "./database.types";

// Import for local use
import type { Database } from "./database.types";

// Convenience type aliases for mcp_servers table
export type McpServer = Database["public"]["Tables"]["mcp_servers"]["Row"];
export type McpServerInsert =
  Database["public"]["Tables"]["mcp_servers"]["Insert"];
export type McpServerUpdate =
  Database["public"]["Tables"]["mcp_servers"]["Update"];

// Transport and auth type literals (match database constraints)
export type McpTransport = "stdio" | "http" | "both";
export type McpAuth = "none" | "oauth" | "api_key" | "other";

// Capabilities structure
export interface McpCapabilities {
  tools?: boolean;
  resources?: boolean;
  prompts?: boolean;
  [key: string]: boolean | undefined;
}

// Convenience type aliases for profiles table
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Role types
export type UserRole = "user" | "admin";

// Submission status types
export type SubmissionStatus = "pending" | "approved" | "rejected";

// Verification request status types
export type VerificationRequestStatus = "pending" | "approved" | "rejected";

// Verification request structure
export interface VerificationRequest {
  id: string;
  server_id: string;
  requested_by: string;
  status: VerificationRequestStatus;
  request_notes: string | null;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

// Submission payload structure (what users submit)
export interface SubmissionPayload {
  slug: string;
  name: string;
  description: string;
  homepage_url: string | null;
  repo_url: string | null;
  docs_url: string | null;
  tags: string[];
  transport: McpTransport;
  auth: McpAuth;
  capabilities: McpCapabilities;
}
