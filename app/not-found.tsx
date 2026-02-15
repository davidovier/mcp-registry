import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-display-md text-content-primary">Page Not Found</h1>
      <p className="mt-3 max-w-lg text-body-md text-content-secondary">
        The page you requested does not exist or may have been moved.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-700 px-4 text-body-sm font-medium text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
