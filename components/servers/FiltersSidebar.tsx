"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

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

const CAPABILITY_OPTIONS = [
  { value: "tools", label: "Tools" },
  { value: "resources", label: "Resources" },
  { value: "prompts", label: "Prompts" },
];

interface FiltersSidebarProps {
  className?: string;
}

export function FiltersSidebar({ className }: FiltersSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTransport = searchParams.get("transport") || "";
  const currentAuth = searchParams.get("auth") || "";
  const currentVerified = searchParams.get("verified") === "true";

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset cursor when filters change
      params.delete("cursor");
      router.push(`/servers?${params.toString()}`);
    },
    [router, searchParams]
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
      <div className="sticky top-20 space-y-6">
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

        <FilterGroup title="Capabilities">
          {CAPABILITY_OPTIONS.map((option) => (
            <FilterOption
              key={option.value}
              label={option.label}
              checked={false}
              disabled
              onChange={() => {}}
            />
          ))}
        </FilterGroup>

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
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  bold?: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
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
