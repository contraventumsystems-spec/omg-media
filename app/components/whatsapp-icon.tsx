import { siWhatsapp } from "simple-icons";
import { cn } from "@/lib/utils";

/**
 * The official WhatsApp glyph, from Simple Icons (CC0 1.0, free to use).
 * It takes the text colour; size it with a size-* class.
 */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={cn("size-5 shrink-0", className)} fill="currentColor">
      <path d={siWhatsapp.path} />
    </svg>
  );
}

/** WhatsApp's own green, for the floating button. */
export const WHATSAPP_GREEN = `#${siWhatsapp.hex}`;
