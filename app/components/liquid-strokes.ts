import * as THREE from "three"
import { LIQUID_HEX, PAPER_HEX } from "@/app/lib/bars"
import { PILE } from "@/app/lib/shots"

/**
 * Seven signal bars, one per paint colour, that stand in for the floor pool
 * while the sets are apart. They are the test pattern the screens were showing.
 * Each bar belongs to one set: it shoots out from behind that set to the top or
 * the bottom of the frame when the pile bursts, and follows the set as it flies.
 * The sets are taken left to right, so the colours stay in bar order.
 *
 * They are drawn in the language of the channel change that ends the hero: flat
 * colour, hard edges, scanlines, slices torn sideways, and a reveal that climbs
 * in seven steps instead of fading.
 *
 * As the sets land the bars let go of them. In seven steps they move to seven
 * equal columns, widen and come in front of the pile, until they cover the frame.
 * That picture is the first frame of the channel change, which takes over from
 * there and cuts to the services.
 *
 * Nothing here runs on the clock. The tears, the reveal and the widening are
 * functions of values the hero timeline already scrubs, so a reverse scroll
 * plays the same frames backwards.
 */

/** One bar per colour in LIQUID_HEX, in that order. */
const COUNT = LIQUID_HEX.length
/** The bars stand this far behind the centre of the pile, between the sets and the wall. */
const BEHIND = 3
/** A bar runs this far past the edge of the frame, in half viewport heights, so its end is never seen. */
const OVERSHOOT = 1.08
/** Width of one bar, as a share of the viewport width, and its floor as a share of the height. */
const BAR_WIDTH = 0.05
const BAR_WIDTH_MIN = 0.04
/** The quad is this many bar widths wide, which leaves room for a slice to tear sideways. */
const QUAD = 3
/** Height of one slice, as a share of the viewport height. */
const SLICE = 0.03
/** How many times the tears re-deal across the burst. */
const TICKS = 18

const BAR_VERTEX = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const BAR_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uPaper;
  uniform float uReveal;
  uniform float uFlow;
  uniform float uSeed;
  uniform float uRows;
  uniform float uBase;
  uniform float uTear;
  uniform float uUp;
  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    /* The bar grows from one end in seven hard steps, like the wipe of the cut. */
    float grown = floor(uReveal * 7.0 + 0.001) / 7.0;
    float along = mix(1.0 - vUv.y, vUv.y, uUp);
    if (along > grown) discard;

    /* Rows are counted from the middle of the frame, so a tear stays put while its set moves. */
    float row = floor(vUv.y * uRows + uBase);
    /* Tears hold for a stretch of scroll and then re-deal, so they step and never slide. */
    float tick = floor(uFlow * ${TICKS.toFixed(1)});
    /* Slices tear in blocks of three, so a tear reads as a band and not as noise. */
    float block = floor(row / 3.0);
    float torn = step(0.7, hash21(vec2(block + uSeed * 17.0, tick)));
    /* uTear runs to zero as the bars widen: the last step is seven clean, solid bars. */
    float shift = torn * (hash21(vec2(block * 1.9 + uSeed, tick + 5.0)) - 0.5) * 1.7 * uTear;
    /* A few single slices drop out and leave a gap. */
    if (hash21(vec2(row + uSeed * 31.0, tick + 11.0)) < 0.07 * uTear) discard;

    float across = (vUv.x - 0.5) * ${QUAD.toFixed(1)} - shift;
    if (abs(across) > 0.5) discard;

    /* Now and then a slice shows the white bar the paint replaced. */
    float white = step(1.0 - 0.045 * uTear, hash21(vec2(row * 0.7 + uSeed * 3.0, tick + 23.0)));
    vec3 color = mix(uColor, uPaper, white);
    /* Scanlines, two dark pixels in five, the same as the cut. */
    color *= mix(1.0, 0.7, step(fract(gl_FragCoord.y / 5.0), 0.4));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

export type BarAnchor = {
  pivot: THREE.Object3D
  /** Centre of the set with the pile stacked. */
  rest: THREE.Vector3
}

export type LiquidStrokes = {
  /**
   * Places the bars for this frame. Hides them when `reveal` is ~0.
   * `wipe` runs 0 to 1 as the bars leave the sets and cover the frame.
   */
  update: (
    tvs: readonly BarAnchor[],
    camera: THREE.Camera,
    burst: number,
    reveal: number,
    wipe: number,
  ) => void
}

/** Scratch basis. Reused every frame so the layout allocates nothing. */
const forward = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3()
const anchor = new THREE.Vector3()
const reach = new THREE.Vector3()

