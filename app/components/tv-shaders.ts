import * as THREE from "three"
import { BAR_HEX } from "@/app/lib/bars"

/**
 * The three custom materials of the pile: static screens, the melt and the halftone.
 * No lights and no textures. Colours go in as linear THREE.Color uniforms and
 * leave through colorspace_fragment, so the bars match the CSS tokens exactly.
 */

const barColors = () => BAR_HEX.map((hex) => new THREE.Color(hex))

/** Shared by every material, so one write per frame moves all of them. */
export const sharedUniforms = {
  uTime: { value: 0 },
  uBars: { value: barColors() },
}

const COMMON = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBars[7];

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  /* White noise stepped at 12 fps, with a slow bright bar rolling up the tube. */
  float tvStatic(vec2 uv, float seed) {
    float frame = floor(uTime * 12.0);
    vec2 cell = floor(uv * vec2(96.0, 72.0));
    float grain = hash21(cell + seed * 37.0 + frame * 1.37);
    float roll = smoothstep(0.12, 0.0, abs(fract(uv.y - uTime * 0.11 + seed) - 0.5));
    return clamp(0.16 + grain * 0.62 + roll * 0.16, 0.0, 1.0);
  }

  vec3 barColor(float x) {
    int index = int(clamp(floor(x * 7.0), 0.0, 6.0));
    return uBars[index];
  }

  /* CRT feel shared by both screen types. uv is 0..1 across the glass. */
  vec3 crt(vec3 color, vec2 uv, float seed, float scanline, float vignette, float flicker) {
    float rows = uv.y * 54.0;
    float visible = 1.0 - smoothstep(0.25, 0.75, fwidth(rows));
    color *= 1.0 - scanline * visible * (0.5 + 0.5 * sin(rows * 6.2832));
    vec2 fromCentre = uv - 0.5;
    color *= 1.0 - vignette * dot(fromCentre, fromCentre) * 2.2;
    color *= 1.0 - flicker * hash21(vec2(floor(uTime * 24.0), seed));
    return color;
  }

  /*
   * Tune-in, 0 to 1: noise with a horizontal tear, then bars that jitter,
   * then bars that hold while a sync bar rolls off the top.
   */
  vec3 tuneIn(vec2 uv, float progress, float seed, vec3 tint, float tintMix) {
    float noise = tvStatic(uv, seed);
    if (progress <= 0.0) return vec3(noise);

    float line = floor(uv.y * 40.0);
    float tear = (hash21(vec2(line, floor(uTime * 18.0) + seed)) - 0.5);
    float tearBand = smoothstep(0.1, 0.0, abs(fract(uv.y + uTime * 0.9 + seed) - 0.5));
    float settle = smoothstep(0.3, 0.75, progress);
    float shift = tear * (0.22 * tearBand + 0.05) * (1.0 - settle);

    vec3 bars = barColor(clamp(uv.x + shift, 0.0, 0.999));
    bars = mix(bars, tint, tintMix);

    float lock = smoothstep(0.22, 0.42, progress);
    float dropout = step(0.82, hash21(vec2(floor(uTime * 14.0), seed + 3.0))) * (1.0 - settle);
    vec3 color = mix(vec3(noise), bars, lock * (1.0 - dropout * 0.8));

    float sync = smoothstep(0.6, 1.0, progress);
    float rollY = fract(uv.y - sync * 1.2);
    float rollBar = smoothstep(0.06, 0.0, abs(rollY - 0.5)) * (1.0 - sync) * step(0.6, progress);
    color = mix(color, vec3(0.03), rollBar);
    color += noise * 0.06 * (1.0 - sync);
    return color;
  }
