"use client"

import { create } from "zustand"

/**
 * The one link between the page and the canvas.
 * ScrollTrigger writes the beat progress here and scrubs the hero timeline in
 * app/lib/hero-rig.ts; the scene reads both inside useFrame through getState(),
 * so scrolling never pushes React state through the mesh tree.
 * Mobile is the aspect ratio under 0.8, matching the shot list.
 */
type SceneState = {
  mobile: boolean
  /** Hero beat, 0 at the top of the page and 1 when the hero lets go. Drives the readout only. */
  progress: number
  /**
   * The free part of the first viewport on a phone, between the hero copy and the
   * scroll hint, as shares of the canvas height. The opening shot fits the whole
   * pile into it. Null until the copy has been measured.
   */
  heroFrame: { top: number; bottom: number } | null
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
  /** DOM icons drawn on the three stream screens. The scene fits them to the glass every frame. */
  icons: (HTMLElement | null)[]
  /** A 3D beat is on screen and the tab is visible, so the canvas may draw. */
  active: boolean
  /** prefers-reduced-motion: one still frame of the finished pile, no scrubbing. */
  reduced: boolean
  /** Weak device or low frame rate: DPR 1, no halftone, no idle motion in the paint. */
  lite: boolean
  /** The model has been drawn at least once. */
  ready: boolean
  /** Pointer offset from the viewport centre, -1 to 1. Desktop parallax only. */
  pointer: { x: number; y: number }
}

export const useSceneStore = create<SceneState>(() => ({
  mobile: true,
  progress: 0,
  heroFrame: null,
  stream: 0,
  work: 0,
  stage: "main",
  chips: [],
  icons: [],
  active: true,
  reduced: false,
  lite: false,
  ready: false,
  pointer: { x: 0, y: 0 },
}))

/**
 * Beat 2 ranges. Push in on the three screens, tilt down to the pool,
 * then lift the floor line to the top, where the service story continues it.
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
  { id: "strategie", order: 1, color: "#1EC8EB" },
  { id: "design", order: 3, color: "#EE44C6" },
  { id: "tehnologie", order: 2, color: "#27D24C" },
] as const

/** Pixel box of a stream photo before the scene scales it onto the glass. 1168×784. */
export const STREAM_ICON_BOX = { width: 146, height: 98 } as const

/**
 * Beat 3 ranges, on a progress that starts when the work section's top reaches
 * the bottom of the viewport. The section sticks at about 0.42.
 */
export const WORK_BEAT = {
  /** Camera pushes into the centre screen between these two. */
  pushStart: 0.2,
  pushEnd: 0.62,
  /** The centre screen's bars fill the frame: the cut to "Pentru cine" fires here (channel-change.tsx). */
  cover: 0.66,
} as const

/** The screen the camera pushes into: the centre set, by its tune-in order. */
export const WORK_SCREEN_ORDER = 3
