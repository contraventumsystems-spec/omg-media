"use client";

import { useEffect, useState } from "react";
import { WHATSAPP_GREEN, WhatsAppIcon } from "@/app/components/whatsapp-icon";
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
      className="whatsapp-fab fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid size-14 place-items-center rounded-full text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] outline-none focus-visible:ring-4 focus-visible:ring-eggshell/70 md:hidden"
      style={{ background: WHATSAPP_GREEN }}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
