"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { BAR_HEX } from "@/app/lib/bars";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const EVENT = "channel-change";
/** Never more than one burst per screen of scrolling. */
const COOLDOWN_MS = 900;

/**
 * Plays the burst. `onCovered` runs while the screen is hidden by static,
 * which is the moment to jump the page or swap content.
 */
export function channelChange(onCovered?: () => void) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { onCovered } }));
}

/**
 * "Schimbare de canal", the one transition of the site.
 * 0 to 120 ms static at full opacity, 120 to 280 ms a seven-bar wipe in 1/7 steps,
 * 280 to 400 ms fade out. Reduced motion gets a 150 ms dip instead.
 *
 * The static is a quarter-resolution canvas of random pixels scaled up with
 * image-rendering: pixelated, which stays cheap on phones.
 *
 * Also owns two page-level listeners:
 *   - links marked data-channel jump to their section behind the burst
 *   - links marked data-cta report click_whatsapp to GA4 when gtag is present
 */
export function ChannelChange() {
  const root = useRef<HTMLDivElement>(null);
  const noise = useRef<HTMLCanvasElement>(null);
  const bars = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const overlay = root.current;
      const canvas = noise.current;
      const wipe = bars.current;
      if (!overlay || !canvas || !wipe) return;

      const context = canvas.getContext("2d");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
      let playing = false;
      let lastRun = -COOLDOWN_MS;
      let raf = 0;

      const drawNoise = () => {
        if (!context) return;
        const image = context.createImageData(canvas.width, canvas.height);
        const pixels = new Uint32Array(image.data.buffer);
        for (let i = 0; i < pixels.length; i++) {
          const value = 24 + ((Math.random() * 190) | 0);
          pixels[i] = (255 << 24) | (value << 16) | (value << 8) | value;
        }
        context.putImageData(image, 0, 0);
        raf = requestAnimationFrame(drawNoise);
      };

      const play = (onCovered?: () => void) => {
        const now = performance.now();
        if (playing || now - lastRun < COOLDOWN_MS) {
          onCovered?.();
          return;
        }
        playing = true;
        lastRun = now;

        const done = () => {
          cancelAnimationFrame(raf);
          gsap.set(overlay, { autoAlpha: 0 });
          playing = false;
        };

        if (reduced.matches) {
          gsap
            .timeline({ onComplete: done })
            .set(canvas, { autoAlpha: 0 })
            .set(wipe, { autoAlpha: 0 })
            .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.075, ease: "none" })
            .call(() => onCovered?.())
            .to(overlay, { autoAlpha: 0, duration: 0.075, ease: "none" });
          return;
        }

        /* Quarter resolution, capped so a desktop does not fill a huge buffer. */
        canvas.width = Math.min(Math.ceil(window.innerWidth / 4), 360);
        canvas.height = Math.min(Math.ceil(window.innerHeight / 4), 240);
        drawNoise();

        gsap
          .timeline({ onComplete: done })
          .set(overlay, { autoAlpha: 1 })
          .set(canvas, { autoAlpha: 1 })
          .set(wipe, { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" })
          .call(() => onCovered?.(), undefined, 0.06)
          .to(wipe, { clipPath: "inset(0 0% 0 0)", duration: 0.16, ease: "steps(7)" }, 0.12)
          .to(overlay, { autoAlpha: 0, duration: 0.12, ease: "none" }, 0.28);
      };

      const onEvent = (event: Event) => {
        play((event as CustomEvent<{ onCovered?: () => void }>).detail?.onCovered);
      };

      const onClick = (event: MouseEvent) => {
        const link = (event.target as Element | null)?.closest?.("a");
        if (!link) return;

        const cta = link.getAttribute("data-cta");
        if (cta) {
          const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
          gtag?.("event", "click_whatsapp", { cta_location: cta });
        }

        if (!link.hasAttribute("data-channel")) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        const hash = link.getAttribute("href") ?? "";
        const target = hash.startsWith("#") ? document.getElementById(hash.slice(1)) : null;
        if (!target) return;

        event.preventDefault();
        play(() => {
          target.scrollIntoView({ behavior: "instant", block: "start" });
          history.pushState(null, "", hash);
        });
      };

      window.addEventListener(EVENT, onEvent);
      document.addEventListener("click", onClick);

      /* Section entry: the services arrive on a channel change as the hero beat ends. */
      const services = document.getElementById("servicii");
      const trigger = services
        ? ScrollTrigger.create({
            trigger: services,
            start: "top 55%",
            onEnter: () => play(),
          })
        : null;

      return () => {
        window.removeEventListener(EVENT, onEvent);
        document.removeEventListener("click", onClick);
        trigger?.kill();
        cancelAnimationFrame(raf);
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none invisible fixed inset-0 z-40 bg-background opacity-0"
    >
      <canvas ref={noise} className="channel-noise absolute inset-0 h-full w-full" />
      <div ref={bars} className="absolute inset-0 flex">
        {BAR_HEX.map((color) => (
          <span key={color} className="h-full flex-1" style={{ background: color }} />
        ))}
      </div>
    </div>
  );
}
