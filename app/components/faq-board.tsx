"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState, type CSSProperties } from "react";
import { FLUX_BARS } from "@/app/components/flow-bento";
import { PopText } from "@/app/components/services-story";
import { bentoEntrance, bentoHeadingPop } from "@/app/lib/bento-motion";
import { fill } from "@/app/i18n/config";
import { useDict } from "@/app/i18n/locale-provider";
import { faqGroups, whatsappHref } from "@/app/lib/site";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

/**
 * "Întrebări": the questions, one card per service. The cards are a stack of
 * channels; pressing a card's + tunes it in.
 *
 * Opening a channel: the + squashes and turns into an x, the title glitches in
 * the MTV colour split, the seven bars sweep across the card like a channel cut,
 * the panel drops open and the questions hop in one by one. Only one channel
 * plays at a time, so the previous one closes as the new one opens.
 * Each question is its own small + that drops its answer open.
 *
 * Same heading pop and card entrance as the bentos (app/lib/bento-motion.ts).
 * Reduced motion: every move is instant, nothing is lost.
 */

/* The heading, "Întrebări înainte să începem.", is in the dictionary (home.faq.heading). */

const reduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The + drawn as two bars, so the turn into an x stays crisp at any size. */
function PlusMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" data-plus className={cn("relative block size-full", className)}>
      <span className="absolute top-1/2 left-1/2 h-[2.5px] w-[44%] -translate-1/2 rounded-full bg-current" />
      <span className="absolute top-1/2 left-1/2 h-[44%] w-[2.5px] -translate-1/2 rounded-full bg-current" />
    </span>
  );
}

