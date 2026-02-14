/**
 * Cursor-based pagination utilities
 *
 * Supports multiple sort modes with appropriate cursor fields:
 * - verified: (sort, verified, created_at, id)
 * - newest: (sort, created_at, id)
 * - name: (sort, name, id)
 *
 * When search is active (q flag), rank is included in the cursor:
 * - verified+search: (sort, q, verified, rank, created_at, id)
 * - newest+search: (sort, q, rank, created_at, id)
 * - name+search: (sort, q, rank, name, id)
 *
 * Format: base64url(JSON({s: SortMode, q?: true, ...fields}))
 */

export type SortMode = "verified" | "newest" | "name";

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "verified", label: "Verified first" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name (A–Z)" },
];

export const DEFAULT_SORT: SortMode = "verified";

// Non-ranked cursor data structures (no search query)
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

// Ranked cursor data structures (search query active)
interface RankedVerifiedCursorData {
  s: "verified";
  q: true; // indicates search is active
  v: boolean; // verified
  r: number; // rank (from ts_rank_cd)
  c: string; // created_at (ISO string)
  i: string; // id (uuid)
}

interface RankedNewestCursorData {
  s: "newest";
  q: true; // indicates search is active
  r: number; // rank (from ts_rank_cd)
  c: string; // created_at (ISO string)
  i: string; // id (uuid)
}

interface RankedNameCursorData {
  s: "name";
  q: true; // indicates search is active
  r: number; // rank (from ts_rank_cd)
  n: string; // name
  i: string; // id (uuid)
}

export type CursorData =
  | VerifiedCursorData
  | NewestCursorData
  | NameCursorData
  | RankedVerifiedCursorData
  | RankedNewestCursorData
  | RankedNameCursorData;

/**
 * Check if cursor has rank (search was active)
 */
export function isRankedCursor(
  cursor: CursorData
): cursor is
  | RankedVerifiedCursorData
  | RankedNewestCursorData
  | RankedNameCursorData {
  return "q" in cursor && cursor.q === true;
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
 * Returns null if invalid or sort mode doesn't match
 *
 * @param cursor - The cursor string to decode
 * @param expectedSort - Expected sort mode
 * @param hasSearchQuery - Whether the current request has a search query (q param)
 */
export function decodeCursor(
  cursor: string,
  expectedSort: SortMode = "verified",
  hasSearchQuery = false
): CursorData | null {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf-8");
    const data = JSON.parse(json) as unknown;

    if (typeof data !== "object" || data === null) {
      return null;
    }

    const obj = data as Record<string, unknown>;

    // Handle legacy cursor format (no 's' field) - assume verified sort, no search
    if (!("s" in obj) && "v" in obj && "c" in obj && "i" in obj) {
      if (expectedSort !== "verified") {
        return null; // Legacy cursor only valid for verified sort
      }
      if (hasSearchQuery) {
        return null; // Legacy cursor not valid for search queries
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

    // Check if cursor has rank (search mode)
    const cursorHasRank = "q" in obj && obj.q === true;

    // If search query is active but cursor doesn't have rank, reject
    // This ensures we don't use a non-ranked cursor for ranked pagination
    if (hasSearchQuery && !cursorHasRank) {
      return null;
    }

    // If search query is not active but cursor has rank, reject
    // This ensures we don't use a ranked cursor for non-ranked pagination
    if (!hasSearchQuery && cursorHasRank) {
      return null;
    }

    if (cursorHasRank) {
      // Validate ranked cursor
      switch (expectedSort) {
        case "verified":
          return validateRankedVerifiedCursor(obj);
        case "newest":
          return validateRankedNewestCursor(obj);
        case "name":
          return validateRankedNameCursor(obj);
        default:
          return null;
      }
    } else {
      // Validate non-ranked cursor
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

function validateRankedVerifiedCursor(
  obj: Record<string, unknown>
): RankedVerifiedCursorData | null {
  if (!("v" in obj) || !("r" in obj) || !("c" in obj) || !("i" in obj)) {
    return null;
  }
  const { v, r, c, i } = obj;
  if (
    typeof v !== "boolean" ||
    typeof r !== "number" ||
    typeof c !== "string" ||
    typeof i !== "string"
  ) {
    return null;
  }
  if (!isValidDate(c) || !isValidUUID(i)) {
    return null;
  }
  return { s: "verified", q: true, v, r, c, i };
}

function validateRankedNewestCursor(
  obj: Record<string, unknown>
): RankedNewestCursorData | null {
  if (!("r" in obj) || !("c" in obj) || !("i" in obj)) {
    return null;
  }
  const { r, c, i } = obj;
  if (typeof r !== "number" || typeof c !== "string" || typeof i !== "string") {
    return null;
  }
  if (!isValidDate(c) || !isValidUUID(i)) {
    return null;
  }
  return { s: "newest", q: true, r, c, i };
}

function validateRankedNameCursor(
  obj: Record<string, unknown>
): RankedNameCursorData | null {
  if (!("r" in obj) || !("n" in obj) || !("i" in obj)) {
    return null;
  }
  const { r, n, i } = obj;
  if (typeof r !== "number" || typeof n !== "string" || typeof i !== "string") {
    return null;
  }
  if (!isValidUUID(i)) {
    return null;
  }
  return { s: "name", q: true, r, n, i };
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
 * Creates cursor from a server row based on sort mode (non-ranked)
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

/**
 * Creates cursor from a server row with rank (for search queries)
 */
export function createRankedCursorFromRow(
  row: {
    verified: boolean;
    created_at: string;
    id: string;
    name: string;
    rank: number;
  },
  sort: SortMode = "verified"
): string {
  switch (sort) {
    case "verified":
      return encodeCursor({
        s: "verified",
        q: true,
        v: row.verified,
        r: row.rank,
        c: row.created_at,
        i: row.id,
      });
    case "newest":
      return encodeCursor({
        s: "newest",
        q: true,
        r: row.rank,
        c: row.created_at,
        i: row.id,
      });
    case "name":
      return encodeCursor({
        s: "name",
        q: true,
        r: row.rank,
        n: row.name,
        i: row.id,
      });
  }
}
