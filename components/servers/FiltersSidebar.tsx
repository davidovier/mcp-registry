"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { trackFilterUsed } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TRANSPORT_OPTIONS = [
  { value: "stdio", label: "stdio" },
  { value: "http", label: "http" },
  { value: "both", label: "both" },
];

const AUTH_OPTIONS = [
  { value: "none", label: "None" },
  { value: "api_key", label: "API Key" },
  { value: "oauth", label: "OAuth" },
  { value: "other", label: "Other" },
];

interface FiltersSidebarProps {
  className?: string;
}

export function FiltersSidebar({ className }: FiltersSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toServersHref = useCallback((params: URLSearchParams) => {
    const query = params.toString();
    return query ? `/servers?${query}` : "/servers";
  }, []);

  const currentTransport = searchParams.get("transport") || "";
  const currentAuth = searchParams.get("auth") || "";
  const currentVerified = searchParams.get("verified") === "true";

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
        // Track filter usage
        trackFilterUsed(key, value);
      } else {
        params.delete(key);
      }
      // Reset cursor when filters change
      params.delete("cursor");
      router.push(toServersHref(params));
    },
    [router, searchParams, toServersHref]
  );

  const handleRadioChange = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key);
      // Toggle off if same value is selected
      updateFilter(key, current === value ? null : value);
    },
    [searchParams, updateFilter]
  );

  return (
    <aside className={cn("flex-shrink-0 lg:w-64", className)}>
      <div className="sticky top-20 space-y-6 rounded-xl bg-surface-secondary p-4">
        <FilterGroup title="Transport">
          {TRANSPORT_OPTIONS.map((option) => (
            <FilterOption
              key={option.value}
              label={option.label}
              checked={currentTransport === option.value}
              onChange={() => handleRadioChange("transport", option.value)}
            />
          ))}
        </FilterGroup>

        <FilterGroup title="Authentication">
          {AUTH_OPTIONS.map((option) => (
            <FilterOption
              key={option.value}
              label={option.label}
              checked={currentAuth === option.value}
              onChange={() => handleRadioChange("auth", option.value)}
            />
          ))}
        </FilterGroup>

        <div>
          <h3 className="mb-3 text-heading-sm text-content-primary">
            Capabilities
          </h3>
          <p className="text-caption text-content-tertiary">
            Filtering by capabilities is coming soon.
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <FilterOption
            label="Verified only"
            checked={currentVerified}
            onChange={() =>
              updateFilter("verified", currentVerified ? null : "true")
            }
            bold
          />
        </div>
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-heading-sm text-content-primary">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterOption({
  label,
  checked,
  onChange,
  bold,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  bold?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Add native event listener for Playwright compatibility
  // React's synthetic events don't always fire with programmatic interactions
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    let lastChecked = input.checked;
    const handleNativeChange = () => {
      // Only fire if checked state actually changed
      if (input.checked !== lastChecked) {
        lastChecked = input.checked;
        onChange();
      }
    };

    input.addEventListener("change", handleNativeChange);
    input.addEventListener("click", handleNativeChange);

    return () => {
      input.removeEventListener("change", handleNativeChange);
      input.removeEventListener("click", handleNativeChange);
    };
  }, [onChange]);

  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600"
      />
      <span
        className={cn(
          "text-body-sm text-content-secondary",
          bold && "font-medium text-content-primary"
        )}
      >
        {label}
      </span>
    </label>
  );
}
