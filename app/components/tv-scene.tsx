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
  STREAM_ICON_BOX,
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
import {
  hookGroup,
  hookRestShot,
  paintFloorHook,
  placeFloorHook,
  updateFloorHook,
} from "@/app/lib/floor-hook";
import {
  CLEAR_STAGGER,
  MERGE_FILL,
  MERGE_POINT,
  MERGE_REST,
  mergeRig,
  poolAmount,
  trioGone,
  type MergeState,
} from "@/app/lib/stream-merge";
import {
  PRESENT_MOVE,
  PRESENT_ORDER,
  presentRig,
  type PresentId,
} from "@/app/lib/stream-present";

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
  /**
   * Static tube just left of the Tehnologie bar, beside Strategie.
   * That photo and its label sit here; the green tint stays on the bar.
   */
  techSeat: TechSeat | null;
  /**
   * The three stream sets, indexed like STREAMS. Null when a set could not be bound.
   * The pause moves these pivots.
   */
  presented: (Presented | null)[];
  /** Who switches off, who meets, and the one set that is left. */
  merge: MergeBind;
  /** World height of the floor, taken from the top of the pool. */
  floorY: number;
};

/** The chip's tube: its glass, the label anchor, and the mesh that has to travel with them. */
type TechSeat = {
  glass: THREE.Box3;
  anchor: THREE.Vector3;
  mesh: THREE.Mesh;
};

/**
 * One stream set during the pause. Points are rest-world; `delta` carries them
 * onto the pivot after it has moved, so the label and the photo stay on the glass.
 */
type Presented = {
  id: PresentId;
  pivot: THREE.Group;
  rest: THREE.Vector3;
  /** Inverse of the pivot's matrix while the pile is stacked. */
  restInverse: THREE.Matrix4;
  /** Rest-world point to current-world point, for this frame's pose. */
  delta: THREE.Matrix4;
  /** Rest-world centre of the glass. The turn aims this at the lens. */
  centre: THREE.Vector3;
  /** Rest-world direction out of the glass. */
  normal: THREE.Vector3;
  /** The glass that brightens with the sweep. The chip uses the static tube, not the green bar. */
  uniforms: { uDim: { value: number } };
};

/** A set that is not one of the three sources. The pause switches it off. */
type MergeOther = {
  tv: Tv;
  /** Share of the switch-off this set waits. The far ones go first. */
  delay: number;
  /** This frame's switch-off: 0 on, 1 gone. */
  off: number;
  /** Its glasses. They flare as the picture folds to a line. */
  screens: THREE.ShaderMaterial["uniforms"][];
};

/**
 * Three become one (app/lib/stream-merge.ts). `single` is the set that is left:
 * the front bar screen of the bottom row, whose modeled spill is the river.
 */
type MergeBind = {
  others: MergeOther[];
  trio: Presented[];
  /** Fitted facing of each source's glass, indexed like `trio`. */
  facing: THREE.Vector3[];
  single: {
    other: MergeOther;
    melt: Melt;
    /** Rest-world centre of its glass, and the direction out of it. */
    centre: THREE.Vector3;
    normal: THREE.Vector3;
    /** Size of its cabinet at rest. */
    size: THREE.Vector3;
  } | null;
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
      measureRim(melt.mesh, glass);
      melt.material.uniforms.uTint.value.set(STREAMS[melt.stream].color);
      glass.getCenter(melt.anchor);
      melt.anchor.y = glass.max.y + 0.25;
      melt.anchor.x = glass.max.x;
    });

  /* Tehnologie's picture moves one set left, onto the static tube beside Strategie. */
  const techSeat = techSeatFor(melts, faces);

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

  /* Top of the pool: the height the floor lettering lies at. */
  let floorY = 0;
  for (const mesh of floor) floorY = Math.max(floorY, new THREE.Box3().setFromObject(mesh).max.y);
  /* After the sets are grouped, so each stream resolves to the pivot that owns its glass. */
  const presented = bindPresented(root, melts, techSeat);
  const merge = bindMerge(tvs, faces, presented);
  return {
    root,
    tvs,
    faces,
    melts,
    screens,
    glints,
    wordBoxes,
    halftone,
    ghost,
    paint,
    strokes,
    techSeat,
    presented,
    merge,
    floorY,
  };
}

/** How far behind the front of its bulge each glass's rim lies, measured once at rest. */
const rimDepths = new WeakMap<THREE.Box3, number>();

