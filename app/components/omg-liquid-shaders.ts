import * as THREE from "three"
import { PAGE_HEX, PAPER_HEX } from "@/app/lib/bars"
import { letterUniforms } from "@/app/components/tv-shaders"

/**
 * Shader of the OMG overlay (app/components/omg-liquid-overlay.tsx).
 *
 * The overlay is a quad just in front of a tube's glass. It redraws the tube's
 * own letter from the shared glyph atlas, exactly over the real one, and then
 * pulls that copy out of the screen as a solid block: the same glyph is sampled
 * at growing scales, back to front, which is a perspective extrusion with no
 * geometry. Nothing leaves the screen and nothing runs down it.
 *
 * Nothing here reads or writes a uniform of the pile, except the atlas texture,
 * which it only samples. Every per-tube value is a vertex attribute, so the
 * three quads share one material and one set of uniforms.
 */

/** The timeline writes these. The three-part vectors hold O, M and G. */
export function createOverlayUniforms() {
  return {
    uLetters: letterUniforms.uLetters,
    uPaper: { value: new THREE.Color(PAPER_HEX) },
    uInk: { value: new THREE.Color(PAGE_HEX) },
    uTime: { value: 0 },
    /** Power-on of each tube: 0 dark, 1 picture open. */
    uOn: { value: new THREE.Vector3() },
    /** How far each letter stands out of its glass. 1 is the resting block; it overshoots. */
    uPop: { value: new THREE.Vector3() },
    /** Angle of the slow turn of the blocks. */
    uOrbit: { value: 0 },
    /** A gleam crossing the row: 0 left of O, 1 right of G. */
    uGleam: { value: 0 },
    /** Channel hiccup: lines slip and the colours split. */
    uGlitch: { value: 0 },
    uOpacity: { value: 0 },
  }
}

export type OverlayUniforms = ReturnType<typeof createOverlayUniforms>

