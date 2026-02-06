import Link from "next/link";

const navigation = [
  { name: "Browse", href: "/servers" },
  { name: "Docs", href: "/docs" },
  { name: "About", href: "/about" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
        >
          <span className="text-primary-600">MCP</span>
          <span>Registry</span>
        </Link>

        {/* Navigation links */}
        <div className="hidden items-center gap-6 sm:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth placeholder - will be implemented later */}
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}
