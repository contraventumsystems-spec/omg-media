"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { StreamScreen } from "@/app/components/stream-screens";
import { STREAMS } from "@/app/lib/scene-store";
import { barColors, services } from "@/app/lib/site";

gsap.registerPlugin(useGSAP, ScrollTrigger, MorphSVGPlugin);

type ServiceId = (typeof services)[number]["id"];

/** The rule over a category, as a path, so it can morph. Same start path as the files in public/. */
const RULE = "M7 11h10a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2Z";

/**
 * One mark and one reading rhythm per category. `icon` is the path from
 * public/strategie-knight.svg, design-pencil.svg and tehnologie-chip.svg.
 * `groups` splits the services into lines: a group is one line on the stage,
 * and there is a pause before the next one.
 */
const MARKS: Record<ServiceId, { icon: string; groups: number[] }> = {
  strategie: {
    icon: "M4.75 20v-1.1c0-1.4 1.06-2.44 2.62-2.9 2.25-.66 3.72-1.62 4.26-3.2l-2.47.4-1.87 1.82a.95.95 0 0 1-1.19.11l-2.17-1.48a.95.95 0 0 1-.3-1.24l2.03-3.7a7.4 7.4 0 0 1 4.93-3.58L14.1 3.3l.43 3.12c3.35 1.71 5.1 4.89 5.1 9.5V18c0 1.1-.9 2-2 2Z",
    /* The four ad platforms as one run, then Social media alone. */
    groups: [4, 1],
  },
  design: {
    icon: "M4.13 19.43 5.7 13.7l9.56-9.55a1.55 1.55 0 0 1 2.2 0l2.4 2.4a1.55 1.55 0 0 1 0 2.2l-.85.85-1.24-1.24-.83.83 1.24 1.24-8.11 8.11-5.35 1.6a.48.48 0 0 1-.59-.71Z",
    /* Brand work, then photo and video. */
    groups: [3, 2],
  },
  tehnologie: {
    icon: "M9 3.5h1.75V6h2.5V3.5H15V6h1.5A1.5 1.5 0 0 1 18 7.5V9h2.5v1.75H18v2.5h2.5V15H18v1.5a1.5 1.5 0 0 1-1.5 1.5H15v2.5h-1.75V18h-2.5v2.5H9V18H7.5A1.5 1.5 0 0 1 6 16.5V15H3.5v-1.75H6v-2.5H3.5V9H6V7.5A1.5 1.5 0 0 1 7.5 6H9Z",
    /* Three separate beats. */
    groups: [1, 1, 1],
  },
};

const CLOSE =
  "Un singur flux — firul care le leagă pe toate, de la idee până la cerere.";
/** The last words of the closing line get the stroke, as "crește." does on the floor. */
const PAYOFF_WORDS = 3;

/*
 * The pop is the one the floor line uses (app/lib/floor-hook.ts): a word scales
 * up past its size and settles, while three colour ghosts close into it.
 */
const REST = { scale: 0.3, alpha: 0, lock: 0 };
/** How far a ghost starts from its word, in letter heights, and which way each one goes. */
const GHOST_REACH = 0.72;
const GHOST_WAY = [
  [-1, 0.35],
  [0.2, -1],
  [1, 0.5],
] as const;

/* Timeline units. The track maps the whole timeline onto its scroll length. */
const POP = 0.6;
const STEP = 0.55;
const PAUSE = 0.5;
const MORPH = 0.5;
const MORPH_HOLD = 0.5;
const HOLD = 1.5;
const EXIT = 0.7;