/**
 * A tube bulges towards the viewer, so the front of its box is the middle of
 * the glass. The picture belongs on the rim: average the depth of the vertices
 * along the four edges of the glass.
 */
function measureRim(mesh: THREE.Mesh, glass: THREE.Box3) {
  if (glass.isEmpty()) return;
  const positions = mesh.geometry.getAttribute("position");
  const vertex = new THREE.Vector3();
  const edgeY = (glass.max.y - glass.min.y) * 0.06;
  const edgeZ = (glass.max.z - glass.min.z) * 0.06;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
    if (vertex.y < glass.min.y || vertex.y > glass.max.y) continue;
    const onEdge =
      vertex.y > glass.max.y - edgeY ||
      vertex.y < glass.min.y + edgeY ||
      vertex.z > glass.max.z - edgeZ ||
      vertex.z < glass.min.z + edgeZ;
    if (!onEdge) continue;
    sum += vertex.x;
    count += 1;
  }
  if (count > 0) rimDepths.set(glass, glass.max.x - sum / count);
}

/**
 * The static tube immediately left of the Tehnologie bar.
 * Screen-left is +Z. Among those tubes, the one closest in height wins,
 * which is the set between Tehnologie and Strategie.
 */
function techSeatFor(melts: Melt[], faces: Face[]) {
  const techIndex = STREAMS.findIndex((stream) => stream.id === "tehnologie");
  const tech = melts.find((melt) => melt.hasScreen && melt.stream === techIndex);
  if (!tech || tech.glass.isEmpty()) return null;

  const techCentre = tech.glass.getCenter(new THREE.Vector3());
  const centre = new THREE.Vector3();
  let best: Face | null = null;
  let bestScore = Infinity;
  for (const face of faces) {
    if (face.melt || face.glass.isEmpty()) continue;
    face.glass.getCenter(centre);
    if (centre.z <= techCentre.z) continue;
    const score =
      Math.abs(centre.z - techCentre.z) + Math.abs(face.glass.max.y - tech.glass.max.y) * 2;
    if (score < bestScore) {
      best = face;
      bestScore = score;
    }
  }
  if (!best) return null;
  measureRim(best.mesh, best.glass);

  const anchor = new THREE.Vector3();
  best.glass.getCenter(anchor);
  anchor.y = best.glass.max.y + 0.25;
  anchor.x = best.glass.max.x;
  return { glass: best.glass, anchor, mesh: best.mesh };
}

/** The television pivot a mesh was grouped onto, if the burst rig owns it. */
function televisionOf(mesh: THREE.Object3D) {
  let node: THREE.Object3D | null = mesh;
  while (node) {
    if (node.name.startsWith("tv-")) return node as THREE.Group;
    node = node.parent;
  }
  return null;
}

/**
 * Direction out of the glass, from the centre toward the bulge that faces the camera.
 * The front of a tube is the high-x side; averaging that bulge keeps a yawed set's turn.
 */
function glassOutward(mesh: THREE.Mesh, glass: THREE.Box3, out: THREE.Vector3) {
  const positions = mesh.geometry.getAttribute("position");
  const vertex = new THREE.Vector3();
  const centre = glass.getCenter(new THREE.Vector3());
  const front = centre.x + (glass.max.x - centre.x) * 0.45;
  out.set(0, 0, 0);
  let count = 0;
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
    if (vertex.y < glass.min.y || vertex.y > glass.max.y) continue;
    if (vertex.z < glass.min.z || vertex.z > glass.max.z) continue;
    if (vertex.x < front) continue;
    out.add(vertex);
    count += 1;
  }
  if (count === 0) return out.set(1, 0, 0);
  out.multiplyScalar(1 / count).sub(centre);
  if (out.lengthSq() < 1e-8) return out.set(1, 0, 0);
  out.normalize();
  if (out.x < 0) out.negate();
  return out;
}

