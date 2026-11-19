"use client";

import { useEffect, useId, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronUp, X } from "lucide-react";
import { heroServicesSeam, holdChannelCut } from "@/app/components/channel-change";

gsap.registerPlugin(ScrollTrigger);

/** Past this share of the page, an upward scroll may reveal the helper. */
const SHOW_AT = 0.06;
/** Smaller moves are trackpad noise, not a change of direction. */
const NUDGE = 12;
/** Fast enough to feel like a snap, slow enough to read as motion. */
const SCROLL_S = 0.55;
/** The tap that starts a jump must not count as the reader taking the wheel back. */
const CANCEL_GRACE_MS = 160;

type Seam = { gate: number; landing: number };
type Menu = "closed" | "choices" | "sections";

const SECTIONS = [
  { id: "drum", label: "Pașii până la livrare", pin: true },
  { id: "proces", label: "Unde se vede fiecare leu", pin: false },
  { id: "pe-ce-te-bazezi", label: "Un singur flux de lucru", pin: false },
] as const;

/**
 * Scroll position at progress `p`, with the empty hero/services stretch
 * removed. The position jumps that stretch in one step instead of playing it.
 */
function positionAlong(from: number, to: number, seam: Seam | null, p: number): number {
  if (!seam) return from + (to - from) * p;
  const downward = to >= from;
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const overlap = Math.max(0, Math.min(hi, seam.landing) - Math.max(lo, seam.gate));
  const distance = hi - lo - overlap;
  const traveled = p * distance;

  if (downward) {
    const untilGap = Math.max(0, seam.gate - from);
    if (traveled <= untilGap) return from + traveled;
    return seam.landing + (traveled - untilGap);
  }

  const untilGap = Math.max(0, from - seam.landing);
  if (traveled <= untilGap) return from - traveled;
  return seam.gate - (traveled - untilGap);
}

/** Where a destination should sit: pinned stages at their top, the rest under the header. */
function scrollTarget(id: string, pin: boolean): number | null {
  const element = document.getElementById(id);
  if (!element) return null;
  const top = element.getBoundingClientRect().top + window.scrollY;
  if (pin) return Math.max(0, top);
  const header = document.querySelector("header");
  const offset = header?.getBoundingClientRect().height ?? 0;
  return Math.max(0, top - offset);
}

function seamOnPath(from: number, to: number): Seam | null {
  const seam = heroServicesSeam();
  if (!seam) return null;
  const overlap = Math.min(Math.max(from, to), seam.landing) - Math.max(Math.min(from, to), seam.gate);
  return overlap > 1 ? seam : null;
}

/**
 * Bottom-center helper. It stays hidden while the page is read downward, and
 * appears once the reader scrolls back up after the first 6%. The arrow opens
 * a two-step menu: the top of the hero, or one of three sections.
 */
