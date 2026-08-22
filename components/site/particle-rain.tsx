"use client";

import { useEffect } from "react";

/**
 * Ambient particle rain — three layers of falling drops (thin background,
 * glowing accent, green online) for depth and motion.
 */
export function ParticleRain() {
  useEffect(() => {
    const container = document.querySelector(".particle-rain");
    if (!container) return;

    // Thin background drops
    for (let i = 0; i < 50; i++) {
      const drop = document.createElement("div");
      drop.className = "rain-drop";
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.height = `${12 + Math.random() * 24}px`;
      drop.style.animationDuration = `${2.5 + Math.random() * 3.5}s`;
      drop.style.animationDelay = `${Math.random() * 8}s`;
      drop.style.opacity = String(0.1 + Math.random() * 0.2);
      container.appendChild(drop);
    }

    // Glowing accent drops
    for (let i = 0; i < 18; i++) {
      const drop = document.createElement("div");
      drop.className = "rain-drop glow";
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.height = `${30 + Math.random() * 50}px`;
      drop.style.animationDuration = `${4 + Math.random() * 5}s`;
      drop.style.animationDelay = `${Math.random() * 10}s`;
      drop.style.opacity = String(0.3 + Math.random() * 0.4);
      container.appendChild(drop);
    }

    // Green "online" drops
    for (let i = 0; i < 8; i++) {
      const drop = document.createElement("div");
      drop.className = "rain-drop green-drop";
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.height = `${20 + Math.random() * 35}px`;
      drop.style.animationDuration = `${5 + Math.random() * 6}s`;
      drop.style.animationDelay = `${Math.random() * 12}s`;
      drop.style.opacity = String(0.2 + Math.random() * 0.3);
      container.appendChild(drop);
    }
  }, []);

  return <div className="particle-rain" aria-hidden="true" />;
}
