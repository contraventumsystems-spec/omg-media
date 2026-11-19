"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type CSSProperties, useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

/**
 * The two design cards of the creative bento, each a small GSAP film:
 *
 *   GraphicDesignBoard  a designer at work on an artboard. The tool rail
 *                       switches tools while the same elements are laid out
 *                       again as a poster, a social post and a banner; a
 *                       selection box hops from element to element.
 *   LogoBuilder         a logo being built: construction grid and circles,
 *                       the symbol drawn and filled, the wordmark, then the
 *                       logo on an app icon, a business card and a sticker.
 *                       Each loop uses the next colourway.
 *
 * Both loop only while on screen and never for reduced motion, where the
 * finished composition stays still. The server renders that finished state.
 */

const INK = "#15110d";
const PAPER = "#f3e9d2";
const PAINT = {
  yellow: "#f8d50e",
  cyan: "#52cbec",
  green: "#53d54b",
  magenta: "#e54bc9",
  red: "#e8401e",
  violet: "#7d4dfe",
};

/** Plays a paused timeline only while its element is on screen. */
function playWhileVisible(el: Element, timeline: gsap.core.Timeline) {
  return ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      if (self.isActive) timeline.play();
      else timeline.pause();
    },
  });
}

/* ================================================================ design */

type Box = { x: number; y: number; width: number; height: number };
type Layout = {
  name: string;
  bg: string;
  img: Box;
  h1: Box;
  h2: Box;
  sub: Box;
  cta: Box & { fill: string };
  badge: { x: number; y: number; scale: number };
};

/** The same seven elements, laid out three ways on one artboard. */
const LAYOUTS: Layout[] = [
  {
    name: "Afiș",
    bg: PAINT.violet,
    img: { x: 46, y: 20, width: 172, height: 62 },
    h1: { x: 46, y: 92, width: 120, height: 11 },
    h2: { x: 46, y: 107, width: 88, height: 11 },
    sub: { x: 46, y: 124, width: 108, height: 4 },
    cta: { x: 46, y: 133, width: 46, height: 12, fill: PAINT.yellow },
    badge: { x: 200, y: 96, scale: 1 },
  },
  {
    name: "Postare social",
    bg: PAINT.magenta,
    img: { x: 36, y: 12, width: 192, height: 136 },
    h1: { x: 48, y: 98, width: 128, height: 12 },
    h2: { x: 48, y: 114, width: 92, height: 12 },
    sub: { x: 48, y: 132, width: 98, height: 4 },
    cta: { x: 168, y: 126, width: 50, height: 14, fill: PAINT.cyan },
    badge: { x: 204, y: 34, scale: 1.15 },
  },
  {
    name: "Banner",
    bg: PAINT.cyan,
    img: { x: 42, y: 18, width: 92, height: 124 },
    h1: { x: 142, y: 34, width: 78, height: 10 },
    h2: { x: 142, y: 48, width: 60, height: 10 },
    sub: { x: 142, y: 66, width: 74, height: 4 },
    cta: { x: 142, y: 118, width: 56, height: 14, fill: PAINT.magenta },
    badge: { x: 132, y: 28, scale: 0.9 },
  },
];

/** Tool rail rows, top to bottom: select, shape, type, pen. */
const TOOL_Y = { select: 14, shape: 38, type: 62, pen: 86 } as const;

const grow = (box: Box, by = 3): Box => ({
  x: box.x - by,
  y: box.y - by,
  width: box.width + by * 2,
  height: box.height + by * 2,
});

