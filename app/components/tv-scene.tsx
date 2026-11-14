"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createGhostMaterial,
  createHalftoneMaterial,
  createLipMaterial,
  createMeltMaterial,
  createPaintMaterial,
  createScreenMaterial,
  faceUniforms,
  letterUniforms,
  sharedUniforms,
  wordUniforms,
} from "@/app/components/tv-shaders";
import { PAPER_HEX } from "@/app/lib/bars";
import {
  burstAmount,
  createSettledRig,
  ghostAmount,
  HERO_BEAT,
  heroRig,
  semnalAmount,
  tearAmount,
  zgomotAmount,
} from "@/app/lib/hero-rig";
import { createLiquidStrokes, type LiquidStrokes } from "@/app/components/liquid-strokes";
import { OMGLiquidOverlay } from "@/app/components/omg-liquid-overlay";
import { OMG_COUNT, OMG_ROW, omgIntro } from "@/app/lib/omg-intro";
import { faceAt, type FacePose } from "@/app/lib/tv-face";
import {
  isFaceTube,
  isWordRow,
  paintRestLetters,
  restGlyph,
  restLetterTexture,
  wordGlyph,
} from "@/app/lib/rest-letters";
import { paintSignalWord, signalTexture } from "@/app/lib/signal-word";
import {
  STREAM_BEAT,
  STREAMS,
  WORK_BEAT,
  WORK_SCREEN_ORDER,
  useSceneStore,
} from "@/app/lib/scene-store";
import {
  BURST_RECOIL,
  BURST_SWING_DEG,
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
 * Screens and the halftone are shaders, so their textures are never fetched.
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

/**
 * One television. The export splits a set into a shell, a body, a screen and a
 * highlight, each its own node; here they all hang from one pivot at the centre
 * of the set, so the burst can throw it and turn it as a single object.
 */
type Tv = {
  pivot: THREE.Group;
  /** Centre of the set with the pile stacked. */
  rest: THREE.Vector3;
  /** Where it flies, as shares of the spread on each axis. */
  heading: THREE.Vector3;
  axis: THREE.Vector3;
  /** Radians it has turned at full burst, and the extra it gathers while it hangs. */
  tilt: number;
  spin: number;
  /** Share of the burst it waits before it leaves. */
  delay: number;
  /** Offset of its idle bob, so the sets do not rise and fall together. */
  phase: number;
};

/** The last set leaves this far into the burst. */
const BURST_STAGGER = 0.22;
/** Half the pile's height and width as the camera sees them, plus half a set. */
const BURST_PILE_HALF = { y: 7.5, z: 10.5 };
/** How far a set at the front comes towards the camera. */
const BURST_DEPTH = { mobile: 9, desktop: 7 };

/** One tube of the resting pile, static or bar screen, and its place in the rows of letters. */
type Face = {
  uniforms: THREE.ShaderMaterial["uniforms"];
  /** Rest-pose glass. */
  glass: THREE.Box3;
  /** Row from the top of the pile, and place in that row from the left. */
  row: number;
  column: number;
  mesh: THREE.Mesh;
  /** Set when the tube is a bar screen, which carries modeled paint. */
  melt: Melt | null;
};

/**
 * The paint of the resting pile. Only O, M and G spill: M has a modeled drip,
 * O and G get a quad under their lip. The pool on the floor belongs to all three.
 */
type Paint = {
  /** O, M and G, left to right. A tube is missing if the model changes. */
  omg: (Face | undefined)[];
  /** Lip paint of each of the three, or null for a tube with a modeled drip. */
  lips: (THREE.ShaderMaterial | null)[];
  /** The modeled drip of M, and the height of its lip. */
  drip: { material: THREE.ShaderMaterial; lip: number } | null;
  pools: THREE.ShaderMaterial[];
};

/** Where the pool starts to spread: the floor under M, as world x and z. */
const POOL_SOURCE = new THREE.Vector2(6, -1.4);
/** Far enough from the source to hold the whole pool, with its wandering edge. */
const POOL_REACH = 20;
/**
 * Whether O, M and G spill over their lips. Off: the colour stays on the glass
 * and only the pool on the floor is paint. The spill code is kept behind this.
 */
const OMG_DRIPS: boolean = false;
/** How far below its lip M's modeled drip is drawn. The rest of that mesh is inside the pile. */
const DRIP_DROP = 1.3;
/** The lip quad: its height as a share of the glass, and how far it stands off the cabinet. */
const LIP_DROP = 0.5;
const LIP_OFFSET = 0.12;

/**
 * A quad hanging from the bottom edge of a static tube's glass. The glass faces
 * the camera, so it is a plane x = a * z + b * y + c over its world bounds;
 * the fit gives the depth of the bottom edge. Screen-right is -Z.
 */
function createLip(mesh: THREE.Mesh, glass: THREE.Box3, seed: number) {
  const positions = mesh.geometry.getAttribute("position");
  if (!positions || glass.isEmpty()) return null;

  /* Least squares over the vertices, in the world. */
  const sums = new THREE.Matrix3().set(0, 0, 0, 0, 0, 0, 0, 0, 0);
  const plane = new THREE.Vector3();
  const point = new THREE.Vector3();
  const e = sums.elements;
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
    const basis = [point.z, point.y, 1];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) e[c * 3 + r] += basis[r] * basis[c];
      plane.setComponent(r, plane.getComponent(r) + basis[r] * point.x);
    }
  }
  if (Math.abs(sums.determinant()) < 1e-9) return null;
  plane.applyMatrix3(sums.invert());
  const at = (z: number, y: number) =>
    new THREE.Vector3(plane.x * z + plane.y * y + plane.z, y, z);

  const left = at(glass.max.z, glass.min.y);
  const right = at(glass.min.z, glass.min.y);
  const up = at(glass.max.z, glass.max.y).sub(left);
  const across = right.clone().sub(left);
  /* Towards the camera, which looks down -X at the pile. */
  const normal = across.clone().cross(up).normalize();
  if (normal.x < 0) normal.negate();
  const out = normal.multiplyScalar(LIP_OFFSET);
  const down = up.clone().multiplyScalar(-LIP_DROP);
  const corners = [
    left.clone().add(out),
    right.clone().add(out),
    left.clone().add(out).add(down),
    right.clone().add(out).add(down),
  ];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      corners.flatMap((corner) => corner.toArray()),
      3,
    ),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 1, 1, 0, 0, 1, 0], 2));
  geometry.setIndex([0, 2, 1, 1, 2, 3]);
  const material = createLipMaterial(seed, across.length() / down.length());
  const lip = new THREE.Mesh(geometry, material);
  lip.name = "lip-paint";
  return lip;
}