/** One stream set per STREAMS slot, bound to the pivot that actually holds its glass. */
function bindPresented(root: THREE.Group, melts: Melt[], techSeat: TechSeat | null) {
  root.updateMatrixWorld(true);
  const sets: (Presented | null)[] = STREAMS.map(() => null);
  STREAMS.forEach((stream, index) => {
    const melt = melts.find((item) => item.hasScreen && item.stream === index);
    /* The chip and its label live on the static tube, so that set is the one that turns. */
    const seat = stream.id === "tehnologie" ? techSeat : null;
    const mesh = seat?.mesh ?? melt?.mesh;
    const glass = seat?.glass ?? melt?.glass;
    if (!mesh || !glass || glass.isEmpty()) return;
    const pivot = televisionOf(mesh);
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const shader = material as THREE.ShaderMaterial;
    if (!pivot || !shader.uniforms?.uDim) return;
    sets[index] = {
      id: stream.id,
      pivot,
      rest: pivot.position.clone(),
      restInverse: new THREE.Matrix4().copy(pivot.matrixWorld).invert(),
      delta: new THREE.Matrix4(),
      centre: glass.getCenter(new THREE.Vector3()),
      normal: glassOutward(mesh, glass, new THREE.Vector3()),
      uniforms: shader.uniforms as Presented["uniforms"],
    };
  });
  return sets;
}

/** Reused so the pause allocates nothing per frame. */
const presentDir = new THREE.Vector3();
const presentQuat = new THREE.Quaternion();
const presentHeld = new THREE.Quaternion();

/**
 * Turns the three sources by the scrubbed pose and records the rigid delta from
 * the stacked pile. `nudge` and `turn` come from the rig the streams timeline
 * writes, so the pose is a pure function of the scroll.
 */
function posePresented(sets: (Presented | null)[], camera: THREE.Camera, mobile: boolean) {
  for (const set of sets) {
    if (!set) continue;
    const nudge = presentRig[set.id].forward;
    const turn = presentRig[set.id].face;
    if (nudge < 1e-4 && turn < 1e-4) {
      set.delta.identity();
      continue;
    }
    const move = PRESENT_MOVE[mobile ? "mobile" : "desktop"][set.id];
    set.pivot.position.copy(set.rest);
    set.pivot.position.x += move.forward * nudge;
    set.pivot.position.y += move.lift * nudge;

    presentDir.subVectors(camera.position, set.centre);
    if (presentDir.lengthSq() < 1e-8) presentDir.set(1, 0, 0);
    else presentDir.normalize();
    presentQuat.setFromUnitVectors(set.normal, presentDir);
    /* q and -q are the same turn. Keep the short arc so the cap measures the small one. */
    if (presentQuat.w < 0) {
      presentQuat.x *= -1;
      presentQuat.y *= -1;
      presentQuat.z *= -1;
      presentQuat.w *= -1;
    }
    const angle = 2 * Math.acos(THREE.MathUtils.clamp(presentQuat.w, -1, 1));
    const weight = angle < 1e-4 ? 0 : Math.min(1, move.yaw / angle);
    presentHeld.identity().slerp(presentQuat, weight * turn);
    set.pivot.quaternion.copy(presentHeld);
    set.pivot.updateMatrixWorld(true);
    set.delta.copy(set.pivot.matrixWorld).multiply(set.restInverse);
  }
}

/**
 * The direction a glass faces, from a plane fitted to its vertices:
 * x = a * z + b * y + c, so the normal is (1, -b, -a). Unlike glassOutward this
 * is right for a set that stands turned in the pile, which the merge needs
 * because it turns a set all the way to the lens.
 */
function glassFacing(mesh: THREE.Mesh, glass: THREE.Box3, out: THREE.Vector3) {
  const positions = mesh.geometry.getAttribute("position");
  const sums = new THREE.Matrix3().set(0, 0, 0, 0, 0, 0, 0, 0, 0);
  const plane = new THREE.Vector3();
  const point = new THREE.Vector3();
  const e = sums.elements;
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
    if (!glass.containsPoint(point)) continue;
    const basis = [point.z, point.y, 1];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) e[c * 3 + r] += basis[r] * basis[c];
      plane.setComponent(r, plane.getComponent(r) + basis[r] * point.x);
    }
  }
  if (Math.abs(sums.determinant()) < 1e-9) return out.set(1, 0, 0);
  plane.applyMatrix3(sums.invert());
  return out.set(1, -plane.y, -plane.x).normalize();
}

/**
 * Sorts the pile for the merge: the three sources, everyone else, and the set
 * that is left. Called with the pile stacked, after the sets are grouped.
 */
