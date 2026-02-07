import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { AuthButtons } from "./auth-buttons";

const navigation = [
  { name: "Browse", href: "/servers" },
  { name: "Docs", href: "/docs" },
  { name: "About", href: "/about" },
];

export async function Header() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile if logged in
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="bg-surface-secondary/80 sticky top-0 z-50 border-b border-border backdrop-blur-sm">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-content-primary"
        >
          <span className="text-brand-600">MCP</span>
          <span>Registry</span>
        </Link>

        {/* Navigation links */}
        <div className="hidden items-center gap-6 sm:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-content-secondary transition-colors hover:text-content-primary"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <AuthButtons user={user} isAdmin={isAdmin} />
      </nav>
    </header>
  );
}
