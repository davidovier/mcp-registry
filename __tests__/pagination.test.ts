import { describe, it, expect } from "vitest";

import {
  encodeCursor,
  decodeCursor,
  normalizeLimit,
  normalizeSort,
  createCursorFromRow,
  createRankedCursorFromRow,
  isRankedCursor,
  PAGINATION,
  DEFAULT_SORT,
} from "@/lib/pagination";

describe("Cursor encoding/decoding", () => {
  describe("verified sort mode", () => {
    const verifiedCursor = {
      s: "verified" as const,
      v: true,
      c: "2026-02-06T12:00:00.000Z",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    };

    it("should encode and decode a valid verified cursor", () => {
      const encoded = encodeCursor(verifiedCursor);
      const decoded = decodeCursor(encoded, "verified");

      expect(decoded).toEqual(verifiedCursor);
    });

    it("should return base64url string", () => {
      const encoded = encodeCursor(verifiedCursor);
      // base64url doesn't contain + or /
      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");
    });

    it("should handle legacy cursor format (no s field)", () => {
      const legacyCursor = Buffer.from(
        JSON.stringify({
          v: true,
          c: "2026-02-06T12:00:00.000Z",
          i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        })
      ).toString("base64url");

      const decoded = decodeCursor(legacyCursor, "verified");
      expect(decoded).toEqual(verifiedCursor);
    });

    it("should reject legacy cursor for non-verified sort", () => {
      const legacyCursor = Buffer.from(
        JSON.stringify({
          v: true,
          c: "2026-02-06T12:00:00.000Z",
          i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        })
      ).toString("base64url");

      expect(decodeCursor(legacyCursor, "newest")).toBeNull();
      expect(decodeCursor(legacyCursor, "name")).toBeNull();
    });
  });

  describe("newest sort mode", () => {
    const newestCursor = {
      s: "newest" as const,
      c: "2026-02-06T12:00:00.000Z",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    };

    it("should encode and decode a valid newest cursor", () => {
      const encoded = encodeCursor(newestCursor);
      const decoded = decodeCursor(encoded, "newest");

      expect(decoded).toEqual(newestCursor);
    });

    it("should reject newest cursor when expecting verified", () => {
      const encoded = encodeCursor(newestCursor);
      expect(decodeCursor(encoded, "verified")).toBeNull();
    });
  });

  describe("name sort mode", () => {
    const nameCursor = {
      s: "name" as const,
      n: "My Server",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    };

    it("should encode and decode a valid name cursor", () => {
      const encoded = encodeCursor(nameCursor);
      const decoded = decodeCursor(encoded, "name");

      expect(decoded).toEqual(nameCursor);
    });

    it("should reject name cursor when expecting verified", () => {
      const encoded = encodeCursor(nameCursor);
      expect(decodeCursor(encoded, "verified")).toBeNull();
    });
  });

  describe("invalid cursors", () => {
    it("should decode to null for invalid base64", () => {
      expect(decodeCursor("!!!invalid!!!")).toBeNull();
    });

    it("should decode to null for invalid JSON", () => {
      const invalidJson = Buffer.from("not json").toString("base64url");
      expect(decodeCursor(invalidJson)).toBeNull();
    });

    it("should decode to null for missing fields", () => {
      const missingField = Buffer.from(
        JSON.stringify({ s: "verified", v: true })
      ).toString("base64url");
      expect(decodeCursor(missingField, "verified")).toBeNull();
    });

    it("should decode to null for invalid types", () => {
      const invalidTypes = Buffer.from(
        JSON.stringify({ s: "verified", v: "not boolean", c: 123, i: true })
      ).toString("base64url");
      expect(decodeCursor(invalidTypes, "verified")).toBeNull();
    });

    it("should decode to null for invalid date", () => {
      const invalidDate = Buffer.from(
        JSON.stringify({
          s: "verified",
          v: true,
          c: "not-a-date",
          i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        })
      ).toString("base64url");
      expect(decodeCursor(invalidDate, "verified")).toBeNull();
    });

    it("should decode to null for invalid UUID", () => {
      const invalidUuid = Buffer.from(
        JSON.stringify({
          s: "verified",
          v: true,
          c: "2026-02-06T12:00:00.000Z",
          i: "not-a-uuid",
        })
      ).toString("base64url");
      expect(decodeCursor(invalidUuid, "verified")).toBeNull();
    });

    it("should decode to null for mismatched sort mode", () => {
      const verifiedCursor = Buffer.from(
        JSON.stringify({
          s: "verified",
          v: true,
          c: "2026-02-06T12:00:00.000Z",
          i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        })
      ).toString("base64url");

      expect(decodeCursor(verifiedCursor, "newest")).toBeNull();
      expect(decodeCursor(verifiedCursor, "name")).toBeNull();
    });
  });
});

