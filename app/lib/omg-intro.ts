/**
 * The load sequence of the resting pile. O, M and G turn from static to colour
 * bars one after the other, each spills paint over its lip as it locks, and the
 * pool then spreads across the floor from under the pile.
 *
 * Every value is a pure function of the seconds since the pile was first drawn,
 * so the sequence plays once and then holds at 1.
 */

/** Row of the pile that spells the name, counted from the top, and its three tubes. */
export const OMG_ROW = 2
export const OMG_COUNT = 3

/** Seconds. The first tube waits for the page to settle; the others follow it. */
const FIRST = 0.7
const STEP = 0.4
const TUNE = 0.55
/** A tube spills once its bars have nearly locked. */
const SPILL_AFTER = 0.4
const SPILL = 1.1
const POOL_AT = FIRST + SPILL_AFTER + 0.5
const POOL = 2.4

export type OmgIntro = {
  /** Tune-in of O, M and G: 0 static, 1 locked bars. */
  on: [number, number, number]
  /** How far the paint has run down from each lip, 0 to 1. */
  drip: [number, number, number]
  /** How far the pool has spread, 0 to 1. */
  pool: number
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const easeOut = (value: number) => 1 - (1 - value) ** 3

const state: OmgIntro = { on: [0, 0, 0], drip: [0, 0, 0], pool: 0 }

/**
 * The sequence at `seconds` after the first draw. Pass Infinity for the finished
 * picture. Returns one shared object: read it, do not keep it.
 */
export function omgIntro(seconds: number): OmgIntro {
  for (let i = 0; i < OMG_COUNT; i++) {
    const start = FIRST + i * STEP
    state.on[i] = clamp01((seconds - start) / TUNE)
    state.drip[i] = easeOut(clamp01((seconds - start - SPILL_AFTER) / SPILL))
  }
  state.pool = easeOut(clamp01((seconds - POOL_AT) / POOL))
  return state
}
