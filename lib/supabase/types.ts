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

// Role types
export type UserRole = "user" | "admin";

// Submission status types
export type SubmissionStatus = "pending" | "approved" | "rejected";

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
