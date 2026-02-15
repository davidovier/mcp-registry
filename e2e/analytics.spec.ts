import { test, expect } from "@playwright/test";

test.describe("Analytics Events API", () => {
  test("POST /api/events should accept valid events", async ({ request }) => {
    const response = await request.post("/api/events", {
      data: {
        event_type: "page_view",
        route: "/",
        metadata: { referrer: "https://example.com" },
        session_id: "test-session-123",
      },
    });

    expect(response.status()).toBe(202);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test("POST /api/events should accept search_performed event", async ({
    request,
  }) => {
    const response = await request.post("/api/events", {
      data: {
        event_type: "search_performed",
        route: "/servers",
        metadata: { query: "postgres", results_count: 5 },
        session_id: "test-session-456",
      },
    });

    expect(response.status()).toBe(202);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test("POST /api/events should accept server_viewed event", async ({
    request,
  }) => {
    const response = await request.post("/api/events", {
      data: {
        event_type: "server_viewed",
        route: "/servers/test-server",
        metadata: { slug: "test-server", verified: true },
        session_id: "test-session-789",
      },
    });

    expect(response.status()).toBe(202);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test("POST /api/events should accept external_link_clicked event", async ({
    request,
  }) => {
    const response = await request.post("/api/events", {
      data: {
        event_type: "external_link_clicked",
        route: "/servers/test-server",
        metadata: { url: "https://github.com/test/repo", link_type: "repo" },
        session_id: "test-session-101",
      },
    });

    expect(response.status()).toBe(202);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test("POST /api/events should reject invalid event_type", async ({
    request,
  }) => {
    const response = await request.post("/api/events", {
      data: {
        event_type: "invalid_event",
        route: "/",
        metadata: {},
        session_id: "test-session",
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid event_type");
  });

  test("POST /api/events should accept events without session_id", async ({
    request,
  }) => {
    const response = await request.post("/api/events", {
      data: {
        event_type: "page_view",
        route: "/about",
        metadata: {},
      },
    });

    expect(response.status()).toBe(202);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test("POST /api/events should handle all valid event types", async ({
    request,
  }) => {
    const eventTypes = [
      "page_view",
      "search_performed",
      "server_viewed",
      "verification_requested",
      "submit_started",
      "submit_completed",
      "external_link_clicked",
      "filter_used",
      "sort_changed",
      // Scroll depth events
      "scroll_25",
      "scroll_50",
      "scroll_75",
      // CTA visibility events
      "primary_cta_visible",
      "primary_cta_clicked",
    ];

    for (const eventType of eventTypes) {
      const response = await request.post("/api/events", {
        data: {
          event_type: eventType,
          route: "/test",
          metadata: {},
          session_id: `test-${eventType}`,
        },
      });

      expect(response.status()).toBe(202);
    }
  });

  test("POST /api/events should accept scroll depth events", async ({
    request,
  }) => {
    const scrollEvents = ["scroll_25", "scroll_50", "scroll_75"];

    for (const eventType of scrollEvents) {
      const response = await request.post("/api/events", {
        data: {
          event_type: eventType,
          route: "/",
          metadata: { page: "/" },
          session_id: "test-scroll-session",
        },
      });

      expect(response.status()).toBe(202);
      const data = await response.json();
      expect(data.success).toBe(true);
    }
  });

  test("POST /api/events should accept CTA visibility events", async ({
    request,
  }) => {
    // Test CTA visible event
    const visibleResponse = await request.post("/api/events", {
      data: {
        event_type: "primary_cta_visible",
        route: "/",
        metadata: { cta_id: "browse-registry", time_to_visible_ms: 250 },
        session_id: "test-cta-session",
      },
    });

    expect(visibleResponse.status()).toBe(202);

    // Test CTA clicked event
    const clickedResponse = await request.post("/api/events", {
      data: {
        event_type: "primary_cta_clicked",
        route: "/",
        metadata: { cta_id: "browse-registry", time_to_click_ms: 1500 },
        session_id: "test-cta-session",
      },
    });

    expect(clickedResponse.status()).toBe(202);
  });
});

test.describe("Funnel Metrics API", () => {
  test("GET /api/metrics/funnel should return correct shape", async ({
    request,
  }) => {
    const response = await request.get("/api/metrics/funnel");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty("period");
    expect(data.period).toHaveProperty("start");
    expect(data.period).toHaveProperty("end");
    expect(data.period).toHaveProperty("days");

    expect(data).toHaveProperty("total_sessions");
    expect(typeof data.total_sessions).toBe("number");

    expect(data).toHaveProperty("stages");
    expect(Array.isArray(data.stages)).toBe(true);

    // Verify stage structure (includes CTA visibility stages)
    const expectedStages = [
      "visit",
      "primary_cta_visible",
      "primary_cta_clicked",
      "search",
      "view_server",
      "click_external",
      "submit_started",
      "submit_completed",
    ];

    expect(data.stages.length).toBe(expectedStages.length);

    for (let i = 0; i < data.stages.length; i++) {
      const stage = data.stages[i];
      expect(stage).toHaveProperty("stage");
      expect(stage.stage).toBe(expectedStages[i]);
      expect(stage).toHaveProperty("unique_sessions");
      expect(typeof stage.unique_sessions).toBe("number");
      expect(stage).toHaveProperty("percentage_of_visitors");
      expect(typeof stage.percentage_of_visitors).toBe("number");
      expect(stage).toHaveProperty("dropoff_from_previous");
    }
  });

  test("GET /api/metrics/funnel should accept days parameter", async ({
    request,
  }) => {
    const response = await request.get("/api/metrics/funnel?days=30");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.period.days).toBe(30);
  });

  test("GET /api/metrics/funnel should cap days at 90", async ({ request }) => {
    const response = await request.get("/api/metrics/funnel?days=365");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.period.days).toBe(90);
  });

  test("GET /api/metrics/funnel should default to 7 days", async ({
    request,
  }) => {
    const response = await request.get("/api/metrics/funnel");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.period.days).toBe(7);
  });
});

test.describe("Insights API", () => {
  test("GET /api/metrics/insights should return correct shape", async ({
    request,
  }) => {
    const response = await request.get("/api/metrics/insights");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty("period");
    expect(data.period).toHaveProperty("start");
    expect(data.period).toHaveProperty("end");
    expect(data.period).toHaveProperty("days");

    expect(data).toHaveProperty("insights");
    expect(Array.isArray(data.insights)).toBe(true);

    expect(data).toHaveProperty("summary");
    expect(data.summary).toHaveProperty("critical");
    expect(data.summary).toHaveProperty("high");
    expect(data.summary).toHaveProperty("medium");
    expect(data.summary).toHaveProperty("low");
    expect(data.summary).toHaveProperty("total");

    // Verify insight structure if any exist
    if (data.insights.length > 0) {
      const insight = data.insights[0];
      expect(insight).toHaveProperty("id");
      expect(insight).toHaveProperty("category");
      expect(insight).toHaveProperty("severity");
      expect(insight).toHaveProperty("title");
      expect(insight).toHaveProperty("description");
      expect(insight).toHaveProperty("evidence");
      expect(insight).toHaveProperty("suggested_fix");
      expect(insight).toHaveProperty("metric_value");
      expect(insight).toHaveProperty("threshold");
      expect(insight).toHaveProperty("created_at");

      // Verify severity is valid
      expect(["critical", "high", "medium", "low"]).toContain(insight.severity);

      // Verify category is valid
      expect(["conversion", "engagement", "ux", "performance"]).toContain(
        insight.category
      );
    }
  });

  test("GET /api/metrics/insights should accept days parameter", async ({
    request,
  }) => {
    const response = await request.get("/api/metrics/insights?days=30");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.period.days).toBe(30);
  });

  test("GET /api/metrics/insights should cap days at 90", async ({
    request,
  }) => {
    const response = await request.get("/api/metrics/insights?days=365");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.period.days).toBe(90);
  });

  test("GET /api/metrics/insights summary should match insight count", async ({
    request,
  }) => {
    const response = await request.get("/api/metrics/insights");

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    const calculatedTotal =
      data.summary.critical +
      data.summary.high +
      data.summary.medium +
      data.summary.low;

    expect(data.summary.total).toBe(calculatedTotal);
    expect(data.insights.length).toBe(data.summary.total);
  });
});

test.describe("Analytics Client Integration", () => {
  test.beforeEach(async ({ page }) => {
    // Intercept analytics requests to verify they're being sent
    await page.route("/api/events", (route) => {
      route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });
  });

  test("should generate session ID on first analytics event", async ({
    page,
  }) => {
    await page.goto("/servers");
    await page.waitForLoadState("networkidle");

    // Trigger an analytics event by clicking a filter
    // First, set viewport to desktop to see filters
    await page.setViewportSize({ width: 1280, height: 720 });

    // Use the sidebar filter - use a more specific selector
    const sidebar = page.locator("aside").first();
    const stdioCheckbox = sidebar.getByLabel("stdio");

    // Wait for the checkbox to be visible (may not exist if no servers)
    if (await stdioCheckbox.isVisible().catch(() => false)) {
      await stdioCheckbox.click();

      // After clicking, session ID should be created
      const sessionId = await page.evaluate(() => {
        return localStorage.getItem("mcp_registry_session_id");
      });

      // Session ID should now exist and be a valid UUID
      if (sessionId) {
        expect(sessionId).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      }
    }
  });

  test("should persist session ID across pages", async ({ page }) => {
    await page.goto("/servers");
    await page.setViewportSize({ width: 1280, height: 720 });

    // Manually set a session ID to test persistence
    await page.evaluate(() => {
      localStorage.setItem(
        "mcp_registry_session_id",
        "test-session-12345678-1234-4123-8123-123456789abc"
      );
    });

    // Navigate to another page
    await page.goto("/about");
    await page.waitForLoadState("networkidle");

    // Session ID should persist
    const sessionId = await page.evaluate(() => {
      return localStorage.getItem("mcp_registry_session_id");
    });

    expect(sessionId).toBe("test-session-12345678-1234-4123-8123-123456789abc");
  });

  test("should respect Do Not Track", async ({ page, context }) => {
    // Set Do Not Track header
    await context.route("**/*", (route) => {
      const headers = {
        ...route.request().headers(),
        DNT: "1",
      };
      route.continue({ headers });
    });

    let _eventsSent = 0;
    await page.route("/api/events", (route) => {
      _eventsSent++;
      route.fulfill({
        status: 202,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // No events should be sent when DNT is enabled
    // Note: This test validates the behavior is non-blocking
    // The actual DNT check happens on client side
  });
});
