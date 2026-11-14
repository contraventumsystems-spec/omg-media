"use client";

import { useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createOverlayMaterial,
  createOverlayUniforms,
  type OverlayUniforms,
} from "@/app/components/omg-liquid-shaders";
import { letterUniforms } from "@/app/components/tv-shaders";
import { useSceneStore } from "@/app/lib/scene-store";

/**
 * The O, M and G tubes come to life. Once, on load: the three sets power on one
 * after the other and their letters spring out of the glass as solid blocks.
 * Then a loop, for as long as the page rests at the top: the blocks turn slowly,
 * swell in a wave from O to G, a gleam crosses the row, and now and then the
 * channel slips. The first scroll fades it out with the letters it stands on;
 * back at the top the loop is there again, without the opening.
 *
 * How it is parented, and why it cannot touch the rest of the page:
 *
 * - Each tube gets one quad, added as a CHILD of that tube's screen mesh. It
 *   rides along with whatever the pile does to the set and needs no code of its
 *   own to follow it.
 * - Nothing of the pile is written. The overlay reads a tube's rest matrix, glass
 *   bounds and glyph once, to place itself, and samples the shared letter atlas.
 *   It owns its geometry, its material and its uniforms. The load sequence of
 *   the pile (bars, paint, pool) and the cycling bottom row run as before.
 * - It draws without depth, after the pile, and is hidden whenever the resting
 *   letters are: on scroll, in the later beats, it costs no draw call.
 * - One paused GSAP timeline is stepped from the frame loop, so the three tubes
 *   share a single clock and the animation stops when the canvas stops.
 * - On unmount the quads leave their parents, the geometry and the material are
 *   disposed and the timeline is killed.
 * - Reduced motion never mounts it. The still frame of the pile is the fallback.
 */

/** What the overlay needs from a tube of the pile. All of it is read, none written. */
export type OmgScreen = {
  mesh: THREE.Mesh;
  /** Rest-pose glass, in the world. */
  glass: THREE.Box3;
  uniforms: THREE.ShaderMaterial["uniforms"];
};

/** Colour of each block: yellow, magenta, cyan, from the paint of the pool. O, M, G. */
const BLOCK_HEX = ["#FFD21F", "#EE44C6", "#1EC8EB"];
/** The quad is larger than the glass by this share of its height, for a block that leans out. */
const MARGIN = 0.2;
/** How far the quad stands off the glass. Just outside the lip paint. */
const OFFSET = 0.16;
/** Seconds the opening takes. The loop starts here. */
const INTRO = 2.6;
/** Seconds for one slow turn of the blocks. */
const TURN = 7;

/** The opening plays once per page load, also across a remount of the scene. */
let opened = false;

/**
 * The glass as a plane x = a * z + b * y + c in the rest pose: the camera looks
 * down -X at the pile and screen-right is -Z. A bar screen's mesh also holds its
 * drip, so only the vertices inside the glass bounds count.
 */
function fitGlass(mesh: THREE.Mesh, rest: THREE.Matrix4, glass: THREE.Box3) {
  const positions = mesh.geometry.getAttribute("position");
  if (!positions) return null;
  const bounds = glass.clone().expandByScalar(0.01);
  const sums = new THREE.Matrix3().set(0, 0, 0, 0, 0, 0, 0, 0, 0);
  const plane = new THREE.Vector3();
  const point = new THREE.Vector3();
  const e = sums.elements;
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i).applyMatrix4(rest);
    if (!bounds.containsPoint(point)) continue;
    const basis = [point.z, point.y, 1];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) e[c * 3 + r] += basis[r] * basis[c];
      plane.setComponent(r, plane.getComponent(r) + basis[r] * point.x);
    }
  }
  if (Math.abs(sums.determinant()) < 1e-9) return null;
  return plane.applyMatrix3(sums.invert());
}

/** The quad of one tube, in the space of its screen mesh. Null if the tube has no letter. */
function buildQuad(screen: OmgScreen, index: number) {
  const rest = screen.uniforms.uRest?.value as THREE.Matrix4 | undefined;
  const glyph = (screen.uniforms.uGlyph?.value as number | undefined) ?? -1;
  const { glass } = screen;
  if (!rest || glyph < 0 || glass.isEmpty()) return null;
  const plane = fitGlass(screen.mesh, rest, glass);
  if (!plane) return null;

  const width = glass.max.z - glass.min.z;
  const height = glass.max.y - glass.min.y;
  /* A point of the glass plane, from its place on the glass: u left to right, v bottom to top. */
  const at = (u: number, v: number) => {
    const z = glass.max.z - u * width;
    const y = glass.min.y + v * height;
    return new THREE.Vector3(plane.x * z + plane.y * y + plane.z, y, z);
  };
  const origin = at(0, 0);
  const normal = at(1, 0).sub(origin).cross(at(0, 1).sub(origin)).normalize();
  /* Towards the camera. */
  if (normal.x < 0) normal.negate();

  /* Rest world to the mesh's own space, so the quad can be its child. */
  const toLocal = rest.clone().invert();
  const marginU = (MARGIN * height) / width;
  const corners = [
    [-marginU, 1 + MARGIN],
    [1 + marginU, 1 + MARGIN],
    [-marginU, -MARGIN],
    [1 + marginU, -MARGIN],
  ];
  const position = new Float32Array(12);
  const face = new Float32Array(8);
  const info = new Float32Array(12);
  const colors = new Float32Array(12);
  const color = new THREE.Color(BLOCK_HEX[index] ?? BLOCK_HEX[0]);
  corners.forEach(([u, v], i) => {
    at(u, v).addScaledVector(normal, OFFSET).applyMatrix4(toLocal).toArray(position, i * 3);
    face.set([u, v], i * 2);
    info.set([glyph, width / height, index], i * 3);
    color.toArray(colors, i * 3);
  });

  const quad = new THREE.BufferGeometry();
  quad.setAttribute("position", new THREE.BufferAttribute(position, 3));
  quad.setAttribute("aFace", new THREE.BufferAttribute(face, 2));
  quad.setAttribute("aInfo", new THREE.BufferAttribute(info, 3));
  quad.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  quad.setIndex([0, 2, 1, 1, 2, 3]);
  return quad;
}

