"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      hint,
      error,
      options,
      placeholder,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const internalRef = useRef<HTMLSelectElement>(null);

    // Expose the internal ref via the forwarded ref
    useImperativeHandle(ref, () => internalRef.current!, []);

    // Handle change events
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onChange) {
          onChange(e);
        }
      },
      [onChange]
    );

    // Add native event listener as fallback for programmatic changes (e.g., Playwright)
    // This ensures onChange is called even when events are dispatched programmatically
    useEffect(() => {
      const select = internalRef.current;
      if (!select || !onChange) return;

      let lastValue = select.value;

      const handleNativeChange = () => {
        // Only fire if value actually changed (avoid double-firing with React's onChange)
        if (select.value !== lastValue) {
          lastValue = select.value;
          // Create a synthetic-like event object
          const syntheticEvent = {
            target: select,
            currentTarget: select,
            preventDefault: () => {},
            stopPropagation: () => {},
          } as unknown as React.ChangeEvent<HTMLSelectElement>;
          onChange(syntheticEvent);
        }
      };

      // Listen to multiple events to catch programmatic changes
      select.addEventListener("input", handleNativeChange);
      select.addEventListener("change", handleNativeChange);

      // Also use MutationObserver to detect value changes via DOM manipulation
      const observer = new MutationObserver(() => {
        handleNativeChange();
      });
      observer.observe(select, {
        attributes: true,
        attributeFilter: ["value"],
      });

      return () => {
        select.removeEventListener("input", handleNativeChange);
        select.removeEventListener("change", handleNativeChange);
        observer.disconnect();
      };
    }, [onChange]);

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-body-sm font-medium text-content-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={internalRef}
            id={selectId}
            className={cn(
              `h-10 w-full appearance-none rounded-lg border border-border bg-surface-secondary px-3 pr-10 text-content-primary transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50`,
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-tertiary"
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
        </div>
        {hint && !error && (
          <p className="text-caption text-content-tertiary">{hint}</p>
        )}
        {error && <p className="text-caption text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
