"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/** Admin login form (docs/02_USER_FLOWS.MD #13). */
export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!password || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Login failed. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <Card hover={false} className="p-6 sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin access</h1>
      <p className="mt-1 text-sm text-muted">
        Enter the admin password to view leads and conversations.
      </p>

      {configured ? (
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            type="password"
            name="password"
            label="Password"
            autoComplete="current-password"
            placeholder="••••••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error ?? undefined}
          />
          <Button type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      ) : (
        <p className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-200">
          Admin access is not configured. Set <code className="font-mono">ADMIN_SECRET</code> in
          your <code className="font-mono">.env</code> file and restart the server.
        </p>
      )}
    </Card>
  );
}
