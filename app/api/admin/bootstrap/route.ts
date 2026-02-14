import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function getClientIp(request: NextRequest): string {
  const trustedIp =
    request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip");

  if (trustedIp) {
    return trustedIp;
  }

  // Fallback for local/dev environments.
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

/**
 * POST /api/admin/bootstrap
 *
 * One-time admin bootstrap endpoint.
 * Requires:
 *   - Header: x-bootstrap-token matching ADMIN_BOOTSTRAP_TOKEN env var
 *   - Body: { email: string } matching ADMIN_BOOTSTRAP_EMAIL env var
 *
 * This endpoint:
 *   1. Verifies the bootstrap hasn't been done yet
 *   2. Looks up the user by email in auth.users
 *   3. Sets their profile role to 'admin'
 *   4. Marks bootstrap as done (self-disabling)
 *   5. Logs the action to audit_log
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Verify bootstrap token
    const bootstrapToken = process.env.ADMIN_BOOTSTRAP_TOKEN;
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;

    if (!bootstrapToken || !bootstrapEmail) {
      // Bootstrap not configured - return generic error
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const providedToken = request.headers.get("x-bootstrap-token");
    if (!providedToken || !safeEqual(providedToken, bootstrapToken)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and verify email
    let body: { email?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (
      !body.email ||
      !safeEqual(body.email.toLowerCase(), bootstrapEmail.toLowerCase())
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create service client
    const supabase = createServiceClient();

    // Check if bootstrap already done
    const { data: bootstrapState, error: stateError } = await supabase
      .from("bootstrap_state")
      .select("value")
      .eq("key", "admin_bootstrap_done")
      .single();

    if (stateError) {
      console.error("Failed to check bootstrap state:", stateError);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    if (bootstrapState?.value === "true") {
      return NextResponse.json(
        { error: "Bootstrap already completed" },
        { status: 409 }
      );
    }

    // Look up user by email using admin API
    const { data: userData, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) {
      console.error("Failed to list users:", userError);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    const targetUser = userData.users.find(
      (u) => u.email?.toLowerCase() === bootstrapEmail.toLowerCase()
    );

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found. Please sign up first." },
        { status: 404 }
      );
    }

    // Update profile role to admin
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "admin", updated_at: new Date().toISOString() })
      .eq("id", targetUser.id);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    // Mark bootstrap as done
    const { error: markError } = await supabase
      .from("bootstrap_state")
      .update({
        value: "true",
        updated_at: new Date().toISOString(),
      })
      .eq("key", "admin_bootstrap_done");

    if (markError) {
      console.error("Failed to mark bootstrap done:", markError);
      // Continue anyway - the admin was created
    }

    // Log the action
    await supabase.from("audit_log").insert({
      action: "admin_bootstrap",
      actor: targetUser.id,
      details: {
        email: bootstrapEmail,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin bootstrap completed",
      userId: targetUser.id,
    });
  } catch (error) {
    console.error("Bootstrap error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Only POST is allowed
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
