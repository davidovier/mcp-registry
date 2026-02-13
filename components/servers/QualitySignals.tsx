interface QualitySignalsProps {
  hasDocumentation: boolean;
  hasRepository: boolean;
  requiresAuth: boolean;
  recentlyUpdated: boolean;
  verified: boolean;
}

export function QualitySignals({
  hasDocumentation,
  hasRepository,
  requiresAuth,
  recentlyUpdated,
  verified,
}: QualitySignalsProps) {
  const signals = [
    {
      label: "Has documentation",
      met: hasDocumentation,
    },
    {
      label: "Has repository",
      met: hasRepository,
    },
    {
      label: "Requires authentication",
      met: requiresAuth,
    },
    {
      label: "Recently updated",
      met: recentlyUpdated,
      tooltip: "Updated within the last 90 days",
    },
    {
      label: "Verified by registry",
      met: verified,
    },
  ];

  const metCount = signals.filter((s) => s.met).length;

  return (
    <div>
      <h3 className="mb-3 text-heading-sm text-content-primary">
        Quality signals
      </h3>
      <ul className="space-y-2">
        {signals.map((signal) => (
          <li key={signal.label} className="flex items-center gap-2">
            {signal.met ? (
              <svg
                className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 flex-shrink-0 text-content-tertiary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span
              className={`text-body-sm ${
                signal.met ? "text-content-primary" : "text-content-tertiary"
              }`}
            >
              {signal.label}
            </span>
          </li>
        ))}
      </ul>
      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-full rounded-full bg-content-tertiary transition-all duration-300"
            style={{ width: `${(metCount / signals.length) * 100}%` }}
          />
        </div>
      </div>
      <p className="mt-2 text-caption text-content-tertiary">
        Quality signals: {metCount} of {signals.length} met
      </p>
    </div>
  );
}
