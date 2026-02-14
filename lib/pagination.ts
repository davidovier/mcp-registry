/**
 * Cursor-based pagination utilities
 *
 * Supports multiple sort modes with appropriate cursor fields:
 * - verified: (sort, verified, created_at, id)
 * - newest: (sort, created_at, id)
 * - name: (sort, name, id)
 *
 * Format: base64url(JSON({s: SortMode, ...fields}))
 */

export type SortMode = "verified" | "newest" | "name";

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "verified", label: "Verified first" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name (A–Z)" },
];

export const DEFAULT_SORT: SortMode = "verified";

// Cursor data structures for each sort mode
interface VerifiedCursorData {
  s: "verified";
  v: boolean; // verified
  c: string; // created_at (ISO string)
  i: string; // id (uuid)
}

interface NewestCursorData {
  s: "newest";
  c: string; // created_at (ISO string)
  i: string; // id (uuid)
}

interface NameCursorData {
  s: "name";
  n: string; // name
  i: string; // id (uuid)
}

export type CursorData = VerifiedCursorData | NewestCursorData | NameCursorData;

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
 * Returns null if invalid or sort mode doesn't match
 */
export function decodeCursor(
  cursor: string,
  expectedSort: SortMode = "verified"
): CursorData | null {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    const data = JSON.parse(json) as unknown;

    if (typeof data !== "object" || data === null) {
      return null;
    }

    const obj = data as Record<string, unknown>;

    // Handle legacy cursor format (no 's' field) - assume verified sort
    if (!("s" in obj) && "v" in obj && "c" in obj && "i" in obj) {
      if (expectedSort !== "verified") {
        return null; // Legacy cursor only valid for verified sort
      }
      const v = obj.v;
      const c = obj.c;
      const i = obj.i;
      if (
        typeof v !== "boolean" ||
        typeof c !== "string" ||
        typeof i !== "string"
      ) {
        return null;
      }
      if (!isValidDate(c) || !isValidUUID(i)) {
        return null;
      }
      return { s: "verified", v, c, i };
    }

    // Validate sort mode matches expected
    if (!("s" in obj) || obj.s !== expectedSort) {
      return null;
    }

    switch (expectedSort) {
      case "verified":
        return validateVerifiedCursor(obj);
      case "newest":
        return validateNewestCursor(obj);
      case "name":
        return validateNameCursor(obj);
      default:
        return null;
    }
  } catch {
    return null;
  }
}

function validateVerifiedCursor(
  obj: Record<string, unknown>
): VerifiedCursorData | null {
  if (!("v" in obj) || !("c" in obj) || !("i" in obj)) {
    return null;
  }
  const { v, c, i } = obj;
  if (
    typeof v !== "boolean" ||
    typeof c !== "string" ||
    typeof i !== "string"
  ) {
    return null;
  }
  if (!isValidDate(c) || !isValidUUID(i)) {
    return null;
  }
  return { s: "verified", v, c, i };
}

function validateNewestCursor(
  obj: Record<string, unknown>
): NewestCursorData | null {
  if (!("c" in obj) || !("i" in obj)) {
    return null;
  }
  const { c, i } = obj;
  if (typeof c !== "string" || typeof i !== "string") {
    return null;
  }
  if (!isValidDate(c) || !isValidUUID(i)) {
    return null;
  }
  return { s: "newest", c, i };
}

function validateNameCursor(
  obj: Record<string, unknown>
): NameCursorData | null {
  if (!("n" in obj) || !("i" in obj)) {
    return null;
  }
  const { n, i } = obj;
  if (typeof n !== "string" || typeof i !== "string") {
    return null;
  }
  if (!isValidUUID(i)) {
    return null;
  }
  return { s: "name", n, i };
}

function isValidDate(str: string): boolean {
  const date = new Date(str);
  return !isNaN(date.getTime());
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f-]{36}$/i.test(str);
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
 * Validates and normalizes a sort parameter
 */
export function normalizeSort(sort: unknown): SortMode {
  if (
    typeof sort === "string" &&
    (sort === "verified" || sort === "newest" || sort === "name")
  ) {
    return sort;
  }
  return DEFAULT_SORT;
}

/**
 * Creates cursor from a server row based on sort mode
 */
export function createCursorFromRow(
  row: {
    verified: boolean;
    created_at: string;
    id: string;
    name: string;
  },
  sort: SortMode = "verified"
): string {
  switch (sort) {
    case "verified":
      return encodeCursor({
        s: "verified",
        v: row.verified,
        c: row.created_at,
        i: row.id,
      });
    case "newest":
      return encodeCursor({
        s: "newest",
        c: row.created_at,
        i: row.id,
      });
    case "name":
      return encodeCursor({
        s: "name",
        n: row.name,
        i: row.id,
      });
  }
}
