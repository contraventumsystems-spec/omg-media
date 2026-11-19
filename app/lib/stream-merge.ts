/**
 * "Trei direcții, un singur flux", played by the sets themselves.
 *
 * It runs inside the pause after the push (PRESENT_SPAN on the streams
 * timeline), on top of the gather in app/lib/stream-present.ts:
 *
 *   3 to 30%    every set but the three sources switches off, the far ones
 *               first: the picture folds to a bright line, the line to a dot.
 *   36 to 65%   the three wind up, then spiral into one point and shrink.
 *   65%         impact. The three are gone and one set stands in their place.
 *               Its tube tunes from static to the full seven bars.
 *   90% on      that set comes down to its own seat, a step ahead of the camera's
 *               tilt, and the pool pours out from under it: the one river.
 *
 * The pool draws back under the pile while the sets switch off, so the three
 * hang over a bare floor, and it is whole again before the floor line is read.
 *
 * The single set is a television of the pile, the front one of the bottom row,
 * so nothing is added to the model. It stays alone through the floor line and
 * the service story. The whole pile is back when beat 3 takes the camera,
 * behind the story's solid cover.
 *
 * GSAP writes the plain numbers. The canvas reads them in the frame it draws,
 * so a fast swipe and a reverse scrub land on the same picture.
 */

/** Shares of the pause. */
export const MERGE = {
  clearStart: 0.03,
  clearEnd: 0.3,
  rushStart: 0.36,
  impact: 0.65,
  /** The one set starts down here, just before the tilt. */
  landStart: 0.9,
  /** Timeline units the way down takes. It ends about halfway through the tilt. */
  landSpan: 0.27,
  /** The pool starts back out this long before touchdown, and takes this long to cover the floor. */
  pourLead: 0.05,
  pourSpan: 0.13,
} as const

/** Share of the switch-off the last set waits before it starts its own. */
export const CLEAR_STAGGER = 0.6

/** How much of the framed view the one set may take at the meeting point. */
export const MERGE_FILL = {
  mobile: { width: 0.6, height: 0.4 },
  desktop: { width: 0.4, height: 0.44 },
} as const

/** The meeting point, as an offset from the push shot's look-at point: towards the lens, and up. */
export const MERGE_POINT = { forward: 1.6, lift: 0.3 } as const

export type MergeState = {
  /** 0 with the pile whole, 1 with every other set switched off. */
  clear: number
  /** 0 at the gathered pose, 1 at the meeting point. Dips below 0 for the wind-up. */
  converge: number
  /** The one set: 0 hidden, 1 at full size. Overshoots as it lands the hit. */
  single: number
  /** Its tube: 0 static, 1 locked bars. */
  tune: number
  /** The hit itself, up and back to 0: a flash on the glass and a small kick of the camera. */
  shock: number
  /** 0 at the meeting point, 1 on its seat in the pile. */
  land: number
  /** The pool pouring back out from under the landed set, 0 to 1. */
  pour: number
}

const rest = (): MergeState => ({
  clear: 0,
  converge: 0,
  single: 0,
  tune: 0,
  shock: 0,
  land: 0,
  pour: 0,
})

/** Written by the streams timeline, read by the canvas. */
export const mergeRig: MergeState = rest()

/** What the canvas reads when another beat owns the scene: the whole pile. */
export const MERGE_REST: Readonly<MergeState> = rest()

export function resetMergeRig() {
  Object.assign(mergeRig, rest())
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

/**
 * How much of the pool lies on the floor: 1 is all of it, 0 none. It draws back
 * under the pile as the sets switch off, since a spill with no set above it
 * reads as a leftover, and pours out again from under the one set that lands.
 */
export function poolAmount(state: Readonly<MergeState>) {
  const back = clamp01(state.clear / 0.7)
  return Math.max(1 - back * back * (3 - 2 * back), clamp01(state.pour))
}

/** 0 while the three sources are on screen, 1 once the hit has taken them. */
export function trioGone(state: Readonly<MergeState>) {
  const out = clamp01((state.converge - 0.9) / 0.1)
  return out * out * (3 - 2 * out)
}
