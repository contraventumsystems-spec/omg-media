"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useRef } from "react";
import { preload } from "react-dom";
import { STREAM_BEAT, STREAMS, useSceneStore } from "@/app/lib/scene-store";
import { mergeRig, trioGone } from "@/app/lib/stream-merge";
import { PRESENT_ORDER, presentRig } from "@/app/lib/stream-present";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, MotionPathPlugin);

type StreamId = (typeof STREAMS)[number]["id"];

/** Every layer is drawn on this canvas, so windows, grids and strokes stay registered. */
const CANVAS = { width: 1168, height: 784 } as const;

const DIR = {
  strategie: "/three-pieces/strategy-horse",
  design: "/three-pieces/pencil-design",
  tehnologie: "/three-pieces/tech-x",
} as const;

/** The layers no tween reaches into. They are drawn as pictures, straight from public/. */
const STILLS: Record<StreamId, string[]> = {
  strategie: [
    `${DIR.strategie}/strategie-route-background.svg`,
    `${DIR.strategie}/strategie-route-window.svg`,
    `${DIR.strategie}/strategie-route-grid.svg`,
  ],
  design: [
    `${DIR.design}/design-bezier-background.svg`,
    `${DIR.design}/design-bezier-window.svg`,
    `${DIR.design}/design-bezier-guides.svg`,
  ],
  tehnologie: [`${DIR.tehnologie}/tehnologie-background.svg`, `${DIR.tehnologie}/tehnologie-window.svg`],
};

/*
 * ---------------------------------------------------------------------------
 * Timing. Everything is in seconds of wall clock, not scroll.
 * ---------------------------------------------------------------------------
 */

/** Length of one loop. All three share it, so their actions keep the same order for good. */
const LOOP = 6;

/** Seconds a channel waits in its start pose before its first action. */
const PHASE: Record<StreamId, number> = {
  strategie: 0.4,
  tehnologie: 2.2,
  design: 4,
};

const TIMING = {
  strategie: {
    /** The route line from start to destination. The pulse rides its tip. */
    draw: 1.7,
    /** One waypoint lighting up, and the confirmation at the destination. */
    ping: 0.4,
    confirm: 0.55,
    /** The full route. */
    hold: 1.2,
    /** The active signal back to the dim track. */
    fade: 0.5,
  },
  design: {
    /** The first anchor, alone, before the curve leaves it. */
    lead: 0.35,
    /** The curve, anchor to anchor. */
    draw: 1.6,
    /** One anchor or handle arriving. */
    pop: 0.3,
    /** The finished curve. */
    hold: 1.3,
    /** Curve and controls out together. */
    fade: 0.45,
  },
  tehnologie: {
    /** The screen is wiped, the log lines tick back in, then the prompt is drawn again. */
    clear: 0.14,
    blank: 0.36,
    type: 0.38,
    /** Cursor blinks between the prompt and the signal, and the length of one blink. */
    bootBlinks: 2,
    blink: 0.34,
    /** One pulse along one trace, and the gap between the two traces of a side. */
    travel: 0.5,
    stagger: 0.12,
    /** The terminal answers for this long before the signal leaves on the right. */
    think: 0.3,
    /** The idle blink for the rest of the loop. */
    idleBlink: 0.9,
  },
} as const;

/**
 * The payoff every channel shares: two colour ghosts of its main stroke jump
 * apart and lock back into it, as the words on the floor do. Seconds, and how
 * far a ghost starts from the stroke in canvas units.
 */
const GHOST = { lock: 0.5, reach: 26 } as const;

/** While one set is turning to the lens, a screen this far behind it holds still. Shares of `face`. */
const YIELD = { from: 0.06, to: 0.3 } as const;

/*
 * ---------------------------------------------------------------------------
 * The three loops. Each returns one paused timeline that repeats: the action
 * from 0, the hold, the way back, then the start pose until LOOP.
 * ---------------------------------------------------------------------------
 */

type Build = (svg: SVGSVGElement) => gsap.core.Timeline;

const loop = () => gsap.timeline({ paused: true, repeat: -1, defaults: { ease: "power2.inOut" } });
/** Rests in the start pose until the loop is full. */
const rest = (timeline: gsap.core.Timeline) => timeline.set({}, {}, Math.max(LOOP, timeline.duration()));

