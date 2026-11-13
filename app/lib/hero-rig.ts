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
 *   camera   opening shot, whole pile, then down the streams to the hole
 *   screens  the bar screens tune in, top of the pile first
 *   colour   bars turn to wet paint on the screen just before it pours
 *   hole     the hole opens deep under the pile
 *   liquid   one track per stream: gather, hang, fall, land
 *   settle   everything comes to rest before the next section
 */

/** Bar screens in the model. The rig keeps a slot for each; unused slots cost nothing. */
export const MAX_STREAMS = 8

export type StreamRig = {
  /** Screen tune-in, 0 static to 1 locked bars. */
  tune: number
  /** Picture on the glass, 0 bars to 1 paint. */
  melt: number
  /** Leading edge of the stream along its path, 0 inside the screen to 1 in the hole. */
  head: number
  /** Size of the drop at the leading edge. Above 1 while it hangs and gathers weight. */
  swell: number
  /** How far the drop is pulled long by the fall, 0 round to 1 stretched. */
  stretch: number
  /** Thickness of the strand behind the drop, 0.3 a thread to 1 a full ribbon. */
  body: number
  /** Sideways swing of the strand. Signed: it overshoots through zero as it comes to rest. */
  sway: number
}

export type HeroRig = {
  /** Camera, opening shot to the whole pile. */
  reveal: number
  /** Camera, whole pile to the shot that also holds the hole. */
  follow: number
  /** Hole radius. Goes a little past 1 as it opens. */
  hole: number
  /** 0 while the beat plays, 1 once it has come to rest. */
  settle: number
  streams: StreamRig[]
}

const restStream = (): StreamRig => ({
  tune: 0,
  melt: 0,
  head: 0,
  swell: 0,
  stretch: 0,
  body: 0.3,
  sway: 0,
})

export function createHeroRig(): HeroRig {
  return {
    reveal: 0,
    follow: 0,
    hole: 0,
    settle: 0,
    streams: Array.from({ length: MAX_STREAMS }, restStream),
  }
}

