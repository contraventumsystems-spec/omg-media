"use client";

import { PerspectiveCamera, useGLTF, View } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type RefObject, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PAPER_HEX } from "@/app/lib/bars";

/**
 * The three televisions of "Ce construim" (app/components/pillar-cabinet.tsx).
 *
 * Each one is set 2 of the hero's pile (public/models/tv-pile.gltf, already in
 * the loader cache by the time this scrolls in), drawn the way the hero draws
 * it: unlit ink sheets, a black body, a paper glint. The glass is swapped for
 * a flat screen with a canvas texture that shows its pillar as a channel
 * ident, and runs a burst of static whenever it is tuned or pressed.
 *
 * One WebGL context for all three: a fixed, see-through canvas with a drei
 * View per set. Each View follows a DOM box in the section, so the layout,
 * the parallax and the hit area are plain DOM and CSS; the canvas only paints
 * a set inside each box. The parent decides when the canvas shows at all.
 */

export const MODEL_URL = "/models/tv-pile.gltf";
/** Centre of set 2 in the pile, from the export. The nearest shell to it is the set we keep. */
const SET_CENTRE = new THREE.Vector3(1.02, 2.07, 4.4);
const INK_TINT = new THREE.Color(PAPER_HEX).lerp(new THREE.Color("#ffffff"), 0.35);

export type Channel = { name: string; tagline: string; color: string; count: string } | null;
/** turn and lift come from the scroll, hover from the pointer; all in the set's own units. */
export type Pose = { turn: number; lift: number; hover: number };

export type WallSet = {
  /** The DOM box the set is painted into. */
  track: RefObject<HTMLElement | null>;
  channel: Channel;
  pose: RefObject<Pose>;
  /** Bumped on every press: the screen bursts into static and tunes back. */
  pulse: number;
};

const PAINTS = ["#f8d50e", "#52cbec", "#53d54b", "#e54bc9", "#e8401e", "#7d4dfe"];

/** Largest size, at most `max`, at which `text` fits in `room` pixels. */
function fitFont(ctx: CanvasRenderingContext2D, text: string, weight: number, max: number, room: number) {
  let size = max;
  ctx.font = `${weight} ${size}px ui-sans-serif, system-ui, sans-serif`;
  const width = ctx.measureText(text).width;
  if (width > room) size = Math.floor((size * room) / width);
  ctx.font = `${weight} ${size}px ui-sans-serif, system-ui, sans-serif`;
}

/** Draws the screen: a channel ident, static, or a dark tube. */
function paintScreen(ctx: CanvasRenderingContext2D, channel: Channel, noise: boolean) {
  const { width: w, height: h } = ctx.canvas;
  ctx.fillStyle = "#120e0b";
  ctx.fillRect(0, 0, w, h);

  if (noise) {
    const image = ctx.createImageData(w / 4, h / 4);
    for (let i = 0; i < image.data.length; i += 4) {
      const v = Math.random() * 255;
      image.data[i] = v;
      image.data[i + 1] = v;
      image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
    const small = document.createElement("canvas");
    small.width = w / 4;
    small.height = h / 4;
    small.getContext("2d")?.putImageData(image, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, 0, 0, w, h);
  } else if (channel) {
    /* The six bars across the top, the pillar's own one taller. */
    const bar = w / PAINTS.length;
    PAINTS.forEach((paint, index) => {
      ctx.fillStyle = paint;
      const tall = paint.toLowerCase() === channel.color.toLowerCase();
      ctx.fillRect(index * bar, 0, bar + 1, tall ? h * 0.36 : h * 0.24);
    });
    ctx.fillStyle = "rgba(18,14,11,0.25)";
    ctx.fillRect(0, 0, w, h * 0.36);

    const room = w - 68;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = channel.color;
    fitFont(ctx, channel.count, 700, 30, room);
    ctx.fillText(channel.count, 34, h * 0.5);

    ctx.fillStyle = PAPER_HEX;
    fitFont(ctx, channel.name.toUpperCase(), 800, 84, room);
    ctx.fillText(channel.name.toUpperCase(), 32, h * 0.72);

    ctx.fillStyle = "rgba(243,233,210,0.7)";
    fitFont(ctx, channel.tagline, 500, 34, room);
    ctx.fillText(channel.tagline, 34, h * 0.86);
  }

  /* Scanlines and a soft vignette, like the rest of the tubes. */
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);
  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.7);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

/** Marks the screen texture for upload. A helper, so the hook's value is not written in place. */
function refresh(texture: THREE.Texture) {
  texture.needsUpdate = true;
}

/**
 * Clones the cached pile, keeps set 2, swaps materials, and centres it on the origin.
 * `screen` is the size of the screen's canvas; the project pages paint a larger one.
 */
