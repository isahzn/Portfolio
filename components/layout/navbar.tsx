"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { PageContainer } from "@/components/layout/page-container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/demos", label: "Try It Out" },
  { href: "/projects", label: "Case Studies" },
  { href: "/services", label: "Services" },
  { href: "/experience", label: "Past Projects" },
];

/**
 * Sticky site navigation (docs/04_COMPONENT_LIBARY.MD, floza-redesign.html):
 * 72px blurred bar with a hairline bottom border, mono logo left, links with
 * an accent underline on the active page, and contact + CTA buttons right.
 *
 * On mobile the links render as a horizontal tab bar below the logo row
 * (scrollable, no hamburger) so every page stays one tap away.
 */
export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border-soft bg-background/80 backdrop-blur-lg">
      <PageContainer className="flex h-[72px] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo />
          {/* Always Online — pulsing status dot next to the logo (24/7 brief). */}
          <span className="hidden items-center gap-1.5 border-l border-border-soft pl-3 sm:flex">
            <span className="live-dot" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-online">
              Always Online
            </span>
          </span>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-1 text-sm transition-colors",
                  active ? "text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                {link.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-0.5 h-px bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button variant="ghost" size="sm" href="/contact" data-track-click="contact">
            Contact
          </Button>
          <Button size="sm" href="/contact" data-track-click="contact">
            Start a Project
          </Button>
        </div>

        {/* Mobile CTA (tabs live below) */}
        <Button size="sm" href="/contact" data-track-click="contact" className="md:hidden">
          Start a Project
        </Button>
      </PageContainer>

      {/* Mobile tab bar — every link visible, scrolls horizontally if needed */}
      <nav className="border-t border-border-soft md:hidden" aria-label="Main">
        <PageContainer className="flex items-center gap-1.5 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-sm border px-3 py-1.5 text-[13px] transition-colors",
                  active
                    ? "border-border bg-surface text-foreground"
                    : "border-transparent text-muted hover:bg-surface hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </PageContainer>
      </nav>
    </header>
  );
}
