"use client";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { FLUX_BARS } from "@/app/components/flow-bento";
import { PopText } from "@/app/components/services-story";
import { bentoHeadingPop } from "@/app/lib/bento-motion";

/**
 * The opening of an inner page: the page's name, its headline popping in like
 * the homepage headings, one line on what is on the page, and a row of jump
 * links to its sections, so a reader who knows what they want skips the
 * scroll. `id="hero"` lets the scroll helper and the WhatsApp button find
 * the top of the page.
 */
export function PageIntro({
  index,
  lead,
  payoff,
  text,
  jumps,
}: {
  /** Small label over the headline: the page's name. */
  index: string;
  /** Headline words in the wide display face. */
  lead: string;
  /** The last words, in the serif italic, with the bar stroke under them. */
  payoff: string;
  text: string;
  jumps: { href: string; label: string }[];
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (root.current) bentoHeadingPop(root.current, "top bottom");
    },
    { scope: root },
  );

  return (
    <section ref={root} id="hero" className="relative overflow-x-clip px-5 pt-32 pb-14 md:px-10 md:pt-40 md:pb-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex h-1">
        {FLUX_BARS.map((color) => (
          <span key={color} className={`h-full flex-1 ${color}`} />
        ))}
      </div>
      <header className="mx-auto max-w-5xl text-center">
        <p data-bento-lead className="type-index text-dim">
          {index}
        </p>
        <h1 data-bento-heading className="type-h2 mt-3 text-balance text-eggshell">
          {lead.split(" ").map((word, position) => (
            <span key={`${word}-${position}`}>
              <PopText text={word} />{" "}
            </span>
          ))}
          <span className="relative inline-block whitespace-nowrap">
            <span className="font-serif font-semibold">
              <PopText text={payoff} stop="text-flux-yellow" />
            </span>
            <span
              data-bento-bars
              aria-hidden="true"
              className="absolute inset-x-0 -bottom-[0.12em] flex h-[0.11em] origin-left"
            >
              {FLUX_BARS.map((color) => (
                <span key={color} className={`h-full flex-1 ${color}`} />
              ))}
            </span>
          </span>
        </h1>
        <p data-bento-lead className="type-lead mx-auto mt-5 text-platinum">
          {text}
        </p>
        <nav data-bento-lead aria-label="Pe această pagină" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-2">
            {jumps.map((jump, position) => (
              <li key={jump.href}>
                <a
                  href={jump.href}
                  className="type-nav inline-flex h-11 items-center gap-2 rounded-full border border-eggshell/15 px-4 text-platinum motion-safe:transition-colors hover:border-eggshell/40 hover:text-eggshell"
                >
                  <span className="type-index text-dim">{String(position + 1).padStart(2, "0")}</span>
                  {jump.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </section>
  );
}
