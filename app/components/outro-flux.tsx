"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { FLUX_BARS } from "@/app/components/flow-bento";
import { PopText } from "@/app/components/services-story";
import { bentoHeadingPop } from "@/app/lib/bento-motion";
import { cn } from "@/lib/utils";
import { useDict } from "@/app/i18n/locale-provider";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

/**
 * The outro, "Pe ce te poți baza": the whole homepage in one picture.
 *
 * The three pillar televisions sit side by side with cartoon faces on their
 * screens. Each pours its colour down, and the three streams braid into one
 * serpent: three strands in the TVs' colours that snake from commitment to
 * commitment, led by a pie-eyed snake head. It ends in a "1 flux" seal.
 *
 *   enter     the sets drop in, power on and pour into the serpent's start
 *   scroll    one smoothed scrub draws the serpent and moves the head along it.
 *             When the head reaches a card's node (measured along the path,
 *             not guessed), the card is projected: a comic burst and a beam
 *             from the node, a hologram flicker with glitch slices, RGB split
 *             and a scan sweep, then it locks solid with a cartoon squash and
 *             stretch. Scrolling back plays it in reverse.
 *   on screen the faces blink, the streams flow, the tongue flicks and Tedy
 *             waves (CSS loops, paused off screen)
 *
 * The serpent's path is computed from where the nodes actually are, and is
 * rebuilt when the layout changes. Phones: one column, the serpent swings
 * through the wide gaps between cards. From md the cards zigzag around it.
 * No pin. Reduced motion: the serpent is drawn whole and every card is shown.
 */

const INK = "#15110d";
const PAPER = "#f3e9d2";
const SVG_NS = "http://www.w3.org/2000/svg";

/** The three TVs, and so the three strands, in this order: left, middle, right. */
const SETS = [
  { name: "Strategie", color: "#52cbec" },
  { name: "Tehnologie", color: "#53d54b" },
  { name: "Design", color: "#e54bc9" },
] as const;
const TV_COLORS = SETS.map((set) => set.color);

type Commitment = { title: string; body: string; founder?: boolean };

/* The five commitments are in the dictionary (how.outro.commitments); the last one is the founder's. */
const FOUNDER_INDEX = 4;

/** Each card takes a TV's colour, in turn. */
const accentOf = (index: number) => TV_COLORS[index % TV_COLORS.length];

/* "Garantăm / un singur flux / de lucru, indiferent de câte servicii ai nevoie.": copy in how.outro.heading. */

/* The TV row and its streams share one 300px drawing, so the units are pixels. */
const ROW = 300;
const MERGE_H = 120;
/** Gap between the strands where they meet. */
const STRAND_GAP = 4;
const STREAMS = SETS.map((set, index) => {
  const from = 50 + index * 100;
  const to = ROW / 2 + (index - 1) * STRAND_GAP;
  return {
    color: set.color,
    d: `M${from} 0 C${from} ${MERGE_H * 0.45} ${to} ${MERGE_H * 0.5} ${to} ${MERGE_H}`,
  };
});

/* ------------------------------------------------------------------ art */

