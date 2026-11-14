import * as THREE from "three"

/**
 * The letters the pile shows while the page rests at the top, before any scroll.
 * One glyph per tube, read row by row from the top of the pile:
 *
 *        [ face ]              eyes and a mouth, see app/lib/tv-face.ts
 *    [ Z ] [ I ] (static)      "zi OMG": say OMG
 *    [ O ] [ M ] [ G ]
 *  [ I ] [ D ] [ E ] [ I ]     the bottom row cycles through WORDS
 *
 * The glyphs live in one atlas, a grid of square cells, white ink on black.
 * A screen holds the index of its cell and samples it over its own glass.
 */

/** The bottom row. Every word has one letter per tube of that row. */
export const WORDS = ["IDEI", "SITE", "LOGO", "FILM"] as const
/** Seconds a word stays up before the row changes channel. */
export const WORD_SECONDS = 3.4

const ARC = "arc"
const GLYPHS = [ARC, ..."OMGIDESTLFZ"] as const
/** Cells per side of the atlas. The shader divides by the same number. */
export const ATLAS_GRID = 4
const CELL = 192

/** Glyph of each tube in a row, top row first. Null rows keep their static. */
/* The second row has three tubes, but the pile hides the third: it gets no letter and keeps its static. */
const ROWS: (readonly string[] | null)[] = [[ARC], ["Z", "I"], ["O", "M", "G"], [...WORDS[0]]]
/** Index into ROWS of the row that cycles. */
const WORD_ROW = 3

export function glyphIndex(glyph: string) {
  return (GLYPHS as readonly string[]).indexOf(glyph)
}

/** Atlas cell for the tube at `column` of `row`, or -1 for a tube with no letter. */
export function restGlyph(row: number, column: number) {
  const glyph = ROWS[row]?.[column]
  return glyph === undefined ? -1 : glyphIndex(glyph)
}

/**
 * Whether this tube shows the pet face of app/lib/tv-face.ts: the top of the
 * pile. Its ROWS entry stays, so the tube counts as lettered and fades with the
 * rest; the shader draws the face in place of that glyph.
 */
export function isFaceTube(row: number, column: number) {
  return row === 0 && column === 0
}

/** Whether `row` is the one that cycles through WORDS. */
export function isWordRow(row: number) {
  return row === WORD_ROW
}

/**
 * What a tube of the cycling row shows at `time`. Each tube changes a moment
 * after the one on its left, and `flick` is 1 for the instant of the change,
 * when the tube shows static instead of a letter.
 */
export function wordGlyph(column: number, time: number) {
  const turn = time / WORD_SECONDS - column * 0.03
  const phase = turn - Math.floor(turn)
  const word = WORDS[((Math.floor(turn) % WORDS.length) + WORDS.length) % WORDS.length]
  const flick = phase < 0.045 ? 1 : phase < 0.075 ? 1 - (phase - 0.045) / 0.03 : 0
  return { glyph: glyphIndex(word[column] ?? ""), flick }
}

let texture: THREE.CanvasTexture | null = null
let painted = false

/** The atlas. Black until paintRestLetters() succeeds; created in the browser only. */
export function restLetterTexture() {
  if (texture) return texture
  const plate = document.createElement("canvas")
  plate.width = CELL * ATLAS_GRID
  plate.height = CELL * ATLAS_GRID
  texture = new THREE.CanvasTexture(plate)
  /* A mask, not a colour: the shader multiplies it by the linear paper colour. */
  texture.colorSpace = THREE.NoColorSpace
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  /* Canvas row 0 is the top. Flip on upload so uv.y 1 is the top of a cell. */
  texture.flipY = true
  return texture
}

/**
 * Draws the atlas in the display face. Returns false while that font is still
 * loading, so the caller retries on a later frame instead of baking a fallback.
 */
export function paintRestLetters(): boolean {
  if (painted) return true
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--font-grotesque")
  const family = raw.split(",")[0]?.trim().replaceAll('"', "")
  if (!family) return false
  const font = `700 ${CELL * 0.86}px "${family}"`
  if (!document.fonts.check(font)) {
    void document.fonts.load(font)
    return false
  }

  const map = restLetterTexture()
  const ctx = (map.image as HTMLCanvasElement).getContext("2d")
  if (!ctx) return false
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, CELL * ATLAS_GRID, CELL * ATLAS_GRID)
  ctx.fillStyle = "#fff"
  ctx.strokeStyle = "#fff"
  ctx.textAlign = "center"
  ctx.textBaseline = "alphabetic"
  ctx.font = font

  GLYPHS.forEach((glyph, index) => {
    const x = (index % ATLAS_GRID) * CELL
    const y = Math.floor(index / ATLAS_GRID) * CELL
    ctx.save()
    /* Nothing may bleed into the next cell: a wide M would show on its neighbour's tube. */
    ctx.beginPath()
    ctx.rect(x, y, CELL, CELL)
    ctx.clip()
    if (glyph === ARC) {
      /* The signal arc of the mark, the same curve as ArcMark, drawn heavy enough for a tube. */
      ctx.lineWidth = CELL * 0.1
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(x + CELL * 0.14, y + CELL * 0.7)
      ctx.bezierCurveTo(
        x + CELL * 0.33,
        y + CELL * 0.2,
        x + CELL * 0.67,
        y + CELL * 0.2,
        x + CELL * 0.86,
        y + CELL * 0.7,
      )
      ctx.stroke()
    } else {
      /* Centre the ink itself, not the advance box, and keep wide letters inside the cell. */
      const ink = ctx.measureText(glyph)
      const width = ink.actualBoundingBoxLeft + ink.actualBoundingBoxRight
      const height = ink.actualBoundingBoxAscent + ink.actualBoundingBoxDescent
      const fit = Math.min(1, (CELL * 0.9) / width)
      ctx.translate(x + CELL / 2, y + CELL / 2)
      ctx.scale(fit, 1)
      ctx.fillText(
        glyph,
        (ink.actualBoundingBoxLeft - ink.actualBoundingBoxRight) / 2,
        ink.actualBoundingBoxAscent - height / 2,
      )
    }
    ctx.restore()
  })

  map.needsUpdate = true
  painted = true
  return true
}
