import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

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
  const next = searchParams.get("next") ?? "/";

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  let redirectBase: string;
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    redirectBase = process.env.NEXT_PUBLIC_SITE_URL;
  } else if (isLocalEnv) {
    redirectBase = new URL(request.url).origin;
  } else if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    redirectBase = `${forwardedProto}://${forwardedHost}`;
  } else {
    redirectBase = new URL(request.url).origin;
  }

  if (code) {
    // Create the redirect response FIRST, then set cookies ON it.
    const redirectResponse = NextResponse.redirect(`${redirectBase}${next}`);

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

  return NextResponse.redirect(`${redirectBase}/signin?error=auth_failed`);
}
