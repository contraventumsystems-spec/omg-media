"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, LoaderCircle, TrendingDown, TrendingUp } from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ReferenceDot,
  XAxis,
  YAxis,
} from "recharts";
import { ChannelIcon } from "@/app/components/channel-icons";
import {
  clearPop,
  drawPop,
  PopText,
  readPops,
} from "@/app/components/services-story";
import {
  count,
  formatNumber,
  formatPercent,
  PAGES,
  RANGES,
  type RangeId,
  SERIES,
  SOURCES,
} from "@/app/lib/flow-data";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HEADING =
  "Fiecare leu se vede, de la reclamă la cerere.";
/** The last words get the seven-bar stroke, as "crește." does on the floor. */
const PAYOFF_WORDS = 2;

/** The one-flow feed: one request, every step after it. */
const STEPS = [
  "Audit pe nișa și zona ta",
  "Strategie pe ce a funcționat",
  "Reclame pe Google, Meta și TikTok",
  "Landing page optimizată",
  "Cerere măsurată, gata de răspuns",
] as const;

const AD_CHANNELS = [
  {
    id: "google",
    tab: "Google Ads",
    icons: ["google"],
    body: "Oameni care caută deja ce vinzi, în zona ta. Search, Maps și YouTube, cu cuvinte negative bine puse și fiecare conversie urmărită.",
    kpis: ["Cost pe cerere", "Cotă de afișare", "Termeni de căutare"],
  },
  {
    id: "meta",
    tab: "Meta Ads",
    icons: ["facebook", "instagram"],
    body: "Facebook și Instagram, cu audiențe construite pe clientul tău, nu pe ghicit. Creative testate pe rând, pixel și evenimente trimise de pe server.",
    kpis: ["Cost pe lead", "Rată de click", "Frecvență"],
  },
  {
    id: "tiktok",
    tab: "TikTok Ads",
    icons: ["tiktok"],
    body: "Video scurt care oprește scroll-ul în primele secunde și aduce cereri, nu doar vizualizări.",
    kpis: ["Vizionări de 6 s", "Cost pe click", "Cereri din video"],
  },
] as const;

/** The six TV bars of the work beat, in screen order. */
export const FLUX_BARS = [
  "bg-flux-yellow",
  "bg-flux-cyan",
  "bg-flux-green",
  "bg-flux-magenta",
  "bg-flux-red",
  "bg-flux-violet",
] as const;

const FOUNDATION = ["Audiență curată", "Backlinks", "Pagini rapide", "Optimizare continuă"];

/** Inactive bars: a step up from the card, like unpainted cel. */
const INK = "#2b241c";

const visitorsChart = {
  visitors: { label: "Vizitatori", color: "var(--flux-cyan)" },
} satisfies ChartConfig;
const costChart = {
  cost: { label: "Cost pe cerere", color: "var(--flux-green)" },
} satisfies ChartConfig;
const conversionChart = {
  value: { label: "Conversie", color: "var(--flux-yellow)" },
} satisfies ChartConfig;
const revenueChart = {
  revenue: { label: "Vânzări", color: "var(--flux-magenta)" },
} satisfies ChartConfig;

/* ------------------------------------------------------------------ hooks */

/** True once the element has come into view. Charts mount then, so they animate in. */
function useSeen(ref: RefObject<Element | null>) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return seen;
}

/** A number that rolls to its new value instead of jumping. */
function useRolling(target: number, live: boolean, duration = 700) {
  const [value, setValue] = useState(0);
  const shown = useRef(0);
  useEffect(() => {
    if (!live) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = shown.current;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = still ? 1 : Math.min(1, (now - start) / duration);
      const next = from + (target - from) * (1 - (1 - t) ** 3);
      shown.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, live, duration]);
  return value;
}

function Rolling({
  value,
  live,
  format,
}: {
  value: number;
  live: boolean;
  format: (value: number) => string;
}) {
  return <>{format(useRolling(value, live))}</>;
}

/* ------------------------------------------------------------- card parts */

