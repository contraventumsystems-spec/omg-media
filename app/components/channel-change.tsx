"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { BAR_HEX, LIQUID_HEX } from "@/app/lib/bars";
import { HERO_BEAT } from "@/app/lib/hero-rig";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const EVENT = "channel-change";
/** Never more than one burst per screen of scrolling. */
const COOLDOWN_MS = 900;
/** Hero progress past which the cut to the services fires: the signal bars have just covered the frame. */
const SNAP_GATE = HERO_BEAT.wipeEnd + 0.004;
/** Where the cut back up lands: the sets are coming home and the bars have not started to widen. */
const SNAP_BACK = HERO_BEAT.wipeStart - 0.012;
/** Scroll input is held this long around a cut, so momentum cannot carry past the landing. */
const LOCK_S = { cut: 0.75, handoff: 0.56 } as const;

/**
 * burst    the short one, for links and reduced motion
 * cut      the long one, from the services back up into the hero
 * handoff  takes over from the hero's own bars, which already cover the frame
 */
type Kind = "burst" | "cut" | "handoff";

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
  const tears = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const overlay = root.current;
      const canvas = noise.current;
      const wipe = bars.current;
      const lines = tears.current;
      if (!overlay || !canvas || !wipe || !lines) return;
      const bands = Array.from(lines.querySelectorAll<HTMLElement>("[data-tear]"));

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

      /* One jolt of the cut: the bars slip sideways and the dark bands land somewhere new. */
      const jolt = () => {
        gsap.set(wipe, { x: gsap.utils.random(-18, 18, 1), skewX: gsap.utils.random(-2, 2) });
        bands.forEach((band) => {
          gsap.set(band, {
            top: `${gsap.utils.random(0, 96)}%`,
            height: gsap.utils.random(4, 28, 1),
          });
        });
      };

      /* The two cuts use the paint colours of the hero's bars; everything else the seven bars of the brand. */
      const paint = (colors: readonly string[]) => {
        Array.from(wipe.children).forEach((bar, index) => {
          (bar as HTMLElement).style.background = colors[index];
        });
      };

      /**
       * Only the short burst has a cooldown.
       *
       * cut: 0 to 140 ms torn static, 140 to 320 ms the bar wipe, 320 to 520 ms
       * the bars hold and jolt, 520 to 720 ms the whole picture wipes off in seven
       * steps and uncovers the page behind it.
       *
       * handoff: the canvas already shows seven full bars, so this one starts on
       * the same picture with no static and no wipe in. 0 to 300 ms the bars jolt,
       * 300 to 500 ms they wipe off.
       */
      const play = (onCovered?: () => void, kind: Kind = "burst") => {
        const now = performance.now();
        if (playing || (kind === "burst" && now - lastRun < COOLDOWN_MS)) {
          onCovered?.();
          return;
        }
        playing = true;
        lastRun = now;

        const done = () => {
          cancelAnimationFrame(raf);
          gsap.set(overlay, { autoAlpha: 0, clipPath: "none" });
          gsap.set(lines, { autoAlpha: 0 });
          gsap.set(wipe, { x: 0, skewX: 0 });
          paint(BAR_HEX);
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
        canvas.width = Math.max(1, Math.min(Math.ceil(window.innerWidth / 4), 360));
        canvas.height = Math.max(1, Math.min(Math.ceil(window.innerHeight / 4), 240));
        drawNoise();

        if (kind === "handoff") {
          paint(LIQUID_HEX);
          const timeline = gsap
            .timeline({ onComplete: done })
            .set(overlay, { autoAlpha: 1, clipPath: "inset(0 0 0 0%)" })
            .set(canvas, { autoAlpha: 0 })
            .set(lines, { autoAlpha: 1 })
            .set(wipe, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)" })
            .call(() => onCovered?.(), undefined, 0.03)
            .set(wipe, { x: 0, skewX: 0 }, 0.3)
            .set(lines, { autoAlpha: 0 }, 0.3)
            .to(overlay, { clipPath: "inset(0 0 0 100%)", duration: 0.2, ease: "steps(7)" }, 0.3);
          [0.08, 0.15, 0.22].forEach((at) => timeline.call(jolt, undefined, at));
          return;
        }

        if (kind === "cut") {
          paint(LIQUID_HEX);
          const timeline = gsap
            .timeline({ onComplete: done })
            .set(overlay, { autoAlpha: 1, clipPath: "inset(0 0 0 0%)" })
            .set(canvas, { autoAlpha: 1 })
            .set(lines, { autoAlpha: 1 })
            .set(wipe, { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" })
            .call(() => onCovered?.(), undefined, 0.06)
            .to(wipe, { clipPath: "inset(0 0% 0 0)", duration: 0.18, ease: "steps(7)" }, 0.14)
            .set(wipe, { x: 0, skewX: 0 }, 0.52)
            .set(lines, { autoAlpha: 0 }, 0.52)
            .to(overlay, { clipPath: "inset(0 0 0 100%)", duration: 0.2, ease: "steps(7)" }, 0.52);
          [0, 0.07, 0.34, 0.4, 0.46].forEach((at) => timeline.call(jolt, undefined, at));
          return;
        }

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

      const hero = document.getElementById("hero");
      const services = document.getElementById("servicii");
      const media = gsap.matchMedia();

      /* Reduced motion has no hero beat to leave: the services just arrive on the dip. */
      media.add("(prefers-reduced-motion: reduce)", () => {
        if (!services) return;
        ScrollTrigger.create({
          trigger: services,
          start: "top 55%",
          onEnter: () => play(),
        });
      });

      /*
       * The cut between the hero and the services. The hero ends with its signal
       * bars widening until they cover the frame. From there to the services
       * heading lie about 115svh of scroll that have nothing to show. A trigger
       * spans that stretch: entering it from above hands the full bars over to
       * this overlay and jumps to the heading; entering it from below plays the
       * long cut and jumps back to where the sets are still coming home.
       * Either way the stretch itself is never seen.
       */
      media.add("(prefers-reduced-motion: no-preference)", () => {
        if (!hero || !services) return;

        const pageTop = (element: HTMLElement) =>
          element.getBoundingClientRect().top + window.scrollY;
        const travel = () => hero.offsetHeight - window.innerHeight;
        /* Where the upward cut lands. */
        const back = () => Math.floor(pageTop(hero) + travel() * SNAP_BACK);
        /* Where the hero's bars have covered the frame and the downward cut fires. */
        const gate = () => Math.ceil(pageTop(hero) + travel() * SNAP_GATE);
        /* Services top at the viewport top: the heading sits in its sticky place. */
        const landing = () => Math.ceil(pageTop(services));

        let unlock: (() => void) | null = null;

        const cut = (to: () => number, kind: "cut" | "handoff") => {
          if (unlock) return;
          /* Until the static covers the screen the page stays where it is, then at the landing. */
          let target = window.scrollY;
          const hold = () => {
            if (Math.abs(window.scrollY - target) > 1) {
              window.scrollTo({ top: target, behavior: "instant" });
            }
          };
          const block = (event: Event) => event.preventDefault();
          window.addEventListener("scroll", hold);
          window.addEventListener("wheel", block, { passive: false });
          window.addEventListener("touchmove", block, { passive: false });
          const timer = gsap.delayedCall(LOCK_S[kind], () => unlock?.());
          unlock = () => {
            timer.kill();
            window.removeEventListener("scroll", hold);
            window.removeEventListener("wheel", block);
            window.removeEventListener("touchmove", block);
            unlock = null;
          };

          play(() => {
            target = to();
            window.scrollTo({ top: target, behavior: "instant" });
            /* Finish every scrub now, so no beat is still catching up when the static lifts. */
            ScrollTrigger.update();
            ScrollTrigger.getAll().forEach((trigger) => {
              /* Only a numeric scrub has a tween to finish. */
              const tween = trigger.getTween() as gsap.core.Tween | undefined;
              if (typeof tween?.progress === "function") tween.progress(1);
            });
          }, kind);
        };

        ScrollTrigger.create({
          start: gate,
          end: () => landing() - 2,
          /* A jump clean over the stretch (an anchor link, the End key) is left alone. */
          onEnter: (self) => {
            if (self.scroll() < self.end) cut(landing, "handoff");
          },
          onEnterBack: (self) => {
            if (self.scroll() > self.start) cut(back, "cut");
          },
        });

        return () => unlock?.();
      });

      return () => {
        window.removeEventListener(EVENT, onEvent);
        document.removeEventListener("click", onClick);
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
      {/* Only the long cut shows these: scanlines over the picture and three dark bands that tear across it. */}
      <div ref={tears} className="invisible absolute inset-0 opacity-0">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(21,17,13,0.35)_0_2px,transparent_2px_5px)]" />
        {[0, 1, 2].map((index) => (
          <span key={index} data-tear className="absolute inset-x-0 h-3 bg-background" />
        ))}
      </div>
    </div>
  );
}
