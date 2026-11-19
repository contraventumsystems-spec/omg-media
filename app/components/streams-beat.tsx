"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { StreamScreen } from "@/app/components/stream-screens";
import { hookRig, resetHookRig } from "@/app/lib/floor-hook";
import { STREAM_BEAT, STREAM_ICON_BOX, STREAMS, useSceneStore } from "@/app/lib/scene-store";
import { MERGE, mergeRig, resetMergeRig } from "@/app/lib/stream-merge";
import {
  FORMATION,
  PRESENT_ORDER,
  PRESENT_SPAN,
  presentRig,
  resetPresentRig,
} from "@/app/lib/stream-present";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LABELS: Record<(typeof STREAMS)[number]["id"], string> = {
  strategie: "Strategie",
  design: "Design",
  tehnologie: "Tehnologie",
};

/** Desktop only: share of the phone-length beat the camera rests on the floor for. 72svh of 240. */
const HOOK_HOLD = 0.3;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Scroll rig for beat 2 and the three labels that sit on the stream screens.
 *
 * Like the hero, nothing is pinned by JavaScript. The stage is CSS sticky, the
 * canvas is fixed, and ScrollTrigger only measures the track and writes the
 * scrubbed progress to the store. The beat starts while the section is still
 * rising (top at 60% of the viewport), so the push-in plays as the heading lands.
 *
 * The labels are a fixed layer the size of the canvas. This component only
 * hands their nodes to the store; the scene projects each screen's 3D position
 * and moves its label in the same frame it draws, so they cannot lag the pile.
 * The icons are a second set of nodes in this same layer. The scene fits each
 * one to its glass. The sheen inside an icon is the brightness sweep, driven
 * from the same rig as the set's move.
 */