type Pop = {
  word: HTMLElement;
  ghosts: HTMLElement[];
  /** Which way the word is turned before it locks. */
  turn: number;
  state: typeof REST;
  drawn: string;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function readPops(scope: Element): Pop[] {
  return Array.from(scope.querySelectorAll<HTMLElement>("[data-pop]")).flatMap(
    (el, index) => {
      const word = el.querySelector<HTMLElement>("[data-pop-word]");
      if (!word) return [];
      const ghosts = Array.from(
        el.querySelectorAll<HTMLElement>("[data-pop-ghost]"),
      );
      return [
        {
          word,
          ghosts,
          turn: index % 2 === 0 ? -1 : 1,
          state: { ...REST },
          drawn: "",
        },
      ];
    },
  );
}

/** Copies one scrubbed pop onto its word and ghosts. Skipped when nothing changed. */
export function drawPop(pop: Pop) {
  const { scale, alpha, lock } = pop.state;
  const key = `${scale.toFixed(4)} ${alpha.toFixed(3)} ${lock.toFixed(4)}`;
  if (key === pop.drawn) return;
  pop.drawn = key;

  const shown = clamp01(alpha);
  /* Not clamped: the lock overshoots, so the ghosts swing through the word before they settle. */
  const apart = 1 - lock;
  const turn = pop.turn * apart * 0.2;
  pop.word.style.opacity = String(shown);
  pop.word.style.transform = `rotate(${turn}rad) scale(${scale})`;
  /* Hidden once the word has locked: three colours under white would only fringe it. */
  const ghostAlpha = shown * Math.min(1, Math.abs(apart) * 3) * 0.9;
  pop.ghosts.forEach((ghost, way) => {
    const x = GHOST_WAY[way][0] * GHOST_REACH * apart;
    const y = -GHOST_WAY[way][1] * GHOST_REACH * apart;
    ghost.style.opacity = String(ghostAlpha);
    ghost.style.transform = `translate(${x}em, ${y}em) rotate(${turn * (1 + way * 0.6)}rad) scale(${scale})`;
  });
}

export function clearPop(pop: Pop) {
  for (const el of [pop.word, ...pop.ghosts]) {
    el.style.removeProperty("opacity");
    el.style.removeProperty("transform");
  }
}

/**
 * One popping word or phrase. The three ghosts are copies in the stream colours,
 * stacked under the word. `stop` is the full stop, in the category colour.
 */
export function PopText({ text, stop }: { text: string; stop?: string }) {
  return (
    <span data-pop className="relative inline-block">
      {STREAMS.map((stream) => (
        <span
          key={stream.id}
          data-pop-ghost
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 select-none"
          style={{ color: stream.color }}
        >
          {text}
          {stop ? "." : null}
        </span>
      ))}
      <span data-pop-word className="relative inline-block">
        {text}
        {stop ? <span className={stop}>.</span> : null}
      </span>
    </span>
  );
}

/**
 * The services, told as the next lines of the floor hook.
 *
 * Beat 2 ends with "Începem simplu. Construim ca să poți crește." lifted to
 * the top of the frame (see hookRestShot in app/lib/floor-hook.ts). This stage
 * is see-through and pins under it, so the hook reads as the headline and the
 * services continue it in the same type and with the same pop: one category at
 * a time, each service a short sentence that ends in the category colour.
 *
 * One scrubbed timeline, with a label per beat:
 *   strategie, strategie-1, strategie-2   rule to knight and back, the four
 *                                         ad platforms as one run, Social media
 *   design, design-1, design-2            rule to pencil, brand work, then video
 *   tehnologie, tehnologie-1 to -3        rule to chip, three separate beats
 *   close                                 the flux line, word by word, and the
 *                                         seven-bar stroke under its last words
 *   rest                                  the stage turns solid, so the canvas is
 *                                         hidden when the camera changes beat
 *
 * The track overlaps the end of beat 2 by one viewport, so the stage is
 * already in place when the hook lands. Reduced motion gets every category in
 * normal flow on a solid ground.
 */
export function ServicesStory() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current;
      if (!track) return;
      const cover = track.querySelector<HTMLElement>("[data-story-cover]");
      const close = track.querySelector<HTMLElement>("[data-story-close]");
      const payoff = track.querySelector<HTMLElement>("[data-story-payoff]");
      const bars = track.querySelector<HTMLElement>("[data-story-bars]");
      if (!cover || !close || !payoff || !bars) return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const chapters = Array.from(
          track.querySelectorAll<HTMLElement>("[data-story-chapter]"),
        ).flatMap((el) => {
          const box = el.querySelector<SVGElement>("[data-story-mark]");
          const mark = box?.querySelector<SVGPathElement>("path");
          const [title, ...phrases] = readPops(el);
          if (!box || !mark || !title || phrases.length === 0) return [];
          return [
            {
              id: el.dataset.storyChapter as ServiceId,
              el,
              box,
              mark,
              title,
              phrases,
            },
          ];
        });
        const closing = readPops(close);
        const pops = [
          ...chapters.flatMap((chapter) => [chapter.title, ...chapter.phrases]),
          ...closing,
        ];

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: () => pops.forEach(drawPop),
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
        const pop = (item: Pop, at: number, length = POP) =>
          timeline
            .to(
              item.state,
              { scale: 1, duration: length, ease: "back.out(3)" },
              at,
            )
            .to(item.state, { alpha: 1, duration: length * 0.3 }, at)
            .to(
              item.state,
              { lock: 1, duration: length * 1.7, ease: "elastic.out(1, 0.5)" },
              at + length * 0.15,
            );

        gsap.set(
          chapters.map((chapter) => chapter.box),
          { scaleX: 0, transformOrigin: "50% 50%" },
        );
        gsap.set(bars, { scaleX: 0 });

        let time = 0.2;
        for (const chapter of chapters) {
          const { icon, groups } = MARKS[chapter.id];
          /* The rule is drawn, turns into the icon while the title pops, and goes back. */
          timeline
            .addLabel(chapter.id, time)
            .to(
              chapter.box,
              { scaleX: 1, duration: 0.3, ease: "power2.out" },
              time,
            )
            .to(
              chapter.mark,
              { morphSVG: icon, duration: MORPH, ease: "power2.inOut" },
              time + 0.3,
            )
            .to(
              chapter.mark,
              { morphSVG: RULE, duration: MORPH, ease: "power2.inOut" },
              time + 0.3 + MORPH + MORPH_HOLD,
            );
          pop(chapter.title, time + 0.2);
          time += 1;

          let index = 0;
          groups.forEach((size, group) => {
            if (group > 0) time += PAUSE;
            timeline.addLabel(`${chapter.id}-${group + 1}`, time);
            for (let n = 0; n < size; n += 1, index += 1) {
              pop(chapter.phrases[index], time);
              time += STEP;
            }
          });

          /* Every service of the category is on the stage for a while, then the category leaves. */
          time += POP + HOLD;
          timeline.to(
            chapter.el,
            { autoAlpha: 0, yPercent: -8, duration: EXIT, ease: "power2.in" },
            time,
          );
          time += EXIT + 0.1;
        }

        timeline.addLabel("close", time);
        closing.forEach((word, index) => pop(word, time + index * 0.2, 0.5));
        time += closing.length * 0.2 + 0.3;
        /* The payoff: the last words outgrow the line, and the stroke is pulled under them. */
        timeline
          .to(
            payoff,
            {
              scale: 1.12,
              transformOrigin: "0% 100%",
              duration: 0.6,
              ease: "back.out(3.5)",
            },
            time,
          )
          .to(
            bars,
            { scaleX: 1, duration: 0.5, ease: "power2.out" },
            time + 0.15,
          );
        time += 0.65 + HOLD;
        timeline
          .addLabel("rest", time)
          .to(cover, { opacity: 1, duration: 0.8 }, time)
          .to({}, { duration: 0.4 }, time + 0.8);

        pops.forEach(drawPop);
        return () => pops.forEach(clearPop);
      });
    },
    { scope: root },
  );

  const closeWords = CLOSE.split(" ");
  const lead = closeWords.slice(0, -PAYOFF_WORDS);
  const last = closeWords.slice(-PAYOFF_WORDS);

  return (
    <div
      ref={root}
      data-scene-stage
      data-story-track
      className="relative z-10 -mt-[100svh] h-[480svh] motion-reduce:mt-0 motion-reduce:h-auto motion-reduce:bg-background"
    >
      <div className="sticky top-0 h-svh overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible">
        <div
          data-story-cover
          aria-hidden="true"
          className="absolute inset-0 bg-background opacity-0 motion-reduce:hidden"
        />
        {/* Starts under the hook. In motion every block shares one cell; with reduced motion they stack. */}
        <div className="relative mx-auto grid w-full max-w-[min(90vw,1120px)] justify-items-center px-5 pt-[36svh] text-center font-display leading-[1.12] font-bold tracking-[-0.03em] text-white md:px-0 md:pt-[34svh] motion-reduce:gap-20 motion-reduce:py-20">
          {services.map((service) => {
            /* The services, cut into the lines of MARKS. */
            let taken = 0;
            const lines = MARKS[service.id].groups.map((size) => {
              const line = service.items.slice(taken, taken + size);
              taken += size;
              return line;
            });
            return (
              <section
                key={service.id}
                data-story-chapter={service.id}
                aria-labelledby={`servicii-${service.id}`}
                className="flex flex-col items-center motion-safe:col-start-1 motion-safe:row-start-1"
              >
                {/* Still photo when motion is reduced. The monitors show the same picture. */}
                <div
                  aria-hidden="true"
                  className="mb-4 hidden aspect-[73/49] w-24 motion-reduce:block"
                >
                  <StreamScreen id={service.id} />
                </div>
                <svg
                  data-story-mark
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className={`block size-[clamp(3rem,9svh,5.5rem)] overflow-visible fill-current ${service.accent}`}
                >
                  <path d={RULE} />
                </svg>
                <h3
                  id={`servicii-${service.id}`}
                  className={`-mt-[0.12em] text-[length:clamp(2.5rem,min(1.5rem_+_5.5vw,13svh),7rem)] leading-none ${service.accent}`}
                >
                  <PopText text={service.label} />
                </h3>
                <div className="mt-[1.4svh] text-[length:clamp(1.5rem,min(1rem_+_2.6vw,6.4svh),3.5rem)]">
                  {/* One list per line. A line that has to wrap is split evenly, never one word alone. */}
                  {lines.map((line) => (
                    <ul key={line[0]} className="text-balance">
                      {line.map((item) => (
                        <li key={item} className="inline">
                          {/* A trailing full stop is dropped, then drawn again in the category colour. */}
                          <PopText
                            text={item.replace(/\.$/, "")}
                            stop={service.accent}
                          />{" "}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </section>
            );
          })}
          <p
            data-story-close
            className="max-w-[22em] self-start text-[length:clamp(1.5rem,min(1rem_+_2.6vw,6.4svh),3.5rem)] motion-safe:col-start-1 motion-safe:row-start-1 motion-safe:mt-[4svh]"
          >
            {lead.map((word, index) => (
              <span key={`${word}-${index}`}>
                <PopText text={word} />{" "}
              </span>
            ))}
            <span
              data-story-payoff
              className="relative inline-block whitespace-nowrap"
            >
              {last.map((word, index) => (
                <span key={`${word}-${index}`}>
                  <PopText text={word} />
                  {index < last.length - 1 ? " " : null}
                </span>
              ))}
              {/* The only DOM place the full seven-bar sequence appears. */}
              <span
                data-story-bars
                aria-hidden="true"
                className="absolute inset-x-0 -bottom-[0.14em] flex h-[0.13em] origin-left"
              >
                {barColors.map((color) => (
                  <span key={color} className={`h-full flex-1 ${color}`} />
                ))}
              </span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
