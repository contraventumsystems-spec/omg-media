"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createHalftoneMaterial,
  createMeltMaterial,
  createScreenMaterial,
  sharedUniforms,
} from "@/app/components/tv-shaders";
import {
  HERO_BEAT,
  STREAM_BEAT,
  STREAMS,
  WORK_BEAT,
  WORK_SCREEN_ORDER,
  useSceneStore,
} from "@/app/lib/scene-store";
import {
  DESKTOP_SWING_DEG,
  HOLD_DRIFT_DEG,
  type ResolvedShot,
  resolveShot,
  shots,
} from "@/app/lib/shots";

/**
 * Trimmed copy of the Sketchfab export, written by scripts/trim-model.mjs.
 * No lights: the ink look is the emissive textures, drawn with MeshBasicMaterial.
 * Screens, melt and halftone are shaders, so their textures are never fetched.
 */
const TV_MODEL_URL = "/models/tv-pile.gltf";

/** A bar screen is about this tall at the model's base scale of 0.024. */
const SCREEN_HEIGHT = 2.72;
const BASE_SCALE = 0.024;
const HALFTONE_X = -7.75;
const HALFTONE_CENTRE = new THREE.Vector2(2.77, 7);

type Melt = {
  material: THREE.ShaderMaterial;
  hasScreen: boolean;
  /** Position in the tune-in cascade, top of the pile first. */
  order: number;
  box: THREE.Box3;
  mesh: THREE.Mesh;
  screenBottom: number;
  /** Index into STREAMS, or -1 when the screen is not one of the three. */
  stream: number;
  /** Top centre of the glass, where the stream's label attaches. */
  anchor: THREE.Vector3;
  /** Bounds of the glass alone, without the drip. Empty for meshes with no screen. */
  glass: THREE.Box3;
};

type Rig = {
  root: THREE.Group;
  melts: Melt[];
  screens: THREE.ShaderMaterial[];
  glints: { mesh: THREE.Mesh; melt: Melt | null }[];
  halftone: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
};

function materialName(mesh: THREE.Mesh) {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  return material?.name ?? "";
}

/** Clone so the cached glTF stays untouched, then swap every material for an unlit one. */
function buildPile(source: THREE.Group): Rig {
  const root = source.clone(true);
  root.updateWorldMatrix(true, true);

  const ink = new Map<string, THREE.MeshBasicMaterial>();
  const body = new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false });
  const glint = new THREE.MeshBasicMaterial({
    color: "#F9FAFE",
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  const melts: Melt[] = [];
  const screens: THREE.ShaderMaterial[] = [];
  const glintMeshes: THREE.Mesh[] = [];
  const scale = new THREE.Vector3();
  let seed = 0;

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const name = materialName(mesh);
    const original = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as
      THREE.MeshStandardMaterial;
    seed += 1;

    if (name.startsWith("OldTV")) {
      let material = ink.get(original.uuid);
      if (!material) {
        // The emissive factor keeps the two ink sheets at their authored strength.
        material = new THREE.MeshBasicMaterial({
          map: original.emissiveMap,
          color: original.emissive.clone(),
          toneMapped: false,
          side: original.side,
        });
        material.name = name;
        ink.set(original.uuid, material);
      }
      mesh.material = material;
      return;
    }

    if (name === "SCREEN") {
      const material = createScreenMaterial(seed * 0.173);
      mesh.material = material;
      screens.push(material);
      return;
    }

    if (name === "SCREEN.001") {
      const box = new THREE.Box3().setFromObject(mesh);
      mesh.getWorldScale(scale);
      const hasScreen = box.max.y - box.min.y > 1.5;
      const screenBottom = hasScreen
        ? box.max.y - SCREEN_HEIGHT * (scale.x / BASE_SCALE)
        : box.max.y;
      const material = createMeltMaterial({
        seed: seed * 0.173,
        top: box.max.y,
        screenBottom,
        floor: box.min.y,
        hasScreen,
        onGround: box.min.y < 0.45,
      });
      mesh.material = material;
      melts.push({
        material,
        hasScreen,
        order: 0,
        box,
        mesh,
        screenBottom,
        stream: -1,
        anchor: new THREE.Vector3(),
        glass: new THREE.Box3(),
      });
      return;
    }

    if (name.startsWith("small-polka-dot")) {
      // Replaced by the shader disc below, which is not clipped to the old plane.
      mesh.visible = false;
      return;
    }

    if (name === "Material.002") {
      mesh.material = glint;
      glintMeshes.push(mesh);
      return;
    }

    mesh.material = body;
  });

  melts
    .filter((melt) => melt.hasScreen)
    .sort((a, b) => b.box.max.y - a.box.max.y)
    .forEach((melt, index) => {
      melt.order = index;
      melt.stream = STREAMS.findIndex((stream) => stream.order === index);

      /* The mesh also holds the drip, so measure only the vertices of the glass. */
      const glass = melt.glass;
      const vertex = new THREE.Vector3();
      const positions = melt.mesh.geometry.getAttribute("position");
      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i).applyMatrix4(melt.mesh.matrixWorld);
        if (vertex.y >= melt.screenBottom) glass.expandByPoint(vertex);
      }
      if (melt.stream < 0) return;
      melt.material.uniforms.uTint.value.set(STREAMS[melt.stream].color);
      glass.getCenter(melt.anchor);
      melt.anchor.y = glass.max.y + 0.25;
      melt.anchor.x = glass.max.x;
    });

  /* Each highlight belongs to the bar screen it sits on and appears with it. */
  const centre = new THREE.Vector3();
  const glints = glintMeshes.map((mesh) => {
    new THREE.Box3().setFromObject(mesh).getCenter(centre);
    let owner: Melt | null = null;
    let best = Infinity;
    for (const melt of melts) {
      if (!melt.hasScreen) continue;
      const distance = melt.box.distanceToPoint(centre);
      if (distance < best) {
        best = distance;
        owner = melt;
      }
    }
    return { mesh, melt: owner };
  });

  const halftone = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), createHalftoneMaterial());
  halftone.rotation.y = Math.PI / 2;
  halftone.position.set(HALFTONE_X, HALFTONE_CENTRE.y, -HALFTONE_CENTRE.x);
  halftone.renderOrder = -1;
  root.add(halftone);

  return { root, melts, screens, glints, halftone };
}

/**
 * One rig per loaded model, kept for the life of the page.
 * The frame loop mutates it on every frame, so it lives outside React state.
 */
const rigs = new WeakMap<THREE.Group, Rig>();

function pileFor(source: THREE.Group) {
  let rig = rigs.get(source);
  if (!rig) {
    rig = buildPile(source);
    rigs.set(source, rig);
  }
  return rig;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => value * value * (3 - 2 * value);
/* Softer than expo: the move is scrubbed, so a flat start would feel like a dead thumb. */
const cameraEase = gsap.parseEase("power3.inOut");
const streamEase = gsap.parseEase("power2.inOut");
const projected = new THREE.Vector3();
const glassSize = new THREE.Vector3();

/**
 * SHOT_4: straight in front of one screen, close enough that the glass covers
 * the viewport on both axes. Built from the mesh, so it follows the model.
 */
function resolveScreenShot(glass: THREE.Box3, fov: number, aspect: number): ResolvedShot {
  const target = glass.getCenter(new THREE.Vector3());
  glass.getSize(glassSize);
  const tanV = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
  const distance = 0.6 * Math.min(glassSize.y / (2 * tanV), glassSize.z / (2 * tanV * aspect));
  target.x = glass.max.x;
  return {
    position: target.clone().add(new THREE.Vector3(distance, 0, 0)),
    target,
    fov,
  };
}

/** Cheap repeatable random for the pre-signal blips. */
function blip(tick: number, index: number) {
  const value = Math.sin(tick * 127.1 + index * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function TvPile() {
  const { scene } = useGLTF(TV_MODEL_URL);
  const root = pileFor(scene).root;
  const invalidate = useThree((state) => state.invalidate);
  const mobile = useSceneStore((state) => state.mobile);
  const reduced = useSceneStore((state) => state.reduced);
  const lite = useSceneStore((state) => state.lite);

  const frame = useRef({
    from: null as ResolvedShot | null,
    to: null as ResolvedShot | null,
    push: null as ResolvedShot | null,
    tilt: null as ResolvedShot | null,
    river: null as ResolvedShot | null,
    screen: null as ResolvedShot | null,
    key: "",
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    offset: new THREE.Vector3(),
    right: new THREE.Vector3(),
    pointer: new THREE.Vector2(),
    drawn: false,
  });

  /* Demand mode draws one frame per invalidate: redraw the still when the framing inputs change. */
  useEffect(() => {
    invalidate();
  }, [invalidate, mobile, reduced, lite, root]);

  useFrame((state, delta) => {
    const rig = pileFor(scene);
    const store = useSceneStore.getState();
    const camera = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const current = frame.current;
    const set = store.mobile ? shots.mobile : shots.desktop;

    /* Shots depend on the aspect ratio only, so resolve them when it changes. */
    const key = `${store.mobile}-${store.reduced}-${aspect.toFixed(4)}`;
    if (key !== current.key) {
      current.key = key;
      current.from = resolveShot(store.reduced ? set.REST : set.SHOT_0, aspect);
      current.to = resolveShot(store.reduced ? set.REST : set.SHOT_1, aspect);
      current.push = resolveShot(set.SHOT_2, aspect);
      current.tilt = resolveShot(set.SHOT_3, aspect);
      current.river = resolveShot(set.SHOT_3B, aspect);
      const centre = rig.melts.find((melt) => melt.hasScreen && melt.order === WORK_SCREEN_ORDER);
      current.screen = centre ? resolveScreenShot(centre.glass, set.SHOT_1.fov, aspect) : null;
    }
    const from = current.from!;
    const to = current.to!;

    /* Reduced motion holds the finished picture: bars on, pool full, clock stopped. */
    const progress = store.reduced ? 1 : store.progress;
    /* Beat 3 owns the scene while its section is on screen; beat 2's tints and moves switch off. */
    const inWork = !store.reduced && store.stage === "work" && current.screen !== null;
    const push = inWork
      ? streamEase(
          clamp01((store.work - WORK_BEAT.pushStart) / (WORK_BEAT.pushEnd - WORK_BEAT.pushStart)),
        )
      : 0;
    const stream = store.reduced || inWork ? 0 : store.stream;
    const time = store.reduced ? 0 : state.clock.elapsedTime;
    sharedUniforms.uTime.value = time;

    /* Camera: SHOT_0 to SHOT_1, then a slow drift while the screens and the melt play. */
    const move = cameraEase(clamp01(progress / HERO_BEAT.revealEnd));
    current.position.lerpVectors(from.position, to.position, move);
    current.target.lerpVectors(from.target, to.target, move);

    if (!store.reduced) {
      const hold = smooth(clamp01((progress - HERO_BEAT.revealEnd) / (1 - HERO_BEAT.revealEnd)));
      const swing = store.mobile ? 0 : DESKTOP_SWING_DEG * Math.sin(Math.PI * move);
      const angle = THREE.MathUtils.degToRad(swing + HOLD_DRIFT_DEG * hold);
      current.offset.subVectors(current.position, current.target);
      const { x, z } = current.offset;
      current.offset.x = x * Math.cos(angle) - z * Math.sin(angle);
      current.offset.z = x * Math.sin(angle) + z * Math.cos(angle);
      current.position.addVectors(current.target, current.offset);

      /* Beat 2 carries on from wherever the hero left the camera: push in, tilt down, follow the river. */
      if (stream > 0) {
        const legs: [ResolvedShot, number, number][] = [
          [current.push!, 0, STREAM_BEAT.pushEnd],
          [current.tilt!, STREAM_BEAT.pushEnd, STREAM_BEAT.tiltEnd],
          [current.river!, STREAM_BEAT.tiltEnd, 1],
        ];
        for (const [shot, start, end] of legs) {
          const leg = streamEase(clamp01((stream - start) / (end - start)));
          if (leg === 0) break;
          current.position.lerp(shot.position, leg);
          current.target.lerp(shot.target, leg);
        }
        current.offset.subVectors(current.position, current.target);
      }

      /* Beat 3: from the whole pile straight into the centre screen. */
      if (inWork) {
        current.position.lerpVectors(to.position, current.screen!.position, push);
        current.target.lerpVectors(to.target, current.screen!.target, push);
        current.offset.subVectors(current.position, current.target);
      }

      /* Pointer parallax, desktop only. The damping keeps it behind the cursor. */
      const follow = 1 - Math.exp(-delta * 3);
      current.pointer.x += ((store.mobile ? 0 : store.pointer.x) - current.pointer.x) * follow;
      current.pointer.y += ((store.mobile ? 0 : store.pointer.y) - current.pointer.y) * follow;
      current.right.set(-current.offset.z, 0, current.offset.x).normalize();
      /* Up close the parallax would show the edge of the glass, so it eases off with the push. */
      current.position.addScaledVector(current.right, -current.pointer.x * 0.7 * (1 - push));
      current.position.y += current.pointer.y * 0.4 * (1 - push);
    }

    camera.position.copy(current.position);
    camera.lookAt(current.target);
    const distance = current.position.distanceTo(current.target);
    if (camera.fov !== to.fov || Math.abs(camera.far - distance * 6) > 1) {
      camera.fov = to.fov;
      camera.near = Math.max(distance / 200, 0.05);
      camera.far = distance * 6;
      camera.updateProjectionMatrix();
    }

    /* Halftone: deepest layer. It follows 0.3 of the camera's travel, so it lags the pile. */
    const driftY = (current.position.y - to.position.y) * 0.3;
    const driftZ = (current.position.z - to.position.z) * 0.3;
    rig.halftone.visible = !store.lite;
    rig.halftone.position.set(
      HALFTONE_X,
      HALFTONE_CENTRE.y + driftY,
      -HALFTONE_CENTRE.x + driftZ,
    );
    const disc = rig.halftone.material.uniforms;
    disc.uCentre.value.set(HALFTONE_CENTRE.x - driftZ, HALFTONE_CENTRE.y + driftY);
    disc.uAngle.value = time * 0.015;

    /* Screens tune in one by one; before that a bar screen only blips towards a signal. */
    const grow = smooth(
      clamp01((progress - HERO_BEAT.growStart) / (HERO_BEAT.growEnd - HERO_BEAT.growStart)),
    );
    const tick = Math.floor(time * 5);

    /* Beat 2: three screens take one colour each, the rest dim, and the river speeds up. */
    const tintPhase = clamp01(stream / STREAM_BEAT.pushEnd) * STREAMS.length;
    const dim = 1 - 0.4 * smooth(clamp01(stream / 0.12));
    const flow = smooth(
      clamp01((stream - STREAM_BEAT.pushEnd) / (STREAM_BEAT.tiltEnd - STREAM_BEAT.pushEnd)),
    );
    const labelsOut = smooth(clamp01((stream - (STREAM_BEAT.chipsGone - 0.1)) / 0.1));
    camera.updateMatrixWorld();

    for (const material of rig.screens) material.uniforms.uDim.value = dim;
    for (const melt of rig.melts) {
      const uniforms = melt.material.uniforms;
      uniforms.uGrow.value = grow;
      uniforms.uFlow.value = 1 + 2.2 * flow;
      uniforms.uSheen.value = store.lite || store.reduced ? 0 : 1 + 1.5 * flow;

      const tint = melt.stream < 0 ? 0 : smooth(clamp01(tintPhase - melt.stream));
      uniforms.uTintMix.value = tint;
      uniforms.uDim.value = melt.stream < 0 ? dim : 1;

      const chip = melt.stream < 0 ? null : store.chips[melt.stream];
      if (chip) {
        projected.copy(melt.anchor).project(camera);
        const x = (projected.x * 0.5 + 0.5) * state.size.width;
        const y = (-projected.y * 0.5 + 0.5) * state.size.height;
        chip.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        chip.style.opacity = (tint * (1 - labelsOut)).toFixed(3);
      }
      if (!melt.hasScreen) continue;
      const start = HERO_BEAT.tuneStart + melt.order * HERO_BEAT.tuneStep;
      let tune = clamp01((progress - start) / HERO_BEAT.tuneLength);
      if (tune === 0 && blip(tick, melt.order) > 0.9) tune = 0.34;

      /* Beat 3: the centre screen holds its signal, the others lose theirs as the camera passes. */
      const centre = melt.order === WORK_SCREEN_ORDER;
      if (inWork && !centre) {
        tune *= 1 - smooth(clamp01((store.work - WORK_BEAT.pushStart) / 0.22));
      }
      uniforms.uTune.value = tune;
      uniforms.uCrt.value = centre ? 1 - push : 1;
    }
    for (const glint of rig.glints) {
      const owner = glint.melt;
      const lit = (owner?.material.uniforms.uTune.value ?? 0) > 0.75;
      /* The highlight is a flat plane; at full screen it would read as a white shape. */
      glint.mesh.visible = lit && !(owner?.order === WORK_SCREEN_ORDER && push > 0.25);
    }

    if (!current.drawn) {
      current.drawn = true;
      useSceneStore.setState({ ready: true });
    }
  });

  return <primitive object={root} />;
}

useGLTF.preload(TV_MODEL_URL);

export function TvScene() {
  return <TvPile />;
}
