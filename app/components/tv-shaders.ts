import * as THREE from "three"
import { BAR_HEX, HALFTONE_HEX, PAGE_HEX, PAPER_HEX } from "@/app/lib/bars"

/**
 * The custom materials of the scene: static screens, bar screens, the halftone
 * and the faint word behind the pile. No lights. The bar screens sample one
 * mask; every colour goes in as a linear THREE.Color and leaves through
 * colorspace_fragment, so the bars and the paper word match the CSS tokens.
 */

const barColors = () => BAR_HEX.map((hex) => new THREE.Color(hex))

/** Shared by every material, so one write per frame moves all of them. */
export const sharedUniforms = {
  uTime: { value: 0 },
  uBars: { value: barColors() },
  /* Static is warm paper white, not video white, so the whole pile sits in one ink. */
  uPaper: { value: new THREE.Color(PAPER_HEX) },
}

/** Black until the hero paints the word mask. A sampler cannot be empty. */
function blankWord() {
  const texture = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1)
  texture.colorSpace = THREE.NoColorSpace
  texture.needsUpdate = true
  return texture
}

/**
 * The hero words, shared by every bar screen and the gap copy.
 * uLockView is the SHOT_1 camera with no drift, no pointer and no orbit.
 * Red is ZGOMOT, green is SEMNAL.
 */
export const wordUniforms = {
  uWord: { value: blankWord() as THREE.Texture },
  uLockView: { value: new THREE.Matrix4() },
  uZgomot: { value: 0 },
  uSemnal: { value: 0 },
  uTear: { value: 0 },
  uGhost: { value: 0 },
  /* Lock-frame box the bridging copy may occupy. Outside it the wall stays bare. */
  uSpan: { value: new THREE.Vector4(0, 0, 1, 1) },
}

/**
 * The letters of the resting pile, shared by every screen. uLetters is the glyph
 * atlas of app/lib/rest-letters.ts; uText is 1 while the page sits at the top
 * and falls to 0 as the first scroll hands the tubes over to the tune-in.
 */
export const letterUniforms = {
  uLetters: { value: blankWord() as THREE.Texture },
  uText: { value: 0 },
}

/**
 * The face on the top tube, written every frame from app/lib/tv-face.ts.
 * uFaceShape is the eye shape and the mouth shape; uFaceMove is where the eyes
 * look (x, y), the idle hop, and 1 during a blink.
 */
export const faceUniforms = {
  uFaceShape: { value: new THREE.Vector2(0, 0) },
  uFaceMove: { value: new THREE.Vector4(0, 0, 0, 0) },
}

/** What one screen needs to show its letter. */
function letterSlot() {
  return {
    /* 1 on the tube that shows the face instead of a glyph. */
    uFace: { value: 0 },
    /* Rest-pose glass as the camera faces it: left edge (max z), bottom, width, height. */
    uGlass: { value: new THREE.Vector4(0, 0, 1, 1) },
    /* Atlas cell, or -1 for a tube that keeps its static. */
    uGlyph: { value: -1 },
    /* 1 for the instant a tube changes letter: it shows static instead. */
    uFlick: { value: 0 },
    /* 1 on O, M and G once they are lit: the picture stays bright under the letter. */
    uSpot: { value: 0 },
  }
}

