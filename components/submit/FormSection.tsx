"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** If true, section is always expanded and cannot be collapsed */
  alwaysOpen?: boolean;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  defaultOpen = true,
  alwaysOpen = false,
  className,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const effectivelyOpen = alwaysOpen || isOpen;

  return (
    <section className={cn("space-y-4", className)}>
      <button
        type="button"
        onClick={() => !alwaysOpen && setIsOpen(!isOpen)}
        disabled={alwaysOpen}
        className={cn(
          "flex w-full items-center justify-between gap-2 text-left",
          !alwaysOpen && "cursor-pointer md:cursor-default"
        )}
        aria-expanded={effectivelyOpen}
      >
        <div className="space-y-0.5">
          <h2 className="text-heading-md text-content-primary">{title}</h2>
          {description && (
            <p className="text-body-sm text-content-secondary">{description}</p>
          )}
        </div>

        {/* Mobile-only collapse indicator */}
        {!alwaysOpen && (
          <svg
            className={cn(
              "h-5 w-5 flex-shrink-0 text-content-tertiary transition-transform md:hidden",
              effectivelyOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {/* Content - always visible on desktop, collapsible on mobile */}
      <div
        className={cn(
          "space-y-4 transition-all duration-200",
          !effectivelyOpen && "hidden md:block",
          // On mobile, add animation for collapse
          !alwaysOpen && !effectivelyOpen && "md:opacity-100"
        )}
      >
        {children}
      </div>
    </section>
  );
}