function bindMerge(tvs: Tv[], faces: Face[], presented: (Presented | null)[]): MergeBind {
  const trio = presented.filter((set): set is Presented => set !== null);
  /* Without all three there is nothing to merge, and the pile stays whole. */
  if (trio.length < STREAMS.length) return { others: [], trio: [], facing: [], single: null };

  const sources = new Set<THREE.Object3D>(trio.map((set) => set.pivot));
  const middle = new THREE.Vector3();
  for (const set of trio) middle.addScaledVector(set.rest, 1 / trio.length);

  const others = tvs
    .filter((tv) => !sources.has(tv.pivot))
    .map(
      (tv): MergeOther => ({
        tv,
        delay: 0,
        off: 0,
        screens: faces
          .filter((face) => televisionOf(face.mesh) === tv.pivot)
          .map((face) => face.uniforms),
      }),
    );
  /* The far sets go first, so the dark closes in on the three. */
  let far = 0;
  for (const other of others) far = Math.max(far, other.tv.rest.distanceTo(middle));
  for (const other of others) {
    other.delay = far > 0 ? CLEAR_STAGGER * (1 - other.tv.rest.distanceTo(middle) / far) : 0;
  }

  /* The bar screen of the bottom row that stands furthest forward: its spill feeds the pool. */
  let single: MergeBind["single"] = null;
  let front = -Infinity;
  for (const face of faces) {
    if (!face.melt || !isWordRow(face.row) || face.glass.isEmpty()) continue;
    if (face.glass.max.x <= front) continue;
    const pivot = televisionOf(face.mesh);
    const other = others.find((item) => item.tv.pivot === pivot);
    if (!other) continue;
    /* The cabinet alone. The glass mesh also holds the pool, which reaches far across the floor. */
    const shell = new THREE.Box3();
    for (const child of other.tv.pivot.children) {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && materialName(mesh).startsWith("OldTV")) shell.expandByObject(mesh);
    }
    const size = (shell.isEmpty() ? face.glass : shell).getSize(new THREE.Vector3());
    front = face.glass.max.x;
    single = {
      other,
      melt: face.melt,
      centre: face.glass.getCenter(new THREE.Vector3()),
      normal: glassFacing(face.mesh, face.glass, new THREE.Vector3()),
      size,
    };
  }

  /* Each source's fitted facing, by the glass that carries its picture. */
  const facing = trio.map((set) => {
    const face = faces.find(
      (item) => !item.glass.isEmpty() && item.glass.containsPoint(set.centre),
    );
    return face ? glassFacing(face.mesh, face.glass, new THREE.Vector3()) : set.normal.clone();
  });
  return { others, trio, facing, single };
}

/** Radians the three have rolled around the lens by the time they meet. */
const MERGE_SPIN = 1.1;
/** Their size at the meeting point, as a share of full size. */
const MERGE_SHRINK = 0.5;
/** How far the hit knocks the camera back, as a share of its distance. */
const MERGE_KICK = 0.03;

/** Reused so the merge allocates nothing per frame. */
const mergeFrom = new THREE.Vector3();
const mergeWay = new THREE.Vector3();
const mergeView = new THREE.Vector3();
const mergeSide = new THREE.Vector3();
const mergeArm = new THREE.Vector3();
const mergeFace = new THREE.Quaternion();
const mergeRoll = new THREE.Quaternion();
const mergeAcross = new THREE.Vector3();
const mergeUp = new THREE.Vector3();
const mergeBasis = new THREE.Matrix4();
const mergeTarget = new THREE.Matrix4();
const UPRIGHT = new THREE.Quaternion();
const WORLD_UP = new THREE.Vector3(0, 1, 0);
/** The one set stands a little off the lens axis, so its cabinet shows a side and reads as a solid. */
const MERGE_YAW = THREE.MathUtils.degToRad(11);

/**
 * The turn that takes a glass facing `from` to face `to` with its top edge kept
 * level. The shortest turn between the two would roll the set, because the
 * sets stand turned in the pile and the lens looks down on them.
 */
function levelTurn(from: THREE.Vector3, to: THREE.Vector3, out: THREE.Quaternion) {
  mergeAcross.crossVectors(WORLD_UP, from).normalize();
  mergeUp.crossVectors(from, mergeAcross);
  mergeBasis.makeBasis(mergeAcross, mergeUp, from);
  mergeAcross.crossVectors(WORLD_UP, to).normalize();
  mergeUp.crossVectors(to, mergeAcross);
  mergeTarget.makeBasis(mergeAcross, mergeUp, to);
  return out.setFromRotationMatrix(mergeTarget.multiply(mergeBasis.transpose()));
}

/**
 * Three become one. Runs after the burst and the gather have placed every
 * pivot, and takes it from there: the other sets switch off, the three sources
 * spiral into `point`, and the single set grows there and later comes home.
 * Every pose is a function of the scrubbed state; only the small bob runs on
 * the clock. With the state at rest it puts every set back to full size.
 */
