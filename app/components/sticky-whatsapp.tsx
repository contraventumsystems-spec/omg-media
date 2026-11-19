"use client";

import { useEffect, useState } from "react";
import { whatsappHref } from "@/app/lib/site";

/**
 * Mobile-only icon. It appears once the hero has left the viewport,
 * in the bottom-right corner so the centered scroll helper can share the edge.
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
      aria-label="Scrie-ne pe WhatsApp"
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid size-12 place-items-center rounded-full bg-eggshell text-background md:hidden"
    >
      <WhatsAppMark />
    </a>
  );
}

/** A chat bubble and a handset, close enough to read as WhatsApp at this size. */
function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none">
      <path
        d="M12 4.1a7.4 7.4 0 0 0-6.4 11.1L4.7 19.8l4.7-.8A7.4 7.4 0 1 0 12 4.1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.05 9.15c.15.35.7 1.7.95 2.15.1.2.1.4-.05.6l-.4.45c-.1.15-.15.35 0 .55.4.7 1.25 1.55 2.15 1.9.25.1.45.05.6-.15l.4-.5c.15-.2.4-.2.6-.05.35.25.9.6 1.15.7.3.15.4.4.35.7-.1.55-.7 1-1.25 1.05-1.55.1-3.7-1.35-4.55-3.15-.7-1.5-.45-2.85.15-3.35.25-.2.55-.15.9.1Z"
        fill="currentColor"
      />
    </svg>
  );
}