export function GraphicDesignBoard() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const one = <T extends Element>(name: string) =>
        el.querySelector<T>(`[data-d="${name}"]`) as T;
      const bg = one<SVGRectElement>("bg");
      const img = one<SVGRectElement>("img");
      const lines = (["h1", "h2", "sub"] as const).map((key) => one<SVGRectElement>(key));
      const cta = one<SVGRectElement>("cta");
      const badge = one<SVGGElement>("badge");
      const tool = one<SVGRectElement>("tool");
      const sel = one<SVGRectElement>("sel");
      const handles = [one<SVGRectElement>("handle-a"), one<SVGRectElement>("handle-b")];
      const cursor = one<SVGGElement>("cursor");
      const guides = Array.from(el.querySelectorAll<SVGPathElement>('[data-d="guide"]'));
      const formats = Array.from(el.querySelectorAll<HTMLElement>("[data-format]"));

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const film = gsap.timeline({ repeat: -1, paused: true });
        const selectBox = (box: Box) => {
          const outline = grow(box);
          return [
            [sel, { attr: outline }],
            [handles[0], { attr: { x: outline.x - 3, y: outline.y - 3 } }],
            [handles[1], { attr: { x: outline.x + outline.width - 3, y: outline.y + outline.height - 3 } }],
            [cursor, { x: outline.x + outline.width + 2, y: outline.y + outline.height + 2 }],
          ] as const;
        };

        LAYOUTS.forEach((_, index) => {
          const next = LAYOUTS[(index + 1) % LAYOUTS.length];
          const t = index * 4;

          /* Guides draw as the new layout is planned. */
          film.fromTo(guides, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.5, stagger: 0.08, ease: "power1.out" }, t);

          /* Shape tool: the background takes a new paint, the image frame moves and resizes. */
          film
            .to(tool, { attr: { y: TOOL_Y.shape }, duration: 0.3, ease: "back.out(2)" }, t)
            .to(bg, { fill: next.bg, duration: 0.5 }, t + 0.1)
            .to(img, { attr: next.img, duration: 0.9, ease: "elastic.out(1, 0.75)" }, t + 0.15);

          /* Type tool: the text lines are typed again in their new places. */
          film.to(tool, { attr: { y: TOOL_Y.type }, duration: 0.3, ease: "back.out(2)" }, t + 0.7);
          lines.forEach((line, l) => {
            const box = next[(["h1", "h2", "sub"] as const)[l]];
            film
              .to(line, { attr: { width: 0 }, duration: 0.15, ease: "power2.in" }, t + 0.75 + l * 0.05)
              .set(line, { attr: { x: box.x, y: box.y, height: box.height } }, t + 0.92)
              .to(line, { attr: { width: box.width }, duration: 0.45, ease: "steps(8)" }, t + 0.95 + l * 0.12);
          });

          /* Pen tool: the sticker spins in and the button slides to its spot. */
          film
            .to(tool, { attr: { y: TOOL_Y.pen }, duration: 0.3, ease: "back.out(2)" }, t + 1.45)
            .to(badge, { scale: 0, rotation: -120, svgOrigin: "0 0", duration: 0.2, ease: "power2.in" }, t + 1.5)
            .set(badge, { x: next.badge.x, y: next.badge.y }, t + 1.7)
            .to(badge, { scale: next.badge.scale, rotation: 0, svgOrigin: "0 0", duration: 0.7, ease: "elastic.out(1, 0.45)" }, t + 1.72)
            .to(cta, { attr: { x: next.cta.x, y: next.cta.y, width: next.cta.width, height: next.cta.height }, fill: next.cta.fill, duration: 0.6, ease: "back.out(1.8)" }, t + 1.55);

          /* Select tool: the selection hops from the image to the headline to the button. */
          film
            .to(tool, { attr: { y: TOOL_Y.select }, duration: 0.3, ease: "back.out(2)" }, t + 2.2)
            .to(guides, { opacity: 0, duration: 0.3 }, t + 2.2)
            .set([sel, ...handles], { opacity: 1 }, t + 2.25);
          [next.img, next.h1, next.cta].forEach((box, hop) => {
            selectBox(box).forEach(([target, vars]) => {
              film.to(target, { ...vars, duration: 0.32, ease: "power3.inOut" }, t + 2.25 + hop * 0.5);
            });
          });
          film
            .to([sel, ...handles], { opacity: 0, duration: 0.2 }, t + 3.7)
            .set(guides, { opacity: 0.55 }, t + 3.95)
            .call(() => {
              formats.forEach((chip) => {
                chip.dataset.active = String(chip.dataset.format === next.name);
              });
            }, [], t + 1);
        });

        const watch = playWhileVisible(el, film);
        return () => {
          watch.kill();
          film.kill();
        };
      });
    },
    { scope: root },
  );

  const first = LAYOUTS[0];
  return (
    <div ref={root} className="flex flex-col gap-3">
      <div className="rounded-2xl border border-eggshell/10 bg-[#120e0b] p-2">
        <svg viewBox="0 0 240 160" role="img" aria-label="Ilustrație: o planșă de design care se rearanjează ca afiș, postare și banner" className="block h-auto w-full">
          {/* Tool rail. */}
          <rect x="2" y="8" width="22" height="104" rx="6" fill="#1d1813" stroke={INK} strokeWidth="2" />
          <rect data-d="tool" x="4" y={TOOL_Y.select} width="18" height="18" rx="4" fill={PAINT.yellow} />
          <path d="M9 18 L9 28 L12 25 L15 31 L17 30 L14 24 L18 24Z" fill={PAPER} stroke={INK} strokeWidth="1" />
          <rect x="8" y="42" width="10" height="10" rx="2" fill="none" stroke={PAPER} strokeWidth="1.8" />
          <path d="M8 66 H18 M13 66 V77" stroke={PAPER} strokeWidth="2" strokeLinecap="round" />
          <path d="M9 100 L16 90 L18 92 L11 102Z M9 100 L8 103 L11 102" fill={PAPER} stroke={PAPER} strokeWidth="1" strokeLinejoin="round" />

          {/* Artboard. */}
          <rect x="34" y="10" width="196" height="140" rx="3" fill={INK} opacity="0.5" transform="translate(3 3)" />
          <rect data-d="bg" x="36" y="12" width="192" height="136" fill={first.bg} />
          <defs>
            <linearGradient id="board-sunset" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={PAINT.yellow} />
              <stop offset="0.55" stopColor={PAINT.red} />
              <stop offset="1" stopColor={PAINT.violet} />
            </linearGradient>
          </defs>
          <rect data-d="img" {...first.img} rx="3" fill="url(#board-sunset)" stroke={INK} strokeWidth="2" />
          <rect data-d="h1" {...first.h1} rx="2" fill={INK} />
          <rect data-d="h2" {...first.h2} rx="2" fill={INK} />
          <rect data-d="sub" {...first.sub} rx="1" fill={PAPER} opacity="0.85" />
          <rect data-d="cta" {...first.cta} rx="6" fill={first.cta.fill} stroke={INK} strokeWidth="2" />
          <g data-d="badge" transform={`translate(${first.badge.x} ${first.badge.y})`}>
            <path d="M0 -15 l4 6 7 -2 -1 7 6 4 -6 4 1 7 -7 -2 -4 6 -4 -6 -7 2 1 -7 -6 -4 6 -4 -1 -7 7 2Z" fill={PAINT.yellow} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            <text y="3" textAnchor="middle" fontSize="7" fontWeight="800" fill={INK}>NOU</text>
          </g>

          {/* Guides, selection and cursor. */}
          <path data-d="guide" d="M132 12 V148" stroke={PAINT.cyan} strokeWidth="0.8" opacity="0.55" />
          <path data-d="guide" d="M36 80 H228" stroke={PAINT.cyan} strokeWidth="0.8" opacity="0.55" />
          <path data-d="guide" d="M46 12 V148" stroke={PAINT.cyan} strokeWidth="0.8" opacity="0.55" />
          <rect data-d="sel" {...grow(first.img)} fill="none" stroke={PAINT.cyan} strokeWidth="1.5" strokeDasharray="3 2" opacity="0" />
          <rect data-d="handle-a" x={grow(first.img).x - 3} y={grow(first.img).y - 3} width="6" height="6" fill={PAPER} stroke={PAINT.cyan} strokeWidth="1.5" opacity="0" />
          <rect data-d="handle-b" x={grow(first.img).x + grow(first.img).width - 3} y={grow(first.img).y + grow(first.img).height - 3} width="6" height="6" fill={PAPER} stroke={PAINT.cyan} strokeWidth="1.5" opacity="0" />
          <g data-d="cursor" transform="translate(196 96)">
            <path d="M0 0 L0 13 L3.5 10 L6.5 16 L9 15 L6 9 L10.5 9Z" fill={PAPER} stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
      {/* Which format is on the artboard. */}
      <p className="flex flex-wrap gap-1.5" aria-hidden="true">
        {LAYOUTS.map((layout, index) => (
          <span
            key={layout.name}
            data-format={layout.name}
            data-active={index === 0}
            className="rounded-full border border-eggshell/10 px-2.5 py-0.5 text-[11px] text-dim motion-safe:transition-colors motion-safe:duration-300 data-[active=true]:border-flux-violet/60 data-[active=true]:bg-flux-violet/15 data-[active=true]:text-eggshell"
          >
            {layout.name}
          </span>
        ))}
      </p>
    </div>
  );
}

