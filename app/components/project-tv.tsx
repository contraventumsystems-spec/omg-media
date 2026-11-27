"use client";

import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type RefObject, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { buildSet, MODEL_URL } from "@/app/components/cabinet-tv";
import { PAPER_HEX } from "@/app/lib/bars";
import { useDict } from "@/app/i18n/locale-provider";

/**
 * The project television: the same set as the homepage cabinet (set 2 of the
 * pile), with a screen that plays a project's site.
 *
 * The site is a stitched capture (public/projects/<slug>/screen.webp, 1024
 * wide). The screen reads it like a visitor would: a pause on the first
 * fold, a screen's worth of scroll, a pause, and so on to the end, then
 * static and back to the top.
 *
 * `fx` is driven from outside (a GSAP timeline) and read every frame:
 *   on      1 is the picture, 0 is a dark tube. In between the picture is a
 *           bright line that opens or closes vertically, like a CRT powering
 *           on or off, with a flash as it opens.
 *   squash  0 is the set, 1 is the set flattened into a horizontal line: the
 *           television becoming the beam of light.
 * Without `fx` the screen powers on by itself and a change of channel is a
 * burst of static. One canvas in the DOM box; it only renders while active.
 */

export type Screen =
  | { kind: "site"; src: string; color: string }
  | { kind: "ident"; title: string; subtitle: string; color: string };

/** Pointer over the page, -1 to 1 on both axes. The set turns a little toward it. */
export type Pointer = { x: number; y: number };

export type TvFx = { on: number; squash: number };

const PAINTS = ["#f8d50e", "#52cbec", "#53d54b", "#e54bc9", "#e8401e", "#7d4dfe"];
const STATIC_MS = 320;
/** Reading rhythm, in seconds: first fold, each scroll, each pause, the end. */
const READ = { first: 1.1, scroll: 0.9, pause: 0.65, end: 1.4 };
/** Each step scrolls this share of the screen's height. */
const STEP = 0.62;

/** Marks the screen for upload. A helper, so the memoised texture is not written in place. */
function upload(texture: THREE.Texture) {
  texture.needsUpdate = true;
}

/** Sharp at an angle, no mipmaps: the canvas is redrawn too often to build them. */
function tuneTexture(texture: THREE.Texture, gl: THREE.WebGLRenderer) {
  texture.anisotropy = gl.capabilities.getMaxAnisotropy();
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
}

const images = new Map<string, HTMLImageElement>();

