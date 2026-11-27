"use client"

import * as THREE from "three"
import { STREAMS } from "@/app/lib/scene-store"
import { sceneCopy } from "@/app/i18n/scene-copy"

/**
 * The two-line hook that lies on the empty floor in beat 2, between the spill
 * and the service list. Every word is its own transparent plane with white
 * lettering, laid flat in world space, so the camera move carries it in perspective.
 *
 * A word arrives the way the screens tune in: three colour ghosts (the stream
 * colours) land apart and slightly turned, then lock into one white word. The
 * last word gets a stroke of the same three paints drawn under it.
 *
 * The streams timeline (app/components/streams-beat.tsx) owns all of it: it tweens
 * the plain numbers in hookRig, and the scene copies them onto the planes in the
 * same frame it draws. Scrubbing back reverses it for free.
 */
/** "Începem simplu. Construim ca să poți crește." in Romanian; the page's language picks it (app/i18n/scene-copy.ts). */
const hookLines = () => sceneCopy().hook

type HookWordSpec = { word: string; line: number; index: number }
const REST = { scale: 0.3, alpha: 0, lock: 0 }
type WordState = { line: number; index: number } & typeof REST

let builtFor: readonly string[] | null = null
let specs: HookWordSpec[] = []
let states: WordState[] = []

/** The words of the current language, built once per language. */
function hookWords() {
  const lines = hookLines()
  if (builtFor !== lines) {
    builtFor = lines
    specs = lines.flatMap((text, line) => text.split(" ").map((word, index) => ({ word, line, index })))
    states = specs.map(({ line, index }) => ({ line, index, ...REST }))
  }
  return specs
}

/** Written by GSAP, read by the scene. `lock` is 0 with the ghosts apart, 1 as one white word. */
export const hookRig = {
  get words() {
    hookWords()
    return states
  },
  /** The paint stroke under the last word, 0 to 1 from its left end. */
  rule: 0,
  /** The last word outgrows the rest: 0 at the common size, 1 fully grown. */
  grow: 0,
}

export function resetHookRig() {
  for (const word of hookRig.words) Object.assign(word, REST)
  hookRig.rule = 0
  hookRig.grow = 0
}

/** Where the hook settles in the look-down shot, as shares of the viewport. */
export const HOOK_PLACE = {
  /**
   * Height of the block's centre: 0 is the centre, -1 the bottom edge.
   * `rest` is the height it is lifted to once it has been read, on the same
   * scale. It stays there as the headline over the service story.
   */
  mobile: { at: -0.5, fill: 0.86, rest: 0.5 },
  /* Lower on a desktop: the spill's tail reaches further down the frame there. */
  desktop: { at: -0.84, fill: 0.36, rest: 0.56 },
} as const

/** Letters lie at 35 degrees to the lens, so they are drawn deeper than they are wide. */
const DEPTH_STRETCH = 1.45
const FONT_PX = 132
const PAD = 24
const LINE_PX = FONT_PX * 1.12
/** How far a ghost lands from its word, in letter heights, and which way each one goes. */
const GHOST_REACH = 0.72
const GHOST_WAY = [
  [-1, 0.35],
  [0.2, -1],
  [1, 0.5],
] as const
const RULE_PX = FONT_PX * 0.13
/** How much bigger the last word ends up. It says "grow", so it does. */
const GROW = 0.24

type HookWord = {
  mesh: THREE.Mesh
  material: THREE.MeshBasicMaterial
  ghosts: { mesh: THREE.Mesh; material: THREE.MeshBasicMaterial }[]
  /** Canvas size and centre, in canvas pixels from the middle of its line. */
  w: number
  h: number
  x: number
  line: number
  /** Which way the word is turned before it locks. */
  turn: number
  /** Laid-out centre and size in the group, world units. */
  cx: number
  cy: number
  sx: number
  sy: number
}

const words: HookWord[] = []
let rule: { mesh: THREE.Mesh; material: THREE.MeshBasicMaterial } | null = null
/** World units per canvas pixel, set by the layout. */
let unit = 1
let widestPx = 1
export const hookGroup = new THREE.Group()
hookGroup.visible = false
let painted = false