function poseMerge(
  bind: MergeBind,
  state: Readonly<MergeState>,
  camera: THREE.Camera,
  point: THREE.Vector3,
  grown: number,
  time: number,
  lite: boolean,
) {
  const single = bind.single;
  const standing = single !== null && state.single > 0.001;

  for (const other of bind.others) {
    const pivot = other.tv.pivot;
    if (standing && other === single.other) {
      other.off = 0;
      continue;
    }
    const off = clamp01((state.clear - other.delay) / (1 - CLEAR_STAGGER));
    other.off = off;
    pivot.visible = off < 0.999;
    if (off <= 0 || !pivot.visible) {
      pivot.scale.setScalar(1);
      continue;
    }
    /* A tube switching off: the picture snaps to a line, then the line closes to a dot. */
    const fold = 1 - (1 - clamp01(off / 0.6)) ** 3;
    const shut = clamp01((off - 0.5) / 0.5);
    const wide = Math.max((1 + 0.08 * fold) * (1 - shut * shut), 1e-3);
    pivot.scale.set(wide, Math.max(1 - 0.97 * fold, 1e-3), wide);
  }

  const rush = state.converge;
  const pull = clamp01(rush);
  const gone = trioGone(state);
  mergeView.subVectors(camera.position, point).normalize();
  bind.trio.forEach((set, index) => {
    const pivot = set.pivot;
    pivot.visible = gone < 0.999;
    if (!pivot.visible) return;
    /* Alone in the frame, the three hang a little, each on its own beat. */
    const afloat = lite ? 0 : state.clear * (1 - pull);
    if (Math.abs(rush) < 1e-4 && afloat < 1e-4) {
      pivot.scale.setScalar(1);
      return;
    }
    /* From where the gather left the glass, along a curve that winds around the lens axis. */
    mergeFrom.copy(set.centre).applyMatrix4(set.delta);
    mergeWay.subVectors(point, mergeFrom);
    mergeSide.crossVectors(mergeView, mergeWay);
    mergeFrom
      .addScaledVector(mergeWay, Math.max(rush, -0.3))
      .addScaledVector(mergeSide, 0.3 * Math.sin(Math.PI * pull));
    mergeFrom.y += 0.1 * afloat * Math.sin(time * 0.9 + index * 2.1);

    mergeArm.subVectors(camera.position, mergeFrom).normalize();
    levelTurn(bind.facing[index], mergeArm, mergeFace);
    pivot.quaternion.slerp(mergeFace, pull);
    mergeRoll.setFromAxisAngle(mergeView, MERGE_SPIN * pull * pull);
    pivot.quaternion.premultiply(mergeRoll);

    /* The pivot is placed so the glass, not the cabinet's middle, follows the curve. */
    const size = Math.max((1 - (1 - MERGE_SHRINK) * pull) * (1 - gone), 1e-3);
    mergeArm.subVectors(set.centre, set.rest).multiplyScalar(size).applyQuaternion(pivot.quaternion);
    pivot.position.copy(mergeFrom).sub(mergeArm);
    pivot.scale.setScalar(size);
    pivot.updateMatrixWorld(true);
    set.delta.copy(pivot.matrixWorld).multiply(set.restInverse);
  });

  if (!standing) return;
  const pivot = single.other.tv.pivot;
  const shown = clamp01(state.single);
  mergeFrom.copy(point);
  if (!lite) mergeFrom.y += 0.12 * shown * (1 - state.land) * Math.sin(time * 0.9);
  mergeArm.subVectors(camera.position, mergeFrom).normalize();
  mergeWay.copy(mergeArm).applyAxisAngle(WORLD_UP, MERGE_YAW);
  levelTurn(single.normal, mergeWay, mergeFace);
  /* The hit rings out: a roll that dies as the set reaches full size. */
  mergeRoll.setFromAxisAngle(mergeArm, 0.16 * Math.sin(state.single * Math.PI * 3) * (1 - shown));
  mergeFace.premultiply(mergeRoll);
  const size = Math.max(grown * state.single, 1e-3);
  mergeArm
    .subVectors(single.centre, single.other.tv.rest)
    .multiplyScalar(size)
    .applyQuaternion(mergeFace);
  /* Home is its own seat in the pile: upright, full size, on its modeled spill. */
  pivot.visible = true;
  pivot.position.copy(mergeFrom).sub(mergeArm).lerp(single.other.tv.rest, state.land);
  pivot.quaternion.copy(mergeFace).slerp(UPRIGHT, state.land);
  pivot.scale.setScalar(THREE.MathUtils.lerp(size, 1, state.land));
}