`

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

/* ------------------------------------------------------------------ screens */

/** 0 off, 1 static, 2 bars. Video is state 3 and waits for the atlas. */
export type ScreenState = 0 | 1 | 2

const SCREEN_FRAGMENT = /* glsl */ `
  ${COMMON}
  uniform float uState;
  uniform float uProgress;
  uniform float uSeed;
  uniform vec3 uTint;
  uniform float uTintMix;
  uniform float uCurvature;
  uniform float uScanline;
  uniform float uVignette;
  uniform float uFlicker;
  uniform float uDim;
  varying vec2 vUv;

  void main() {
    /* The static quads only use the middle of their UV square, and it lies on its side. */
    vec2 uv = vec2((vUv.y - 0.275) / 0.45, 1.0 - (vUv.x - 0.34) / 0.32);

    /* Barrel: push the picture towards the corners, like a bulged tube. */
    vec2 centred = uv * 2.0 - 1.0;
    centred *= 1.0 + uCurvature * dot(centred, centred);
    uv = centred * 0.5 + 0.5;
    float inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);

    vec3 color = vec3(0.0);
    if (uState > 0.5) {
      float progress = uState > 1.5 ? max(uProgress, 0.0001) : 0.0;
      color = tuneIn(uv, progress, uSeed, uTint, uTintMix);
      color = crt(color, uv, uSeed, uScanline, uVignette, uFlicker);
    }

    gl_FragColor = vec4(color * inside * uDim, 1.0);
    #include <colorspace_fragment>
  }
`

export function createScreenMaterial(seed: number) {
  return new THREE.ShaderMaterial({
    name: "Screen",
    vertexShader: VERTEX,
    fragmentShader: SCREEN_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      ...sharedUniforms,
      uState: { value: 1 },
      uProgress: { value: 0 },
      uSeed: { value: seed },
      uTint: { value: new THREE.Color("#ffffff") },
      uTintMix: { value: 0 },
      uCurvature: { value: 0.08 },
      uScanline: { value: 0.25 },
      uVignette: { value: 0.35 },
      uFlicker: { value: 0.03 },
      uDim: { value: 1 },
    },
  })
}

/* --------------------------------------------------------------------- melt */

/**
 * One mesh holds a bar screen, the drip under it and its share of the pool.
 * World height splits them: above uScreenBottom is glass and follows uTune,
 * below it is liquid and follows uGrow. The grow coordinate runs 0 to 0.5 down
 * the drip and 0.5 to 1 outwards across the floor.
 */
const MELT_FRAGMENT = /* glsl */ `
  ${COMMON}
  uniform float uTune;
  uniform float uGrow;
  uniform float uFlow;
  uniform float uSheen;
  uniform float uEmissive;
  uniform float uSeed;
  uniform float uTop;
  uniform float uScreenBottom;
  uniform float uFloor;
  uniform float uHasScreen;
  uniform float uOnGround;
  uniform vec2 uOrigin;
  uniform float uReach;
  uniform vec3 uTint;
  uniform float uTintMix;
  uniform float uDim;
  uniform float uCrt;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    /* The stripe texture had eight columns; the eighth was black. */
    float stripe = clamp(vUv.x / 0.875, 0.0, 0.999);
    vec3 color;

    if (uHasScreen > 0.5 && vWorld.y >= uScreenBottom) {
      vec2 uv = vec2(stripe, (vWorld.y - uScreenBottom) / max(uTop - uScreenBottom, 0.001));
      color = tuneIn(uv, uTune, uSeed, uTint, uTintMix);
      color = crt(color, uv, uSeed, 0.25 * uCrt, 0.3 * uCrt, 0.03) * uDim;
    } else {
      float grow;
      float along;
      bool onFloor = uOnGround > 0.5 && vWorld.y < uFloor + 0.14;
      if (onFloor) {
        float reach = distance(vWorld.xz, uOrigin) / uReach;
        grow = 0.5 + 0.5 * clamp(reach, 0.0, 1.0);
        along = reach * uReach;
      } else {
        grow = 0.5 * clamp((uScreenBottom - vWorld.y) / max(uScreenBottom - uFloor, 0.001), 0.0, 1.0);
        along = -vWorld.y;
      }
      /* A wavy front, so the liquid does not advance as a ruled line. */
      grow += 0.03 * sin(vWorld.z * 1.7 + vWorld.x * 1.3 + uSeed * 6.0);
      if (grow > uGrow * 1.09 - 0.04) discard;

      color = mix(barColor(stripe), uTint, uTintMix);
      float wave = sin(along * 2.6 - uTime * uFlow * 2.2 + uSeed * 4.0);
      color *= 1.0 + uSheen * 0.07 * wave;
    }

    gl_FragColor = vec4(color * uEmissive, 1.0);
    #include <colorspace_fragment>
  }