export function buildSet(scene: THREE.Object3D, screen = { width: 512, height: 384 }) {
  const root = scene.clone(true);
  root.updateWorldMatrix(true, true);

  const meshes: THREE.Mesh[] = [];
  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) meshes.push(obj as THREE.Mesh);
  });
  const nameOf = (mesh: THREE.Mesh) =>
    ((Array.isArray(mesh.material) ? mesh.material[0] : mesh.material)?.name ?? "") as string;

  const shells = meshes.filter(
    (mesh) => nameOf(mesh).startsWith("OldTV") && mesh.geometry.getAttribute("position").count > 1000,
  );
  const centre = new THREE.Vector3();
  let shell = shells[0];
  let best = Infinity;
  for (const candidate of shells) {
    new THREE.Box3().setFromObject(candidate).getCenter(centre);
    const distance = centre.distanceTo(SET_CENTRE);
    if (distance < best) {
      best = distance;
      shell = candidate;
    }
  }
  const shellBox = new THREE.Box3().setFromObject(shell);
  const shellCentre = shellBox.getCenter(new THREE.Vector3());

  const set = new THREE.Group();
  const body = new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false });
  const glint = new THREE.MeshBasicMaterial({ color: PAPER_HEX, toneMapped: false, side: THREE.DoubleSide });
  const ink = new Map<string, THREE.MeshBasicMaterial>();
  let glass: THREE.Box3 | null = null;

  for (const mesh of meshes) {
    const box = new THREE.Box3().setFromObject(mesh);
    box.getCenter(centre);
    if (shellBox.distanceToPoint(centre) > 0.01) continue;
    const name = nameOf(mesh);
    if (name.startsWith("SCREEN")) {
      glass = box;
      continue;
    }
    if (name.startsWith("small-polka-dot")) continue;
    /* Take the world transform, so the part keeps its place in the pile once detached. */
    const part = mesh.clone();
    mesh.matrixWorld.decompose(part.position, part.quaternion, part.scale);
    const original = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
    if (name.startsWith("OldTV")) {
      let material = ink.get(original.uuid);
      if (!material) {
        material = new THREE.MeshBasicMaterial({
          map: original.emissiveMap,
          color: original.emissive.clone().multiply(INK_TINT),
          toneMapped: false,
          side: original.side,
        });
        ink.set(original.uuid, material);
      }
      part.material = material;
    } else if (name === "Material.002") {
      part.material = glint;
    } else {
      part.material = body;
    }
    part.position.sub(shellCentre);
    set.add(part);
  }

  /* The screen: a flat plane in the glass opening, facing +X. */
  const canvas = document.createElement("canvas");
  canvas.width = screen.width;
  canvas.height = screen.height;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const glassBox = glass ?? shellBox;
  const size = glassBox.getSize(new THREE.Vector3());
  const middle = glassBox.getCenter(new THREE.Vector3()).sub(shellCentre);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(size.z * 0.86, size.y * 0.84),
    new THREE.MeshBasicMaterial({ map, toneMapped: false }),
  );
  plane.rotation.y = Math.PI / 2;
  plane.position.set(middle.x + size.x * 0.22, middle.y, middle.z);
  set.add(plane);

  return { model: set, screen: plane, texture: map, ctx: context };
}

/** The camera on +X, looking into the glass. */
function Lens() {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  useLayoutEffect(() => {
    camera.current?.lookAt(0, -0.1, 0);
  }, []);
  return <PerspectiveCamera ref={camera} makeDefault position={[10.5, 0.6, 0]} fov={30} near={0.1} far={100} />;
}

function Television({
  channel,
  pose,
  pulse,
  phase,
  still,
  onReady,
}: {
  channel: Channel;
  pose: RefObject<Pose>;
  pulse: number;
  phase: number;
  still: boolean;
  onReady?: () => void;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const { model, screen, texture, ctx } = useMemo(() => buildSet(scene), [scene]);

  /* Tuned or pressed: a short burst of static, then the ident. */
  useEffect(() => {
    let frame = 0;
    let timer = 0;
    const settle = () => {
      paintScreen(ctx, channel, false);
      refresh(texture);
      invalidate();
    };
    if (still || !channel) {
      settle();
      return;
    }
    const start = performance.now();
    const tick = () => {
      paintScreen(ctx, channel, true);
      refresh(texture);
      invalidate();
      if (performance.now() - start < 280) frame = requestAnimationFrame(tick);
      else timer = window.setTimeout(settle, 0);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [channel, pulse, ctx, texture, invalidate, still]);

  /* The model is in: the parent can drop its painted stand-ins. */
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => () => {
    texture.dispose();
    screen.geometry.dispose();
  }, [texture, screen]);

  /* The scroll and the pointer write the pose; a slow bob keeps the set alive once it has landed. */
  useFrame((state) => {
    const set = group.current;
    const current = pose.current;
    if (!set || !current) return;
    const bob = still ? 0 : Math.sin(state.clock.elapsedTime * 1.1 + phase) * 0.06;
    set.rotation.y = THREE.MathUtils.lerp(set.rotation.y, current.turn + current.hover, 0.12);
    set.position.y = THREE.MathUtils.lerp(set.position.y, current.lift + bob, 0.12);
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

/**
 * The canvas. `active` gates rendering and showing it: a fixed canvas keeps
 * its last frame, so it is hidden while the section is off screen.
 */
export default function ChannelWall({
  sets,
  active,
  still,
  onReady,
}: {
  sets: WallSet[];
  active: boolean;
  still: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        visibility: active ? "visible" : "hidden",
      }}
      aria-hidden="true"
    >
      {sets.map((set, index) => (
        <View key={index} track={set.track as RefObject<HTMLElement>}>
          <Lens />
          <Suspense fallback={null}>
            <Television
              channel={set.channel}
              pose={set.pose}
              pulse={set.pulse}
              phase={index * 2.1}
              still={still}
              onReady={index === 0 ? onReady : undefined}
            />
          </Suspense>
        </View>
      ))}
    </Canvas>
  );
}
