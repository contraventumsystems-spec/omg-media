/**
 * The start of the pause after the push: the three sources gather. GSAP writes
 * the plain numbers. The canvas reads them in the same frame it draws, so a
 * fast swipe and a reverse scrub land on the same pose.
 *
 * The pause is PRESENT_SPAN on the streams timeline, about 168svh. The push,
 * tilt, river and desktop reading hold keep their own durations.
 *
 *   0 to 25%    the three sources gather. Their lean, nudge and tip overlap,
 *                and a brightness sweep crosses each picture.
 *   from there  the three become one set: app/lib/stream-merge.ts.
 */

/** Knight, chip, then pencil. The stagger follows this order. */
export const PRESENT_ORDER = ["strategie", "tehnologie", "design"] as const

export type PresentId = (typeof PRESENT_ORDER)[number]

/**
 * Length of the pause on the streams timeline. 0.70 is about 168svh.
 * It ends at the start of the tilt, which is where the floor line begins.
 */
export const PRESENT_SPAN = 0.7

/** Fractions of the pause. */
export const FORMATION = {
  /** Every source is at its front pose by here. */
  gather: 0.25,
  /** How far apart the three sources start their gather. */
  stagger: 0.08,
} as const

export type PresentPose = {
  /** 0 at rest in the pile, 1 at the forward pose. */
  forward: number
  /** 0 in the pile's turn, 1 as far toward the lens as this set is allowed. */
  face: number
  /** 0 before the sweep, 1 after it has crossed the glass. */
  gleam: number
}

const restPose = (): PresentPose => ({ forward: 0, face: 0, gleam: 0 })

/** The three sources. Written by the streams timeline, read by the canvas. */
export const presentRig: Record<PresentId, PresentPose> = {
  strategie: restPose(),
  tehnologie: restPose(),
  design: restPose(),
}

export function resetPresentRig() {
  for (const id of PRESENT_ORDER) Object.assign(presentRig[id], restPose())
}

export type PresentMove = {
  /** World units toward the camera (+X) at the front pose. */
  forward: number
  /** World units of lift at the front pose. */
  lift: number
  /** Largest turn toward the lens, in radians. The measured correction is cut here. */
  yaw: number
}

const DEG = Math.PI / 180

/**
 * How far each source may leave its rest pose.
 * Phone caps keep the cabinet and its label inside a 360px frame: Strategie
 * comes forward and turns, Tehnologie is about three fifths of that travel with
 * a tighter yaw, and Design only lifts and tips. Desktop is a little larger
 * because the pile has margin; the scroll through the pause is the same.
 */
export const PRESENT_MOVE: Record<"mobile" | "desktop", Record<PresentId, PresentMove>> = {
  mobile: {
    strategie: { forward: 0.5, lift: 0, yaw: 14 * DEG },
    tehnologie: { forward: 0.3, lift: 0, yaw: 8 * DEG },
    design: { forward: 0.12, lift: 0.2, yaw: 5 * DEG },
  },
  desktop: {
    strategie: { forward: 0.85, lift: 0, yaw: 18 * DEG },
    tehnologie: { forward: 0.5, lift: 0, yaw: 11 * DEG },
    design: { forward: 0.2, lift: 0.32, yaw: 7 * DEG },
  },
}
