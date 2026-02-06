import { cn } from "@/lib/utils";

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
}

export function Alert({
  title,
  children,
  variant = "info",
  className,
}: AlertProps) {
  const variants = {
    info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    success:
      "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    warning:
      "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
    error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  };

  const icons = {
    info: (
      <svg
        className="h-5 w-5 flex-shrink-0 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    success: (
      <svg
        className="h-5 w-5 flex-shrink-0 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="h-5 w-5 flex-shrink-0 text-amber-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    error: (
      <svg
        className="h-5 w-5 flex-shrink-0 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-4",
        variants[variant],
        className
      )}
    >
      {icons[variant]}
      <div>
        {title && (
          <p className="mb-1 text-body-sm font-medium text-content-primary">
            {title}
          </p>
        )}
        <div className="text-body-sm text-content-secondary">{children}</div>
      </div>
    </div>
  );
}
