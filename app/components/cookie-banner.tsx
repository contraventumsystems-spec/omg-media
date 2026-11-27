"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { localePath } from "@/app/i18n/config";
import { useDict, useLocale } from "@/app/i18n/locale-provider";
import { onConsentOpen, openConsent, saveChoice, useConsent, useHydrated } from "@/app/lib/consent";
import { cn } from "@/lib/utils";

const BARS = ["bg-flux-yellow", "bg-flux-cyan", "bg-flux-green", "bg-flux-magenta", "bg-flux-red", "bg-flux-violet"];

/**
 * The cookie bar: slim, at the bottom, in the teletext look of the site (ink
 * border, offset shadow, the six bars on top). It shows until the visitor
 * answers, and again from "Setări cookie" in the footer. Both answers are
 * one press; Refuz is as easy as Accept. It is a region, not a modal: the
 * page stays usable behind it.
 */
export function CookieBanner() {
  const hydrated = useHydrated();
  const choice = useConsent();
  const [reopened, setReopened] = useState(false);
  const accept = useRef<HTMLButtonElement>(null);
  const locale = useLocale();
  const t = useDict().common.cookie;

  useEffect(
    () =>
      onConsentOpen(() => {
        setReopened(true);
        window.setTimeout(() => accept.current?.focus(), 50);
      }),
    [],
  );

  if (!hydrated || (choice && !reopened)) return null;

  const answer = (value: "accepted" | "declined") => {
    saveChoice(value);
    setReopened(false);
  };

  return (
    <section
      role="region"
      aria-label={t.title}
      className="cookie-bar fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-3xl overflow-hidden rounded-2xl border-[3px] border-[#15110d] bg-card shadow-[5px_5px_0_var(--flux-yellow)] md:inset-x-6"
    >
      <div aria-hidden="true" className="flex h-1">
        {BARS.map((color) => (
          <span key={color} className={cn("h-full flex-1", color)} />
        ))}
      </div>
      <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-5 md:py-3.5">
        <p className="type-note flex-1 text-platinum">
          <span className="type-index mr-2 inline-flex items-center gap-1.5 text-eggshell">
            <span aria-hidden="true" className="flux-blink size-1.5 rounded-full bg-flux-red" />
            {t.title}
          </span>
          {t.text}{" "}
          <Link href={localePath(locale, "/politica-cookies")} className="text-eggshell underline decoration-eggshell/30 underline-offset-2 hover:decoration-eggshell">
            {t.details}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => answer("declined")}
            className="type-button h-10 flex-1 rounded-full border border-eggshell/25 px-5 text-eggshell outline-none hover:border-eggshell/60 focus-visible:ring-2 focus-visible:ring-eggshell/70 md:flex-none"
          >
            {t.decline}
          </button>
          <button
            ref={accept}
            type="button"
            onClick={() => answer("accepted")}
            className="type-button h-10 flex-1 rounded-full bg-eggshell px-5 text-background outline-none focus-visible:ring-2 focus-visible:ring-flux-cyan md:flex-none"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </section>
  );
}

/** "Setări cookie", for the footer: opens the bar again so the choice can change. */
export function CookieSettingsButton({ className }: { className?: string }) {
  const t = useDict().common.cookie;
  return (
    <button type="button" onClick={openConsent} className={className}>
      {t.settings}
    </button>
  );
}
