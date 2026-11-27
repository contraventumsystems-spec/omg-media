"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { ChannelIcon } from "@/app/components/channel-icons";
import { FLUX_BARS } from "@/app/components/flow-bento";
import { cn } from "@/lib/utils";
import { useDict } from "@/app/i18n/locale-provider";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

const INK = "#15110d";
const PAPER = "#f3e9d2";
const SHADE = "#2b241c";
const LINE = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/**
 * The six steps, in the agency's own path: an audit of the niche first,
 * proven KPIs checked against the client's market, a strategy built around
 * their values, the route from ad to enquiry across page, form and request
 * panel, the content,
 * then campaigns that get cheaper as they get more precise.
 */
/* Titles, copy and what the client gets are in the dictionary (how.journey.steps), in this order. */
const STEPS = [
  { key: "audit", accent: "var(--flux-yellow)" },
  { key: "client", accent: "var(--flux-cyan)" },
  { key: "strategy", accent: "var(--flux-violet)" },
  { key: "route", accent: "var(--flux-green)" },
  { key: "content", accent: "var(--flux-magenta)" },
  { key: "campaigns", accent: "var(--flux-red)" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/* ------------------------------------------------------------------ art */

/** 1. Audit: a magnifier sweeps a report while its bars rise, then a tick lands. */
function AuditArt() {
  return (
    <svg viewBox="0 0 220 160" className="size-full" aria-hidden="true">
      <rect x="30" y="18" width="130" height="126" rx="8" fill={PAPER} {...LINE} />
      <rect x="44" y="32" width="70" height="8" rx="2" fill={INK} />
      <rect x="44" y="46" width="48" height="5" rx="2" fill={INK} opacity="0.35" />
      {[0, 1, 2, 3, 4].map((index) => (
        <rect
          key={index}
          data-a="bar"
          x={48 + index * 21}
          y={128 - (24 + index * 12)}
          width="14"
          height={24 + index * 12}
          rx="2"
          fill={index === 4 ? "var(--flux-yellow)" : SHADE}
          {...LINE}
          strokeWidth={2}
        />
      ))}
      <g data-a="lens">
        <path d="M186 118 L206 140" {...LINE} strokeWidth={8} />
        <circle cx="170" cy="100" r="26" fill="var(--flux-cyan)" fillOpacity="0.25" {...LINE} strokeWidth={5} />
        <circle cx="162" cy="92" r="6" fill={PAPER} opacity="0.7" />
      </g>
      <g data-a="tick">
        <circle cx="156" cy="30" r="15" fill="var(--flux-green)" {...LINE} />
        <path d="M149 30 l5 5 9 -10" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** 2. Ideal client: an arrow flies into the bullseye and shivers. */
function TargetArt() {
  return (
    <svg viewBox="0 0 220 160" className="size-full" aria-hidden="true">
      {[
        { r: 58, fill: PAPER },
        { r: 42, fill: "var(--flux-cyan)" },
        { r: 26, fill: PAPER },
        { r: 11, fill: "var(--flux-magenta)" },
      ].map((ring) => (
        <circle key={ring.r} data-a="ring" cx="120" cy="80" r={ring.r} fill={ring.fill} {...LINE} />
      ))}
      <g data-a="arrow">
        <path d="M120 80 L30 52" {...LINE} strokeWidth={5} />
        <path d="M120 80 L104 70 L108 84Z" fill={INK} />
        <path d="M30 52 L18 38 M30 52 L14 56 M38 55 L26 41 M38 55 L22 59" stroke="var(--flux-yellow)" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** 3. Strategy: the route draws itself through Google, Meta and TikTok to one enquiry. */
function RouteArt() {
  return (
    <svg viewBox="0 0 220 160" className="size-full" aria-hidden="true">
      <path
        data-a="route"
        d="M24 124 C50 124 46 46 78 46 S108 116 138 116 S160 36 196 40"
        fill="none"
        stroke="var(--flux-violet)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M24 124 C50 124 46 46 78 46 S108 116 138 116 S160 36 196 40" fill="none" stroke={INK} strokeWidth="1.5" opacity="0.25" strokeDasharray="4 6" />
      {[
        { x: 24, y: 124, id: null },
        { x: 78, y: 46, id: "google" as const },
        { x: 138, y: 116, id: "facebook" as const },
        { x: 168, y: 64, id: "tiktok" as const },
      ].map((node) => (
        <g key={node.x} data-a="node">
          <circle cx={node.x} cy={node.y} r="15" fill={node.id ? PAPER : "var(--flux-yellow)"} {...LINE} />
          {node.id ? <ChannelIcon id={node.id} x={node.x - 9} y={node.y - 9} width={18} height={18} /> : null}
        </g>
      ))}
      <g data-a="goal">
        <path d="M196 22 l5 11 12 1.5 -9 8 2.5 12 -10.5 -6 -10.5 6 2.5 -12 -9 -8 12 -1.5Z" fill="var(--flux-yellow)" {...LINE} />
      </g>
    </svg>
  );
}

/** 4. Route & software: a landing page assembles itself and the cursor clicks the button. */
function BuildArt() {
  return (
    <svg viewBox="0 0 220 160" className="size-full" aria-hidden="true">
      <rect x="22" y="14" width="176" height="132" rx="10" fill={SHADE} {...LINE} />
      <path d="M22 34 H198" {...LINE} />
      {[36, 48, 60].map((cx, index) => (
        <circle key={cx} cx={cx} cy="24" r="4" fill={["var(--flux-red)", "var(--flux-yellow)", "var(--flux-green)"][index]} />
      ))}
      <rect data-a="block" x="34" y="44" width="152" height="10" rx="3" fill={PAPER} />
      <rect data-a="block" x="34" y="62" width="88" height="40" rx="5" fill="var(--flux-green)" {...LINE} strokeWidth={2} />
      <rect data-a="block" x="130" y="62" width="56" height="12" rx="3" fill={PAPER} />
      <rect data-a="block" x="130" y="80" width="56" height="12" rx="3" fill={PAPER} />
      <rect data-a="block" x="34" y="110" width="88" height="6" rx="2" fill={PAPER} opacity="0.5" />
      <g data-a="button">
        <rect x="130" y="102" width="56" height="20" rx="10" fill="var(--flux-yellow)" {...LINE} strokeWidth={2.5} />
        <path d="M150 112 h16" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>
      <path data-a="cursor" d="M0 0 L0 22 L6 16 L11 27 L15 25 L10 14 L18 14Z" fill={PAPER} {...LINE} strokeWidth={2} transform="translate(160 112)" />
    </svg>
  );
}

/** 5. Content: the slate snaps and three frames fan out in 16:9, 1:1 and 9:16. */
function ContentArt() {
  return (
    <svg viewBox="0 0 220 160" className="size-full" aria-hidden="true">
      {[
        { x: 112, y: 40, w: 92, h: 52, fill: "var(--flux-violet)" },
        { x: 132, y: 70, w: 58, h: 58, fill: "var(--flux-cyan)" },
        { x: 104, y: 60, w: 40, h: 72, fill: "var(--flux-magenta)" },
      ].map((frame) => (
        <g key={frame.fill} data-a="frame">
          <rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} rx="6" fill={frame.fill} {...LINE} />
          <circle cx={frame.x + frame.w / 2} cy={frame.y + frame.h / 2} r="7" fill={PAPER} {...LINE} strokeWidth={2} />
        </g>
      ))}
      <g transform="translate(18 74)">
        <rect y="14" width="78" height="50" rx="4" fill="#120e0b" {...LINE} />
        <path d="M10 34H66M10 46H48" stroke={PAPER} strokeWidth="2.5" opacity="0.6" />
        <g data-a="clap">
          <rect width="78" height="14" rx="3" fill={PAPER} {...LINE} />
          {[0, 1, 2, 3, 4].map((index) => (
            <path key={index} d={`M${6 + index * 15} 0 l9 14 h7 l-9 -14Z`} fill={INK} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/** 6. Campaigns: enquiries climb while the cost line falls, and the LIVE light pulses. */
function CampaignArt() {
  return (
    <svg viewBox="0 0 220 160" className="size-full" aria-hidden="true">
      <path d="M26 20 V136 H200" fill="none" {...LINE} />
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <rect
          key={index}
          data-a="cbar"
          x={38 + index * 27}
          y={136 - (22 + index * 15)}
          width="17"
          height={22 + index * 15}
          rx="3"
          fill={index === 5 ? "var(--flux-green)" : SHADE}
          {...LINE}
          strokeWidth={2}
        />
      ))}
      <path data-a="cost" d="M40 34 C70 40 90 62 118 70 S170 98 196 104" fill="none" stroke="var(--flux-red)" strokeWidth="5" strokeLinecap="round" />
      <g>
        <rect x="140" y="12" width="60" height="22" rx="11" fill="#120e0b" {...LINE} strokeWidth={2} />
        <circle data-a="live" cx="154" cy="23" r="5" fill="var(--flux-red)" />
        <text x="164" y="27.5" fontSize="11" fontWeight="700" fill={PAPER} letterSpacing="1">LIVE</text>
      </g>
    </svg>
  );
}

const ART: Record<StepKey, () => React.JSX.Element> = {
  audit: AuditArt,
  client: TargetArt,
  strategy: RouteArt,
  route: BuildArt,
  content: ContentArt,
  campaigns: CampaignArt,
};

/* --------------------------------------------------------------- motions */

type Motion = (panel: HTMLElement, tl: gsap.core.Timeline) => void;
const pick = <T extends Element>(panel: HTMLElement, name: string) =>
  Array.from(panel.querySelectorAll<T>(`[data-a="${name}"]`));

/** Each step has its own art motion; all play on a timeline that starts when the panel arrives. */
const MOTIONS: Record<StepKey, Motion> = {
  audit: (panel, tl) => {
    tl.from(pick(panel, "bar"), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.6, ease: "back.out(2)", stagger: 0.08 }, 0)
      .fromTo(pick(panel, "lens"), { x: -120, y: 10, rotation: -20 }, { x: 0, y: 0, rotation: 0, duration: 1.1, ease: "power2.out" }, 0)
      .to(pick(panel, "lens"), { x: -14, y: -6, duration: 0.25, yoyo: true, repeat: 1, ease: "sine.inOut" }, 1.1)
      .from(pick(panel, "tick"), { scale: 0, rotation: -90, transformOrigin: "50% 50%", duration: 0.6, ease: "elastic.out(1, 0.45)" }, 1.2);
  },
  client: (panel, tl) => {
    tl.from(pick(panel, "ring"), { scale: 0, svgOrigin: "120 80", duration: 0.6, ease: "back.out(2.4)", stagger: 0.09 }, 0)
      .fromTo(pick(panel, "arrow"), { x: -170, y: -50, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.45, ease: "power4.in" }, 0.45)
      .to(pick(panel, "arrow"), {
        keyframes: [
          { rotation: 4, duration: 0.06 },
          { rotation: -3, duration: 0.06 },
          { rotation: 2, duration: 0.06 },
          { rotation: 0, duration: 0.08 },
        ],
        svgOrigin: "120 80",
      }, 0.9)
      .fromTo(pick(panel, "ring").slice(-1), { scale: 1 }, { scale: 1.35, svgOrigin: "120 80", duration: 0.15, yoyo: true, repeat: 1 }, 0.9);
  },
  strategy: (panel, tl) => {
    tl.fromTo(pick(panel, "route"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.3, ease: "power1.inOut" }, 0)
      .from(pick(panel, "node"), { scale: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(3)", stagger: 0.28 }, 0.1)
      .from(pick(panel, "goal"), { scale: 0, rotation: -180, transformOrigin: "50% 50%", duration: 0.7, ease: "elastic.out(1, 0.4)" }, 1.2);
  },
  route: (panel, tl) => {
    tl.from(pick(panel, "block"), { y: -70, opacity: 0, duration: 0.55, ease: "bounce.out", stagger: 0.12 }, 0)
      .from(pick(panel, "button"), { scale: 0, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(3)" }, 0.6)
      .fromTo(pick(panel, "cursor"), { x: 60, y: 40, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, 0.8)
      .to(pick(panel, "button"), { scale: 0.88, transformOrigin: "50% 50%", duration: 0.1, yoyo: true, repeat: 1 }, 1.4)
      .to(pick(panel, "button"), { fill: "var(--flux-green)", duration: 0.2 }, 1.45);
  },
  content: (panel, tl) => {
    tl.fromTo(pick(panel, "clap"), { rotation: -32, transformOrigin: "0% 100%" }, { rotation: 0, duration: 0.25, ease: "power4.in" }, 0.15)
      .from(pick(panel, "frame"), {
        x: -60,
        rotation: (index: number) => [-24, 16, -10][index],
        scale: 0.4,
        opacity: 0,
        transformOrigin: "50% 100%",
        duration: 0.7,
        ease: "back.out(1.8)",
        stagger: 0.14,
      }, 0.35);
  },
  campaigns: (panel, tl) => {
    tl.from(pick(panel, "cbar"), { scaleY: 0, transformOrigin: "50% 100%", duration: 0.7, ease: "elastic.out(1, 0.6)", stagger: 0.1 }, 0)
      .fromTo(pick(panel, "cost"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.2, ease: "power2.inOut" }, 0.3)
      .to(pick(panel, "live"), { opacity: 0.2, duration: 0.4, repeat: 5, yoyo: true, ease: "steps(1)" }, 0.6);
  },
};

/** The text of each panel enters with its own move, so no two steps arrive alike. */
const TEXT_IN: gsap.TweenVars[] = [
  { y: 40, opacity: 0 },
  { x: 60, opacity: 0 },
  { scale: 0.7, opacity: 0, transformOrigin: "0% 50%" },
  { rotation: -6, y: 30, opacity: 0, transformOrigin: "0% 100%" },
  { skewX: -18, x: -40, opacity: 0 },
  { y: -40, opacity: 0 },
];

/* --------------------------------------------------------------- section */

/**
 * "De la brief la livrare": the process as a pinned, sideways journey.
 *
 * Vertical scroll drives the track to the right, one step per panel, and the
 * scroll snaps to each panel, so a swipe up or down always lands cleanly.
 * Each panel's art plays its own motion as it arrives (and rewinds when you
 * scroll back past it). The last panel is "Pe scurt": the six steps as one
 * string with what you get from each, and the contact action.
 *
 * Reduced motion: no pin and no sideways scroll; the panels stack vertically.
 */
export function ProcessJourney() {
  const t = useDict().how.journey;
  const steps = STEPS.map((step, index) => ({ ...step, ...t.steps[index] }));
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const track = section?.querySelector<HTMLElement>("[data-track]");
      const stage = section?.querySelector<HTMLElement>("[data-stage]");
      const fill = section?.querySelector<HTMLElement>("[data-progress]");
      const counter = section?.querySelector<HTMLElement>("[data-counter]");
      if (!section || !track || !stage || !fill || !counter) return;
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", track);
      const last = panels.length - 1;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const distance = () => track.scrollWidth - window.innerWidth;

        /* The sideways move, scrubbed and snapped to each panel. */
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: {
              snapTo: 1 / last,
              duration: { min: 0.25, max: 0.6 },
              delay: 0.05,
              ease: "power2.inOut",
              inertia: false,
            },
            onUpdate: (self) => {
              const index = Math.round(self.progress * last);
              counter.textContent =
                index === last ? t.summary : `${String(index + 1).padStart(2, "0")} / ${String(STEPS.length).padStart(2, "0")}`;
            },
          },
        });

        /* Progress rail follows the scrub. */
        gsap.fromTo(fill, { scaleX: 0 }, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        /* Each panel: its text arrives with its own move, then its art plays. */
        panels.forEach((panel, index) => {
          const key = panel.dataset.panel as StepKey | "summary";
          const tl = gsap.timeline({
            paused: true,
            defaults: { overwrite: "auto" },
          });
          const words = panel.querySelectorAll("[data-in]");
          if (key === "summary") {
            tl.from(panel.querySelectorAll("[data-chip]"), {
              y: 30,
              scale: 0.6,
              opacity: 0,
              duration: 0.55,
              ease: "back.out(2.6)",
              stagger: 0.09,
            }, 0)
              .fromTo(panel.querySelector("[data-string]"), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, 0.1)
              .from(words, { y: 20, opacity: 0, duration: 0.5, stagger: 0.08 }, 0);
          } else {
            tl.from(words, { ...TEXT_IN[index % TEXT_IN.length], duration: 0.6, ease: "power3.out", stagger: 0.07 }, 0);
            MOTIONS[key](panel, tl);
          }
          ScrollTrigger.create({
            trigger: panel,
            containerAnimation: slide,
            start: "left 70%",
            end: "right 30%",
            onEnter: () => tl.play(),
            onEnterBack: () => tl.play(),
            onLeaveBack: () => tl.reverse(),
          });
          /* The first panel is already in place when the pin starts. */
          if (index === 0) {
            ScrollTrigger.create({
              trigger: stage,
              start: "top 60%",
              onEnter: () => tl.play(),
              onLeaveBack: () => tl.reverse(),
            });
          }
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="drum" aria-labelledby="drum-title" className="overflow-hidden bg-background">
      <div data-stage className="relative flex h-svh flex-col justify-center gap-5 py-20 motion-reduce:h-auto motion-reduce:py-24 md:gap-8">
        <header className="px-5 text-center md:px-10">
          <p className="font-mono text-xs tracking-[0.14em] text-dim uppercase">{t.eyebrow}</p>
          <h2
            id="drum-title"
            className="mt-3 font-display text-[length:clamp(1.9rem,1rem+3.2vw,3.75rem)] leading-[1.02] font-bold tracking-[-0.03em] text-eggshell"
          >
            {t.title[0]} <span className="text-flux-cyan">{t.title[1]}</span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-platinum md:text-base">
            {t.lead}
          </p>
        </header>

        <div className="overflow-hidden motion-reduce:overflow-visible">
          <ol
            data-track
            className="flex w-max gap-4 px-[calc((100vw-var(--panel))/2)] [--panel:min(86vw,760px)] md:gap-6 motion-reduce:w-full motion-reduce:flex-col motion-reduce:items-center motion-reduce:px-5"
          >
            {steps.map((step, index) => {
              const Art = ART[step.key];
              return (
                <li
                  key={step.key}
                  data-panel={step.key}
                  className="bento-card grid w-(--panel) shrink-0 grid-rows-[auto_1fr] gap-4 overflow-hidden rounded-3xl p-5 md:grid-cols-[1.05fr_1fr] md:grid-rows-1 md:items-center md:gap-8 md:p-8"
                  style={{ "--accent": step.accent } as React.CSSProperties}
                >
                  <div className="order-2 md:order-1">
                    <p
                      data-in
                      className="font-display text-5xl leading-none font-bold text-transparent [-webkit-text-stroke:2px_var(--accent)] md:text-7xl"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 data-in className="mt-3 font-display text-2xl leading-tight font-bold tracking-[-0.02em] text-eggshell md:text-3xl">
                      {step.title}
                    </h3>
                    <p data-in className="mt-2 text-sm leading-relaxed text-platinum md:text-base">
                      {step.body}
                    </p>
                    <p data-in className="mt-4 flex gap-2 rounded-2xl border border-eggshell/10 bg-eggshell/[0.04] p-3 text-sm text-eggshell">
                      <span className="shrink-0 font-bold text-(--accent)">{t.gets}</span>
                      <span>{step.gets}</span>
                    </p>
                  </div>
                  <div className="order-1 h-32 rounded-2xl bg-[#120e0b] p-2 sm:h-40 md:order-2 md:h-56">
                    <Art />
                  </div>
                </li>
              );
            })}

            {/* Pe scurt: the six steps as one string, and the next action. */}
            <li
              data-panel="summary"
              className="bento-card flex w-(--panel) shrink-0 flex-col justify-center gap-5 overflow-hidden rounded-3xl p-5 md:p-8"
              style={{ "--accent": "var(--flux-cyan)" } as React.CSSProperties}
            >
              <div>
                <p data-in className="font-mono text-xs tracking-[0.14em] text-dim uppercase">{t.summary}</p>
                <h3 data-in className="mt-2 font-display text-2xl leading-tight font-bold tracking-[-0.02em] text-eggshell md:text-3xl">
                  {t.summaryTitle[0]} <span className="text-flux-cyan">{t.summaryTitle[1]}</span>
                </h3>
              </div>
              <div className="relative">
                <span
                  data-string
                  aria-hidden="true"
                  className="absolute top-4 right-6 left-6 hidden h-1 origin-left md:flex"
                >
                  {FLUX_BARS.map((color) => (
                    <span key={color} className={cn("h-full flex-1", color)} />
                  ))}
                </span>
                <ol className="relative grid grid-cols-2 gap-2 md:grid-cols-6 md:gap-3">
                  {steps.map((step, index) => (
                    <li key={step.key} data-chip className="flex flex-col items-center gap-1.5 text-center">
                      <span
                        className="grid size-9 place-items-center rounded-full border-2 border-[#15110d] font-display text-sm font-bold text-background"
                        style={{ background: step.accent }}
                      >
                        {index + 1}
                      </span>
                      <span className="text-[13px] leading-tight font-bold text-eggshell">{step.short}</span>
                      <span className="text-[11px] leading-snug text-dim">{step.gets}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <a
                data-in
                href="#ce-construim"
                className="inline-flex h-11 w-full items-center justify-center self-center rounded-full bg-eggshell px-6 text-sm font-semibold text-background shadow-[4px_4px_0_var(--flux-cyan)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 md:w-auto"
              >
                {t.cta}
              </a>
            </li>
          </ol>
        </div>

        {/* Where you are in the journey. */}
        <div className="mx-auto flex w-[min(86vw,760px)] items-center gap-4 motion-reduce:hidden">
          <span data-counter className="w-16 shrink-0 font-display text-sm font-bold text-eggshell tabular-nums">
            01 / 06
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-eggshell/10">
            <div data-progress className="flex h-full origin-left">
              {FLUX_BARS.map((color) => (
                <span key={color} className={cn("h-full flex-1", color)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