describe("normalizeLimit", () => {
  it("should return default for undefined", () => {
    expect(normalizeLimit(undefined)).toBe(PAGINATION.DEFAULT_LIMIT);
  });

  it("should return default for null", () => {
    expect(normalizeLimit(null)).toBe(PAGINATION.DEFAULT_LIMIT);
  });

  it("should parse string numbers", () => {
    expect(normalizeLimit("10")).toBe(10);
  });

  it("should handle numbers directly", () => {
    expect(normalizeLimit(15)).toBe(15);
  });

  it("should clamp to max limit", () => {
    expect(normalizeLimit(100)).toBe(PAGINATION.MAX_LIMIT);
    expect(normalizeLimit("999")).toBe(PAGINATION.MAX_LIMIT);
  });

  it("should clamp to min limit", () => {
    expect(normalizeLimit(0)).toBe(PAGINATION.MIN_LIMIT);
    expect(normalizeLimit(-5)).toBe(PAGINATION.MIN_LIMIT);
    expect(normalizeLimit("-10")).toBe(PAGINATION.MIN_LIMIT);
  });

  it("should return default for invalid string", () => {
    expect(normalizeLimit("abc")).toBe(PAGINATION.DEFAULT_LIMIT);
  });
});

describe("normalizeSort", () => {
  it("should return default for undefined", () => {
    expect(normalizeSort(undefined)).toBe(DEFAULT_SORT);
  });

  it("should return default for null", () => {
    expect(normalizeSort(null)).toBe(DEFAULT_SORT);
  });

  it("should accept valid sort modes", () => {
    expect(normalizeSort("verified")).toBe("verified");
    expect(normalizeSort("newest")).toBe("newest");
    expect(normalizeSort("name")).toBe("name");
  });

  it("should return default for invalid sort mode", () => {
    expect(normalizeSort("invalid")).toBe(DEFAULT_SORT);
    expect(normalizeSort("random")).toBe(DEFAULT_SORT);
    expect(normalizeSort(123)).toBe(DEFAULT_SORT);
  });
});

