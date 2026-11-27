"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Channel, Pose, WallSet } from "@/app/components/cabinet-tv";
import { channelChange } from "@/app/components/channel-change";
import { FLUX_BARS } from "@/app/components/flow-bento";
import { clearPop, drawPop, PopText, readPops } from "@/app/components/services-story";
import { bentoHeadingPop } from "@/app/lib/bento-motion";
import { BAR_HEX } from "@/app/lib/bars";
import { cn } from "@/lib/utils";
import { fill } from "@/app/i18n/config";
import { useDict } from "@/app/i18n/locale-provider";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** The 3D sets load only on the client, and only when the section comes near. */
const ChannelWall = dynamic(() => import("@/app/components/cabinet-tv"), { ssr: false });

/**
 * "Ce construim, canal cu canal": what goes into each pillar. The order of
 * the work lives on /cum-lucram, so nothing here repeats a step.
 *
 * Three televisions from the hero's pile, one per pillar, are the whole
 * section. The stage sticks while they rise in at three different speeds and
 * turn to face the reader, then each tunes in to its pillar as it lands.
 * Every set is one big button, labelled with its channel, so there is
 * nothing to discover: press a screen, the channel change (the same cut as
 * the rest of the site) covers the page, and the pillar's broadcast powers
 * on as a dialog over it. The dialog has its own channel buttons, so the
 * reader can flip between the three without closing it (static rolls over
 * the tube); closing switches the tube off and hands focus back to the set.
 *
 * Phones: the three sets stack down the stage in a zig-zag, each beside its
 * label. From md: a row of three, the middle one larger, labels underneath.
 * How the collaboration works is on /cum-lucram (app/components/collaboration.tsx).
 *
 * Reduced motion: no sticky stage and no flight, the sets are tuned from the
 * start, and the dialog opens on the site's 150 ms dip.
 */

type Item = { title: string; body: string };
type Pillar = {
  id: "strategie" | "tehnologie" | "design";
  name: string;
  tagline: string;
  color: string;
  bar: string;
  build: Item[];
  extra: Item[];
};

/** The three sets, in screen order. Names, taglines and cards are in the dictionary (home.pillars.items). */
const PILLARS = [
  { id: "strategie", color: "#52cbec", bar: "bg-flux-cyan" },
  { id: "tehnologie", color: "#53d54b", bar: "bg-flux-green" },
  { id: "design", color: "#e54bc9", bar: "bg-flux-magenta" },
] as const;

/** On-screen ident of a pillar, as drawn by the set. `label` is "CANAL {n}" in the page's language. */
const channelOf = (pillar: Pillar, index: number, label: string): Channel => ({
  name: pillar.name,
  tagline: pillar.tagline,
  color: pillar.color,
  count: fill(label, { n: String(index + 1).padStart(2, "0") }),
});

/**
 * Each set's flight: where it starts (in its own heights below its place), how
 * far it is turned and sunk, when it leaves (timeline position), and how far
 * it keeps drifting up during the hold. Different depths and drifts are the
 * parallax. The sides leave first; the middle one, the largest, lands last.
 */
const FLIGHT = [
  { y: 150, turn: 1.6, lift: -0.6, at: 0, drift: -6 },
  { y: 260, turn: -1.4, lift: -0.9, at: 0.24, drift: -11 },
  { y: 185, turn: -1.7, lift: -0.5, at: 0.1, drift: -3 },
] as const;
/** Where the middle set lands on the flight timeline: the other two take the thud. */
const MIDDLE_LANDS = FLIGHT[1].at + 0.6;

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

const two = (value: number) => String(value).padStart(2, "0");

