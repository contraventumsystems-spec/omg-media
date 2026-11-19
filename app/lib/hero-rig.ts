import gsap from "gsap"

/**
 * The hero beat as one GSAP master timeline, one second long, scrubbed by scroll.
 *
 * The timeline does not touch the DOM or three.js. It tweens the plain numbers in
 * `heroRig`, and the canvas reads them inside useFrame. Every value is a pure
 * function of the timeline's time, so scrubbing backwards replays the same frames
 * in reverse: nothing is integrated, nothing can go stale.
 *
 * Tracks, each its own nested timeline:
 *   camera   opening shot, whole pile, then down to the lower shot
 *   screens  the bar screens tune in, top of the pile first
 *   burst    the pile flies apart, hangs in space, then comes back together
 *   veil     the floor pool fades out for that flight, and the signal bars take its place;
 *            as the sets land the bars widen until they fill the frame
 *   settle   everything comes to rest before the next section
 */

/** Bar screens in the model. The rig keeps a slot for each; unused slots cost nothing. */
export const MAX_STREAMS = 8

export type StreamRig = {
  /** Screen tune-in, 0 static to 1 locked bars. */
  tune: number
}

export type HeroRig = {
  /** Camera, opening shot to the whole pile. */
  reveal: number
  /** Camera, whole pile to the lower shot. */
  follow: number
  /**
   * Linear progress through the burst: 0 before the pile lets go, 1 once it is
   * back together. burstAmount() turns it into how far apart the sets are.
   */
  burst: number
  /**
   * Floor pool. 1 while the pile is together, 0 while the sets are in the air,
   * 1 again once they have landed.
   */
  puddle: number
  /** Signal bars that stand in for the pool. 0 outside the burst, 1 while it hangs. */
  stroke: number
  /** The bars leave their sets and widen into seven full-height bars. 0 tied to the sets, 1 the frame is covered. */
  wipe: number
  /** 0 while the beat plays, 1 once it has come to rest. */
  settle: number
  streams: StreamRig[]
}

const restStream = (): StreamRig => ({
  tune: 0,
})

export function createHeroRig(): HeroRig {
  return {
    reveal: 0,
    follow: 0,
    burst: 0,
    puddle: 1,
    stroke: 0,
    wipe: 0,
    settle: 0,
    streams: Array.from({ length: MAX_STREAMS }, restStream),
  }
}

/** The finished picture. Reduced motion shows locked bars and nothing else. */
export function createSettledRig(): HeroRig {
  return {
    reveal: 1,
    follow: 1,
    burst: 1,
    puddle: 1,
    stroke: 0,
    wipe: 0,
    settle: 1,
    streams: Array.from({ length: MAX_STREAMS }, () => ({
      tune: 1,
    })),
  }
}

/** Written by the master timeline, read by the canvas. Never held in React state. */
export const heroRig = createHeroRig()

export function resetHeroRig() {
  const rest = createHeroRig()
  Object.assign(heroRig, rest, { streams: heroRig.streams })
  heroRig.streams.forEach((stream, index) => Object.assign(stream, rest.streams[index]))
}

/**
 * Times on the 0 to 1 master timeline. One table for the canvas and the DOM.
 * The hold (lockStart to burstStart) is extra scroll. Markers that used to sit
 * at or after the old burst (0.46) are shifted so the fly-out, return, follow
 * and settle still last the same distance on the page.
 */
export const HERO_BEAT = {
  /** Camera reaches the whole pile. */
  revealEnd: 0.26,
  /** Screens tune in one by one from here. */
  tuneStart: 0.17,
  tuneStep: 0.025,
  tuneLength: 0.08,
  /** SEMNAL is locked and the frame is held from here until the burst. */
  lockStart: 0.42,
  /** The readout's Formă stage. It arrives with the burst. */
  pourStart: 0.54,
  /** The pile flies apart from here and is whole again at `burstEnd`. */
  burstStart: 0.54,
  burstEnd: 0.949,
  /** Camera leaves the pile and moves down to the lower shot, while the sets come back. */
  followStart: 0.813,
  followEnd: 0.949,
  holeStart: 0.574,
  holeEnd: 0.676,
  /** Everything has landed; from `settleEnd` the scene holds still until the hero lets go. */
  settleStart: 0.881,
  settleEnd: 0.949,
  /**
   * The signal bars widen from `wipeStart` and cover the frame at `wipeEnd`, where
   * the channel change takes over and cuts to the services. At `wipeClear`, which
   * a scroll never shows, they are put away so the later beats get a clean canvas.
   */
  wipeStart: 0.875,
  wipeEnd: 0.94,
  wipeClear: 0.985,
} as const

/** Shares of the burst spent flying out and coming back. The sets hang in space in between. */
export const BURST = {
  out: 0.25,
  back: 0.3,
} as const

/** How far apart the sets are, 0 stacked to 1 fully apart, for a burst progress of 0 to 1. */
export function burstAmount(progress: number) {
  const out = progress / BURST.out
  const back = (1 - progress) / BURST.back
  return Math.min(1, Math.max(0, Math.min(out, back)))
}

/** Smoothstep on 0..1, clamped. Shared by the word envelopes so a scrub reverses cleanly. */
function smooth01(edge0: number, edge1: number, value: number) {
  const span = edge1 - edge0
  const t = Math.min(1, Math.max(0, span === 0 ? 0 : (value - edge0) / span))
  return t * t * (3 - 2 * t)
}

