"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useTransition } from "react";

import { signOut } from "@/app/signin/actions";

interface AuthButtonsProps {
  user: User | null;
  isAdmin: boolean;
}

export function AuthButtons({ user, isAdmin }: AuthButtonsProps) {
  const [isPending, startTransition] = useTransition();

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/signin"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/submit"
        className="text-sm font-medium text-content-secondary transition-colors hover:text-content-primary"
      >
        Submit
      </Link>
      <Link
        href="/my/submissions"
        className="text-sm font-medium text-content-secondary transition-colors hover:text-content-primary"
      >
        My Submissions
      </Link>
      {isAdmin && (
        <Link
          href="/admin/submissions"
          className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
        >
          Admin
        </Link>
      )}
      <Link
        href="/my/account"
        className="text-sm font-medium text-content-secondary transition-colors hover:text-content-primary"
      >
        Account
      </Link>
      <button
        onClick={() => startTransition(() => signOut())}
        disabled={isPending}
        className="text-sm font-medium text-content-secondary transition-colors hover:text-content-primary disabled:opacity-50"
      >
        {isPending ? "..." : "Sign Out"}
      </button>
    </div>
  );
}