/** A cartoon set: rounded cabinet, antenna, a pie-eyed face on a screen in the pillar colour. */
function CartoonTv({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 90 92" className="h-auto w-full overflow-visible" aria-hidden="true">
      <g data-o="antenna">
        <path d="M45 22 L30 4 M45 22 L62 6" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="30" cy="4" r="3" fill={color} stroke={INK} strokeWidth="1.5" />
        <circle cx="62" cy="6" r="3" fill={color} stroke={INK} strokeWidth="1.5" />
      </g>
      <rect x="4" y="20" width="82" height="62" rx="14" fill="#2b241c" stroke={INK} strokeWidth="3" />
      <g data-o="screen">
        <rect x="11" y="27" width="54" height="48" rx="9" fill={color} stroke={INK} strokeWidth="2.5" />
        <g data-o="eyes" style={{ transformOrigin: "38px 47px" }}>
          <ellipse cx="30" cy="47" rx="4" ry="6.5" fill={INK} />
          <ellipse cx="46" cy="47" rx="4" ry="6.5" fill={INK} />
          <path d="M30 47 L33 42 L34 45Z M46 47 L49 42 L50 45Z" fill={PAPER} />
        </g>
        <path d="M30 60 Q38 67 46 60" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        <rect x="11" y="27" width="54" height="48" rx="9" fill="url(#outro-scan)" opacity="0.35" />
      </g>
      <circle cx="75" cy="38" r="4.5" fill={PAPER} stroke={INK} strokeWidth="2" />
      <circle cx="75" cy="52" r="4.5" fill={PAPER} stroke={INK} strokeWidth="2" />
      <rect x="70" y="62" width="10" height="8" rx="2" fill={color} stroke={INK} strokeWidth="1.5" />
      <path d="M18 82 L14 90 M72 82 L76 90" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Tedy, pie-eyed, waving, on a disc of the three TV colours. */
function FounderArt() {
  return (
    <svg viewBox="0 0 80 80" className="size-full" aria-hidden="true">
      <defs>
        <clipPath id="founder-disc">
          <circle cx="40" cy="40" r="38" />
        </clipPath>
      </defs>
      <g clipPath="url(#founder-disc)">
        <rect width="27" height="80" fill={TV_COLORS[0]} />
        <rect x="27" width="26" height="80" fill={TV_COLORS[1]} />
        <rect x="53" width="27" height="80" fill={TV_COLORS[2]} />
      </g>
      <circle cx="40" cy="40" r="38" fill="none" stroke={INK} strokeWidth="3" />
      <path d="M12 80 C14 60 26 54 40 54 C54 54 66 60 68 80Z" fill="#2b241c" stroke={INK} strokeWidth="3" />
      <ellipse cx="40" cy="36" rx="16" ry="17" fill={PAPER} stroke={INK} strokeWidth="3" />
      <path d="M24 34 C22 18 34 14 42 16 C52 14 58 24 56 34 C52 26 46 23 40 25 C34 23 28 27 24 34Z" fill={INK} />
      <ellipse cx="34" cy="38" rx="3" ry="4.5" fill={INK} />
      <ellipse cx="46" cy="38" rx="3" ry="4.5" fill={INK} />
      <path d="M34 47 Q40 52 46 47" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <g data-o="wave" style={{ transformOrigin: "66px 64px" }}>
        <path d="M66 64 L72 46" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <circle cx="72.5" cy="43.5" r="5.5" fill="#fff" stroke={INK} strokeWidth="2.5" />
      </g>
    </svg>
  );
}

/** The serpent's head, drawn facing +x around the origin so autoRotate points it along the path. */
function SerpentHead() {
  return (
    <g data-o="head">
      <g transform="translate(-16 -13)">
        <path data-o="tongue" d="M30 13 H42 M42 13 L46 9 M42 13 L46 17" stroke="#e8401e" strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ transformOrigin: "30px 13px" }} />
        <path d="M0 13 C0 4 8 0 18 1 C28 2 34 7 34 13 C34 19 28 24 18 25 C8 26 0 22 0 13Z" fill={PAPER} stroke={INK} strokeWidth="3" />
        <path d="M5 4 C4 10 4 16 5 22" stroke={TV_COLORS[0]} strokeWidth="3.5" fill="none" />
        <path d="M10 2.5 C9 10 9 16 10 23.5" stroke={TV_COLORS[1]} strokeWidth="3.5" fill="none" />
        <path d="M15 1.8 C14 10 14 16 15 24.2" stroke={TV_COLORS[2]} strokeWidth="3.5" fill="none" />
        <ellipse cx="24" cy="8" rx="3.2" ry="4.2" fill={INK} />
        <ellipse cx="24" cy="18" rx="3.2" ry="4.2" fill={INK} />
        <path d="M24 8 L26 4.5 L27 7Z M24 18 L26 14.5 L27 17Z" fill={PAPER} />
      </g>
    </g>
  );
}

/** Cartoon "pop" lines around a node. */
function Burst({ color }: { color: string }) {
  return (
    <svg data-o="burst" viewBox="-40 -40 80 80" className="pointer-events-none absolute top-[calc(50%-40px)] left-[calc(50%-40px)] size-20 overflow-visible" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const x1 = Math.cos(angle) * 18;
        const y1 = Math.sin(angle) * 18;
        const x2 = Math.cos(angle) * 30;
        const y2 = Math.sin(angle) * 30;
        return (
          <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke={index % 2 ? color : PAPER} strokeWidth="3.5" strokeLinecap="round" />
        );
      })}
    </svg>
  );
}

/* --------------------------------------------------------------- section */

