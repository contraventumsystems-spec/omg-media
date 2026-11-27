"use client";

import { Check, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { fill, htmlLang, type Locale, localeNames, localePath, locales, stripLocale } from "@/app/i18n/config";
import { useDict, useLocale } from "@/app/i18n/locale-provider";
import { cn } from "@/lib/utils";

/**
 * The same page in another language. Every language keeps the same slugs, so
 * /servicii, /en/servicii and /de/servicii are one page; the switch keeps the
 * reader where they are. Each option is a real link with hreflang (crawlers
 * follow it too) and loads a new document, so the 3D scene starts over in the
 * new language.
 */
function useTargets() {
  const pathname = usePathname();
  const path = stripLocale(pathname);
  return (locale: Locale) => localePath(locale, path);
}

/** The menu bar's version: the current code in a pill, the languages in a small panel under it. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const { common } = useDict();
  const href = useTargets();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={fill(common.language.current, { name: localeNames[locale].name })}
        onClick={() => setOpen((value) => !value)}
        className="type-index flex h-11 items-center gap-1.5 rounded-full border border-eggshell/20 px-3 text-eggshell outline-none hover:border-eggshell/50 focus-visible:ring-2 focus-visible:ring-eggshell/70"
      >
        <span aria-hidden="true" className="size-1.5 rounded-full bg-flux-yellow" />
        {localeNames[locale].short}
        <ChevronDown
          aria-hidden="true"
          className={cn("size-3.5 motion-safe:transition-transform", open ? "rotate-180" : "")}
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="helper-pop absolute top-full right-0 z-30 mt-2 w-48 rounded-xl border-[3px] border-[#15110d] bg-card p-1.5 shadow-[4px_4px_0_var(--flux-yellow)]"
        >
          <p className="type-index px-2.5 pt-1 pb-1.5 text-dim">{common.language.label}</p>
          <ul>
            {locales.map((item) => {
              const current = item === locale;
              return (
                <li key={item}>
                  <a
                    href={href(item)}
                    hrefLang={htmlLang[item]}
                    lang={htmlLang[item]}
                    aria-current={current ? "true" : undefined}
                    onClick={() => setOpen(false)}
                    className="group flex min-h-11 items-center gap-3 rounded-lg px-2.5 text-eggshell outline-none hover:bg-white/5 focus-visible:bg-white/5"
                  >
                    <span className={cn("type-index w-6 shrink-0", current ? "text-flux-yellow" : "text-dim")}>
                      {localeNames[item].short}
                    </span>
                    <span className="type-button flex-1">{localeNames[item].name}</span>
                    {current ? <Check aria-hidden="true" className="size-4 text-flux-yellow" /> : null}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** The phone menu's version: all five languages as one row of pills. */
export function LanguageRow() {
  const locale = useLocale();
  const { common } = useDict();
  const href = useTargets();
  return (
    <nav aria-label={common.language.label} className="flex items-center gap-2">
      <span className="type-index mr-1 text-dim">{common.language.label}</span>
      <ul className="flex flex-wrap gap-1.5">
        {locales.map((item) => {
          const current = item === locale;
          return (
            <li key={item}>
              <a
                href={href(item)}
                hrefLang={htmlLang[item]}
                lang={htmlLang[item]}
                aria-label={localeNames[item].name}
                aria-current={current ? "true" : undefined}
                className={cn(
                  "type-index grid h-10 min-w-11 place-items-center rounded-full border px-2.5 outline-none focus-visible:ring-2 focus-visible:ring-eggshell/70",
                  current
                    ? "border-flux-yellow bg-flux-yellow text-background"
                    : "border-eggshell/20 text-eggshell hover:border-eggshell/50",
                )}
              >
                {localeNames[item].short}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
