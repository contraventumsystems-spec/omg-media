import * as THREE from "three"

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
  target: [number, number, number]
  /** Degrees around the pile. 0 is the faced position; positive orbits to screen-left. */
  azimuth: number
  /** Degrees above the horizon. */
  elevation: number
  fov: number
  /** Width and height in world units that must stay in view. */
  frame: [number, number]
  /** Share of the viewport width and height the frame may take. */
  fill: [number, number]
  /** Slides the pile sideways. In half-viewport widths; positive moves the pile right. */
  truck?: number
  /** Slides the pile vertically. In half-viewport heights; positive moves the pile down. */
  pedestal?: number
  /**
   * Places one world height at a set screen height instead of using pedestal.
   * `at` runs from -1 at the bottom edge to 1 at the top edge.
   */
  pin?: { y: number; at: number }
}

export type ResolvedShot = {
  position: THREE.Vector3
  target: THREE.Vector3
  fov: number
}

/** Measured from the export. Screens of the top set sit around y = 12.2. */
export const PILE = {
  width: 21,
  height: 13.6,
  topScreenY: 12.2,
  centre: [3, 5.8, -2.85] as [number, number, number],
} as const

export const MOBILE_ASPECT = 0.8

/**
 * Mobile is the master set: the camera cranes down from above the pile.
 * Desktop keeps the faced position at both ends and swings 15 degrees on the way,
 * moving the pile from the right-hand column to the centre.
 */
export const shots = {
  mobile: {
    /** Copy on top, the top sets peeking into the bottom fifth of the viewport. */
    SHOT_0: {
      target: PILE.centre,
      azimuth: 0,
      elevation: 20,
      fov: 45,
      frame: [PILE.width, 19],
      fill: [1.12, 0.74],
      pin: { y: PILE.topScreenY, at: -0.68 },
    },
    /** Whole pile, portrait. The pool's leading edge reaches the bottom. */
    SHOT_1: {
      target: PILE.centre,
      azimuth: 0,
      elevation: 17,
      fov: 45,
      frame: [PILE.width, 19],
      fill: [1.12, 0.74],
      pedestal: -0.12,
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
    /** Tilted down 35 degrees: the pool takes the lower two thirds. */
    SHOT_3: {
      target: [9.5, 1.2, -3.6],
      azimuth: 0,
      elevation: 35,
      fov: 45,
      frame: [17, 12],
      fill: [1.2, 0.7],
      pedestal: 0.16,
    },
    /** Same tilt, slid along the river so it sits in the top third above the list. */
    SHOT_3B: {
      target: [11.5, 0.6, -5],
      azimuth: 0,
      elevation: 35,
      fov: 45,
      frame: [17, 12],
      fill: [1.2, 0.7],
      pedestal: -0.42,
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
      fill: [0.62, 0.8],
      pedestal: -0.2,
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
      target: [9.5, 1.2, -3.6],
      azimuth: 0,
      elevation: 35,
      fov: 35,
      frame: [19, 11],
      fill: [0.66, 0.8],
      pedestal: 0.1,
    },
    SHOT_3B: {
      target: [11.5, 0.6, -5],
      azimuth: 0,
      elevation: 35,
      fov: 35,
      frame: [19, 11],
      fill: [0.66, 0.8],
      pedestal: -0.36,
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
} satisfies Record<"mobile" | "desktop", Record<string, Shot>>

/** Extra orbit in the middle of the desktop move, and the slow hold drift after it. */
export const DESKTOP_SWING_DEG = 15
export const HOLD_DRIFT_DEG = 3

const UP = new THREE.Vector3(0, 1, 0)
const forward = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3()

export function resolveShot(shot: Shot, aspect: number, out?: ResolvedShot): ResolvedShot {
  const result = out ?? {
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: shot.fov,
  }
  const tanV = Math.tan(THREE.MathUtils.degToRad(shot.fov) / 2)
  const tanH = tanV * aspect
  const distance = Math.max(
    shot.frame[0] / 2 / tanH / shot.fill[0],
    shot.frame[1] / 2 / tanV / shot.fill[1],
  )
  const az = THREE.MathUtils.degToRad(shot.azimuth)
  const el = THREE.MathUtils.degToRad(shot.elevation)

  result.target.set(...shot.target)
  result.position
    .set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az))
    .multiplyScalar(distance)
    .add(result.target)

  forward.subVectors(result.target, result.position).normalize()
  right.crossVectors(forward, UP).normalize()
  up.crossVectors(right, forward)

  const halfW = distance * tanH
  const halfH = distance * tanV
  let rise = (shot.pedestal ?? 0) * halfH
  if (shot.pin) {
    // Height of the pinned point above the look-at point, as the camera sees it.
    const seen = (shot.pin.y - shot.target[1]) * Math.cos(el)
    rise = seen - shot.pin.at * halfH
  }
  const slide = -(shot.truck ?? 0) * halfW

  result.position.addScaledVector(right, slide).addScaledVector(up, rise)
  result.target.addScaledVector(right, slide).addScaledVector(up, rise)
  result.fov = shot.fov
  return result
}