/** A shadcn Card in ink and paint. On hover it lifts off a hard cel shadow in its own colour. */
export function BentoCard({
  accent,
  className,
  children,
}: {
  accent: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      data-bento-card
      style={{ "--accent": accent } as CSSProperties}
      className={cn(
        "bento-card gap-5 rounded-3xl text-platinum ring-0 [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)] md:[--card-spacing:--spacing(7)]",
        className,
      )}
    >
      {children}
    </Card>
  );
}

/** Card title. Weight marks the subject; the rest stays in the same ink. */
export function Title({ strong, soft }: { strong: string; soft: string }) {
  return (
    <CardTitle className="type-title text-balance text-eggshell">
      {strong} <span className="font-normal">{soft}</span>
    </CardTitle>
  );
}

/** The line under a card title. */
export function Lead({ children }: { children: ReactNode }) {
  return <CardDescription className="type-body text-platinum">{children}</CardDescription>;
}

/** One labelled row with a bar that grows to its share. */
function ShareRow({
  icon,
  label,
  value,
  max,
  live,
  delay,
}: {
  icon?: ReactNode;
  label: string;
  value: number;
  max: number;
  live: boolean;
  delay: number;
}) {
  return (
    <li>
      <div className="flex items-center gap-2.5 text-sm text-eggshell">
        {icon}
        <span className="truncate">{label}</span>
        <span className="ml-auto font-display font-bold tabular-nums">
          <Rolling value={value} live={live} format={formatNumber} />
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-eggshell/[0.08]">
        <div
          className="h-full origin-left rounded-full bg-eggshell/80 motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            transform: `scaleX(${live ? value / max : 0})`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </li>
  );
}

/** Wireframe arrow for the entry pages, printed a hair off register. */
function ArrowArt() {
  const front = "M60 14 102 58H80v72H40V58H18Z";
  return (
    <svg
      viewBox="0 0 130 150"
      aria-hidden="true"
      className="mx-auto hidden h-44 w-auto sm:block"
    >
      <g
        className="flux-bob"
        fill="none"
        strokeWidth={1.5}
        strokeLinejoin="round"
      >
        <path d={front} transform="translate(-3 2)" stroke="var(--flux-cyan)" opacity={0.55} />
        <path d={front} transform="translate(3 -2)" stroke="var(--flux-magenta)" opacity={0.55} />
        <path
          d="M60 14 76 4 118 48 102 58M118 48H96v72l-16 10M80 58l16-10"
          stroke="var(--eggshell)"
          opacity={0.45}
        />
        <path d={front} stroke="var(--eggshell)" fill="#1b1612" />
      </g>
    </svg>
  );
}

/**
 * The request walks the steps as the visitor scrolls past the card: the
 * scroll is the clock. A violet rail fills with the same progress, and both
 * run backwards when scrolling up. Its own state, so the charts never re-render for it.
 */
function FlowFeed() {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useGSAP(
    () => {
      const el = root.current;
      const fill = el?.querySelector<HTMLElement>("[data-feed-fill]");
      if (!el || !fill) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          fill,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "bottom 35%",
              scrub: 0.4,
              onUpdate: (self) => {
                const next = Math.min(
                  STEPS.length,
                  Math.floor(self.progress * (STEPS.length + 1)),
                );
                setStep((prev) => (prev === next ? prev : next));
              },
            },
          },
        );
      });
      media.add("(prefers-reduced-motion: reduce)", () => {
        setStep(STEPS.length);
      });
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-eggshell/[0.08]">
        <div data-feed-fill className="h-full origin-left rounded-full bg-flux-violet" />
      </div>
    <ol className="space-y-2" aria-label="Pașii fluxului">
      {STEPS.map((item, index) => {
        const done = index < step;
        const current = index === step;
        return (
          <li
            key={item}
            className={cn(
              "type-body flex items-center gap-3 rounded-2xl border px-3 py-2.5 motion-safe:transition-[background-color,border-color,color] motion-safe:duration-300",
              current
                ? "border-flux-violet/60 bg-flux-violet/[0.12] text-eggshell"
                : done
                  ? "border-eggshell/10 bg-eggshell/[0.03] text-eggshell"
                  : "border-eggshell/[0.06] text-dim",
            )}
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                done
                  ? "bg-flux-green text-background motion-safe:animate-in motion-safe:zoom-in-50 motion-safe:duration-200"
                  : current
                    ? "text-flux-violet"
                    : "bg-eggshell/[0.06] text-dim",
              )}
            >
              {done ? (
                <Check className="size-3.5 motion-safe:animate-in motion-safe:zoom-in-0 motion-safe:spin-in-[-90deg] motion-safe:duration-300" strokeWidth={3} aria-hidden="true" />
              ) : current ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            {item}
          </li>
        );
      })}
    </ol>
    </div>
  );
}