function barMaterial(index: number) {
  return new THREE.ShaderMaterial({
    name: "SignalBar",
    vertexShader: BAR_VERTEX,
    fragmentShader: BAR_FRAGMENT,
    side: THREE.DoubleSide,
    /* Hard edges only, cut with discard. In the late queue so the widened bars can draw over everything. */
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      uColor: { value: new THREE.Color(LIQUID_HEX[index]) },
      uPaper: { value: new THREE.Color(PAPER_HEX) },
      uReveal: { value: 0 },
      uFlow: { value: 0 },
      /* Offsets the tears so the seven bars do not tear in the same rows. */
      uSeed: { value: index * 1.37 + 0.5 },
      uRows: { value: 1 },
      uBase: { value: 0 },
      uTear: { value: 1 },
      /* Neighbours shoot to opposite edges of the frame. */
      uUp: { value: index % 2 },
    },
  })
}

/** Adds the bars to `parent` and returns the per-frame update. Hidden until the burst. */
export function createLiquidStrokes(parent: THREE.Object3D): LiquidStrokes {
  const geometry = new THREE.PlaneGeometry(1, 1)
  const meshes = LIQUID_HEX.map((_, index) => {
    const mesh = new THREE.Mesh(geometry, barMaterial(index))
    mesh.name = `signal-bar-${index}`
    mesh.visible = false
    mesh.frustumCulled = false
    parent.add(mesh)
    return mesh
  })

  /* The seven sets that carry a bar, left to right on screen, picked once per pile. */
  let source: readonly BarAnchor[] | null = null
  let carriers: BarAnchor[] = []
  const pick = (tvs: readonly BarAnchor[]) => {
    if (tvs === source) return carriers
    source = tvs
    /* Screen-right is -Z, so the largest z is the leftmost set. */
    const sorted = [...tvs].sort((a, b) => b.rest.z - a.rest.z)
    const last = sorted.length - 1
    carriers = LIQUID_HEX.map((_, i) => sorted[last <= 0 ? 0 : Math.round((i * last) / (COUNT - 1))])
    return carriers
  }

  const update: LiquidStrokes["update"] = (tvs, camera, burst, reveal, wipe) => {
    const lens = camera as THREE.PerspectiveCamera
    if (reveal <= 0.01 || tvs.length === 0 || !lens.isPerspectiveCamera) {
      for (const mesh of meshes) mesh.visible = false
      return
    }
    const sets = pick(tvs)

    /* lookAt() writes the quaternion before the world matrix, so refresh it. */
    camera.updateMatrixWorld()
    camera.getWorldDirection(forward)
    right.setFromMatrixColumn(camera.matrixWorld, 0)
    up.setFromMatrixColumn(camera.matrixWorld, 1)

    /* A plane facing the camera, behind the pile. Sizes below are shares of the viewport at that depth. */
    anchor.set(...PILE.centre).addScaledVector(forward, BEHIND)
    const depth = reach.copy(anchor).sub(camera.position).dot(forward)
    const halfH = depth * Math.tan(THREE.MathUtils.degToRad(lens.fov) / 2)
    const halfW = halfH * lens.aspect
    /* Middle of the view at that depth. Everything below is laid out around it. */
    anchor.copy(camera.position).addScaledVector(forward, depth)

    const width = Math.max(BAR_WIDTH * halfW * 2, BAR_WIDTH_MIN * halfH * 2)
    const slice = SLICE * halfH * 2
    /* The widening moves in the seven steps of the wipe, never smoothly. */
    const cover = Math.floor(Math.min(1, Math.max(0, wipe)) * 7 + 0.001) / 7
    const column = (halfW * 2) / COUNT
    const edge = halfH * OVERSHOOT

    for (let i = 0; i < COUNT; i++) {
      const mesh = meshes[i]
      const material = mesh.material as THREE.ShaderMaterial

      /* Where the set is on screen, carried back to the plane of the bars. */
      reach.copy(sets[i].pivot.position).sub(camera.position)
      const away = Math.max(reach.dot(forward), 0.001)
      const setX = (reach.dot(right) / away) * depth
      const setY = (reach.dot(up) / away) * depth

      /* Tied: from the set to one edge of the frame. Covering: the whole height of its column. */
      const far = i % 2 === 1 ? edge : -edge
      const low = THREE.MathUtils.lerp(Math.min(setY, far), -edge, cover)
      const high = THREE.MathUtils.lerp(Math.max(setY, far), edge, cover)
      const across = THREE.MathUtils.lerp(setX, -halfW + (i + 0.5) * column, cover)
      const wide = THREE.MathUtils.lerp(width, column * 1.02, cover)
      const height = Math.max(high - low, 0.0001)

      mesh.position
        .copy(anchor)
        .addScaledVector(right, across)
        .addScaledVector(up, (low + high) / 2)
      mesh.quaternion.copy(camera.quaternion)
      mesh.scale.set(wide * QUAD, height, 1)
      mesh.visible = true
      /* Behind the sets while tied to them; over the whole scene from the first step of the widening. */
      material.depthTest = cover === 0
      mesh.renderOrder = cover === 0 ? 0 : 999
      material.uniforms.uReveal.value = reveal
      material.uniforms.uFlow.value = burst
      material.uniforms.uRows.value = height / slice
      material.uniforms.uBase.value = low / slice
      material.uniforms.uTear.value = 1 - cover
    }
  }

  return { update }
}
