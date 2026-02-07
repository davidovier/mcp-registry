"use client";

import { useState, useCallback, KeyboardEvent } from "react";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  maxTagLength?: number;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Normalize a tag: lowercase, trim whitespace
 */
function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim();
}

/**
 * Check if a tag is valid (non-empty after normalization)
 */
function isValidTag(tag: string): boolean {
  return normalizeTag(tag).length > 0;
}

export function TagInput({
  value,
  onChange,
  maxTags = 10,
  maxTagLength = 50,
  label,
  hint,
  error,
  disabled,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = useCallback(
    (raw: string) => {
      const tag = normalizeTag(raw);
      if (!tag || tag.length > maxTagLength) return;
      if (value.includes(tag)) return; // Already exists (dedupe)
      if (value.length >= maxTags) return;

      onChange([...value, tag]);
      setInputValue("");
    },
    [value, onChange, maxTags, maxTagLength]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(value.filter((t) => t !== tagToRemove));
    },
    [value, onChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove last tag when backspace on empty input
      removeTag(value[value.length - 1]);
    }
  };

  const handleBlur = () => {
    // Add any pending tag when input loses focus
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    // Split by comma and add each tag
    const tags = pastedText.split(",").filter(isValidTag);
    const normalizedTags = tags.map(normalizeTag);

    // Add tags that don't already exist, up to max
    const newTags = normalizedTags.filter(
      (t) => !value.includes(t) && t.length <= maxTagLength
    );
    const tagsToAdd = newTags.slice(0, maxTags - value.length);

    if (tagsToAdd.length > 0) {
      onChange([...value, ...tagsToAdd]);
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-body-sm font-medium text-content-primary">
          {label}
        </label>
      )}

      <div
        className={cn(
          "flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-3 py-2 transition-colors duration-150 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500",
          error &&
            "border-red-500 focus-within:border-red-500 focus-within:ring-red-500",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {value.map((tag) => (
          <Badge
            key={tag}
            size="sm"
            variant="default"
            removable
            onRemove={() => removeTag(tag)}
          >
            {tag}
          </Badge>
        ))}

        {value.length < maxTags && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onPaste={handlePaste}
            disabled={disabled}
            placeholder={value.length === 0 ? "git, api, database" : ""}
            className="min-w-[100px] flex-1 bg-transparent text-body-sm text-content-primary outline-none placeholder:text-content-tertiary disabled:cursor-not-allowed"
          />
        )}
      </div>

      {/* Hint and count */}
      <div className="flex items-center justify-between">
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
        <span
          className={cn(
            "ml-auto text-caption",
            value.length >= maxTags ? "text-amber-500" : "text-content-tertiary"
          )}
        >
          {value.length}/{maxTags}
        </span>
      </div>
    </div>
  );
}

// Export normalization utilities for testing
export { normalizeTag, isValidTag };
