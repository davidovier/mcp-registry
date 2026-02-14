import { expect, test } from "@playwright/test";

// CI uses placeholder Supabase credentials; avoid DB-dependent checks there.
const skipDbDependentChecks = process.env.CI_SKIP_AUTH_TESTS === "true";

test.describe("Security smoke tests", () => {
  test("GET /api/admin/bootstrap rejects unsupported method", async ({
    request,
  }) => {
    const response = await request.get("/api/admin/bootstrap");

    expect(response.status()).toBe(405);
    const body = await response.json();
    expect(body.error).toBe("Method not allowed");
  });

  test("POST /api/admin/bootstrap without token is rejected", async ({
    request,
  }) => {
    const response = await request.post("/api/admin/bootstrap", {
      data: { email: "attacker@example.com" },
    });

    // Not configured in many environments (503) or configured but unauthorized (401).
    expect([401, 503]).toContain(response.status());

    const body = await response.json();
    expect(typeof body.error).toBe("string");
    expect(body.error.toLowerCase()).not.toContain("stack");
    expect(body.error.toLowerCase()).not.toContain("trace");
  });

  test("auth callback does not redirect to attacker domain via next param", async ({
    request,
  }) => {
    const response = await request.get(
      "/auth/callback?next=https://evil.example/phish",
      { maxRedirects: 0 }
    );

    expect([302, 303, 307, 308]).toContain(response.status());

    const location = response.headers()["location"] || "";
    expect(location).toContain("/signin?error=auth_failed");
    expect(location).not.toContain("evil.example");
  });

  test("GET /api/health returns non-cacheable response", async ({
    request,
  }) => {
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe(
      "no-store, no-cache, must-revalidate"
    );
  });

  test("GET /api/servers enforces max limit", async ({ request }) => {
    test.skip(
      skipDbDependentChecks,
      "Skipping DB-dependent API checks in CI placeholder environment"
    );

    const response = await request.get("/api/servers?limit=9999");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(50);
  });

  test.describe("Input injection protection", () => {
    // These tests verify that malformed input is handled gracefully
    // In CI without DB, we skip since 500s may be from connection errors
    const injectionPayloads = [
      // SQL injection attempts
      "'; DROP TABLE mcp_servers; --",
      "1' OR '1'='1",
      // PostgREST filter injection
      "id.eq.1,id.neq.1",
      "),id.eq.1--",
    ];

    for (const payload of injectionPayloads) {
      test(`cursor param handles malformed input: ${payload.slice(0, 25)}...`, async ({
        request,
      }) => {
        test.skip(
          skipDbDependentChecks,
          "Skipping DB-dependent injection tests in CI"
        );

        const encodedPayload = encodeURIComponent(
          Buffer.from(
            JSON.stringify({ s: "newest", c: payload, i: "1" })
          ).toString("base64")
        );

        const response = await request.get(
          `/api/servers?cursor=${encodedPayload}`
        );

        // Should return 200 (invalid cursor ignored) or 400 (bad request)
        // 500 indicates potential injection vulnerability
        expect([200, 400]).toContain(response.status());

        // If there's an error body, it should not leak internal details
        if (!response.ok()) {
          const body = await response.json();
          if (body.error) {
            expect(body.error.toLowerCase()).not.toContain("syntax");
            expect(body.error.toLowerCase()).not.toContain("postgres");
          }
        }
      });
    }

    test("search query does not reflect script tags", async ({ request }) => {
      const response = await request.get(
        "/api/servers?q=<script>alert(1)</script>"
      );

      // Response should not reflect the script tag
      const text = await response.text();
      expect(text).not.toContain("<script>");
    });
  });
});
