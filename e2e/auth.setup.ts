import { test as setup, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const authFile = "playwright/.auth/user.json";

/**
 * Auth setup - authenticates test user for E2E tests
 *
 * This setup runs once before all authenticated tests.
 * It uses Supabase's password auth for E2E testing.
 *
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon key
 * - E2E_TEST_USER_EMAIL: Test user email
 * - E2E_TEST_USER_PASSWORD: Test user password
 *
 * Optional:
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (for creating test user if needed)
 */
setup("authenticate", async ({ page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const testEmail =
    process.env.E2E_TEST_USER_EMAIL || "e2e-test@mcp-registry.test";
  const testPassword =
    process.env.E2E_TEST_USER_PASSWORD || "e2e-test-password-123";

  // Validate required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  // If service role key is available, ensure test user exists
  if (serviceRoleKey) {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Ensure test user exists (create if not)
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some((u) => u.email === testEmail);

    if (!userExists) {
      console.log(`Creating test user: ${testEmail}`);
      const { error: createError } = await adminClient.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
      });

      if (createError) {
        throw new Error(`Failed to create test user: ${createError.message}`);
      }
      console.log("Test user created successfully");
    } else {
      console.log("Test user already exists");
    }
  } else {
    console.log(
      "No service role key - assuming test user already exists in database"
    );
  }

  // Create anon client for sign-in
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);

  // Sign in with password
  const { data: signInData, error: signInError } =
    await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

  if (signInError) {
    throw new Error(`Failed to sign in test user: ${signInError.message}`);
  }

  if (!signInData.session) {
    throw new Error("No session returned from sign in");
  }

  console.log("Successfully signed in test user");

  const session = signInData.session;

  // Extract project reference from URL for cookie name
  // Supabase SSR uses cookie names like: sb-<project-ref>-auth-token
  const urlParts = new URL(supabaseUrl);
  const projectRef = urlParts.hostname.split(".")[0];

  // Navigate to the app first
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // The @supabase/ssr package stores sessions as JSON in cookies
  // The format expected is a JSON string (not base64 encoded)
  const sessionData = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  };

  const cookieValue = JSON.stringify(sessionData);

  // Set the auth token cookie (used by @supabase/ssr)
  await page.context().addCookies([
    {
      name: `sb-${projectRef}-auth-token`,
      value: cookieValue,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  console.log(`Set auth cookie: sb-${projectRef}-auth-token`);

  // Reload to pick up cookies
  await page.reload();
  await page.waitForLoadState("networkidle");

  // Navigate to a protected page to verify authentication works
  await page.goto("/submit");
  await page.waitForLoadState("networkidle");

  // Check if we're authenticated
  const heading = page.getByRole("heading", { name: /submit a server/i });
  const isAuthenticated = await heading
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  if (!isAuthenticated) {
    // The cookie format might need URL encoding for special characters
    console.log("Plain JSON cookie didn't work, trying URL-encoded format...");

    const encodedCookieValue = encodeURIComponent(cookieValue);
    await page.context().addCookies([
      {
        name: `sb-${projectRef}-auth-token`,
        value: encodedCookieValue,
        domain: "localhost",
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    await page.reload();
    await page.goto("/submit");
    await page.waitForLoadState("networkidle");
  }

  // If still not authenticated, try base64 format
  const isAuthenticatedNow = await heading
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  if (!isAuthenticatedNow) {
    console.log("Trying base64 encoded format...");

    const base64CookieValue = Buffer.from(cookieValue).toString("base64");
    await page.context().addCookies([
      {
        name: `sb-${projectRef}-auth-token`,
        value: base64CookieValue,
        domain: "localhost",
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    await page.reload();
    await page.goto("/submit");
    await page.waitForLoadState("networkidle");
  }

  // Final verification
  await expect(
    page.getByRole("heading", { name: /submit a server/i })
  ).toBeVisible({ timeout: 15000 });

  console.log("Authentication verified - saving storage state");

  // Save storage state for reuse
  await page.context().storageState({ path: authFile });
});