const COMMON = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBars[7];
  uniform vec3 uPaper;
  uniform sampler2D uLetters;
  uniform float uText;
  uniform vec4 uGlass;
  uniform float uGlyph;
  uniform float uFlick;
  uniform float uSpot;
  uniform float uFace;
  uniform vec2 uFaceShape;
  uniform vec4 uFaceMove;

  /* One eye, p from its centre. Shapes: dot, tall, happy arc, shut, wide with a pupil. */
  float eyeInk(vec2 p, float shape) {
    if (shape < 0.5) return step(length(p), 0.1);
    if (shape < 1.5) return step(length(p * vec2(1.0, 0.57)), 0.08);
    if (shape < 2.5) return step(abs(length(p + vec2(0.0, 0.05)) - 0.1), 0.045) * step(-0.05, p.y);
    if (shape < 3.5) return step(abs(p.y), 0.04) * step(abs(p.x), 0.12);
    return max(step(abs(length(p) - 0.11), 0.04), step(length(p - uFaceMove.xy), 0.045));
  }

  /* The mouth, p from its centre. Shapes: smile, round, flat, open grin. */
  float mouthInk(vec2 p, float shape) {
    if (shape < 0.5) return step(abs(length(p - vec2(0.0, 0.08)) - 0.15), 0.04) * step(p.y, 0.0);
    if (shape < 1.5) return step(length(p * vec2(1.0, 0.8)), 0.07);
    if (shape < 2.5) return step(abs(p.y), 0.035) * step(abs(p.x), 0.11);
    return step(length(p - vec2(0.0, 0.06)), 0.15) * step(p.y, 0.06);
  }

  /* The pet face: eyes and a mouth, snapped to a 20 by 20 grid so it reads as LCD pixels. */
  float faceInk(vec2 cell) {
    float inside = step(0.0, cell.x) * step(cell.x, 1.0) * step(0.0, cell.y) * step(cell.y, 1.0);
    vec2 q = (floor(cell * 20.0) + 0.5) / 20.0 - vec2(0.0, uFaceMove.z);
    float shape = mix(uFaceShape.x, 3.0, uFaceMove.w);
    vec2 look = uFaceMove.xy;
    float eyes = max(
      eyeInk(q - vec2(0.28, 0.62) - look, shape),
      eyeInk(q - vec2(0.72, 0.62) - look, shape)
    );
    return max(eyes, mouthInk(q - vec2(0.5, 0.27), uFaceShape.y)) * inside;
  }

  /* Coverage of this tube's glyph at a point of its cell, 0 outside the cell. */
  float glyphInk(vec2 cell) {
    float inside = step(0.0, cell.x) * step(cell.x, 1.0) * step(0.0, cell.y) * step(cell.y, 1.0);
    vec2 at = vec2(mod(uGlyph, 4.0), 3.0 - floor(uGlyph / 4.0));
    return texture2D(uLetters, (at + clamp(cell, 0.0, 1.0)) / 4.0).r * inside;
  }

  /*
   * The resting letter: paper-white ink on a tube turned almost dark. world is
   * the rest position, so the letter is placed on the glass as the pile stands;
   * screen-right is -Z. The cell is square and 0.74 of the glass height.
   */
  vec3 restLetter(vec3 color, vec3 world) {
    float on = uText * step(0.0, uGlyph) * (1.0 - uFlick);
    if (on <= 0.0) return color;
    vec2 p = vec2(uGlass.x - world.z - 0.5 * uGlass.z, world.y - uGlass.y - 0.5 * uGlass.w);
    vec2 cell = p / (0.74 * uGlass.w) + 0.5;
    /* The face has more to show than a letter, so its cell is 0.92 of the glass height. */
    float ink = uFace > 0.5 ? faceInk(p / (0.92 * uGlass.w) + 0.5) : glyphInk(cell);
    vec3 lettered = mix(color * 0.16, uPaper, ink);
    if (uSpot > 0.0) {
      /* A lit tube keeps its bars. A dark rim holds the letter off the pale ones. */
      float rim = ink;
      for (int i = 0; i < 8; i++) {
        float angle = float(i) * 0.7854;
        rim = max(rim, glyphInk(cell + 0.045 * vec2(cos(angle), sin(angle))));
      }
      vec3 lit = mix(mix(color, vec3(0.012), rim), uPaper, ink);
      lettered = mix(lettered, lit, uSpot);
    }
    return mix(color, lettered, on);
  }

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
    if (progress <= 0.0) return noise * uPaper;

    float line = floor(uv.y * 40.0);
    float tear = (hash21(vec2(line, floor(uTime * 18.0) + seed)) - 0.5);
    float tearBand = smoothstep(0.1, 0.0, abs(fract(uv.y + uTime * 0.9 + seed) - 0.5));
    float settle = smoothstep(0.3, 0.75, progress);
    float shift = tear * (0.22 * tearBand + 0.05) * (1.0 - settle);

    vec3 bars = barColor(clamp(uv.x + shift, 0.0, 0.999));
    bars = mix(bars, tint, tintMix);

    float lock = smoothstep(0.22, 0.42, progress);
    float dropout = step(0.82, hash21(vec2(floor(uTime * 14.0), seed + 3.0))) * (1.0 - settle);
    vec3 color = mix(noise * uPaper, bars, lock * (1.0 - dropout * 0.8));

    float sync = smoothstep(0.6, 1.0, progress);
    float rollY = fract(uv.y - sync * 1.2);
    float rollBar = smoothstep(0.06, 0.0, abs(rollY - 0.5)) * (1.0 - sync) * step(0.6, progress);
    color = mix(color, vec3(0.03), rollBar);
    color += noise * uPaper * 0.06 * (1.0 - sync);
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

