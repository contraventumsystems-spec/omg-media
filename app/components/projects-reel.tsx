"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { channelChange } from "@/app/components/channel-change";
import { FLUX_BARS } from "@/app/components/flow-bento";
import type { Pointer, Screen, TvFx } from "@/app/components/project-tv";
import { PopText } from "@/app/components/services-story";
import { bentoHeadingPop } from "@/app/lib/bento-motion";
import {
  capture,
  channelOf,
  type Filter,
  FILTERS,
  liveFilters,
  matchesFilter,
  type Project,
  projects,
  SERVICES,
} from "@/app/lib/projects";
import { whatsappHref } from "@/app/lib/site";
import { useReducedMotion } from "@/app/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger, Observer, ScrollToPlugin);

const ProjectTv = dynamic(() => import("@/app/components/project-tv"), { ssr: false });

/**
 * /proiecte, the channel reel.
 *
 * The page is a stack of full-height sections: an intro, one per project,
 * and a free channel at the end. One swipe or wheel turn is one channel,
 * whatever its length: an Observer pages the window section by section while
 * the reel fills the screen, and lets go after the last one, so the closing
 * block and the footer scroll as usual. Keyboard scrolling stays native.
 * One television stays fixed in the middle of the screen. When a new section
 * takes the screen, the set changes channel the way the homepage tubes power:
 *
 *   off     the picture closes into a bright line (0 to 0.22 s)
 *   beam    the set flattens into that line and a beam of light in the new
 *           channel's colour shoots across the screen (0.12 to 0.5 s)
 *   on      the beam pulls back, the set springs back to shape and the new
 *           picture opens out of the line (0.5 to 1.3 s)
 *
 * The section's text scrolls in with the swipe, under the set. Behind
 * everything is a fixed layer the full height of the screen: the channel's
 * glow, three braided strands with a signal running along them, a drifting
 * band of the six bars, motes rising, and the channel number in outline.
 * All of it is CSS transforms and opacity, so it stays cheap on a phone.
 *
 * The filter bar shows only once a second service has work. Reduced motion
 * swaps the picture without the beam and stops the background.
 */

type Channel =
  | { kind: "intro" }
  | { kind: "project"; project: Project }
  | { kind: "outro" };

/** The filter a shared link opens on: /proiecte?canal=web */
function readLinkFilter(): Filter {
  const wanted = new URLSearchParams(window.location.search).get("canal");
  return FILTERS.some((item) => item.id === wanted) ? (wanted as Filter) : "toate";
}
const noSubscription = () => () => {};

const INTRO_COLOR = "#f3e9d2";
const OUTRO_COLOR = "#f8d50e";

function colorOf(channel: Channel | undefined) {
  if (!channel || channel.kind === "intro") return INTRO_COLOR;
  if (channel.kind === "outro") return OUTRO_COLOR;
  return channel.project.color;
}

function screenOf(channel: Channel | undefined, count: number): Screen {
  if (!channel || channel.kind === "intro") {
    return { kind: "ident", title: "OMG · Proiecte", subtitle: `${count} canale în emisie`, color: "#52cbec" };
  }
  if (channel.kind === "outro") {
    return { kind: "ident", title: "Canal liber", subtitle: "Următorul proiect poate fi al tău", color: OUTRO_COLOR };
  }
  return { kind: "site", src: capture(channel.project.slug).screen, color: channel.project.color };
}

function numberOf(channel: Channel | undefined) {
  if (!channel || channel.kind === "intro") return "00";
  if (channel.kind === "outro") return "++";
  return channelOf(channel.project.slug).replace("CH ", "");
}

/* Mote positions, fixed so server and client agree. */
const MOTES = [
  { left: 8, size: 3, duration: 14, delay: -2, drift: 14 },
  { left: 18, size: 2, duration: 18, delay: -9, drift: -10 },
  { left: 27, size: 4, duration: 16, delay: -5, drift: 8 },
  { left: 39, size: 2, duration: 20, delay: -14, drift: -6 },
  { left: 52, size: 3, duration: 15, delay: -7, drift: 12 },
  { left: 63, size: 2, duration: 19, delay: -1, drift: -12 },
  { left: 71, size: 4, duration: 17, delay: -11, drift: 6 },
  { left: 82, size: 2, duration: 13, delay: -4, drift: -8 },
  { left: 91, size: 3, duration: 21, delay: -16, drift: 10 },
];

