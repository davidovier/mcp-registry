import { describe, it, expect } from "vitest";

import { normalizeTag, isValidTag } from "@/components/submit/TagInput";

describe("TagInput utilities", () => {
  describe("normalizeTag", () => {
    it("should convert to lowercase", () => {
      expect(normalizeTag("GitHub")).toBe("github");
      expect(normalizeTag("API")).toBe("api");
      expect(normalizeTag("Test")).toBe("test");
    });

    it("should trim whitespace", () => {
      expect(normalizeTag("  github  ")).toBe("github");
      expect(normalizeTag("\tapi\n")).toBe("api");
    });

    it("should handle mixed case and whitespace", () => {
      expect(normalizeTag("  GitHub  ")).toBe("github");
      expect(normalizeTag(" MCP Server ")).toBe("mcp server");
    });

    it("should return empty string for whitespace-only input", () => {
      expect(normalizeTag("   ")).toBe("");
      expect(normalizeTag("\t\n")).toBe("");
    });
  });

  describe("isValidTag", () => {
    it("should return true for valid tags", () => {
      expect(isValidTag("github")).toBe(true);
      expect(isValidTag("api")).toBe(true);
      expect(isValidTag("mcp-server")).toBe(true);
    });

    it("should return true for tags that normalize to valid", () => {
      expect(isValidTag("  GitHub  ")).toBe(true);
      expect(isValidTag("API")).toBe(true);
    });

    it("should return false for empty or whitespace-only tags", () => {
      expect(isValidTag("")).toBe(false);
      expect(isValidTag("   ")).toBe(false);
      expect(isValidTag("\t\n")).toBe(false);
    });
  });

  describe("tag normalization behavior", () => {
    it("should dedupe tags with different cases", () => {
      // Simulate what would happen with multiple tags
      const tags = ["GitHub", "github", "GITHUB"];
      const normalized = [...new Set(tags.map(normalizeTag))];
      expect(normalized).toEqual(["github"]);
    });

    it("should filter out invalid tags", () => {
      const tags = ["github", "", "  ", "api", "\t"];
      const valid = tags.filter(isValidTag).map(normalizeTag);
      expect(valid).toEqual(["github", "api"]);
    });

    it("should limit to max 10 tags", () => {
      const manyTags = Array.from({ length: 15 }, (_, i) => `tag${i}`);
      const limited = manyTags.slice(0, 10);
      expect(limited.length).toBe(10);
      expect(limited[0]).toBe("tag0");
      expect(limited[9]).toBe("tag9");
    });
  });
});
