import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Auth callback handler for OAuth providers and email magic links.
 * This route exchanges the auth code for a session.
 *
 * Uses an inline Supabase client (not the shared createClient) to ensure
 * cookies are set without the try/catch that silences errors in Server Components.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // On Vercel, request.url may contain the internal host. Use x-forwarded-host
  // to get the actual public URL the user sees.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  let redirectBase: string;
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    redirectBase = process.env.NEXT_PUBLIC_SITE_URL;
  } else if (isLocalEnv) {
    redirectBase = origin;
  } else if (forwardedHost) {
    const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
    redirectBase = `${forwardedProto}://${forwardedHost}`;
  } else {
    redirectBase = origin;
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`);
    }

    console.error("Auth callback error:", error.message);
  }

  return NextResponse.redirect(`${redirectBase}/signin?error=auth_failed`);
}