const VERTEX = /* glsl */ `
  /* Place on the glass: x 0 left to 1 right, y 0 bottom to 1 top. The quad has a margin past both. */
  attribute vec2 aFace;
  /* Glyph cell, glass width over height, tube number 0 to 2. */
  attribute vec3 aInfo;
  /* The colour of this tube's block. */
  attribute vec3 aColor;
  varying vec2 vFace;
  varying vec3 vInfo;
  varying vec3 vColor;

  void main() {
    vFace = aFace;
    vInfo = aInfo;
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAGMENT = /* glsl */ `
  uniform sampler2D uLetters;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform float uTime;
  uniform vec3 uOn;
  uniform vec3 uPop;
  uniform float uOrbit;
  uniform float uGleam;
  uniform float uGlitch;
  uniform float uOpacity;
  varying vec2 vFace;
  varying vec3 vInfo;
  varying vec3 vColor;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float pick(vec3 v, float tube) {
    return tube < 0.5 ? v.x : tube < 1.5 ? v.y : v.z;
  }

  /* Ink of the glyph at a point of its cell. Same atlas lookup as the screens. */
  float glyph(vec2 cell, float index) {
    float inside = step(0.0, cell.x) * step(cell.x, 1.0) * step(0.0, cell.y) * step(cell.y, 1.0);
    vec2 at = vec2(mod(index, 4.0), 3.0 - floor(index / 4.0));
    return texture2D(uLetters, (at + clamp(cell, 0.0, 1.0)) / 4.0).r * inside;
  }

  /*
   * One slice of the block, t from 0 at the glass to 1 at its front face. A slice
   * nearer the viewer is larger, and slides along lean, so the block is seen a
   * little from one side.
   */
  float slice(vec2 cell, float index, float t, float depth, vec2 lean) {
    return glyph((cell - 0.5 - lean * t) / (1.0 + depth * t) + 0.5, index);
  }

  void main() {
    float index = vInfo.x;
    float aspect = vInfo.y;
    float tube = vInfo.z;
    float on = pick(uOn, tube);
    float pop = max(pick(uPop, tube), 0.0);
    vec2 f = vFace;

    /* The square cell the real letter is drawn in: 0.74 of the glass height, centred. */
    vec2 cell = vec2((f.x - 0.5) * aspect, f.y - 0.5) / 0.74 + 0.5;

    /* Channel hiccup: some lines of the picture slip sideways. */
    float line = floor(f.y * 70.0);
    float torn = step(0.55, hash21(vec2(line * 0.37, floor(uTime * 12.0) + tube)));
    cell.x += (hash21(vec2(line, floor(uTime * 24.0) + tube)) - 0.5) * 0.24 * uGlitch * torn;

    /* The block turns slowly: its front slides round a small ellipse. */
    float depth = 0.34 * pop;
    float turn = uOrbit + tube * 0.6;
    vec2 lean = vec2(cos(turn), 0.55 * sin(turn) - 0.35) * 0.1 * pop;

    /* Sides: every slice between the glass and the face. nearness is 1 at the front. */
    float side = 0.0;
    float nearness = 0.0;
    for (int i = 0; i < 12; i++) {
      float t = float(i) / 12.0;
      float ink = slice(cell, index, t, depth, lean);
      side = max(side, ink);
      nearness = max(nearness, ink * t);
    }
    nearness = side > 0.001 ? nearness / side : 0.0;

    /* The front face, with red and blue pulled apart while the channel slips. */
    float split = 0.035 * uGlitch;
    float face = slice(cell, index, 1.0, depth, lean);
    float faceR = slice(cell + vec2(split, 0.0), index, 1.0, depth, lean);
    float faceB = slice(cell - vec2(split, 0.0), index, 1.0, depth, lean);

    /* What the block throws back on the glass: a soft shadow, down and to the right. */
    vec2 thrown = vec2(0.05, -0.06) * pop;
    float shadow = 0.5 * (glyph(cell - thrown, index) + glyph(cell - thrown * 1.6, index));

    /* Sides run from the page ink at the glass to the tube's colour at the face. */
    vec3 sides = mix(uInk, vColor, 0.15 + 0.85 * nearness * nearness);
    /* The gleam: a slanted band that crosses O, then M, then G. */
    float sweep = mix(-0.7, 3.7, uGleam) - tube - f.x - (f.y - 0.5) * 0.35;
    float gleam = smoothstep(0.22, 0.0, abs(sweep));
    sides += gleam * 0.35;
    /* The face is still a picture on a tube: faint scanlines, and it takes colour as the gleam passes. */
    vec3 front = mix(uPaper, vColor, gleam * 0.85) * (0.93 + 0.07 * sin(f.y * 210.0));

    vec3 color = uInk;
    float alpha = shadow * 0.55 * min(pop, 1.0);
    color = mix(color, sides, side);
    alpha = max(alpha, side);
    vec3 fringe = front * vec3(faceR, face, faceB);
    float lit = max(face, max(faceR, faceB));
    color = mix(color, fringe / max(lit, 0.001), lit);
    alpha = max(alpha, lit);

    /* Power-on: a bright line across the middle of the glass that opens into the picture. */
    float glass = step(0.0, f.x) * step(f.x, 1.0) * step(0.0, f.y) * step(f.y, 1.0);
    float opening = 1.0 - step(0.999, on);
    float reach = 0.5 * on;
    float away = abs(f.y - 0.5);
    float opened = mix(1.0, step(away, reach), opening);
    float beam = smoothstep(0.035, 0.0, abs(away - reach)) * opening * step(0.001, on) * glass;
    float flash = on * (1.0 - on) * 2.4 * step(away, reach) * glass;
    float glow = clamp(beam + flash, 0.0, 1.0);

    alpha *= opened * step(0.001, on);
    color = mix(color, uPaper, glow / max(glow + alpha, 0.001));
    gl_FragColor = vec4(color, clamp(alpha + glow, 0.0, 1.0) * uOpacity);
    #include <colorspace_fragment>
  }
`

/** One material for all three quads. Drawn last, over the pile, and it writes no depth. */
export function createOverlayMaterial(uniforms: OverlayUniforms) {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
}
