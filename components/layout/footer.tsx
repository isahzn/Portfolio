import Link from "next/link";
import services from "@/data/services.json";
import { Logo } from "@/components/layout/logo";
import { PageContainer } from "@/components/layout/page-container";
import { FooterContact } from "@/components/site/footer-contact";

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/experience", label: "Experience" },
  { href: "/demos", label: "Demos" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

/**
 * Site footer (docs/04_COMPONENT_LIBARY.MD, floza-redesign.html): brand column,
 * Explore / Services / Contact link columns with mono headings, and a mono
 * bottom bar.
 */
export function Footer() {
  return (
    <footer className="border-t border-border-soft">
      <PageContainer className="pb-10 pt-16">
        <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Floza builds AI-powered automations, websites, and software systems that help
              businesses work faster.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.06em] text-faint">
              Explore
            </h3>
            <ul className="flex flex-col gap-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.06em] text-faint">
              Services
            </h3>
            <ul className="flex flex-col gap-3">
              {services.map((service) => (
                <li key={service.title}>
                  <Link href="/services" className="text-sm text-muted transition-colors hover:text-foreground">
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.06em] text-faint">
              Contact
            </h3>
            {/* Email, phone, WhatsApp, LinkedIn and socials — set in /admin → Settings. */}
            <FooterContact />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-border-soft pt-7 font-mono text-xs text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Floza. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <span className="live-dot" aria-hidden="true" />
            Manual work in. 24/7 systems out.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