/*
 * Bar screens are cut and mapped by world height, measured with the pile stacked.
 * When a set flies off in the burst its glass must keep that picture, so the
 * height comes from the matrix the mesh had at rest, not from where it is now.
 */
const MELT_VERTEX = /* glsl */ `
  uniform mat4 uRest;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    vUv = uv;
    vWorld = (uRest * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
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
  uniform sampler2D uWord;
  uniform mat4 uLockView;
  uniform float uZgomot;
  uniform float uSemnal;
  uniform float uTear;
  varying vec2 vUv;
  varying vec3 vWorld;

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
      /*
       * The picture is laid out on the glass as the pile stands, from the rest
       * position: the mesh UVs lie on their side, which would turn the bars over.
       */
      vec2 face = vec2((uGlass.x - vWorld.z) / uGlass.z, (vWorld.y - uGlass.y) / uGlass.w);
      uv = mix(uv, clamp(face, 0.0, 0.999), step(1.5, uState));
      color = tuneIn(uv, progress, uSeed, uTint, uTintMix);
      color = restLetter(color, vWorld);
      /* Same lock-camera picture as the bar screens, from the rest position. */
      vec4 clip = uLockView * vec4(vWorld, 1.0);
      vec2 word = clip.xy / clip.w * 0.5 + 0.5;
      float line = floor(word.y * 40.0);
      float tear = hash21(vec2(line, floor(uTime * 18.0) + uSeed)) - 0.5;
      float tearBand = smoothstep(0.1, 0.0, abs(fract(word.y + uTime * 0.9 + uSeed) - 0.5));
      word.x += tear * (0.22 * tearBand + 0.05) * uTear;
      float framed = step(0.0, word.x) * step(word.x, 1.0) * step(0.0, word.y) * step(word.y, 1.0);
      vec2 mask = texture2D(uWord, word).rg * framed;
      float cover = max(mask.r * uZgomot, mask.g * uSemnal);
      color = mix(color, color * 0.38, uSemnal);
      color = mix(color, uPaper, cover);
      color = crt(color, uv, uSeed, uScanline, uVignette, uFlicker * (1.0 - uSemnal));
    }

    gl_FragColor = vec4(color * inside * uDim, 1.0);
    #include <colorspace_fragment>
  }
`

export function createScreenMaterial(seed: number, rest: THREE.Matrix4) {
  return new THREE.ShaderMaterial({
    name: "Screen",
    vertexShader: MELT_VERTEX,
    fragmentShader: SCREEN_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      ...sharedUniforms,
      ...wordUniforms,
      ...letterUniforms,
      ...faceUniforms,
      ...letterSlot(),
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
      uRest: { value: rest.clone() },
    },
  })
}

/* --------------------------------------------------------------- bar screen */

/**
 * A bar screen. The model keeps the glass, a drip and a share of a floor pool in
 * one mesh. Only the glass is drawn here: everything below it is the puddle, and
 * the paint material draws that on a copy of the mesh. uTune takes that glass from static to locked bars. The word is
 * sampled from the stacked rest position, so a flying set keeps its patch.
 */
