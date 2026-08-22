"use client";

import { useEffect } from "react";

/**
 * Custom cursor — a glowing dot + ring that follows the mouse,
 * expands on hover over interactive elements. Disabled on mobile.
 */
export function CustomCursor() {
  useEffect(() => {
    if (window.innerWidth <= 768) return;

    const dot = document.querySelector(".cursor-dot") as HTMLElement | null;
    const ring = document.querySelector(".cursor-ring") as HTMLElement | null;
    if (!dot || !ring) return;

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    const onMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const animate = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      requestAnimationFrame(animate);
    };

    const onMouseEnter = () => ring.classList.add("hovering");
    const onMouseLeave = () => ring.classList.remove("hovering");

    document.addEventListener("mousemove", onMouseMove);
    requestAnimationFrame(animate);

    // Attach hover to interactive elements
    const hoverEls = document.querySelectorAll("a, button, [data-hover]");
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", onMouseEnter);
      el.addEventListener("mouseleave", onMouseLeave);
    });

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", onMouseEnter);
        el.removeEventListener("mouseleave", onMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true" />
    </>
  );
}
