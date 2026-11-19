"use client";

import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type RefObject, Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PAPER_HEX } from "@/app/lib/bars";

/**
 * One television from the hero's pile (public/models/tv-pile.gltf, already in
 * the loader cache by the time this scrolls in), standing on the pillar cabinet.
 *
 * Set 2 of the pile is the one whose glass faces straight down +X, so the
 * camera sits on +X and looks in. It is drawn the way the hero draws it:
 * unlit ink sheets, a black body, a paper glint. The glass is swapped for a
 * flat screen with a canvas texture that shows the open pillar as a channel
 * ident, and runs a burst of static whenever the channel changes.
 *
 * The parent owns a pose ref (turn and lift, written by a scrubbed
 * ScrollTrigger) and decides when the canvas renders at all.
 */

const MODEL_URL = "/models/tv-pile.gltf";
/** Centre of set 2 in the pile, from the export. The nearest shell to it is the set we keep. */
const SET_CENTRE = new THREE.Vector3(1.02, 2.07, 4.4);
const INK_TINT = new THREE.Color(PAPER_HEX).lerp(new THREE.Color("#ffffff"), 0.35);

export type Channel = { name: string; tagline: string; color: string; count: string } | null;
export type Pose = { turn: number; lift: number };

const PAINTS = ["#f8d50e", "#52cbec", "#53d54b", "#e54bc9", "#e8401e", "#7d4dfe"];

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

    ctx.fillStyle = channel.color;
    ctx.font = "700 30px ui-sans-serif, system-ui, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(channel.count, 34, h * 0.5);

    ctx.fillStyle = PAPER_HEX;
    ctx.font = "800 84px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(channel.name.toUpperCase(), 32, h * 0.72);

    ctx.fillStyle = "rgba(243,233,210,0.7)";
    ctx.font = "500 34px ui-sans-serif, system-ui, sans-serif";
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

function Television({
  channel,
  pose,
  still,
  onReady,
}: {
  channel: Channel;
  pose: RefObject<Pose>;
  still: boolean;
  onReady?: () => void;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  /* Clone the cached pile, keep set 2, swap materials, and centre it on the origin. */
  const { model, screen, texture, ctx } = useMemo(() => {
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
    canvas.width = 512;
    canvas.height = 384;
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
  }, [scene]);

  /* Channel changes: a short burst of static, then the ident. */
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
  }, [channel, ctx, texture, invalidate, still]);

  /* The model is in: the parent can drop its painted stand-in. */
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => () => {
    texture.dispose();
    screen.geometry.dispose();
  }, [texture, screen]);

  /* The scroll writes the pose; the set turns toward the reader and settles. */
  useFrame(() => {
    const set = group.current;
    const current = pose.current;
    if (!set || !current) return;
    set.rotation.y = THREE.MathUtils.lerp(set.rotation.y, current.turn, 0.12);
    set.position.y = THREE.MathUtils.lerp(set.position.y, current.lift, 0.12);
    if (Math.abs(set.rotation.y - current.turn) > 0.0005) invalidate();
  });

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

/** The canvas. `active` gates rendering, so it draws only while on screen. */
export default function CabinetTv({
  channel,
  pose,
  active,
  still,
  onReady,
}: {
  channel: Channel;
  pose: RefObject<Pose>;
  active: boolean;
  still: boolean;
  onReady?: () => void;
}) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [10.5, 0.6, 0], fov: 30, near: 0.1, far: 100 }}
      onCreated={({ camera }) => camera.lookAt(0, -0.1, 0)}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <Television channel={channel} pose={pose} still={still} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