/** How far the gathered sets have left the pile, 0 at rest and 1 at the front pose. */
function presentedAmount() {
  let max = 0;
  for (const id of PRESENT_ORDER) {
    const pose = presentRig[id];
    if (pose.forward > max) max = pose.forward;
    if (pose.face > max) max = pose.face;
  }
  return max;
}

/** Slides the soft band across one icon. Opacity is a hump, so the band is gone at both ends. */
function paintSheen(icon: HTMLElement, stream: number) {
  const sheen = icon.querySelector<HTMLElement>("[data-stream-sheen]");
  if (!sheen) return;
  const gleam = THREE.MathUtils.clamp(presentRig[STREAMS[stream].id].gleam, 0, 1);
  const band = Math.sin(Math.PI * gleam);
  const opacity = band.toFixed(3);
  const shift = `translate3d(${(-100 + gleam * 350).toFixed(1)}%,0,0)`;
  if (sheen.style.opacity !== opacity) sheen.style.opacity = opacity;
  if (sheen.style.transform !== shift) sheen.style.transform = shift;
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
/** Index of Tehnologie in STREAMS. Its photo and label use the tube to the left. */
const TECH_STREAM = STREAMS.findIndex((stream) => stream.id === "tehnologie");
const projected = new THREE.Vector3();
/** Rest-world label anchor after the pause's delta, reused so the frame allocates nothing. */
const posedAnchor = new THREE.Vector3();
/** Front-face corners of one glass, reused so the icon fit allocates nothing per frame. */
const faceCorner = [
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
  new THREE.Vector3(),
];
const facePx = [
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
];
/** Share of the glass the stream photo covers. The rest is the tube's rounded edge. */
const STREAM_ICON_INSET = 0.96;
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

/**
 * Fits one stream photo to the glass face that points at the camera.
 * The four corners of the glass are projected and the box is warped onto
 * them, so the picture takes the screen's perspective instead of floating.
 */
function placeStreamIcon(
  icon: HTMLElement,
  glass: THREE.Box3,
  camera: THREE.Camera,
  viewWidth: number,
  viewHeight: number,
  opacity: number,
  pose: THREE.Matrix4 | null,
) {
  if (glass.isEmpty() || opacity <= 0) {
    if (icon.style.opacity !== "0") icon.style.opacity = "0";
    return;
  }

  const { min, max } = glass;
  const midY = (min.y + max.y) / 2;
  const midZ = (min.z + max.z) / 2;
  const halfY = ((max.y - min.y) / 2) * STREAM_ICON_INSET;
  const halfZ = ((max.z - min.z) / 2) * STREAM_ICON_INSET;
  /* The corners sit at the depth of the rim, not at the front of the bulge. */
  const faceX = max.x - (rimDepths.get(glass) ?? 0);
  /* The pile faces +X. Screen-right is -Z, so the top-left corner is +Z. */
  faceCorner[0].set(faceX, midY + halfY, midZ + halfZ);
  faceCorner[1].set(faceX, midY + halfY, midZ - halfZ);
  faceCorner[2].set(faceX, midY - halfY, midZ + halfZ);
  faceCorner[3].set(faceX, midY - halfY, midZ - halfZ);
  /* The glass box is the rest pose. The pause's delta carries those corners with the set. */
  if (pose) {
    for (let i = 0; i < 4; i++) faceCorner[i].applyMatrix4(pose);
  }

  for (let i = 0; i < 4; i++) {
    projected.copy(faceCorner[i]).project(camera);
    facePx[i].x = (projected.x * 0.5 + 0.5) * viewWidth;
    facePx[i].y = (-projected.y * 0.5 + 0.5) * viewHeight;
  }

  const [tl, tr, bl, br] = facePx;
  const glassW = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  const glassH = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  if (glassW < 8 || glassH < 8 || halfZ <= 0) {
    if (icon.style.opacity !== "0") icon.style.opacity = "0";
    return;
  }

  /* The box takes the glass's own ratio, so the photo is cropped, never stretched. */
  const width = STREAM_ICON_BOX.width;
  const height = Math.round((width * halfY) / halfZ);
  const tall = `${height}px`;
  if (icon.style.height !== tall) icon.style.height = tall;

  /* Homography from the box to the four projected corners: the photo lies on the glass. */
  const dx1 = tr.x - br.x;
  const dx2 = bl.x - br.x;
  const dy1 = tr.y - br.y;
  const dy2 = bl.y - br.y;
  const sumX = tl.x - tr.x + br.x - bl.x;
  const sumY = tl.y - tr.y + br.y - bl.y;
  const den = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(den) < 1e-6) {
    if (icon.style.opacity !== "0") icon.style.opacity = "0";
    return;
  }
  const g = (sumX * dy2 - dx2 * sumY) / den;
  const h = (dx1 * sumY - sumX * dy1) / den;
  const a = (tr.x - tl.x + g * tr.x) / width;
  const d = (tr.y - tl.y + g * tr.y) / width;
  const b = (bl.x - tl.x + h * bl.x) / height;
  const e = (bl.y - tl.y + h * bl.y) / height;
  const next = `matrix3d(${a.toFixed(5)}, ${d.toFixed(5)}, 0, ${(g / width).toFixed(7)}, ${b.toFixed(5)}, ${e.toFixed(5)}, 0, ${(h / height).toFixed(7)}, 0, 0, 1, 0, ${tl.x.toFixed(2)}, ${tl.y.toFixed(2)}, 0, 1)`;
  const alpha = opacity.toFixed(3);
  if (icon.style.transform !== next) icon.style.transform = next;
  if (icon.style.opacity !== alpha) icon.style.opacity = alpha;
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
    /** Framing the floor hook was laid out for. Empty until its lettering is drawn. */
    hookKey: "",
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
    /** Where the three stream sets meet, and how large the one set stands there. */
    meet: new THREE.Vector3(),
    grown: 1,
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
      current.hookKey = "";
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

      /* The meeting point sits in the middle of the push shot's frame, a step towards the lens. */
      current.meet.set(...set.SHOT_2.target);
      current.meet.x += MERGE_POINT.forward;
      current.meet.y += MERGE_POINT.lift;
      const one = rig.merge.single;
      if (one) {
        /* Sized by the view at that depth, so the one set reads the same on a phone and a wide desktop. */
        const fill = MERGE_FILL[layout];
        const viewHeight =
          2 *
          current.push.position.distanceTo(current.meet) *
          Math.tan(THREE.MathUtils.degToRad(current.push.fov) / 2);
        current.grown = THREE.MathUtils.clamp(
          Math.min(
            (fill.height * viewHeight) / one.size.y,
            (fill.width * viewHeight * aspect) / one.size.z,
          ),
          1,
          3,
        );
      }

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
      /* The last leg only lifts the floor line to the top, where the service story continues it. */
      current.river = hookRestShot(current.tilt, layout);

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

    /* The floor hook is drawn once the display font is there, then laid out for this framing. */
    if (!store.reduced && current.tilt && current.hookKey !== current.key && paintFloorHook()) {
      placeFloorHook(current.tilt, aspect, rig.floorY, layout);
      current.hookKey = current.key;
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
    /* Three become one, in beat 2 only. Any other owner of the scene gets the whole pile. */
    const merge: Readonly<MergeState> =
      store.reduced || inWork || stream <= 0 || burst > 0.001 ? MERGE_REST : mergeRig;
    const trioShown = 1 - trioGone(merge);

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
    /* Beat 2 draws the pool back under the pile and pours it out again (stream-merge.ts). */
    const poured = poolAmount(merge);
    /* While it does, the pool's source is the lip of the one set, not the middle of the pile. */
    const spout = poured < 1 ? rig.merge.single?.centre : undefined;
    for (const material of rig.paint.pools) {
      const whole = intro.pool >= 1 ? 1000 : intro.pool * POOL_REACH;
      /* The pool's edge wanders by up to 1.4 either way, so an empty floor needs a radius below zero. */
      const spread = poured >= 1 ? whole : Math.min(whole, poured * (POOL_REACH + 2) - 2);
      material.uniforms.uPool.value.x = spout ? spout.x : POOL_SOURCE.x;
      material.uniforms.uPool.value.y = spout ? spout.z : POOL_SOURCE.y;
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
        /* The hit knocks the camera back a little, and it comes forward again. */
        if (merge.shock > 0) {
          current.position.addScaledVector(current.offset, MERGE_KICK * merge.shock);
          current.offset.multiplyScalar(1 + MERGE_KICK * merge.shock);
        }
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
      /* During the pause it eases off too, so the front-facing screen does not drift. */
      const steady = (1 - push) * (1 - presentedAmount());
      current.position.addScaledVector(current.right, -current.pointer.x * 0.7 * steady);
      current.position.y += current.pointer.y * 0.4 * steady;
    }

    camera.position.copy(current.position);
    camera.lookAt(current.target);
    /* Same scrubbed burst as the sets. Hidden whenever the strokes have faded. */
    rig.strokes.update(rig.tvs, camera, hero.burst, hero.stroke, hero.wipe);
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

    /* Beat 2 only: the hook pops onto the floor on the streams timeline. */
    updateFloorHook(stream > 0 ? 1 : 0);

    /*
     * The pause after the push. The burst has already seated every set, and these
     * three leave that rest by the scrubbed pose. While the pile is apart the
     * burst owns the pivots, so the photos stay on the stacked glass.
     */
    if (burst > 0.001) {
      for (const set of rig.presented) set?.delta.identity();
    } else {
      posePresented(rig.presented, camera, store.mobile);
    }
    /* Then the merge takes the gathered three and everyone else from there. */
    poseMerge(rig.merge, merge, camera, current.meet, current.grown, time, store.lite);

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

      /* Tehnologie's photo and label sit on the static tube to the left of its bar. */
      const seated = melt.stream === TECH_STREAM ? rig.techSeat : null;
      const set = melt.stream < 0 ? null : rig.presented[melt.stream];
      /* The sweep lifts the glass that actually shows the picture, including the chip's tube. */
      if (set) {
        const band = Math.sin(Math.PI * THREE.MathUtils.clamp(presentRig[set.id].gleam, 0, 1));
        if (band > 0) set.uniforms.uDim.value *= 1 + 0.18 * band;
      }
      const chip = melt.stream < 0 ? null : store.chips[melt.stream];
      if (chip) {
        posedAnchor.copy(seated ? seated.anchor : melt.anchor);
        if (set) posedAnchor.applyMatrix4(set.delta);
        projected.copy(posedAnchor).project(camera);
        const x = (projected.x * 0.5 + 0.5) * state.size.width;
        const y = (-projected.y * 0.5 + 0.5) * state.size.height;
        chip.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        chip.style.opacity = (tint * (1 - labelsOut) * trioShown).toFixed(3);
      }

      /* Beat 2 only. The photo covers this glass; the other labels keep their anchors. */
      const icon = melt.stream < 0 ? null : store.icons?.[melt.stream];
      if (icon) {
        paintSheen(icon, melt.stream);
        if (stream <= 0) {
          if (icon.style.opacity !== "0") icon.style.opacity = "0";
        } else {
          placeStreamIcon(
            icon,
            seated ? seated.glass : melt.glass,
            camera,
            state.size.width,
            state.size.height,
            tint * trioShown,
            set ? set.delta : null,
          );
        }
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
      /* The one set: static at the hit, then it tunes to the full bars, at full brightness. */
      if (merge.single > 0.001 && melt === rig.merge.single?.melt) {
        tune = Math.min(tune, merge.tune);
        uniforms.uDim.value =
          THREE.MathUtils.lerp(dim, 1, clamp01(merge.single)) * (1 + 0.5 * merge.shock);
      }
      uniforms.uTune.value = tune;
      /* Up close the centre screen fills the frame, so the scanlines ease off. */
      uniforms.uCrt.value = centre ? 1 - push : 1;
    }
    /* A source that has turned to the lens is lit, the chip's static tube included. */
    for (const set of rig.presented) {
      if (set && presentRig[set.id].face > 0.04) {
        set.uniforms.uDim.value = Math.max(set.uniforms.uDim.value, 0.92);
      }
    }
    /* A set that is switching off flares as its picture folds to a line. */
    for (const other of rig.merge.others) {
      if (other.off <= 0 || other.off >= 1) continue;
      const flare = 1 + 1.6 * Math.sin(Math.PI * clamp01(other.off / 0.7));
      for (const screen of other.screens) screen.uDim.value *= flare;
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
      {/* Two lines of lettering on the floor, between the spill and the service list. */}
      <primitive object={hookGroup} />
      {/* Overlay on O, M and G while the page rests at the top. It only reads these tubes. */}
      <OMGLiquidOverlay screens={omg} />
    </>
  );
}

useGLTF.preload(TV_MODEL_URL);

export function TvScene() {
  return <TvPile />;
}
