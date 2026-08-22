"use client";

import { useEffect } from "react";

/**
 * Fixed scroll progress bar at the top of the page — shows how far
 * the user has scrolled with a gradient bar.
 */
export function ScrollProgress() {
  useEffect(() => {
    const bar = document.querySelector(".scroll-progress") as HTMLElement | null;
    if (!bar) return;

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = `${(window.scrollY / h) * 100}%`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div className="scroll-progress" aria-hidden="true" />;
}
