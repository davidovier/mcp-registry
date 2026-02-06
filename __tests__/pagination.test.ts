import { describe, it, expect } from "vitest";

import {
  encodeCursor,
  decodeCursor,
  normalizeLimit,
  createCursorFromRow,
  PAGINATION,
} from "@/lib/pagination";

describe("Cursor encoding/decoding", () => {
  const validCursor = {
    v: true,
    c: "2026-02-06T12:00:00.000Z",
    i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  };

  it("should encode and decode a valid cursor", () => {
    const encoded = encodeCursor(validCursor);
    const decoded = decodeCursor(encoded);

    expect(decoded).toEqual(validCursor);
  });

  it("should return base64url string", () => {
    const encoded = encodeCursor(validCursor);
    // base64url doesn't contain + or /
    expect(encoded).not.toContain("+");
    expect(encoded).not.toContain("/");
  });

  it("should decode to null for invalid base64", () => {
    expect(decodeCursor("!!!invalid!!!")).toBeNull();
  });

  it("should decode to null for invalid JSON", () => {
    const invalidJson = Buffer.from("not json").toString("base64url");
    expect(decodeCursor(invalidJson)).toBeNull();
  });

  it("should decode to null for missing fields", () => {
    const missingField = Buffer.from(JSON.stringify({ v: true })).toString(
      "base64url"
    );
    expect(decodeCursor(missingField)).toBeNull();
  });

  it("should decode to null for invalid types", () => {
    const invalidTypes = Buffer.from(
      JSON.stringify({ v: "not boolean", c: 123, i: true })
    ).toString("base64url");
    expect(decodeCursor(invalidTypes)).toBeNull();
  });

  it("should decode to null for invalid date", () => {
    const invalidDate = Buffer.from(
      JSON.stringify({
        v: true,
        c: "not-a-date",
        i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      })
    ).toString("base64url");
    expect(decodeCursor(invalidDate)).toBeNull();
  });

  it("should decode to null for invalid UUID", () => {
    const invalidUuid = Buffer.from(
      JSON.stringify({
        v: true,
        c: "2026-02-06T12:00:00.000Z",
        i: "not-a-uuid",
      })
    ).toString("base64url");
    expect(decodeCursor(invalidUuid)).toBeNull();
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

describe("createCursorFromRow", () => {
  it("should create cursor from server row", () => {
    const row = {
      verified: true,
      created_at: "2026-02-06T12:00:00.000Z",
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    };

    const cursor = createCursorFromRow(row);
    const decoded = decodeCursor(cursor);

    expect(decoded).toEqual({
      v: true,
      c: "2026-02-06T12:00:00.000Z",
      i: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
  });
});