export function ScrollHelper() {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<Menu>("closed");
  const shownRef = useRef(false);
  const scrollingRef = useRef(false);
  const lastRef = useRef(0);
  const accRef = useRef(0);
  const stopRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);
  const [visible, setVisible] = useState(false);
  const [menu, setMenu] = useState<Menu>("closed");

  const open = menu !== "closed";

  /* Direction, not position: down the page it stays out of the way. */
  useEffect(() => {
    lastRef.current = window.scrollY;

    const hide = () => {
      if (!shownRef.current && menuRef.current === "closed") return;
      shownRef.current = false;
      menuRef.current = "closed";
      setVisible(false);
      setMenu("closed");
    };

    const show = () => {
      if (shownRef.current) return;
      shownRef.current = true;
      setVisible(true);
    };

    const onScroll = () => {
      const y = window.scrollY;
      if (scrollingRef.current) {
        lastRef.current = y;
        return;
      }

      const delta = y - lastRef.current;
      lastRef.current = y;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0 || y / max <= SHOW_AT) {
        accRef.current = 0;
        hide();
        return;
      }

      accRef.current += delta;
      if (accRef.current <= -NUDGE) {
        accRef.current = 0;
        show();
      } else if (accRef.current >= NUDGE) {
        accRef.current = 0;
        /* An open menu stays put, so a nudge does not dismiss it under a finger. */
        if (menuRef.current === "closed") hide();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopRef.current?.();
    };
  }, []);

  /* Escape, outside press, and arrow keys. Focus moves into the choices. */
  useEffect(() => {
    if (menu === "closed") return;
    const root = rootRef.current;
    if (!root) return;

    const items = () => Array.from(root.querySelectorAll<HTMLButtonElement>("[role='menuitem']"));
    items()[0]?.focus({ preventScroll: true });

    const close = (restoreFocus: boolean) => {
      menuRef.current = "closed";
      setMenu("closed");
      if (restoreFocus) buttonRef.current?.focus({ preventScroll: true });
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const list = items();
      const index = list.indexOf(document.activeElement as HTMLButtonElement);
      if (index < 0) return;
      event.preventDefault();
      const next = event.key === "ArrowDown" ? (index + 1) % list.length : (index - 1 + list.length) % list.length;
      list[next]?.focus({ preventScroll: true });
    };

    /* A press outside closes the menu and still reaches whatever was under it. */
    const onPointer = (event: PointerEvent) => {
      if (root.contains(event.target as Node)) return;
      close(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menu]);

  /**
   * One quick move. While it runs the channel cut is held, and a path that
   * crosses the empty hero/services stretch skips that stretch in one frame.
   * A wheel, touch, or scroll key after the tap cancels it.
   */
  const jumpTo = (id: string, pin: boolean) => {
    const to = scrollTarget(id, pin);
    if (to == null) return;

    stopRef.current?.();

    const from = window.scrollY;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const release = holdChannelCut();
    const html = document.documentElement;
    const previousBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    scrollingRef.current = true;

    let tween: gsap.core.Tween | null = null;
    let grace = 0;
    let settled = false;

    const endMotion = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(grace);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchmove", cancel);
      window.removeEventListener("keydown", onCancelKey);
      html.style.scrollBehavior = previousBehavior;
      ScrollTrigger.update();
      release();
      scrollingRef.current = false;
      lastRef.current = window.scrollY;
      accRef.current = 0;
      if (stopRef.current === cancel) stopRef.current = null;
      if (!mountedRef.current) return;

      const max = html.scrollHeight - window.innerHeight;
      if (max <= 0 || window.scrollY / max <= SHOW_AT) {
        shownRef.current = false;
        menuRef.current = "closed";
        setVisible(false);
        setMenu("closed");
      }
    };

    const cancel = () => {
      if (tween) tween.kill();
      else endMotion();
    };

    const onCancelKey = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "PageUp" ||
        event.key === "PageDown" ||
        event.key === "Home" ||
        event.key === "End" ||
        event.key === " "
      ) {
        cancel();
      }
    };

    stopRef.current = cancel;

    if (Math.abs(to - from) < 2 || reduced) {
      window.scrollTo({ top: to, behavior: "instant" });
      endMotion();
      return;
    }

    /*
     * One tween for every jump, including a path with no empty stretch.
     * ScrollToPlugin also writes scroll-behavior, and its restore was leaving
     * the page on `auto` after the stylesheet's smooth scrolling.
     */
    const seam = seamOnPath(from, to);
    const proxy = { p: 0 };
    tween = gsap.to(proxy, {
      p: 1,
      duration: SCROLL_S,
      ease: "power3.out",
      onUpdate: () => {
        window.scrollTo({ top: positionAlong(from, to, seam, proxy.p), behavior: "instant" });
      },
      onComplete: () => {
        window.scrollTo({ top: to, behavior: "instant" });
        endMotion();
      },
      onInterrupt: endMotion,
    });

    grace = window.setTimeout(() => {
      window.addEventListener("wheel", cancel, { passive: true });
      window.addEventListener("touchmove", cancel, { passive: true });
      window.addEventListener("keydown", onCancelKey);
    }, CANCEL_GRACE_MS);
  };

  const closeMenu = () => {
    menuRef.current = "closed";
    setMenu("closed");
    buttonRef.current?.focus({ preventScroll: true });
  };

  const choose = (id: string, pin: boolean) => {
    menuRef.current = "closed";
    setMenu("closed");
    buttonRef.current?.focus({ preventScroll: true });
    jumpTo(id, pin);
  };

  return (
    <div
      ref={rootRef}
      inert={!visible}
      aria-hidden={visible ? undefined : true}
      className={`pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4 transition-opacity duration-200 motion-reduce:transition-none bottom-[max(1rem,env(safe-area-inset-bottom))] ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Only the circle and the menu take clicks, so the corner button stays reachable. */}
      <div className={`relative ${visible ? "pointer-events-auto" : ""}`}>
        {/* Same circle either way: the chevron leaves and the X takes its place. */}
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          aria-haspopup="menu"
          aria-label={open ? "Închide navigarea" : "Deschide navigarea: sus sau către o secțiune"}
          onClick={() => {
            if (open) closeMenu();
            else {
              menuRef.current = "choices";
              setMenu("choices");
            }
          }}
          className="grid size-12 cursor-pointer place-items-center rounded-full border border-bar-cyan/50 bg-background/85 text-eggshell shadow-[0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-md outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bar-cyan"
        >
          {open ? (
            <X aria-hidden="true" className="size-5" strokeWidth={2.25} />
          ) : (
            <ChevronUp aria-hidden="true" className="helper-bob size-5" strokeWidth={2.25} />
          )}
        </button>

        {open ? (
          <div
            key={menu}
            id={menuId}
            role="menu"
            aria-label={menu === "choices" ? "Navigare rapidă" : "Alege o secțiune"}
            className="helper-pop absolute bottom-full left-1/2 mb-3 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-white/10 bg-popover/95 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
          >
            {menu === "choices" ? (
              <>
                <Choice index="01" onSelect={() => choose("hero", true)}>
                  Derulează sus
                </Choice>
                <Choice index="02" onSelect={() => {
                  menuRef.current = "sections";
                  setMenu("sections");
                }}>
                  Derulează la o secțiune
                </Choice>
              </>
            ) : (
              SECTIONS.map((section, index) => (
                <Choice
                  key={section.id}
                  index={String(index + 1).padStart(2, "0")}
                  onSelect={() => choose(section.id, section.pin)}
                >
                  {section.label}
                </Choice>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** One numbered row. The cyan bar is the cursor; it lights on hover and focus. */
function Choice({
  index,
  children,
  onSelect,
}: {
  index: string;
  children: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className="group/choice flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 text-left text-eggshell outline-none hover:bg-white/5 focus-visible:bg-white/5"
    >
      <span className="type-index w-6 shrink-0 text-dim group-hover/choice:text-bar-cyan group-focus/choice:text-bar-cyan">
        {index}
      </span>
      <span className="type-button border-l-2 border-white/15 py-2 pl-2.5 leading-snug group-hover/choice:border-bar-cyan group-focus/choice:border-bar-cyan">
        {children}
      </span>
    </button>
  );
}
