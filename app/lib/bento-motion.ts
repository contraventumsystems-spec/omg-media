"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clearPop, drawPop, readPops } from "@/app/components/services-story";

gsap.registerPlugin(ScrollTrigger);

/**
 * Shared motion for the bento sections, the same moves the flux bento
 * (app/components/flow-bento.tsx) makes, so a second grid reads as the same family.
 * Call from inside a useGSAP callback: everything here is created in that
 * context and reverted with it.
 */

/**
 * Heading pop: every [data-pop] word in [data-bento-heading] locks in with its
 * colour ghosts, then the [data-bento-bars] stroke draws and [data-bento-lead]
 * lines rise. Waits until the heading's top is 60% down the screen, so the
 * whole line is visible before it plays. `start` overrides that, for a
 * heading that already sits low on the first screen.
 */
export function bentoHeadingPop(scope: HTMLElement, start = "top 60%") {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const heading = scope.querySelector<HTMLElement>("[data-bento-heading]");
    const bars = scope.querySelector<HTMLElement>("[data-bento-bars]");
    if (!heading || !bars) return;
    const pops = readPops(heading);
    const intro = gsap.timeline({
      paused: true,
      onUpdate: () => pops.forEach(drawPop),
    });
    pops.forEach((pop, index) => {
      const at = index * 0.08;
      intro
        .to(pop.state, { scale: 1, duration: 0.6, ease: "back.out(3)" }, at)
        .to(pop.state, { alpha: 1, duration: 0.18 }, at)
        .to(pop.state, { lock: 1, duration: 1, ease: "elastic.out(1, 0.5)" }, at + 0.09);
    });
    intro
      .fromTo(
        bars,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.5, ease: "power2.out" },
        pops.length * 0.08 + 0.15,
      )
      .from(
        scope.querySelectorAll("[data-bento-lead]"),
        { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        0.45,
      );
    pops.forEach(drawPop);
    ScrollTrigger.create({
      trigger: heading,
      start,
      once: true,
      onEnter: () => {
        intro.play();
      },
    });
    return () => pops.forEach(clearPop);
  });
}

/**
 * Card entrance for every [data-bento-card] in scope.
 * Desktop and tablet: a rubber-hose drop, then the content pops in.
 * Phones: cards swing in from alternating sides, scrubbed to the scroll.
 */
export function bentoEntrance(scope: HTMLElement) {
  const media = gsap.matchMedia();

  media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const cards = gsap.utils.toArray<HTMLElement>("[data-bento-card]", scope);
    const partsOf = (batch: Element[]) =>
      batch.flatMap((card) =>
        Array.from(
          card.querySelectorAll<HTMLElement>(
            "[data-slot=card-header], [data-slot=card-content]",
          ),
        ),
      );
    gsap.set(cards, {
      autoAlpha: 0,
      y: 160,
      scaleX: 0.82,
      scaleY: 1.22,
      rotation: (index: number) => (index % 2 === 0 ? -7 : 7),
      transformOrigin: "50% 100%",
    });
    gsap.set(partsOf(cards), { autoAlpha: 0, y: 24 });
    ScrollTrigger.batch(cards, {
      start: "top 92%",
      once: true,
      onEnter: (batch) => {
        gsap
          .timeline()
          .to(batch, {
            keyframes: [
              { autoAlpha: 1, y: -28, rotation: 0, scaleX: 0.9, scaleY: 1.12, duration: 0.38, ease: "power3.out" },
              { y: 0, scaleX: 1.12, scaleY: 0.84, duration: 0.13, ease: "power2.in" },
              { scaleX: 1, scaleY: 1, duration: 0.75, ease: "elastic.out(1.1, 0.35)" },
            ],
            stagger: 0.11,
            overwrite: true,
            /* Cleared on complete: clearProps inside keyframes is undone by the later keyframes. */
            onComplete: () => {
              gsap.set(batch, {
                clearProps: "transform,transformOrigin,opacity,visibility",
              });
            },
          })
          .to(
            partsOf(batch),
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              ease: "back.out(2.6)",
              stagger: 0.05,
              clearProps: "transform,opacity,visibility",
            },
            0.48,
          );
      },
    });
  });

  media.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.utils.toArray<HTMLElement>("[data-bento-card]", scope).forEach((card, index) => {
      const side = index % 2 === 0 ? -1 : 1;
      gsap.fromTo(
        card,
        { autoAlpha: 0, x: side * 90, rotation: side * 6, scale: 0.86 },
        {
          autoAlpha: 1,
          x: 0,
          rotation: 0,
          scale: 1,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: card, start: "top 100%", end: "top 60%", scrub: 0.5 },
        },
      );
    });
  });
}