/** Share of the length of a path at which it passes closest to a point. */
function shareAt(path: SVGGeometryElement, x: number, y: number) {
  const length = path.getTotalLength();
  let best = 0;
  let nearest = Infinity;
  for (let step = 0; step <= 240; step += 1) {
    const point = path.getPointAtLength((length * step) / 240);
    const gap = (point.x - x) ** 2 + (point.y - y) ** 2;
    if (gap < nearest) {
      nearest = gap;
      best = step / 240;
    }
  }
  return best;
}

/** Which way each ghost is thrown. */
const GHOST_WAY = [
  [-1, 0.4],
  [1, -0.4],
] as const;

/** Throws the ghosts of a stroke apart and lets them lock back under it. */
function lock(timeline: gsap.core.Timeline, ghosts: Element[], at: number) {
  ghosts.forEach((ghost, index) => {
    const [x, y] = GHOST_WAY[index % GHOST_WAY.length];
    timeline
      .set(ghost, { opacity: 0.95, x: x * GHOST.reach, y: y * GHOST.reach }, at)
      .to(ghost, { x: 0, y: 0, duration: GHOST.lock, ease: "elastic.out(1, 0.45)" }, at)
      .to(ghost, { opacity: 0, duration: 0.12, ease: "none" }, at + GHOST.lock * 0.7);
  });
}

const ROUTE_LIT = "#72dfff";

/** Plot a route: the line is drawn to the target, the pulse on its tip, waypoints as it passes. */
const strategie: Build = (svg) => {
  const t = TIMING.strategie;
  const timeline = loop();
  const line = svg.querySelector<SVGPathElement>("[data-route-line]");
  const glow = svg.querySelector("[data-route-glow]");
  const pulse = svg.querySelector<SVGCircleElement>("[data-route-pulse]");
  const destination = svg.querySelector("[data-route-destination]");
  const ring = svg.querySelector("[data-route-ping]");
  const waypoints = Array.from(svg.querySelectorAll<SVGCircleElement>("[data-waypoint]"));
  const ghosts = Array.from(svg.querySelectorAll("[data-ghost]"));
  if (!line || !pulse || !destination) return rest(timeline);
  const drawn = [line, glow];
  const ride = { path: line, align: line, alignOrigin: [0.5, 0.5] };
  /* Idle: only the dim track. */
  gsap.set(drawn, { drawSVG: "0%" });
  gsap.set(pulse, { opacity: 0, motionPath: { ...ride, start: 0, end: 0 } });

  /* Line and pulse share one linear clock, so the dot stays on the tip of the line. */
  timeline
    .to(drawn, { drawSVG: "100%", duration: t.draw, ease: "none" }, 0)
    .to(pulse, { motionPath: ride, duration: t.draw, ease: "none" }, 0)
    .to(pulse, { opacity: 1, duration: 0.12 }, 0);

  const backAt = t.draw + t.confirm + t.hold;
  waypoints.forEach((waypoint) => {
    const share = shareAt(line, waypoint.cx.baseVal.value, waypoint.cy.baseVal.value);
    const at = share * t.draw;
    const idle = waypoint.getAttribute("fill") ?? ROUTE_LIT;
    timeline
      .to(
        waypoint,
        { scale: 1.6, fill: ROUTE_LIT, transformOrigin: "50% 50%", duration: t.ping * 0.4, ease: "power2.out" },
        at,
      )
      .to(waypoint, { scale: 1, duration: t.ping * 0.6 }, at + t.ping * 0.4)
      .to(waypoint, { fill: idle, duration: t.fade }, backAt);
  });

  /* Arrived: the dot is taken in, the target confirms once, and the route locks. */
  timeline
    .to(pulse, { opacity: 0, duration: 0.15 }, t.draw)
    .to(
      destination,
      { scale: 1.4, transformOrigin: "50% 50%", duration: t.confirm * 0.35, ease: "power2.out" },
      t.draw,
    )
    .to(destination, { scale: 1, duration: t.confirm * 0.65, ease: "back.out(2.5)" }, t.draw + t.confirm * 0.35)
    .fromTo(
      ring,
      { scale: 1, opacity: 0.95, transformOrigin: "50% 50%" },
      { scale: 2.6, opacity: 0, duration: t.confirm + 0.2, ease: "power2.out", immediateRender: false },
      t.draw,
    );
  lock(timeline, ghosts, t.draw);
  timeline
    .to(drawn, { opacity: 0, duration: t.fade, ease: "power1.in" }, backAt)
    /* Rewound while hidden: the line to nothing, the dot back to the start. */
    .set(drawn, { drawSVG: "0%" }, backAt + t.fade + 0.02)
    .set(line, { opacity: 1 }, backAt + t.fade + 0.04)
    .set(glow, { opacity: 0.28 }, backAt + t.fade + 0.04)
    .set(pulse, { motionPath: { ...ride, start: 0, end: 0 } }, backAt + t.fade + 0.04);
  return rest(timeline);
};