export function StreamsBeat() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const layer = root.current;
      const track = layer?.closest<HTMLElement>("[data-stream-track]");
      if (!layer || !track) return;

      const heading = track.querySelector<HTMLElement>("[data-stream-heading]");
      const lead = track.querySelector<HTMLElement>("[data-stream-lead]");
      const scrim = track.querySelector<HTMLElement>("[data-stream-scrim]");
      const chips = Array.from(layer.querySelectorAll<HTMLElement>("[data-stream-chip]"));
      const icons = Array.from(layer.querySelectorAll<HTMLElement>("[data-stream-icon]"));
      const media = gsap.matchMedia();

      media.add(
        { motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 768px)" },
        (context) => {
        if (!context.conditions?.motion) return;
        const wide = Boolean(context.conditions?.wide);
        const beat = { progress: 0 };
        useSceneStore.setState({ chips, icons });

        const apply = () => {
          const progress = beat.progress;
          useSceneStore.setState({ stream: progress });
          /* The lead goes first, then the heading, so the river is clear before the list arrives. */
          if (lead) {
            lead.style.opacity = String(1 - clamp01((progress - STREAM_BEAT.pushEnd) / 0.12));
          }
          if (heading) {
            const out = clamp01((progress - (STREAM_BEAT.headingGone - 0.14)) / 0.14);
            heading.style.opacity = String(1 - out);
            heading.style.visibility = out >= 1 ? "hidden" : "visible";
            /* The scrim exists for the heading, so it leaves with it and the river stays bright. */
            if (scrim) scrim.style.opacity = String(1 - out);
          }
        };

        /*
         * One scrubbed timeline. Progress holds at the end of the push while the
         * three sets become one, then the tilt and the river run for their original
         * durations. On a desktop the track is 72svh longer and that scroll is a
         * hold at the end of the tilt: the camera rests on the floor while the hook
         * is read, then the river slides on and the list comes up.
         */
        const hold = wide ? HOOK_HOLD : 0;
        /* Design sits here. The first floor word starts on the same beat, as the tilt begins. */
        const seated = STREAM_BEAT.pushEnd + PRESENT_SPAN;
        /* Where each line starts, the stagger between its words, and how long one word takes. */
        const starts = wide ? [0.62, 0.74] : [0.45, 0.52];
        const stagger = wide ? 0.026 : 0.018;
        const pop = wide ? 0.08 : 0.06;
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: apply,
          scrollTrigger: {
            trigger: track,
            start: "top 60%",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        timeline
          .to(beat, { progress: STREAM_BEAT.pushEnd, duration: STREAM_BEAT.pushEnd }, 0)
          .to(
            beat,
            {
              progress: STREAM_BEAT.tiltEnd,
              duration: STREAM_BEAT.tiltEnd - STREAM_BEAT.pushEnd,
            },
            seated,
          )
          .to(
            beat,
            { progress: 1, duration: 1 - STREAM_BEAT.tiltEnd },
            STREAM_BEAT.tiltEnd + PRESENT_SPAN + hold,
          );
        /*
         * Three become one, across the pause (see app/lib/stream-merge.ts). The
         * three sources gather while the rest of the pile switches off, they
         * spiral into one point, and a single set stands where they met. It comes
         * down to the head of the pool as the tilt begins, which is where the
         * floor line starts. Tehnologie still arrives on the sharper ease.
         */
        const pause = PRESENT_SPAN;
        const gatherAt = STREAM_BEAT.pushEnd;
        const at = (share: number) => gatherAt + pause * share;
        const gatherEnd = at(FORMATION.gather);
        const impact = at(MERGE.impact);
        PRESENT_ORDER.forEach((id, index) => {
          const pose = presentRig[id];
          const start = at(FORMATION.stagger * index);
          const arrive = id === "tehnologie" ? "power3.out" : "power2.out";
          /* Every source is at its cap by the end of the gather. */
          timeline.to(pose, { forward: 1, face: 1, duration: gatherEnd - start, ease: arrive }, start);
          /* The sweep crosses the icon as the pile around it goes dark. */
          timeline.to(
            pose,
            { gleam: 1, duration: pause * 0.12, ease: "sine.inOut" },
            gatherEnd - pause * 0.12,
          );
          /* The hit has taken the three by now. Back at rest, so the pointer parallax returns. */
          timeline.to(
            pose,
            { forward: 0, face: 0, gleam: 0, duration: pause * 0.02 },
            impact + pause * 0.01,
          );
        });
        timeline
          .to(
            mergeRig,
            { clear: 1, duration: pause * (MERGE.clearEnd - MERGE.clearStart) },
            at(MERGE.clearStart),
          )
          /* back.in pulls the three apart first, then throws them at each other. */
          .to(
            mergeRig,
            { converge: 1, duration: pause * (MERGE.impact - MERGE.rushStart), ease: "back.in(1.5)" },
            at(MERGE.rushStart),
          )
          .to(
            mergeRig,
            { single: 1, duration: pause * 0.12, ease: "back.out(2.2)" },
            impact - pause * 0.005,
          )
          .to(
            mergeRig,
            { shock: 1, duration: pause * 0.012, ease: "power2.out" },
            impact - pause * 0.006,
          )
          .to(mergeRig, { shock: 0, duration: pause * 0.1, ease: "power2.out" }, impact + pause * 0.006)
          .to(mergeRig, { tune: 1, duration: pause * 0.2 }, impact)
          .to(
            mergeRig,
            { land: 1, duration: MERGE.landSpan, ease: "power2.inOut" },
            at(MERGE.landStart),
          )
          /* Touchdown: the pool runs out from under the set, ahead of the floor line. */
          .to(
            mergeRig,
            { pour: 1, duration: MERGE.pourSpan, ease: "power2.out" },
            at(MERGE.landStart) + MERGE.landSpan - MERGE.pourLead,
          );
        /*
         * The pop, word by word: quick scale-up, slight overshoot, settle, while the
         * three colour ghosts close into one white word. Then a stroke under the last one.
         * The line keeps its stagger; only the first word moves, onto Design's seat.
         */
        let end = 0;
        hookRig.words.forEach((word) => {
          const at = seated + (starts[word.line] - starts[0]) + word.index * stagger;
          end = at + pop;
          timeline
            .to(word, { scale: 1, duration: pop, ease: "back.out(3)" }, at)
            .to(word, { alpha: 1, duration: pop * 0.3 }, at)
            .to(word, { lock: 1, duration: pop * 1.7, ease: "elastic.out(1, 0.5)" }, at + pop * 0.15);
        });
        /* The payoff: the last word outgrows the line, and the stroke is pulled under it. */
        timeline
          .to(hookRig, { grow: 1, duration: pop * 1.1, ease: "back.out(3.5)" }, end - pop * 0.2)
          .to(hookRig, { rule: 1, duration: pop * 0.9, ease: "power2.out" }, end);
        apply();

        return () => {
          useSceneStore.setState({ stream: 0, chips: [], icons: [] });
          resetHookRig();
          resetPresentRig();
          resetMergeRig();
          chips.forEach((chip) => {
            chip.style.opacity = "0";
          });
          icons.forEach((icon) => {
            icon.style.opacity = "0";
            const sheen = icon.querySelector<HTMLElement>("[data-stream-sheen]");
            if (sheen) sheen.style.opacity = "0";
          });
        };
        },
      );
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden motion-reduce:hidden"
    >
      {STREAMS.map((stream) => (
        <div
          key={stream.id}
          data-stream-chip
          className="absolute top-0 left-0 opacity-0 will-change-transform"
          style={{ color: stream.color }}
        >
          {/* Anchored by its bottom centre, with a short lead line down to the screen. */}
          <div className="flex -translate-x-1/2 -translate-y-full flex-col items-center">
            <span className="rounded-full border border-current bg-background/90 px-3 py-1 text-[11px] font-medium tracking-[0.14em] whitespace-nowrap uppercase md:text-xs">
              {LABELS[stream.id]}
            </span>
            <span className="h-3 w-px bg-current md:h-4" />
          </div>
        </div>
      ))}
      {STREAMS.map((stream) => (
        <div
          key={`${stream.id}-icon`}
          data-stream-icon
          className="absolute top-0 left-0 origin-top-left overflow-hidden rounded-[9%/12%] opacity-0 will-change-transform"
          style={{ width: STREAM_ICON_BOX.width, height: STREAM_ICON_BOX.height }}
        >
          {/* The scene scales this box onto the glass. */}
          <StreamScreen id={stream.id} live />
          {/* One soft band. The scene slides it across while this screen is front-facing. */}
          <span
            data-stream-sheen
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 mix-blend-screen will-change-transform"
          />
        </div>
      ))}
    </div>
  );
}
