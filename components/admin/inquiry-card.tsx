"use client";

import { useState } from "react";
import type { PublicBranding } from "@/components/site/branding-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StringListEditor } from "@/components/admin/string-list-editor";

/**
 * Inquiry form settings (docs/11_DEPLOYMENT_ROADMAP.MD — dashboard settings).
 * The budget (price) ranges, timeline options and the phone-required toggle
 * shown on the public contact form are edited here and saved to the settings
 * table. Visitors see the new options immediately — no redeploy.
 */
export function InquiryCard({ initial }: { initial: PublicBranding }) {
  const [budgetOptions, setBudgetOptions] = useState<string[]>(
    initial.budgetOptions?.length ? [...initial.budgetOptions] : [""],
  );
  const [timelineOptions, setTimelineOptions] = useState<string[]>(
    initial.timelineOptions?.length ? [...initial.timelineOptions] : [""],
  );
  const [phoneRequired, setPhoneRequired] = useState<boolean>(initial.phoneRequired === true);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (status === "saving") return;
    setStatus("saving");
    setError(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          budgetOptions,
          timelineOptions,
          phoneRequired,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        settings?: PublicBranding;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "Could not save inquiry settings.");
      if (data.settings) {
        setBudgetOptions(
          data.settings.budgetOptions?.length ? [...data.settings.budgetOptions] : [""],
        );
        setTimelineOptions(
          data.settings.timelineOptions?.length ? [...data.settings.timelineOptions] : [""],
        );
        setPhoneRequired(data.settings.phoneRequired === true);
      }
      setStatus("saved");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save inquiry settings.");
      setStatus("error");
    }
  }

  return (
    <Card hover={false} className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Inquiry form</h2>
        <p className="mt-1 text-sm text-muted">
          The budget (price) ranges, timeline options and phone requirement on the contact form.
          Changes appear on the site immediately — no code changes or redeploy needed.
        </p>
      </div>

      <form onSubmit={save} className="flex flex-col gap-5">
        <StringListEditor
          label="Budget options (prices)"
          values={budgetOptions}
          onChange={(next) => {
            // Keep at least one row — the API requires a non-empty list.
            setBudgetOptions(next.length > 0 ? next : [""]);
            setStatus("idle");
          }}
          placeholder="e.g. $1,000 – $5,000"
          hint="The price ranges visitors pick from. Update these whenever your pricing changes."
        />

        <StringListEditor
          label="Timeline options"
          values={timelineOptions}
          onChange={(next) => {
            setTimelineOptions(next.length > 0 ? next : [""]);
            setStatus("idle");
          }}
          placeholder="e.g. 1 – 3 months"
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-white/25">
          <input
            type="checkbox"
            checked={phoneRequired}
            onChange={(event) => {
              setPhoneRequired(event.target.checked);
              setStatus("idle");
            }}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground/90">
              Require a phone number
            </span>
            <span className="text-xs text-muted">
              When on, visitors must enter a phone number before submitting the inquiry.
            </span>
          </span>
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save inquiry settings"}
          </Button>
          {status === "saved" && (
            <span className="text-sm text-emerald-400">Saved — live on the site.</span>
          )}
        </div>
      </form>
    </Card>
  );
}
