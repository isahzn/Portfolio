"use client";

import { useEffect, useState } from "react";
import type { PublicBranding } from "@/components/site/branding-provider";
import { adminFetch, handleLoadError } from "@/lib/admin-api";
import { BrandingCard } from "@/components/admin/branding-card";
import { InquiryCard } from "@/components/admin/inquiry-card";
import { Button } from "@/components/ui/button";

/** Settings section — branding, logo and contact details shown on the site. */
export function SettingsSection() {
  const [branding, setBranding] = useState<PublicBranding | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    adminFetch<{ settings: PublicBranding }>("/api/admin/settings")
      .then((data) => {
        setBranding(data.settings);
        setError(null);
      })
      .catch((loadError) => handleLoadError(loadError, setError));
  }

  useEffect(() => {
    let cancelled = false;
    adminFetch<{ settings: PublicBranding }>("/api/admin/settings")
      .then((data) => {
        if (!cancelled) {
          setBranding(data.settings);
          setError(null);
        }
      })
      .catch((loadError) => {
        if (!cancelled) handleLoadError(loadError, setError);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
        <span>{error}</span>
        <Button variant="outline" size="sm" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  if (branding === null) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl border border-white/10">
        <span className="text-sm text-muted">Loading…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BrandingCard initial={branding} />
      <InquiryCard initial={branding} />
    </div>
  );
}
