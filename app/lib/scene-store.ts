"use client"

import { create } from "zustand"

/**
 * The one link between the page and the canvas.
 * ScrollTrigger writes `progress`; the scene reads it inside useFrame through
 * getState(), so scrolling never pushes React state through the mesh tree.
 * Mobile is the aspect ratio under 0.8, matching the shot list.
 */
type SceneState = {
  mobile: boolean
  /** Hero beat, 0 at the top of the page and 1 when the pool is full. */
  progress: number
  /** Beat 2, three streams: 0 as the services arrive, 1 when the list covers the river. */
  stream: number
  /** Beat 3, push-in: 0 as the work section enters from below, 1 when its stage lets go. */
  work: number
  /**
   * Which beat owns the camera. The switch happens while the opaque service
   * list fills the viewport, so the cut between the two poses is never seen.
   */
  stage: "main" | "work"
  /** DOM labels for the three streams. The scene moves them to their screens every frame. */
  chips: (HTMLElement | null)[]
  /** A 3D beat is on screen and the tab is visible, so the canvas may draw. */
  active: boolean
  /** prefers-reduced-motion: one still frame of the finished pile, no scrubbing. */
  reduced: boolean
  /** Weak device or low frame rate: DPR 1, no halftone, no pool sheen. */
  lite: boolean
  /** The model has been drawn at least once. */
  ready: boolean
  /** Pointer offset from the viewport centre, -1 to 1. Desktop parallax only. */
  pointer: { x: number; y: number }
}

export const useSceneStore = create<SceneState>(() => ({
  mobile: true,
  progress: 0,
  stream: 0,
  work: 0,
  stage: "main",
  chips: [],
  active: true,
  reduced: false,
  lite: false,
  ready: false,
  pointer: { x: 0, y: 0 },
}))

/**
 * Hero beat ranges on the 0 to 1 progress. One table for the canvas and the DOM,
 * so the camera, the screens and the labels cannot drift apart.
 */
export const HERO_BEAT = {
  /** Camera moves from SHOT_0 to SHOT_1. */
  revealEnd: 0.35,
  /** Copy is at 40% opacity here and gone at `copyGone`. */
  copyGone: 0.45,
  /** Bar screens tune in one by one from here, top of the pile first. */
  tuneStart: 0.35,
  tuneStep: 0.055,
  tuneLength: 0.1,
  /** The melt grows out of the bar screens and fills the pool. */
  growStart: 0.68,
  growEnd: 0.97,
} as const

/**
 * Beat 2 ranges. Push in on the three screens, tilt down to the pool,
 * then slide the river into the top third while the service list comes up.
 */
export const STREAM_BEAT = {
  pushEnd: 0.3,
  tiltEnd: 0.7,
  /** Labels and heading leave before the list arrives. */
  chipsGone: 0.6,
  headingGone: 0.66,
} as const

/**
 * The three streams, left to right on screen. `order` is the screen's place in
 * the hero tune-in cascade (0 is the top set), which is how the scene finds it.
 */
export const STREAMS = [
  { id: "strategie", order: 1, color: "#0FD3FD" },
  { id: "design", order: 3, color: "#E52CFC" },
  { id: "tehnologie", order: 2, color: "#00E100" },
] as const

/**
 * Beat 3 ranges, on a progress that starts when the work section's top reaches
 * the bottom of the viewport. The section sticks at about 0.42.
 */
export const WORK_BEAT = {
  /** Camera pushes into the centre screen between these two. */
  pushStart: 0.2,
  pushEnd: 0.62,
  /** The DOM carousel takes over from the canvas here, behind a channel change. */
  cover: 0.66,
} as const

/** The screen the camera pushes into: the centre set, by its tune-in order. */
export const WORK_SCREEN_ORDER = 3
