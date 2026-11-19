"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type ReactNode, useRef } from "react";
import { useSceneStore } from "@/app/lib/scene-store";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Beat 3 stage: the camera pushes into the centre screen and stays there.
 * The channel carousel that used to take over after the zoom is gone.
 *
 * Same rig as the other beats: CSS sticky stage, fixed canvas, ScrollTrigger
 * only measures. Progress starts when the section's top reaches the bottom of
 * the viewport; at that moment the opaque service list still fills the screen,
 * which is when the camera is handed from beat 2 to this beat.
 *
 * The stage stays see-through, so the zoomed TVs remain visible. Reduced
 * motion gets a plain solid section from the track.
 */
export function WorkBeat({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = root.current;
      const track = stage?.closest<HTMLElement>("[data-work-track]");
      if (!stage || !track) return;
      const media = gsap.matchMedia();

      /* Motion users scrub the camera. Reduced motion leaves the scene on main. */
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const beat = { progress: 0 };

        gsap.to(beat, {
          progress: 1,
          ease: "none",
          onUpdate: () => useSceneStore.setState({ work: beat.progress }),
          scrollTrigger: {
            trigger: track,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
            onToggle: (self) => {
              useSceneStore.setState({
                stage: self.isActive ? "work" : "main",
              });
            },
          },
        });

        return () => {
          useSceneStore.setState({ work: 0, stage: "main" });
        };
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="sticky top-0 flex h-svh flex-col motion-reduce:static motion-reduce:h-auto motion-reduce:pb-20"
    >
      {/* While the canvas shows, keep the heading readable over the pile. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[42svh] bg-[linear-gradient(to_bottom,#15110D_0%,rgba(21,17,13,0.86)_55%,transparent_100%)] motion-reduce:hidden"
      />

      <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-5 pt-28 pb-20 md:px-10 md:pt-24 md:pb-10">
        {children}
      </div>
    </div>
  );
}
