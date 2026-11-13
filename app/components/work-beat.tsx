"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type PointerEvent, type ReactNode, useRef, useState } from "react";
import { channelChange } from "@/app/components/channel-change";
import { WORK_BEAT, useSceneStore } from "@/app/lib/scene-store";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type Channel = {
  channel: string;
  title: string;
  type: string;
  result: string;
  /** One bar colour per channel. */
  color: string;
};

const SWIPE_PX = 44;

/**
 * Beat 3 stage: the camera pushes into the centre screen, then this DOM
 * carousel takes over behind a channel change.
 *
 * Same rig as the other beats: CSS sticky stage, fixed canvas, ScrollTrigger
 * only measures. Progress starts when the section's top reaches the bottom of
 * the viewport; at that moment the opaque service list still fills the screen,
 * which is when the camera is handed from beat 2 to this beat.
 *
 * The stage is see-through until WORK_BEAT.cover, then solid. Each project is
 * a channel: buttons, arrow keys and a horizontal swipe all switch through the
 * same channel-change burst. Reduced motion shows the solid stage from the start.
 */
export function WorkBeat({ channels, children }: { channels: Channel[]; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const current = channels[index];

  useGSAP(
    () => {
      const stage = root.current;
      const track = stage?.closest<HTMLElement>("[data-work-track]");
      if (!stage || !track) return;
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const beat = { progress: 0 };
        let covered = false;
        stage.dataset.covered = "false";

        const apply = () => {
          useSceneStore.setState({ work: beat.progress });
          const next = beat.progress >= WORK_BEAT.cover;
          if (next === covered) return;
          covered = next;
          /* Forward, the swap hides behind the burst. Backward, a plain fade is enough. */
          if (next) channelChange(() => (stage.dataset.covered = "true"));
          else stage.dataset.covered = "false";
        };

        gsap.to(beat, {
          progress: 1,
          ease: "none",
          onUpdate: apply,
          scrollTrigger: {
            trigger: track,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 0.6,
            onToggle: (self) => {
              useSceneStore.setState({ stage: self.isActive ? "work" : "main" });
            },
          },
        });

        return () => {
          useSceneStore.setState({ work: 0, stage: "main" });
          stage.dataset.covered = "true";
        };
      });
    },
    { scope: root },
  );

  function go(next: number) {
    const target = (next + channels.length) % channels.length;
    if (target === index) return;
    channelChange(() => setIndex(target));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    swipe.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    go(index + (dx < 0 ? 1 : -1));
  }

  return (
    <div
      ref={root}
      data-covered="true"
      className="group/stage sticky top-0 flex h-svh flex-col motion-reduce:static motion-reduce:h-auto motion-reduce:pb-20"
    >
      {/* Solid page colour over the canvas once the carousel is on. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-background opacity-0 transition-opacity duration-200 group-data-[covered=true]/stage:opacity-100"
      />
      {/* While the canvas shows, keep the heading readable over the pile. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[42svh] bg-[linear-gradient(to_bottom,#15110D_0%,rgba(21,17,13,0.86)_55%,transparent_100%)] motion-reduce:hidden"
      />

      <div className="relative mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-5 pt-28 pb-20 md:px-10 md:pt-24 md:pb-10">
        {children}

        <div
          role="group"
          aria-roledescription="carusel"
          aria-label="Lucrări, pe canale"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") go(index + 1);
            if (event.key === "ArrowLeft") go(index - 1);
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipe.current = null)}
          className="invisible mt-6 flex min-h-0 flex-1 touch-pan-y flex-col gap-5 opacity-0 transition-opacity duration-200 group-data-[covered=true]/stage:visible group-data-[covered=true]/stage:opacity-100 md:mt-8 md:flex-row md:items-stretch md:gap-10"
          style={{ color: current.color }}
        >
          {/* The channel. A 4:3 plate that waits for the clip from the video atlas. */}
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[10px] border border-white/15 bg-[#1C1712] md:aspect-auto md:h-full md:w-auto md:max-w-[62%] md:flex-1">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.05)_0_1px,transparent_1px_4px)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center font-display text-[28vw] leading-none tracking-[-0.05em] opacity-[0.16] select-none md:text-[13vw]"
            >
              {current.channel.replace("CH ", "")}
            </span>
            <span className="absolute top-3 left-3 flex items-center gap-2 rounded-sm bg-background/80 px-2 py-1 text-[11px] font-medium tracking-[0.14em] uppercase md:top-4 md:left-4 md:text-xs">
              {current.channel}
            </span>
            {/* Signal strength: a small wry touch, as on a set-top box. */}
            <span
              aria-hidden="true"
              className="absolute top-3 right-3 flex h-4 items-end gap-[3px] md:top-4 md:right-4"
            >
              {[0.35, 0.55, 0.8, 1].map((height) => (
                <span
                  key={height}
                  className="signal-bar w-[3px] bg-current"
                  style={{ height: `${height * 100}%` }}
                />
              ))}
            </span>
            <span className="absolute bottom-3 left-3 text-[11px] tracking-[0.14em] text-dim uppercase md:bottom-4 md:left-4 md:text-xs">
              {current.result}
            </span>
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-current" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col md:justify-between md:py-1">
            <div aria-live="polite">
              <p className="text-xs tracking-[0.14em] text-dim uppercase">{current.type}</p>
              <h3 className="mt-2 font-display text-3xl leading-[0.95] tracking-[-0.03em] text-eggshell md:text-5xl">
                {current.title}
              </h3>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-platinum">
                {current.result}
              </p>
              <a
                href="#contact"
                className="mt-4 inline-flex items-center border-b border-white/25 pb-0.5 text-[15px] font-medium text-eggshell hover:border-eggshell"
              >
                Vezi proiectul
              </a>
            </div>

            <div className="mt-5 flex items-center gap-2 md:mt-0">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Canalul anterior"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 text-eggshell hover:border-eggshell"
              >
                <span aria-hidden="true">←</span>
              </button>
              <ol className="flex flex-1 items-center gap-1.5 md:flex-none">
                {channels.map((item, position) => (
                  <li key={item.channel}>
                    <button
                      type="button"
                      onClick={() => go(position)}
                      aria-current={position === index}
                      aria-label={`${item.channel}, ${item.title}`}
                      className="h-11 cursor-pointer px-2 text-[11px] tracking-[0.14em] text-dim uppercase tabular-nums hover:text-eggshell aria-[current=true]:text-eggshell md:px-3 md:text-xs"
                    >
                      {item.channel.replace("CH ", "")}
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Canalul următor"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 text-eggshell hover:border-eggshell"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
