"use client";

import { useState, useTransition } from "react";

import { requestVerification } from "@/app/servers/[slug]/actions";

interface RequestVerificationButtonProps {
  serverId: string;
}

export function RequestVerificationButton({
  serverId,
}: RequestVerificationButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await requestVerification(serverId, notes || undefined);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setShowForm(false);
      }
    });
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-body-sm text-brand-700 dark:bg-brand-900/20 dark:text-brand-400">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Verification request submitted
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-body-sm text-content-secondary transition-colors hover:bg-surface-sunken"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
        Request verification
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="verification-notes"
          className="mb-1 block text-caption text-content-secondary"
        >
          Notes for reviewer (optional)
        </label>
        <textarea
          id="verification-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Explain why this server should be verified..."
          rows={2}
          disabled={isPending}
          className="w-full rounded-md border border-border bg-surface-primary px-3 py-2 text-body-sm text-content-primary placeholder:text-content-tertiary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
        />
      </div>

      {error && (
        <p className="text-caption text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-md bg-brand-700 px-3 py-2 text-body-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50 dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400"
        >
          {isPending ? "Submitting..." : "Submit request"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          disabled={isPending}
          className="rounded-md border border-border px-3 py-2 text-body-sm text-content-secondary hover:bg-surface-sunken disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