/** Draw a Bézier curve: the first anchor, the curve, then each anchor and handle as the curve reaches it. */
const design: Build = (svg) => {
  const t = TIMING.design;
  const timeline = loop();
  const curve = svg.querySelector<SVGPathElement>("[data-bezier-curve]");
  const glow = svg.querySelector("[data-bezier-glow]");
  const anchors = Array.from(svg.querySelectorAll<SVGRectElement>("[data-anchor]"));
  const handles = Array.from(svg.querySelectorAll<SVGGElement>("[data-handle]"));
  const ghosts = Array.from(svg.querySelectorAll("[data-ghost]"));
  if (!curve) return rest(timeline);
  const drawn = [curve, glow];
  const groups = [
    svg.querySelector("[data-bezier-strokes]"),
    svg.querySelector("[data-bezier-handles]"),
    svg.querySelector("[data-bezier-anchors]"),
  ];
  const controls = [...anchors, ...handles];
  const hidden = { scale: 0, opacity: 0, transformOrigin: "50% 50%" };
  /* Idle: the empty artboard, with its tools and guides. */
  gsap.set(drawn, { drawSVG: "0%" });
  gsap.set(controls, hidden);

  const pop = (target: Element, at: number) =>
    timeline.to(target, { scale: 1, opacity: 1, duration: t.pop, ease: "back.out(2.4)" }, at);

  timeline.to(drawn, { drawSVG: "100%", duration: t.draw, ease: "none" }, t.lead);
  anchors.forEach((anchor, index) => {
    const box = anchor.getBBox();
    const share = shareAt(curve, box.x + box.width / 2, box.y + box.height / 2);
    /* The first one leads. The others land as the curve gets to them. */
    const at = index === 0 ? 0 : t.lead + share * t.draw - t.pop * 0.3;
    pop(anchor, at);
    /* The two inner anchors carry the handles. */
    const handle = handles[index - 1];
    if (handle && index < anchors.length - 1) pop(handle, at + t.pop * 0.4);
  });
  /* The curve is closed: it locks. */
  lock(timeline, ghosts, t.lead + t.draw);

  const backAt = t.lead + t.draw + t.hold;
  timeline
    .to(groups, { opacity: 0, duration: t.fade, ease: "power1.in" }, backAt)
    /* Rewound while hidden. */
    .set(drawn, { drawSVG: "0%" }, backAt + t.fade + 0.02)
    .set(controls, hidden, backAt + t.fade + 0.02)
    .set(groups, { opacity: 1 }, backAt + t.fade + 0.04);
  return rest(timeline);
};

/** Travels one bright segment from the start of a trace to its end. */
function pulse(timeline: gsap.core.Timeline, path: Element, at: number, length: number) {
  timeline
    .fromTo(
      path,
      { drawSVG: "0% 0%" },
      { drawSVG: "0% 45%", duration: length * 0.3, ease: "none", immediateRender: false },
      at,
    )
    .to(path, { drawSVG: "55% 100%", duration: length * 0.4, ease: "none" }, at + length * 0.3)
    .to(path, { drawSVG: "100% 100%", duration: length * 0.3, ease: "none" }, at + length * 0.7);
}

/** A node swells as the signal passes it. */
function ping(timeline: gsap.core.Timeline, node: Element, at: number) {
  timeline
    .to(node, { scale: 1.9, transformOrigin: "50% 50%", duration: 0.16, ease: "power2.out" }, at)
    .to(node, { scale: 1, duration: 0.34 }, at + 0.16);
}

