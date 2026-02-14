import Link from "next/link";

const footerLinks = {
  product: [
    { name: "Browse", href: "/servers" },
    { name: "Submit", href: "/submit" },
    { name: "API", href: "/api" },
  ],
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "API", href: "/api" },
    { name: "Changelog", href: "/changelog" },
    { name: "About", href: "/about" },
    { name: "Verification", href: "/verification" },
    { name: "Contributing", href: "/contributing" },
    { name: "MCP Specification", href: "https://modelcontextprotocol.io" },
    { name: "GitHub", href: "https://github.com" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-secondary">
      <div className="container mx-auto px-4 py-12">
        <h2 className="sr-only">Site footer</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-content-primary"
            >
              <span className="text-brand-600">MCP</span>
              <span>Registry</span>
            </Link>
            <p className="mt-4 text-sm text-content-secondary">
              The central hub for discovering and sharing Model Context Protocol
              servers and tools.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-content-primary">
              Product
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-content-secondary transition-colors hover:text-content-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-content-primary">
              Resources
            </h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-content-secondary transition-colors hover:text-content-primary"
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-content-primary">
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-content-secondary transition-colors hover:text-content-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-content-tertiary">
            &copy; {currentYear} MCP Registry. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
