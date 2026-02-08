"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { deleteAccount } from "./actions";

export function DeleteAccountSection() {
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (confirmation !== "DELETE") return;
    setIsLoading(true);
    setError(null);

    const result = await deleteAccount();
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
    // On success, the server action redirects to /
  }

  return (
    <div className="space-y-4">
      <p className="text-body-sm text-content-secondary">
        Permanently delete your account and all associated data. This action
        cannot be undone.
      </p>

      <Input
        label='Type "DELETE" to confirm'
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
        placeholder="DELETE"
        disabled={isLoading}
      />

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <Button
        variant="danger"
        onClick={handleDelete}
        loading={isLoading}
        disabled={confirmation !== "DELETE"}
      >
        Delete My Account
      </Button>
    </div>
  );
}