/** Boot: the log and the prompt come back, the cursor blinks, the signal comes in on the left and leaves on the right. */
const tehnologie: Build = (svg) => {
  const t = TIMING.tehnologie;
  const timeline = loop();
  const prompt = svg.querySelector("[data-prompt]");
  const cursor = svg.querySelector("[data-cursor]");
  const logs = Array.from(svg.querySelectorAll("[data-log]"));
  const ghosts = Array.from(svg.querySelectorAll("[data-ghost]"));
  const circuits = Array.from(svg.querySelectorAll("[data-circuit]")).map((circuit) => ({
    pulse: circuit.querySelector("[data-pulse]"),
    node: circuit.querySelector("[data-node]"),
    left: circuit.getAttribute("data-circuit")?.endsWith("left") ?? false,
  }));
  const left = circuits.filter((circuit) => circuit.left);
  const right = circuits.filter((circuit) => !circuit.left);
  gsap.set(
    circuits.map((circuit) => circuit.pulse),
    { drawSVG: "0% 0%", opacity: 1 },
  );

  const blink = (at: number, length: number) => {
    timeline.set(cursor, { opacity: 1 }, at).set(cursor, { opacity: 0 }, at + length * 0.55);
    return at + length;
  };

  /* The screen clears, the log ticks back line by line, then the prompt is typed again. */
  const typeAt = t.clear + t.blank;
  timeline
    .to(prompt, { drawSVG: "0%", duration: t.clear, ease: "power2.in" }, 0)
    .set(cursor, { opacity: 0 }, 0)
    .set(logs, { opacity: 0 }, t.clear * 0.5);
  logs.forEach((log, index) => {
    timeline.set(log, { opacity: 1 }, t.clear + (t.blank * (index + 1)) / (logs.length + 1));
  });
  timeline.to(prompt, { drawSVG: "100%", duration: t.type, ease: "power2.out" }, typeAt);

  let time = typeAt + t.type;
  for (let n = 0; n < t.bootBlinks; n += 1) time = blink(time, t.blink);

  /* In from the left nodes. */
  left.forEach((circuit, index) => {
    const at = time + index * t.stagger;
    if (circuit.node) ping(timeline, circuit.node, at);
    if (circuit.pulse) pulse(timeline, circuit.pulse, at, t.travel);
  });
  time += t.travel + (left.length - 1) * t.stagger;

  /* The terminal has it: the prompt locks and the cursor runs fast. */
  lock(timeline, ghosts, time);
  blink(time, t.think / 2);
  blink(time + t.think / 2, t.think / 2);
  time += t.think;

  /* Out to the right nodes, which answer as it arrives. */
  timeline.set(cursor, { opacity: 1 }, time);
  right.forEach((circuit, index) => {
    const at = time + index * t.stagger;
    if (circuit.pulse) pulse(timeline, circuit.pulse, at, t.travel);
    if (circuit.node) ping(timeline, circuit.node, at + t.travel * 0.75);
  });
  time += t.travel + (right.length - 1) * t.stagger + 0.5;

  /* Idle blink until the loop is full. It ends lit, which is how the next loop finds it. */
  while (time + t.idleBlink <= LOOP) time = blink(time, t.idleBlink);
  timeline.set(cursor, { opacity: 1 }, time);
  return rest(timeline);
};

const BUILD: Record<StreamId, Build> = { strategie, design, tehnologie };

const smoothstep = (from: number, to: number, value: number) => {
  const x = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return x * x * (3 - 2 * x);
};

/**
 * One stream screen: the layered artwork of public/three-pieces/, assembled in
 * a single SVG on the 1168×784 source canvas. It only fills the box the scene
 * has already fitted to the glass, cropped the way the old photo was, so the
 * fit, the perspective and the clipping are the scene's (see placeStreamIcon in
 * tv-scene.tsx). The paths a tween reaches into are inline; the rest are pictures.
 *
 * With `live`, the screen plays its loop on its own clock. Scroll never scrubs
 * it. The loop only runs while this screen is drawn: the canvas is active (a 3D
 * beat is in view and the tab is in front), beat 2 has lit this glass, and the
 * three have not merged yet. It is paused otherwise and resumes where it
 * stopped. While the gather turns one set to the lens, the screens behind it
 * hold still.
 *
 * Without `live` it is the composed still, which is what reduced motion gets.
 */
