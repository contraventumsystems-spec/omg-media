"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { channelChange } from "@/app/components/channel-change";
import { FLUX_BARS } from "@/app/components/flow-bento";
import type { Pointer, Screen } from "@/app/components/project-tv";
import { PopText } from "@/app/components/services-story";
import { bentoHeadingPop } from "@/app/lib/bento-motion";
import { capture, channelOf, projectBySlug, SERVICES } from "@/app/lib/projects";
import { whatsappHref } from "@/app/lib/site";
import { useReducedMotion } from "@/app/lib/use-reduced-motion";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

const ProjectTv = dynamic(() => import("@/app/components/project-tv"), { ssr: false });

/**
 * One project, /proiecte/[slug].
 *
 *   hero      name and services beside the television playing the site
 *   story     the summary in large centred type, the hook's pop, then the copy
 *   screens   a desktop window and a phone, pinned, both scrolled by the
 *             page's own scroll through the real captures; the bar band and
 *             the three strands drift behind them
 *   next      the next channel, opened behind a channel change
 */
export function ProjectDetail({ slug, nextSlug }: { slug: string; nextSlug: string }) {
  const project = projectBySlug(slug);
  const next = projectBySlug(nextSlug);
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });
  const reduced = useReducedMotion();
  const [tvOn, setTvOn] = useState(true);
  const tvArea = useRef<HTMLDivElement>(null);

  const screen = useMemo<Screen | null>(
    () => (project ? { kind: "site", src: capture(project.slug).screen, color: project.color } : null),
    [project],
  );

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

  useEffect(() => {
    const element = tvArea.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setTvOn(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      scope.querySelectorAll<HTMLElement>("[data-pop-scope]").forEach((element) => bentoHeadingPop(element));

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        /* The screens: each capture scrolls through its frame while the track is pinned. */
        const track = scope.querySelector<HTMLElement>("[data-screens-track]");
        if (track) {
          scope.querySelectorAll<HTMLElement>("[data-scroll-shot]").forEach((shot) => {
            const frame = shot.parentElement;
            if (!frame) return;
            gsap.to(shot, {
              y: () => -Math.max(0, shot.offsetHeight - frame.clientHeight),
              ease: "none",
              scrollTrigger: {
                trigger: track,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.5,
                invalidateOnRefresh: true,
              },
            });
          });
          gsap.fromTo(
            "[data-screens-band]",
            { xPercent: 0 },
            {
              xPercent: -22,
              ease: "none",
              scrollTrigger: { trigger: track, start: "top bottom", end: "bottom top", scrub: 0.6 },
            },
          );
          gsap.from("[data-screens-phone]", {
            yPercent: 30,
            rotate: 6,
            ease: "none",
            scrollTrigger: { trigger: track, start: "top bottom", end: "top top", scrub: 0.6 },
          });
          gsap.fromTo(
            "[data-strand]",
            { drawSVG: "0%" },
            {
              drawSVG: "100%",
              ease: "none",
              scrollTrigger: { trigger: track, start: "top 80%", end: "top top", scrub: 0.6 },
            },
          );
        }

        /* Story paragraphs rise in. */
        gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((element) => {
          gsap.from(element, {
            autoAlpha: 0,
            y: 24,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 85%", once: true },
          });
        });
      });
    },
    { scope: root },
  );

  if (!project || !next || !screen) return null;
  const shots = capture(project.slug);

  const openNext = (event: React.MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    channelChange(() => router.push(`/proiecte/${next.slug}`));
  };

  return (
    <div ref={root}>
      {/* Hero. */}
      <section id="hero" className="relative overflow-x-clip px-5 pt-28 pb-12 md:px-10 md:pt-32 md:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-[-10%] size-[80vmin] -translate-y-1/2 rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: project.color }}
        />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-12">
          <div data-pop-scope className="order-2 md:order-1">
            <Link href="/proiecte" className="type-nav inline-flex items-center gap-2 text-dim hover:text-eggshell">
              <ArrowLeft className="size-4" aria-hidden="true" /> Ghidul TV
            </Link>
            <p data-bento-lead className="type-index mt-6 text-dim">
              <span style={{ color: project.color }}>{channelOf(project.slug)}</span> · {project.sector}
            </p>
            <h1 data-bento-heading className="type-h2 relative mt-3 inline-block text-eggshell">
              {project.name.split(" ").map((word, index, words) => (
                <span key={`${word}-${index}`}>
                  <PopText text={word} />
                  {index < words.length - 1 ? " " : null}
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
            </h1>
            <div data-bento-lead className="mt-6 flex flex-wrap gap-2">
              {project.services.map((service) => (
                <span
                  key={service}
                  className="type-index inline-flex items-center gap-2 rounded-full border border-eggshell/15 px-3 py-1.5 text-platinum"
                >
                  <span className="size-2 rounded-full" style={{ background: SERVICES[service].color }} />
                  {SERVICES[service].label}
                </span>
              ))}
            </div>
            <div data-bento-lead className="mt-8 flex flex-wrap gap-3">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="type-button inline-flex h-12 items-center gap-2 rounded-full bg-eggshell px-5 text-background"
              >
                Vezi {project.domain} <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href={whatsappHref(`Bună. Am văzut proiectul ${project.name} și vreau ceva asemănător.`)}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="proiect-hero"
                className="type-button inline-flex h-12 items-center rounded-full border border-eggshell/20 px-5 text-eggshell hover:border-eggshell/50"
              >
                Vreau ceva asemănător
              </a>
            </div>
          </div>

          <div ref={tvArea} className="relative order-1 aspect-[4/3] w-full md:order-2">
            <ProjectTv screen={screen} pointer={pointer} active={tvOn} still={reduced} turn={0.3} />
          </div>
        </div>
      </section>

      {/* Story, in the floor hook's voice: large, centred, then the copy. */}
      <section className="px-5 py-20 md:px-10 md:py-32">
        <div data-pop-scope className="mx-auto max-w-4xl text-center">
          <p data-bento-lead className="type-index text-dim">Pe scurt</p>
          <p data-bento-heading className="type-hook mt-4 text-balance text-eggshell">
            {project.summary.split(" ").map((word, index) => (
              <span key={`${word}-${index}`}>
                <PopText text={word} />{" "}
              </span>
            ))}
            <span data-bento-bars aria-hidden="true" className="sr-only" />
          </p>
          {project.story.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} data-rise className="type-lead mx-auto mt-8 text-platinum">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* The site on two screens, scrolled by the reader. */}
      <section data-screens-track aria-label={`${project.name} pe desktop și pe telefon`} className="relative h-[260svh]">
        <div className="sticky top-0 flex h-svh items-center overflow-clip px-5 md:px-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div data-screens-band className="absolute top-[30%] left-[-10%] flex h-28 w-[150%] -rotate-3 opacity-[0.08] md:h-44">
              {[...FLUX_BARS, ...FLUX_BARS].map((color, index) => (
                <span key={`${color}-${index}`} className={`h-full flex-1 ${color}`} />
              ))}
            </div>
            <svg viewBox="0 0 1200 800" preserveAspectRatio="none" className="absolute inset-0 size-full">
              {["var(--flux-cyan)", "var(--flux-green)", "var(--flux-magenta)"].map((paint, index) => (
                <path
                  key={paint}
                  data-strand
                  d={`M-20 ${640 + index * 10} C 260 ${520 + index * 10}, 420 ${760 + index * 10}, 700 ${600 + index * 10} S 1100 ${280 + index * 10}, 1240 ${200 + index * 10}`}
                  fill="none"
                  stroke={paint}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              ))}
            </svg>
          </div>

          <div className="relative mx-auto flex w-full max-w-6xl items-end justify-center gap-4 md:gap-10">
            {/* Desktop window. */}
            <figure className="hidden w-full max-w-3xl md:block">
              <div className="overflow-hidden rounded-2xl border border-eggshell/15 bg-card shadow-2xl shadow-black/50">
                <div className="flex items-center gap-2 border-b border-eggshell/10 px-4 py-2.5">
                  <span className="size-2.5 rounded-full bg-flux-red" />
                  <span className="size-2.5 rounded-full bg-flux-yellow" />
                  <span className="size-2.5 rounded-full bg-flux-green" />
                  <span className="type-index ml-3 truncate rounded-full bg-background/60 px-3 py-1 text-dim normal-case">
                    {project.domain}
                  </span>
                </div>
                <div className="relative h-[56svh] overflow-hidden">
                  <Image
                    data-scroll-shot
                    src={shots.screen}
                    alt={`${project.name}, pagina principală pe desktop`}
                    width={1024}
                    height={4096}
                    sizes="(min-width: 768px) 768px, 0px"
                    className="absolute inset-x-0 top-0 h-auto w-full"
                  />
                </div>
              </div>
            </figure>
            {/* Phone. */}
            <figure data-screens-phone className="w-[min(72vw,300px)] shrink-0 md:-ml-24 md:w-[260px]">
              <div className="rounded-[2.4rem] border border-eggshell/20 bg-black p-2.5 shadow-2xl shadow-black/60">
                <div className="relative h-[62svh] overflow-hidden rounded-[1.9rem] md:h-[52svh]">
                  <Image
                    data-scroll-shot
                    src={shots.phone}
                    alt={`${project.name}, pagina principală pe telefon`}
                    width={520}
                    height={4096}
                    sizes="300px"
                    className="absolute inset-x-0 top-0 h-auto w-full"
                  />
                </div>
              </div>
              <figcaption className="type-index mt-3 text-center text-dim">Pe telefon</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Next channel. */}
      <section className="px-5 py-16 md:px-10 md:py-24">
        <a
          href={`/proiecte/${next.slug}`}
          onClick={openNext}
          className="group relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-eggshell/10 bg-card md:grid-cols-[1fr_1.2fr]"
        >
          <div className="relative z-10 flex flex-col justify-center p-6 md:p-10">
            <p className="type-index text-dim">
              Canalul următor · <span style={{ color: next.color }}>{channelOf(next.slug)}</span>
            </p>
            <p className="type-h2 mt-3 text-eggshell">{next.name}</p>
            <p className="type-body mt-2 text-platinum">{next.sector}</p>
            <span className="type-button mt-6 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-eggshell px-5 text-background">
              Schimbă canalul
            </span>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={capture(next.slug).cover}
              alt=""
              fill
              sizes="(min-width: 768px) 600px, 100vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgba(21,17,13,0.25)_0_2px,transparent_2px_5px)]" />
          </div>
        </a>
      </section>
    </div>
  );
}
