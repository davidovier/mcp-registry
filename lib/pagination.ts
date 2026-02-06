/**
 * Cursor-based pagination utilities
 *
 * Cursor encodes (verified, created_at, id) for stable ordering.
 * Format: base64(JSON({v: boolean, c: ISO string, i: uuid}))
 */

export interface CursorData {
  v: boolean; // verified
  c: string; // created_at (ISO string)
  i: string; // id (uuid)
}

/**
 * Encodes cursor data to an opaque string
 */
export function encodeCursor(data: CursorData): string {
  const json = JSON.stringify(data);
  // Use base64url encoding (URL-safe)
  return Buffer.from(json, "utf-8").toString("base64url");
}

/**
 * Decodes an opaque cursor string to cursor data
 * Returns null if invalid
 */
export function decodeCursor(cursor: string): CursorData | null {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    const data = JSON.parse(json) as unknown;

    // Validate structure
    if (
      typeof data !== "object" ||
      data === null ||
      !("v" in data) ||
      !("c" in data) ||
      !("i" in data)
    ) {
      return null;
    }

    const { v, c, i } = data as { v: unknown; c: unknown; i: unknown };

    if (
      typeof v !== "boolean" ||
      typeof c !== "string" ||
      typeof i !== "string"
    ) {
      return null;
    }

    // Validate date format
    const date = new Date(c);
    if (isNaN(date.getTime())) {
      return null;
    }

    // Validate UUID format (basic check)
    if (!/^[0-9a-f-]{36}$/i.test(i)) {
      return null;
    }

    return { v, c, i };
  } catch {
    return null;
  }
}

/**
 * Pagination constants
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
  MIN_LIMIT: 1,
} as const;

/**
 * Validates and normalizes a limit parameter
 */
export function normalizeLimit(limit: unknown): number {
  if (typeof limit === "string") {
    const parsed = parseInt(limit, 10);
    if (!isNaN(parsed)) {
      return Math.min(
        Math.max(parsed, PAGINATION.MIN_LIMIT),
        PAGINATION.MAX_LIMIT
      );
    }
  }
  if (typeof limit === "number" && !isNaN(limit)) {
    return Math.min(
      Math.max(limit, PAGINATION.MIN_LIMIT),
      PAGINATION.MAX_LIMIT
    );
  }
  return PAGINATION.DEFAULT_LIMIT;
}

/**
 * Creates cursor from a server row
 */
export function createCursorFromRow(row: {
  verified: boolean;
  created_at: string;
  id: string;
}): string {
  return encodeCursor({
    v: row.verified,
    c: row.created_at,
    i: row.id,
  });
}
