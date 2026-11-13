"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { HERO_BEAT, useSceneStore } from "@/app/lib/scene-store";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** The story of the beat: static, then a signal, then a shape. */
const STAGES = [
  { label: "Zgomot", from: 0 },
  { label: "Semnal", from: HERO_BEAT.tuneStart },
  { label: "Formă", from: HERO_BEAT.growStart },
] as const;

function stageAt(progress: number) {
  let index = 0;
  STAGES.forEach((stage, i) => {
    if (progress >= stage.from) index = i;
  });
  return index;
}

/**
 * Scroll rig for the hero beat, and the small readout that stays on screen while it plays.
 *
 * The hero is a tall section with nothing pinned by JavaScript: the canvas is
 * already fixed, the copy scrolls away at page speed, and this layer is CSS sticky.
 * ScrollTrigger only measures. It writes the scrubbed progress to the store, and
 * the canvas reads it in useFrame. scrub: 0.6 makes the scene trail the thumb a little.
 */
export function HeroBeat() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const hud = root.current;
      const hero = hud?.closest("section");
      if (!hud || !hero) return;

      const copy = hero.querySelector<HTMLElement>("[data-hero-copy]");
      const bar = hud.querySelector<HTMLElement>("[data-hero-bar]");
      const hint = hud.querySelector<HTMLElement>("[data-hero-hint]");
      const readout = hud.querySelector<HTMLElement>("[data-hero-readout]");
      const stages = Array.from(hud.querySelectorAll<HTMLElement>("[data-hero-stage]"));
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const beat = { progress: 0 };
        let stage = -1;

        const apply = () => {
          const progress = beat.progress;
          useSceneStore.setState({ progress });
          if (bar) bar.style.transform = `scaleX(${progress})`;
          /* The hint and the readout share the bottom edge: one leaves as the other arrives. */
          if (hint) hint.style.opacity = String(Math.max(0, 1 - progress / 0.04));
          if (readout) readout.style.opacity = String(Math.min(1, Math.max(0, (progress - 0.04) / 0.06)));
          const next = stageAt(progress);
          if (next !== stage) {
            stage = next;
            stages.forEach((element, index) => {
              element.dataset.active = String(index === next);
            });
          }
        };

        gsap.to(beat, {
          progress: 1,
          ease: "none",
          onUpdate: apply,
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        apply();

        /* The copy leaves with the page; the fade keeps it from sliding under the header at full strength. */
        if (copy) {
          gsap.to(copy, {
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: () => `+=${window.innerHeight * 0.5}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }

        return () => useSceneStore.setState({ progress: 0 });
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none sticky top-0 flex h-svh flex-col justify-end motion-reduce:hidden"
    >
      <div className="[text-shadow:0_0_14px_#070C0F,0_0_4px_#070C0F]">
        <div className="relative mx-auto flex w-full max-w-6xl items-end px-5 pb-6 md:px-10 md:pb-8">
          <div data-hero-readout className="w-full max-w-xs opacity-0 md:max-w-sm">
            <ol className="flex gap-5 text-[11px] tracking-[0.14em] uppercase md:gap-7 md:text-xs">
              {STAGES.map((stage, index) => (
                <li
                  key={stage.label}
                  data-hero-stage
                  data-active={index === 0}
                  className="flex items-baseline gap-2 text-dim transition-colors duration-200 data-[active=true]:text-eggshell"
                >
                  <span className="tabular-nums opacity-60">0{index + 1}</span>
                  {stage.label}
                </li>
              ))}
            </ol>
            <div className="mt-3 h-px w-full bg-white/15">
              <div
                data-hero-bar
                className="h-full origin-left scale-x-0 bg-eggshell"
              />
            </div>
          </div>
          <p
            data-hero-hint
            className="absolute bottom-6 left-5 flex items-center gap-3 text-[11px] tracking-[0.14em] text-platinum uppercase md:bottom-8 md:left-10 md:text-xs"
          >
            Derulează
            <span className="scroll-hint relative block h-8 w-px overflow-hidden bg-white/15" />
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Explorează. Scrolls to the point where the whole pile is in frame,
 * or to the services when the beat is switched off by reduced motion.
 */
export function ExploreButton({ className }: { className?: string }) {
  function onClick() {
    const hero = document.getElementById("hero");
    if (!hero) return;
    const travel = hero.offsetHeight - window.innerHeight;
    if (travel < 8) {
      document.getElementById("servicii")?.scrollIntoView();
      return;
    }
    window.scrollTo({
      top: hero.offsetTop + travel * (HERO_BEAT.revealEnd + 0.02),
      behavior: "smooth",
    });
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      Explorează
      <span aria-hidden="true" className="ml-2">
        ↓
      </span>
    </button>
  );
}
