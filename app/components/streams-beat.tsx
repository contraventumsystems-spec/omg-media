"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { STREAM_BEAT, STREAMS, useSceneStore } from "@/app/lib/scene-store";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LABELS: Record<(typeof STREAMS)[number]["id"], string> = {
  strategie: "Strategie",
  design: "Design",
  tehnologie: "Tehnologie",
};

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
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const beat = { progress: 0 };
        useSceneStore.setState({ chips });

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

        gsap.to(beat, {
          progress: 1,
          ease: "none",
          onUpdate: apply,
          scrollTrigger: {
            trigger: track,
            start: "top 60%",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        apply();

        return () => {
          useSceneStore.setState({ stream: 0, chips: [] });
          chips.forEach((chip) => {
            chip.style.opacity = "0";
          });
        };
      });
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
    </div>
  );
}
