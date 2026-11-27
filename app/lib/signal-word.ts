import * as THREE from "three"
import type { ResolvedShot } from "@/app/lib/shots"
import { sceneCopy } from "@/app/i18n/scene-copy"

/**
 * One mask for the hero words. ZGOMOT is the red channel, SEMNAL the green.
 * Both are drawn into the locked camera's frame, so a bar screen can sample
 * its rest position and show the patch of the word that belongs on its glass.
 * Rebuilt only when the framing changes. The canvas is browser-only.
 */

/* ZGOMOT and SEMNAL in Romanian; the page's language picks them (app/i18n/scene-copy.ts). */
/** Horizontal scale that condenses the loaded grotesque. */
const CONDENSE = 0.78
/** A little extra height so a stroke can cross the bezel between two tubes. */
const RISE = 1.05
/** Share of each glyph's advance kept between letters. Below 1 is tight tracking. */
const TRACK = 0.88
const LONG_SIDE = 1280

type Rect = { x0: number; y0: number; x1: number; y1: number }

type Band = {
  cx: number
  cy: number
  width: number
  /** Cap height, in the lock frame, so a letter fits on one tube. */
  maxDv: number
  y0: number
  y1: number
  x0: number
  x1: number
}

type Glyph = {
  ch: string
  /** Centre of the ink, in the lock camera's 0..1 frame. Y is up. */
  u: number
  v: number
  du: number
  dv: number
  index: number
}

let plate: HTMLCanvasElement | null = null
let texture: THREE.CanvasTexture | null = null

/** The shared mask. Created on the first paint, which only happens in the browser. */
export function signalTexture() {
  if (texture) return texture
  plate = document.createElement("canvas")
  texture = new THREE.CanvasTexture(plate)
  /* A mask, not a colour: the shader multiplies it by the linear paper colour. */
  texture.colorSpace = THREE.NoColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  /* Canvas row 0 is the top. Flip on upload so uv.y 1 is the top of the view. */
  texture.flipY = true
  return texture
}

/**
 * Draw both words for this framing and write the lock camera into `lockView`.
 * Returns false while the display font is still loading, so the caller retries
 * on the next frame instead of baking a fallback face.
 */
export function paintSignalWord(
  shot: ResolvedShot,
  aspect: number,
  glasses: THREE.Box3[],
  lockView: THREE.Matrix4,
  span: THREE.Vector4,
): boolean {
  const family = displayFamily()
  if (!family) return false
  const probe = `700 64px "${family}"`
  if (!document.fonts.check(probe)) {
    void document.fonts.load(probe)
    return false
  }

  const camera = new THREE.PerspectiveCamera(shot.fov, aspect, 0.1, 200)
  camera.position.copy(shot.position)
  camera.lookAt(shot.target)
  camera.updateMatrixWorld()
  camera.updateProjectionMatrix()

  const rects = glasses
    .filter((box) => !box.isEmpty())
    .map((box) => projectBox(box, camera))
    .filter((rect): rect is Rect => rect !== null)
  if (rects.length === 0) return false

  const band = densestBand(rects)
  const image = signalTexture().image as HTMLCanvasElement
  const size = textureSize(aspect)
  image.width = size.width
  image.height = size.height
  const ctx = image.getContext("2d", { willReadFrequently: true })
  if (!ctx) return false

  const semnal = placeWord(ctx, sceneCopy().lock, family, size, band, rects)
  const zgomot = placeWord(ctx, sceneCopy().flash, family, size, band, rects)
  const red = drawMask(ctx, size, family, zgomot)
  const green = drawMask(ctx, size, family, semnal)
  const packed = ctx.createImageData(size.width, size.height)
  for (let i = 0; i < packed.data.length; i += 4) {
    packed.data[i] = red.data[i]
    packed.data[i + 1] = green.data[i]
    packed.data[i + 2] = 0
    packed.data[i + 3] = 255
  }
  ctx.putImageData(packed, 0, 0)
  /* Pad keeps a stroke that just crosses a bezel. Anything past the pile stays off the wall. */
  span.set(band.x0 - 0.02, band.y0 - 0.03, band.x1 + 0.02, band.y1 + 0.03)

  const map = signalTexture()
  map.needsUpdate = true
  lockView.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
  return true
}

/** The loaded grotesque, without the fallback family next/font appends. */
function displayFamily() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--font-grotesque")
  const name = raw.split(",")[0]?.trim().replaceAll('"', "")
  return name || ""
}

