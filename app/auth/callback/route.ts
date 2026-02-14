import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

function sanitizeNextPath(nextParam: string | null): string {
  if (!nextParam || !nextParam.startsWith("/") || nextParam.startsWith("//")) {
    return "/";
  }

  try {
    const decoded = decodeURIComponent(nextParam);
    if (
      !decoded.startsWith("/") ||
      decoded.startsWith("//") ||
      decoded.includes("\n") ||
      decoded.includes("\r")
    ) {
      return "/";
    }
    return decoded;
  } catch {
    return "/";
  }
}

/**
 * Auth callback handler for OAuth providers and email magic links.
 * This route exchanges the auth code for a session.
 *
 * IMPORTANT: Uses NextRequest/NextResponse directly (NOT cookies() from
 * next/headers) so that session cookies are set on the redirect response.
 * Using cookies().set() + NextResponse.redirect() loses the cookies.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextPath = sanitizeNextPath(searchParams.get("next"));
  const isLocalEnv = process.env.NODE_ENV === "development";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Production must use a fixed, explicit origin to avoid host-header abuse.
  if (!siteUrl && !isLocalEnv) {
    console.error(
      "Auth callback misconfigured: NEXT_PUBLIC_SITE_URL is missing"
    );
    return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
  }

  const redirectBase = siteUrl ?? new URL(request.url).origin;

  if (code) {
    // Create the redirect response FIRST, then set cookies ON it.
    const redirectResponse = NextResponse.redirect(
      new URL(nextPath, redirectBase)
    );

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              redirectResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return redirectResponse;
    }

    console.error("Auth callback error:", error.message);
  }

  return NextResponse.redirect(
    new URL("/signin?error=auth_failed", redirectBase)
  );
}
