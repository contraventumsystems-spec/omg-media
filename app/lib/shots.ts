import * as THREE from "three";

/**
 * Camera shots for the TV pile.
 *
 * World axes of the model: the pile faces +X, Y is up, and screen-right is -Z.
 * The halftone wall stands behind the pile at x = -7.75 and the pool runs
 * towards the camera up to x = 17.8.
 *
 * A shot is not a fixed position. Phones from 360 to 430 px wide and desktops
 * from 16:10 to 21:9 need different distances for the same framing, so a shot
 * names what must fit and where it sits, and resolveShot() turns that into
 * { position, target, fov } for the current aspect ratio.
 */
export type Shot = {
  /** Point the camera looks at, before truck and pedestal. */
  target: [number, number, number];
  /** Degrees around the pile. 0 is the faced position; positive orbits to screen-left. */
  azimuth: number;
  /** Degrees above the horizon. */
  elevation: number;
  fov: number;
  /** Width and height in world units that must stay in view. */
  frame: [number, number];
  /** Share of the viewport width and height the frame may take. */
  fill: [number, number];
  /** Slides the pile sideways. In half-viewport widths; positive moves the pile right. */
  truck?: number;
  /** Slides the pile vertically. In half-viewport heights; positive moves the pile down. */
  pedestal?: number;
  /**
   * Places one world height at a set screen height instead of using pedestal.
   * `at` runs from -1 at the bottom edge to 1 at the top edge.
   */
  pin?: { y: number; at: number };
};

export type ResolvedShot = {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
};

/** Measured from the export. Screens of the top set sit around y = 12.2. */
export const PILE = {
  width: 21,
  height: 13.6,
  topScreenY: 12.2,
  centre: [3, 5.8, -2.85] as [number, number, number],
} as const;

export const MOBILE_ASPECT = 0.8;

/**
 * Mobile is the master set: the pile starts small under the copy, grows to fill
 * the width, then the camera rises and looks down the streams to the hole.
 * Desktop keeps the faced position and swings 15 degrees on the way,
 * moving the pile from the right-hand column to the centre.
 */