/** Long side stays fixed, so a resize only changes the frame the words are fitted to. */
function textureSize(aspect: number) {
  if (aspect >= 1) {
    return { width: LONG_SIDE, height: Math.max(2, Math.round(LONG_SIDE / aspect)) }
  }
  return { width: Math.max(2, Math.round(LONG_SIDE * aspect)), height: LONG_SIDE }
}

/** Glass bounds in the lock camera's frame. Y is up, matching the shader's uv. */
function projectBox(box: THREE.Box3, camera: THREE.Camera): Rect | null {
  const corner = new THREE.Vector3()
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  let any = false
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        corner.set(x, y, z).project(camera)
        if (corner.z < -1 || corner.z > 1) continue
        const u = corner.x * 0.5 + 0.5
        const v = corner.y * 0.5 + 0.5
        x0 = Math.min(x0, u)
        x1 = Math.max(x1, u)
        y0 = Math.min(y0, v)
        y1 = Math.max(y1, v)
        any = true
      }
    }
  }
  if (!any || x1 <= x0 || y1 <= y0) return null
  return { x0, y0, x1, y1 }
}

/**
 * The middle band of the pile, wide enough to cross every tube in that band.
 * A single row is only one or two screens, which makes each letter fill a set
 * and leaves the rest of the word in the gaps.
 */
function densestBand(rects: Rect[]): Band {
  /* Specks (a drip, a sliver of glass) must not pull the line off the tubes. */
  const areas = rects.map((rect) => (rect.x1 - rect.x0) * (rect.y1 - rect.y0)).sort((a, b) => a - b)
  const median = areas[Math.floor(areas.length / 2)] ?? 0
  const glass = rects.filter((rect) => (rect.x1 - rect.x0) * (rect.y1 - rect.y0) >= median * 0.45)
  const use = glass.length > 0 ? glass : rects

  let yMin = 1
  let yMax = 0
  for (const rect of use) {
    yMin = Math.min(yMin, rect.y0)
    yMax = Math.max(yMax, rect.y1)
  }
  const height = Math.max(yMax - yMin, 0.001)
  const mid = yMin + height * 0.5
  const sized = use
    .map((rect) => ({ rect, cy: (rect.y0 + rect.y1) / 2, h: rect.y1 - rect.y0 }))
    .sort((a, b) => a.cy - b.cy)
  const gap = height * 0.12
  const clusters: { rect: Rect; cy: number; h: number }[][] = []
  for (const item of sized) {
    const cluster = clusters[clusters.length - 1]
    if (!cluster || item.cy - cluster[cluster.length - 1].cy > gap) clusters.push([item])
    else cluster.push(item)
  }
  /* The middle row of tubes, not the front row, which is simply the largest on screen. */
  let row = clusters[0]
  let best = Infinity
  for (const cluster of clusters) {
    if (cluster.length < 2) continue
    const cy = cluster.reduce((sum, item) => sum + item.cy, 0) / cluster.length
    const dist = Math.abs(cy - mid)
    if (dist < best) {
      best = dist
      row = cluster
    }
  }
  const cy = row.reduce((sum, item) => sum + item.cy, 0) / row.length
  const heights = row.map((item) => item.h).sort((a, b) => a - b)
  const rowH = heights[Math.floor(heights.length / 2)] ?? height * 0.2
  let x0 = 1
  let x1 = 0
  for (const item of row) {
    x0 = Math.min(x0, item.rect.x0)
    x1 = Math.max(x1, item.rect.x1)
  }
  return {
    cx: (x0 + x1) / 2,
    cy,
    width: (x1 - x0) * 0.96,
    maxDv: rowH * 0.92,
    y0: cy - rowH * 0.7,
    y1: cy + rowH * 0.7,
    x0,
    x1,
  }
}

/** Width of the condensed, tightly tracked line at a font size, in pixels. */
function lineWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  size: number,
  family: string,
) {
  ctx.font = `700 ${size}px "${family}"`
  let width = 0
  for (const ch of text) width += ctx.measureText(ch).width * CONDENSE * TRACK
  return width
}

/** Largest size whose line fits the glass run. */
function fitSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  target: number,
) {
  let lo = 8
  let hi = 900
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2
    if (lineWidth(ctx, text, mid, family) > target) hi = mid
    else lo = mid
  }
  return lo
}

/**
 * Lay the line on the band, then slide any letter that mostly misses the glass
 * toward the tube nearest it. The slide is small, so the line stays one word.
 */
