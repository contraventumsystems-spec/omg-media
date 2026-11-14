import * as THREE from "three"
import { LIQUID_HEX } from "@/app/lib/bars"

/**
 * Seven brush strokes, one per paint colour, that stand in for the floor pool
 * while the sets are apart. Nothing here runs on the clock. Position, curl and
 * the wet highlight are functions of the burst progress the hero timeline
 * already scrubs, so a reverse scroll plays the same frames backwards.
 *
 * Each stroke is one ribbon on the pile's root, not a child of a set: the frame
 * loop reads where that set is and orbits it. The sets themselves are not moved.
 */

/** One ribbon per colour in LIQUID_HEX, in that order. */
const COUNT = LIQUID_HEX.length
/** Segments along the stroke. The width is a shader taper, so one row is enough. */
const SEGMENTS = 40
/**
 * How far a stroke sits from the centre of its set. Far enough that the whole
 * ribbon clears the cabinet; a closer orbit is swallowed by the shell.
 */
const RADIUS = 5.4
/** Pulled toward the camera so the mark sits in front of the glass, not inside it. */
const TOWARD_CAMERA = 2.4

const STROKE_VERTEX = /* glsl */ `
  uniform float uFlow;
  uniform float uSeed;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    float along = uv.x;
    /* A long bow, plus a curl that travels with the scroll, so the stroke is never a straight bar. */
    float spine = sin(along * 3.14159265) * 0.28;
    spine += sin(along * 6.2831853 + uSeed + uFlow * 6.2831853) * 0.08;
    /* A brush is thick through the middle and comes to a point at both ends. */
    float taper = pow(max(sin(along * 3.14159265), 0.0), 0.65);
    vec3 p = vec3(position.x, spine + position.y * mix(0.12, 1.0, taper), 0.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const STROKE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uFlow;
  uniform float uSeed;
  varying vec2 vUv;

  void main() {
    float across = abs(vUv.y - 0.5) * 2.0;
    /* The edge wanders along the stroke, so it reads as bristles and not a capsule. */
    float wander = 0.14 * sin(vUv.x * 18.0 + uSeed * 6.0) + 0.07 * sin(vUv.x * 7.0 + uFlow * 5.0);
    /* Soft outer edge, solid body: wet paint rather than a hairline. */
    float ink = 1.0 - smoothstep(0.78 + wander, 1.15 + wander, across);
    /* Both tips fade out. The geometry taper alone would end in a cut. */
    float tip = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
    float core = smoothstep(0.7, 0.0, across);
    vec3 color = uColor * mix(0.72, 1.0, core);
    /* One wet ridge runs the length of the stroke as the burst progresses. */
    float ridge = exp(-pow((vUv.x - uFlow) * 4.0, 2.0)) * (1.0 - across);
    color = mix(color, vec3(1.0), ridge * 0.42);
    float alpha = ink * tip * uOpacity;
    if (alpha < 0.02) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`

export type StrokeAnchor = { pivot: THREE.Object3D }

export type LiquidStrokes = {
  /** Places the ribbons for this frame. Hides them when `opacity` is ~0. */
  update: (
    tvs: readonly StrokeAnchor[],
    camera: THREE.Camera,
    burst: number,
    opacity: number,
  ) => void
}

/** Scratch basis. Reused every frame so the orbit allocates nothing. */
const forward = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3()

/** One shared ribbon. Colour, seed and flow are per material. */
function strokeGeometry() {
  return new THREE.PlaneGeometry(1, 0.46, SEGMENTS, 1)
}

function strokeMaterial(index: number) {
  return new THREE.ShaderMaterial({
    name: "LiquidStroke",
    vertexShader: STROKE_VERTEX,
    fragmentShader: STROKE_FRAGMENT,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
    uniforms: {
      uColor: { value: new THREE.Color(LIQUID_HEX[index]) },
      uOpacity: { value: 0 },
      uFlow: { value: 0 },
      /* Offsets the bristle wobble so the seven strokes are not the same mark. */
      uSeed: { value: index * 1.37 },
    },
  })
}

/** Adds the ribbons to `parent` and returns the per-frame update. Hidden until the burst. */
export function createLiquidStrokes(parent: THREE.Object3D): LiquidStrokes {
  const geometry = strokeGeometry()
  const meshes = LIQUID_HEX.map((_, index) => {
    const mesh = new THREE.Mesh(geometry, strokeMaterial(index))
    mesh.name = `liquid-stroke-${index}`
    mesh.visible = false
    mesh.renderOrder = 2
    /* Long enough to read as a brush sweep beside a set, not a speck on the glass. */
    mesh.scale.setScalar(4.2 + (index % 4) * 0.28)
    parent.add(mesh)
    return mesh
  })

  const update: LiquidStrokes["update"] = (tvs, camera, burst, opacity) => {
    const shown = opacity > 0.01 && tvs.length > 0
    if (!shown) {
      for (const mesh of meshes) mesh.visible = false
      return
    }

    /* lookAt() writes the quaternion before the world matrix, so refresh it. */
    camera.updateMatrixWorld()
    camera.getWorldDirection(forward)
    right.setFromMatrixColumn(camera.matrixWorld, 0)
    up.setFromMatrixColumn(camera.matrixWorld, 1)

    const last = tvs.length - 1
    for (let i = 0; i < COUNT; i++) {
      const mesh = meshes[i]
      const tv = tvs[last === 0 ? 0 : Math.round((i * last) / (COUNT - 1))]
      const phase = (i / COUNT) * Math.PI * 2
      /* Half a turn across the burst: a slow orbit that reverses with the scroll. */
      const angle = phase + burst * Math.PI
      const radius = (RADIUS + (i % 3) * 0.45) * (1 + 0.06 * Math.sin(burst * Math.PI * 2 + phase))
      const material = mesh.material as THREE.ShaderMaterial

      mesh.position.copy(tv.pivot.position)
      mesh.position.addScaledVector(right, Math.cos(angle) * radius)
      mesh.position.addScaledVector(up, Math.sin(angle) * radius * 0.82)
      mesh.position.addScaledVector(forward, -TOWARD_CAMERA)
      mesh.quaternion.copy(camera.quaternion)
      mesh.rotateZ(phase * 0.35 + burst * 0.5)
      mesh.visible = true
      material.uniforms.uOpacity.value = opacity
      material.uniforms.uFlow.value = burst
    }
  }

  return { update }
}
