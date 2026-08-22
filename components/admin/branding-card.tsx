"use client";

import { useState } from "react";
import type { PublicBranding } from "@/components/site/branding-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IconPlus, IconTrash } from "@/components/ui/icons";
import { ImageUpload } from "@/components/admin/image-upload";

type FormBranding = {
  logo: string;
  email: string;
  phone: string;
  linkedin: string;
  booking: string;
  whatsapp: string;
  socials: string[];
};

/**
 * Branding & Contact settings (docs/11_DEPLOYMENT_ROADMAP.MD — dashboard
 * settings). Everything shown on the public site — logo, email, phone,
 * LinkedIn, booking link, WhatsApp and socials — is edited here and saved to
 * the settings table. Changes appear on the site immediately (client-side
 * branding provider), no redeploy.
 */
export function BrandingCard({ initial }: { initial: PublicBranding }) {
  const [form, setForm] = useState<FormBranding>({
    logo: initial.logo || "",
    email: initial.email || "",
    phone: initial.phone || "",
    linkedin: initial.linkedin || "",
    booking: initial.booking || "",
    whatsapp: initial.whatsapp || "",
    socials: initial.socials?.length ? [...initial.socials] : [""],
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof Omit<FormBranding, "socials">) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setStatus("idle");
  };

  const updateSocial = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      socials: prev.socials.map((item, i) => (i === index ? value : item)),
    }));
    setStatus("idle");
  };

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
          logo: form.logo,
          email: form.email,
          phone: form.phone,
          linkedin: form.linkedin,
          booking: form.booking,
          whatsapp: form.whatsapp,
          socials: form.socials,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        settings?: PublicBranding;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "Could not save settings.");
      const saved = data.settings;
      if (saved) {
        setForm({
          logo: saved.logo || "",
          email: saved.email || "",
          phone: saved.phone || "",
          linkedin: saved.linkedin || "",
          booking: saved.booking || "",
          whatsapp: saved.whatsapp || "",
          socials: saved.socials?.length ? [...saved.socials] : [""],
        });
      }
      setStatus("saved");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save settings.");
      setStatus("error");
    }
  }

  return (
    <Card hover={false} className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Branding & Contact</h2>
        <p className="mt-1 text-sm text-muted">
          Logo and contact details shown in the navbar, footer and contact page. Changes appear on
          the site immediately — no code changes or redeploy needed.
        </p>
      </div>

      <form onSubmit={save} className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <ImageUpload
            value={form.logo}
            onChange={update("logo")}
            label="Logo"
            aspectClass="aspect-square"
            hint="Used in the navbar and footer. Leave empty to keep the current logo."
          />
          <div className="flex flex-col gap-4">
            <Input
              name="email"
              label="Business email"
              type="email"
              placeholder="hello@floza.com"
              value={form.email}
              onChange={(event) => update("email")(event.target.value)}
            />
            <Input
              name="phone"
              label="Phone number (optional)"
              placeholder="+1 555 000 0000"
              value={form.phone}
              onChange={(event) => update("phone")(event.target.value)}
            />
            <Input
              name="linkedin"
              label="LinkedIn URL"
              placeholder="https://www.linkedin.com/company/floza"
              value={form.linkedin}
              onChange={(event) => update("linkedin")(event.target.value)}
            />
            <Input
              name="booking"
              label="Booking link (optional)"
              placeholder="https://cal.com/…"
              value={form.booking}
              onChange={(event) => update("booking")(event.target.value)}
            />
          </div>
        </div>

        <Input
          name="whatsapp"
          label="WhatsApp number"
          hint="Country code + number, e.g. 212600000000 (or a full wa.me link). Empty hides it."
          placeholder="e.g. 212600000000"
          value={form.whatsapp}
          onChange={(event) => update("whatsapp")(event.target.value)}
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground/80">Social links (optional)</span>
          {form.socials.map((social, index) => (
            <div key={index} className="flex items-start gap-2">
              <Input
                name={`social-${index}`}
                placeholder="https://instagram.com/floza"
                value={social}
                onChange={(event) => updateSocial(index, event.target.value)}
              />
              <button
                type="button"
                aria-label="Remove social link"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    socials: prev.socials.filter((_, i) => i !== index),
                  }));
                  setStatus("idle");
                }}
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-muted transition-colors hover:border-red-400/40 hover:text-red-300"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              setForm((prev) => ({ ...prev, socials: [...prev.socials, ""] }));
              setStatus("idle");
            }}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-sm text-muted transition-colors hover:border-white/25 hover:text-foreground"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Add social link
          </button>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={status === "saving"}>
            {status === "saving" ? "Saving…" : "Save settings"}
          </Button>
          {status === "saved" && <span className="text-sm text-emerald-400">Saved — live on the site.</span>}
        </div>
      </form>
    </Card>
  );
}
