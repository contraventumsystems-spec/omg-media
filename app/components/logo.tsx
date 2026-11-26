import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The OMG Media mark. Interim artwork: a raster on the page's own ground
 * (#15110d), so it sits seamlessly on the header and the footer. Swap
 * public/brand/omg-logo.webp for the final file (keep the 804x346 ratio, or
 * update the size below). Size it with a height class; the width follows.
 */
export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/brand/omg-logo.webp"
      alt="OMG Media"
      width={804}
      height={346}
      priority={priority}
      sizes="(min-width: 768px) 420px, 80vw"
      className={cn("h-14 w-auto select-none", className)}
      draggable={false}
    />
  );
}