export function FaqBoard() {
  const root = useRef<HTMLDivElement>(null);
  const { home, common } = useDict();
  const t = home.faq;
  const [open, setOpen] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      if (!root.current) return;
      bentoHeadingPop(root.current);
      bentoEntrance(root.current);
    },
    { scope: root },
  );

  /* The data-* hooks are unique on the page, so the handlers query the document, not the ref. */
  const q = (selector: string) => document.querySelector<HTMLElement>(selector);

  /* Close one channel: the panel folds up, the x turns back into a +. */
  const closeGroup = contextSafe((id: string) => {
    const panel = q(`[data-group-panel="${id}"]`);
    const plus = q(`[data-group="${id}"] [data-plus]`);
    const fast = reduced();
    gsap.to(panel, { height: 0, duration: fast ? 0 : 0.32, ease: "power2.in", overwrite: true });
    gsap.to(plus, { rotation: 0, duration: fast ? 0 : 0.4, ease: "back.out(2)", overwrite: true });
  });

  const openGroup = contextSafe((id: string) => {
    const card = q(`[data-group="${id}"]`);
    const panel = q(`[data-group-panel="${id}"]`);
    if (!card || !panel) return;
    const plus = card.querySelector("[data-plus]");
    const button = card.querySelector("[data-group-button]");
    const title = card.querySelector("[data-group-title]");
    const sweep = card.querySelectorAll("[data-sweep] > span");
    const rows = panel.querySelectorAll("[data-question]");

    if (reduced()) {
      gsap.set(panel, { height: "auto" });
      gsap.set(plus, { rotation: 135 });
      return;
    }

    gsap
      .timeline()
      /* The button squashes under the press, then springs back. */
      .fromTo(
        button,
        { scaleX: 1.25, scaleY: 0.75 },
        { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1.2, 0.35)" },
        0,
      )
      .to(plus, { rotation: 135, duration: 0.55, ease: "back.out(2.4)", overwrite: true }, 0)
      /* Colour split on the title, like a tape glitch, then it locks. */
      .fromTo(
        title,
        {
          x: -6,
          skewX: -10,
          textShadow: "4px 0 var(--flux-magenta), -4px 0 var(--flux-cyan)",
        },
        {
          x: 0,
          skewX: 0,
          textShadow: "0px 0 transparent, 0px 0 transparent",
          duration: 0.6,
          ease: "elastic.out(1, 0.4)",
        },
        0,
      )
      /* Channel cut: the bars sweep across the top, then drop away. */
      .fromTo(
        sweep,
        { scaleX: 0, transformOrigin: "0% 50%", autoAlpha: 1 },
        { scaleX: 1, duration: 0.32, ease: "power3.out", stagger: 0.03 },
        0,
      )
      .to(sweep, { scaleY: 0, transformOrigin: "50% 0%", duration: 0.3, stagger: 0.02, ease: "power2.in" }, 0.45)
      .to(panel, { height: "auto", duration: 0.5, ease: "power3.out", overwrite: true }, 0.08)
      /* The questions hop in, tilted alternately, like cels dropped on the desk. */
      .fromTo(
        rows,
        { autoAlpha: 0, y: 22, rotation: (index: number) => (index % 2 === 0 ? -3 : 3) },
        {
          autoAlpha: 1,
          y: 0,
          rotation: 0,
          duration: 0.6,
          ease: "back.out(2.2)",
          stagger: 0.055,
          clearProps: "transform",
        },
        0.2,
      );
  });

  const toggleGroup = (id: string) => {
    if (open === id) {
      closeGroup(id);
      setOpen(null);
      return;
    }
    if (open) closeGroup(open);
    if (answer) closeAnswer(answer);
    openGroup(id);
    setOpen(id);
    setAnswer(null);
  };

  const closeAnswer = contextSafe((key: string) => {
    const fast = reduced();
    gsap.to(q(`[data-answer="${key}"]`), { height: 0, duration: fast ? 0 : 0.25, ease: "power2.in", overwrite: true });
    gsap.to(q(`[data-question="${key}"] [data-plus]`), { rotation: 0, duration: fast ? 0 : 0.35, ease: "back.out(2)" });
    gsap.to(q(`[data-question="${key}"] [data-tick]`), { scaleY: 0, duration: fast ? 0 : 0.2 });
  });

  const openAnswer = contextSafe((key: string) => {
    const fast = reduced();
    const body = q(`[data-answer="${key}"]`);
    gsap.to(body, { height: "auto", duration: fast ? 0 : 0.42, ease: "power3.out", overwrite: true });
    gsap.fromTo(
      body?.firstElementChild ?? null,
      { autoAlpha: 0, y: fast ? 0 : -8 },
      { autoAlpha: 1, y: 0, duration: fast ? 0 : 0.4, ease: "power2.out", delay: fast ? 0 : 0.08 },
    );
    gsap.to(q(`[data-question="${key}"] [data-plus]`), { rotation: 135, duration: fast ? 0 : 0.5, ease: "back.out(2.4)" });
    gsap.fromTo(
      q(`[data-question="${key}"] [data-tick]`),
      { scaleY: 0 },
      { scaleY: 1, duration: fast ? 0 : 0.5, ease: "elastic.out(1, 0.45)" },
    );
  });

  const toggleAnswer = (key: string) => {
    if (answer === key) {
      closeAnswer(key);
      setAnswer(null);
      return;
    }
    if (answer) closeAnswer(answer);
    openAnswer(key);
    setAnswer(key);
  };

  const lead = t.heading.lead.split(" ");
  const payoff = t.heading.payoff.split(" ");
  const groups = faqGroups.map((group) => ({ ...group, ...t.groups[group.id] }));

  return (
    <section
      id="intrebari"
      className="scroll-mt-28 overflow-hidden bg-background px-4 py-24 sm:px-5 md:scroll-mt-24 md:px-10 md:py-32"
    >
      <div ref={root} className="mx-auto w-full max-w-5xl">
        <header className="mx-auto max-w-3xl text-center">
          <p data-bento-lead className="type-index text-dim">
            {t.index}
          </p>
          <h2 data-bento-heading className="type-h2 mt-2 text-balance text-eggshell">
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
          <p data-bento-lead className="type-lead mx-auto mt-4 text-platinum">
            {t.lead}
          </p>
        </header>

        <ul className="mt-10 grid gap-3 md:mt-12 md:gap-4">
          {groups.map((group, groupIndex) => {
            const isOpen = open === group.id;
            return (
              <li
                key={group.id}
                data-bento-card
                data-group={group.id}
                style={{ "--accent": group.accent } as CSSProperties}
                className="bento-card faq-group overflow-hidden rounded-3xl"
              >
                {/* Channel cut: seven bars that sweep across the top when the card opens. */}
                <span data-sweep aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-2">
                  {FLUX_BARS.map((color) => (
                    <span key={color} className={cn("h-full flex-1 scale-x-0", color)} />
                  ))}
                </span>

                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${group.id}`}
                    onClick={() => toggleGroup(group.id)}
                    className="group/row flex w-full cursor-pointer items-center gap-4 p-5 text-left sm:p-6 md:gap-6 md:px-8"
                  >
                    <span
                      className="type-index shrink-0 tabular-nums"
                      style={{ color: group.accent }}
                    >
                      {String(groupIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span data-group-title className="type-title block text-balance text-eggshell">
                        {group.label}
                      </span>
                      <span className="type-note mt-1 block text-dim">
                        {group.scope} · {fill(t.count, { n: group.items.length })}
                      </span>
                    </span>
                    <span
                      data-group-button
                      className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-[#15110d] bg-eggshell text-background shadow-[3px_3px_0_var(--accent)] motion-safe:transition-shadow motion-safe:duration-200 group-hover/row:shadow-[5px_5px_0_var(--accent)] md:size-12"
                    >
                      <PlusMark />
                    </span>
                  </button>
                </h3>

                <div
                  id={`faq-${group.id}`}
                  data-group-panel={group.id}
                  role="region"
                  aria-label={group.label}
                  inert={!isOpen}
                  className="h-0 overflow-hidden"
                >
                  <ul className="grid gap-x-6 border-t border-eggshell/10 px-5 pt-2 pb-5 sm:px-6 md:grid-cols-2 md:px-8 md:pb-7">
                    {group.items.map((item, index) => {
                      const key = `${group.id}-${index}`;
                      const shown = answer === key;
                      return (
                        <li key={key} data-question={key} className="relative border-b border-eggshell/10 md:[&:nth-last-child(-n+2)]:border-b-0 last:border-b-0">
                          {/* Accent tick that springs up beside an open answer. */}
                          <span
                            data-tick
                            aria-hidden="true"
                            className="absolute top-3 bottom-3 -left-3 w-[3px] origin-top scale-y-0 rounded-full sm:-left-4"
                            style={{ background: group.accent }}
                          />
                          <button
                            type="button"
                            aria-expanded={shown}
                            aria-controls={`faq-a-${key}`}
                            onClick={() => toggleAnswer(key)}
                            className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-[0.9375rem] font-medium text-eggshell md:text-base"
                          >
                            {item.question}
                            <span className="size-6 shrink-0 text-dim">
                              <PlusMark />
                            </span>
                          </button>
                          <div id={`faq-a-${key}`} data-answer={key} inert={!shown} className="h-0 overflow-hidden">
                            <p className="type-body pb-4 text-platinum">{item.answer}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>

        <p data-bento-lead className="type-note mt-8 text-center text-dim">
          {t.missing}{" "}
          <a
            href={whatsappHref(common.contact.whatsappDefault)}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="faq"
            className="font-medium text-eggshell underline decoration-eggshell/30 underline-offset-4 hover:decoration-eggshell"
          >
            {common.contact.whatsapp}
          </a>
        </p>
      </div>
    </section>
  );
}
