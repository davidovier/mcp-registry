"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
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

interface MobileFiltersProps {
  className?: string;
}

export function MobileFilters({ className }: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const currentTransport = searchParams.get("transport") || "";
  const currentAuth = searchParams.get("auth") || "";
  const currentVerified = searchParams.get("verified") === "true";

  const activeCount = [
    currentTransport,
    currentAuth,
    currentVerified ? "true" : "",
  ].filter(Boolean).length;

  const openSheet = useCallback(() => {
    setIsOpen(true);
    dialogRef.current?.showModal();
  }, []);

  const closeSheet = useCallback(() => {
    dialogRef.current?.close();
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => setIsOpen(false);
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("cursor");
      router.push(`/servers?${params.toString()}`);
      closeSheet();
    },
    [router, searchParams, closeSheet]
  );

  const handleRadioChange = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key);
      updateFilter(key, current === value ? null : value);
    },
    [searchParams, updateFilter]
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    router.push(`/servers?${params.toString()}`);
    closeSheet();
  }, [router, searchParams, closeSheet]);

  return (
    <div className={className}>
      <Button
        variant="secondary"
        size="sm"
        onClick={openSheet}
        icon={
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        }
      >
        Filters{activeCount > 0 ? ` (${activeCount})` : ""}
      </Button>

      <dialog
        ref={dialogRef}
        className={cn(
          "fixed inset-0 z-50 m-0 h-full w-full max-w-none bg-transparent p-0 backdrop:bg-black/50",
          "open:flex open:items-end open:justify-center"
        )}
        aria-label="Filter options"
      >
        <div
          className={cn(
            "w-full max-w-lg rounded-t-2xl bg-surface-secondary p-6 shadow-elevated",
            "max-h-[80vh] overflow-y-auto",
            isOpen ? "animate-slide-up" : ""
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-heading-md text-content-primary">Filters</h2>
            <button
              onClick={closeSheet}
              className="rounded-lg p-1.5 text-content-tertiary transition-colors hover:bg-surface-sunken hover:text-content-primary"
              aria-label="Close filters"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <MobileFilterGroup title="Transport">
              {TRANSPORT_OPTIONS.map((option) => (
                <MobileFilterOption
                  key={option.value}
                  label={option.label}
                  checked={currentTransport === option.value}
                  onChange={() => handleRadioChange("transport", option.value)}
                />
              ))}
            </MobileFilterGroup>

            <MobileFilterGroup title="Authentication">
              {AUTH_OPTIONS.map((option) => (
                <MobileFilterOption
                  key={option.value}
                  label={option.label}
                  checked={currentAuth === option.value}
                  onChange={() => handleRadioChange("auth", option.value)}
                />
              ))}
            </MobileFilterGroup>

            <div className="border-t border-border pt-4">
              <MobileFilterOption
                label="Verified only"
                checked={currentVerified}
                onChange={() =>
                  updateFilter("verified", currentVerified ? null : "true")
                }
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3 border-t border-border pt-4">
            <Button variant="secondary" onClick={clearAll} className="flex-1">
              Clear all
            </Button>
            <Button variant="primary" onClick={closeSheet} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

function MobileFilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-heading-sm text-content-primary">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function MobileFilterOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 rounded border-neutral-300 text-brand-600 focus:ring-brand-500 dark:border-neutral-600"
      />
      <span className="text-body-md text-content-primary">{label}</span>
    </label>
  );
}