`

export type MeltShape = {
  seed: number
  top: number
  screenBottom: number
  floor: number
  hasScreen: boolean
  onGround: boolean
}

export function createMeltMaterial(shape: MeltShape) {
  return new THREE.ShaderMaterial({
    name: "Melt",
    vertexShader: VERTEX,
    fragmentShader: MELT_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      ...sharedUniforms,
      uTune: { value: 0 },
      uGrow: { value: 0 },
      uFlow: { value: 1 },
      uSheen: { value: 1 },
      uEmissive: { value: 1 },
      uSeed: { value: shape.seed },
      uTop: { value: shape.top },
      uScreenBottom: { value: shape.screenBottom },
      uFloor: { value: shape.floor },
      uHasScreen: { value: shape.hasScreen ? 1 : 0 },
      uOnGround: { value: shape.onGround ? 1 : 0 },
      /* Front centre of the pile on the floor; the pool spreads away from it. */
      uOrigin: { value: new THREE.Vector2(3, -2.6) },
      uReach: { value: 15.5 },
      uTint: { value: new THREE.Color("#ffffff") },
      uTintMix: { value: 0 },
      uDim: { value: 1 },
      /* Scanlines and vignette strength. Beat 3 fades it out as the glass fills the viewport. */
      uCrt: { value: 1 },
    },
  })
}

/* ----------------------------------------------------------------- halftone */

/**
 * The spotlight disc behind the pile, drawn as dots in world space.
 * It is the only place the render's grey survives on the dark page.
 */
const HALFTONE_FRAGMENT = /* glsl */ `
  uniform vec3 uDisc;
  uniform vec3 uPage;
  uniform vec2 uCentre;
  uniform float uRadius;
  uniform float uAngle;
  uniform float uOpacity;
  varying vec3 vWorld;

  void main() {
    vec2 p = vec2(-vWorld.z, vWorld.y) - uCentre;
    float radius = length(p) / uRadius;
    if (radius > 1.0) discard;

    float c = cos(uAngle);
    float s = sin(uAngle);
    vec2 grid = mat2(c, -s, s, c) * p * 2.6;
    /* Offset every other row, as in the original dot texture. */
    grid.x += step(1.0, mod(grid.y, 2.0)) * 0.5;
    float spot = length(fract(grid) - 0.5);
    float edge = fwidth(spot) * 1.2;
    float hole = 1.0 - smoothstep(0.17 - edge, 0.17 + edge, spot);
    /* Far away the dots are smaller than a pixel: fade them instead of shimmering. */
    hole *= 1.0 - smoothstep(0.2, 0.45, fwidth(grid.x));

    float falloff = 1.0 - smoothstep(0.55, 1.0, radius);
    vec3 color = mix(uPage, uDisc, falloff * uOpacity * (1.0 - hole * 0.85));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export function createHalftoneMaterial() {
  return new THREE.ShaderMaterial({
    name: "Halftone",
    vertexShader: VERTEX,
    fragmentShader: HALFTONE_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      uDisc: { value: new THREE.Color("#2B2D30") },
      uPage: { value: new THREE.Color("#070C0F") },
      uCentre: { value: new THREE.Vector2(2.77, 7) },
      uRadius: { value: 11 },
      uAngle: { value: 0 },
      uOpacity: { value: 1 },
    },
  })
}