/** One decoded image per capture, shared by every mount. Also warms the next channel. */
export function loadImage(src: string) {
  let image = images.get(src);
  if (!image) {
    image = new Image();
    image.decoding = "async";
    image.src = src;
    images.set(src, image);
  }
  return image;
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** Scanlines and a soft vignette, drawn once and laid over every frame. */
function makeGlass(width: number, height: number) {
  const glass = makeCanvas(width, height);
  const ctx = glass.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  for (let y = 0; y < height; y += 4) ctx.fillRect(0, y, width, 2);
  const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.35, width / 2, height / 2, width * 0.72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
  return glass;
}

function paintNoise(ctx: CanvasRenderingContext2D, scratch: HTMLCanvasElement) {
  const small = scratch.getContext("2d") as CanvasRenderingContext2D;
  const image = small.createImageData(scratch.width, scratch.height);
  const pixels = new Uint32Array(image.data.buffer);
  for (let i = 0; i < pixels.length; i++) {
    const value = 24 + ((Math.random() * 200) | 0);
    pixels[i] = (255 << 24) | (value << 16) | (value << 8) | value;
  }
  small.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(scratch, 0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.imageSmoothingEnabled = true;
}

function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: number, max: number, room: number) {
  ctx.font = `${weight} ${max}px ui-sans-serif, system-ui, sans-serif`;
  const width = ctx.measureText(text).width;
  const size = width > room ? Math.floor((max * room) / width) : max;
  ctx.font = `${weight} ${size}px ui-sans-serif, system-ui, sans-serif`;
}

/** A channel card: the six bars, the channel's own one taller, and two lines of type. */
function paintIdent(ctx: CanvasRenderingContext2D, title: string, subtitle: string, color: string) {
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = "#120e0b";
  ctx.fillRect(0, 0, w, h);
  const bar = w / PAINTS.length;
  PAINTS.forEach((paint, index) => {
    ctx.fillStyle = paint;
    const tall = paint.toLowerCase() === color.toLowerCase();
    ctx.fillRect(index * bar, 0, bar + 1, tall ? h * 0.38 : h * 0.26);
  });
  const room = w * 0.86;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = PAPER_HEX;
  fitFont(ctx, title.toUpperCase(), 800, Math.round(h * 0.16), room);
  ctx.fillText(title.toUpperCase(), w * 0.07, h * 0.66);
  ctx.fillStyle = "rgba(243,233,210,0.72)";
  fitFont(ctx, subtitle, 500, Math.round(h * 0.065), room);
  ctx.fillText(subtitle, w * 0.07, h * 0.8);
}

/**
 * The tube between off and on: the picture squeezed into a band around the
 * middle, a bright line at its edge, a flash while it opens. At the very end
 * of power-off the line also shrinks sideways toward a dot.
 */
function paintPower(ctx: CanvasRenderingContext2D, picture: HTMLCanvasElement, on: number) {
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = "#0b0907";
  ctx.fillRect(0, 0, w, h);
  if (on <= 0.001) return;
  const band = h * on;
  ctx.drawImage(picture, 0, 0, w, h, 0, (h - band) / 2, w, band);
  const reach = Math.min(1, on * 9);
  const lineWidth = w * (0.04 + 0.96 * reach);
  const lineHeight = Math.max(3, h * 0.018 * (1 - on) + 3);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = `rgba(255,250,235,${0.95 * (1 - on * 0.85)})`;
  ctx.fillRect((w - lineWidth) / 2, h / 2 - lineHeight / 2, lineWidth, lineHeight);
  const flash = on * (1 - on) * 1.4;
  if (flash > 0.01) {
    ctx.fillStyle = `rgba(255,248,230,${flash})`;
    ctx.fillRect(0, (h - band) / 2, w, band);
  }
  ctx.globalCompositeOperation = "source-over";
}

/** Where the reader is in the capture at time `t` (seconds), as a share of the scroll range, and when the loop ends. */
function readingAt(t: number, steps: number) {
  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
  if (t < READ.first) return { at: 0, done: false };
  let clock = t - READ.first;
  for (let step = 0; step < steps; step++) {
    if (clock < READ.scroll) return { at: (step + ease(clock / READ.scroll)) / steps, done: false };
    clock -= READ.scroll;
    if (step < steps - 1) {
      if (clock < READ.pause) return { at: (step + 1) / steps, done: false };
      clock -= READ.pause;
    }
  }
  return { at: 1, done: clock > READ.end };
}

function Lens() {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  useLayoutEffect(() => {
    camera.current?.lookAt(0, -0.05, 0);
  }, []);
  return <PerspectiveCamera ref={camera} makeDefault position={[10.5, 0.45, 0]} fov={29} near={0.1} far={100} />;
}

function Television({
  screen,
  pointer,
  turn,
  still,
  sharp,
  fx,
  onReady,
  tuning,
}: {
  screen: Screen;
  pointer: RefObject<Pointer>;
  turn: number;
  still: boolean;
  sharp: boolean;
  fx: RefObject<TvFx> | null;
  onReady?: () => void;
  /** "Se acordează" and its subtitle, in the page's language: drawn while a site loads. */
  tuning: { tuning: string; tuningSub: string };
}) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const size = sharp ? { width: 1024, height: 768 } : { width: 720, height: 540 };
  const { model, screen: plane, texture, ctx } = useMemo(
    () => buildSet(scene, size),
    // The screen size is fixed for the life of the canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene],
  );
  /* The picture is painted here, then laid onto the tube through the power effect. */
  const picture = useMemo(() => makeCanvas(ctx.canvas.width, ctx.canvas.height), [ctx]);
  const pictureCtx = useMemo(() => picture.getContext("2d") as CanvasRenderingContext2D, [picture]);
  const glass = useMemo(() => makeGlass(ctx.canvas.width, ctx.canvas.height), [ctx]);
  const scratch = useMemo(
    () => makeCanvas(Math.ceil(ctx.canvas.width / 4), Math.ceil(ctx.canvas.height / 4)),
    [ctx],
  );

  /* Without fx the set powers itself on once. */
  const selfPower = useRef<TvFx>({ on: still ? 1 : 0, squash: 0 });
  const state = useRef({
    staticUntil: 0,
    since: 0,
    image: null as HTMLImageElement | null,
    content: "",
    shown: "",
  });
  const gl = useThree((three) => three.gl);

  useEffect(() => {
    tuneTexture(texture, gl);
  }, [gl, texture]);

  /* A new channel: start reading from the top. Without fx, a burst of static first. */
  useEffect(() => {
    const now = performance.now() / 1000;
    const current = state.current;
    const burst = !still && !fx && current.since > 0;
    current.staticUntil = burst ? now + STATIC_MS / 1000 : 0;
    current.since = current.staticUntil || now;
    current.content = "";
    current.image = screen.kind === "site" ? loadImage(screen.src) : null;
  }, [screen, still, fx]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(
    () => () => {
      texture.dispose();
      plane.geometry.dispose();
    },
    [texture, plane],
  );

  useFrame((three, delta) => {
    const now = performance.now() / 1000;
    const current = state.current;
    const { width: w, height: h } = ctx.canvas;
    if (!fx && selfPower.current.on < 1) {
      selfPower.current.on = Math.min(1, selfPower.current.on + delta * 2.2);
    }
    const power = fx?.current ?? selfPower.current;

    /* 1. The picture: static, a channel card, or the site at the reading position. */
    let content = current.content;
    if (now < current.staticUntil) {
      paintNoise(pictureCtx, scratch);
      content = `static-${now}`;
    } else if (screen.kind === "ident") {
      content = `ident-${screen.title}`;
      if (content !== current.content) paintIdent(pictureCtx, screen.title, screen.subtitle, screen.color);
    } else {
      const image = current.image;
      if (image && image.complete && image.naturalWidth > 0) {
        const view = (image.naturalWidth * h) / w;
        const range = Math.max(0, image.naturalHeight - view);
        const steps = Math.max(1, Math.ceil(range / (view * STEP)));
        const reading = still ? { at: 0, done: false } : readingAt(now - current.since, steps);
        if (reading.done) {
          current.staticUntil = now + STATIC_MS / 1000;
          current.since = current.staticUntil;
        }
        const top = Math.round(reading.at * range);
        content = `site-${image.src}-${top}`;
        if (content !== current.content) pictureCtx.drawImage(image, 0, top, image.naturalWidth, view, 0, 0, w, h);
      } else {
        content = "tuning";
        if (content !== current.content) paintIdent(pictureCtx, tuning.tuning, tuning.tuningSub, screen.color);
      }
    }
    if (content !== current.content) {
      pictureCtx.drawImage(glass, 0, 0);
      current.content = content;
    }

    /* 2. The tube: the picture as is, or through the power line. Only redrawn on change. */
    const on = THREE.MathUtils.clamp(power.on, 0, 1);
    const shown = `${content}|${on.toFixed(3)}`;
    if (shown !== current.shown) {
      if (on >= 0.999) ctx.drawImage(picture, 0, 0);
      else paintPower(ctx, picture, on);
      upload(texture);
      current.shown = shown;
    }

    /* 3. The set: turns toward the pointer, bobs, and flattens into the beam. */
    const set = group.current;
    if (!set) return;
    const aim = pointer.current ?? { x: 0, y: 0 };
    const bob = still ? 0 : Math.sin(three.clock.elapsedTime * 1.1) * 0.05;
    set.rotation.y = THREE.MathUtils.lerp(set.rotation.y, turn + aim.x * 0.2, 0.08);
    set.rotation.z = THREE.MathUtils.lerp(set.rotation.z, aim.y * 0.05, 0.08);
    set.position.y = THREE.MathUtils.lerp(set.position.y, bob, 0.08);
    const squash = THREE.MathUtils.clamp(power.squash, -0.2, 1);
    set.scale.set(1 + squash * 0.35, Math.max(0.015, 1 - squash), 1 + squash * 0.35);
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

/**
 * The canvas fills its parent. `active` stops the frame loop while the box
 * is off screen; `turn` is the set's resting angle.
 */
export default function ProjectTv({
  screen,
  pointer,
  active,
  still,
  turn = 0,
  fx = null,
  onReady,
}: {
  screen: Screen;
  pointer: RefObject<Pointer>;
  active: boolean;
  still: boolean;
  turn?: number;
  fx?: RefObject<TvFx> | null;
  onReady?: () => void;
}) {
  const tuning = useDict().work.tv;
  const sharp = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches,
    [],
  );
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, sharp ? 2 : 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      aria-hidden="true"
    >
      <Lens />
      <Suspense fallback={null}>
        <Television
          screen={screen}
          pointer={pointer}
          turn={turn}
          still={still}
          sharp={sharp}
          fx={fx}
          onReady={onReady}
          tuning={tuning}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