function plane(map: THREE.Texture, color: string, order: number) {
  const material = new THREE.MeshBasicMaterial({
    map,
    color,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    toneMapped: false,
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)
  mesh.renderOrder = order
  mesh.visible = false
  hookGroup.add(mesh)
  return { mesh, material }
}

/**
 * Draws every word once, as soon as the display font is there. Returns false
 * until then, so the scene can retry on the next frame.
 */
export function paintFloorHook(): boolean {
  if (painted) return true
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--font-grotesque")
  const family = raw.split(",")[0]?.trim().replaceAll('"', "")
  if (!family) return false
  const font = `700 ${FONT_PX}px "${family}"`
  /* The check is made with the real text, so the Romanian subset is loaded before the draw. */
  const lines = hookLines()
  if (!document.fonts.check(font, lines.join(""))) {
    void document.fonts.load(font, lines.join(""))
    return false
  }

  const measure = document.createElement("canvas").getContext("2d")
  if (!measure) return false
  measure.font = font
  const linePx = lines.map((text) => measure.measureText(text).width)
  widestPx = Math.max(...linePx)

  for (const { word, line, index } of hookWords()) {
    const text = lines[line]
    const before = text.split(" ").slice(0, index).join(" ")
    /* Measured with the gap, so the words sit where the whole line would put them. */
    const start = index === 0 ? 0 : measure.measureText(`${before} `).width
    const wordPx = measure.measureText(word).width

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return false
    canvas.width = Math.ceil(wordPx) + PAD * 2
    canvas.height = Math.ceil(FONT_PX * 1.3) + PAD * 2
    ctx.font = font
    ctx.fillStyle = "#fff"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(word, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    /* Ghosts first, so the white word always draws over them. */
    const ghosts = STREAMS.map((stream) => plane(texture, stream.color, 19))
    words.push({
      ...plane(texture, "#ffffff", 20),
      ghosts,
      w: canvas.width,
      h: canvas.height,
      x: start + wordPx / 2 - linePx[line] / 2,
      line,
      turn: (line + index) % 2 === 0 ? -1 : 1,
      cx: 0,
      cy: 0,
      sx: 1,
      sy: 1,
    })
  }

  /* The stroke under the last word: the three paints, side by side with soft joins. */
  const strip = document.createElement("canvas")
  strip.width = 256
  strip.height = 8
  const paint = strip.getContext("2d")
  if (!paint) return false
  const blend = paint.createLinearGradient(0, 0, strip.width, 0)
  STREAMS.forEach((stream, index) => {
    blend.addColorStop(index / STREAMS.length + 0.04, stream.color)
    blend.addColorStop((index + 1) / STREAMS.length - 0.04, stream.color)
  })
  paint.fillStyle = blend
  paint.fillRect(0, 0, strip.width, strip.height)
  const stripTexture = new THREE.CanvasTexture(strip)
  stripTexture.colorSpace = THREE.SRGBColorSpace
  rule = plane(stripTexture, "#ffffff", 20)

  painted = true
  return true
}

const forward = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3()
const away = new THREE.Vector3()
const ray = new THREE.Vector3()
const basis = new THREE.Matrix4()
const UP = new THREE.Vector3(0, 1, 0)

/**
 * Lays the hook on the floor where the look-down shot sees it. The block is as
 * wide as `fill` of the viewport at that depth, reads left to right along the
 * camera's right, and its tops point away from the lens.
 */
export function placeFloorHook(
  shot: { position: THREE.Vector3; target: THREE.Vector3; fov: number },
  aspect: number,
  floorY: number,
  layout: "mobile" | "desktop",
) {
  if (!painted) return
  const place = HOOK_PLACE[layout]
  const tanV = Math.tan(THREE.MathUtils.degToRad(shot.fov) / 2)
  forward.subVectors(shot.target, shot.position).normalize()
  right.crossVectors(forward, UP).normalize()
  up.crossVectors(right, forward)
  ray.copy(forward).addScaledVector(up, place.at * tanV)
  /* A level or rising ray never meets the floor. */
  if (ray.y >= -1e-4) return
  const depth = (floorY - shot.position.y) / ray.y
  away.set(forward.x, 0, forward.z).normalize()

  hookGroup.position.copy(shot.position).addScaledVector(ray, depth)
  hookGroup.position.y = floorY + 0.03
  basis.makeBasis(right, away, UP)
  hookGroup.quaternion.setFromRotationMatrix(basis)

  /* One letter size for both lines: the longer one sets it. */
  unit = (place.fill * 2 * depth * tanV * aspect) / widestPx
  for (const word of words) {
    word.cx = word.x * unit
    /* First line further from the lens, so it reads on top. */
    word.cy = (0.5 - word.line) * LINE_PX * unit * DEPTH_STRETCH
    word.sx = word.w * unit
    word.sy = word.h * unit * DEPTH_STRETCH
  }
}

/**
 * The last camera position of beat 2: the look-down shot, pitched further down
 * from the same spot, by exactly the angle that lifts the hook from `at` to
 * `rest`. The camera does not travel, so nothing on the floor shifts against
 * anything else: the spill stays above the line, and the line keeps its shape.
 * It lands at the same height on every aspect ratio, so the service story can
 * be laid out under it.
 */
export function hookRestShot(
  shot: { position: THREE.Vector3; target: THREE.Vector3; fov: number },
  layout: "mobile" | "desktop",
) {
  const place = HOOK_PLACE[layout]
  const tanV = Math.tan(THREE.MathUtils.degToRad(shot.fov) / 2)
  const pitch = Math.atan(place.rest * tanV) - Math.atan(place.at * tanV)
  forward.subVectors(shot.target, shot.position).normalize()
  right.crossVectors(forward, UP).normalize()
  up.crossVectors(right, forward)
  const reach = shot.position.distanceTo(shot.target)
  return {
    position: shot.position.clone(),
    target: shot.position
      .clone()
      .addScaledVector(forward, Math.cos(pitch) * reach)
      .addScaledVector(up, -Math.sin(pitch) * reach),
    fov: shot.fov,
  }
}

/** Copies the scrubbed pop onto the planes. `shown` is 0 when another beat owns the scene. */
export function updateFloorHook(shown: number) {
  let any = false
  const reach = FONT_PX * unit * GHOST_REACH
  words.forEach((word, index) => {
    const state = hookRig.words[index]
    const alpha = Math.min(1, Math.max(0, state.alpha)) * shown
    /* Not clamped: the lock overshoots, so the ghosts swing through the word before they settle. */
    const apart = 1 - state.lock
    const turn = word.turn * apart * 0.2
    /* The last word grows from its left end and its baseline, so it pushes up and out, not into its neighbour. */
    const grown = index === words.length - 1 ? 1 + GROW * hookRig.grow * shown : 1
    const px = word.cx + ((grown - 1) * (word.w - PAD * 2) * unit) / 2
    const py = word.cy + (grown - 1) * FONT_PX * 0.3 * unit * DEPTH_STRETCH

    word.material.opacity = alpha
    word.mesh.visible = alpha > 0.001
    word.mesh.position.set(px, py, 0)
    word.mesh.rotation.z = turn
    word.mesh.scale.set(word.sx * state.scale * grown, word.sy * state.scale * grown, 1)
    any ||= word.mesh.visible

    word.ghosts.forEach((ghost, way) => {
      /* Hidden once the word has locked: three colours under white would only fringe it. */
      const ghostAlpha = alpha * Math.min(1, Math.abs(apart) * 3) * 0.9
      ghost.material.opacity = ghostAlpha
      ghost.mesh.visible = ghostAlpha > 0.001
      ghost.mesh.position.set(
        px + GHOST_WAY[way][0] * reach * apart,
        py + GHOST_WAY[way][1] * reach * apart * DEPTH_STRETCH,
        0,
      )
      ghost.mesh.rotation.z = turn * (1 + way * 0.6)
      ghost.mesh.scale.copy(word.mesh.scale)
    })
  })

  const last = words[words.length - 1]
  if (rule && last) {
    const drawn = Math.min(1, Math.max(0, hookRig.rule)) * shown
    const base = (last.w - PAD * 2) * unit
    /* The stroke runs the length of the grown word. */
    const width = base * (1 + GROW * hookRig.grow)
    rule.material.opacity = drawn > 0 ? 1 : 0
    rule.mesh.visible = drawn > 0.001
    /* Grows from its left end, like a stroke being pulled. */
    rule.mesh.position.set(
      last.cx - base / 2 + (width * drawn) / 2,
      last.cy - FONT_PX * 0.56 * unit * DEPTH_STRETCH,
      0,
    )
    rule.mesh.scale.set(Math.max(width * drawn, 1e-4), RULE_PX * unit * DEPTH_STRETCH, 1)
    any ||= rule.mesh.visible
  }
  hookGroup.visible = any
}