export const shots = {
  mobile: {
    /**
     * Fallback opening shot, used only when the space under the copy is too short
     * to hold the pile (a phone on its side). Normally fitShot() replaces it.
     */
    SHOT_0: {
      target: PILE.centre,
      azimuth: 0,
      elevation: 20,
      fov: 45,
      frame: [PILE.width, 19],
      fill: [1.12, 0.74],
      pin: { y: PILE.topScreenY, at: -0.68 },
    },
    /** Whole pile, portrait, with a margin on both sides. */
    SHOT_1: {
      target: PILE.centre,
      azimuth: 0,
      elevation: 17,
      fov: 45,
      frame: [PILE.width, 19],
      fill: [0.98, 0.74],
      pedestal: -0.04,
    },
    /** Cascade: the pile moves to the upper third and the hole comes into the lower third. */
    SHOT_C: {
      target: PILE.centre,
      azimuth: 0,
      elevation: 22,
      fov: 45,
      frame: [PILE.width, 19],
      fill: [0.8, 0.74],
      pedestal: -0.36,
    },
    /** Beat 2. The three stream screens span the width, under the heading. */
    SHOT_2: {
      target: [5, 7.3, -1.6],
      azimuth: 0,
      elevation: 8,
      fov: 45,
      frame: [13.5, 8],
      fill: [1.0, 0.5],
      pedestal: 0.26,
    },
    /**
     * Tilted down 35 degrees onto the hole: the streams come in from the top and
     * the hole takes the lower half. Target and frame are placeholders; riverShot()
     * fills them in from the hole once it has been placed.
     */
    SHOT_3: {
      target: [0, 0, 0],
      azimuth: 0,
      elevation: 35,
      fov: 45,
      frame: [1, 1],
      fill: [0.92, 0.5],
      pedestal: 0.24,
    },
    /** Same tilt, slid so the hole sits in the top third above the list. */
    SHOT_3B: {
      target: [0, 0, 0],
      azimuth: 0,
      elevation: 35,
      fov: 45,
      frame: [1, 1],
      fill: [0.92, 0.5],
      pedestal: -0.5,
    },
    /** Still frame for reduced motion: the pile under the copy. */
    REST: {
      target: PILE.centre,
      azimuth: 0,
      elevation: 15,
      fov: 45,
      frame: [PILE.width, 19],
      fill: [1.0, 0.5],
      pedestal: 0.46,
    },
  },
  desktop: {
    /** Faced, in the right-hand column, next to the copy. */
    SHOT_0: {
      target: PILE.centre,
      azimuth: 0,
      elevation: 11,
      fov: 35,
      frame: [24, 19],
      fill: [0.56, 0.8],
      truck: 0.44,
      pedestal: 0.06,
    },
    /** Faced, centred, the pile takes the viewport. */
    SHOT_1: {
      target: PILE.centre,
      azimuth: 0,
      elevation: 13,
      fov: 35,
      frame: [24, 19],
      fill: [0.62, 0.74],
      pedestal: -0.1,
    },
    /** Cascade: the camera pulls back and rises; pile in the upper half, hole under it. */
    SHOT_C: {
      target: PILE.centre,
      azimuth: 0,
      elevation: 20,
      fov: 35,
      frame: [24, 19],
      fill: [0.5, 0.52],
      pedestal: -0.34,
    },
    SHOT_2: {
      target: [5, 7.3, -1.6],
      azimuth: 0,
      elevation: 8,
      fov: 35,
      frame: [13.5, 8],
      fill: [0.5, 0.62],
      truck: 0.36,
      pedestal: 0.14,
    },
    SHOT_3: {
      target: [0, 0, 0],
      azimuth: 0,
      elevation: 35,
      fov: 35,
      frame: [1, 1],
      fill: [0.44, 0.6],
      pedestal: 0.16,
    },
    SHOT_3B: {
      target: [0, 0, 0],
      azimuth: 0,
      elevation: 35,
      fov: 35,
      frame: [1, 1],
      fill: [0.44, 0.6],
      pedestal: -0.46,
    },
    REST: {
      target: PILE.centre,
      azimuth: 0,
      elevation: 11,
      fov: 35,
      frame: [24, 19],
      fill: [0.56, 0.8],
      truck: 0.44,
      pedestal: 0.06,
    },
  },
} satisfies Record<"mobile" | "desktop", Record<string, Shot>>;

/** Extra orbit in the middle of the desktop move, and the slow hold drift after it. */
export const DESKTOP_SWING_DEG = 15;
export const HOLD_DRIFT_DEG = 3;
/** Extra orbit while the pile hangs apart, so the sets slide past each other in depth. */
export const BURST_SWING_DEG = 9;
/** The camera backs off by this share of its distance as the pile lets go. */
export const BURST_RECOIL = 0.07;

const UP = new THREE.Vector3(0, 1, 0);
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3();

export function resolveShot(
  shot: Shot,
  aspect: number,
  out?: ResolvedShot,
): ResolvedShot {
  const result = out ?? {
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: shot.fov,
  };
  const tanV = Math.tan(THREE.MathUtils.degToRad(shot.fov) / 2);
  const tanH = tanV * aspect;
  const distance = Math.max(
    shot.frame[0] / 2 / tanH / shot.fill[0],
    shot.frame[1] / 2 / tanV / shot.fill[1],
  );
  const az = THREE.MathUtils.degToRad(shot.azimuth);
  const el = THREE.MathUtils.degToRad(shot.elevation);

  result.target.set(...shot.target);
  result.position
    .set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az))
    .multiplyScalar(distance)
    .add(result.target);

  forward.subVectors(result.target, result.position).normalize();
  right.crossVectors(forward, UP).normalize();
  up.crossVectors(right, forward);

  const halfW = distance * tanH;
  const halfH = distance * tanV;
  let rise = (shot.pedestal ?? 0) * halfH;
  if (shot.pin) {
    // Height of the pinned point above the look-at point, as the camera sees it.
    const seen = (shot.pin.y - shot.target[1]) * Math.cos(el);
    rise = seen - shot.pin.at * halfH;
  }
  const slide = -(shot.truck ?? 0) * halfW;

  result.position.addScaledVector(right, slide).addScaledVector(up, rise);
  result.target.addScaledVector(right, slide).addScaledVector(up, rise);
  result.fov = shot.fov;
  return result;
}