export function OutroFlux() {
  const t = useDict().how.outro;
  const commitments: Commitment[] = t.commitments.map((item, index) => ({ ...item, founder: index === FOUNDER_INDEX }));
  const headingLead = t.heading.lead.split(" ");
  const headingFlux = t.heading.flux.split(" ");
  const headingTail = t.heading.tail.split(" ");
  const root = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);

  /* The loops (blink, flow, tongue, wave) run only while the section is on screen. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setLive(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const road = section.querySelector<HTMLElement>("[data-o='road']");
      const svg = section.querySelector<SVGSVGElement>("[data-o='serpent']");
      const head = section.querySelector<SVGGElement>("[data-o='head']");
      const seal = section.querySelector<HTMLElement>("[data-o='seal']");
      if (!road || !svg || !head || !seal) return;
      const strands = Array.from(svg.querySelectorAll<SVGPathElement>("[data-o='strand']"));
      const beads = gsap.utils.toArray<HTMLElement>("[data-o='bead']", section);
      bentoHeadingPop(section);

      /* Where along the serpent each node sits, as a share of its length. */
      let thresholds: number[] = beads.map((_, index) => (index + 1) / (beads.length + 1));

      /*
       * The serpent. Between two nodes it makes one wide bend to the side,
       * alternating, through a waypoint, with vertical tangents everywhere, so
       * the bends join smoothly into a snake.
       *   phones   the cards fill the width, so the serpent drops straight down
       *            behind a card and makes its bend in the open gap under it
       *   from md  the cards zigzag; each bend swings to the empty side, away
       *            from the card it has just left
       * Each strand bends a little wider than the one before, so the three part
       * in the curves and meet at the nodes, like a braid.
       */
      const build = () => {
        const box = road.getBoundingClientRect();
        const width = box.width;
        const height = box.height;
        const centre = width / 2;
        const wide = window.matchMedia("(min-width: 768px)").matches;
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.setAttribute("width", String(width));
        svg.setAttribute("height", String(height));
        const nodes = beads.map((bead) => {
          const node = bead.querySelector("[data-o='node']")?.getBoundingClientRect();
          return node
            ? { x: node.left + node.width / 2 - box.left, y: node.top + node.height / 2 - box.top }
            : { x: centre, y: 0 };
        });
        const bottoms = beads.map((bead) => {
          const card = bead.querySelector("[data-o='card']")?.getBoundingClientRect();
          return card ? card.bottom - box.top : 0;
        });
        const swing = wide ? Math.min(width * 0.3, 230) : width * 0.38;

        /** The strand's path, stopping at node `limit` when given. */
        const pathFor = (strand: number, limit = Infinity) => {
          const offset = (strand - 1) * STRAND_GAP;
          const spread = (strand - 1) * 14;
          let x = centre + offset;
          let y = 0;
          let d = `M${x} ${y}`;
          const curveTo = (toX: number, toY: number) => {
            const rise = toY - y;
            d += ` C${x} ${y + rise * 0.45} ${toX} ${toY - rise * 0.45} ${toX} ${toY}`;
            x = toX;
            y = toY;
          };
          for (let stop = 0; stop <= nodes.length; stop += 1) {
            const target = stop < nodes.length ? nodes[stop] : { x: centre, y: height };
            /* Phones: straight down behind the card above, into the gap. */
            if (!wide && stop > 0) curveTo(centre + offset, bottoms[stop - 1]);
            const side = stop === 0 ? -1 : (stop - 1) % 2 === 0 ? 1 : -1;
            curveTo(centre + offset + side * (swing + spread), (y + target.y) / 2);
            curveTo(target.x + offset, target.y);
            if (stop + 1 === limit) break;
          }
          return d;
        };
        strands.forEach((strand, index) => strand.setAttribute("d", pathFor(index)));

        /* Measure the middle strand up to each node. */
        const probe = document.createElementNS(SVG_NS, "path");
        svg.appendChild(probe);
        probe.setAttribute("d", pathFor(1));
        const total = probe.getTotalLength() || 1;
        thresholds = nodes.map((_, index) => {
          probe.setAttribute("d", pathFor(1, index + 1));
          return probe.getTotalLength() / total;
        });
        probe.remove();
      };
      build();

      /* Rebuild when the layout moves (fonts, resize, a card wrapping differently). */
      let frame = 0;
      const observer = new ResizeObserver(() => {
        window.clearTimeout(frame);
        frame = window.setTimeout(() => {
          build();
          ScrollTrigger.refresh();
        }, 120);
      });
      observer.observe(road);

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const q = <T extends Element>(selector: string) => gsap.utils.toArray<T>(selector, section);
        const sets = q<HTMLElement>("[data-o='set']");
        const screens = q<SVGGElement>("[data-o='screen']");
        const antennas = q<SVGGElement>("[data-o='antenna']");
        const streams = q<SVGPathElement>("[data-o='stream']");

        /* The three sets drop in, power on, and pour into the serpent. */
        gsap
          .timeline({ scrollTrigger: { trigger: sets[0], start: "top 80%", once: true } })
          .from(sets, { y: -70, rotation: (index: number) => [-12, 4, 12][index], opacity: 0, duration: 0.8, ease: "bounce.out", stagger: 0.12 })
          .from(screens, { scaleY: 0.04, scaleX: 0.6, transformOrigin: "50% 50%", duration: 0.35, ease: "power4.out", stagger: 0.12 }, 0.5)
          .to(antennas, { transformOrigin: "50% 100%", keyframes: [{ rotation: -10, duration: 0.12 }, { rotation: 8, duration: 0.12 }, { rotation: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" }], stagger: 0.1 }, 0.7)
          .fromTo(streams, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.7, ease: "power2.in", stagger: 0.1 }, 0.9);

        /* Each card's projection, played when the head reaches its node. */
        const projections = beads.map((bead) => {
          const node = bead.querySelector("[data-o='node']");
          const burst = bead.querySelector("[data-o='burst']");
          const beam = bead.querySelector("[data-o='beam']");
          const card = bead.querySelector<HTMLElement>("[data-o='card']");
          const scan = bead.querySelector("[data-o='scan']");
          const lines = bead.querySelectorAll("[data-o='line']");
          const projection = gsap.timeline({ paused: true });
          if (!card) return projection;
          projection
            /* The node lights, a comic burst, and the projector beam opens. */
            .fromTo(node, { scale: 0 }, { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.4)" }, 0)
            .fromTo(burst, { scale: 0.3, opacity: 1 }, { scale: 1.5, opacity: 0, duration: 0.55, ease: "power2.out" }, 0.05)
            .fromTo(beam, { scaleY: 0, opacity: 0 }, { scaleY: 1, opacity: 1, transformOrigin: "50% 0%", duration: 0.22, ease: "power2.out" }, 0.1)
            /* Hologram: it flickers in through glitch slices, split into cyan and magenta. */
            .fromTo(
              card,
              {
                autoAlpha: 0,
                clipPath: "inset(48% 0% 48% 0%)",
                filter: `drop-shadow(-7px 0 ${TV_COLORS[0]}) drop-shadow(7px 0 ${TV_COLORS[2]}) brightness(1.7)`,
              },
              {
                keyframes: [
                  { autoAlpha: 0.75, clipPath: "inset(18% 0% 58% 0%)", duration: 0.07 },
                  { autoAlpha: 0.25, clipPath: "inset(62% 0% 12% 0%)", duration: 0.06 },
                  { autoAlpha: 0.9, clipPath: "inset(6% 0% 34% 0%)", duration: 0.07 },
                  { autoAlpha: 0.5, clipPath: "inset(30% 0% 0% 0%)", duration: 0.05 },
                  { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.12 },
                ],
              },
              0.2,
            )
            .fromTo(scan, { yPercent: -110, opacity: 1 }, { yPercent: 110, opacity: 0.2, duration: 0.55, ease: "power1.in" }, 0.3)
            .to(card, { filter: `drop-shadow(0px 0 ${TV_COLORS[0]}) drop-shadow(0px 0 ${TV_COLORS[2]}) brightness(1)`, duration: 0.35, ease: "power2.out" }, 0.55)
            /* Then it lands like a cartoon: stretch, squash, wobble. */
            .fromTo(
              card,
              { scaleX: 1, scaleY: 1 },
              {
                transformOrigin: "50% 100%",
                keyframes: [
                  { scaleY: 1.12, scaleX: 0.94, duration: 0.12, ease: "power2.out" },
                  { scaleY: 0.9, scaleX: 1.06, duration: 0.1, ease: "power2.in" },
                  { scaleY: 1, scaleX: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" },
                ],
              },
              0.55,
            )
            .fromTo(lines, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "back.out(2)", stagger: 0.06 }, 0.62)
            .to(beam, { opacity: 0, duration: 0.45 }, 0.75)
            .set(card, { filter: "none" }, 1.1);
          return projection;
        });

        const sealIn = gsap
          .timeline({ paused: true })
          .fromTo(seal.querySelector("[data-o='badge']"), { scale: 0, rotation: -200 }, { scale: 1, rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" })
          .fromTo(seal.querySelectorAll("[data-o='payoff']"), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 }, 0.3);

        const shown = beads.map(() => false);
        let sealShown = false;
        /* Read the drawn progress, so cards fire when the head is really there. */
        const sync = (progress: number) => {
          thresholds.forEach((threshold, index) => {
            const on = progress >= threshold - 0.004;
            if (on === shown[index]) return;
            shown[index] = on;
            if (on) projections[index].play();
            else projections[index].reverse();
          });
          const sealOn = progress >= 0.985;
          if (sealOn !== sealShown) {
            sealShown = sealOn;
            if (sealOn) sealIn.play();
            else sealIn.reverse();
          }
        };

        /* The serpent: drawn and led by its head, smoothed over the scroll. */
        const serpent = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: () => sync(serpent.progress()),
          scrollTrigger: {
            trigger: road,
            start: "top 62%",
            end: "bottom 62%",
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        serpent
          .fromTo(strands, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1 }, 0)
          .fromTo(head, { opacity: 0 }, { opacity: 1, duration: 0.02 }, 0)
          .to(head, {
            motionPath: { path: strands[1], align: strands[1], alignOrigin: [0.5, 0.5], autoRotate: true },
            duration: 1,
          }, 0);
      });

      media.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(head, { opacity: 0 });
      });

      return () => {
        observer.disconnect();
        window.clearTimeout(frame);
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="pe-ce-te-bazezi"
      aria-labelledby="outro-title"
      data-live={live || undefined}
      className="outro overflow-hidden bg-background px-4 py-24 sm:px-5 md:px-10 md:py-32"
    >
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <pattern id="outro-scan" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="2" fill="#000" />
          </pattern>
        </defs>
      </svg>

      <div className="mx-auto w-full max-w-5xl">
        <header className="mx-auto max-w-3xl text-center">
          <p data-bento-lead className="type-index text-dim">
            {t.index}
          </p>
          <h2
            id="outro-title"
            data-bento-heading
            className="type-h2 mt-2 text-balance text-eggshell"
          >
            {headingLead.map((word, index) => (
              <span key={`l-${index}`}>
                <PopText text={word} />{" "}
              </span>
            ))}
            <span className="relative inline-block whitespace-nowrap">
              {headingFlux.map((word, index) => (
                <span key={`f-${index}`}>
                  <PopText text={word} />
                  {index < headingFlux.length - 1 ? " " : null}
                </span>
              ))}
              <span data-bento-bars aria-hidden="true" className="absolute inset-x-0 -bottom-[0.12em] flex h-[0.11em] origin-left">
                {FLUX_BARS.map((color) => (
                  <span key={color} className={`h-full flex-1 ${color}`} />
                ))}
              </span>
            </span>{" "}
            {headingTail.map((word, index) => (
              <span key={`t-${index}`}>
                <PopText text={word} />{" "}
              </span>
            ))}
          </h2>
          <p data-bento-lead className="type-lead mx-auto mt-4 text-platinum">
            {t.lead}
          </p>
        </header>

        {/* The three ways: the pillar sets, then their streams running into the serpent. */}
        <div className="mx-auto mt-6 w-[300px] md:mt-8" aria-hidden="true">
          <div className="grid grid-cols-3 gap-[10px]">
            {SETS.map((set, index) => (
              <div key={set.name} data-o="set" className="flex flex-col items-center gap-1.5">
                <div className="w-[86px]">
                  <CartoonTv color={set.color} />
                </div>
                <span className="font-mono text-[10px] font-bold tracking-[0.14em] uppercase" style={{ color: set.color }}>
                  {t.sets[index]}
                </span>
              </div>
            ))}
          </div>
          <svg viewBox={`0 0 ${ROW} ${MERGE_H}`} width={ROW} height={MERGE_H} className="block overflow-visible">
            {STREAMS.map((stream) => (
              <g key={stream.color}>
                <path data-o="stream" d={stream.d} fill="none" stroke={stream.color} strokeWidth="5" strokeLinecap="round" />
                <path className="outro-flow" d={stream.d} fill="none" stroke={PAPER} strokeWidth="2" strokeDasharray="2 14" opacity="0.55" />
              </g>
            ))}
          </svg>
        </div>

        {/* The single flux: a serpent through five commitments. */}
        <ol data-o="road" className="relative mx-auto flex max-w-3xl flex-col gap-36 pt-28 pb-28 md:gap-32">
          <svg data-o="serpent" aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
            {TV_COLORS.map((color) => (
              <path key={color} data-o="strand" d="M0 0" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
            ))}
            <SerpentHead />
          </svg>

          {commitments.map((item, index) => {
            const accent = accentOf(index);
            return (
              <li
                key={item.title}
                data-o="bead"
                className={cn(
                  "relative flex flex-col items-center md:items-start",
                  index % 2 === 1 && "md:items-end",
                  item.founder && "md:items-center",
                )}
              >
                {/* The node: where the serpent touches, and the projector. */}
                <span
                  data-o="node"
                  aria-hidden="true"
                  className="relative z-20 mb-4 grid size-7 place-items-center rounded-full border-[3px] border-[#15110d] bg-eggshell shadow-[0_0_0_4px_rgb(21_17_13)] md:absolute md:top-[-14px] md:left-[calc(50%-14px)] md:mb-0"
                >
                  <span className="size-3 rounded-full" style={{ background: accent }} />
                  <Burst color={accent} />
                </span>

                <div
                  data-o="card"
                  className={cn(
                    "relative z-10 w-full md:w-[calc(50%-48px)]",
                    item.founder && "md:w-[min(100%,540px)]",
                  )}
                >
                  {/* Projector beam from the node, and the scan bar, both gone once it lands. */}
                  {/* The beam's apex sits under the node: centred on phones, at the card's inner corner from md. */}
                  <span
                    data-o="beam"
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute -top-5 left-0 z-20 h-[calc(100%+20px)] w-full opacity-0 [clip-path:polygon(50%_0,100%_100%,0_100%)]",
                      !item.founder && index % 2 === 0 && "md:[clip-path:polygon(100%_0,100%_100%,0_100%)]",
                      !item.founder && index % 2 === 1 && "md:[clip-path:polygon(0_0,100%_100%,0_100%)]",
                    )}
                    style={{ background: `linear-gradient(to bottom, ${accent}aa, transparent 75%)` }}
                  />
                  <article
                    className="bento-card relative overflow-hidden rounded-3xl p-5 md:p-6"
                    style={{ "--accent": accent } as CSSProperties}
                  >
                    <span
                      data-o="scan"
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/3 opacity-0"
                      style={{ background: `linear-gradient(to bottom, transparent, ${accent}55 70%, ${PAPER}aa 92%, transparent)` }}
                    />
                    <div className={cn("flex gap-4", item.founder ? "items-center" : "flex-col gap-2")}>
                      {item.founder ? (
                        <div data-o="line" className="size-16 shrink-0 md:size-20">
                          <FounderArt />
                        </div>
                      ) : (
                        /* Strand colour: it names the cable, so the paint stays. */
                        <span data-o="line" className="type-index" style={{ color: accent }}>
                          {String(index + 1).padStart(2, "0")} · {t.sets[index % SETS.length].toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <h3 data-o="line" className="type-title text-balance text-eggshell">
                          {item.title}
                        </h3>
                        <p data-o="line" className="type-body mt-3 text-platinum">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </article>
                </div>
              </li>
            );
          })}
        </ol>

        {/* The serpent ties off: one flux. */}
        <div data-o="seal" className="relative z-10 mx-auto flex flex-col items-center text-center">
          <div
            data-o="badge"
            className="grid size-24 place-items-center rounded-full border-[3px] border-[#15110d] shadow-[5px_5px_0_#0c0907]"
            style={{ background: `conic-gradient(${TV_COLORS[0]} 0 33%, ${TV_COLORS[1]} 0 66%, ${TV_COLORS[2]} 0)` }}
          >
            <div className="grid size-16 place-items-center rounded-full border-[3px] border-[#15110d] bg-background">
              <span className="font-display text-sm leading-none font-bold text-eggshell">
                1<span className="font-mono block text-[10px] tracking-[0.14em] uppercase">{t.badge}</span>
              </span>
            </div>
          </div>
          <p data-o="payoff" className="type-hook mt-6 text-balance text-eggshell">
            {t.payoff}
          </p>
          <p data-o="payoff" className="type-note mt-3 max-w-md text-dim">
            {t.note}
          </p>
        </div>
      </div>
    </section>
  );
}