/** Tubes whose centres are closer than this in height stand in the same row. */
const ROW_GAP = 1.5;
/** The letters are up at the top of the page and gone by this share of the hero. */
const TEXT_GONE = { from: 0.03, to: 0.12 };

/**
 * Puts every tube in a row and a column, as the camera faces the pile: rows
 * from the top down, columns from the left (screen-right is -Z), and gives
 * each its letter. The cycling row gets its letter every frame instead.
 */
function seatFaces(faces: Face[]) {
  const centre = new THREE.Vector3();
  const seats = faces
    .filter((face) => !face.glass.isEmpty())
    .map((face) => {
      face.glass.getCenter(centre);
      return { face, y: centre.y, z: centre.z };
    })
    .sort((a, b) => b.y - a.y);
  const rows: (typeof seats)[] = [];
  for (const seat of seats) {
    const row = rows[rows.length - 1];
    if (row && row[row.length - 1].y - seat.y < ROW_GAP) row.push(seat);
    else rows.push([seat]);
  }
  rows.forEach((row, index) => {
    row
      .sort((a, b) => b.z - a.z)
      .forEach(({ face }, column) => {
        const { min, max } = face.glass;
        face.row = index;
        face.column = column;
        face.uniforms.uGlass.value.set(max.z, min.y, max.z - min.z, max.y - min.y);
        face.uniforms.uGlyph.value = restGlyph(index, column);
        face.uniforms.uFace.value = isFaceTube(index, column) ? 1 : 0;
      });
  });
}

