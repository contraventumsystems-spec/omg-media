import * as THREE from "three"
import { BAR_HEX, HALFTONE_HEX, LIQUID_HEX, PAGE_HEX, PAPER_HEX } from "@/app/lib/bars"

/**
 * The custom materials of the scene: static screens, bar screens, the paint
 * streams, the hole and the halftone. No lights and no textures. Colours go in
 * as linear THREE.Color uniforms and leave through colorspace_fragment, so the
 * bars match the CSS tokens exactly.
 */

const barColors = () => BAR_HEX.map((hex) => new THREE.Color(hex))
const liquidColors = () => LIQUID_HEX.map((hex) => new THREE.Color(hex))

/** Shared by every material, so one write per frame moves all of them. */
export const sharedUniforms = {
  uTime: { value: 0 },
  uBars: { value: barColors() },
  uLiquid: { value: liquidColors() },
  /* Static is warm paper white, not video white, so the whole pile sits in one ink. */
  uPaper: { value: new THREE.Color(PAPER_HEX) },
}

const COMMON = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBars[7];
  uniform vec3 uLiquid[7];
  uniform vec3 uPaper;

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

  /*
   * The paint. A cyclic run through the seven colours: each holds for half its
   * band and blends into the next over the other half, so a colour never snaps.
   */
  vec3 liquid(float hue) {
    float x = fract(hue) * 7.0;
    int index = int(min(floor(x), 6.0));
    int next = index == 6 ? 0 : index + 1;
    return mix(uLiquid[index], uLiquid[next], smoothstep(0.3, 1.0, fract(x)));
  }

  /* Across a screen the paint keeps the bar order, so bars can turn to paint in place. */
  float stripeHue(float stripe) {
    return stripe * 0.93;
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

/* --------------------------------------------------------------- bar screen */

/**
 * A bar screen. The model keeps the glass, a drip and a share of a floor pool in
 * one mesh. The glass is the picture; everything below it is the modeled paint,
 * which stays as it was made. The paint that moves is its own geometry
 * (createStreamMaterial), so it can gather, fall and land on the timeline.
 *
 * uTune takes the glass from static to locked bars. uMelt then turns the bars to
 * paint in place: same order across the screen, soft edges that sag and wander.
 */
const MELT_FRAGMENT = /* glsl */ `
  ${COMMON}
  uniform float uTune;
  uniform float uMelt;
  uniform float uSeed;
  uniform float uTop;
  uniform float uScreenBottom;
  uniform vec3 uTint;
  uniform float uTintMix;
  uniform float uDim;
  uniform float uCrt;
  varying vec2 vUv;
  varying vec3 vWorld;

  void main() {
    /* The stripe texture had eight columns; the eighth was black. */
    float stripe = clamp(vUv.x / 0.875, 0.0, 0.999);

    /*
     * Below the glass the mesh is the modeled paint: the drip and the pool. It is
     * drawn from the first frame, in the same bands as the stream that joins it.
     */
    if (vWorld.y < uScreenBottom) {
      vec3 wet = mix(liquid(stripeHue(stripe)), uTint, uTintMix);
      vec3 surface = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
      vec3 eye = normalize(cameraPosition - vWorld);
      if (dot(surface, eye) < 0.0) surface = -surface;
      float shine = max(dot(surface, normalize(normalize(vec3(0.55, 0.8, 0.25)) + eye)), 0.0);
      wet += (0.5 * pow(shine, 36.0) + 0.1 * pow(shine, 6.0)) * uPaper;
      gl_FragColor = vec4(wet * uDim, 1.0);
      #include <colorspace_fragment>
      return;
    }

    vec2 uv = vec2(stripe, (vWorld.y - uScreenBottom) / max(uTop - uScreenBottom, 0.001));
    vec3 color = tuneIn(uv, uTune, uSeed, uTint, uTintMix);

    if (uMelt > 0.0) {
      /* The edges between colours go slack from the top down, like paint that has started to run. */
      float slack = uMelt * (1.0 - uv.y * 0.55);
      float wander = sin(uv.y * 7.0 - uTime * 0.7 + uSeed * 5.0) * 0.022
        + sin(uv.y * 15.0 + uTime * 0.45 + uSeed * 9.0) * 0.009;
      vec3 paint = liquid(stripeHue(clamp(stripe + wander * slack, 0.0, 0.999)));
      /* One soft band of light across the tube: the picture is wet now. */
      paint += 0.12 * smoothstep(0.16, 0.0, abs(uv.y - 0.74 - 0.05 * sin(stripe * 6.0 + uSeed)));
      color = mix(color, mix(paint, uTint, uTintMix), smoothstep(0.0, 1.0, uMelt));
    }

    color = crt(color, uv, uSeed, 0.25 * uCrt * (1.0 - 0.6 * uMelt), 0.3 * uCrt, 0.03) * uDim;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export type MeltShape = {
  seed: number
  top: number
  screenBottom: number
}

export function createMeltMaterial(shape: MeltShape) {
  return new THREE.ShaderMaterial({
    name: "BarScreen",
    vertexShader: VERTEX,
    fragmentShader: MELT_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    /*
     * The modeled paint is tested against depth but does not write it, and is
     * drawn after the cabinets (see renderOrder in the scene). A stream drawn
     * after it is then always in front of the floor puddle, whichever side of
     * the puddle's surface it is on, so it never appears to cut through it.
     */
    depthWrite: false,
    uniforms: {
      ...sharedUniforms,
      uTune: { value: 0 },
      uMelt: { value: 0 },
      uSeed: { value: shape.seed },
      uTop: { value: shape.top },
      uScreenBottom: { value: shape.screenBottom },
      uTint: { value: new THREE.Color("#ffffff") },
      uTintMix: { value: 0 },
      uDim: { value: 1 },
      /* Scanlines and vignette strength. Beat 3 fades it out as the glass fills the viewport. */
      uCrt: { value: 1 },
    },
  })
}

/* ------------------------------------------------------------------- stream */

/**
 * One stream of paint. The geometry is a tube of rings along a fixed path; every
 * vertex carries its ring centre (position), the two axes of its ring and how far
 * along the path it sits. The vertex shader rebuilds the surface each frame from
 * the timeline values, so the same mesh is a film on the glass, a hanging drop,
 * a falling thread and a full ribbon.
 *
 *   uHead     leading edge, in world units along the path
 *   uSwell    size of the drop at the leading edge
 *   uStretch  how long the fall has pulled that drop
 *   uBody     thickness of the strand behind it
 *   uSway     sideways swing between the cabinet and the hole
 *   uPhase    how far the colour bands and beads have travelled, in world units
 */
const STREAM_VERTEX = /* glsl */ `
  attribute vec3 aSide;
  attribute vec3 aOut;
  attribute vec2 aRing;
  attribute float aArc;
  attribute vec2 aBase;

  uniform float uTime;
  uniform float uLength;
  uniform float uLip;
  uniform float uHead;
  uniform float uSwell;
  uniform float uStretch;
  uniform float uBody;
  uniform float uSway;
  uniform float uBreath;
  uniform float uPhase;
  uniform float uDrop;
  uniform float uSeed;
  uniform float uScale;

  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vArc;
  varying float vAcross;
  varying float vFree;

  void main() {
    float arc = aArc;
    float head = uHead;
    float lip = uLip;
    float behind = head - arc;
    /* 0 on the glass and the cabinet, 1 once the paint hangs free. */
    float free = smoothstep(lip, lip + 1.4, arc);

    /* Just behind the drop the strand is pulled to a thread; further up it has had time to fill. */
    float neck = 1.0 - 0.6 * exp(-max(behind, 0.0) / (1.0 + 2.5 * uStretch));
    float thick = mix(1.0, mix(0.4, 1.0, uBody) * neck, free);

    /* Beads: slow swellings that ride down the strand with the paint. */
    float bead = smoothstep(0.5, 1.0, sin((arc - uPhase) * 1.25 + uSeed * 9.0));
    thick *= 1.0 + 0.26 * bead * free;

    /* The front of the paint is round, with or without a drop on it. */
    float front = sqrt(clamp(behind / 0.3, 0.0, 1.0));
    float halfWidth = aBase.x * thick * front;
    float halfDepth = aBase.y * thick * front;

    /* The drop: a ball at the leading edge with a long soft shoulder behind it. */
    float radius = uDrop * uSwell;
    float reach = max(radius * (1.0 + 1.5 * uStretch), 0.0001);
    float offset = arc - (head - reach);
    float ball = sqrt(max(0.0, 1.0 - (offset * offset) / (reach * reach)));
    float shoulder = exp(-(offset * offset) / (reach * reach * (2.5 + 5.0 * uStretch)));
    float drop = radius * (offset > 0.0 ? ball : shoulder) / (1.0 + 0.35 * uStretch);
    halfWidth = max(halfWidth, drop);
    halfDepth = max(halfDepth, drop * (0.3 + 0.7 * free));

    float alive = step(0.0, behind) * uScale;
    halfWidth *= alive;
    halfDepth *= alive;

    /* Swing: pinned at the cabinet and at the hole, widest in between. */
    float span = clamp((arc - lip) / max(uLength - lip, 0.0001), 0.0, 1.0);
    float bow = sin(3.14159 * span);
    float swing = uSway * 0.85 * bow * (1.0 + 0.35 * sin(span * 9.0 + uSeed * 3.0));
    swing += uBreath * 0.07 * bow * sin(uTime * 0.55 + span * 6.0 + uSeed * 7.0);

    vec3 centre = position + aSide * swing;
    vec3 world = centre + aSide * aRing.x * halfWidth + aOut * aRing.y * halfDepth;

    vWorld = world;
    vNormal = aSide * aRing.x * (halfDepth + 0.0001) + aOut * aRing.y * (halfWidth + 0.0001);
    vArc = arc;
    vAcross = aRing.x;
    vFree = free;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`

const STREAM_FRAGMENT = /* glsl */ `
  ${COMMON}
  uniform float uLip;
  uniform float uPhase;
  uniform float uSeed;
  uniform vec2 uStripe;
  uniform vec3 uTint;
  uniform float uTintMix;
  uniform float uDim;
  uniform float uGloss;
  uniform vec3 uHole;
  uniform float uHoleRadius;
  uniform vec3 uPage;
  uniform float uFar;

  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vArc;
  varying float vAcross;
  varying float vFree;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 view = normalize(cameraPosition - vWorld);
    float facing = clamp(dot(normal, view), 0.0, 1.0);

    /*
     * The colours run side by side across the stream, in the bar order, from the
     * glass to the hole: the bands narrow with the paint and never change places.
     * Once it hangs free their edges wander a little, and the wander travels with it.
     */
    float wander = 0.035 * sin((vArc - uPhase) * 0.45 + uSeed * 9.0)
      + 0.015 * sin((vArc - uPhase) * 1.3 + uSeed * 4.0);
    float stripe = clamp(uStripe.x + uStripe.y * vAcross + wander * vFree, 0.0, 0.999);
    float hue = stripeHue(stripe);
    vec3 paint = mix(liquid(hue), uTint, uTintMix) * uDim;

    /*
     * Volume grows with the paint. On the glass it is a film with no edge of its
     * own, so it reads as the picture itself; in free fall it is a round strand.
     */
    float volume = 0.15 + 0.85 * vFree;

    /* Thickness: the paint is darker where the surface turns away, with an ink line at the edge. */
    vec3 color = paint * mix(1.0, mix(0.5, 1.0, pow(facing, 0.7)), volume);
    /* A little of the next colour in the turn of the surface, as if the stream beside it showed in it. */
    color = mix(color, liquid(hue + 0.16) * uDim, 0.22 * pow(1.0 - facing, 2.0) * uGloss * volume);
    color *= mix(1.0, mix(0.3, 1.0, smoothstep(0.0, 0.3, facing)), volume);

    /* Wet: one small hard light and a wide soft one, from above and in front. */
    vec3 light = normalize(vec3(0.55, 0.8, 0.25));
    float glint = max(dot(normal, normalize(light + view)), 0.0);
    color += uGloss * uDim * volume * (0.85 * pow(glint, 36.0) + 0.2 * pow(glint, 6.0)) * uPaper;
    /* One long streak down the ribbon, off centre: thick paint holds a line of light as it falls. */
    float streak = smoothstep(0.13, 0.0, abs(vAcross + 0.3)) * smoothstep(0.3, 0.8, facing);
    color += 0.22 * uGloss * uDim * vFree * streak * uPaper;

    /* Depth: far paint sinks a little into the page, and it goes black as it drops into the hole. */
    float distanceToEye = distance(cameraPosition, vWorld);
    color = mix(color, uPage, 0.3 * smoothstep(uFar * 0.55, uFar * 1.15, distanceToEye));
    color *= 1.0 - smoothstep(0.0, uHoleRadius * 1.15, uHole.y - vWorld.y);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export type StreamShape = {
  seed: number
  /** Path length in world units. */
  length: number
  /** Distance along the path at which the paint leaves the cabinet. */
  lip: number
  /** Radius of the drop at full swell, in world units. */
  drop: number
  /** Bar position at the centre of the stream, and its change towards the +side edge. */
  stripe: [number, number]
}

export function createStreamMaterial(shape: StreamShape) {
  return new THREE.ShaderMaterial({
    name: "Stream",
    vertexShader: STREAM_VERTEX,
    fragmentShader: STREAM_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      ...sharedUniforms,
      uLength: { value: shape.length },
      uLip: { value: shape.lip },
      uHead: { value: 0 },
      uSwell: { value: 0 },
      uStretch: { value: 0 },
      uBody: { value: 0.3 },
      uSway: { value: 0 },
      uBreath: { value: 0 },
      uPhase: { value: 0 },
      uDrop: { value: shape.drop },
      uSeed: { value: shape.seed },
      uScale: { value: 1 },
      uStripe: { value: new THREE.Vector2(...shape.stripe) },
      uTint: { value: new THREE.Color("#ffffff") },
      uTintMix: { value: 0 },
      uDim: { value: 1 },
      uGloss: { value: 1 },
      uHole: { value: new THREE.Vector3() },
      uHoleRadius: { value: 1 },
      uPage: { value: new THREE.Color(PAGE_HEX) },
      uFar: { value: 100 },
    },
  })
}

/* --------------------------------------------------------------------- hole */

/**
 * The ground around the hole: a halftone pool of light lying flat, far under the
 * pile, with the opening cut out of its middle. It is what makes a black hole
 * readable on a dark page. Outside the light it draws the page colour and still
 * writes depth, which hides the well's wall where the ground would cover it.
 */
const HOLE_GROUND_FRAGMENT = /* glsl */ `
  uniform vec3 uDisc;
  uniform vec3 uPage;
  uniform vec3 uRim;
  uniform vec3 uCentre;
  uniform float uRadius;
  uniform float uOpen;
  uniform float uDots;
  varying vec3 vWorld;

  void main() {
    vec2 p = vec2(vWorld.z - uCentre.z, vWorld.x - uCentre.x);
    float radius = length(p) / max(uRadius * uOpen, 0.0001);
    if (radius < 1.0) discard;

    vec2 grid = p * 0.62;
    grid.x += step(1.0, mod(grid.y, 2.0)) * 0.5;
    float spot = length(fract(grid) - 0.5);
    float edge = fwidth(spot) * 1.2;
    float hole = 1.0 - smoothstep(0.2 - edge, 0.2 + edge, spot);
    hole *= (1.0 - smoothstep(0.2, 0.45, fwidth(grid.x))) * uDots;

    float open = clamp(uOpen, 0.0, 1.0);
    float glow = (1.0 - smoothstep(1.0, 2.6, radius)) * open;
    vec3 color = mix(uPage, uDisc, glow * (1.0 - hole * 0.85));
    /* A thin paper-coloured lip, brightest on the far side where it catches the light. */
    float lipWidth = fwidth(radius) * 1.5 + 0.035;
    float lip = 1.0 - smoothstep(0.0, lipWidth, radius - 1.0);
    float farSide = clamp(-p.y / max(length(p), 0.0001), 0.0, 1.0);
    color = mix(color, uRim, lip * (0.3 + 0.3 * farSide) * open);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export function createHoleGroundMaterial() {
  return new THREE.ShaderMaterial({
    name: "HoleGround",
    vertexShader: VERTEX,
    fragmentShader: HOLE_GROUND_FRAGMENT,
    side: THREE.DoubleSide,
    toneMapped: false,
    uniforms: {
      uDisc: { value: new THREE.Color(HALFTONE_HEX) },
      uPage: { value: new THREE.Color(PAGE_HEX) },
      uRim: { value: new THREE.Color(PAPER_HEX) },
      uCentre: { value: new THREE.Vector3() },
      uRadius: { value: 1 },
      uOpen: { value: 0 },
      uDots: { value: 1 },
    },
  })
}

/** The inside of the hole: a wall that is warm grey at the lip and black a little way down. */
const HOLE_WELL_FRAGMENT = /* glsl */ `
  uniform vec3 uWall;
  uniform vec3 uCentre;
  uniform float uRadius;
  varying vec3 vWorld;

  void main() {
    float depth = (uCentre.y - vWorld.y) / uRadius;
    vec3 color = uWall * 0.55 * (1.0 - smoothstep(0.0, 0.55, depth));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export function createHoleWellMaterial() {
  return new THREE.ShaderMaterial({
    name: "HoleWell",
    vertexShader: VERTEX,
    fragmentShader: HOLE_WELL_FRAGMENT,
    side: THREE.BackSide,
    toneMapped: false,
    uniforms: {
      uWall: { value: new THREE.Color(HALFTONE_HEX) },
      uCentre: { value: new THREE.Vector3() },
      uRadius: { value: 1 },
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
      uDisc: { value: new THREE.Color(HALFTONE_HEX) },
      uPage: { value: new THREE.Color(PAGE_HEX) },
      uCentre: { value: new THREE.Vector2(2.77, 7) },
      uRadius: { value: 11 },
      uAngle: { value: 0 },
      uOpacity: { value: 1 },
    },
  })
}
