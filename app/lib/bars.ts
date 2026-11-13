/**
 * Seven bars sampled from the original stripe texture, left to right.
 * Same values as the --bar-* tokens in globals.css. Kept free of three.js
 * so DOM components can import it without pulling the 3D chunk.
 */
export const BAR_HEX = [
  "#F6EFDD",
  "#FFD21F",
  "#1EC8EB",
  "#27D24C",
  "#EE44C6",
  "#F23A22",
  "#7A45FF",
] as const

/** --background. The canvas clears to it, so the 3D layer has no visible edge. */
export const PAGE_HEX = "#15110D"

/** --eggshell. Screen static and the hole's rim are drawn in it. */
export const PAPER_HEX = "#F3E9D2"

/** Warm grey of the halftone spotlights, the only mid-tone on the page. */
export const HALFTONE_HEX = "#3B332A"

/**
 * The paint that pours out of the screens, in the order it cycles along a stream:
 * yellow, cyan, blue, green, magenta, red, purple. It is the bar sequence with the
 * white bar swapped for blue, so a screen can turn from bars to paint in place.
 */
export const LIQUID_HEX = [
  "#FFD21F",
  "#1EC8EB",
  "#2A5BFF",
  "#27D24C",
  "#EE44C6",
  "#F23A22",
  "#7A45FF",
] as const