/** Three strands braided across the whole screen, through the set. viewBox units, stretched to fit. */
const STRANDS = [
  { d: "M-5 92 C 20 70, 35 88, 50 50 S 78 18, 105 6", paint: "var(--flux-cyan)" },
  { d: "M-5 96 C 24 66, 30 92, 50 52 S 82 14, 105 10", paint: "var(--reel)" },
  { d: "M-5 100 C 28 62, 25 96, 50 54 S 86 10, 105 14", paint: "var(--flux-magenta)" },
];

/** The fixed layer behind the reel. */
function Backdrop({ number, numeral, strands }: {
  number: string;
  numeral: React.RefObject<HTMLSpanElement | null>;
  strands: React.RefObject<SVGGElement | null>;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 h-lvh overflow-hidden">
      {/* The channel's glow, centred on the set. Colour fades through a CSS transition, no filter blur. */}
      <div className="reel-glow absolute inset-0" />
      {/* The band of bars, drifting. */}
      <div className="absolute top-[64%] -left-[10%] w-[120%] -rotate-6 opacity-[0.07]">
        <div className="reel-band flex h-20 w-[200%] md:h-32">
          {[...FLUX_BARS, ...FLUX_BARS, ...FLUX_BARS, ...FLUX_BARS].map((color, index) => (
            <span key={`${color}-${index}`} className={`h-full flex-1 ${color}`} />
          ))}
        </div>
      </div>
      {/* The channel number, in outline, behind the set. */}
      <div className="absolute inset-x-0 top-[42%] flex -translate-y-1/2 justify-center">
        <span
          ref={numeral}
          className="font-display text-[62vw] leading-none text-transparent select-none md:text-[38vw]"
          style={{ WebkitTextStroke: "1px rgb(243 233 210 / 0.08)" } as CSSProperties}
        >
          {number}
        </span>
      </div>
      {/* The braided signal. A solid strand, and a dashed copy that flows along it. */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <g ref={strands} fill="none" strokeLinecap="round" opacity="0.4">
          {STRANDS.map((strand) => (
            <g key={strand.d} style={{ stroke: strand.paint }} className="reel-strand-color">
              <path d={strand.d} strokeWidth="1.5" vectorEffect="non-scaling-stroke" opacity="0.5" />
              <path d={strand.d} strokeWidth="2.5" vectorEffect="non-scaling-stroke" pathLength={100} className="reel-flow" />
            </g>
          ))}
        </g>
      </svg>
      {/* Motes, rising. */}
      {MOTES.map((mote) => (
        <span
          key={mote.left}
          className="reel-mote absolute bottom-0 rounded-full"
          style={
            {
              left: `${mote.left}%`,
              width: mote.size,
              height: mote.size,
              "--d": `${mote.duration}s`,
              "--delay": `${mote.delay}s`,
              "--x": `${mote.drift}vw`,
            } as CSSProperties
          }
        />
      ))}
      {/* Scanlines and a vignette over all of it. */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.12)_0_1px,transparent_1px_4px)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,transparent_40%,rgba(10,8,6,0.7)_100%)]" />
    </div>
  );
}

function ServiceChips({ project }: { project: Project }) {
  return (
    <>
      {project.services.map((service) => (
        <span
          key={service}
          className="type-index inline-flex h-8 items-center gap-1.5 rounded-full border border-eggshell/15 px-2.5 text-platinum"
        >
          <span className="size-1.5 rounded-full" style={{ background: SERVICES[service].color }} />
          {SERVICES[service].label}
        </span>
      ))}
    </>
  );
}

