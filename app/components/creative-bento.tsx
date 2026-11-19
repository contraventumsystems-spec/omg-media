"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Camera,
  Clapperboard,
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
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

const STEPS = [
  { title: "Brief", body: "Stabilim ce vrei să comunici și pentru cine." },
  { title: "Producție", body: "Filmăm și fotografiem după planul stabilit." },
  { title: "Editare & design", body: "Montaj, culoare, sunet și grafică." },
  { title: "Livrare", body: "Fișiere gata de publicat, în formatele de care ai nevoie." },
] as const;

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
  const reel = useRef<HTMLDivElement>(null);
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

  /* Placeholder picture: the TV bars drift only while playing, never on reduced motion. */
  useGSAP(
    () => {
      if (live || !reel.current) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const drift = gsap.to(reel.current, {
          xPercent: -50,
          duration: 6,
          ease: "none",
          repeat: -1,
          paused: true,
        });
        return () => drift.kill();
      });
    },
    { scope: frame },
  );
  useEffect(() => {
    if (live || !reel.current) return;
    const tweens = gsap.getTweensOf(reel.current);
    tweens.forEach((tween) => (playing ? tween.play() : tween.pause()));
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
          /* Labelled stand-in, so it never reads as finished work. */
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-[58%] overflow-hidden opacity-90">
              <div ref={reel} className="flex h-full w-[200%]">
                {[...FLUX_BARS, ...FLUX_BARS].map((color, index) => (
                  <span key={`${color}-${index}`} className={cn("h-full flex-1", color)} />
                ))}
              </div>
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_55%,#120e0b)]" />
            </div>
            {/* Sits above the control bar. */}
            <div className="absolute inset-x-0 bottom-14 flex flex-col items-center gap-2 px-5 text-center">
              <Clapperboard className="size-6 text-eggshell/70" />
              <p className="font-display text-sm font-bold tracking-[0.12em] text-eggshell uppercase">
                Prezentare video
              </p>
              <p className="text-xs text-dim">Placeholder · 9:16 · fișierul vine aici</p>
            </div>
          </div>
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
            <span className="flex items-center gap-1.5 text-[10px] tracking-[0.12em] uppercase">
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

/* --------------------------------------------------------- shared placeholder */

/** A labelled stand-in frame: obviously a slot, never mistaken for finished work. */
function Placeholder({
  label,
  className,
  tone = "#231d17",
}: {
  label: string;
  className?: string;
  tone?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-eggshell/10 text-center",
        className,
      )}
      style={{
        background: `linear-gradient(160deg, ${tone} 0%, #17120e 100%)`,
      }}
    >
      <Camera className="size-5 text-eggshell/50" aria-hidden="true" />
      <span className="px-2 text-[11px] tracking-[0.1em] text-eggshell/70 uppercase">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------- B: photo stack */

function PhotoStack() {
  const stack = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  /* Back photographs fan out on hover, focus or tap. Static on reduced motion. */
  useGSAP(
    () => {
      const el = stack.current;
      if (!el) return;
      const [back, middle] = el.querySelectorAll<HTMLElement>("[data-photo]");
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(back, {
          x: open ? -46 : -18,
          rotation: open ? -11 : -6,
          duration: 0.55,
          ease: "back.out(2)",
        });
        gsap.to(middle, {
          x: open ? 46 : 18,
          rotation: open ? 10 : 5,
          duration: 0.55,
          ease: "back.out(2)",
        });
      });
    },
    { scope: stack, dependencies: [open] },
  );

  return (
    <button
      ref={stack}
      type="button"
      aria-pressed={open}
      aria-label={open ? "Strânge fotografiile" : "Desfă fotografiile"}
      onClick={() => setOpen((value) => !value)}
      onPointerEnter={(event) => event.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className="relative mx-auto grid h-48 w-full place-items-center sm:h-52"
    >
      {/* Resting offsets as inline transforms, so GSAP reads and tweens them. */}
      <span
        data-photo
        className="absolute aspect-[4/5] h-40 sm:h-44"
        style={{ transform: "translateX(-18px) rotate(-6deg)" }}
      >
        <Placeholder label="Fotografie 3" tone="#2a1f2c" className="size-full shadow-lg" />
      </span>
      <span
        data-photo
        className="absolute aspect-[4/5] h-40 sm:h-44"
        style={{ transform: "translateX(18px) rotate(5deg)" }}
      >
        <Placeholder label="Fotografie 2" tone="#1f2a2c" className="size-full shadow-lg" />
      </span>
      <span className="absolute aspect-[4/5] h-40 sm:h-44">
        <Placeholder label="Fotografie 1" tone="#33291b" className="size-full shadow-[6px_6px_0_var(--flux-yellow)]" />
      </span>
    </button>
  );
}

/* ---------------------------------------------------------- C: design specimen */

function DesignSpecimen() {
  const root = useRef<HTMLDivElement>(null);

  /* One colour pass over the type sample when it comes into view, then it rests in paper. */
  useGSAP(
    () => {
      const sample = root.current?.querySelector<HTMLElement>("[data-type-sample]");
      if (!sample) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: sample, start: "top 80%", once: true } })
          .to(sample, { color: "var(--flux-violet)", duration: 0.35 })
          .to(sample, { color: "var(--flux-yellow)", duration: 0.35 })
          .to(sample, { color: "var(--flux-cyan)", duration: 0.35 })
          .to(sample, { color: "var(--eggshell)", duration: 0.5 });
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid grid-cols-[1fr_auto] items-end gap-4">
      <div>
        <p data-type-sample className="font-display text-7xl leading-none font-bold tracking-[-0.04em] text-eggshell">
          Aa
        </p>
        <p className="mt-1 font-serif text-3xl leading-none text-platinum italic">Aa</p>
        <div className="mt-4 flex gap-1.5" aria-label="Paletă de culori exemplu">
          {FLUX_BARS.map((color) => (
            <span key={color} className={cn("size-5 rounded-full ring-1 ring-black/30", color)} />
          ))}
        </div>
      </div>
      <Placeholder label="Specimen design" tone="#251c33" className="aspect-[3/4] h-36" />
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
    <div className="absolute inset-0">
      <div className="absolute inset-0 flex">
        {FLUX_BARS.map((color) => (
          <span key={color} className={cn("h-full flex-1", color)} />
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_45%,transparent,rgb(18_14_11/0.75))]" />
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/70 px-3 py-1 text-[11px] tracking-[0.1em] text-eggshell uppercase">
        Cadru placeholder
      </span>
    </div>
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
            <span className="w-14 shrink-0 text-[10px] tracking-[0.08em] text-dim uppercase">{track.label}</span>
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
        <Placeholder label="Același proiect" tone="#1f2a1d" className="absolute inset-0 rounded-none border-0 opacity-60" />
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

/* ----------------------------------------------------------- F: workflow */

function Workflow() {
  const root = useRef<HTMLOListElement>(null);

  /* The steps light up one after another, once, as the card comes in. */
  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(el.querySelectorAll("[data-step]"), {
          autoAlpha: 0,
          y: 18,
          scale: 0.92,
          duration: 0.5,
          ease: "back.out(2.4)",
          stagger: 0.14,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="grid gap-3 md:grid-cols-4">
      {STEPS.map((step, index) => (
        <li
          key={step.title}
          data-step
          className="relative rounded-2xl border border-eggshell/10 bg-eggshell/[0.03] p-4"
        >
          <span className="grid size-8 place-items-center rounded-full bg-flux-cyan font-display text-sm font-bold text-background">
            {index + 1}
          </span>
          <p className="mt-3 font-display text-lg font-bold text-eggshell">{step.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-platinum/80">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

/* ---------------------------------------------------------------- section */

/**
 * "Producție de conținut": the creative services as a second bento, in the
 * same ink-and-paint family as the flux bento above it.
 *
 *   A  presentation video (9:16 slot, user-started play/pause)
 *   B  photo shoots, a stack that fans out on hover, focus or tap
 *   C  graphic design, type and colour specimen
 *   D  video editing, before/after on one frame plus an illustrated timeline
 *   E  delivery formats, a crop outline moving between 16:9, 1:1 and 9:16
 *   F  brief to delivery, four steps and the contact action
 *
 * Every image is a labelled placeholder until real work is dropped in.
 * Layout: 12 columns on desktop (A 8 wide beside B over C, D 8 beside E,
 * F full width), 2 on tablets, 1 on phones, always in A to F order.
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
          <p data-bento-lead className="text-xs tracking-[0.14em] text-dim uppercase">
            Producție de conținut
          </p>
          <h2
            data-bento-heading
            className="mt-5 font-display text-[length:clamp(2.3rem,1.1rem+4.4vw,5.25rem)] leading-[1.04] font-bold tracking-[-0.03em] text-balance text-eggshell"
          >
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
          <p
            data-bento-lead
            className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-platinum md:text-lg"
          >
            Filmări, ședințe foto, design grafic și editare video, de la idee la
            materialele finale.
          </p>
        </header>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-12 lg:gap-5">
          {/* A: the presentation. The video slot keeps 9:16; the spare width carries the copy. */}
          <BentoCard accent="var(--flux-cyan)" className="sm:col-span-2 lg:col-span-8 lg:row-span-2">
            <CardContent className="grid h-full items-center gap-6 sm:grid-cols-[auto_1fr] sm:gap-8">
              <VideoSlot />
              <div className="flex flex-col gap-4">
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
                <p className="text-sm text-dim">
                  Apasă pe play ca să pornești prezentarea. Nu rulează singură.
                </p>
              </div>
            </CardContent>
          </BentoCard>

          {/* B: photo shoots. */}
          <BentoCard accent="var(--flux-yellow)" className="lg:col-span-4">
            <CardHeader className="gap-y-1.5">
              <Title strong="Ședințe" soft="foto" />
              <Lead>Oameni. Produse. Branduri.</Lead>
            </CardHeader>
            <CardContent className="mt-auto">
              <PhotoStack />
            </CardContent>
          </BentoCard>

          {/* C: graphic design. */}
          <BentoCard accent="var(--flux-violet)" className="lg:col-span-4">
            <CardHeader className="gap-y-1.5">
              <Title strong="Design" soft="grafic" />
              <Lead>O identitate vizuală coerentă.</Lead>
            </CardHeader>
            <CardContent className="mt-auto">
              <DesignSpecimen />
            </CardContent>
          </BentoCard>

          {/* D: editing. */}
          <BentoCard accent="var(--flux-magenta)" className="sm:col-span-2 lg:col-span-8">
            <CardHeader className="gap-y-1.5">
              <Title strong="Editare" soft="video" />
              <Lead>Ritm, culoare și sunet. Fiecare cadru contează.</Lead>
            </CardHeader>
            <CardContent>
              <EditingCompare />
            </CardContent>
          </BentoCard>

          {/* E: delivery formats. */}
          <BentoCard accent="var(--flux-green)" className="sm:col-span-2 lg:col-span-4">
            <CardHeader className="gap-y-1.5">
              <Title strong="Formate" soft="de livrare" />
              <Lead>Același mesaj. Fiecare format.</Lead>
            </CardHeader>
            <CardContent className="flex-1">
              <FormatSwitch />
            </CardContent>
          </BentoCard>

          {/* F: brief to delivery. */}
          <BentoCard accent="var(--flux-cyan)" className="sm:col-span-2 lg:col-span-12">
            <CardHeader className="gap-y-1.5 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <Title strong="De la brief" soft="la livrare" />
                <Lead>Un singur partener pentru întregul proces.</Lead>
              </div>
              <a
                href="#contact"
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full bg-eggshell px-6 text-sm font-semibold text-background shadow-[4px_4px_0_var(--flux-cyan)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 md:mt-0 md:w-auto"
              >
                Hai să vorbim
              </a>
            </CardHeader>
            <CardContent>
              <Workflow />
            </CardContent>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