describe("createCursorFromRow", () => {
  const row = {
    verified: true,
    created_at: "2026-02-06T12:00:00.000Z",
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Test Server",
  };

  it("should create verified cursor by default", () => {
    const cursor = createCursorFromRow(row);
    const decoded = decodeCursor(cursor, "verified");

    expect(decoded).toEqual({
      s: "verified",
      v: true,
      c: "2026-02-06T12:00:00.000Z",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
  });

  it("should create verified cursor when specified", () => {
    const cursor = createCursorFromRow(row, "verified");
    const decoded = decodeCursor(cursor, "verified");

    expect(decoded).toEqual({
      s: "verified",
      v: true,
      c: "2026-02-06T12:00:00.000Z",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
  });

  it("should create newest cursor", () => {
    const cursor = createCursorFromRow(row, "newest");
    const decoded = decodeCursor(cursor, "newest");

    expect(decoded).toEqual({
      s: "newest",
      c: "2026-02-06T12:00:00.000Z",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
  });

  it("should create name cursor", () => {
    const cursor = createCursorFromRow(row, "name");
    const decoded = decodeCursor(cursor, "name");

    expect(decoded).toEqual({
      s: "name",
      n: "Test Server",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
  });
});

describe("Ranked cursor encoding/decoding (FTS search)", () => {
  describe("ranked verified cursor", () => {
    const rankedVerifiedCursor = {
      s: "verified" as const,
      q: true as const,
      v: true,
      r: 0.5,
      c: "2026-02-06T12:00:00.000Z",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    };

    it("should encode and decode a ranked verified cursor", () => {
      const encoded = encodeCursor(rankedVerifiedCursor);
      const decoded = decodeCursor(encoded, "verified", true);

      expect(decoded).toEqual(rankedVerifiedCursor);
    });

    it("should identify as ranked cursor", () => {
      const encoded = encodeCursor(rankedVerifiedCursor);
      const decoded = decodeCursor(encoded, "verified", true);

      expect(decoded).not.toBeNull();
      expect(isRankedCursor(decoded!)).toBe(true);
    });

    it("should reject ranked cursor when not expecting search", () => {
      const encoded = encodeCursor(rankedVerifiedCursor);
      expect(decodeCursor(encoded, "verified", false)).toBeNull();
    });
  });

  describe("ranked newest cursor", () => {
    const rankedNewestCursor = {
      s: "newest" as const,
      q: true as const,
      r: 0.75,
      c: "2026-02-06T12:00:00.000Z",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    };

    it("should encode and decode a ranked newest cursor", () => {
      const encoded = encodeCursor(rankedNewestCursor);
      const decoded = decodeCursor(encoded, "newest", true);

      expect(decoded).toEqual(rankedNewestCursor);
    });

    it("should identify as ranked cursor", () => {
      const encoded = encodeCursor(rankedNewestCursor);
      const decoded = decodeCursor(encoded, "newest", true);

      expect(decoded).not.toBeNull();
      expect(isRankedCursor(decoded!)).toBe(true);
    });
  });

  describe("ranked name cursor", () => {
    const rankedNameCursor = {
      s: "name" as const,
      q: true as const,
      r: 0.25,
      n: "Test Server",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    };

    it("should encode and decode a ranked name cursor", () => {
      const encoded = encodeCursor(rankedNameCursor);
      const decoded = decodeCursor(encoded, "name", true);

      expect(decoded).toEqual(rankedNameCursor);
    });

    it("should identify as ranked cursor", () => {
      const encoded = encodeCursor(rankedNameCursor);
      const decoded = decodeCursor(encoded, "name", true);

      expect(decoded).not.toBeNull();
      expect(isRankedCursor(decoded!)).toBe(true);
    });
  });

  describe("search mode validation", () => {
    const nonRankedCursor = {
      s: "verified" as const,
      v: true,
      c: "2026-02-06T12:00:00.000Z",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    };

    it("should reject non-ranked cursor when expecting search", () => {
      const encoded = encodeCursor(nonRankedCursor);
      expect(decodeCursor(encoded, "verified", true)).toBeNull();
    });

    it("should accept non-ranked cursor when not expecting search", () => {
      const encoded = encodeCursor(nonRankedCursor);
      expect(decodeCursor(encoded, "verified", false)).toEqual(nonRankedCursor);
    });

    it("should identify non-ranked cursor correctly", () => {
      const encoded = encodeCursor(nonRankedCursor);
      const decoded = decodeCursor(encoded, "verified", false);

      expect(decoded).not.toBeNull();
      expect(isRankedCursor(decoded!)).toBe(false);
    });

    it("should reject legacy cursor when expecting search", () => {
      const legacyCursor = Buffer.from(
        JSON.stringify({
          v: true,
          c: "2026-02-06T12:00:00.000Z",
          i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        })
      ).toString("base64url");

      expect(decodeCursor(legacyCursor, "verified", true)).toBeNull();
    });
  });
});

describe("createRankedCursorFromRow", () => {
  const row = {
    verified: true,
    created_at: "2026-02-06T12:00:00.000Z",
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Test Server",
    rank: 0.85,
  };

  it("should create ranked verified cursor by default", () => {
    const cursor = createRankedCursorFromRow(row);
    const decoded = decodeCursor(cursor, "verified", true);

    expect(decoded).toEqual({
      s: "verified",
      q: true,
      v: true,
      r: 0.85,
      c: "2026-02-06T12:00:00.000Z",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
  });

  it("should create ranked newest cursor", () => {
    const cursor = createRankedCursorFromRow(row, "newest");
    const decoded = decodeCursor(cursor, "newest", true);

    expect(decoded).toEqual({
      s: "newest",
      q: true,
      r: 0.85,
      c: "2026-02-06T12:00:00.000Z",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
  });

  it("should create ranked name cursor", () => {
    const cursor = createRankedCursorFromRow(row, "name");
    const decoded = decodeCursor(cursor, "name", true);

    expect(decoded).toEqual({
      s: "name",
      q: true,
      r: 0.85,
      n: "Test Server",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
  });
});
