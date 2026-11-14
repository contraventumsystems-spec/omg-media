/**
 * The face on the top tube of the resting pile: two eyes and a mouth, drawn in
 * the screen shader on a coarse pixel grid, like a virtual pet. This file only
 * decides the expression. It is a pure function of the clock and the pointer.
 */

/** One step of the face's pixel grid, in cell units. The shader uses the same grid. */
export const FACE_PIXEL = 1 / 20

/** Eye shapes, as the shader numbers them. */
const EYE = { dot: 0, tall: 1, happy: 2, shut: 3, wide: 4 } as const
/** Mouth shapes, as the shader numbers them. */
const MOUTH = { smile: 0, round: 1, flat: 2, grin: 3 } as const

/** The loop of expressions: eyes, then mouth. */
const MOODS: readonly (readonly [number, number])[] = [
  [EYE.dot, MOUTH.smile],
  [EYE.happy, MOUTH.grin],
  [EYE.tall, MOUTH.round],
  [EYE.dot, MOUTH.flat],
  [EYE.wide, MOUTH.round],
  [EYE.happy, MOUTH.smile],
  [EYE.shut, MOUTH.smile],
  [EYE.tall, MOUTH.grin],
]
/** Seconds one expression stays up. */
const MOOD_SECONDS = 2.2
/** A blink every this many seconds, this long. */
const BLINK_EVERY = 3.7
const BLINK_SECONDS = 0.14

export type FacePose = {
  eye: number
  mouth: number
  /** Where the eyes look, in cell units, x to screen-right and y up. */
  lookX: number
  lookY: number
  /** The whole face rises by this much: the idle hop. */
  bob: number
  /** 1 while the eyes are shut for a blink. */
  blink: number
}

/**
 * The face at `time`. `pointer` is -1..1 on both axes with y down, or null on a
 * touch screen, where the eyes glance left and right on their own.
 */
export function faceAt(time: number, pointer: { x: number; y: number } | null, out: FacePose) {
  const mood = MOODS[Math.floor(time / MOOD_SECONDS) % MOODS.length]
  out.eye = mood[0]
  out.mouth = mood[1]
  out.blink = time % BLINK_EVERY < BLINK_SECONDS ? 1 : 0
  /* Whole pixels only, so the eyes step like an LCD instead of sliding. */
  if (pointer) {
    out.lookX = Math.round(pointer.x * 1.4) * FACE_PIXEL
    out.lookY = -Math.round(pointer.y * 1.4) * FACE_PIXEL
  } else {
    out.lookX = Math.round(Math.sin(time * 0.55) * 1.3) * FACE_PIXEL
    out.lookY = 0
  }
  out.bob = Math.sin(time * 2.4) > 0.6 ? FACE_PIXEL : 0
  return out
}
