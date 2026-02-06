import Link from "next/link";

export default function ServerNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
        Server Not Found
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        The MCP server you&apos;re looking for doesn&apos;t exist or has been
        removed.
      </p>
      <Link
        href="/servers"
        className="bg-primary-600 hover:bg-primary-700 inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors"
      >
        Browse All Servers
      </Link>
    </div>
  );
}