/* ================================================================== logo */

const COLORWAYS = [PAINT.yellow, PAINT.cyan, PAINT.magenta] as const;
const WORDMARK = "marca ta";
const LOGO_STEPS = ["Construcție", "Simbol", "Aplicații"] as const;

/** The sample symbol: an eye in a ring, built from two overlapping circles. */
const LENS = "M60 34 A30 30 0 0 1 60 86 A30 30 0 0 1 60 34Z";

function MiniMark({ fill = "var(--mark)", ink = INK, className }: { fill?: string; ink?: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
      <circle cx="60" cy="60" r="44" fill="none" stroke={ink} strokeWidth="8" />
      <g transform="rotate(45 60 60)">
        <path d={LENS} fill={fill} stroke={ink} strokeWidth="7" strokeLinejoin="round" />
      </g>
      <circle cx="60" cy="60" r="8" fill={ink} />
    </svg>
  );
}

export function LogoBuilder() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const all = <T extends Element>(name: string) =>
        Array.from(el.querySelectorAll<T>(`[data-l="${name}"]`));
      const grid = all<SVGPathElement>("grid");
      const circles = all<SVGCircleElement>("construct");
      const ring = all<SVGCircleElement>("ring");
      const lens = all<SVGPathElement>("lens");
      const dot = all<SVGCircleElement>("dot");
      const letters = all<HTMLElement>("letter");
      const apps = all<HTMLElement>("app");
      const steps = all<HTMLElement>("step");
      const step = (index: number) => () => {
        steps.forEach((chip, s) => {
          chip.dataset.active = String(s === index);
        });
      };

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        let colourway = 0;
        const film = gsap.timeline({
          repeat: -1,
          repeatDelay: 0.3,
          paused: true,
          onRepeat: () => {
            colourway = (colourway + 1) % COLORWAYS.length;
            gsap.to(el, { "--mark": COLORWAYS[colourway], duration: 0.4 });
          },
        });

        film
          /* Construction: grid, then the two circles the symbol is cut from. */
          .call(step(0), [], 0)
          .fromTo(grid, { drawSVG: "0%", opacity: 0.5 }, { drawSVG: "100%", duration: 0.6, stagger: 0.08, ease: "power1.inOut" }, 0)
          .fromTo(circles, { drawSVG: "0%", opacity: 0.8 }, { drawSVG: "100%", duration: 0.8, stagger: 0.15, ease: "power2.inOut" }, 0.3)
          /* Symbol: ring and lens are inked, filled, and the dot lands. */
          .call(step(1), [], 1.1)
          .fromTo(ring, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.6, ease: "power2.inOut" }, 1.1)
          .fromTo(lens, { drawSVG: "0%", fillOpacity: 0 }, { drawSVG: "100%", duration: 0.7, ease: "power2.inOut" }, 1.25)
          .to(lens, { fillOpacity: 1, duration: 0.3 }, 1.9)
          .fromTo(dot, { scale: 0 }, { scale: 1, svgOrigin: "60 60", duration: 0.6, ease: "elastic.out(1, 0.45)" }, 2.05)
          .to([...grid, ...circles], { opacity: 0.12, duration: 0.5 }, 2.2)
          .fromTo(letters, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "back.out(2.6)", stagger: 0.05 }, 2.25)
          /* Applications: the logo on an icon, a card and a sticker. */
          .call(step(2), [], 3)
          .fromTo(apps, { y: 26, opacity: 0, scale: 0.8, rotation: (index: number) => [-6, 4, -3][index] }, { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.14 }, 3)
          /* Clear the board for the next colourway. */
          .to([...apps, ...letters], { opacity: 0, y: 8, duration: 0.3, stagger: 0.02 }, 5.3)
          .to(lens, { fillOpacity: 0, duration: 0.3 }, 5.4)
          .to([...ring, ...lens], { drawSVG: "0%", duration: 0.4 }, 5.5)
          .to(dot, { scale: 0, svgOrigin: "60 60", duration: 0.25 }, 5.5)
          .to([...grid, ...circles], { drawSVG: "0%", opacity: 0.5, duration: 0.4 }, 5.6);

        const watch = playWhileVisible(el, film);
        return () => {
          watch.kill();
          film.kill();
          gsap.set(el, { "--mark": COLORWAYS[0] });
        };
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col gap-3" style={{ "--mark": COLORWAYS[0] } as CSSProperties}>
      <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-2xl border border-eggshell/10 bg-[#120e0b] p-3">
        <svg viewBox="0 0 120 120" role="img" aria-label="Ilustrație: construcția unui logo, de la grilă la simbol" className="size-24 sm:size-28">
          <g stroke={PAINT.cyan} strokeWidth="0.8" fill="none">
            <path opacity="0.12" data-l="grid" d="M16 16 H104 V104 H16Z" />
            <path opacity="0.12" data-l="grid" d="M16 16 L104 104 M104 16 L16 104" />
            <path opacity="0.12" data-l="grid" d="M60 10 V110 M10 60 H110" />
            <g transform="rotate(45 60 60)">
              <circle opacity="0.12" data-l="construct" cx="45" cy="60" r="30" />
              <circle opacity="0.12" data-l="construct" cx="75" cy="60" r="30" />
            </g>
          </g>
          <circle data-l="ring" cx="60" cy="60" r="44" fill="none" stroke={PAPER} strokeWidth="6" />
          <g transform="rotate(45 60 60)">
            <path data-l="lens" d={LENS} fill="var(--mark)" stroke={PAPER} strokeWidth="5" strokeLinejoin="round" />
          </g>
          <circle data-l="dot" cx="60" cy="60" r="8" fill={PAPER} />
        </svg>
        <div className="min-w-0">
          <p className="font-display text-2xl leading-none font-bold tracking-[-0.03em] text-eggshell sm:text-3xl" aria-label={WORDMARK}>
            {WORDMARK.split("").map((char, index) => (
              <span key={`${char}-${index}`} data-l="letter" aria-hidden="true" className="inline-block whitespace-pre">
                {char}
              </span>
            ))}
          </p>
          <p className="font-mono mt-1.5 text-[10px] tracking-[0.14em] text-dim uppercase">Simbol · culori · variante</p>
        </div>
      </div>

      {/* The logo at work: app icon, business card, sticker. */}
      <div className="grid grid-cols-3 gap-2" aria-hidden="true">
        <div data-l="app" className="grid aspect-square place-items-center rounded-2xl border-2 border-[#15110d] bg-(--mark)">
          <MiniMark fill={PAPER} className="size-3/5" />
        </div>
        <div data-l="app" className="flex aspect-square flex-col justify-between rounded-lg border-2 border-[#15110d] bg-eggshell p-2">
          <MiniMark className="size-6" />
          <span className="space-y-1">
            <span className="block h-1.5 w-4/5 rounded-full bg-[#15110d]" />
            <span className="block h-1 w-3/5 rounded-full bg-[#15110d]/40" />
          </span>
        </div>
        <div data-l="app" className="grid aspect-square place-items-center rounded-full border-2 border-[#15110d] bg-[#15110d] shadow-[3px_3px_0_var(--mark)]">
          <MiniMark ink={PAPER} className="size-3/5" />
        </div>
      </div>

      {/* Where the build is. */}
      <p className="flex flex-wrap gap-1.5" aria-hidden="true">
        {LOGO_STEPS.map((label, index) => (
          <span
            key={label}
            data-l="step"
            data-active={index === LOGO_STEPS.length - 1}
            className="rounded-full border border-eggshell/10 px-2.5 py-0.5 text-[11px] text-dim motion-safe:transition-colors motion-safe:duration-300 data-[active=true]:border-flux-yellow/60 data-[active=true]:bg-flux-yellow/15 data-[active=true]:text-eggshell"
          >
            {label}
          </span>
        ))}
      </p>
    </div>
  );
}
