"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Cel-ink illustrations for the creative bento (app/components/creative-bento.tsx).
 * Flat TV-bar paints, thick ink outlines and 1930s pie-cut eyes, so each card
 * shows its service in the site's own drawing style. They stand in for real
 * work until it is added, and read as illustration, not as client work.
 *
 * Small loops (class `art-loop`, keyframes in globals.css) run only while the
 * art is on screen: ArtStage sets `data-live` from an IntersectionObserver.
 * Reduced motion turns every loop off.
 */

const INK = "#15110d";
const PAPER = "#f3e9d2";
const SHADE = "#2b241c";
const LINE = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };

/** Runs the art's loops only while it is visible. */
export function ArtStage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setLive(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={root} data-live={live || undefined} className={className}>
      {children}
    </div>
  );
}

/** Pie-cut cartoon eye: an ink oval with a paper wedge for the shine. */
function PieEye({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={5} ry={8} fill={INK} />
      <path d={`M${x} ${y} L${x + 4} ${y - 6} L${x + 5} ${y - 2}Z`} fill={PAPER} />
    </g>
  );
}

/* ------------------------------------------------------------ video poster */

/** On set: softbox, camera on a tripod and a slate, in front of a TV-bar backdrop. 9:16. */
export function OnSetScene({ playing = false }: { playing?: boolean }) {
  return (
    <svg viewBox="0 0 180 320" role="img" aria-label="Ilustrație: platou de filmare cu cameră, lumină și clachetă" className="size-full">
      <rect width="180" height="320" fill="#1d1813" />
      {/* Backdrop: the six bars, dimmed like a studio paper roll. */}
      {["--flux-yellow", "--flux-cyan", "--flux-green", "--flux-magenta", "--flux-red", "--flux-violet"].map((color, index) => (
        <rect key={color} x={index * 30} y="0" width="30" height="214" fill={`var(${color})`} opacity="0.32" />
      ))}
      <rect y="214" width="180" height="106" fill={SHADE} />
      <path d="M0 214H180" {...LINE} />

      {/* Light cone from the softbox. */}
      <path className="art-loop art-flicker" d="M40 82 L4 252 H128Z" fill={PAPER} opacity="0.12" />

      {/* Softbox on its stand. */}
      <path d="M40 84V246M40 246l-14 12M40 246l14 12" {...LINE} fill="none" />
      <rect x="16" y="46" width="48" height="38" rx="4" fill={PAPER} {...LINE} />
      <rect x="22" y="52" width="36" height="26" rx="2" fill="var(--flux-yellow)" opacity="0.55" />

      {/* Tripod. */}
      <path d="M126 168 L104 250M126 168V252M126 168 L148 250" {...LINE} fill="none" />

      {/* Camera reels: spin while the presentation plays. */}
      {[110, 138].map((cx) => (
        <g key={cx} className={cn("art-reel", playing && "is-playing")}>
          <circle cx={cx} cy="110" r="13" fill={SHADE} {...LINE} />
          <path d={`M${cx - 9} 110H${cx + 9}M${cx} 101V119`} {...LINE} strokeWidth={2.5} />
        </g>
      ))}
      {/* Camera body and lens; the lens catches the backdrop. */}
      <rect x="98" y="124" width="58" height="42" rx="7" fill={SHADE} {...LINE} />
      <circle cx="98" cy="145" r="16" fill="#120e0b" {...LINE} />
      <circle cx="98" cy="145" r="8" fill="var(--flux-cyan)" opacity="0.85" />
      <circle cx="95" cy="142" r="2.5" fill={PAPER} />
      {/* Tally light. */}
      <circle className={cn("art-loop art-blink", playing && "is-fast")} cx="148" cy="133" r="4" fill="var(--flux-red)" stroke={INK} strokeWidth="1.5" />

      {/* Slate: the clapper snaps while it plays. */}
      <g transform="translate(26 226)">
        <rect y="10" width="58" height="34" rx="3" fill="#120e0b" {...LINE} />
        <path d="M8 24H50M8 33H38" stroke={PAPER} strokeWidth="2" opacity="0.6" />
        <g className={cn("art-clap", playing && "is-playing")}>
          <rect y="0" width="58" height="10" rx="2" fill={PAPER} {...LINE} />
          {[0, 1, 2, 3].map((index) => (
            <path key={index} d={`M${6 + index * 14} 0 l8 10 h6 l-8 -10Z`} fill={INK} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------ photo shoots */

/** People: a pie-eyed portrait against a yellow halo, with a flash now and then. */
export function PortraitArt() {
  return (
    <svg viewBox="0 0 160 200" role="img" aria-label="Ilustrație: portret într-o ședință foto" className="size-full">
      <rect width="160" height="200" fill="var(--flux-magenta)" />
      <circle cx="80" cy="92" r="58" fill="var(--flux-yellow)" {...LINE} />
      <path d="M26 200 C28 160 52 140 80 140 C108 140 132 160 134 200Z" fill="var(--flux-cyan)" {...LINE} />
      <rect x="72" y="116" width="16" height="28" fill={PAPER} {...LINE} />
      <ellipse cx="80" cy="94" rx="30" ry="33" fill={PAPER} {...LINE} />
      <path d="M50 92 C47 62 70 52 84 56 C101 52 115 67 110 92 C104 77 92 70 80 74 C68 70 56 80 50 92Z" fill={INK} />
      <PieEye x={70} y={97} />
      <PieEye x={90} y={97} />
      <circle cx="62" cy="109" r="4" fill="var(--flux-magenta)" opacity="0.45" />
      <circle cx="98" cy="109" r="4" fill="var(--flux-magenta)" opacity="0.45" />
      <path d="M68 112 Q80 122 92 112" fill="none" {...LINE} strokeLinecap="round" />
      <rect className="art-loop art-flash" width="160" height="200" fill={PAPER} opacity="0" />
    </svg>
  );
}

/** Products: a bottle on a plinth under a spot, with a twinkle. */
export function ProductArt() {
  return (
    <svg viewBox="0 0 160 200" role="img" aria-label="Ilustrație: fotografie de produs" className="size-full">
      <rect width="160" height="200" fill="var(--flux-cyan)" />
      <path d="M80 0 L28 132 H132Z" fill={PAPER} opacity="0.22" />
      <rect y="150" width="160" height="50" fill={SHADE} />
      <rect x="38" y="130" width="84" height="54" fill={PAPER} {...LINE} />
      <ellipse cx="80" cy="131" rx="30" ry="4" fill={INK} opacity="0.35" />
      <rect x="72" y="44" width="16" height="22" fill="var(--flux-magenta)" {...LINE} />
      <rect x="70" y="32" width="20" height="14" rx="3" fill={INK} />
      <rect x="60" y="62" width="40" height="70" rx="11" fill="var(--flux-magenta)" {...LINE} />
      <rect x="60" y="86" width="40" height="24" fill={PAPER} {...LINE} strokeWidth={2} />
      <circle cx="80" cy="98" r="6" fill="var(--flux-yellow)" stroke={INK} strokeWidth="2" />
      <rect x="66" y="68" width="5" height="54" rx="2.5" fill={PAPER} opacity="0.55" />
      <path className="art-loop art-twinkle" d="M124 46 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4Z" fill="var(--flux-yellow)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/** Brands: a pair of business cards with a mark. */
export function BrandArt() {
  return (
    <svg viewBox="0 0 160 200" role="img" aria-label="Ilustrație: materiale de brand" className="size-full">
      <rect width="160" height="200" fill="var(--flux-violet)" />
      <rect x="24" y="52" width="104" height="64" rx="7" fill="var(--flux-yellow)" {...LINE} transform="rotate(-9 76 84)" />
      <g transform="rotate(6 86 120)">
        <rect x="32" y="88" width="104" height="64" rx="7" fill={PAPER} {...LINE} />
        <circle cx="58" cy="120" r="13" fill="var(--flux-magenta)" stroke={INK} strokeWidth="2.5" />
        <path d="M52 120h12M58 114v12" stroke={PAPER} strokeWidth="3" strokeLinecap="round" />
        <rect x="80" y="110" width="44" height="7" rx="2" fill={INK} />
        <rect x="80" y="123" width="30" height="5" rx="2" fill={INK} opacity="0.4" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------- editing & formats */

/** One shared frame: a sunset over hills with drifting clouds. 16:9. */
export function LandscapeScene({ slice = false }: { slice?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio={slice ? "xMidYMid slice" : "xMidYMid meet"}
      role="img"
      aria-label="Ilustrație: cadru cu apus peste dealuri"
      className="size-full"
    >
      <rect width="320" height="180" fill="var(--flux-violet)" />
      <rect y="52" width="320" height="40" fill="var(--flux-magenta)" />
      <rect y="88" width="320" height="40" fill="var(--flux-yellow)" />
      <circle cx="222" cy="104" r="34" fill={PAPER} {...LINE} />
      <g className="art-loop art-drift">
        <path d="M44 46 a12 12 0 0 1 20 -10 a16 16 0 0 1 30 4 a10 10 0 0 1 6 16 H44 a8 8 0 0 1 0 -10Z" fill={PAPER} {...LINE} />
        <path d="M236 30 a9 9 0 0 1 15 -7 a12 12 0 0 1 22 3 a8 8 0 0 1 4 12 H236 a6 6 0 0 1 0 -8Z" fill={PAPER} {...LINE} />
      </g>
      <path d="M0 130 C60 96 120 102 170 126 C220 102 280 98 320 118 V180 H0Z" fill="var(--flux-green)" {...LINE} />
      <path d="M0 160 C70 136 150 142 210 158 C250 150 290 148 320 155 V180 H0Z" fill="#2f8f37" {...LINE} />
      <path d="M262 150 V128" {...LINE} />
      <circle cx="262" cy="122" r="11" fill="var(--flux-cyan)" {...LINE} />
    </svg>
  );
}
