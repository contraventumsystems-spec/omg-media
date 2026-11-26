"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { FLUX_BARS } from "@/app/components/flow-bento";
import { PopText } from "@/app/components/services-story";
import { bentoHeadingPop } from "@/app/lib/bento-motion";
import { capture, projects } from "@/app/lib/projects";
import { type PageKey, pages } from "@/app/lib/site";
import { useReducedMotion } from "@/app/lib/use-reduced-motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * "Urmează pe OMG": the teaser that closes a page. The menu bar lists the
 * pages; this makes the reader want one. Each page the reader has not seen
 * gets a promo: a small cartoon set playing something real from that page,
 * and a question that pops in word by word with the colour ghosts of the rest
 * of the site. The whole promo is one link.
 *
 *   Proiecte     the set flicks through the real site covers, static between
 *   Servicii     a live bar chart, the bars climbing toward a "cerere"
 *   Cum lucrăm   a signal runs along the six steps and lights each one
 *
 * A news ticker crosses the top, the promos zig-zag from md and a braided
 * signal runs behind them. Hover or focus: the set's picture slips, the
 * question splits into cyan and magenta, the tease line draws its bar.
 * Screens only animate while on screen; reduced motion shows still frames.
 */

/* ---------------------------------------------------------------- screens */

/** The real covers, one after the other, with a burst of static between. */
function ProjectsScreen({ live }: { live: boolean }) {
  const [index, setIndex] = useState(0);
  const [noise, setNoise] = useState(false);
  useEffect(() => {
    if (!live) return;
    let timer = 0;
    const interval = window.setInterval(() => {
      setNoise(true);
      timer = window.setTimeout(() => {
        setIndex((value) => (value + 1) % projects.length);
        setNoise(false);
      }, 220);
    }, 1900);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [live]);
  const project = projects[index];
  return (
    <>
      {projects.map((item, position) => (
        <Image
          key={item.slug}
          src={capture(item.slug).cover}
          alt=""
          fill
          sizes="300px"
          className={cn("object-cover object-top", position === index ? "opacity-100" : "opacity-0")}
        />
      ))}
      <span className="promo-static absolute inset-0" style={{ opacity: noise ? 1 : 0 }} />
      <span className="type-index absolute bottom-1.5 left-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[0.5625rem] text-eggshell">
        CH {String(index + 1).padStart(2, "0")} · {project.domain}
      </span>
    </>
  );
}

/** Bars in the six paints, climbing and settling, with the leu-to-request line over them. */
function AdsScreen() {
  return (
    <span className="absolute inset-0 flex flex-col bg-[#120e0b] p-2.5">
      <span className="type-index flex items-center justify-between text-[0.5625rem] text-dim">
        <span>lei → cereri</span>
        <span className="flux-blink text-flux-red">● live</span>
      </span>
      <span className="mt-2 flex flex-1 items-end gap-1.5">
        {FLUX_BARS.map((color, index) => (
          <span
            key={color}
            className={cn("promo-bar flex-1 rounded-t-sm", color)}
            style={{ "--i": index } as CSSProperties}
          />
        ))}
      </span>
      <span className="promo-sweep mt-1.5 h-[2px] rounded-full bg-eggshell/70" />
    </span>
  );
}

/** Six steps on a line; a signal runs along and lights each one in turn. */
function StepsScreen() {
  return (
    <span className="absolute inset-0 flex flex-col justify-center bg-[#120e0b] px-3">
      <span className="type-index text-center text-[0.5625rem] text-dim">brief → livrare</span>
      <span className="relative mt-3 flex items-center justify-between">
        <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-eggshell/20" />
        <span className="promo-signal absolute top-1/2 left-1 size-2 -translate-y-1/2 rounded-full bg-eggshell shadow-[0_0_10px_var(--eggshell)]" />
        {FLUX_BARS.map((color, index) => (
          <span
            key={color}
            className={cn("promo-step relative grid size-5 place-items-center rounded-full border-2 border-[#15110d]", color)}
            style={{ "--i": index } as CSSProperties}
          >
            <span className="type-index text-[0.5rem] text-background">{index + 1}</span>
          </span>
        ))}
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------- the set */

/** A cartoon set around a live screen. The screen is HTML, laid over the SVG glass. */
function PromoTv({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="promo-tv relative block aspect-[90/76] w-[min(68vw,280px)] shrink-0 md:w-[300px]">
      <svg viewBox="0 0 90 76" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        <path d="M45 10 L31 -4 M45 10 L60 -3" stroke="#91887a" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="31" cy="-4" r="2.6" fill={color} stroke="#15110d" strokeWidth="1.5" />
        <circle cx="60" cy="-3" r="2.6" fill={color} stroke="#15110d" strokeWidth="1.5" />
        {/* A rim of light in the page's colour, so the dark cabinet reads on the dark page. */}
        <rect x="0.5" y="7.5" width="89" height="63" rx="13.5" fill="none" stroke={color} strokeOpacity="0.55" strokeWidth="1.2" />
        <rect x="2" y="9" width="86" height="60" rx="12" fill="#3a3027" stroke="#15110d" strokeWidth="3" />
        <rect x="8" y="15" width="60" height="48" rx="8" fill="#120e0b" stroke="#15110d" strokeWidth="2.5" />
        <circle cx="78" cy="27" r="4" fill="#f3e9d2" stroke="#15110d" strokeWidth="2" />
        <circle cx="78" cy="41" r="4" fill="#f3e9d2" stroke="#15110d" strokeWidth="2" />
        <rect x="73" y="51" width="10" height="7" rx="2" fill={color} stroke="#15110d" strokeWidth="1.5" />
        <path d="M16 69 L12 76 M74 69 L78 76" stroke="#91887a" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {/* The glass: x 8..68, y 15..63 of the 90x76 drawing. */}
      <span className="promo-glass absolute overflow-hidden rounded-[9%]" style={{ left: "10%", top: "21%", width: "65%", height: "61%" }}>
        {children}
        <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.22)_0_1px,transparent_1px_3px)]" />
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.5)_100%)]" />
      </span>
      {/* Glow under the set, in the page's colour. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-[16%] -bottom-3 h-4 rounded-[50%] opacity-60 blur-md"
        style={{ background: color }}
      />
    </span>
  );
}

/* ---------------------------------------------------------------- promo */

function Promo({ pageKey, side, live }: { pageKey: PageKey; side: number; live: boolean }) {
  const page = pages[pageKey];
  const words = page.hook.split(" ");
  const last = words.pop() ?? "";
  return (
    <Link
      href={page.href}
      className={cn(
        "hook-link group flex flex-col items-center gap-6 rounded-3xl p-3 text-center outline-none focus-visible:ring-2 focus-visible:ring-eggshell/60 md:gap-12",
        side ? "md:flex-row-reverse md:text-right" : "md:flex-row md:text-left",
      )}
      style={{ ["--page" as string]: page.color }}
    >
      <PromoTv color={page.color}>
        {pageKey === "proiecte" ? <ProjectsScreen live={live} /> : pageKey === "servicii" ? <AdsScreen /> : <StepsScreen />}
      </PromoTv>
      <span className="block min-w-0 flex-1">
        <span className="type-index inline-flex items-center gap-2 text-dim">
          <span className="size-2 rounded-full" style={{ background: page.color }} />
          {page.label}
        </span>
        <span data-bento-heading className="hook-line type-hook mt-2 block text-balance text-eggshell">
          {words.map((word, index) => (
            <span key={`${word}-${index}`}>
              <PopText text={word} />{" "}
            </span>
          ))}
          <span className="relative inline-block whitespace-nowrap">
            <PopText text={last} />
            <span
              data-bento-bars
              aria-hidden="true"
              className="absolute inset-x-0 -bottom-[0.08em] h-[0.09em] origin-left rounded-full"
              style={{ background: page.color }}
            />
          </span>
        </span>
        <span data-bento-lead className="mt-4 inline-flex flex-col">
          <span className="type-index inline-flex items-center gap-2 text-platinum group-hover:text-eggshell">
            {page.tease}
            <ArrowRight aria-hidden="true" className="size-3.5 motion-safe:transition-transform group-hover:translate-x-1" />
          </span>
          <span aria-hidden="true" className="hook-bar mt-1.5 h-[2px] w-full rounded-full bg-[var(--page)]" />
        </span>
      </span>
    </Link>
  );
}

export function NextStops({ stops }: { stops: PageKey[] }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [inView, setInView] = useState(false);

  /* The screens only run while the block is on screen. */
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "120px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      /* Each question pops in as its promo arrives. */
      scope.querySelectorAll<HTMLElement>("[data-promo]").forEach((promo) => bentoHeadingPop(promo, "top 80%"));
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        /* The sets drop in with a bounce, from their own side. */
        scope.querySelectorAll<HTMLElement>("[data-promo]").forEach((promo, index) => {
          gsap.from(promo.querySelector(".promo-tv"), {
            y: -40,
            x: index % 2 ? 40 : -40,
            rotate: index % 2 ? 8 : -8,
            autoAlpha: 0,
            duration: 0.9,
            ease: "back.out(2.2)",
            scrollTrigger: { trigger: promo, start: "top 80%", once: true },
          });
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="urmeaza"
      className={cn("promo-block relative overflow-x-clip bg-background py-20 md:py-28", inView && !reduced ? "promo-live" : "")}
    >
      {/* The ticker. */}
      <div aria-hidden="true" className="relative border-y-2 border-[#15110d] bg-flux-yellow py-1.5 text-background">
        <div className="promo-ticker flex w-max gap-8 whitespace-nowrap">
          {[0, 1].map((copy) => (
            <span key={copy} className="type-index flex gap-8 font-bold">
              {Array.from({ length: 3 }).flatMap((_, round) =>
                stops.map((key) => (
                  <span key={`${copy}-${round}-${key}`} className="flex items-center gap-8">
                    <span>Urmează: {pages[key].label}</span>
                    <span>●</span>
                  </span>
                )),
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-5 md:px-10">
        {/* The braided signal behind the promos. */}
        <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full opacity-40">
          {["var(--flux-cyan)", "var(--flux-green)", "var(--flux-magenta)"].map((paint, index) => (
            <path
              key={paint}
              d={`M${48 + index * 2} 0 C ${20 + index * 3} 25, ${80 - index * 3} 55, ${50 + index * 2} 100`}
              fill="none"
              stroke={paint}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              pathLength={100}
              className="reel-flow"
            />
          ))}
        </svg>

        <h2 id="urmeaza" className="type-index relative mt-12 flex items-center justify-center gap-2 text-dim md:mt-16">
          <span aria-hidden="true" className="flux-blink size-2 rounded-full bg-flux-red" />
          Urmează pe OMG
        </h2>
        <ul className="relative mt-10 grid gap-16 md:mt-14 md:gap-20">
          {stops.map((key, index) => (
            <li key={key} data-promo>
              <Promo pageKey={key} side={index % 2} live={inView && !reduced} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