const MELT_FRAGMENT = /* glsl */ `
  ${COMMON}
  uniform float uTune;
  uniform float uSeed;
  uniform float uTop;
  uniform float uScreenBottom;
  uniform vec3 uTint;
  uniform float uTintMix;
  uniform float uDim;
  uniform float uCrt;
  uniform sampler2D uWord;
  uniform mat4 uLockView;
  uniform float uZgomot;
  uniform float uSemnal;
  uniform float uTear;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    /* The stripe texture had eight columns; the eighth was black. */
    float stripe = clamp(vUv.x / 0.875, 0.0, 0.999);

    /* Below the glass the mesh is the modeled drip and floor pool. The paint material draws it. */
    if (vWorld.y < uScreenBottom) discard;

    vec2 uv = vec2(stripe, (vWorld.y - uScreenBottom) / max(uTop - uScreenBottom, 0.001));
    vec3 color = tuneIn(uv, uTune, uSeed, uTint, uTintMix);
    color = restLetter(color, vWorld);

    /* One picture for the whole pile, in the locked camera. Rest position glues it to the glass. */
    vec4 clip = uLockView * vec4(vWorld, 1.0);
    vec2 word = clip.xy / clip.w * 0.5 + 0.5;
    float line = floor(word.y * 40.0);
    float tear = hash21(vec2(line, floor(uTime * 18.0) + uSeed)) - 0.5;
    float tearBand = smoothstep(0.1, 0.0, abs(fract(word.y + uTime * 0.9 + uSeed) - 0.5));
    word.x += tear * (0.22 * tearBand + 0.05) * uTear;
    float framed = step(0.0, word.x) * step(word.x, 1.0) * step(0.0, word.y) * step(word.y, 1.0);
    vec2 mask = texture2D(uWord, word).rg * framed;

    /* The same sync roll as tuneIn, so the flash is cut by the bar and the lock is not. */
    float sync = smoothstep(0.6, 1.0, uTune);
    float rollY = fract(uv.y - sync * 1.2);
    float rollBar = smoothstep(0.06, 0.0, abs(rollY - 0.5)) * (1.0 - sync) * step(0.6, uTune);
    float cover = max(mask.r * uZgomot, mask.g * uSemnal) * (1.0 - rollBar);
    color = mix(color, color * 0.38, uSemnal);
    color = mix(color, uPaper, cover);
    color = crt(color, uv, uSeed, 0.25 * uCrt, 0.3 * uCrt, 0.03 * (1.0 - uSemnal));
    gl_FragColor = vec4(color * uDim, 1.0);
    #include <colorspace_fragment>
  }
`

export type MeltShape = {
  seed: number
  top: number
  screenBottom: number
  /** World matrix of the mesh with the pile stacked. */
  rest: THREE.Matrix4
}

export function createMeltMaterial(shape: MeltShape) {
  return new THREE.ShaderMaterial({
    name: "BarScreen",
    vertexShader: MELT_VERTEX,
    fragmentShader: MELT_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      ...sharedUniforms,
      ...wordUniforms,
      ...letterUniforms,
      ...faceUniforms,
      ...letterSlot(),
      uTune: { value: 0 },
      uSeed: { value: shape.seed },
      uTop: { value: shape.top },
      uScreenBottom: { value: shape.screenBottom },
      uRest: { value: shape.rest.clone() },
      uTint: { value: new THREE.Color("#ffffff") },
      uTintMix: { value: 0 },
      uDim: { value: 1 },
      /* Scanlines and vignette strength. Beat 3 fades it out as the glass fills the viewport. */
      uCrt: { value: 1 },
    },
  })
}

/* -------------------------------------------------------------------- paint */

/**
 * The modeled paint: the part of a bar-screen mesh below its glass, and the
 * meshes that are floor pool only. Flat bar colours, no picture. It is drawn on
 * a copy that stays on the floor, so the pool does not leave with a flying set.
 * uDripY cuts a drip off below a height; uPool is the spreading edge of the pool.
 * uFade takes the pool out while the sets are in the air and brings it back when they land.
 */
const PAINT_FRAGMENT = /* glsl */ `
  uniform vec3 uBars[7];
  uniform float uScreenBottom;
  uniform float uDripY;
  uniform vec3 uPool;
  uniform float uFade;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    if (uFade < 0.01) discard;
    if (vWorld.y >= uScreenBottom || vWorld.y < uDripY) discard;
    /* The pool spreads from one point under the pile. The edge wanders, so it is not a circle. */
    vec2 p = vWorld.xz - uPool.xy;
    float angle = atan(p.y, p.x);
    float reach = length(p) + 0.9 * sin(angle * 6.0) + 0.5 * sin(angle * 13.0 + 1.7);
    if (reach > uPool.z) discard;
    /* The stripe texture had eight columns; the eighth was black. */
    float stripe = clamp(vUv.x / 0.875, 0.0, 0.999);
    gl_FragColor = vec4(uBars[int(floor(stripe * 7.0))], uFade);
    #include <colorspace_fragment>
  }
`

export function createPaintMaterial(screenBottom: number, rest: THREE.Matrix4) {
  return new THREE.ShaderMaterial({
    name: "Paint",
    vertexShader: MELT_VERTEX,
    fragmentShader: PAINT_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    transparent: true,
    uniforms: {
      uBars: sharedUniforms.uBars,
      uScreenBottom: { value: screenBottom },
      uRest: { value: rest.clone() },
      /* Nothing is cut and nothing is held back until the scene says so. */
      uDripY: { value: -1000 },
      uPool: { value: new THREE.Vector3(0, 0, 1000) },
      /* Opaque until the burst asks the pool to leave. */
      uFade: { value: 1 },
    },
  })
}

