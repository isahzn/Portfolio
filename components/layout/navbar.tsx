"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { PageContainer } from "@/components/layout/page-container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/experience", label: "Experience" },
  { href: "/demos", label: "Demos" },
  { href: "/projects", label: "Projects" },
];

/**
 * Sticky site navigation with correct tab names, always-online dot,
 * mobile hamburger menu with full-screen overlay.
 */
export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border-soft bg-background/70 backdrop-blur-xl">
        <PageContainer className="flex h-[72px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
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

          {/* Mobile CTA */}
          <div className="flex items-center gap-3 md:hidden">
            <Button size="sm" href="/contact" data-track-click="contact">
              Start a Project
            </Button>
            <button
              className={cn("nav-toggle", mobileOpen && "open")}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </PageContainer>
      </header>

      {/* Mobile full-screen menu */}
      <div className={cn("mobile-menu", mobileOpen && "open")}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              pathname === link.href ? "text-primary" : "text-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
        <Link
          href="/contact"
          onClick={() => setMobileOpen(false)}
          className="mt-4"
        >
          <Button size="lg" data-track-click="contact">
            Start a Project
          </Button>
        </Link>
      </div>
    </>
  );
}
