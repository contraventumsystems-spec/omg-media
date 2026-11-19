"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  ArtStage,
  BrandArt,
  LandscapeScene,
  OnSetScene,
  PortraitArt,
  ProductArt,
} from "@/app/components/creative-art";
import { GraphicDesignBoard, LogoBuilder } from "@/app/components/design-specimen";
import { BentoCard, FLUX_BARS, Lead, Title } from "@/app/components/flow-bento";
import { PopText } from "@/app/components/services-story";
import { bentoEntrance, bentoHeadingPop } from "@/app/lib/bento-motion";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * The presentation video. Until the file exists, the card shows a labelled
 * placeholder that "plays" only when asked. To go live: put the file in
 * public/ and set `src` (and ideally `poster`, plus `captions` as a .vtt when
 * the video has speech). The slot keeps 9:16.
 */
const PRESENTATION: { src?: string; poster?: string; captions?: string } = {};

/** Window event that keeps one presentation playing at a time across the page. */
const MEDIA_EVENT = "omg:media-play";

const HEADING = "Conținut care îți pune brandul în lumină.";
const PAYOFF_WORDS = 2;

const RATIOS = [
  { id: "16:9", w: 16, h: 9, use: "YouTube, site" },
  { id: "1:1", w: 1, h: 1, use: "Feed" },
  { id: "9:16", w: 9, h: 16, use: "Reels, TikTok" },
] as const;

const formatTime = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
};

/* ------------------------------------------------------------------ A: video */

/**
 * 9:16 presentation slot. Nothing plays until the visitor asks: one play/pause
 * action, sound only after that click, inline on phones. It pauses when it
 * scrolls out of view or when another presentation starts.
 */