/**
 * Paint over the lip of a static tube, which has no modeled drip. One quad below
 * the glass, as wide as the picture: a thin sheet along the lip, and one drip
 * per bar, each in its bar's colour. uv.x runs with the bars, uv.y is 1 at the lip.
 */
const LIP_FRAGMENT = /* glsl */ `
  uniform vec3 uBars[7];
  uniform float uDrip;
  uniform float uSeed;
  uniform float uAspect;
  varying vec2 vUv;

  float rand(float n) {
    return fract(sin(n * 91.7 + uSeed * 13.1) * 43758.5453);
  }

  void main() {
    if (uDrip <= 0.0) discard;
    float u = vUv.x;
    float v = 1.0 - vUv.y;
    float bar = clamp(floor(u * 7.0), 0.0, 6.0);
    float centre = (bar + 0.5) / 7.0;
    float width = 0.034 + 0.022 * rand(bar + 7.0);
    float reach = (0.14 + 0.82 * pow(rand(bar), 1.5)) * uDrip;
    float across = abs(u - centre) / width;
    float drip = 0.0;
    if (across < 1.0) {
      /* A round end: the drip is shorter towards its edges by the radius of its tip. */
      float tip = width * uAspect;
      drip = step(v, reach - tip * (1.0 - sqrt(1.0 - across * across)));
    }
    float sheet = step(v, uDrip * (0.05 + 0.025 * sin(u * 37.0 + uSeed)));
    if (max(drip, sheet) < 0.5) discard;
    gl_FragColor = vec4(uBars[int(bar)], 1.0);
    #include <colorspace_fragment>
  }
`

/** `aspect` is the quad's width over its height, so a drip's tip stays round. */
export function createLipMaterial(seed: number, aspect: number) {
  return new THREE.ShaderMaterial({
    name: "LipPaint",
    vertexShader: VERTEX,
    fragmentShader: LIP_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      uBars: sharedUniforms.uBars,
      uDrip: { value: 0 },
      uSeed: { value: seed },
      uAspect: { value: aspect },
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

/**
 * SEMNAL, faint, on a plane behind the sets. The same lock projection as the
 * glass, so a gap continues the stroke the tubes miss. Discard keeps the
 * halftone everywhere there is no letter. uGhost erodes it as the burst starts.
 */
const GHOST_FRAGMENT = /* glsl */ `
  uniform sampler2D uWord;
  uniform mat4 uLockView;
  uniform vec4 uSpan;
  uniform float uGhost;
  uniform vec3 uPage;
  uniform vec3 uPaper;
  varying vec3 vWorld;

  void main() {
    if (uGhost < 0.01) discard;
    vec4 clip = uLockView * vec4(vWorld, 1.0);
    vec2 uv = clip.xy / clip.w * 0.5 + 0.5;
    if (uv.x < uSpan.x || uv.x > uSpan.z || uv.y < uSpan.y || uv.y > uSpan.w) discard;
    float mask = texture2D(uWord, uv).g;
    /* As the sets part, the threshold climbs and the bridging strokes disappear. */
    if (mask < mix(0.42, 0.98, 1.0 - uGhost)) discard;
    vec3 color = mix(uPage, uPaper, 0.22);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export function createGhostMaterial() {
  return new THREE.ShaderMaterial({
    name: "SignalGhost",
    vertexShader: VERTEX,
    fragmentShader: GHOST_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    depthTest: true,
    depthWrite: true,
    uniforms: {
      ...wordUniforms,
      uPage: { value: new THREE.Color(PAGE_HEX) },
      uPaper: { value: new THREE.Color(PAPER_HEX) },
    },
  })
}

export function createHalftoneMaterial() {
  return new THREE.ShaderMaterial({
    name: "Halftone",
    vertexShader: VERTEX,
    fragmentShader: HALFTONE_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      uDisc: { value: new THREE.Color(HALFTONE_HEX) },
      uPage: { value: new THREE.Color(PAGE_HEX) },
      uCentre: { value: new THREE.Vector2(2.77, 7) },
      uRadius: { value: 11 },
      uAngle: { value: 0 },
      uOpacity: { value: 1 },
    },
  })
}
