import { describe, it, expect } from "vitest";

import { listingSchemaV1 } from "@/lib/validation/listing-schema";

describe("Submit form client-side validation", () => {
  describe("field error mapping", () => {
    it("should return slug error for invalid slug", () => {
      const result = listingSchemaV1.safeParse({
        slug: "Invalid Slug!",
        name: "Test Server",
        description: "A test server",
        transport: "stdio",
        auth: "none",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const slugErrors = result.error.issues.filter(
          (issue) => issue.path[0] === "slug"
        );
        expect(slugErrors.length).toBeGreaterThan(0);
        expect(slugErrors[0].message).toContain("lowercase");
      }
    });

    it("should return name error for missing name", () => {
      const result = listingSchemaV1.safeParse({
        slug: "test-server",
        name: "",
        description: "A test server",
        transport: "stdio",
        auth: "none",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const nameErrors = result.error.issues.filter(
          (issue) => issue.path[0] === "name"
        );
        expect(nameErrors.length).toBeGreaterThan(0);
      }
    });

    it("should return description error for missing description", () => {
      const result = listingSchemaV1.safeParse({
        slug: "test-server",
        name: "Test Server",
        description: "",
        transport: "stdio",
        auth: "none",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const descErrors = result.error.issues.filter(
          (issue) => issue.path[0] === "description"
        );
        expect(descErrors.length).toBeGreaterThan(0);
      }
    });

    it("should return homepage_url error for invalid URL", () => {
      const result = listingSchemaV1.safeParse({
        slug: "test-server",
        name: "Test Server",
        description: "A test server",
        transport: "stdio",
        auth: "none",
        homepage_url: "not-a-url",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const urlErrors = result.error.issues.filter(
          (issue) => issue.path[0] === "homepage_url"
        );
        expect(urlErrors.length).toBeGreaterThan(0);
      }
    });

    it("should pass validation for valid submission", () => {
      const result = listingSchemaV1.safeParse({
        slug: "github-mcp",
        name: "GitHub MCP Server",
        description:
          "Provides access to GitHub repositories, issues, and pull requests.",
        transport: "stdio",
        auth: "oauth",
        tags: ["github", "git", "issues"],
        capabilities: {
          tools: true,
          resources: true,
          prompts: false,
        },
        homepage_url: "https://github.com/example/github-mcp",
        repo_url: "https://github.com/example/github-mcp",
        docs_url: "https://docs.example.com/github-mcp",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.slug).toBe("github-mcp");
        expect(result.data.name).toBe("GitHub MCP Server");
        expect(result.data.tags).toEqual(["github", "git", "issues"]);
      }
    });
  });

  describe("character limits", () => {
    it("should reject name over 100 characters", () => {
      const longName = "a".repeat(101);
      const result = listingSchemaV1.safeParse({
        slug: "test",
        name: longName,
        description: "A test server",
        transport: "stdio",
        auth: "none",
      });

      expect(result.success).toBe(false);
    });

    it("should reject description over 500 characters", () => {
      const longDesc = "a".repeat(501);
      const result = listingSchemaV1.safeParse({
        slug: "test",
        name: "Test",
        description: longDesc,
        transport: "stdio",
        auth: "none",
      });

      expect(result.success).toBe(false);
    });

    it("should reject slug over 50 characters", () => {
      const longSlug = "a".repeat(51);
      const result = listingSchemaV1.safeParse({
        slug: longSlug,
        name: "Test",
        description: "A test server",
        transport: "stdio",
        auth: "none",
      });

      expect(result.success).toBe(false);
    });
  });
});
