import { describe, it, expect } from "vitest";

import {
  validateListing,
  formatValidationErrors,
  listingSchemaV1,
  CURRENT_SCHEMA_VERSION,
} from "@/lib/validation/listing-schema";

describe("Listing Schema v1", () => {
  const validListing = {
    slug: "test-server",
    name: "Test Server",
    description: "A test MCP server for unit tests",
    transport: "stdio",
    auth: "none",
    tags: ["test", "demo"],
    capabilities: {
      tools: true,
      resources: false,
      prompts: false,
    },
  };

  describe("validateListing", () => {
    it("should accept valid listing", () => {
      const result = validateListing(validListing);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should reject missing slug", () => {
      const { slug: _, ...withoutSlug } = validListing;
      const result = validateListing(withoutSlug);
      expect(result.success).toBe(false);
    });

    it("should reject invalid slug format", () => {
      const result = validateListing({
        ...validListing,
        slug: "Invalid Slug!",
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing name", () => {
      const { name: _, ...withoutName } = validListing;
      const result = validateListing(withoutName);
      expect(result.success).toBe(false);
    });

    it("should reject missing description", () => {
      const { description: _, ...withoutDesc } = validListing;
      const result = validateListing(withoutDesc);
      expect(result.success).toBe(false);
    });

    it("should reject invalid transport", () => {
      const result = validateListing({
        ...validListing,
        transport: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid auth", () => {
      const result = validateListing({
        ...validListing,
        auth: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("URL validation", () => {
    it("should accept valid URLs", () => {
      const result = validateListing({
        ...validListing,
        homepage_url: "https://example.com",
        repo_url: "https://github.com/test/repo",
        docs_url: "http://docs.example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty URLs", () => {
      const result = validateListing({
        ...validListing,
        homepage_url: "",
        repo_url: "",
        docs_url: "",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid URLs", () => {
      const result = validateListing({
        ...validListing,
        homepage_url: "not-a-url",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Tag normalization", () => {
    it("should normalize tags to lowercase", () => {
      const result = validateListing({
        ...validListing,
        tags: ["Test", "DEMO", "Mixed"],
      });
      expect(result.success).toBe(true);
      expect(result.data?.tags).toEqual(["test", "demo", "mixed"]);
    });

    it("should remove duplicate tags", () => {
      const result = validateListing({
        ...validListing,
        tags: ["test", "Test", "TEST"],
      });
      expect(result.success).toBe(true);
      expect(result.data?.tags).toEqual(["test"]);
    });

    it("should limit tags to 10", () => {
      const manyTags = Array.from({ length: 15 }, (_, i) => `tag${i}`);
      const result = validateListing({
        ...validListing,
        tags: manyTags,
      });
      expect(result.success).toBe(true);
      expect(result.data?.tags.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Default values", () => {
    it("should provide default capabilities", () => {
      const { capabilities: _, ...withoutCaps } = validListing;
      const result = validateListing(withoutCaps);
      expect(result.success).toBe(true);
      expect(result.data?.capabilities).toEqual({
        tools: false,
        resources: false,
        prompts: false,
      });
    });

    it("should provide default empty tags", () => {
      const { tags: _, ...withoutTags } = validListing;
      const result = validateListing(withoutTags);
      expect(result.success).toBe(true);
      expect(result.data?.tags).toEqual([]);
    });
  });

  describe("formatValidationErrors", () => {
    it("should format errors with paths", () => {
      const result = listingSchemaV1.safeParse({
        slug: "",
        name: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = formatValidationErrors(result.error);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some((e) => e.includes("slug"))).toBe(true);
      }
    });
  });

  describe("Schema version", () => {
    it("should export current schema version", () => {
      expect(CURRENT_SCHEMA_VERSION).toBe("v1");
    });
  });
});