type Run = {
  uniforms: OverlayUniforms;
  /** O, M and G. */
  tubes: { on: number; pop: number }[];
  drive: { gleam: number; glitch: number };
  timeline: gsap.core.Timeline;
  objects: THREE.Object3D[];
  elapsed: number;
  dispose: () => void;
};

/** Builds the overlay on the three tubes and the timeline that plays it. */
function createRun(screens: readonly (OmgScreen | undefined)[]): Run {
  const uniforms = createOverlayUniforms();
  const material = createOverlayMaterial(uniforms);
  const geometries: THREE.BufferGeometry[] = [];
  const objects: THREE.Object3D[] = [];

  screens.forEach((screen, index) => {
    if (!screen) return;
    const geometry = buildQuad(screen, index);
    if (!geometry) return;
    const quad = new THREE.Mesh(geometry, material);
    quad.name = "omg-overlay";
    /* The tube's own bounds decide nothing here: three quads, always in the hero shot. */
    quad.frustumCulled = false;
    quad.renderOrder = 20;
    quad.visible = false;
    screen.mesh.add(quad);
    geometries.push(geometry);
    objects.push(quad);
  });

  const tubes = [0, 1, 2].map(() => ({ on: 0, pop: 0 }));
  const drive = { gleam: 0, glitch: 0 };

  /* The opening, once: power on left to right, the letters spring out, a gleam crosses the row. */
  const intro = gsap
    .timeline()
    .to(tubes, { on: 1, duration: 0.42, ease: "power3.out", stagger: 0.16 }, 0)
    .to(tubes, { pop: 1, duration: 1.2, ease: "elastic.out(1, 0.42)", stagger: 0.16 }, 0.32)
    .fromTo(
      drive,
      { glitch: 1 },
      { glitch: 0, duration: 0.7, ease: "power2.out", immediateRender: false },
      0.32,
    )
    .to(drive, { gleam: 1, duration: 0.9, ease: "power1.inOut" }, 1.6);

  /* The loop: a swell from O to G, the gleam again, and a short slip of the channel. */
  const loop = gsap
    .timeline({ repeat: -1 })
    .to(
      tubes,
      { pop: 1.22, duration: 0.5, ease: "sine.inOut", stagger: 0.18, yoyo: true, repeat: 1 },
      0.5,
    )
    .fromTo(
      drive,
      { gleam: 0 },
      { gleam: 1, duration: 1.1, ease: "power1.inOut", immediateRender: false },
      2.7,
    )
    .to(drive, { glitch: 0.9, duration: 0.07, ease: "none", yoyo: true, repeat: 3 }, 4.8)
    .to(tubes, { pop: 1.12, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1 }, 4.8)
    /* A breath of rest before it comes round again. */
    .to({}, { duration: 0.9 });

  /* Paused: the frame loop steps it, so all three tubes share one clock. */
  const timeline = gsap.timeline({ paused: true }).add(intro, 0).add(loop, INTRO);

  return {
    uniforms,
    tubes,
    drive,
    timeline,
    objects,
    /* A remount goes straight to the loop. */
    elapsed: opened ? INTRO : 0,
    dispose: () => {
      timeline.kill();
      for (const object of objects) object.removeFromParent();
      for (const geometry of geometries) geometry.dispose();
      material.dispose();
      /* The letter atlas belongs to the pile and stays. */
    },
  };
}

/** One frame of the animation. */
function stepRun(run: Run, delta: number) {
  /* 1 while the hero shows its resting letters, falling to 0 with the first scroll. */
  const letters = letterUniforms.uText.value;
  /* The opening waits for the real letters; after it, a scrolled page pauses the loop. */
  const waiting = run.elapsed === 0 && letters < 0.99;
  const shown = !waiting && letters > 0.001;
  for (const object of run.objects) object.visible = shown;
  if (!shown) return;

  run.elapsed += Math.min(delta, 0.1);
  if (run.elapsed >= INTRO) opened = true;
  run.timeline.time(run.elapsed);

  const { uniforms, tubes, drive } = run;
  uniforms.uTime.value = run.elapsed;
  uniforms.uOn.value.set(tubes[0].on, tubes[1].on, tubes[2].on);
  uniforms.uPop.value.set(tubes[0].pop, tubes[1].pop, tubes[2].pop);
  uniforms.uOrbit.value = (run.elapsed / TURN) * Math.PI * 2;
  uniforms.uGleam.value = drive.gleam;
  uniforms.uGlitch.value = drive.glitch;
  /* The overlay leaves and returns with the letters it copies. */
  uniforms.uOpacity.value = letters;
}

function OverlayRun({ screens }: { screens: readonly (OmgScreen | undefined)[] }) {
  const run = useRef<Run | null>(null);

  useEffect(() => {
    const created = createRun(screens);
    run.current = created;
    return () => {
      run.current = null;
      created.dispose();
    };
  }, [screens]);

  useFrame((_, delta) => {
    if (run.current) stepRun(run.current, delta);
  });

  return null;
}

/** Mount next to the pile and pass the O, M and G tubes. */
export function OMGLiquidOverlay({ screens }: { screens: readonly (OmgScreen | undefined)[] }) {
  const reduced = useSceneStore((state) => state.reduced);
  if (reduced) return null;
  return <OverlayRun screens={screens} />;
}
