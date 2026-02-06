import { test, expect } from "@playwright/test";

// Skip API tests in CI (requires real Supabase connection)
const skipInCI = process.env.CI_SKIP_AUTH_TESTS === "true";

/**
 * API endpoint tests
 *
 * These tests require a real Supabase connection and are skipped in CI
 * which uses placeholder credentials.
 */
test.describe("Servers API", () => {
  test.skip(skipInCI, "Skipping API tests in CI - requires real database");
  test("GET /api/servers should return paginated list", async ({ request }) => {
    const response = await request.get("/api/servers");

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("application/json");

    const data = await response.json();

    // Check response structure
    expect(data).toHaveProperty("data");
    expect(Array.isArray(data.data)).toBe(true);
    expect(data).toHaveProperty("nextCursor");

    // Should have total on first page
    expect(data).toHaveProperty("total");
    expect(typeof data.total).toBe("number");
  });

  test("GET /api/servers should respect limit parameter", async ({
    request,
  }) => {
    const response = await request.get("/api/servers?limit=2");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.data.length).toBeLessThanOrEqual(2);
  });

  test("GET /api/servers should filter by transport", async ({ request }) => {
    const response = await request.get("/api/servers?transport=stdio");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // All returned servers should have stdio transport
    for (const server of data.data) {
      expect(server.transport).toBe("stdio");
    }
  });

  test("GET /api/servers should filter by verified", async ({ request }) => {
    const response = await request.get("/api/servers?verified=true");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // All returned servers should be verified
    for (const server of data.data) {
      expect(server.verified).toBe(true);
    }
  });

  test("GET /api/servers should support search query", async ({ request }) => {
    const response = await request.get("/api/servers?q=github");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Should return results (if any match)
    expect(Array.isArray(data.data)).toBe(true);
  });

  test("GET /api/servers/[slug] should return single server", async ({
    request,
  }) => {
    // First get a server from the list
    const listResponse = await request.get("/api/servers?limit=1");
    const listData = await listResponse.json();

    if (listData.data.length > 0) {
      const slug = listData.data[0].slug;
      const response = await request.get(`/api/servers/${slug}`);

      expect(response.ok()).toBeTruthy();

      const server = await response.json();
      expect(server.slug).toBe(slug);
      expect(server).toHaveProperty("name");
      expect(server).toHaveProperty("description");
    }
  });

  test("GET /api/servers/[slug] should return 404 for non-existent server", async ({
    request,
  }) => {
    const response = await request.get("/api/servers/non-existent-slug-12345");

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty("error");
  });

  test("GET /api/servers/[slug] should return 400 for invalid slug", async ({
    request,
  }) => {
    const response = await request.get("/api/servers/Invalid Slug!");

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty("error");
  });
});

test.describe("Pagination", () => {
  test.skip(skipInCI, "Skipping API tests in CI - requires real database");
  test("should provide nextCursor for pagination", async ({ request }) => {
    // Get first page with small limit
    const response = await request.get("/api/servers?limit=2");
    const data = await response.json();

    // If there are more results, nextCursor should be provided
    if (data.total > 2) {
      expect(data.nextCursor).toBeTruthy();
    }
  });

  test("should load more results with cursor", async ({ request }) => {
    // Get first page
    const page1Response = await request.get("/api/servers?limit=2");
    const page1Data = await page1Response.json();

    if (page1Data.nextCursor) {
      // Get second page using cursor
      const page2Response = await request.get(
        `/api/servers?limit=2&cursor=${page1Data.nextCursor}`
      );
      const page2Data = await page2Response.json();

      expect(page2Response.ok()).toBeTruthy();
      expect(Array.isArray(page2Data.data)).toBe(true);

      // Should not have total on subsequent pages
      expect(page2Data.total).toBeUndefined();

      // Second page should have different servers (if there are enough)
      if (page2Data.data.length > 0 && page1Data.data.length > 0) {
        expect(page2Data.data[0].id).not.toBe(page1Data.data[0].id);
      }
    }
  });
});

test.describe("Cache headers", () => {
  test.skip(skipInCI, "Skipping API tests in CI - requires real database");
  test("GET /api/servers should have cache control headers", async ({
    request,
  }) => {
    const response = await request.get("/api/servers");
    const cacheControl = response.headers()["cache-control"];

    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("s-maxage");
  });

  test("GET /api/servers/[slug] should have cache control headers", async ({
    request,
  }) => {
    // First get a server
    const listResponse = await request.get("/api/servers?limit=1");
    const listData = await listResponse.json();

    if (listData.data.length > 0) {
      const response = await request.get(
        `/api/servers/${listData.data[0].slug}`
      );
      const cacheControl = response.headers()["cache-control"];

      expect(cacheControl).toContain("public");
    }
  });
});
