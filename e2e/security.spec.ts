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
});
