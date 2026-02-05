import { describe, it, expect } from "vitest";

import { GET } from "@/app/api/health/route";

describe("Health API", () => {
  it("returns healthy status", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.timestamp).toBeDefined();
    expect(data.version).toBeDefined();
    expect(typeof data.uptime).toBe("number");
  });

  it("includes cache control headers", async () => {
    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe(
      "no-store, no-cache, must-revalidate"
    );
  });
});