/** One compartment of a broadcast: its label, then one card per item. */
function Compartment({ label, items, color, from }: { label: string; items: Item[]; color: string; from: number }) {
  return (
    <div>
      <p data-dialog-lead className="type-index flex items-center justify-center gap-2 text-dim">
        <span className="size-2 rounded-full" style={{ background: color }} />
        {label}
      </p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <li
            key={item.title}
            data-item
            className="channel-card rounded-2xl border-2 border-[#15110d] bg-[#1d1813] p-4 md:p-5"
            style={{ ["--card-color" as string]: color }}
          >
            <p className="type-index text-dim">{two(from + index)}</p>
            <h4 className="type-dense mt-2 text-balance text-eggshell">{item.title}</h4>
            <p className="type-body mt-2 text-platinum">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** How the broadcast came on air: from the page (the tube powers on) or from another channel (it rolls). */
type Arrival = "open" | "flip";

export function PillarCabinet() {
  const root = useRef<HTMLElement>(null);
  const { home, common } = useDict();
  const t = home.pillars;
  const pillars: Pillar[] = useMemo(
    () => PILLARS.map((pillar) => ({ ...pillar, ...t.items[pillar.id], build: [...t.items[pillar.id].build], extra: [...t.items[pillar.id].extra] })),
    [t],
  );
  const idents = useMemo(() => pillars.map((pillar, index) => channelOf(pillar, index, t.channel)), [pillars, t]);
  const track = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const screen0 = useRef<HTMLSpanElement>(null);
  const screen1 = useRef<HTMLSpanElement>(null);
  const screen2 = useRef<HTMLSpanElement>(null);
  const pose0 = useRef<Pose>({ turn: FLIGHT[0].turn, lift: FLIGHT[0].lift, hover: 0 });
  const pose1 = useRef<Pose>({ turn: FLIGHT[1].turn, lift: FLIGHT[1].lift, hover: 0 });
  const pose2 = useRef<Pose>({ turn: FLIGHT[2].turn, lift: FLIGHT[2].lift, hover: 0 });
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const arrival = useRef<Arrival>("open");
  const busy = useRef(false);
  const [near, setNear] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(false);
  const [powered, setPowered] = useState([false, false, false]);
  const [pulses, setPulses] = useState([0, 0, 0]);
  /* The channel on air in the dialog; null while it is closed. */
  const [view, setView] = useState<number | null>(null);
  const still = useReducedMotion();
  const markReady = useCallback(() => setReady(true), []);

  const screens: RefObject<HTMLSpanElement | null>[] = [screen0, screen1, screen2];
  const poses: RefObject<Pose>[] = [pose0, pose1, pose2];

  /* Mount the 3D sets when the section is near; show and render them only while it is on screen. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const nearby = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNear(true);
    }, { rootMargin: "800px 0px" });
    const visible = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    nearby.observe(el);
    visible.observe(el);
    return () => {
      nearby.disconnect();
      visible.disconnect();
    };
  }, []);

  const powerOn = useCallback((index: number) => {
    setPowered((current) => (current[index] ? current : current.map((on, at) => on || at === index)));
  }, []);

  /*
   * The flight. One scrubbed timeline over the track: the sets rise from three
   * depths (the parallax), turn to face the reader and tune in as they land;
   * the rest of the track is the hold where the reader picks a channel.
   */
  useGSAP(
    () => {
      const section = root.current;
      const stage = track.current;
      if (!section || !stage) return;
      bentoHeadingPop(section);
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const sets = gsap.utils.toArray<HTMLElement>("[data-set]", section);
        const flight = gsap.timeline({
          scrollTrigger: { trigger: stage, start: "top 70%", end: "bottom bottom", scrub: 0.6 },
        });
        sets.forEach((set, index) => {
          const from = FLIGHT[index];
          flight
            .fromTo(
              set,
              { yPercent: from.y, scale: 0.55, autoAlpha: 0 },
              {
                keyframes: [
                  { autoAlpha: 1, duration: 0.12, ease: "none" },
                  { yPercent: 0, scale: 1, duration: 0.48, ease: "back.out(1.3)" },
                ],
              },
              from.at,
            )
            .fromTo(
              poses[index].current,
              { turn: from.turn, lift: from.lift },
              { turn: 0, lift: 0, duration: 0.6, ease: "power3.out" },
              from.at,
            )
            .call(() => powerOn(index), undefined, from.at + 0.5);
        });
        /* The middle set lands heavy: the two beside it hop. */
        flight.to(
          [sets[0], sets[2]],
          { keyframes: [{ yPercent: -4, duration: 0.04, ease: "power2.out" }, { yPercent: 0, duration: 0.08, ease: "bounce.out" }] },
          MIDDLE_LANDS - 0.04,
        );
        /* The hold: the reader chooses while the sets keep drifting up at their own speeds, the heading slower still. */
        const hold = MIDDLE_LANDS + 0.1;
        sets.forEach((set, index) => {
          flight.to(set, { yPercent: FLIGHT[index].drift, duration: 0.5, ease: "none" }, hold);
        });
        const heading = section.querySelector("[data-channel-heading]");
        if (heading) flight.to(heading, { yPercent: -6, duration: 0.5, ease: "none" }, hold);
        return () => setPowered([false, false, false]);
      });
      media.add("(prefers-reduced-motion: reduce)", () => {
        poses.forEach((pose) => {
          pose.current.turn = 0;
          pose.current.lift = 0;
        });
        setPowered([true, true, true]);
      });
    },
    { scope: root },
  );

  /*
   * The broadcast plays in each time a channel comes on air.
   * open: the cut's bars wipe off over it; the name pops with its colour
   *       ghosts, its bar draws, the lines and every card rise in.
   * flip: the static rolls off the tube; the name pops, its bar draws in
   *       steps, the tagline types in like teletext, and the cards drop in
   *       with a squash, the ones below the fold as the reader scrolls to them.
   */
  useGSAP(
    () => {
      const panel = body.current;
      const tube = frame.current;
      if (view === null || !panel || !tube || still) return;
      const pops = readPops(panel);

      /* From the page: the cut's bars wipe off, the name pops, the bar draws, every card rises. */
      if (arrival.current === "open") {
        const opening = gsap.timeline({ onUpdate: () => pops.forEach(drawPop) });
        pops.forEach((pop, index) => {
          const at = 0.35 + index * 0.08;
          opening
            .fromTo(pop.state, { scale: 0.4, alpha: 0 }, { scale: 1, duration: 0.6, ease: "back.out(3)" }, at)
            .to(pop.state, { alpha: 1, duration: 0.18 }, at)
            .fromTo(pop.state, { lock: 0 }, { lock: 1, duration: 1, ease: "elastic.out(1, 0.5)" }, at + 0.09);
        });
        opening
          .fromTo(panel.querySelectorAll("[data-dialog-bars]"), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.out" }, 0.5)
          .fromTo(panel.querySelectorAll("[data-dialog-lead], [data-dialog-index], [data-dialog-tagline]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.6)
          .fromTo(
            panel.querySelectorAll("[data-item]"),
            { autoAlpha: 0, y: 28, scale: 0.96 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(2.2)", stagger: 0.05, clearProps: "transform,opacity,visibility" },
            0.65,
          );
        pops.forEach(drawPop);
        return () => {
          opening.kill();
          pops.forEach(clearPop);
        };
      }

      /* From another channel: the static has rolled off; the new one plays in, cards drop as they come into the tube. */
      const cards = gsap.utils.toArray<HTMLElement>("[data-item]", panel);
      const tagline = panel.querySelector<HTMLElement>("[data-dialog-tagline]");
      const start = 0.15;
      const intro = gsap.timeline({ onUpdate: () => pops.forEach(drawPop) });
      pops.forEach((pop, index) => {
        const at = start + index * 0.08;
        intro
          .fromTo(pop.state, { scale: 0.4, alpha: 0 }, { scale: 1, duration: 0.6, ease: "back.out(3)" }, at)
          .to(pop.state, { alpha: 1, duration: 0.18 }, at)
          .fromTo(pop.state, { lock: 0 }, { lock: 1, duration: 1, ease: "elastic.out(1, 0.5)" }, at + 0.09);
      });
      intro
        .fromTo(
          panel.querySelectorAll("[data-dialog-index]"),
          { autoAlpha: 0 },
          { keyframes: [{ autoAlpha: 1, duration: 0.05 }, { autoAlpha: 0.2, duration: 0.05 }, { autoAlpha: 1, duration: 0.05 }] },
          start,
        )
        .fromTo(panel.querySelectorAll("[data-dialog-bars]"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "steps(7)" }, start + 0.15)
        .fromTo(panel.querySelectorAll("[data-dialog-lead]"), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.08 }, start + 0.3);
      if (tagline) {
        const letters = Math.max(1, tagline.textContent?.length ?? 1);
        intro.fromTo(
          tagline,
          { clipPath: "inset(-20% 100% -20% 0)" },
          { clipPath: "inset(-20% 0% -20% 0)", duration: letters * 0.035, ease: `steps(${letters})` },
          start + 0.2,
        );
      }

      /* Cards: hidden until the broadcast is up, then dropped in as they come into the tube. */
      gsap.set(cards, { autoAlpha: 0 });
      const drop = (batch: Element[]) =>
        gsap.fromTo(
          batch,
          {
            autoAlpha: 0,
            y: 70,
            scaleX: 0.9,
            scaleY: 1.14,
            rotation: (index: number) => (index % 2 === 0 ? -4 : 4),
            transformOrigin: "50% 100%",
          },
          {
            keyframes: [
              { autoAlpha: 1, y: -10, rotation: 0, scaleX: 0.95, scaleY: 1.06, duration: 0.28, ease: "power3.out" },
              { y: 0, scaleX: 1.06, scaleY: 0.92, duration: 0.1, ease: "power2.in" },
              { scaleX: 1, scaleY: 1, duration: 0.55, ease: "elastic.out(1.1, 0.4)" },
            ],
            stagger: 0.07,
            overwrite: true,
            onComplete: () => {
              gsap.set(batch, { clearProps: "transform,transformOrigin,opacity,visibility" });
            },
          },
        );
      let batches: ScrollTrigger[] = [];
      intro.call(
        () => {
          batches = ScrollTrigger.batch(cards, { scroller: panel, start: "top 96%", once: true, onEnter: drop });
        },
        undefined,
        start + 0.4,
      );
      pops.forEach(drawPop);
      return () => {
        intro.kill();
        batches.forEach((trigger) => trigger.kill());
        pops.forEach(clearPop);
      };
    },
    { scope: root, dependencies: [view, still] },
  );

  /* The tube switches off: the picture folds to a bright line, the line to a dot, then the dialog goes. */
  const close = useCallback(() => {
    const box = dialog.current;
    const tube = frame.current;
    if (!box?.open || busy.current) return;
    const was = view;
    const finish = () => {
      box.close();
      box.removeAttribute("data-closing");
      setView(null);
      busy.current = false;
      if (was !== null) tiles.current[was]?.focus({ preventScroll: true });
    };
    if (still || !tube) {
      finish();
      return;
    }
    busy.current = true;
    box.setAttribute("data-closing", "");
    gsap
      .timeline({ onComplete: finish })
      .to(tube, { scaleY: 0.006, filter: "brightness(4)", duration: 0.2, ease: "power3.in" })
      .to(tube, { scaleX: 0, duration: 0.16, ease: "power3.in" })
      .set(tube, { clearProps: "transform,filter" });
  }, [view, still]);

  const open = (index: number) => {
    setPulses((current) => current.map((count, at) => (at === index ? count + 1 : count)));
    const tile = tiles.current[index];
    if (tile && !still) {
      gsap.fromTo(tile, { scale: 1 }, {
        keyframes: [
          { scale: 0.94, duration: 0.1, ease: "power2.out" },
          { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" },
        ],
      });
    }
    /* The pressed screen bursts into static first, then the cut takes the page. */
    window.setTimeout(
      () =>
        channelChange(
          () => {
            arrival.current = "open";
            setView(index);
            if (!dialog.current?.open) dialog.current?.showModal();
          },
          { kind: "cut", colors: BAR_HEX },
        ),
      still ? 0 : 160,
    );
  };

  /* Another channel from inside the broadcast: static rolls over the tube, the picture jolts, the new one is under it. */
  const flip = (index: number) => {
    if (index === view || busy.current) return;
    const tube = frame.current;
    const noise = tube?.querySelector<HTMLElement>("[data-tube-static]");
    const swap = () => {
      arrival.current = "flip";
      setView(index);
      body.current?.scrollTo({ top: 0 });
    };
    if (still || !tube || !noise) {
      swap();
      return;
    }
    busy.current = true;
    gsap
      .timeline({ onComplete: () => { busy.current = false; } })
      .set(noise, { autoAlpha: 1, backgroundPositionY: "0%" })
      .to(tube, { keyframes: [{ x: -10, skewX: 3, duration: 0.05 }, { x: 8, skewX: -2, duration: 0.05 }, { x: 0, skewX: 0, duration: 0.08 }] }, 0)
      .to(noise, { backgroundPositionY: "-400%", duration: 0.32, ease: "steps(8)" }, 0)
      .call(swap, undefined, 0.12)
      .to(noise, { autoAlpha: 0, duration: 0.14, ease: "steps(3)" }, 0.26);
  };

  const sets: WallSet[] = useMemo(
    () =>
      PILLARS.map((_, index) => ({
        track: screens[index],
        /* The same ident object every time, so only the pressed set bursts. */
        channel: powered[index] ? idents[index] : null,
        pose: poses[index],
        pulse: pulses[index],
      })),
    // The refs are stable; only the tuning and the presses change the sets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [powered, pulses, idents],
  );

  const onAir = view === null ? null : pillars[view];
  const lead = t.heading.lead.split(" ");
  const payoff = t.heading.payoff.split(" ");

  return (
    <section ref={root} id="ce-construim" aria-labelledby="ce-construim-title" className="relative bg-background">
      <div ref={track} className="relative h-[190svh] md:h-[210svh] motion-reduce:h-auto">
        <div className="sticky top-0 z-[2] flex h-svh flex-col px-4 pt-24 pb-16 sm:px-5 md:px-10 md:pt-[5.75rem] md:pb-6 motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
          <header data-channel-heading className="mx-auto max-w-3xl shrink-0 text-center">
            <p data-bento-lead className="type-index text-dim">{t.index}</p>
            <h2 id="ce-construim-title" data-bento-heading className="type-h2 mt-2 text-balance text-eggshell">
              {lead.map((word, index) => (
                <span key={`${word}-${index}`}>
                  <PopText text={word} />{" "}
                </span>
              ))}
              <span className="relative inline-block whitespace-nowrap">
                {payoff.map((word, index) => (
                  <span key={`${word}-${index}`}>
                    <PopText text={word} />
                    {index < payoff.length - 1 ? " " : null}
                  </span>
                ))}
                <span data-bento-bars aria-hidden="true" className="absolute inset-x-0 -bottom-[0.12em] flex h-[0.11em] origin-left">
                  {FLUX_BARS.map((color) => (
                    <span key={color} className={`h-full flex-1 ${color}`} />
                  ))}
                </span>
              </span>
            </h2>
            <p data-bento-lead className="type-lead mx-auto mt-3 hidden text-platinum md:block">
              {t.lead}
            </p>
          </header>

          {/* The three sets. Each is one button: the screen is the hit area, the label names the channel. */}
          <ul className="channel-sets mx-auto mt-4 grid min-h-0 w-full max-w-7xl flex-1 md:mt-2">
            {pillars.map((pillar, index) => (
              <li key={pillar.id} data-set className="channel-set min-h-0">
                <button
                  ref={(el) => {
                    tiles.current[index] = el;
                  }}
                  type="button"
                  aria-haspopup="dialog"
                  aria-label={fill(t.tile, { n: index + 1, name: pillar.name, tagline: pillar.tagline })}
                  onClick={() => open(index)}
                  onPointerMove={(event) => {
                    const box = event.currentTarget.getBoundingClientRect();
                    poses[index].current.hover = ((event.clientX - box.left) / box.width - 0.5) * 0.5;
                  }}
                  onPointerLeave={() => {
                    poses[index].current.hover = 0;
                  }}
                  className="channel-tile group rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-eggshell/70"
                >
                  <span ref={screens[index]} className="channel-screen relative block">
                    {/* Painted stand-in until the 3D sets have loaded, and for no WebGL. */}
                    <span
                      aria-hidden="true"
                      hidden={ready}
                      className="absolute inset-[10%_8%_6%] grid place-items-center rounded-[28%_28%_22%_22%/22%] border-4 border-[#15110d] bg-[#2b241c]"
                    >
                      <span className="type-index grid size-[70%] place-items-center rounded-[18%] border-4 border-[#15110d] bg-[#120e0b] text-eggshell">
                        {pillar.name}
                      </span>
                    </span>
                    {/* Glow under the set in its channel colour, stronger on hover. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "pointer-events-none absolute inset-x-[18%] bottom-[2%] h-[12%] rounded-[50%] blur-xl motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-90 group-focus-visible:opacity-90",
                        powered[index] ? "channel-glow opacity-50" : "opacity-0",
                      )}
                      style={{ background: pillar.color }}
                    />
                    {/* The call, on the set's base under the glass, once the set is tuned. Big enough to read at a glance. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-[3%] left-1/2 z-[3] flex -translate-x-1/2 items-center gap-1.5 rounded-full border-2 border-[#15110d] bg-eggshell px-3.5 py-1.5 font-mono text-[15px] leading-none font-bold tracking-[0.1em] whitespace-nowrap text-background uppercase shadow-[3px_3px_0_var(--tw-shadow-color)] motion-safe:transition-[opacity,transform] motion-safe:duration-300 group-hover:-translate-y-0.5 md:px-4 md:py-2 md:text-base",
                        powered[index] ? "opacity-100" : "opacity-0",
                      )}
                      style={{ ["--tw-shadow-color" as string]: pillar.color }}
                    >
                      <span className="channel-hint">▶</span> {t.press}
                    </span>
                  </span>
                  <span className="channel-label">
                    <span className="type-index flex items-center gap-1.5 text-[10px] text-dim">
                      <span
                        className={cn("size-2 rounded-full", powered[index] && "flux-blink")}
                        style={{ background: pillar.color, boxShadow: powered[index] ? `0 0 10px ${pillar.color}` : "none" }}
                      />
                      Canal {two(index + 1)}
                    </span>
                    <span className="type-dense mt-0.5 block text-eggshell decoration-2 underline-offset-[0.2em] group-hover:underline" style={{ textDecorationColor: pillar.color }}>
                      {pillar.name}
                    </span>
                    <span className="type-note block text-platinum">{pillar.tagline}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {near ? <ChannelWall sets={sets} active={onScreen && view === null} still={still} onReady={markReady} /> : null}

      {/* The broadcast. A native modal: focus is trapped in it and Esc closes it. */}
      <dialog
        ref={dialog}
        aria-labelledby="canal-titlu"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
        className="channel-dialog m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-eggshell md:m-auto md:h-auto md:max-h-[90svh] md:w-[min(64rem,calc(100vw-5rem))]"
      >
        {onAir ? (
          <div
            ref={frame}
            className="channel-tube relative flex h-full flex-col overflow-hidden border-[#15110d] bg-[#120e0b] md:max-h-[90svh] md:rounded-3xl md:border-[3px]"
            style={{ ["--tube-color" as string]: onAir.color }}
          >
            {/* The tube's top edge: the bars, then the on-air strip with the close button. */}
            <div aria-hidden="true" className="flex h-1.5 shrink-0">
              {FLUX_BARS.map((color) => (
                <span key={color} className={cn("h-full flex-1", color)} />
              ))}
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[#15110d] bg-[#1d1813] py-2 pr-2 pl-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
              <p className="type-index flex items-center gap-2 text-dim">
                <span className="flux-blink size-2 rounded-full bg-flux-red" />
                {fill(t.live, { n: two((view ?? 0) + 1) })}
              </p>
              <button
                type="button"
                onClick={close}
                className="type-button inline-flex h-11 items-center gap-2 rounded-full border-2 border-eggshell/15 px-4 text-eggshell motion-safe:transition-colors hover:border-eggshell/40"
              >
                {common.menu.close}
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            <div ref={body} data-lenis-prevent className="channel-scanlines relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-8 md:px-10 md:py-10">
              <div className="mx-auto max-w-4xl text-center">
                <p data-dialog-index className="type-index text-dim">{fill(t.of, { n: two((view ?? 0) + 1) })}</p>
                <h3 id="canal-titlu" className="type-h2 mt-2 text-eggshell">
                  <span className="relative inline-block">
                    <PopText text={onAir.name} />
                    <span
                      data-dialog-bars
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[0.12em] h-[0.11em] origin-left"
                      style={{ background: onAir.color }}
                    />
                  </span>
                </h3>
                <p data-dialog-tagline className="type-hook mx-auto mt-4 w-fit" style={{ color: onAir.color }}>
                  {onAir.tagline}
                </p>
              </div>

              <div className="mx-auto mt-8 grid max-w-4xl gap-8 md:mt-10">
                <Compartment label={t.build} items={onAir.build} color={onAir.color} from={1} />
                <Compartment label={t.extra} items={onAir.extra} color={onAir.color} from={onAir.build.length + 1} />
              </div>
              <p data-dialog-lead className="type-note mx-auto mt-6 max-w-4xl text-center text-dim">
                {t.note}
              </p>
            </div>

            {/* The remote: the other two channels are one press away. */}
            <nav
              aria-label={t.remote}
              className="shrink-0 border-t-2 border-[#15110d] bg-[#1d1813] px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-4"
            >
              <p className="type-index mb-2 text-center text-dim">{t.remote}</p>
              <div className="grid grid-cols-3 gap-2">
                {pillars.map((pillar, index) => {
                  const current = index === view;
                  return (
                    <button
                      key={pillar.id}
                      type="button"
                      aria-current={current ? "true" : undefined}
                      onClick={() => flip(index)}
                      className={cn(
                        "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 py-2 motion-safe:transition-[colors,transform] motion-safe:duration-200 active:scale-95 md:flex-row md:gap-2",
                        current ? "border-transparent text-background" : "border-eggshell/15 text-eggshell hover:-translate-y-0.5 hover:border-eggshell/40",
                      )}
                      style={current ? { background: pillar.color } : undefined}
                    >
                      <span className={cn("type-index", current ? "text-background/70" : "text-dim")}>{two(index + 1)}</span>
                      <span className="type-button">{pillar.name}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Static that rolls over the tube between two channels. */}
            <div data-tube-static aria-hidden="true" className="channel-static pointer-events-none invisible absolute inset-0 z-10 opacity-0" />
          </div>
        ) : null}
      </dialog>

    </section>
  );
}