/**
 * ZGOMOT, once the pile fills the frame. The peak stays partial and the amount
 * is gone again before the lock, so the word never sits still.
 */
export function zgomotAmount(progress: number) {
  const rise = smooth01(HERO_BEAT.revealEnd, 0.3, progress)
  const fall = 1 - smooth01(0.34, HERO_BEAT.lockStart, progress)
  return rise * fall * 0.55
}

/** Horizontal tear on the word: full through the flash, zero once SEMNAL has locked. */
export function tearAmount(progress: number) {
  return 1 - smooth01(0.4, 0.46, progress)
}

/**
 * SEMNAL on the glass. It locks across the hold, stays while the sets fly and
 * hang, then fades across the return so the pile lands on the bars.
 * `burst` is the timeline's linear burst progress, 0 before the sets let go.
 */
export function semnalAmount(progress: number, burst: number) {
  const lock = smooth01(0.4, 0.46, progress)
  const returning = smooth01(1 - BURST.back, 1, burst)
  return lock * (1 - returning)
}

/**
 * The faint copy in the gaps. It is up for the lock and gone as soon as the
 * sets separate. Once the burst is underway it stays off, including when the
 * pile lands and `apart` returns to 0. `burst` is the linear burst progress.
 */
export function ghostAmount(progress: number, apart: number, burst: number) {
  const lock = smooth01(0.4, 0.46, progress)
  const fading = 1 - smooth01(0, 0.08, apart)
  const stillThere = 1 - smooth01(0.02, 0.12, burst)
  return lock * fading * stillThere
}

function cameraTrack(rig: HeroRig) {
  return gsap
    .timeline()
    .to(rig, { reveal: 1, duration: HERO_BEAT.revealEnd, ease: "power2.inOut" }, 0)
    .to(
      rig,
      {
        follow: 1,
        duration: HERO_BEAT.followEnd - HERO_BEAT.followStart,
        ease: "sine.inOut",
      },
      HERO_BEAT.followStart,
    )
}

function screenTrack(rig: HeroRig) {
  const track = gsap.timeline()
  rig.streams.forEach((stream, order) => {
    track.to(
      stream,
      { tune: 1, duration: HERO_BEAT.tuneLength, ease: "none" },
      HERO_BEAT.tuneStart + order * HERO_BEAT.tuneStep,
    )
  })
  return track
}

/** One linear tween, so the burst is a pure function of the scroll in both directions. */
function burstTrack(rig: HeroRig) {
  return gsap.timeline().to(
    rig,
    {
      burst: 1,
      duration: HERO_BEAT.burstEnd - HERO_BEAT.burstStart,
      ease: "none",
    },
    HERO_BEAT.burstStart,
  )
}

/**
 * Crossfade on the burst window. The pool is gone once the sets have lifted and
 * back once they have landed; the bars fill the gap, then widen over the landing
 * and stay until `wipeClear`. `immediateRender` stays off so the return tweens
 * do not paint their start values at time zero.
 */
function veilTrack(rig: HeroRig) {
  const span = HERO_BEAT.burstEnd - HERO_BEAT.burstStart
  const fade = span * 0.12
  const ease = "sine.inOut"
  return gsap
    .timeline()
    .fromTo(
      rig,
      { puddle: 1 },
      { puddle: 0, duration: fade, ease, immediateRender: false },
      HERO_BEAT.burstStart,
    )
    .fromTo(
      rig,
      { stroke: 0 },
      { stroke: 1, duration: fade, ease, immediateRender: false },
      HERO_BEAT.burstStart,
    )
    .fromTo(
      rig,
      { puddle: 0 },
      { puddle: 1, duration: fade, ease, immediateRender: false },
      HERO_BEAT.burstEnd - fade,
    )
    .fromTo(
      rig,
      { wipe: 0 },
      {
        wipe: 1,
        duration: HERO_BEAT.wipeEnd - HERO_BEAT.wipeStart,
        ease: "none",
        immediateRender: false,
      },
      HERO_BEAT.wipeStart,
    )
    .fromTo(
      rig,
      { stroke: 1 },
      { stroke: 0, duration: 0.005, ease: "none", immediateRender: false },
      HERO_BEAT.wipeClear,
    )
    .fromTo(
      rig,
      { wipe: 1 },
      { wipe: 0, duration: 0.005, ease: "none", immediateRender: false },
      HERO_BEAT.wipeClear,
    )
}

function settleTrack(rig: HeroRig) {
  return gsap.timeline().to(
    rig,
    {
      settle: 1,
      duration: HERO_BEAT.settleEnd - HERO_BEAT.settleStart,
      ease: "sine.out",
    },
    HERO_BEAT.settleStart,
  )
}

/** Paused master timeline, exactly one second long. ScrollTrigger owns its playhead. */
export function buildHeroTimeline(rig: HeroRig = heroRig) {
  return gsap
    .timeline({ paused: true, defaults: { overwrite: false } })
    .add(cameraTrack(rig), 0)
    .add(screenTrack(rig), 0)
    .add(burstTrack(rig), 0)
    .add(veilTrack(rig), 0)
    .add(settleTrack(rig), 0)
    /* Pads the timeline to one second, so progress equals time. */
    .set({}, {}, 1)
}
