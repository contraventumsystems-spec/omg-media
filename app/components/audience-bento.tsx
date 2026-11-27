"use client";

import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { BentoCard, FLUX_BARS } from "@/app/components/flow-bento";
import { PopText } from "@/app/components/services-story";
import { fill } from "@/app/i18n/config";
import { useDict } from "@/app/i18n/locale-provider";
import { bentoEntrance, bentoHeadingPop } from "@/app/lib/bento-motion";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * "Pentru cine": who the agency works for, as the simplest bento. It is the
 * first section after the 3D beats, so a visitor recognises their business
 * before the steps and the charts.
 * The text is the point, so the cards carry only a number, a title and the copy.
 *
 * Desktop: four columns, two rows. Tablet: two columns. Phone: one column of
 * compact cards, the index beside a title that may wrap, and two lines of
 * copy, with a "+" that unfolds the rest, so four or five domains fit on one
 * screen. The eighth card is the open door, with the contact action.
 *
 * Same heading pop and card entrance as the other bentos (app/lib/bento-motion.ts).
 */

/* Titles and copy are in the dictionary (home.audience.domains), in this order. */
type Domain = { title: string; body: string; accent: string };

const DOMAINS: Pick<Domain, "accent">[] = [
  { accent: "var(--flux-yellow)" },
  { accent: "var(--flux-cyan)" },
  { accent: "var(--flux-green)" },
  { accent: "var(--flux-magenta)" },
  { accent: "var(--flux-violet)" },
  { accent: "var(--flux-red)" },
  { accent: "var(--flux-cyan)" },
];

/** Mono index, sat beside the card title. */
function CardNumber({ value }: { value: number }) {
  return (
    <span aria-hidden="true" className="type-index shrink-0 text-dim">
      {String(value).padStart(2, "0")}
    </span>
  );
}

function DomainCard({ domain, index }: { domain: Domain; index: number }) {
  const [open, setOpen] = useState(false);
  const t = useDict().home.audience;
  const bodyId = `domeniu-${index}`;
  return (
    <BentoCard accent={domain.accent} className="gap-0 [--card-spacing:--spacing(4)] md:[--card-spacing:--spacing(6)]">
      <CardContent className="flex h-full flex-col gap-2 md:gap-4">
        <div className="flex items-start gap-3">
          <CardNumber value={index + 1} />
          {/* Dense title: it may wrap beside the number. */}
          <h3 className="type-dense min-w-0 flex-1 text-eggshell">
            {domain.title}
          </h3>
          {/* Phones: the rest of the copy unfolds here. */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={bodyId}
            aria-label={fill(open ? t.collapse : t.expand, { title: domain.title })}
            className="type-button grid size-8 shrink-0 place-items-center rounded-full border-2 border-eggshell/15 text-eggshell md:hidden"
          >
            <span aria-hidden="true" className={cn("motion-safe:transition-transform motion-safe:duration-200", open && "rotate-45")}>
              +
            </span>
          </button>
        </div>
        <p
          id={bodyId}
          className={cn(
            "type-body text-platinum md:line-clamp-none",
            !open && "line-clamp-2",
          )}
        >
          {domain.body}
        </p>
      </CardContent>
    </BentoCard>
  );
}

export function AudienceBento() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;
      bentoHeadingPop(root.current);
      bentoEntrance(root.current);
    },
    { scope: root },
  );

  const { home, common } = useDict();
  const t = home.audience;
  const lead = t.heading.lead.split(" ");
  const payoff = t.heading.payoff.split(" ");
  const domains = DOMAINS.map((domain, index) => ({ ...domain, ...t.domains[index] }));

  /* overflow-hidden, not clip: the phone swing-in parks cards off to the side. */
  return (
    <section
      id="pentru-cine"
      className="scroll-mt-28 overflow-hidden bg-background px-4 py-24 sm:px-5 md:scroll-mt-24 md:px-10 md:py-32"
    >
      <div ref={root} className="mx-auto w-full max-w-6xl">
        <header className="mx-auto max-w-4xl text-center">
          {/* 8px from the index to the heading, 16px to the lead. */}
          <p data-bento-lead className="type-index text-dim">
            {t.index}
          </p>
          <h2
            data-bento-heading
            className="type-h2 mt-2 text-balance text-eggshell"
          >
            {lead.map((word, index) => (
              <span key={`${word}-${index}`}>
                <PopText text={word} />{" "}
              </span>
            ))}
            <span className="relative inline-block whitespace-nowrap">
              {payoff.map((word, index) => (
                <span key={`${word}-${index}`}>
                  <PopText text={word} />
                  {index < payoff.length - 1 ? " " : null}
                </span>
              ))}
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
          </h2>
          <p
            data-bento-lead
            className="type-lead mx-auto mt-4 text-platinum"
          >
            {t.lead}
          </p>
        </header>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 md:mt-8 md:gap-4 lg:grid-cols-4">
          {domains.map((domain, index) => (
            <li key={index} className="grid">
              <DomainCard domain={domain} index={index} />
            </li>
          ))}

          {/* 08: the open door. */}
          <li className="grid">
            <BentoCard accent="var(--eggshell)" className="gap-0 bg-[#241c15] [--card-spacing:--spacing(4)] md:[--card-spacing:--spacing(6)]">
              <CardContent className="flex h-full flex-col gap-3 md:gap-4">
                <div className="flex items-start gap-3">
                  <CardNumber value={8} />
                  <h3 className="type-dense min-w-0 flex-1 text-eggshell">
                    {t.other.title}
                  </h3>
                </div>
                <p className="type-body text-platinum">{t.other.body}</p>
                <a
                  href="#contact"
                  className="type-button mt-auto inline-flex h-11 w-full items-center justify-center rounded-full bg-eggshell px-5 text-background shadow-[4px_4px_0_var(--flux-yellow)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  {common.header.cta}
                </a>
              </CardContent>
            </BentoCard>
          </li>
        </ul>
      </div>
    </section>
  );
}
