"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { buildHeroTimeline, HERO_BEAT, heroRig, resetHeroRig } from "@/app/lib/hero-rig";
import { useSceneStore } from "@/app/lib/scene-store";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/*
 * A phone's address bar slides away on the first swipe and resizes the window.
 * Every height in the beat is in svh, which does not change when that happens,
 * so there is nothing to re-measure: a refresh there would only make the scrub jump.
 */
ScrollTrigger.config({ ignoreMobileResize: true });

/** The story of the beat: static, then a signal, then a shape. */
const STAGES = [
  { label: "Zgomot", from: 0 },
  { label: "Semnal", from: HERO_BEAT.tuneStart },
  { label: "Formă", from: HERO_BEAT.pourStart },
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
 * So there is no pin to release at the end: the page simply scrolls on.
 *
 * ScrollTrigger scrubs one master timeline (app/lib/hero-rig.ts) over the height
 * of the section. The timeline writes plain numbers, the canvas reads them in
 * useFrame. scrub: 0.6 makes the scene trail the thumb a little, forwards and back.
 *
 * It also measures the first viewport for the canvas: where the copy ends and
 * where the scroll hint begins. On a phone the opening shot fits the whole pile
 * into that band, so the type and the televisions never share a pixel.
 */
export function HeroBeat() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const hud = root.current;
      const hero = hud?.closest("section");
      if (!hud || !hero) return;

      const copy = hero.querySelector<HTMLElement>("[data-hero-copy]");
      const copyEnd = hero.querySelector<HTMLElement>("[data-hero-copy-end]");
      const tall = hero.querySelector<HTMLElement>("[data-hero-lvh]");
      const bar = hud.querySelector<HTMLElement>("[data-hero-bar]");
      const hint = hud.querySelector<HTMLElement>("[data-hero-hint]");
      const readout = hud.querySelector<HTMLElement>("[data-hero-readout]");
      const stages = Array.from(hud.querySelectorAll<HTMLElement>("[data-hero-stage]"));

      /* The free band of the first viewport, as shares of the canvas height (100lvh). */
      const measure = () => {
        if (!copy || !copyEnd || !tall) return;
        const canvasHeight = tall.offsetHeight;
        const viewHeight = copy.offsetHeight;
        if (canvasHeight === 0 || viewHeight === 0) return;
        const copyBottom = copyEnd.getBoundingClientRect().bottom - copy.getBoundingClientRect().top;
        /* Clear space under the buttons, and room at the bottom for the scroll hint. */
        const gap = Math.max(28, viewHeight * 0.045);
        const foot = Math.max(72, viewHeight * 0.1);
        const top = (copyBottom + gap) / canvasHeight;
        const bottom = (viewHeight - foot) / canvasHeight;
        const previous = useSceneStore.getState().heroFrame;
        if (
          previous &&
          Math.abs(previous.top - top) < 0.002 &&
          Math.abs(previous.bottom - bottom) < 0.002
        ) {
          return;
        }
        useSceneStore.setState({ heroFrame: { top, bottom } });
      };
      measure();
      /* Fires when the fonts land and when the copy rewraps, which a window listener would miss. */
      const observer = new ResizeObserver(measure);
      if (copy) observer.observe(copy);
      if (copyEnd) observer.observe(copyEnd);

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const master = buildHeroTimeline(heroRig);
        let stage = -1;

        const apply = () => {
          const progress = master.progress();
          useSceneStore.setState({ progress });
          if (bar) bar.style.transform = `scaleX(${progress})`;
          /* The hint and the readout share the bottom edge: one leaves as the other arrives. */
          if (hint) hint.style.opacity = String(Math.max(0, 1 - progress / 0.04));
          /* The readout steps out as the signal bars widen over the frame, in the same seven steps. */
          const covered = Math.floor(heroRig.wipe * 7 + 0.001) / 7;
          if (readout) {
            readout.style.opacity = String(
              Math.min(1, Math.max(0, (progress - 0.04) / 0.06)) * (1 - covered),
            );
          }
          const next = stageAt(progress);
          if (next !== stage) {
            stage = next;
            stages.forEach((element, index) => {
              element.dataset.active = String(index === next);
            });
          }
        };
        master.eventCallback("onUpdate", apply);

        ScrollTrigger.create({
          animation: master,
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
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
              end: () => `+=${copy.offsetHeight * 0.42}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        }

        /* matchMedia reverts the timeline and both triggers; the rig is plain data, so reset it by hand. */
        return () => {
          resetHeroRig();
          useSceneStore.setState({ progress: 0 });
        };
      });

      return () => observer.disconnect();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none sticky top-0 flex h-svh flex-col justify-end motion-reduce:hidden"
    >
      <div className="[text-shadow:0_0_14px_#15110D,0_0_4px_#15110D]">
        <div className="relative mx-auto flex w-full max-w-6xl items-end px-5 pb-6 md:px-10 md:pb-8">
          <div data-hero-readout className="w-full max-w-xs opacity-0 md:max-w-sm">
            <ol className="font-mono flex gap-5 text-[11px] tracking-[0.14em] uppercase md:gap-7 md:text-xs">
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
            className="font-mono absolute bottom-6 left-5 flex items-center gap-3 text-[11px] tracking-[0.14em] text-platinum uppercase md:bottom-8 md:left-10 md:text-xs"
          >
            Derulează
            <span className="scroll-hint relative block h-8 w-px overflow-hidden bg-white/15" />
          </p>
        </div>
      </div>
    </div>
  );
}