function placeWord(
  ctx: CanvasRenderingContext2D,
  text: string,
  family: string,
  frame: { width: number; height: number },
  band: Band,
  rects: Rect[],
): { size: number; glyphs: Glyph[] } {
  const target = band.width * frame.width
  /* One tube tall, so the whole letter is on the glass instead of a slice through its middle. */
  const maxSize = (band.maxDv * frame.height) / (0.72 * RISE)
  const size = Math.min(fitSize(ctx, text, family, target), maxSize)
  ctx.font = `700 ${size}px "${family}"`
  const advances: number[] = []
  let total = 0
  for (const ch of text) {
    const advance = ctx.measureText(ch).width * CONDENSE * TRACK
    advances.push(advance)
    total += advance
  }
  let cursor = band.cx * frame.width - total / 2
  const glyphs: Glyph[] = []
  for (let i = 0; i < text.length; i++) {
    const ink = advances[i] / TRACK
    const center = cursor + ink / 2
    cursor += advances[i]
    glyphs.push({
      ch: text[i],
      u: center / frame.width,
      v: band.cy,
      du: ink / frame.width,
      dv: (size * 0.72 * RISE) / frame.height,
      index: i,
    })
  }
  for (const glyph of glyphs) {
    if (coverage(glyph, rects) >= 0.4) continue
    const glass = nearestGlass(glyph, rects)
    if (!glass) continue
    const cx = (glass.x0 + glass.x1) / 2
    const cy = (glass.y0 + glass.y1) / 2
    glyph.u += clamp((cx - glyph.u) * 0.45, -0.03, 0.03)
    glyph.v += clamp((cy - glyph.v) * 0.35, -0.02, 0.02)
  }
  return { size, glyphs }
}

/** Share of a letter's box that lands on some glass. */
function coverage(glyph: Glyph, rects: Rect[]) {
  const letter = {
    x0: glyph.u - glyph.du / 2,
    x1: glyph.u + glyph.du / 2,
    y0: glyph.v - glyph.dv / 2,
    y1: glyph.v + glyph.dv / 2,
  }
  const area = (letter.x1 - letter.x0) * (letter.y1 - letter.y0)
  if (area <= 0) return 0
  let hit = 0
  for (const rect of rects) {
    const x0 = Math.max(letter.x0, rect.x0)
    const x1 = Math.min(letter.x1, rect.x1)
    const y0 = Math.max(letter.y0, rect.y0)
    const y1 = Math.min(letter.y1, rect.y1)
    if (x1 > x0 && y1 > y0) hit += (x1 - x0) * (y1 - y0)
  }
  return hit / area
}

/** The tube whose centre is closest, preferring one on the same row as the letter. */
function nearestGlass(glyph: Glyph, rects: Rect[]) {
  let best: Rect | null = null
  let bestDist = Infinity
  const y0 = glyph.v - glyph.dv / 2
  const y1 = glyph.v + glyph.dv / 2
  for (const rect of rects) {
    const overlaps = y1 >= rect.y0 && y0 <= rect.y1
    const dx = (rect.x0 + rect.x1) / 2 - glyph.u
    const dy = (rect.y0 + rect.y1) / 2 - glyph.v
    const dist = dx * dx + dy * dy + (overlaps ? 0 : 0.2)
    if (dist < bestDist) {
      bestDist = dist
      best = rect
    }
  }
  return best
}

/**
 * White ink on a black plate, so the colour channel is the coverage.
 * A hair of offset on each letter roughens the edge without thinning the stem.
 */
function drawMask(
  ctx: CanvasRenderingContext2D,
  frame: { width: number; height: number },
  family: string,
  word: { size: number; glyphs: Glyph[] },
) {
  ctx.clearRect(0, 0, frame.width, frame.height)
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, frame.width, frame.height)
  ctx.fillStyle = "#fff"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = `700 ${word.size}px "${family}"`
  for (const glyph of word.glyphs) {
    const ink = inkOffset(glyph.index)
    ctx.save()
    ctx.translate(glyph.u * frame.width, (1 - glyph.v) * frame.height + ink.y * word.size)
    ctx.rotate(ink.rot)
    /* Canvas y grows downward. flipY on upload maps that top to the top of the view. */
    ctx.scale(CONDENSE, RISE)
    ctx.fillText(glyph.ch, 0, 0)
    ctx.fillText(glyph.ch, word.size * 0.012, word.size * 0.008)
    ctx.restore()
  }
  return ctx.getImageData(0, 0, frame.width, frame.height)
}

/** Stable per-letter wobble, small enough that the stroke still reads as the face. */
function inkOffset(index: number) {
  const n = Math.sin(index * 12.9898) * 43758.5453
  const frac = n - Math.floor(n)
  return { y: (frac - 0.5) * 0.035, rot: (frac - 0.5) * 0.05 }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
