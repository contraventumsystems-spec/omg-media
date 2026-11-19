"use client";

import { useEffect, useState } from "react";
import { whatsappHref } from "@/app/lib/site";

/**
 * Mobile-only pill. It appears once the hero has left the viewport,
 * so the conversion link stays in reach without covering the first screen.
 */
export function StickyWhatsApp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      data-cta="sticky"
      className="type-button fixed inset-x-4 bottom-4 z-30 flex h-12 items-center justify-center rounded-full bg-eggshell text-background md:hidden"
    >
      Scrie-ne pe WhatsApp
    </a>
  );
}
