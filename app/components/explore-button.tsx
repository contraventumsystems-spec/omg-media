"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { holdChannelCut } from "@/app/components/channel-change";
import { positionAlong, seamOnPath } from "@/app/components/scroll-helper";

/** Speed of the glide in px per second, and the bounds of its length. */
const SPEED = 1500;
const MIN_S = 3.5;
const MAX_S = 7;
/** The click that starts the glide must not count as the reader taking over. */
const GRACE_MS = 250;

/**
 * Explorează. A guided glide from the hero to the floor hook ("Începem
 * simplu. Construim ca să poți crește." lifted to the top, where the services
 * start): fast, but slow enough that the pile, the bars and the three streams
 * play on the way. The empty stretch between hero and services is skipped,
 * the same way the scroll helper skips it, and the hero/services cut is held
 * so it cannot lock the glide.
 *
 * The reader stays in charge: a wheel turn, a swipe, a key or the "Oprește"
 * pill stops it where it is, and normal scrolling takes over. Reduced motion
 * jumps straight to the services.
 */
export function ExploreButton({ className }: { className?: string }) {
  const [gliding, setGliding] = useState(false);
  const stop = useRef<(() => void) | null>(null);

  useEffect(() => () => stop.current?.(), []);

  function onClick() {
    const story = document.querySelector<HTMLElement>("[data-story-track]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!story || reduced) {
      document.getElementById("servicii")?.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }

    const from = window.scrollY;
    const to = story.getBoundingClientRect().top + window.scrollY;
    if (to - from < 4) return;
    const seam = seamOnPath(from, to);
    const travelled = to - from - (seam ? seam.landing - seam.gate : 0);
    const duration = Math.min(MAX_S, Math.max(MIN_S, travelled / SPEED));

    const release = holdChannelCut();
    const proxy = { p: 0 };
    let grace = 0;

    const end = () => {
      window.clearTimeout(grace);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
      release();
      stop.current = null;
      setGliding(false);
    };
    const tween = gsap.to(proxy, {
      p: 1,
      duration,
      /* Eases in and out, steady in the middle, so the beats read. */
      ease: "power1.inOut",
      onUpdate: () => window.scrollTo({ top: positionAlong(from, to, seam, proxy.p), behavior: "instant" }),
      onComplete: end,
      onInterrupt: end,
    });
    function cancel() {
      tween.kill();
    }
    stop.current = cancel;
    grace = window.setTimeout(() => {
      window.addEventListener("wheel", cancel, { passive: true });
      window.addEventListener("touchstart", cancel, { passive: true });
      window.addEventListener("keydown", cancel);
    }, GRACE_MS);
    setGliding(true);
  }

  return (
    <>
      <button type="button" onClick={onClick} className={className} aria-describedby="explore-hint">
        Explorează
        <span aria-hidden="true" className="ml-2">
          ↓
        </span>
      </button>
      <span id="explore-hint" className="sr-only">
        Derulează automat până la servicii. Orice derulare sau tastă o oprește.
      </span>
      {gliding
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-4">
              <button
                type="button"
                onClick={() => stop.current?.()}
                className="glide-pill pointer-events-auto flex h-11 items-center gap-3 rounded-full border border-eggshell/20 bg-background/90 pr-4 pl-3 text-eggshell shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-eggshell/70"
              >
                <span aria-hidden="true" className="flux-blink size-2 rounded-full bg-flux-red" />
                <span className="type-index">Derulare automată</span>
                <span className="type-index rounded-full bg-eggshell px-2.5 py-1 text-background">Oprește</span>
              </button>
            </div>,
            document.body,
          )
        : null}
      <span aria-live="polite" className="sr-only">
        {gliding ? "Derulare automată pornită." : ""}
      </span>
    </>
  );
}
