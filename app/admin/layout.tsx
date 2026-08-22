import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Private admin shell (docs/00_PROJECT_OVERVIEW.MD #11, docs/09_SECURITY_AND_PRIVACY.MD #8).
 * Minimal chrome — no marketing Navbar/Footer; pages themselves guard access.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <PageContainer className="flex h-14 items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-gradient text-lg font-bold tracking-tight">Floza</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
              Admin
            </span>
          </div>
          <Link
            href="/"
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            View site →
          </Link>
        </PageContainer>
      </header>
      <main className="flex flex-1 flex-col">
        <PageContainer className="flex-1 py-8 sm:py-10">{children}</PageContainer>
      </main>
    </>
  );
}
