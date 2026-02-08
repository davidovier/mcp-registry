"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { updateEmail, updateProfile } from "./actions";

interface ProfileFormProps {
  initialDisplayName: string | null;
  initialEmail: string;
}

export function ProfileForm({
  initialDisplayName,
  initialEmail,
}: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName ?? "");
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const messages: string[] = [];

    // Update display name if changed
    if (displayName !== (initialDisplayName ?? "")) {
      const result = await updateProfile(displayName);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
        setIsLoading(false);
        return;
      }
      messages.push("Display name updated.");
    }

    // Update email if changed
    if (email !== initialEmail) {
      const result = await updateEmail(email);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
        setIsLoading(false);
        return;
      }
      messages.push("Confirmation email sent to your new address.");
    }

    if (messages.length > 0) {
      setMessage({ type: "success", text: messages.join(" ") });
    } else {
      setMessage({ type: "success", text: "No changes to save." });
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name"
        disabled={isLoading}
      />

      <Input
        type="email"
        label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        disabled={isLoading}
        hint="Changing your email will require confirmation."
      />

      {message && (
        <div
          className={`rounded-md border p-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <Button type="submit" loading={isLoading}>
        Save Changes
      </Button>
    </form>
  );
}
