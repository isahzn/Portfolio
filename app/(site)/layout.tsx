import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { SiteBrandingProvider } from "@/components/site/branding-provider";
import { ParticleRain } from "@/components/site/particle-rain";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { CustomCursor } from "@/components/site/custom-cursor";
import { ScrollReveal } from "@/components/site/scroll-reveal";
import { siteJsonLd } from "@/lib/seo";

/**
 * Public site layout (route group app/(site)/).
 * Holds the marketing chrome (Navbar/Footer) so the admin dashboard under
 * /admin — outside this group — renders its own minimal shell instead.
 * The branding provider loads dashboard settings (logo, contact) client-side.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Ambient overlays — mesh blobs, grain, grid, particles */}
      <div aria-hidden="true" className="mesh-bg">
        <div className="mesh-blob" />
        <div className="mesh-blob" />
        <div className="mesh-blob" />
      </div>
      <div aria-hidden="true" className="grid-overlay" />
      <div aria-hidden="true" className="grain" />
      <ParticleRain />
      <ScrollProgress />
      <CustomCursor />
      <ScrollReveal />

      {/* Site-wide JSON-LD (Organization + WebSite) — public pages only,
          so /admin (noindex, login-protected) stays free of it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: siteJsonLd() }}
      />
      <SiteBrandingProvider>
        <Navbar />
        <main className="relative z-2 flex flex-1 flex-col">{children}</main>
        <Footer />
      </SiteBrandingProvider>
      {/* Anonymous engagement tracking — feeds /admin → Analytics. */}
      <AnalyticsTracker />
    </>
  );
}
