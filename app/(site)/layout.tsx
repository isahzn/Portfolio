import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { SiteBrandingProvider } from "@/components/site/branding-provider";
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
      {/* Site-wide JSON-LD (Organization + WebSite) — public pages only,
          so /admin (noindex, login-protected) stays free of it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: siteJsonLd() }}
      />
      <SiteBrandingProvider>
        <Navbar />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </SiteBrandingProvider>
      {/* Anonymous engagement tracking — feeds /admin → Analytics. */}
      <AnalyticsTracker />
    </>
  );
}