function VideoSlot() {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const id = useId();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const live = Boolean(PRESENTATION.src);

  const pause = useCallback(() => {
    if (live) video.current?.pause();
    else setPlaying(false);
  }, [live]);

  const toggle = () => {
    if (playing) {
      pause();
      return;
    }
    window.dispatchEvent(new CustomEvent(MEDIA_EVENT, { detail: id }));
    if (live) void video.current?.play();
    else setPlaying(true);
  };

  /* One at a time, and never playing off screen. */
  useEffect(() => {
    const onOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) pause();
    };
    window.addEventListener(MEDIA_EVENT, onOther);
    const el = frame.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) pause();
      },
      { threshold: 0.2 },
    );
    if (el) observer.observe(el);
    return () => {
      window.removeEventListener(MEDIA_EVENT, onOther);
      observer.disconnect();
    };
  }, [id, pause]);

  /* Placeholder clock: ticks only while "playing". */
  useEffect(() => {
    if (live || !playing) return;
    const timer = window.setInterval(() => setTime((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [live, playing]);

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:w-auto">
      <div
        ref={frame}
        className="relative aspect-[9/16] w-full max-w-[min(100%,300px)] overflow-hidden rounded-2xl border border-eggshell/10 bg-[#120e0b] sm:w-[260px] lg:w-[280px]"
      >
        {live ? (
          <video
            ref={video}
            src={PRESENTATION.src}
            poster={PRESENTATION.poster}
            preload="none"
            playsInline
            muted={muted}
            className="absolute inset-0 size-full object-cover"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
          >
            {PRESENTATION.captions ? (
              <track kind="captions" srcLang="ro" label="Română" src={PRESENTATION.captions} default />
            ) : null}
          </video>
        ) : (
          /* Illustrated poster until the real video lands: the reels spin and the slate claps while it "plays". */
          <ArtStage className="absolute inset-0">
            <OnSetScene playing={playing} />
            <span className="font-mono absolute top-3 left-3 rounded-full bg-background/75 px-2.5 py-1 text-[10px] tracking-[0.12em] text-eggshell uppercase">
              Prezentare · 9:16
            </span>
          </ArtStage>
        )}

        {/* Scanlines, like every card. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(243_233_210/0.03)_0_1px,transparent_1px_3px)]"
        />

        {/* Big play button while paused; out of the way while playing. */}
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pune pauză prezentării" : "Pornește prezentarea"}
          aria-pressed={playing}
          className={cn(
            "absolute inset-0 grid place-items-center motion-safe:transition-opacity motion-safe:duration-200",
            playing ? "opacity-0 hover:opacity-100 focus-visible:opacity-100" : "opacity-100",
          )}
        >
          <span className="grid size-16 place-items-center rounded-full bg-eggshell text-background shadow-[5px_5px_0_var(--flux-cyan)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110">
            {playing ? <Pause className="size-6" fill="currentColor" /> : <Play className="ml-1 size-6" fill="currentColor" />}
          </span>
        </button>

        {/* Control bar: always reachable, so the state is never a guess. */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-[linear-gradient(to_top,rgb(18_14_11/0.9),transparent)] px-3 pt-8 pb-3 text-eggshell">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pauză" : "Redă"}
            className="grid size-8 place-items-center rounded-full bg-eggshell/10 hover:bg-eggshell/20"
          >
            {playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
          </button>
          <span className="font-display text-xs tabular-nums" aria-live="off">
            {formatTime(time)}
          </span>
          {playing ? (
            <span className="font-mono flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase">
              <span className="flux-blink size-1.5 rounded-full bg-flux-red" />
              Rulează
            </span>
          ) : null}
          {live ? (
            <span className="ml-auto flex gap-1">
              <button
                type="button"
                onClick={() => setMuted((value) => !value)}
                aria-label={muted ? "Pornește sunetul" : "Oprește sunetul"}
                className="grid size-8 place-items-center rounded-full bg-eggshell/10 hover:bg-eggshell/20"
              >
                {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => void video.current?.requestFullscreen?.()}
                aria-label="Ecran complet"
                className="grid size-8 place-items-center rounded-full bg-eggshell/10 hover:bg-eggshell/20"
              >
                <Maximize className="size-4" />
              </button>
            </span>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-eggshell px-5 text-sm font-semibold text-background shadow-[4px_4px_0_var(--flux-cyan)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 sm:hidden"
      >
        {playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
        {playing ? "Pune pauză" : "Vezi prezentarea"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------- B: photo stack */

/** The three photographs, front first. Each one is a subject from the lead line. */
const SHOTS = [
  { label: "Oameni", Art: PortraitArt },
  { label: "Produse", Art: ProductArt },
  { label: "Branduri", Art: BrandArt },
] as const;

/** Deck slots: front, middle, back. */
const SLOTS = [
  { x: 0, y: 0, rotation: 0, scale: 1, zIndex: 3 },
  { x: 24, y: -6, rotation: 7, scale: 0.92, zIndex: 2 },
  { x: -24, y: -10, rotation: -8, scale: 0.85, zIndex: 1 },
] as const;

/** Seconds each photograph stays in front while the deck plays. */
const DEAL_EVERY = 2.6;

const slotTransform = (slot: (typeof SLOTS)[number]) =>
  `translate(${slot.x}px, ${slot.y}px) rotate(${slot.rotation}deg) scale(${slot.scale})`;

/**
 * A deck of three photographs. While it is on screen, GSAP deals the front one
 * off to the side and tucks it in at the back every few seconds, so people,
 * products and brands take turns. Hover or focus holds the deck; a click,
 * tap, Enter or Space deals the next one. Reduced motion: no auto-deal, and a
 * click swaps instantly.
 */
function PhotoStack() {
  const root = useRef<HTMLButtonElement>(null);
  const order = useRef<number[]>([0, 1, 2]);
  const [front, setFront] = useState(0);

  const deal = useCallback(() => {
    const el = root.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-photo]"));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const [out, ...rest] = order.current;
    const time = (seconds: number) => (still ? 0 : seconds);

    const shuffle = gsap.timeline();
    /* The front photo is flicked off the top right, then slides in at the back. */
    shuffle
      .to(cards[out], { x: 150, y: -34, rotation: 22, duration: time(0.34), ease: "power2.in", overwrite: "auto" })
      .set(cards[out], { zIndex: 0 })
      .to(cards[out], { ...SLOTS[2], duration: time(0.55), ease: "back.out(1.7)" });
    /* The others step forward a slot each. */
    rest.forEach((card, slot) => {
      shuffle.to(cards[card], { ...SLOTS[slot], duration: time(0.5), ease: "back.out(2.2)", overwrite: "auto" }, time(0.18));
    });

    order.current = [...rest, out];
    setFront(rest[0]);
  }, []);

  /* Auto-deal while on screen, held while hovered or focused. */
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        let timer: gsap.core.Tween | null = null;
        let visible = false;
        let held = false;
        const schedule = () => {
          timer?.kill();
          timer = visible && !held ? gsap.delayedCall(DEAL_EVERY, () => {
            deal();
            schedule();
          }) : null;
        };
        const hold = (value: boolean) => () => {
          held = value;
          schedule();
        };
        const onEnter = hold(true);
        const onLeave = hold(false);
        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointerleave", onLeave);
        el.addEventListener("focus", onEnter);
        el.addEventListener("blur", onLeave);
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            visible = self.isActive;
            schedule();
          },
        });
        return () => {
          timer?.kill();
          trigger.kill();
          gsap.killTweensOf(el.querySelectorAll("[data-photo]"));
          el.removeEventListener("pointerenter", onEnter);
          el.removeEventListener("pointerleave", onLeave);
          el.removeEventListener("focus", onEnter);
          el.removeEventListener("blur", onLeave);
        };
      });
    },
    { scope: root, dependencies: [deal] },
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        ref={root}
        type="button"
        onClick={() => deal()}
        aria-label={`Fotografia următoare. Acum: ${SHOTS[front].label}`}
        className="relative grid h-48 w-full place-items-center sm:h-52"
      >
        <ArtStage className="absolute inset-0 grid place-items-center">
          {SHOTS.map(({ label, Art }, index) => (
            <div
              key={label}
              data-photo
              className="absolute aspect-[4/5] h-40 overflow-hidden rounded-xl border-2 border-[#15110d] shadow-[5px_5px_0_var(--flux-yellow)] sm:h-44"
              style={{ transform: slotTransform(SLOTS[index]), zIndex: SLOTS[index].zIndex }}
            >
              <Art />
            </div>
          ))}
        </ArtStage>
      </button>
      {/* Which subject is in front, in the words of the lead line. */}
      <p className="flex gap-1.5" aria-live="polite">
        {SHOTS.map(({ label }, index) => (
          <span
            key={label}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-[11px] motion-safe:transition-colors motion-safe:duration-300",
              index === front
                ? "border-flux-yellow/60 bg-flux-yellow/15 text-eggshell"
                : "border-eggshell/10 text-dim",
            )}
          >
            {label}
          </span>
        ))}
      </p>
    </div>
  );
}