type Rig = {
  root: THREE.Group;
  tvs: Tv[];
  faces: Face[];
  melts: Melt[];
  screens: THREE.ShaderMaterial[];
  glints: { mesh: THREE.Mesh; melt: Melt | null }[];
  /** Rest-pose glass, bar screens and static screens, for fitting the word. */
  wordBoxes: THREE.Box3[];
  halftone: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  /** Faint SEMNAL behind the sets. Hidden outside the hero lock. */
  ghost: THREE.Mesh;
  paint: Paint;
  /** Brush strokes that replace the pool while the sets are apart. */
  strokes: LiquidStrokes;
};

/** The ink sheets are grey on white. A little of the paper colour keeps them off video white. */
const INK_TINT = new THREE.Color(PAPER_HEX).lerp(new THREE.Color("#ffffff"), 0.35);
/** Reduced motion and the still frame read this instead of the live rig. */
const SETTLED = createSettledRig();

function materialName(mesh: THREE.Mesh) {
  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  return material?.name ?? "";
}

/** Repeatable random in 0..1 for set `index`, one stream per `salt`. */
function scatter(index: number, salt: number) {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Sorts every drawn mesh into the television it belongs to. A shell is one set;
 * every other part goes to the shell it sits in or nearest to. A bar screen is
 * placed by its glass, because its mesh also holds a drip that reaches the floor.
 */
function groupTelevisions(
  root: THREE.Group,
  shells: THREE.Mesh[],
  parts: THREE.Mesh[],
  melts: Melt[],
): Tv[] {
  const boxes = shells.map((shell) => new THREE.Box3().setFromObject(shell));
  const centres = boxes.map((box) => box.getCenter(new THREE.Vector3()));
  const middle = new THREE.Vector3();
  for (const centre of centres) middle.addScaledVector(centre, 1 / centres.length);

  const tvs = centres.map((centre, index): Tv => {
    const pivot = new THREE.Group();
    pivot.name = `tv-${index}`;
    pivot.position.copy(centre);
    root.add(pivot);
    pivot.updateMatrixWorld();

    /* Away from the middle of the pile, with enough noise that neighbours part ways. */
    const heading = centre.clone().sub(middle);
    heading.x += (scatter(index, 1) - 0.5) * 3;
    heading.y += (scatter(index, 2) - 0.5) * 3;
    heading.z += (scatter(index, 3) - 0.5) * 3;
    heading.normalize();
    /* The halftone wall stands close behind the pile: nothing flies back, the front comes forward. */
    heading.x = heading.x * 0.5 + 0.5;
    heading.multiplyScalar(0.7 + 0.4 * scatter(index, 4));

    /* Mostly a roll around the viewing axis, so the screens keep facing the camera. */
    const axis = new THREE.Vector3(
      scatter(index, 5) - 0.5,
      (scatter(index, 6) - 0.5) * 0.6,
      (scatter(index, 7) - 0.5) * 0.6,
    ).normalize();
    const turn = scatter(index, 8) < 0.5 ? -1 : 1;

    return {
      pivot,
      rest: centre.clone(),
      heading,
      axis,
      tilt: turn * (0.2 + 0.3 * scatter(index, 9)),
      spin: turn * (0.2 + 0.3 * scatter(index, 10)),
      delay: BURST_STAGGER * scatter(index, 11),
      phase: scatter(index, 12) * Math.PI * 2,
    };
  });
  if (tvs.length === 0) return tvs;

  const glassOf = new Map(melts.map((melt) => [melt.mesh, melt.glass]));
  const box = new THREE.Box3();
  const point = new THREE.Vector3();
  for (const part of parts) {
    const glass = glassOf.get(part);
    (glass && !glass.isEmpty() ? glass : box.setFromObject(part)).getCenter(point);
    let owner = 0;
    let best = Infinity;
    boxes.forEach((shell, index) => {
      /* Stacked shells overlap; the distance to the centre settles a tie. */
      const score = shell.distanceToPoint(point) + 0.1 * centres[index].distanceTo(point);
      if (score < best) {
        best = score;
        owner = index;
      }
    });
    /* attach() keeps the part where it is in the world. */
    tvs[owner].pivot.attach(part);
  }
  return tvs;
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
  const wordBoxes: THREE.Box3[] = [];
  const faces: Face[] = [];
  const glintMeshes: THREE.Mesh[] = [];
  /* The modeled paint: the pool materials, and the meshes that are pool and nothing else. */
  const pools: THREE.ShaderMaterial[] = [];
  const floor = new Set<THREE.Mesh>();
  /* For the burst: the shell of each set, and every mesh that is drawn. */
  const shells: THREE.Mesh[] = [];
  const parts: THREE.Mesh[] = [];
  const scale = new THREE.Vector3();
  let seed = 0;

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const name = materialName(mesh);
    const original = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as
      THREE.MeshStandardMaterial;
    seed += 1;
    parts.push(mesh);

    if (name.startsWith("OldTV")) {
      /* The same ink sheet also draws the small feet under a set; a shell has far more vertices. */
      if (mesh.geometry.getAttribute("position").count > 1000) shells.push(mesh);
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
      return;
    }

    if (name === "SCREEN") {
      const material = createScreenMaterial(seed * 0.173, mesh.matrixWorld);
      mesh.material = material;
      screens.push(material);
      const glass = new THREE.Box3().setFromObject(mesh);
      wordBoxes.push(glass);
      faces.push({ uniforms: material.uniforms, glass, row: -1, column: -1, mesh, melt: null });
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
        rest: mesh.matrixWorld,
      });
      mesh.material = material;
      /* A short mesh is the floor pool and has no glass. It is all paint and stays on the floor. */
      if (!hasScreen) {
        mesh.material = createPaintMaterial(screenBottom, mesh.matrixWorld);
        pools.push(mesh.material as THREE.ShaderMaterial);
        floor.add(mesh);
      }
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
      if (!melt.glass.isEmpty()) wordBoxes.push(melt.glass);
      faces.push({
        uniforms: melt.material.uniforms,
        glass,
        row: -1,
        column: -1,
        mesh: melt.mesh,
        melt,
      });
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

  /* Just in front of the halftone, so every cabinet covers it and only the gaps keep the word. */
  const ghost = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), createGhostMaterial());
  ghost.name = "signal-ghost";
  ghost.rotation.y = Math.PI / 2;
  ghost.position.set(HALFTONE_X + 0.55, HALFTONE_CENTRE.y, -HALFTONE_CENTRE.x);
  ghost.renderOrder = -1;
  ghost.visible = false;
  root.add(ghost);

  seatFaces(faces);

  /*
   * Paint. A bar screen's mesh is glass, drip and pool in one, and its glass
   * leaves with the set in the burst. So the paint is drawn on a copy that stays
   * where the model put it: the bottom row's copies are the pool, M's is its drip.
   */
  const paint: Paint = { omg: [], lips: [null, null, null], drip: null, pools };
  const paintCopy = (melt: Melt) => {
    const copy = melt.mesh.clone();
    const material = createPaintMaterial(melt.screenBottom, melt.mesh.matrixWorld);
    copy.material = material;
    melt.mesh.parent?.add(copy);
    return { copy, material };
  };
  const lips: { mesh: THREE.Mesh; face: Face }[] = [];
  const drips: { mesh: THREE.Mesh; face: Face }[] = [];
  for (const face of faces) {
    if (face.melt && isWordRow(face.row)) pools.push(paintCopy(face.melt).material);
    if (face.row !== OMG_ROW || face.column >= OMG_COUNT) continue;
    paint.omg[face.column] = face;
    if (face.melt) {
      if (OMG_DRIPS) {
        const { copy, material } = paintCopy(face.melt);
        paint.drip = { material, lip: face.melt.screenBottom };
        drips.push({ mesh: copy, face });
      }
      continue;
    }
    /* A static tube: bars from now on, held at static until the load sequence tunes it. */
    face.uniforms.uState.value = 2;
    const lip = OMG_DRIPS ? createLip(face.mesh, face.glass, face.uniforms.uSeed.value) : null;
    if (!lip) continue;
    root.add(lip);
    paint.lips[face.column] = lip.material;
    lips.push({ mesh: lip, face });
  }
  for (const material of pools) material.uniforms.uPool.value.set(POOL_SOURCE.x, POOL_SOURCE.y, 0);

  /* Hidden meshes (the old dot plane) and the floor pool stay where they are. */
  const tvs = groupTelevisions(
    root,
    shells,
    parts.filter((part) => part.visible && !floor.has(part)),
    melts,
  );
  /* What hangs from a lip leaves with its set. attach() keeps it where it is in the world. */
  for (const { mesh, face } of [...lips, ...drips]) face.mesh.parent?.attach(mesh);

  /* After the sets are grouped, so a stroke is never picked up as part of a television. */
  const strokes = createLiquidStrokes(root);

  return { root, tvs, faces, melts, screens, glints, wordBoxes, halftone, ghost, paint, strokes };
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
/** Fast off the mark, long tail: a set is thrown, then coasts. */
const thrown = (value: number) => 1 - (1 - value) ** 4;
const streamEase = gsap.parseEase("power2.inOut");
const projected = new THREE.Vector3();
const facePose: FacePose = { eye: 0, mouth: 0, lookX: 0, lookY: 0, bob: 0, blink: 0 };
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
  const omg = pileFor(scene).paint.omg;
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
    /** Framing the word mask was painted for. Empty until that paint succeeds. */
    wordKey: "",
    /** The atlas of resting letters has been drawn. */
    lettered: false,
    /** Clock time at which the load sequence began. Negative until the letters are up. */
    introAt: -1,
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    offset: new THREE.Vector3(),
    right: new THREE.Vector3(),
    pointer: new THREE.Vector2(),
    /** How far the sets fly on each axis, sized so the burst fills the viewport. */
    spread: new THREE.Vector3(),
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
    /* Reduced motion holds the finished picture: bars locked on, clock stopped. */
    const hero = store.reduced ? SETTLED : heroRig;

    /* Shots depend on the aspect ratio and the measured copy, so resolve them when either changes. */
    const band = store.mobile ? store.heroFrame : null;
    const key = `${layout}-${store.reduced}-${aspect.toFixed(4)}-${band?.top.toFixed(3)}-${band?.bottom.toFixed(3)}`;
    if (key !== current.key) {
      current.key = key;
      current.wordKey = "";
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

      /*
       * The burst happens in the whole-pile shot. Whatever that shot shows beyond
       * the pile is the room the sets have: wide on a desktop, tall on a phone.
       */
      const whole = current.to;
      const halfHeight =
        whole.position.distanceTo(whole.target) * Math.tan(THREE.MathUtils.degToRad(whole.fov) / 2);
      current.spread.set(
        BURST_DEPTH[layout],
        Math.max(1.5, halfHeight * 0.9 - BURST_PILE_HALF.y),
        Math.max(1.5, halfHeight * aspect * 0.9 - BURST_PILE_HALF.z),
      );

      /* The look-down is aimed where the hole used to sit. Nothing is drawn there. */
      placeHole(current.cascade, aspect, placement, current.hole);
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

    /* The word is fitted to SHOT_1. Retried until the display font has loaded. */
    if (!store.reduced && current.to && current.wordKey !== current.key) {
      if (paintSignalWord(current.to, aspect, rig.wordBoxes, wordUniforms.uLockView.value, wordUniforms.uSpan.value)) {
        wordUniforms.uWord.value = signalTexture();
        current.wordKey = current.key;
      }
    }

    /* The letter atlas is drawn once, as soon as the display font is there. */
    if (!current.lettered && paintRestLetters()) {
      letterUniforms.uLetters.value = restLetterTexture();
      current.lettered = true;
    }

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
     * The burst. Every set leaves along its own heading, turns as it goes, and
     * keeps drifting for as long as the scroll holds it apart. Position and turn
     * are functions of the timeline alone; only the small bob runs on the clock.
     */
    const burst = burstAmount(hero.burst);
    for (const tv of rig.tvs) {
      const apart = thrown(clamp01((burst - tv.delay) / (1 - BURST_STAGGER)));
      if (apart === 0) {
        tv.pivot.position.copy(tv.rest);
        tv.pivot.quaternion.identity();
        continue;
      }
      const reach = apart * (0.85 + 0.15 * hero.burst);
      const bob = store.lite ? 0 : apart * 0.22 * Math.sin(time * 0.7 + tv.phase);
      tv.pivot.position.set(
        tv.rest.x + tv.heading.x * current.spread.x * reach,
        tv.rest.y + tv.heading.y * current.spread.y * reach + bob,
        tv.rest.z + tv.heading.z * current.spread.z * reach,
      );
      tv.pivot.quaternion.setFromAxisAngle(tv.axis, apart * (tv.tilt + tv.spin * hero.burst));
    }
    /* The signal shakes as the pile lets go, and again as it lands. */
    const jolt = burst > 0 && burst < 0.3 ? Math.sin((Math.PI * burst) / 0.3) : 0;

    /*
     * The resting letters: up while the page sits at the top, gone with the first
     * scroll, so the tubes are plain static again before they tune to the bars.
     * The bottom row changes word on the clock, one tube after the other.
     */
    const resting =
      store.reduced || inWork || stream > 0 || !current.lettered
        ? 0
        : 1 - smooth(clamp01((store.progress - TEXT_GONE.from) / (TEXT_GONE.to - TEXT_GONE.from)));
    letterUniforms.uText.value = resting;
    if (resting > 0) {
      /* The pet on the top tube: it changes expression on the clock and watches the pointer. */
      const pose = faceAt(time, store.mobile ? null : store.pointer, facePose);
      faceUniforms.uFaceShape.value.set(pose.eye, pose.mouth);
      faceUniforms.uFaceMove.value.set(pose.lookX, pose.lookY, pose.bob, pose.blink);
      for (const face of rig.faces) {
        if (!isWordRow(face.row)) continue;
        const next = wordGlyph(face.column, time);
        face.uniforms.uGlyph.value = next.glyph;
        face.uniforms.uFlick.value = next.flick;
      }
    }

    /*
     * The load sequence: O, M and G light up, spill, and the pool spreads. It runs
     * once on the clock and then holds. The still frame shows it finished.
     */
    if (current.introAt < 0 && current.lettered) current.introAt = time;
    const intro = omgIntro(
      store.reduced ? Infinity : current.introAt < 0 ? 0 : time - current.introAt,
    );
    /* Beat 3 takes the signal from every screen but the centre one, these included. */
    const kept = inWork
      ? 1 - smooth(clamp01((store.work - WORK_BEAT.pushStart) / 0.22))
      : 1;
    rig.paint.omg.forEach((face, index) => {
      if (!face) return;
      face.uniforms.uSpot.value = intro.on[index];
      /* A bar screen is tuned with the others, further down. */
      if (!face.melt) face.uniforms.uProgress.value = intro.on[index] * kept;
      const lip = rig.paint.lips[index];
      if (lip) lip.uniforms.uDrip.value = intro.drip[index];
    });
    if (rig.paint.drip) {
      const { material, lip } = rig.paint.drip;
      material.uniforms.uDripY.value = lip - DRIP_DROP * intro.drip[1];
    }
    for (const material of rig.paint.pools) {
      const spread = intro.pool >= 1 ? 1000 : intro.pool * POOL_REACH;
      /* The pool stays on the floor, so it leaves with the burst and returns as the sets land. */
      material.uniforms.uPool.value.z = spread * hero.puddle;
      material.uniforms.uFade.value = hero.puddle;
      material.depthWrite = hero.puddle > 0.98;
    }

    /* Words only while the hero owns the picture. Beat 2, beat 3 and the still frame stay on bars. */
    const painted = current.wordKey !== "" && current.wordKey === current.key;
    const heroWord = !store.reduced && !inWork && stream === 0 && painted;
    wordUniforms.uZgomot.value = heroWord ? zgomotAmount(store.progress) : 0;
    wordUniforms.uSemnal.value = heroWord ? semnalAmount(store.progress, hero.burst) : 0;
    wordUniforms.uTear.value = heroWord ? tearAmount(store.progress) : 0;
    wordUniforms.uGhost.value = heroWord ? ghostAmount(store.progress, burst, hero.burst) : 0;
    rig.ghost.visible = wordUniforms.uGhost.value > 0.02;

    /*
     * Camera. The timeline has already eased both moves: opening shot to the whole
     * pile, then up and back to the shot that also holds the hole.
     */
    current.position.lerpVectors(from.position, to.position, hero.reveal);
    current.target.lerpVectors(from.target, to.target, hero.reveal);
    current.position.lerp(down.position, hero.follow);
    current.target.lerp(down.target, hero.follow);

    if (!store.reduced) {
      /*
       * Drift pauses on the value it had when SEMNAL locked, then continues from
       * there, so the hold is still and the burst does not start with a jump.
       */
      const lockSpan = HERO_BEAT.burstStart - HERO_BEAT.lockStart;
      const driftProgress =
        store.progress < HERO_BEAT.lockStart
          ? store.progress
          : store.progress < HERO_BEAT.burstStart
            ? HERO_BEAT.lockStart
            : store.progress - lockSpan;
      const holdingWord =
        store.progress >= HERO_BEAT.lockStart && store.progress < HERO_BEAT.burstStart;
      const hold = smooth(
        clamp01((driftProgress - HERO_BEAT.revealEnd) / (1 - HERO_BEAT.revealEnd)),
      );
      const swing = store.mobile ? 0 : DESKTOP_SWING_DEG * Math.sin(Math.PI * hero.reveal);
      /* While the pile hangs apart the camera orbits further, so the sets slide past each other. */
      const orbit = BURST_SWING_DEG * Math.sin(Math.PI * hero.burst);
      const angle = THREE.MathUtils.degToRad(swing + HOLD_DRIFT_DEG * hold + orbit);
      current.offset.subVectors(current.position, current.target);
      const { x, z } = current.offset;
      current.offset.x = x * Math.cos(angle) - z * Math.sin(angle);
      current.offset.z = x * Math.sin(angle) + z * Math.cos(angle);
      /* And it backs off as the pile lets go: the recoil. */
      current.offset.multiplyScalar(1 + BURST_RECOIL * thrown(burst));
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

      /* Pointer parallax, desktop only. During the lock it stays where the hold began. */
      if (!holdingWord) {
        const follow = 1 - Math.exp(-delta * 3);
        current.pointer.x += ((store.mobile ? 0 : store.pointer.x) - current.pointer.x) * follow;
        current.pointer.y += ((store.mobile ? 0 : store.pointer.y) - current.pointer.y) * follow;
      }
      current.right.set(-current.offset.z, 0, current.offset.x).normalize();
      /* Up close the parallax would show the edge of the glass, so it eases off with the push. */
      current.position.addScaledVector(current.right, -current.pointer.x * 0.7 * (1 - push));
      current.position.y += current.pointer.y * 0.4 * (1 - push);
    }

    camera.position.copy(current.position);
    camera.lookAt(current.target);
    /* Same scrubbed burst as the sets. Hidden whenever the strokes have faded. */
    rig.strokes.update(rig.tvs, camera, hero.burst, hero.stroke);
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

    /* Beat 2: three screens take one colour each, and the rest dim. */
    const tintPhase = clamp01(stream / STREAM_BEAT.pushEnd) * STREAMS.length;
    const dim = 1 - 0.4 * smooth(clamp01(stream / 0.12));
    const labelsOut = smooth(clamp01((stream - (STREAM_BEAT.chipsGone - 0.1)) / 0.1));
    camera.updateMatrixWorld();

    for (const material of rig.screens) material.uniforms.uDim.value = dim;
    for (const melt of rig.melts) {
      const uniforms = melt.material.uniforms;
      /* Paint-only meshes are hidden. They have no picture to tune. */
      if (!melt.hasScreen) continue;
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
      /* M is lit by the load sequence, long before the scroll tunes the others. */
      if (melt === rig.paint.omg[1]?.melt) tune = Math.max(tune, intro.on[1]);
      /* Not while the letters are up: a flash of bars under a letter reads as a fault. */
      if (tune === 0 && resting === 0 && blip(tick, melt.order) > 0.9) tune = 0.34;
      /* 0.3 is bars that tear and drop out: a locked screen loses its hold for a moment. */
      tune = THREE.MathUtils.lerp(tune, Math.min(tune, 0.3), jolt);

      /* Beat 3: the centre screen holds its signal, the others lose theirs as the camera passes. */
      const centre = melt.order === WORK_SCREEN_ORDER;
      if (inWork && !centre) {
        tune *= 1 - smooth(clamp01((store.work - WORK_BEAT.pushStart) / 0.22));
      }
      uniforms.uTune.value = tune;
      /* Up close the centre screen fills the frame, so the scanlines ease off. */
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

  return (
    <>
      <primitive object={root} />
      {/* Overlay on O, M and G while the page rests at the top. It only reads these tubes. */}
      <OMGLiquidOverlay screens={omg} />
    </>
  );
}

useGLTF.preload(TV_MODEL_URL);

export function TvScene() {
  return <TvPile />;
}
