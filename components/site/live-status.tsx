"use client";

import { useEffect, useState } from "react";

/*
 * Live status counters (24/7 reliability system). Both are cosmetic and
 * client-side only — they tick up to make the site feel like the systems
 * it sells are running right now. No persistence, no database.
 */

const BASE_UPTIME_SECONDS = 47382 * 3600; // 47,382 hours

function formatUptime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toLocaleString("en-US")}h ${String(minutes).padStart(2, "0")}m ${String(
    seconds,
  ).padStart(2, "0")}s`;
}

/** Ticking uptime counter for the hero network-status panel. */
export function UptimeCounter() {
  const [seconds, setSeconds] = useState(BASE_UPTIME_SECONDS);

  useEffect(() => {
    const id = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <>{formatUptime(seconds)}</>;
}

const BASE_AUTOMATIONS = 1248;

/** Incrementing "automations processed" counter for the contact CTA. */
export function LiveCounter() {
  const [count, setCount] = useState(BASE_AUTOMATIONS);

  useEffect(() => {
    const id = setInterval(() => setCount((current) => current + 1), 3000);
    return () => clearInterval(id);
  }, []);

  return <>{count.toLocaleString("en-US")}</>;
}