/* --------------------------------------------------------- D: before / after */

function EditingCompare() {
  const root = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);

  /* One playhead sweep over the decorative timeline when it comes into view. */
  useGSAP(
    () => {
      const head = root.current?.querySelector<HTMLElement>("[data-playhead]");
      if (!head) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          head,
          { left: "0%" },
          {
            left: "100%",
            duration: 2.4,
            ease: "power1.inOut",
            scrollTrigger: { trigger: head, start: "top 85%", once: true },
          },
        );
      });
    },
    { scope: root },
  );

  /* The same frame twice: graded on top, the flat log underneath. */
  const frameArt = (
    <ArtStage className="absolute inset-0">
      <LandscapeScene slice />
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_45%,transparent,rgb(18_14_11/0.55))]" />
    </ArtStage>
  );

  return (
    <div ref={root} className="space-y-4">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-eggshell/10">
        {/* After: graded. */}
        {frameArt}
        {/* Before: the same frame, flat and grey, clipped to the slider. */}
        <div
          className="absolute inset-0 [filter:grayscale(0.85)_contrast(0.7)_brightness(0.85)]"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
          aria-hidden="true"
        >
          {frameArt}
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-eggshell shadow-[0_0_0_1px_rgb(18_14_11/0.4)]"
          style={{ left: `${split}%` }}
        />
        <span className="absolute top-3 left-3 rounded-full bg-background/70 px-2.5 py-1 text-[11px] text-eggshell">Înainte</span>
        <span className="absolute top-3 right-3 rounded-full bg-background/70 px-2.5 py-1 text-[11px] text-eggshell">După</span>
        <input
          type="range"
          min={0}
          max={100}
          value={split}
          onChange={(event) => setSplit(Number(event.target.value))}
          aria-label="Compară cadrul înainte și după editare"
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>

      {/* Illustration of an edit, not a working editor. */}
      <div aria-hidden="true" className="relative space-y-1.5 rounded-xl border border-eggshell/[0.06] bg-[#120e0b] p-3">
        {[
          { label: "Imagine", color: "bg-flux-magenta", clips: [[0, 34], [36, 70], [72, 100]] },
          { label: "Sunet", color: "bg-flux-green", clips: [[0, 58], [60, 100]] },
          { label: "Titluri", color: "bg-flux-yellow", clips: [[8, 26], [64, 86]] },
        ].map((track) => (
          <div key={track.label} className="flex items-center gap-3">
            <span className="font-mono w-14 shrink-0 text-[10px] tracking-[0.08em] text-dim uppercase">{track.label}</span>
            <div className="relative h-3 flex-1 rounded-sm bg-eggshell/[0.05]">
              {track.clips.map(([from, to]) => (
                <span
                  key={from}
                  className={cn("absolute inset-y-0 rounded-sm opacity-80", track.color)}
                  style={{ left: `${from}%`, width: `${to - from}%` }}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="pointer-events-none absolute inset-y-2 right-3 left-[5.25rem]">
          <span data-playhead className="absolute inset-y-0 left-1/3 w-px bg-eggshell">
            <span className="absolute -top-1 -left-1 size-2 rotate-45 bg-eggshell" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ E: formats */

function FormatSwitch() {
  const stage = useRef<HTMLDivElement>(null);
  const crop = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [chosen, setChosen] = useState(false);

  /* Fits the crop outline to the active ratio inside the stage. */
  useGSAP(
    () => {
      const box = stage.current;
      const outline = crop.current;
      if (!box || !outline) return;
      const { width, height } = box.getBoundingClientRect();
      const ratio = RATIOS[active];
      const scale = Math.min((width * 0.82) / ratio.w, (height * 0.82) / ratio.h);
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      gsap.to(outline, {
        width: ratio.w * scale,
        height: ratio.h * scale,
        duration: still ? 0 : 0.6,
        ease: "back.out(1.8)",
      });
    },
    { scope: stage, dependencies: [active] },
  );

  /* Cycles the ratios while on screen, until the visitor picks one. */
  useGSAP(
    () => {
      const el = stage.current;
      if (!el || chosen) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        let timer = 0;
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          end: "bottom 15%",
          onToggle: (self) => {
            window.clearInterval(timer);
            if (self.isActive) {
              timer = window.setInterval(
                () => setActive((value) => (value + 1) % RATIOS.length),
                2200,
              );
            }
          },
        });
        return () => {
          window.clearInterval(timer);
          trigger.kill();
        };
      });
    },
    { scope: stage, dependencies: [chosen] },
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div
        ref={stage}
        className="relative grid min-h-52 flex-1 place-items-center overflow-hidden rounded-2xl border border-eggshell/10 bg-[linear-gradient(160deg,#1f2a1d,#17120e)]"
      >
        <ArtStage className="absolute inset-0 opacity-80">
          <LandscapeScene slice />
        </ArtStage>
        <div
          ref={crop}
          aria-hidden="true"
          className="relative rounded-md border-2 border-flux-green shadow-[0_0_0_999px_rgb(18_14_11/0.55)]"
          style={{ width: 160, height: 90 }}
        >
          <span className="absolute -top-6 left-0 font-display text-xs font-bold text-flux-green">
            {RATIOS[active].id}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Formate de livrare">
        {RATIOS.map((ratio, index) => (
          <button
            key={ratio.id}
            type="button"
            aria-pressed={index === active}
            onClick={() => {
              setChosen(true);
              setActive(index);
            }}
            className={cn(
              "rounded-xl border px-2 py-2 text-left motion-safe:transition-colors",
              index === active
                ? "border-flux-green/60 bg-flux-green/[0.1] text-eggshell"
                : "border-eggshell/10 text-platinum hover:border-eggshell/25",
            )}
          >
            <span className="block font-display text-sm font-bold">{ratio.id}</span>
            <span className="block text-[11px] text-dim">{ratio.use}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- section */

/**
 * "Producție de conținut": the creative services as a second bento, in the
 * same ink-and-paint family as the flux bento above it.
 *
 *   A  presentation video (9:16 slot, user-started play/pause)
 *   B  photo shoots, a stack that fans out on hover, focus or tap
 *   C  graphic design, an artboard re-laid as poster, post and banner
 *   C2 logo design, construction grid to symbol to the logo in use
 *   D  video editing, before/after on one frame plus an illustrated timeline
 *   E  delivery formats, a crop outline moving between 16:9, 1:1 and 9:16
 *
 * The brief-to-delivery workflow is its own section below
 * (app/components/process-journey.tsx).
 *
 * Every image is a labelled placeholder until real work is dropped in.
 * Layout: 12 columns on desktop (A 8 wide beside B, C and C2 stacked; D 8 beside E),
 * 2 on tablets, 1 on phones, always in A to E order.
 */
export function CreativeBento() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;
      bentoHeadingPop(root.current);
      bentoEntrance(root.current);
    },
    { scope: root },
  );

  const words = HEADING.split(" ");
  const lead = words.slice(0, -PAYOFF_WORDS);
  const payoff = words.slice(-PAYOFF_WORDS);

  /* overflow-hidden for the same reason as the flux bento: older Safari ignores `clip` and zooms out. */
  return (
    <section
      id="continut"
      className="scroll-mt-28 overflow-hidden bg-background px-4 py-24 sm:px-5 md:scroll-mt-24 md:px-10 md:py-32"
    >
      <div ref={root} className="mx-auto w-full max-w-6xl">
        <header className="mx-auto max-w-5xl text-center">
          <p data-bento-lead className="type-index text-dim">
            Producție de conținut
          </p>
          <h2
            data-bento-heading
            className="type-h2 mt-2 text-balance text-eggshell"
          >
            {lead.map((word, index) => (
              <span key={`${word}-${index}`}>
                <PopText text={word} />{" "}
              </span>
            ))}
            {/* "în lumină" is the one DOM accent. The bar stroke under it stays on the flux paints. */}
            <span className="relative inline-block whitespace-nowrap text-signal-design">
              {payoff.map((word, index) => (
                <span key={`${word}-${index}`}>
                  <PopText text={word} />
                  {index < payoff.length - 1 ? " " : null}
                </span>
              ))}
              <span
                data-bento-bars
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-[0.12em] flex h-[0.11em] origin-left"
              >
                {FLUX_BARS.map((color) => (
                  <span key={color} className={`h-full flex-1 ${color}`} />
                ))}
              </span>
            </span>
          </h2>
          <p data-bento-lead className="type-lead mx-auto mt-4 text-platinum">
            Filmări, ședințe foto, design grafic și editare video, de la idee la
            materialele finale.
          </p>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:mt-8 lg:grid-cols-12 lg:gap-5">
          {/* A: the presentation leads. The slot stays 9:16; the title starts at the top so the crop does not move it. */}
          <BentoCard accent="var(--flux-cyan)" className="sm:col-span-2 lg:col-span-8 lg:row-span-3">
            <CardContent className="grid h-full items-start gap-6 sm:grid-cols-[auto_1fr] sm:gap-8">
              <VideoSlot />
              <div className="flex min-w-0 flex-col gap-4">
                <Badge className="bg-flux-cyan font-bold text-background">Prezentare</Badge>
                <Title strong="Filmare &" soft="producție video" />
                <Lead>De la idee la cadre care spun povestea ta.</Lead>
                <div className="flex flex-wrap gap-1.5">
                  {["Concept & scenariu", "Filmare", "Lumini & sunet", "Regie"].map((item) => (
                    <Badge key={item} variant="outline" className="border-eggshell/15 text-platinum">
                      {item}
                    </Badge>
                  ))}
                </div>
                <p className="type-note text-dim">
                  Apasă pe play ca să pornești prezentarea. Nu rulează singură.
                </p>
              </div>
            </CardContent>
          </BentoCard>

          {/* B: photo shoots. */}
          <BentoCard accent="var(--flux-yellow)" className="lg:col-span-4">
            <CardHeader className="gap-y-3">
              <Title strong="Ședințe" soft="foto" />
              <Lead>Oameni. Produse. Branduri.</Lead>
            </CardHeader>
            <CardContent className="mt-auto">
              <PhotoStack />
            </CardContent>
          </BentoCard>

          {/* C: graphic design, an artboard at work. */}
          <BentoCard accent="var(--flux-violet)" className="lg:col-span-4">
            <CardHeader className="gap-y-3">
              <Title strong="Design" soft="grafic" />
              <Lead>Afișe, postări și bannere, construite pe identitatea ta.</Lead>
            </CardHeader>
            <CardContent className="mt-auto">
              <GraphicDesignBoard />
            </CardContent>
          </BentoCard>

          {/* C2: logo design, from construction grid to the logo in use. */}
          <BentoCard accent="var(--flux-yellow)" className="sm:col-span-2 lg:col-span-4">
            <CardHeader className="gap-y-3">
              <Title strong="Logo" soft="design" />
              <Lead>De la schiță la simbolul care te reprezintă, cu toate variantele lui.</Lead>
            </CardHeader>
            <CardContent className="mt-auto">
              <LogoBuilder />
            </CardContent>
          </BentoCard>

          {/* D: editing. */}
          <BentoCard accent="var(--flux-magenta)" className="sm:col-span-2 lg:col-span-8">
            <CardHeader className="gap-y-3">
              <Title strong="Editare" soft="video" />
              <Lead>Ritm, culoare și sunet. Fiecare cadru contează.</Lead>
            </CardHeader>
            <CardContent>
              <EditingCompare />
            </CardContent>
          </BentoCard>

          {/* E: delivery formats. */}
          <BentoCard accent="var(--flux-green)" className="sm:col-span-2 lg:col-span-4">
            <CardHeader className="gap-y-3">
              <Title strong="Formate" soft="de livrare" />
              <Lead>Același mesaj. Fiecare format.</Lead>
            </CardHeader>
            <CardContent className="flex-1">
              <FormatSwitch />
            </CardContent>
          </BentoCard>

        </div>
      </div>
    </section>
  );
}
