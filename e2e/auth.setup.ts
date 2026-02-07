import { test as setup, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const authFile = "playwright/.auth/user.json";

/**
 * Auth setup - creates test user (if needed) and authenticates
 *
 * This setup runs once before all authenticated tests.
 * It uses Supabase's password auth for E2E testing.
 *
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon key
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key (for admin operations)
 * - E2E_TEST_USER_EMAIL: Test user email
 * - E2E_TEST_USER_PASSWORD: Test user password
 */
setup("authenticate", async ({ page }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const testEmail = process.env.E2E_TEST_USER_EMAIL;
  const testPassword = process.env.E2E_TEST_USER_PASSWORD;

  // Validate required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  if (!serviceRoleKey || !testEmail || !testPassword) {
    throw new Error(
      "Missing required environment variables for auth setup. " +
        "Ensure SUPABASE_SERVICE_ROLE_KEY, E2E_TEST_USER_EMAIL, " +
        "and E2E_TEST_USER_PASSWORD are set."
    );
  }

  // Create admin client to manage test user
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
      email_confirm: true, // Auto-confirm email for testing
    });

    if (createError) {
      throw new Error(`Failed to create test user: ${createError.message}`);
    }
    console.log("Test user created successfully");
  } else {
    console.log("Test user already exists");
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

  // Navigate to the app
  await page.goto("/");

  // Extract project reference from URL for cookie name
  // Supabase SSR uses cookie names like: sb-<project-ref>-auth-token
  const urlParts = new URL(supabaseUrl);
  const projectRef = urlParts.hostname.split(".")[0];
  const cookieName = `sb-${projectRef}-auth-token`;

  // Create the auth token cookie value (base64 encoded JSON)
  const authTokenValue = Buffer.from(
    JSON.stringify({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      expires_at: signInData.session.expires_at,
      expires_in: signInData.session.expires_in,
      token_type: signInData.session.token_type,
      user: signInData.session.user,
    })
  ).toString("base64");

  // Set the auth cookie
  await page.context().addCookies([
    {
      name: cookieName,
      value: authTokenValue,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  // Reload the page to pick up the new cookies
  await page.reload();

  // Navigate to a protected page to verify authentication works
  await page.goto("/submit");

  // Wait for the page to load and verify we're authenticated
  // If we see the submit form heading, we're authenticated
  await expect(
    page.getByRole("heading", { name: /submit a server/i })
  ).toBeVisible({ timeout: 15000 });

  console.log("Authentication verified - saving storage state");

  // Save storage state for reuse
  await page.context().storageState({ path: authFile });
});