export function StreamScreen({ id, live = false }: { id: StreamId; live?: boolean }) {
  const root = useRef<SVGSVGElement>(null);

  for (const src of STILLS[id]) preload(src, { as: "image" });

  useGSAP(
    () => {
      const svg = root.current;
      if (!svg || !live) return;
      const index = STREAMS.findIndex((stream) => stream.id === id);
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = BUILD[id](svg);
        /* Offset start: the loop is parked this long before its action. */
        timeline.time((LOOP - PHASE[id]) % LOOP);

        const sync = () => {
          const state = useSceneStore.getState();
          /* The same gates the scene uses for this icon's opacity. */
          const lit =
            state.active &&
            state.stream > (STREAM_BEAT.pushEnd * index) / STREAMS.length &&
            trioGone(mergeRig) < 1;
          let ahead = 0;
          for (const other of PRESENT_ORDER) ahead = Math.max(ahead, presentRig[other].face);
          const pace = 1 - smoothstep(YIELD.from, YIELD.to, ahead - presentRig[id].face);
          const run = lit && pace > 0.02;
          if (run) timeline.timeScale(pace);
          if (timeline.paused() === run) timeline.paused(!run);
        };
        /* The streams timeline writes the store on every scrubbed frame, after the rigs. */
        const stop = useSceneStore.subscribe(sync);
        sync();
        return stop;
      });
    },
    { scope: root, dependencies: [id, live] },
  );

  return (
    <svg
      ref={root}
      aria-hidden="true"
      viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none block h-full w-full"
    >
      {id === "strategie" ? <Strategie /> : null}
      {id === "design" ? <Design /> : null}
      {id === "tehnologie" ? <Tehnologie live={live} /> : null}
    </svg>
  );
}

function Still({ src }: { src: string }) {
  return <image href={src} width={CANVAS.width} height={CANVAS.height} />;
}

const CREAM = "#f8f3df";

/* strategie-route-background.svg, -window.svg, -grid.svg, then strategie-route-signal.svg inline */
const ROUTE = "M290 572H410L510 470H630L730 330H842";

function Strategie() {
  return (
    <>
      <Still src={`${DIR.strategie}/strategie-route-background.svg`} />
      <Still src={`${DIR.strategie}/strategie-route-window.svg`} />
      <Still src={`${DIR.strategie}/strategie-route-grid.svg`} />
      <g fill="none" strokeLinecap="square" strokeLinejoin="miter">
        <path data-route-track="" d={ROUTE} stroke="#24415c" strokeWidth={26} />
        <path data-route-glow="" d={ROUTE} stroke="#72dfff" strokeWidth={46} opacity={0.28} />
        <path data-ghost="" d={ROUTE} stroke="#ee44c6" strokeWidth={20} opacity={0} />
        <path data-ghost="" d={ROUTE} stroke="#27d24c" strokeWidth={20} opacity={0} />
        <path data-route-line="" d={ROUTE} stroke="#72dfff" strokeWidth={20} />
      </g>
      <g data-waypoints="" strokeWidth={10}>
        <circle data-waypoint="start" cx={290} cy={572} r={18} fill={CREAM} stroke="#0b1626" />
        <circle data-waypoint="one" cx={510} cy={470} r={24} fill="#0a1a2e" stroke="#72dfff" />
        <circle data-waypoint="two" cx={730} cy={330} r={24} fill="#0a1a2e" stroke="#72dfff" />
      </g>
      <circle
        data-route-ping=""
        cx={842}
        cy={330}
        r={40}
        fill="none"
        stroke="#72dfff"
        strokeWidth={10}
        opacity={0}
      />
      <g data-route-destination="">
        <circle cx={842} cy={330} r={40} fill="#0a1a2e" stroke={CREAM} strokeWidth={10} />
        <circle cx={842} cy={330} r={13} fill="#72dfff" />
        <path
          d="M842 266V282 M842 378V394 M778 330H794 M890 330H906"
          fill="none"
          stroke={CREAM}
          strokeWidth={8}
        />
      </g>
      <circle data-route-pulse="" cx={290} cy={572} r={14} opacity={0} fill={CREAM} />
    </>
  );
}

/* design-bezier-background.svg, -window.svg, -guides.svg, then design-bezier-curve.svg inline */
const CURVE = "M330 560C400 580 440 500 510 400C576 306 640 330 700 400C766 477 846 480 890 330";