/**
 * Opening shot on a phone: the whole pile, fitted into the free band of the first
 * viewport. `band` is the top and bottom of that band as shares of the canvas
 * height, measured from the real copy, so the pile clears the buttons on a
 * 360 px phone and on a tall one without a single pixel offset in the layout.
 * Returns null when the band is too short to hold a readable pile.
 */
export function fitShot(
  base: Shot,
  band: { top: number; bottom: number },
): Shot | null {
  const height = band.bottom - band.top;
  if (height < 0.17) return null;
  return {
    target: PILE.centre,
    azimuth: 0,
    elevation: base.elevation,
    fov: base.fov,
    /* The pile alone, seen from just above: its height plus a little of its depth. */
    frame: [PILE.width, 16.2],
    fill: [15.8, height],
    /* Centre of the band, as an offset from the centre of the canvas. Positive is down. */
    pedestal: band.top + band.bottom - 1,
  };
}

/**
 * Where the hole sits in the cascade shot. It is placed by its position on screen
 * and its depth, not by a world coordinate, so it lands in the same place under
 * the pile on every aspect ratio.
 */
export type HolePlacement = {
  /** Height in the viewport: 0 is the centre, -1 the bottom edge. */
  at: number;
  /** Distance from the camera, in multiples of the pile's distance. Above 1 is behind it. */
  depth: number;
  /** Radius, as a share of half the viewport width at that depth. */
  radius: number;
  /** Sideways position: 0 is the centre, 1 the right edge. */
  across?: number;
};

export const HOLE: Record<"mobile" | "desktop", HolePlacement> = {
  mobile: { at: -0.46, depth: 1.6, radius: 0.44 },
  desktop: { at: -0.6, depth: 1.6, radius: 0.17 },
};

export function placeHole(
  shot: ResolvedShot,
  aspect: number,
  placement: HolePlacement,
  out: { centre: THREE.Vector3; radius: number },
) {
  const tanV = Math.tan(THREE.MathUtils.degToRad(shot.fov) / 2);
  const depth = shot.position.distanceTo(shot.target) * placement.depth;
  forward.subVectors(shot.target, shot.position).normalize();
  right.crossVectors(forward, UP).normalize();
  up.crossVectors(right, forward);
  out.centre
    .copy(shot.position)
    .addScaledVector(forward, depth)
    .addScaledVector(up, placement.at * depth * tanV)
    .addScaledVector(right, (placement.across ?? 0) * depth * tanV * aspect);
  out.radius = placement.radius * depth * tanV * aspect;
  return out;
}

/** Beat 2 shots look at the hole, so they are completed once it has been placed. */
export function riverShot(
  base: Shot,
  centre: THREE.Vector3,
  radius: number,
): Shot {
  return {
    ...base,
    target: [centre.x, centre.y + radius * 0.5, centre.z],
    frame: [radius * 3, radius * 3.2],
  };
}

/**
 * Reduced motion: the finished cascade as one still frame. It is the cascade shot
 * made smaller and moved, with the hole moved by the same amount, so the pile and
 * the hole keep their arrangement. On a phone it fits the free band under the
 * copy; on a desktop it sits in the right-hand column beside it.
 */
export function stillFrame(
  layout: "mobile" | "desktop",
  band: { top: number; bottom: number } | null,
): { shot: Shot; hole: HolePlacement } {
  const base: Shot = shots[layout].SHOT_C;
  const hole = HOLE[layout];
  /* Pile top to hole bottom takes about this share of the canvas height in the cascade shot. */
  const span = 0.7;
  let scale = 1;
  let lift = 0;
  let truck = 0;
  if (layout === "desktop") {
    scale = 0.74;
    truck = 0.44;
  } else if (band) {
    scale = Math.min(1, (band.bottom - band.top) / span);
    lift = 1 - (band.top + band.bottom);
  }
  return {
    shot: {
      ...base,
      fill: [base.fill[0] * scale, base.fill[1] * scale],
      pedestal: (base.pedestal ?? 0) * scale - lift,
      truck,
    },
    hole: {
      ...hole,
      at: hole.at * scale + lift,
      radius: hole.radius * scale,
      across: truck,
    },
  };
}