/* ---------------------------------------------------------------- section */

/**
 * "Fluxul": one flow, shown as a sample dashboard on shadcn/ui cards.
 *
 * Pick a period on the visitors card, hover a bar to preview a point, click to
 * keep it, and every tile turns to it: the cost of an enquiry, where visitors
 * came from, the conversion ring, sales by channel and the entry pages. The
 * flow feed and the audit tile carry the offer: one request, an audit of the
 * niche, then Google, Meta and TikTok ads into an optimised landing page.
 *
 * All numbers are sample data (app/lib/flow-data.ts) and the page says so.
 * Charts mount when the grid comes into view, so Recharts draws them in.
 * The heading pops like the floor hook. Reduced motion skips the pops, the
 * card entrance and the feed loop.
 */
export function FlowBento() {
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const live = useSeen(grid);

  const [range, setRange] = useState<RangeId>("zi");
  const points = SERIES[range];
  const last = points.length - 1;
  const [pinned, setPinned] = useState(last);
  const [hover, setHover] = useState<number | null>(null);
  const active = Math.min(hover ?? pinned, last);
  const point = points[active];
  const spec = RANGES.find((item) => item.id === range) ?? RANGES[0];

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const heading = scope.querySelector<HTMLElement>("[data-flux-heading]");
        const bars = scope.querySelector<HTMLElement>("[data-flux-bars]");
        if (!heading || !bars) return;
        const pops = readPops(heading);
        const intro = gsap.timeline({
          paused: true,
          onUpdate: () => pops.forEach(drawPop),
        });
        pops.forEach((pop, index) => {
          const at = index * 0.08;
          intro
            .to(pop.state, { scale: 1, duration: 0.6, ease: "back.out(3)" }, at)
            .to(pop.state, { alpha: 1, duration: 0.18 }, at)
            .to(
              pop.state,
              { lock: 1, duration: 1, ease: "elastic.out(1, 0.5)" },
              at + 0.09,
            );
        });
        intro
          .fromTo(
            bars,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.5, ease: "power2.out" },
            pops.length * 0.08 + 0.15,
          )
          .from(
            scope.querySelectorAll("[data-flux-lead]"),
            { autoAlpha: 0, y: 16, duration: 0.6, stagger: 0.1, ease: "power2.out" },
            0.45,
          );
        pops.forEach(drawPop);
        ScrollTrigger.create({
          trigger: heading,
          /* Waits until the whole line is on screen, so the pop is seen. */
          start: "top 60%",
          once: true,
          onEnter: () => {
            intro.play();
          },
        });

        return () => pops.forEach(clearPop);
      });

      /*
       * Desktop and tablet: a rubber-hose drop. Each card falls in stretched
       * and turned, overshoots, squashes flat as it lands and wobbles back.
       * Only then does its content pop in, header first.
       */
      media.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const cards = gsap.utils.toArray<HTMLElement>("[data-bento-card]", scope);
          const partsOf = (batch: Element[]) =>
            batch.flatMap((card) =>
              Array.from(
                card.querySelectorAll<HTMLElement>(
                  "[data-slot=card-header], [data-slot=card-content]",
                ),
              ),
            );
          gsap.set(cards, {
            autoAlpha: 0,
            y: 160,
            scaleX: 0.82,
            scaleY: 1.22,
            rotation: (index: number) => (index % 2 === 0 ? -7 : 7),
            transformOrigin: "50% 100%",
          });
          gsap.set(partsOf(cards), { autoAlpha: 0, y: 24 });
          ScrollTrigger.batch(cards, {
            start: "top 92%",
            once: true,
            onEnter: (batch) => {
              const land = gsap.timeline();
              land
                .to(batch, {
                  keyframes: [
                    { autoAlpha: 1, y: -28, rotation: 0, scaleX: 0.9, scaleY: 1.12, duration: 0.38, ease: "power3.out" },
                    { y: 0, scaleX: 1.12, scaleY: 0.84, duration: 0.13, ease: "power2.in" },
                    { scaleX: 1, scaleY: 1, duration: 0.75, ease: "elastic.out(1.1, 0.35)" },
                  ],
                  stagger: 0.11,
                  overwrite: true,
                  /*
                   * Hand the transform back to CSS, so the hover lift works.
                   * Done on complete: clearProps inside keyframes runs after the
                   * first keyframe, and the later ones write the transform again.
                   */
                  onComplete: () => {
                    gsap.set(batch, {
                      clearProps: "transform,transformOrigin,opacity,visibility",
                    });
                  },
                })
                .to(
                  partsOf(batch),
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "back.out(2.6)",
                    stagger: 0.05,
                    clearProps: "transform,opacity,visibility",
                  },
                  0.48,
                );
            },
          });
        },
      );

      /*
       * Phones: one column, so the cards swing in from alternating sides,
       * scrubbed to the scroll. They follow the thumb and reverse with it.
       */
      media.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.utils
            .toArray<HTMLElement>("[data-bento-card]", scope)
            .forEach((card, index) => {
              const side = index % 2 === 0 ? -1 : 1;
              gsap.fromTo(
                card,
                { autoAlpha: 0, x: side * 90, rotation: side * 6, scale: 0.86 },
                {
                  autoAlpha: 1,
                  x: 0,
                  rotation: 0,
                  scale: 1,
                  ease: "back.out(1.7)",
                  scrollTrigger: {
                    trigger: card,
                    start: "top 100%",
                    end: "top 60%",
                    scrub: 0.5,
                  },
                },
              );
            });
        },
      );
    },
    { scope: root },
  );

  const changeRange = (next: RangeId) => {
    /* Changing the period is changing the channel: every tile flickers in hard steps. */
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      grid.current
        ?.querySelectorAll<HTMLElement>("[data-slot=card-content]")
        .forEach((el, index) =>
          el.animate(
            [{ opacity: 1 }, { opacity: 0.1 }, { opacity: 0.9 }, { opacity: 0.3 }, { opacity: 1 }],
            { duration: 240, delay: index * 25, easing: "steps(4, jump-none)" },
          ),
        );
    }
    setRange(next);
    setPinned(SERIES[next].length - 1);
    setHover(null);
  };

  const costChange = (point.cost - point.prevCost) / point.prevCost;
  const cheaper = costChange <= 0;
  const maxSource = Math.max(...point.sources);
  const maxPage = Math.max(...point.pages);
  const best = point.channels.reduce((top, channel) =>
    channel.rate > top.rate ? channel : top,
  );
  const conversion = point.clients / point.visitors;
  const axis = [points[0].label, points[Math.floor(last / 2)].label, points[last].label];

  const headingWords = HEADING.split(" ");
  const headingLead = headingWords.slice(0, -PAYOFF_WORDS);
  const headingPayoff = headingWords.slice(-PAYOFF_WORDS);

  /*
   * Labels over bars are HTML, placed from the data. Recharts hides its own
   * labels while a bar animates, and a hover restarts that animation.
   * Both charts pin the y domain to [0, dataMax], so a bar's top is exact.
   * Those captions keep the margin the chart reserved for them, so they do not
   * take the metric role, and this pass does not add motion to them.
   */
  const maxVisitors = Math.max(...points.map((item) => item.visitors));
  const maxRevenue = Math.max(...point.channels.map((channel) => channel.revenue));

  /*
   * overflow-hidden, not overflow-x-clip: on phones the swing-in parks cards
   * off to the side, and Safari before iOS 16 ignores `clip`, widens the page
   * and zooms the whole site out.
   */
  return (
    <section
      id="proces"
      className="scroll-mt-28 overflow-hidden bg-background px-5 py-24 md:scroll-mt-24 md:px-10 md:py-32"
    >
      <div ref={root} className="mx-auto w-full max-w-6xl">
        {/* Shared paint for the charts. */}
        <svg aria-hidden="true" className="absolute size-0">
          <defs>
            <linearGradient id="flux-bar-on" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--flux-cyan)" />
              <stop offset="100%" stopColor="var(--flux-cyan)" stopOpacity={0.35} />
            </linearGradient>
            <linearGradient id="flux-cost-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--flux-green)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--flux-green)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="flux-best" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--flux-magenta)" />
              <stop offset="100%" stopColor="var(--flux-magenta)" stopOpacity={0.4} />
            </linearGradient>
          </defs>
        </svg>

        <header className="mx-auto max-w-5xl text-center">
          <p data-flux-lead className="type-index text-dim">
            Fluxul
          </p>
          <h2
            data-flux-heading
            className="type-h2 mt-2 text-balance text-eggshell"
          >
            {headingLead.map((word, index) => (
              <span key={`${word}-${index}`}>
                <PopText text={word} />{" "}
              </span>
            ))}
            <span className="relative inline-block whitespace-nowrap">
              {headingPayoff.map((word, index) => (
                <span key={`${word}-${index}`}>
                  <PopText text={word} />
                  {index < headingPayoff.length - 1 ? " " : null}
                </span>
              ))}
              <span
                data-flux-bars
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-[0.12em] flex h-[0.11em] origin-left"
              >
                {FLUX_BARS.map((color) => (
                  <span key={color} className={`h-full flex-1 ${color}`} />
                ))}
              </span>
            </span>
          </h2>
          <p data-flux-lead className="type-lead mx-auto mt-4 text-platinum">
            Plecăm de la o singură cerere și construim tot traseul logic, pe ce a
            funcționat în piață și pe ce a funcționat la tine: de la idee la
            reclamă, la landing page optimizată cu software de ultimă generație.
          </p>
          {/* Sample-data note, kept with the figures below it. */}
          <div data-flux-lead className="mt-6 flex justify-center md:mt-8">
            <Badge
              variant="outline"
              className="type-note h-auto max-w-full gap-2 border-eggshell/15 px-3 py-1 whitespace-normal text-dim"
            >
              <span className="flux-blink size-1.5 rounded-full bg-flux-red" />
              Date demonstrative · exemplu: firmă de renovări, București
            </Badge>
          </div>
        </header>

        <div
          ref={grid}
          className="mt-3 grid gap-4 md:mt-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {/* The audit: no templates, and the three ad platforms. */}
          <BentoCard accent="var(--flux-yellow)" className="md:col-span-2">
            <CardHeader className="gap-y-3">
              <Badge className="bg-flux-yellow font-bold text-background">
                Audit complet
              </Badge>
              {/* The one colour accent in this section. */}
              <CardTitle className="type-title text-balance text-eggshell">
                Fără șabloane. Totul pornește de la{" "}
                <span className="text-signal-audit">nișa ta</span>.
              </CardTitle>
              <CardDescription className="type-body text-platinum">
                Facem audit complet pe nișa ta și pe zona în care activezi. Avem
                KPI și metrici din proiecte care au funcționat, dar restul se
                construiește în jurul valorilor tale și al clienților pe care îi
                vrei.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Tabs defaultValue="google">
                <TabsList variant="line" aria-label="Platforme" className="h-auto flex-wrap">
                  {AD_CHANNELS.map((channel) => (
                    <TabsTrigger
                      key={channel.id}
                      value={channel.id}
                      className="type-button gap-2 px-2.5 py-1.5 text-platinum after:bg-flux-yellow data-active:text-eggshell"
                    >
                      <span className="flex -space-x-1">
                        {channel.icons.map((icon) => (
                          <ChannelIcon key={icon} id={icon} className="size-4" />
                        ))}
                      </span>
                      {channel.tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {AD_CHANNELS.map((channel) => (
                  <TabsContent
                    key={channel.id}
                    value={channel.id}
                    className="mt-4 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300"
                  >
                    <p className="type-body text-platinum">
                      {channel.body}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <span className="type-index mr-1 text-dim">
                        Urmărim
                      </span>
                      {channel.kpis.map((kpi) => (
                        <Badge
                          key={kpi}
                          variant="outline"
                          className="border-flux-yellow/30 text-platinum"
                        >
                          {kpi}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </BentoCard>
          {/* One flow: the request walks every step, then the feed starts over. */}
          <BentoCard accent="var(--flux-violet)" className="md:col-span-2 lg:col-span-1">
            <CardHeader className="gap-y-1.5">
              <Title strong="Pâlnia" soft="de conversie" />
              <Lead>O singură cerere de la tine. Tot traseul de la noi, pas cu pas.</Lead>
            </CardHeader>
            <CardContent>
              <FlowFeed />
            </CardContent>
          </BentoCard>

          {/* Visitors: the period picker. Every other tile follows it. */}
          <BentoCard accent="var(--flux-cyan)" className="md:col-span-2">
            {/* One column on phones: the period tabs drop under the text. */}
            <CardHeader className="gap-y-1.5 max-sm:has-data-[slot=card-action]:grid-cols-1">
              <Title strong="Vizitatori" soft={`pe ${spec.unit}`} />
              <Lead>
                Treci peste o bară ca să vezi {spec.the}, apasă ca {spec.pin}.
                Toate cardurile o urmează.
              </Lead>
              <CardAction className="col-start-1 row-span-1 row-start-3 mt-2 justify-self-start sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0 sm:justify-self-end max-sm:w-full">
                <Tabs
                  value={range}
                  onValueChange={(value) => changeRange(value as RangeId)}
                >
                  <TabsList variant="line" aria-label="Perioada" className="max-sm:w-full">
                    {RANGES.map((item) => (
                      <TabsTrigger
                        key={item.id}
                        value={item.id}
                        className="type-button px-2 text-platinum after:bg-flux-cyan data-active:text-eggshell"
                      >
                        {item.tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardAction>
            </CardHeader>
            <CardContent>
              {/* The figure and its date sit clear of the chart. */}
              <p className="type-metric text-eggshell">
                {formatNumber(point.visitors)}
              </p>
              <p className="type-note mt-2 text-dim">{point.label}</p>
              <div className="relative mt-6 h-48 sm:h-56 md:mt-8 md:h-64">
                {live ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full pb-1.5 text-center whitespace-nowrap motion-safe:transition-[left,top] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                    style={{
                      left: `calc(18px + (100% - 36px) * ${(active + 0.5) / points.length})`,
                      top: `calc(44px + (100% - 44px) * ${1 - point.visitors / maxVisitors})`,
                    }}
                  >
                    <span className="block text-[11px] text-dim">{point.label}</span>
                    <span className="block font-display text-[15px] leading-none font-bold text-eggshell tabular-nums">
                      {formatNumber(point.visitors)}
                    </span>
                  </div>
                ) : null}
                {live ? (
                  <ChartContainer
                    config={visitorsChart}
                    className="aspect-auto h-full w-full cursor-pointer"
                  >
                    <BarChart
                      data={points}
                      margin={{ top: 44, right: 18, bottom: 0, left: 18 }}
                      barCategoryGap="22%"
                      onMouseMove={(state) => {
                        if (state.activeTooltipIndex != null)
                          setHover(Number(state.activeTooltipIndex));
                      }}
                      onMouseLeave={() => setHover(null)}
                      onClick={(state) => {
                        if (state.activeTooltipIndex != null)
                          setPinned(Number(state.activeTooltipIndex));
                      }}
                    >
                      <XAxis dataKey="label" hide />
                      <YAxis hide domain={[0, "dataMax"]} />
                      <Bar
                        dataKey="visitors"
                        radius={999}
                        animationDuration={700}
                        animationEasing="ease-out"
                      >
                        {points.map((item, index) => (
                          <Cell
                            key={item.label}
                            fill={index === active ? "url(#flux-bar-on)" : INK}
                            className="transition-[fill] duration-150"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                ) : null}
              </div>
              <div className="mt-3 flex justify-between type-note text-dim">
                {axis.map((label, index) => (
                  <span key={`${label}-${index}`}>{label}</span>
                ))}
              </div>
            </CardContent>
          </BentoCard>

          {/* Cost per enquiry: a well-laid foundation buys more with less. */}
          <BentoCard accent="var(--flux-green)">
            <CardHeader className="gap-y-1.5">
              <Title strong="Mai multă precizie," soft="costuri mai mici" />
              <Lead>
                Cât a costat o cerere {point.on}. Cu fundația pusă bine, fiecare
                leu lucrează mai mult.
              </Lead>
            </CardHeader>
            <CardContent>
              <p className="type-metric flux-ghost text-eggshell">
                <Rolling
                  value={point.cost}
                  live={live}
                  format={(value) => `${formatNumber(value)} lei`}
                />
              </p>
              <p
                className={cn(
                  "type-note mt-2 flex items-center gap-1.5",
                  cheaper ? "text-flux-green" : "text-flux-yellow",
                )}
              >
                {cheaper ? (
                  <TrendingDown className="size-4" aria-hidden="true" />
                ) : (
                  <TrendingUp className="size-4" aria-hidden="true" />
                )}
                {cheaper ? "Mai mic" : "Mai mare"} cu{" "}
                {Math.round(Math.abs(costChange) * 100)}% {point.vs}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {FOUNDATION.map((item) => (
                  <Badge
                    key={item}
                    variant="outline"
                    className="border-eggshell/15 text-platinum"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardContent className="mt-6 md:mt-8">
              <div className="h-28">
                {live ? (
                  <ChartContainer config={costChart} className="aspect-auto h-full w-full">
                    <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 2, left: 8 }}>
                      <XAxis dataKey="label" hide />
                      <YAxis hide domain={["dataMin - 4", "dataMax + 4"]} />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        stroke="var(--color-cost)"
                        strokeWidth={2}
                        fill="url(#flux-cost-fill)"
                        animationDuration={1100}
                      />
                      <ReferenceDot
                        x={point.label}
                        y={point.cost}
                        r={5}
                        fill="var(--flux-green)"
                        stroke="#15110d"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : null}
              </div>
              <div className="mt-2 flex justify-between type-note text-dim">
                <span>{axis[0]}</span>
                <span>{axis[2]}</span>
              </div>
            </CardContent>
          </BentoCard>

          {/* Sources: Google's own channels, then Meta and TikTok. */}
          <BentoCard accent="var(--flux-red)">
            <CardHeader className="gap-y-1.5">
              <Title strong="De unde" soft="au venit" />
              <Lead>Cum au găsit site-ul vizitatorii {point.on}.</Lead>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3.5">
                {SOURCES.map((source, index) => (
                  <ShareRow
                    key={source.id}
                    icon={<ChannelIcon id={source.id} className="size-4 shrink-0" />}
                    label={source.label}
                    value={point.sources[index]}
                    max={maxSource}
                    live={live}
                    delay={index * 60}
                  />
                ))}
              </ul>
            </CardContent>
          </BentoCard>

          {/* Conversion ring. */}
          <BentoCard accent="var(--flux-yellow)">
            <CardHeader className="gap-y-1.5">
              <Title strong="Rata de" soft="conversie" />
              <Lead>
                {formatNumber(point.clients)} din{" "}
                {count(point.visitors, "vizitator", "vizitatori")} au trimis o
                cerere. Inelul e plin la 5%.
              </Lead>
            </CardHeader>
            <CardContent className="grid flex-1 place-items-center">
              <div className="relative size-44">
                {live ? (
                  <ChartContainer config={conversionChart} className="aspect-square size-44">
                    <RadialBarChart
                      data={[{ value: Math.min(100, (conversion / 0.05) * 100) }]}
                      startAngle={90}
                      endAngle={-270}
                      innerRadius="80%"
                      outerRadius="100%"
                      barSize={14}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar
                        dataKey="value"
                        background={{ fill: INK }}
                        cornerRadius={999}
                        fill="var(--color-value)"
                        animationDuration={900}
                      />
                    </RadialBarChart>
                  </ChartContainer>
                ) : null}
                <div className="absolute inset-[18%] grid place-items-center rounded-full bg-[#120e0b] shadow-[inset_0_2px_10px_rgba(0,0,0,0.6)]">
                  <span className="flux-ghost font-display text-4xl font-bold tracking-[-0.04em] text-eggshell tabular-nums">
                    <Rolling value={conversion} live={live} format={formatPercent} />
                  </span>
                </div>
              </div>
            </CardContent>
          </BentoCard>

          {/* Sales by channel. The best converter takes the paint. */}
          <BentoCard accent="var(--flux-magenta)" className="lg:row-span-2">
            <CardHeader className="gap-y-1.5">
              <Title strong="Vânzări" soft="pe canal" />
              <Lead>
                Cine a cumpărat {point.on}, după canalul prin care a venit prima
                dată. {best.label} a convertit cel mai bine, la{" "}
                {formatPercent(best.rate)}.
              </Lead>
            </CardHeader>
            <CardContent className="relative min-h-80 flex-1">
              {live
                ? point.channels.map((channel, index) => (
                    <div
                      key={channel.id}
                      aria-hidden="true"
                      className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col items-center pb-2 text-center whitespace-nowrap motion-safe:transition-[top] motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      style={{
                        left: `calc(var(--card-spacing) + (100% - 2 * var(--card-spacing)) * ${(index + 0.5) / point.channels.length})`,
                        top: `calc(80px + (100% - 110px) * ${1 - channel.revenue / maxRevenue})`,
                      }}
                    >
                      <span className="font-display text-[13px] leading-none font-bold text-eggshell tabular-nums sm:text-[15px]">
                        {formatNumber(channel.revenue)} lei
                      </span>
                      <span className="mt-1 hidden text-[11px] text-dim sm:block">
                        {count(channel.clients, "client", "clienți")}
                      </span>
                      <ChannelIcon id={channel.id} className="mt-2 size-[22px]" />
                    </div>
                  ))
                : null}
              {live ? (
                <ChartContainer
                  config={revenueChart}
                  className="absolute inset-y-0 inset-x-(--card-spacing) aspect-auto"
                >
                  <BarChart
                    data={point.channels}
                    margin={{ top: 80, right: 0, bottom: 0, left: 0 }}
                    barCategoryGap="10%"
                  >
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={12}
                      fontSize={12}
                      height={30}
                    />
                    <YAxis hide domain={[0, "dataMax"]} />
                    <Bar
                      dataKey="revenue"
                      radius={[18, 18, 6, 6]}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {point.channels.map((channel) => (
                        <Cell
                          key={channel.id}
                          fill={channel.id === best.id ? "url(#flux-best)" : INK}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : null}
            </CardContent>
          </BentoCard>

          {/* Entry pages. */}
          <BentoCard accent="var(--flux-cyan)" className="md:col-span-2">
            <CardHeader className="gap-y-1.5">
              <Title strong="Pagini" soft="de intrare" />
              <Lead>Unde a început fiecare vizită {point.on}.</Lead>
            </CardHeader>
            <CardContent className="grid items-center gap-8 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <ArrowArt />
              <ul className="space-y-4">
                {PAGES.map((page, index) => (
                  <ShareRow
                    key={page.path}
                    label={page.path}
                    value={point.pages[index]}
                    max={maxPage}
                    live={live}
                    delay={index * 70}
                  />
                ))}
              </ul>
            </CardContent>
          </BentoCard>

        </div>
      </div>
    </section>
  );
}
