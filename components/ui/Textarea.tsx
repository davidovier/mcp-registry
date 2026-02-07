"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  showCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      hint,
      error,
      showCount,
      maxLength,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-body-sm font-medium text-content-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            value={value}
            maxLength={maxLength}
            className={cn(
              `min-h-[100px] w-full resize-y rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-content-primary transition-colors duration-150 placeholder:text-content-tertiary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50`,
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          {hint && !error && (
            <p className="text-caption text-content-tertiary">{hint}</p>
          )}
          {error && (
            <p className="flex items-center gap-1 text-caption text-red-500">
              <svg
                className="h-3.5 w-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </p>
          )}
          {!hint && !error && <span />}
          {showCount && maxLength && (
            <span
              className={cn(
                "ml-auto text-caption",
                currentLength >= maxLength
                  ? "text-red-500"
                  : currentLength >= maxLength * 0.9
                    ? "text-amber-500"
                    : "text-content-tertiary"
              )}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea };
