"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  type Cascade,
  createCascade,
  DROPLETS,
  measureGlass,
  type StreamSource,
} from "@/app/components/tv-cascade";
import {
  createHalftoneMaterial,
  createMeltMaterial,
  createScreenMaterial,
  sharedUniforms,
} from "@/app/components/tv-shaders";
import { PAPER_HEX } from "@/app/lib/bars";
import { createSettledRig, HERO_BEAT, heroRig, MAX_STREAMS, STREAM_LIP } from "@/app/lib/hero-rig";
import {
  STREAM_BEAT,
  STREAMS,
  WORK_BEAT,
  WORK_SCREEN_ORDER,
  useSceneStore,
} from "@/app/lib/scene-store";
import {
  DESKTOP_SWING_DEG,
  fitShot,
  HOLD_DRIFT_DEG,
  HOLE,
  placeHole,
  type ResolvedShot,
  resolveShot,
  riverShot,
  shots,
  stillFrame,
} from "@/app/lib/shots";

/**
 * Trimmed copy of the Sketchfab export, written by scripts/trim-model.mjs.
 * No lights: the ink look is the emissive textures, drawn with MeshBasicMaterial.
 * Screens, paint and halftone are shaders, so their textures are never fetched.
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
  cascade: Cascade;
};

/** The ink sheets are grey on white. A little of the paper colour keeps them off video white. */
const INK_TINT = new THREE.Color(PAPER_HEX).lerp(new THREE.Color("#ffffff"), 0.35);
/** Reduced motion and the still frame read this instead of the live rig. */
const SETTLED = createSettledRig();

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
    color: PAPER_HEX,
    toneMapped: false,
    side: THREE.DoubleSide,
  });
  const melts: Melt[] = [];
  const screens: THREE.ShaderMaterial[] = [];
  const glintMeshes: THREE.Mesh[] = [];
  const scale = new THREE.Vector3();
  /* Forward-most face of the cabinets. The paint has to fall clear of it. */
  const cabinets = new THREE.Box3();
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
          color: original.emissive.clone().multiply(INK_TINT),
          toneMapped: false,
          side: original.side,
        });
        material.name = name;
        ink.set(original.uuid, material);
      }
      mesh.material = material;
      cabinets.expandByObject(mesh);
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
      /* A mesh with no glass is all modeled paint: put the line above it, so the shader draws paint. */
      const screenBottom = hasScreen
        ? box.max.y - SCREEN_HEIGHT * (scale.x / BASE_SCALE)
        : box.max.y + 1;
      const material = createMeltMaterial({
        seed: seed * 0.173,
        top: box.max.y,
        screenBottom,
      });
      mesh.material = material;
      /* After the cabinets and before the streams; the material does not write depth. */
      mesh.renderOrder = 1;
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

  /* One stream per bar screen, in pile order, which is also its slot in the hero rig. */
  const sources: StreamSource[] = [];
  for (const melt of melts) {
    if (!melt.hasScreen || melt.order >= MAX_STREAMS) continue;
    const glass = measureGlass(melt.mesh, melt.screenBottom);
    if (glass) sources.push({ order: melt.order, glass, seed: melt.order + 1 });
  }
  sources.sort((a, b) => a.order - b.order);
  const cascade = createCascade(sources, cabinets.isEmpty() ? 10 : cabinets.max.x);
  /* Cabinets, then the modeled paint, then the moving paint: the streams fall in front of the puddle. */
  for (const stream of cascade.streams) stream.mesh.renderOrder = 2;
  cascade.droplets.renderOrder = 2;
  root.add(cascade.group);

  return { root, melts, screens, glints, halftone, cascade };
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
  const heroFrame = useSceneStore((state) => state.heroFrame);

  const frame = useRef({
    from: null as ResolvedShot | null,
    to: null as ResolvedShot | null,
    cascade: null as ResolvedShot | null,
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
    hole: { centre: new THREE.Vector3(), radius: 1 },
    drawn: false,
  });

  /* Demand mode draws one frame per invalidate: redraw the still when the framing inputs change. */
  useEffect(() => {
    invalidate();
  }, [invalidate, mobile, reduced, lite, heroFrame, root]);

  useFrame((state, delta) => {
    const rig = pileFor(scene);
    const store = useSceneStore.getState();
    const camera = state.camera as THREE.PerspectiveCamera;
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const current = frame.current;
    const layout = store.mobile ? "mobile" : "desktop";
    const set = shots[layout];
    const cascade = rig.cascade;
    /* Reduced motion holds the finished picture: bars on, paint landed, clock stopped. */
    const hero = store.reduced ? SETTLED : heroRig;

    /* Shots depend on the aspect ratio and the measured copy, so resolve them when either changes. */
    const band = store.mobile ? store.heroFrame : null;
    const key = `${layout}-${store.reduced}-${aspect.toFixed(4)}-${band?.top.toFixed(3)}-${band?.bottom.toFixed(3)}`;
    if (key !== current.key) {
      current.key = key;
      let placement = HOLE[layout];
      if (store.reduced) {
        /* One still frame: the finished cascade, scaled to sit beside or under the copy. */
        const still = stillFrame(layout, band);
        placement = still.hole;
        current.from = resolveShot(still.shot, aspect);
        current.to = resolveShot(still.shot, aspect);
        current.cascade = resolveShot(still.shot, aspect);
      } else {
        /* Phone: the whole pile, fitted between the copy and the scroll hint. */
        const opening = (band && fitShot(set.SHOT_0, band)) || set.SHOT_0;
        current.from = resolveShot(opening, aspect);
        current.to = resolveShot(set.SHOT_1, aspect);
        current.cascade = resolveShot(set.SHOT_C, aspect);
      }
      current.push = resolveShot(set.SHOT_2, aspect);

      /* The hole is placed on screen in the cascade shot, then every stream is laid out to it. */
      placeHole(current.cascade, aspect, placement, current.hole);
      cascade.layout(current.hole.centre, current.hole.radius);
      current.tilt = resolveShot(
        riverShot(set.SHOT_3, current.hole.centre, current.hole.radius),
        aspect,
      );
      current.river = resolveShot(
        riverShot(set.SHOT_3B, current.hole.centre, current.hole.radius),
        aspect,
      );

      const centre = rig.melts.find((melt) => melt.hasScreen && melt.order === WORK_SCREEN_ORDER);
      current.screen = centre ? resolveScreenShot(centre.glass, set.SHOT_1.fov, aspect) : null;
    }
    cascade.setDetail(store.lite);
    const from = current.from!;
    const to = current.to!;
    const down = current.cascade!;

    /* Beat 3 owns the scene while its section is on screen; beat 2 tints and moves switch off. */
    const inWork = !store.reduced && store.stage === "work" && current.screen !== null;
    const push = inWork
      ? streamEase(
          clamp01((store.work - WORK_BEAT.pushStart) / (WORK_BEAT.pushEnd - WORK_BEAT.pushStart)),
        )
      : 0;
    const stream = store.reduced || inWork ? 0 : store.stream;
    const time = store.reduced ? 0 : state.clock.elapsedTime;
    sharedUniforms.uTime.value = time;

    /*
     * Camera. The timeline has already eased both moves: opening shot to the whole
     * pile, then up and back to the shot that also holds the hole.
     */
    current.position.lerpVectors(from.position, to.position, hero.reveal);
    current.target.lerpVectors(from.target, to.target, hero.reveal);
    current.position.lerp(down.position, hero.follow);
    current.target.lerp(down.target, hero.follow);

    if (!store.reduced) {
      /* A slow drift for as long as the beat plays, so the hold is never a frozen frame. */
      const hold = smooth(
        clamp01((store.progress - HERO_BEAT.revealEnd) / (1 - HERO_BEAT.revealEnd)),
      );
      const swing = store.mobile ? 0 : DESKTOP_SWING_DEG * Math.sin(Math.PI * hero.reveal);
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
    /* Far enough to hold the hole, which sits well behind the pile. */
    const far = Math.max(distance * 6, camera.position.distanceTo(current.hole.centre) * 2.5);
    if (camera.fov !== to.fov || Math.abs(camera.far - far) > 1) {
      camera.fov = to.fov;
      camera.near = Math.max(distance / 200, 0.05);
      camera.far = far;
      camera.updateProjectionMatrix();
    }

    /* Halftone: deepest layer. It follows 0.3 of the camera travel, so it lags the pile. */
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
      if (!melt.hasScreen) {
        /* Modeled pool and drips: they dim with the screens that are not streams. */
        uniforms.uDim.value = dim;
        continue;
      }
      const slot = hero.streams[melt.order];

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

      /* Screens tune in one by one; before that a bar screen only blips towards a signal. */
      let tune = slot ? slot.tune : 1;
      if (tune === 0 && blip(tick, melt.order) > 0.9) tune = 0.34;

      /* Beat 3: the centre screen holds its signal, the others lose theirs as the camera passes. */
      const centre = melt.order === WORK_SCREEN_ORDER;
      if (inWork && !centre) {
        tune *= 1 - smooth(clamp01((store.work - WORK_BEAT.pushStart) / 0.22));
      }
      uniforms.uTune.value = tune;
      /* Up close the centre screen is the frame for the work, so it goes back to clean bars. */
      uniforms.uMelt.value = (slot ? slot.melt : 1) * (1 - push);
      uniforms.uCrt.value = centre ? 1 - push : 1;
    }
    for (const glint of rig.glints) {
      const owner = glint.melt;
      const lit = (owner?.material.uniforms.uTune.value ?? 0) > 0.75;
      /* The highlight is a flat plane; at full screen it would read as a white shape. */
      glint.mesh.visible = lit && !(owner?.order === WORK_SCREEN_ORDER && push > 0.25);
    }

    /* The hole. Its radius comes straight from the timeline, overshoot included. */
    const open = hero.hole * (1 - push);
    cascade.hole.ground.visible = open > 0.001;
    cascade.hole.well.visible = open > 0.001;
    cascade.hole.ground.material.uniforms.uOpen.value = open;
    cascade.hole.ground.material.uniforms.uDots.value = store.lite ? 0 : 1;
    cascade.hole.well.scale.set(
      current.hole.radius * open,
      current.hole.radius,
      current.hole.radius * open,
    );
    const farPaint = camera.position.distanceTo(current.hole.centre);

    /*
     * The paint. Position along the path, drop and strand all come from the
     * timeline. The only thing integrated here is a small spring that trails the
     * leading edge: while the paint moves its lag bows the strand sideways, and
     * when the scroll stops it rings down to nothing within half a second.
     */
    const step = Math.min(delta, 1 / 30);
    /* Mobile and lite devices keep one droplet per stream, so the joins and bands stay the picture. */
    const droplets = store.lite || store.mobile ? 1 : DROPLETS;
    for (let index = 0; index < cascade.streams.length; index++) {
      const paint = cascade.streams[index];
      const slot = hero.streams[paint.order];
      const uniforms = paint.mesh.material.uniforms;
      const visible = slot.head > 0 && push < 0.45;
      paint.mesh.visible = visible;
      if (!visible) {
        paint.lag.value = slot.head;
        paint.lag.velocity = 0;
        cascade.placeDroplets(index, 0, 0, 0, 0);
        continue;
      }

      /* The timeline head runs 0 to 1; the first STREAM_LIP of it is the run to the cabinet lip. */
      const head =
        slot.head < STREAM_LIP
          ? (slot.head / STREAM_LIP) * paint.lip
          : paint.lip + ((slot.head - STREAM_LIP) / (1 - STREAM_LIP)) * (paint.length - paint.lip);

      let drag = 0;
      if (store.reduced) {
        paint.lag.value = slot.head;
        paint.lag.velocity = 0;
      } else {
        const lag = paint.lag;
        lag.velocity += (150 * (slot.head - lag.value) - 13 * lag.velocity) * step;
        lag.value += lag.velocity * step;
        drag = THREE.MathUtils.clamp((slot.head - lag.value) * 5, -0.6, 0.6);
      }

      const melt = rig.melts.find((item) => item.hasScreen && item.order === paint.order);
      const landed = smooth(clamp01((slot.head - 0.96) / 0.04));
      cascade.placeDroplets(index, head, slot.stretch, 1 - clamp01(push * 2.2), droplets);
      uniforms.uHead.value = head;
      uniforms.uSwell.value = slot.swell;
      uniforms.uStretch.value = slot.stretch;
      uniforms.uBody.value = slot.body;
      /* Alternate sides, so neighbouring strands do not swing as one sheet. */
      uniforms.uSway.value = (slot.sway + drag) * (paint.order % 2 === 0 ? 1 : -1);
      /* Once it has landed the strand breathes, slowly. Lite devices and reduced motion keep it still. */
      uniforms.uBreath.value = store.lite || store.reduced ? 0 : landed;
      /* Colour bands and beads travel with the paint, then keep a slow drift of their own. */
      uniforms.uPhase.value =
        head * 0.55 + (store.lite ? 0 : time * (0.5 + 1.6 * flow) * (0.4 + 0.6 * landed));
      /* Beat 3 goes into one screen; the paint is gone before the glass fills the viewport. */
      uniforms.uScale.value = 1 - clamp01(push * 2.2);
      uniforms.uTintMix.value = melt ? melt.material.uniforms.uTintMix.value : 0;
      if (melt && melt.stream >= 0) uniforms.uTint.value.copy(melt.material.uniforms.uTint.value);
      uniforms.uDim.value = melt && melt.stream >= 0 ? 1 : dim;
      uniforms.uGloss.value = 1 + 0.6 * flow;
      uniforms.uFar.value = farPaint;
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