/** The finished picture. Reduced motion shows this and nothing else. */
export function createSettledRig(): HeroRig {
  return {
    reveal: 1,
    follow: 1,
    hole: 1,
    settle: 1,
    streams: Array.from({ length: MAX_STREAMS }, () => ({
      tune: 1,
      melt: 1,
      head: 1,
      swell: 0,
      stretch: 0,
      body: 1,
      sway: 0,
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
 * Screens are numbered from the top of the pile down. They tune in in that order,
 * but they do not pour in that order: the centre set and the top set go first,
 * alone, and the rest join in a tightening run.
 */
export const POUR_ORDER = [3, 0, 1, 2, 4, 5, 6, 7] as const

/** Start of each stream after `pourStart`, by its place in POUR_ORDER. */
const POUR_STAGGER = [0, 0.045, 0.09, 0.112, 0.13, 0.144, 0.154, 0.162] as const

/**
 * The value of `head` at which a stream leaves the cabinet. Every path is laid out
 * so that this share of it is the run down the glass and over the lip, whatever
 * its length, which lets one timeline drive screens at any height in the pile.
 */
export const STREAM_LIP = 0.075
/** How far the drop creeps past the lip while it gathers. */
const HANG = 0.012

/** Times on the 0 to 1 master timeline. One table for the canvas and the DOM. */
export const HERO_BEAT = {
  /** Camera reaches the whole pile. */
  revealEnd: 0.26,
  /** Screens tune in one by one from here. */
  tuneStart: 0.17,
  tuneStep: 0.025,
  tuneLength: 0.08,
  /** First paint gathers on a screen. */
  pourStart: 0.36,
  /** Camera leaves the pile and follows the paint down. */
  followStart: 0.42,
  followEnd: 0.74,
  holeStart: 0.5,
  holeEnd: 0.62,
  /** Everything has landed; from `settleEnd` the scene holds still until the hero lets go. */
  settleStart: 0.86,
  settleEnd: 0.94,
} as const

/* One stream, start to rest: about 0.30 of the timeline until it lands, then the swing dies out. */
const EMERGE = 0.055
const GATHER = 0.03
const FALL = 0.17
const LAND = 0.045
const SWING = 0.1

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

function colourTrack(rig: HeroRig) {
  const track = gsap.timeline()
  POUR_ORDER.forEach((order, rank) => {
    /* The picture goes soft and wet just before the first paint wells up. */
    track.to(
      rig.streams[order],
      { melt: 1, duration: 0.085, ease: "sine.inOut" },
      HERO_BEAT.pourStart + POUR_STAGGER[rank] - 0.06,
    )
  })
  return track
}

function holeTrack(rig: HeroRig) {
  return gsap.timeline().to(
    rig,
    {
      hole: 1,
      duration: HERO_BEAT.holeEnd - HERO_BEAT.holeStart,
      /* A small overshoot: the rim opens a touch too wide and closes back. */
      ease: "back.out(1.5)",
    },
    HERO_BEAT.holeStart,
  )
}

/**
 * One stream. Thick paint, so nothing moves at a constant speed:
 *   emerge  wells up inside the glass and creeps to the lip, slowing as it goes
 *   gather  hangs there while the drop swells with its own weight
 *   fall    lets go and accelerates (power2.in is distance under gravity),
 *           the drop pulled long, the strand behind it a thread
 *   land    meets the hole and is dragged to a stop; the drop is swallowed
 *   after   the stretch recoils slowly, the strand swings past centre and settles,
 *           and the thread fills out into a ribbon as more paint follows
 */
function streamTrack(stream: StreamRig, start: number, rank: number) {
  /* Later streams fall a little faster: they join a flow that is already moving. */
  const fall = FALL - rank * 0.006
  const hang = start + EMERGE
  const release = hang + GATHER
  const landing = release + fall
  const landed = landing + LAND

  return gsap
    .timeline()
    .to(stream, { head: STREAM_LIP, duration: EMERGE, ease: "power1.out" }, start)
    .to(stream, { head: STREAM_LIP + HANG, duration: GATHER, ease: "sine.in" }, hang)
    .to(stream, { head: 0.94, duration: fall, ease: "power2.in" }, release)
    .to(stream, { head: 1, duration: LAND, ease: "power2.out" }, landing)

    .to(stream, { swell: 1, duration: EMERGE, ease: "sine.out" }, start)
    .to(stream, { swell: 1.3, duration: GATHER, ease: "sine.inOut" }, hang)
    .to(stream, { swell: 0.95, duration: fall * 0.6, ease: "sine.out" }, release)
    .to(stream, { swell: 0, duration: LAND + 0.02, ease: "power1.in" }, landing)

    .to(stream, { stretch: 1, duration: fall, ease: "power2.in" }, release)
    .to(stream, { stretch: 0, duration: SWING, ease: "power2.out" }, landing)

    .to(stream, { body: 1, duration: fall + LAND + 0.05, ease: "sine.inOut" }, release + fall * 0.4)

    .to(stream, { sway: 1, duration: LAND, ease: "sine.out" }, landing)
    .to(stream, { sway: 0, duration: SWING, ease: "elastic.out(1, 0.38)" }, landed)
}

function liquidTrack(rig: HeroRig) {
  const track = gsap.timeline()
  POUR_ORDER.forEach((order, rank) => {
    track.add(streamTrack(rig.streams[order], HERO_BEAT.pourStart + POUR_STAGGER[rank], rank), 0)
  })
  return track
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
    .add(colourTrack(rig), 0)
    .add(holeTrack(rig), 0)
    .add(liquidTrack(rig), 0)
    .add(settleTrack(rig), 0)
    /* Pads the timeline to one second, so progress equals time. */
    .set({}, {}, 1)
}