function Design() {
  return (
    <>
      <Still src={`${DIR.design}/design-bezier-background.svg`} />
      <Still src={`${DIR.design}/design-bezier-window.svg`} />
      <Still src={`${DIR.design}/design-bezier-guides.svg`} />
      <g data-bezier-strokes="" fill="none" strokeLinecap="butt">
        <path data-bezier-glow="" d={CURVE} stroke="#fd79dc" strokeWidth={48} opacity={0.28} />
        <path data-ghost="" d={CURVE} stroke="#1ec8eb" strokeWidth={22} opacity={0} />
        <path data-ghost="" d={CURVE} stroke="#27d24c" strokeWidth={22} opacity={0} />
        <path data-bezier-curve="" d={CURVE} stroke="#fd79dc" strokeWidth={22} />
      </g>
      <g data-bezier-handles="" fill={CREAM} stroke={CREAM} strokeWidth={7}>
        <g data-handle="one">
          <path d="M447 490L573 310" />
          <circle cx={447} cy={490} r={9} />
          <circle cx={573} cy={310} r={9} />
        </g>
        <g data-handle="two">
          <path d="M646 337L754 463" />
          <circle cx={646} cy={337} r={9} />
          <circle cx={754} cy={463} r={9} />
        </g>
      </g>
      <g data-bezier-anchors="" fill="#1f0c26" stroke={CREAM} strokeWidth={9} strokeLinejoin="miter">
        <rect data-anchor="start" x={312} y={542} width={36} height={36} />
        <rect data-anchor="one" x={492} y={382} width={36} height={36} />
        <rect data-anchor="two" x={682} y={382} width={36} height={36} />
        <rect data-anchor="end" x={872} y={312} width={36} height={36} />
      </g>
    </>
  );
}

const CIRCUITS = [
  { id: "upper-left", trace: "M136 256H156L192 292", cx: 120, cy: 256 },
  { id: "lower-left", trace: "M136 560H156L192 524", cx: 120, cy: 560 },
  { id: "upper-right", trace: "M996 292L1024 256H1032", cx: 1048, cy: 256 },
  { id: "lower-right", trace: "M996 544L1024 576H1032", cx: 1048, cy: 576 },
] as const;

const PROMPT = "M300 320L440 430L300 540";

/* tehnologie-background.svg, tehnologie-circuits.svg, tehnologie-window.svg, tehnologie-command.svg */
function Tehnologie({ live }: { live: boolean }) {
  return (
    <>
      <Still src={`${DIR.tehnologie}/tehnologie-background.svg`} />
      <g stroke="#0c160f" strokeWidth={12} strokeLinecap="square" strokeLinejoin="miter">
        {CIRCUITS.map((circuit) => (
          <g key={circuit.id} data-circuit={circuit.id}>
            <path data-trace="" d={circuit.trace} fill="none" />
            {/* The signal: a bright copy of the trace, drawn only as a travelling segment. */}
            {live ? (
              <path
                data-pulse=""
                d={circuit.trace}
                fill="none"
                stroke={CREAM}
                strokeWidth={20}
                opacity={0}
              />
            ) : null}
            <circle data-node="" cx={circuit.cx} cy={circuit.cy} r={16} fill={CREAM} strokeWidth={10} />
          </g>
        ))}
      </g>
      <Still src={`${DIR.tehnologie}/tehnologie-window.svg`} />
      <g data-terminal-command="" fill="none" strokeLinecap="butt" strokeLinejoin="miter">
        <g data-terminal-log="" stroke="#1f6e36" strokeWidth={24}>
          <path data-log="" d="M300 250H470" />
          <path data-log="" d="M500 250H590" />
          <path data-log="" d="M620 250H800" />
        </g>
        <path data-ghost="" d={PROMPT} stroke="#1ec8eb" strokeWidth={40} opacity={0} />
        <path data-ghost="" d={PROMPT} stroke="#ee44c6" strokeWidth={40} opacity={0} />
        <path data-prompt="" d={PROMPT} stroke={CREAM} strokeWidth={40} />
        <path data-cursor="" d="M500 540H700" stroke="#58e65d" strokeWidth={44} />
      </g>
    </>
  );
}
