import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback handler for email magic links.
 * This route exchanges the auth code for a session.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // Use NEXT_PUBLIC_SITE_URL for reliable redirects (proxies/CDNs can mangle request.url)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the originally requested page, or home
      return NextResponse.redirect(`${siteUrl}${next}`);
    }
  }

  // If there's an error or no code, redirect to signin with error
  return NextResponse.redirect(`${siteUrl}/signin?error=auth_failed`);
}