export function ProjectsReel() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const [picked, setFilter] = useState<Filter | null>(null);
  const linkFilter = useSyncExternalStore(noSubscription, readLinkFilter, () => "toate" as Filter);
  const filter = picked ?? linkFilter;
  const filters = liveFilters();

  const list = useMemo(() => projects.filter((project) => matchesFilter(project, filter)), [filter]);
  const channels = useMemo<Channel[]>(
    () => [{ kind: "intro" }, ...list.map((project) => ({ kind: "project" as const, project })), { kind: "outro" }],
    [list],
  );

  /* `shown` is what the set plays; it changes in the middle of the beam. */
  const [shown, setShown] = useState(0);
  const [inView, setInView] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const numeral = useRef<HTMLSpanElement>(null);
  const strands = useRef<SVGGElement>(null);
  const fx = useRef<TvFx>({ on: 0, squash: 0 });
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const target = useRef(0);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  const current = channels[Math.min(shown, channels.length - 1)];
  const screen = useMemo(() => screenOf(current, projects.length), [current]);
  const color = colorOf(current);

  /* The window is scrolled by script here, so CSS smooth scrolling is off while the reel is mounted. */
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("reel-paged");
    return () => html.classList.remove("reel-paged");
  }, []);

  /* The set turns a little toward a mouse. Touch screens keep it still. */
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const move = (event: PointerEvent) => {
      pointer.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  /* The fixed layers and the canvas only run while the reel is on screen. */
  useEffect(() => {
    const element = reel.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /** Off, beam, on. Interrupting it starts again from wherever the set is. */
  const tuneTo = (index: number) => {
    if (index === target.current) return;
    target.current = index;
    timeline.current?.kill();
    const next = channels[index];
    /* Warm the capture of this channel and the one after it. */
    [next, channels[index + 1]].forEach((channel) => {
      if (channel?.kind === "project") {
        const image = new Image();
        image.src = capture(channel.project.slug).screen;
      }
    });

    if (reduced) {
      fx.current.on = 1;
      fx.current.squash = 0;
      setShown(index);
      return;
    }
    const line = beam.current;
    if (line) line.style.setProperty("--beam", colorOf(next));
    timeline.current = gsap
      .timeline()
      .to(fx.current, { on: 0, duration: 0.22, ease: "power2.in" }, 0)
      .to(fx.current, { squash: 1, duration: 0.22, ease: "power3.in" }, 0.12)
      .fromTo(line, { scaleX: 0.06, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.3, ease: "expo.out" }, 0.28)
      .to(strands.current, { opacity: 1, duration: 0.2 }, 0.28)
      .call(() => setShown(index), undefined, 0.42)
      .to(line, { scaleX: 0.04, autoAlpha: 0, duration: 0.32, ease: "expo.in" }, 0.52)
      .to(fx.current, { squash: 0, duration: 0.8, ease: "elastic.out(1, 0.38)" }, 0.66)
      .to(fx.current, { on: 1, duration: 0.42, ease: "power2.out" }, 0.74)
      .to(strands.current, { opacity: 0.4, duration: 0.8 }, 0.8);

    /* The section's text rises in as the picture opens. */
    const section = reel.current?.querySelector<HTMLElement>(`[data-reel="${index}"]`);
    const parts = section?.querySelectorAll<HTMLElement>("[data-reel-in]");
    if (parts?.length) {
      gsap.fromTo(
        parts,
        { y: 26, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: "power3.out", delay: 0.6, overwrite: true },
      );
    }
  };

  /* The section that holds the middle of the screen is the channel on air. */
  useGSAP(
    () => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-reel]", reel.current);
      sections.forEach((section) => {
        const index = Number(section.dataset.reel);
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) tuneTo(index);
          },
        });
      });
    },
    { scope: root, dependencies: [channels, reduced], revertOnUpdate: true },
  );

  /*
   * One swipe, one channel. While the reel fills the screen, a swipe or a
   * wheel turn goes to the next or previous section; past the last one it
   * scrolls to the closing block and lets go. Trackpad momentum after a page
   * is swallowed by a short cooldown.
   */
  useGSAP(
    () => {
      const container = reel.current;
      if (!container) return;
      const sections = gsap.utils.toArray<HTMLElement>("[data-reel]", container);
      let busy = false;
      const topOf = (element: HTMLElement) => element.getBoundingClientRect().top + window.scrollY;

      const page = (direction: 1 | -1) => {
        if (busy) return;
        const tops = sections.map(topOf);
        const here = tops.reduce(
          (best, top, index) => (Math.abs(top - window.scrollY) < Math.abs(tops[best] - window.scrollY) ? index : best),
          0,
        );
        const last = sections.length - 1;
        let to: number;
        if (direction > 0 && here === last) to = topOf(container) + container.offsetHeight;
        else if (direction < 0 && here === 0) return;
        else {
          const next = Math.max(0, Math.min(last, here + direction));
          to = tops[next];
          /* The beam starts with the swipe, not when the section reaches the middle. */
          tuneTo(next);
        }
        busy = true;
        gsap.to(window, {
          scrollTo: { y: to, autoKill: false },
          duration: reduced ? 0 : 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            window.setTimeout(() => {
              busy = false;
            }, 380);
          },
        });
      };

      const observer = Observer.create({
        target: window,
        type: "wheel,touch",
        wheelSpeed: -1,
        tolerance: 12,
        preventDefault: true,
        onUp: () => page(1),
        onDown: () => page(-1),
      });

      /* Only while the reel fills the screen: the closing block and the footer scroll freely. */
      const sync = () => {
        const end = topOf(container) + container.offsetHeight - window.innerHeight;
        if (window.scrollY <= end + 2) observer.enable();
        else observer.disable();
      };
      sync();
      ScrollTrigger.create({ trigger: container, start: "top top", end: "bottom bottom", onToggle: sync, onRefresh: sync });
      window.addEventListener("scroll", sync, { passive: true });
      return () => {
        window.removeEventListener("scroll", sync);
        observer.kill();
      };
    },
    { scope: root, dependencies: [channels, reduced], revertOnUpdate: true },
  );

  /* The channel number rolls on every change. */
  useGSAP(
    () => {
      if (!numeral.current || reduced) return;
      gsap.fromTo(numeral.current, { yPercent: 12, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" });
    },
    { dependencies: [shown], scope: root },
  );

  /* Heading pop on the intro, like the bento sections. */
  useGSAP(
    () => {
      if (root.current) bentoHeadingPop(root.current, "top bottom");
    },
    { scope: root },
  );

  /* First power-on, once the set has loaded. */
  const powerOn = () => {
    if (reduced) {
      fx.current.on = 1;
      return;
    }
    gsap.to(fx.current, { on: 1, duration: 0.6, ease: "power2.out", delay: 0.2 });
  };

  const pickFilter = (next: Filter) => {
    if (next === filter) return;
    channelChange(() => {
      setFilter(next);
      const url = new URL(window.location.href);
      if (next === "toate") url.searchParams.delete("canal");
      else url.searchParams.set("canal", next);
      history.replaceState(null, "", url);
    });
  };

  /** The set and the primary button open the project behind a channel change. */
  const open = (event: React.MouseEvent, project: Project) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    channelChange(() => router.push(`/proiecte/${project.slug}`));
  };

  const onAir = current?.kind === "project" ? current.project : null;

  return (
    <div ref={root} style={{ "--reel": color } as CSSProperties}>
      <div className={cn("transition-opacity duration-300", inView ? "opacity-100" : "invisible opacity-0")}>
        <Backdrop number={numberOf(current)} numeral={numeral} strands={strands} />

        {/* The set, fixed in the middle. A link while a project is on air. */}
        <div className="reel-stage pointer-events-none fixed inset-x-0 top-0 z-[5] h-svh">
          <div
            ref={beam}
            aria-hidden="true"
            className="reel-beam invisible absolute left-0 h-1 w-full -translate-y-1/2 opacity-0"
          />
          <a
            href={onAir ? `/proiecte/${onAir.slug}` : "#reel-intro"}
            onClick={onAir ? (event) => open(event, onAir) : (event) => event.preventDefault()}
            tabIndex={onAir ? 0 : -1}
            aria-label={onAir ? `Deschide proiectul ${onAir.name}` : undefined}
            className={cn(
              "reel-tv absolute left-1/2 block -translate-x-1/2 -translate-y-1/2",
              onAir ? "pointer-events-auto cursor-pointer" : "pointer-events-none",
            )}
          >
            <ProjectTv
              screen={screen}
              pointer={pointer}
              active={inView}
              still={reduced}
              turn={-0.1}
              fx={fx}
              onReady={powerOn}
            />
          </a>
        </div>
      </div>

      {/* The sections. See-through, so the set and the backdrop show; only their text takes the pointer. */}
      <div ref={reel} className="pointer-events-none relative z-10">
        {channels.map((channel, index) => (
          <section
            key={channel.kind === "project" ? channel.project.slug : channel.kind}
            id={channel.kind === "intro" ? "reel-intro" : undefined}
            data-reel={index}
            aria-label={channel.kind === "project" ? channel.project.name : undefined}
            className="reel-section relative flex h-svh flex-col justify-end px-5 md:px-10"
          >
            <div className={cn("reel-caption pointer-events-auto mx-auto w-full text-center", channel.kind === "intro" ? "max-w-5xl" : "max-w-3xl")}>
              {channel.kind === "intro" ? (
                <>
                  <p data-bento-lead className="type-index text-dim">
                    Portofoliu · {projects.length} proiecte
                  </p>
                  <h1 data-bento-heading className="type-h2 mt-2 text-balance text-eggshell md:text-pretty">
                    {"Primele proiecte".split(" ").map((word) => (
                      <span key={word}>
                        <PopText text={word} />{" "}
                      </span>
                    ))}
                    <span className="relative inline-block whitespace-nowrap">
                      <span className="font-serif font-semibold">
                        <PopText text="semnate OMG" stop="text-flux-green" />
                      </span>
                      <span
                        data-bento-bars
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-[0.12em] flex h-[0.11em] origin-left"
                      >
                        {FLUX_BARS.map((bar) => (
                          <span key={bar} className={`h-full flex-1 ${bar}`} />
                        ))}
                      </span>
                    </span>
                  </h1>
                  <p data-bento-lead className="type-lead mx-auto mt-3 max-w-2xl text-platinum">
                    Suntem o echipă nouă. Tot ce rulează aici am construit noi, de la zero, sub numele
                    nostru. Lista crește cu fiecare client.
                  </p>
                  {filters.length > 2 ? (
                    <div data-bento-lead className="mt-4 flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Filtrează după serviciu">
                      {filters.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          role="radio"
                          aria-checked={item.id === filter}
                          onClick={() => pickFilter(item.id)}
                          className={cn(
                            "type-index inline-flex h-9 items-center gap-1.5 rounded-full border px-3",
                            item.id === filter
                              ? "border-transparent bg-eggshell text-background"
                              : "border-eggshell/15 text-platinum hover:text-eggshell",
                          )}
                        >
                          <span className="size-1.5 rounded-full" style={{ background: item.color }} />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  <div data-bento-lead className="mt-5 flex flex-col items-center gap-2 md:mt-6">
                    <span className="type-index text-dim">Glisează ca să schimbi canalul</span>
                    <span className="scroll-hint relative h-8 w-px overflow-hidden bg-eggshell/15" />
                  </div>
                </>
              ) : channel.kind === "project" ? (
                <>
                  <p data-reel-in className="type-index text-dim">
                    <span style={{ color: channel.project.color }}>{channelOf(channel.project.slug)}</span>
                    {" · "}
                    {channel.project.sector}
                  </p>
                  <h2 data-reel-in className="type-h2 mt-2 text-eggshell">
                    {channel.project.name}
                  </h2>
                  <p data-reel-in className="type-body mx-auto mt-2 line-clamp-2 text-platinum">
                    {channel.project.summary}
                  </p>
                  <div data-reel-in className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <ServiceChips project={channel.project} />
                    <a
                      href={`/proiecte/${channel.project.slug}`}
                      onClick={(event) => open(event, channel.project)}
                      className="type-button inline-flex h-11 items-center rounded-full bg-eggshell px-5 text-background"
                    >
                      Vezi proiectul
                    </a>
                    <a
                      href={channel.project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${channel.project.domain}, site live`}
                      className="type-button inline-flex h-11 items-center gap-1.5 rounded-full border border-eggshell/20 px-4 text-eggshell hover:border-eggshell/50"
                    >
                      Live <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <p data-reel-in className="type-index text-dim">
                    Canal liber
                  </p>
                  <h2 data-reel-in className="type-h2 mt-2 text-balance text-eggshell">
                    Următorul canal poate fi <span className="font-serif font-semibold">al tău</span>
                    <span className="text-flux-yellow">.</span>
                  </h2>
                  <div data-reel-in className="mt-5 flex flex-wrap items-center justify-center gap-2">
                    <a
                      href={whatsappHref("Bună. Vreau să fiu următorul proiect OMG.")}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cta="proiecte-outro"
                      className="type-button inline-flex h-11 items-center rounded-full bg-eggshell px-5 text-background"
                    >
                      Scrie-ne pe WhatsApp
                    </a>
                    <Link
                      href="/#drum"
                      className="type-button inline-flex h-11 items-center rounded-full border border-eggshell/20 px-5 text-eggshell hover:border-eggshell/50"
                    >
                      Cum lucrăm
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
