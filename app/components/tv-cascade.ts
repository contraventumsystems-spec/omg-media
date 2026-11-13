import * as THREE from "three"
import {
  createHoleGroundMaterial,
  createHoleWellMaterial,
  createStreamMaterial,
} from "@/app/components/tv-shaders"
import { LIQUID_HEX } from "@/app/lib/bars"

/**
 * The cascade: one stream of paint per bar screen, and the hole they fall into.
 *
 * A stream is a tube along a fixed path. The path starts inside the glass, runs
 * down it, steps over the cabinet's lip, falls past the front of the pile and
 * then swings back and down to the hole, far under and behind the pile. Nothing
 * here animates: the timeline moves the paint along the path through uniforms
 * (see createStreamMaterial), so the geometry is only rebuilt when the hole moves,
 * which happens when the viewport changes shape.
 */

/** A bar screen's glass as a flat frame: where it is, which way it faces, how big it is. */
export type GlassFrame = {
  /** Middle of the glass, on its front-most plane. */
  centre: THREE.Vector3
  /** Out of the screen, towards the viewer. */
  normal: THREE.Vector3
  /** Along the glass towards screen-right. */
  right: THREE.Vector3
  up: THREE.Vector3
  halfWidth: number
  halfHeight: number
  /** Bar position (0 to 1) at the middle of the glass, and its change per world unit to the right. */
  stripe: [number, number]
}

const UP = new THREE.Vector3(0, 1, 0)

/**
 * The bar-screen mesh also holds a drip and a share of a pool, so only vertices
 * above `screenBottom` count as glass. Televisions in the pile are turned and
 * tipped, so the frame is measured from the triangles rather than assumed.
 */
export function measureGlass(mesh: THREE.Mesh, screenBottom: number): GlassFrame | null {
  const geometry = mesh.geometry
  const positions = geometry.getAttribute("position")
  const uvs = geometry.getAttribute("uv")
  const index = geometry.getIndex()
  if (!positions || !uvs) return null

  const world: THREE.Vector3[] = []
  for (let i = 0; i < positions.count; i++) {
    world.push(new THREE.Vector3().fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld))
  }

  /* Area-weighted normal of the glass triangles. */
  const normal = new THREE.Vector3()
  const ab = new THREE.Vector3()
  const ac = new THREE.Vector3()
  const used = new Set<number>()
  const triangles = index ? index.count / 3 : positions.count / 3
  for (let t = 0; t < triangles; t++) {
    const a = index ? index.getX(t * 3) : t * 3
    const b = index ? index.getX(t * 3 + 1) : t * 3 + 1
    const c = index ? index.getX(t * 3 + 2) : t * 3 + 2
    if (world[a].y < screenBottom || world[b].y < screenBottom || world[c].y < screenBottom) continue
    ab.subVectors(world[b], world[a])
    ac.subVectors(world[c], world[a])
    const face = ab.cross(ac)
    /* The pile faces +X; flip faces wound the other way so they add up instead of cancelling. */
    if (face.x < 0) face.negate()
    normal.add(face)
    used.add(a).add(b).add(c)
  }
  if (used.size < 3 || normal.lengthSq() === 0) return null
  normal.normalize()

  const right = new THREE.Vector3().crossVectors(UP, normal).normalize()
  const up = new THREE.Vector3().crossVectors(normal, right)

  const origin = new THREE.Vector3()
  used.forEach((i) => origin.add(world[i]))
  origin.divideScalar(used.size)

  let minR = Infinity
  let maxR = -Infinity
  let minU = Infinity
  let maxU = -Infinity
  let maxN = -Infinity
  let sumR = 0
  let sumS = 0
  const samples: [number, number][] = []
  const offset = new THREE.Vector3()
  used.forEach((i) => {
    offset.subVectors(world[i], origin)
    const r = offset.dot(right)
    const u = offset.dot(up)
    minR = Math.min(minR, r)
    maxR = Math.max(maxR, r)
    minU = Math.min(minU, u)
    maxU = Math.max(maxU, u)
    maxN = Math.max(maxN, offset.dot(normal))
    /* The stripe texture had eight columns; the eighth was black. */
    const stripe = uvs.getX(i) / 0.875
    samples.push([r, stripe])
    sumR += r
    sumS += stripe
  })

  /* Least-squares line through (position across the glass, bar position). */
  const meanR = sumR / samples.length
  const meanS = sumS / samples.length
  let covariance = 0
  let variance = 0
  for (const [r, stripe] of samples) {
    covariance += (r - meanR) * (stripe - meanS)
    variance += (r - meanR) * (r - meanR)
  }
  const slope = variance > 0 ? covariance / variance : 0
  const midR = (minR + maxR) / 2

  const centre = origin
    .clone()
    .addScaledVector(right, midR)
    .addScaledVector(up, (minU + maxU) / 2)
    .addScaledVector(normal, maxN)

  return {
    centre,
    normal,
    right,
    up,
    halfWidth: (maxR - minR) / 2,
    halfHeight: (maxU - minU) / 2,
    stripe: [meanS + slope * (midR - meanR), slope],
  }
}

export type StreamSource = {
  /** Place of the screen in the pile, top first. Also its slot in the hero rig. */
  order: number
  glass: GlassFrame
  seed: number
}

export type Stream = {
  order: number
  glass: GlassFrame
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>
  /** Path length, and the distance along it at which the paint leaves the cabinet. */
  length: number
  lip: number
  /** The path itself, for placing droplets on it. Null until the first layout. */
  curve: THREE.CatmullRomCurve3 | null
  /** Under-damped follower of the leading edge; its lag bows the strand a little. */
  lag: { value: number; velocity: number }
}

export type Cascade = {
  group: THREE.Group
  streams: Stream[]
  hole: {
    centre: THREE.Vector3
    radius: number
    ground: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>
    well: THREE.Group
  }
  /** Droplets that part from the paint at pinch-off: DROPLETS instances per stream, in stream order. */
  droplets: THREE.InstancedMesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
  /**
   * Places one stream's droplets. Everything comes from the timeline values, so
   * a scrub in either direction puts them back where they were.
   *   head     leading edge, in world units along the path
   *   stretch  how long the fall has pulled the drop
   *   scale    0 hides them
   *   count    how many of the stream's droplets to draw
   */
  placeDroplets: (index: number, head: number, stretch: number, scale: number, count: number) => void
  /** Moves the hole and rebuilds every path to it. */
  layout: (centre: THREE.Vector3, radius: number) => void
  setDetail: (lite: boolean) => void
}

/** Repeatable random in 0..1, so a stream keeps its shape between rebuilds. */
function random(seed: number, salt: number) {
  const value = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453
  return value - Math.floor(value)
}

/** Paint is this far in front of the glass, so it never fights the tube for depth. */
const FILM = 0.035
/** Thickness of the paint while it is still a film on the glass. */
const FILM_DEPTH = 0.04
/** Radius of a strand in free fall, before its own variation. */
const STRAND = 0.23
const DROP = 0.56
/** Width of the sheet as it clears the lip, as a share of the film on the glass. */
const SHEET = 0.66
/** Half-thickness of that sheet, and of the bulge on the lip, for a set of base size. */
const SHEET_DEPTH = 0.13
const BULGE = 0.12

function streamPath(
  glass: GlassFrame,
  hole: { centre: THREE.Vector3; radius: number },
  slot: number,
  count: number,
  front: number,
  seed: number,
) {
  const { centre, normal, right, up, halfWidth, halfHeight } = glass
  /* Televisions in the pile are different sizes; the lip scales with the set. */
  const size = halfHeight / 1.2
  const at = (across: number, rise: number, out: number) =>
    centre
      .clone()
      .addScaledVector(right, across)
      .addScaledVector(up, rise)
      .addScaledVector(normal, out)

  /* Inside the screen: the paint wells up just above the middle of the glass and runs down it. */
  const well = at(0, -halfHeight * 0.3, FILM)
  const sill = at(0, -halfHeight * 0.97, FILM)
  /* Over the cabinet's lower edge, which stands proud of the glass. */
  const lip = at(0, -halfHeight - 0.34 * size, FILM + 0.42 * size)
  const points = [well, sill, lip]

  /* Free fall, bowed outwards so the paint runs over the front of the pile, not through it. */
  const drop = lip.clone().addScaledVector(normal, 0.3 * size)
  drop.y -= 1.15 * size
  points.push(drop)

  const spread = count > 1 ? slot / (count - 1) - 0.5 : 0
  const foot = new THREE.Vector3(
    Math.max(front + 0.9, drop.x + 0.5) + random(seed, 1) * 0.9,
    -0.6 - random(seed, 2) * 0.8,
    THREE.MathUtils.lerp(drop.z, hole.centre.z, 0.1) + spread * 1.4,
  )
  if (drop.y - foot.y > 3) {
    const bow = drop.clone().lerp(foot, 0.52)
    bow.x += 0.22 * (foot.x - drop.x) + 0.5
    bow.y += 0.1 * (drop.y - foot.y)
    points.push(bow)
  }
  points.push(foot)

  /*
   * Under the pile there is no floor. The paint keeps falling and is drawn back
   * towards the hole: it drops fast first and drifts back late, a long curve
   * rather than a straight line. Each stream enters at its own place on the near rim.
   */
  const angle = THREE.MathUtils.degToRad(spread * 150)
  const rim = new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle))
  const entry = hole.centre.clone().addScaledVector(rim, hole.radius * 0.5)
  /* `wander` bends the upper part of the fall only; the approach to the rim stays a clean arc. */
  const toward = (fall: number, drift: number, wander: number) =>
    new THREE.Vector3(
      THREE.MathUtils.lerp(foot.x, entry.x, drift),
      THREE.MathUtils.lerp(foot.y, entry.y, fall),
      THREE.MathUtils.lerp(foot.z, entry.z, drift) + (random(seed, 3 + fall) - 0.5) * wander,
    )
  points.push(toward(0.3, 0.05, 1.8), toward(0.58, 0.3, 1.2), toward(0.8, 0.66, 0), toward(0.93, 0.9, 0))
  /*
   * Through the opening and down the well. The path crosses the rim already
   * falling, with no control point on the rim itself: a point there makes a
   * corner, and the spline answers a corner with a small hook.
   */
  points.push(entry.clone().setY(entry.y - hole.radius * 0.4))
  points.push(
    hole.centre
      .clone()
      .addScaledVector(rim, hole.radius * 0.46)
      .setY(hole.centre.y - hole.radius * 1.3),
  )

  const glassRun = well.distanceTo(sill)
  return { points, glassRun, lipRun: glassRun + sill.distanceTo(lip), size, halfWidth }
}

function streamGeometry(
  geometry: THREE.BufferGeometry,
  glass: GlassFrame,
  hole: { centre: THREE.Vector3; radius: number },
  slot: number,
  count: number,
  front: number,
  seed: number,
  rings: number,
) {
  const sides = 10
  const path = streamPath(glass, hole, slot, count, front, seed)
  const curve = new THREE.CatmullRomCurve3(path.points, false, "centripetal")
  /* More arc-length samples than rings, so getPointAt stays accurate on a long path. */
  curve.arcLengthDivisions = 600
  const length = curve.getLength()

  /*
   * Rings are packed towards the screen. The path is some 80 units long and the
   * first two of them, on the glass and over the lip, need most of the shape.
   */
  const lipShare = path.lipRun / length
  const along = (i: number) => {
    const t = i / (rings - 1)
    return t < 0.22
      ? (t / 0.22) * lipShare * 1.6
      : lipShare * 1.6 + (1 - lipShare * 1.6) * Math.pow((t - 0.22) / 0.78, 1.15)
  }

  const count3 = rings * sides * 3
  const position = new Float32Array(count3)
  const aSide = new Float32Array(count3)
  const aOut = new Float32Array(count3)
  const aRing = new Float32Array(rings * sides * 2)
  const aArc = new Float32Array(rings * sides)
  const aBase = new Float32Array(rings * sides * 2)

  const point = new THREE.Vector3()
  const tangent = new THREE.Vector3()
  const side = glass.right.clone()
  const out = new THREE.Vector3()
  const filmWidth = path.halfWidth * 0.95
  const cap = path.glassRun * 0.32
  /*
   * Poured paint, not a tap: it clears the lip as a broad sheet, most of the
   * width of the picture, and gravity draws it out slowly. `reach` is the fall
   * over which the sheet loses half of its extra width.
   */
  const sheet = filmWidth * SHEET
  const reach = 2.4 * path.size
  const gatherFrom = path.glassRun * 0.7
  const strand = STRAND * (0.85 + 0.35 * random(seed, 7))
  const phaseA = random(seed, 8) * 6.28
  const phaseB = random(seed, 9) * 6.28

  for (let i = 0; i < rings; i++) {
    const u = Math.min(along(i), 1)
    const arc = u * length
    curve.getPointAt(u, point)
    curve.getTangentAt(u, tangent)

    /* Carry the side axis along the path without twisting it. */
    side.addScaledVector(tangent, -side.dot(tangent)).normalize()
    out.crossVectors(tangent, side)

    /* Organic edge: two slow waves, plus a strand that is fatter far away so depth does not erase it. */
    const wobble = 1 + 0.18 * Math.sin(arc * 0.9 + phaseA) + 0.1 * Math.sin(arc * 2.3 + phaseB)
    const far = THREE.MathUtils.smoothstep(u, 0.3, 1)
    const thread = strand * wobble * (1 + 0.3 * far)

    /* On the glass: a rounded surface that widens to the full picture. */
    const rise = Math.min(arc / cap, 1)
    const film = filmWidth * Math.sqrt(1 - (1 - rise) * (1 - rise))
    /* Along the bottom of the glass it draws in a little and thickens: the paint gathers before it goes over. */
    const gathered = THREE.MathUtils.smoothstep(
      (arc - gatherFrom) / (path.lipRun - gatherFrom),
      0,
      1,
    )
    /* Past the lip: 0 a full sheet, 1 a strand. Quick at first, then a long slow taper. */
    const fall = Math.max(arc - path.lipRun, 0)
    const thin = 1 - 1 / (1 + fall / reach)
    const ribbon = THREE.MathUtils.lerp(sheet, thread, thin)
    const halfWidth = THREE.MathUtils.lerp(film, ribbon, gathered)
    /* The bulge sits on the lip itself, where the paint piles up against the edge of the cabinet. */
    const pile = (arc - path.lipRun) / (0.45 * path.size)
    const bulge = BULGE * path.size * Math.exp(-pile * pile)
    const body = THREE.MathUtils.lerp(SHEET_DEPTH * path.size, thread * 0.82, thin)
    const halfDepth = THREE.MathUtils.lerp(FILM_DEPTH, body, gathered) + bulge

    for (let j = 0; j < sides; j++) {
      const v = i * sides + j
      const theta = (j / sides) * Math.PI * 2
      position.set([point.x, point.y, point.z], v * 3)
      aSide.set([side.x, side.y, side.z], v * 3)
      aOut.set([out.x, out.y, out.z], v * 3)
      aRing.set([Math.cos(theta), Math.sin(theta)], v * 2)
      aArc[v] = arc
      aBase.set([halfWidth, halfDepth], v * 2)
    }
  }

  const indices: number[] = []
  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < sides; j++) {
      const a = i * sides + j
      const b = i * sides + ((j + 1) % sides)
      const c = a + sides
      const d = b + sides
      indices.push(a, c, b, b, c, d)
    }
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3))
  geometry.setAttribute("aSide", new THREE.BufferAttribute(aSide, 3))
  geometry.setAttribute("aOut", new THREE.BufferAttribute(aOut, 3))
  geometry.setAttribute("aRing", new THREE.BufferAttribute(aRing, 2))
  geometry.setAttribute("aArc", new THREE.BufferAttribute(aArc, 1))
  geometry.setAttribute("aBase", new THREE.BufferAttribute(aBase, 2))
  geometry.setIndex(indices)

  return { length, lip: path.lipRun, filmWidth, curve }
}

/** Droplets per stream. Lite devices draw only the first. */
export const DROPLETS = 3
const dropletMatrix = new THREE.Matrix4()
const dropletPoint = new THREE.Vector3()
const dropletScale = new THREE.Vector3()
const NO_TURN = new THREE.Quaternion()

/**
 * `front` is the forward-most face of the cabinets, which the paint has to clear.
 * The cascade starts with the hole at the origin; call layout() before drawing it.
 */
export function createCascade(
  sources: StreamSource[],
  front: number,
): Cascade {
  const group = new THREE.Group()
  group.name = "Cascade"
  let rings = 180

  const streams: Stream[] = sources.map((source) => {
    const material = createStreamMaterial({
      seed: random(source.seed, 4),
      length: 1,
      lip: 0,
      drop: DROP,
      stripe: [0.5, 0],
    })
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), material)
    mesh.name = `Stream ${source.order}`
    /* The shader moves every vertex, so the geometry's own bounds mean nothing. */
    mesh.frustumCulled = false
    mesh.visible = false
    group.add(mesh)
    return {
      order: source.order,
      glass: source.glass,
      mesh,
      length: 1,
      lip: 0,
      curve: null,
      lag: { value: 0, velocity: 0 },
    }
  })

  /* One sphere and one material for every droplet of every stream. */
  const droplets = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 10, 8),
    new THREE.MeshBasicMaterial({ toneMapped: false }),
    Math.max(streams.length * DROPLETS, 1),
  )
  droplets.name = "Droplets"
  droplets.frustumCulled = false
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0)
  const tint = new THREE.Color()
  for (let i = 0; i < droplets.count; i++) {
    droplets.setMatrixAt(i, hidden)
    /* Each takes one of the paint colours, so a stream sheds more than one band. */
    const seed = sources[Math.floor(i / DROPLETS)]?.seed ?? 1
    tint.set(LIQUID_HEX[Math.floor(random(seed, 20 + i) * LIQUID_HEX.length) % LIQUID_HEX.length])
    droplets.setColorAt(i, tint)
  }
  group.add(droplets)

  /* Unit-sized hole, scaled to the radius in layout(). The ground is wide enough to hide the well's wall. */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), createHoleGroundMaterial())
  ground.rotation.x = -Math.PI / 2
  ground.name = "Hole ground"
  const wall = createHoleWellMaterial()
  const well = new THREE.Group()
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.82, 1.5, 48, 1, true), wall)
  tube.position.y = -0.75
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(0.82, 48),
    new THREE.MeshBasicMaterial({ color: "#000000", toneMapped: false }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -1.5
  well.add(tube, floor)
  well.name = "Hole well"
  group.add(ground, well)
  const hole = { centre: new THREE.Vector3(), radius: 1, ground, well }

  /* Entry points on the rim follow the screens left to right, so strands do not cross on the way down. */
  const leftToRight = [...sources].sort((a, b) => b.glass.centre.z - a.glass.centre.z)

  const build = () => {
    streams.forEach((stream, index) => {
      const source = sources[index]
      const slot = leftToRight.indexOf(source)
      const { length, lip, filmWidth, curve } = streamGeometry(
        stream.mesh.geometry,
        stream.glass,
        hole,
        slot,
        streams.length,
        front,
        source.seed,
        rings,
      )
      const uniforms = stream.mesh.material.uniforms
      stream.length = length
      stream.lip = lip
      stream.curve = curve
      uniforms.uLength.value = length
      uniforms.uLip.value = lip
      uniforms.uStripe.value.set(stream.glass.stripe[0], stream.glass.stripe[1] * filmWidth)
      uniforms.uHole.value.copy(hole.centre)
      uniforms.uHoleRadius.value = hole.radius
    })
  }

  return {
    group,
    streams,
    hole,
    droplets,
    placeDroplets(index, head, stretch, scale, count) {
      const stream = streams[index]
      const seed = sources[index].seed
      /*
       * They form as the neck thins, just after the drop lets go, and are gone before
       * it lands. The drop creeps about one unit past the lip while it still hangs.
       */
      const pinch =
        THREE.MathUtils.smoothstep(head - stream.lip, 1.6, 3.4) *
        (1 - THREE.MathUtils.smoothstep(head / stream.length, 0.72, 0.92))
      for (let k = 0; k < DROPLETS; k++) {
        const slot = index * DROPLETS + k
        /* Strung out up the neck behind the drop, further apart the longer the fall has pulled it. */
        const arc = head - (0.25 + 0.6 * k + 0.4 * random(seed, 30 + k)) * (1 + 1.2 * stretch)
        const size = (0.2 - 0.04 * k) * (0.8 + 0.4 * random(seed, 40 + k)) * pinch * scale
        if (!stream.curve || k >= count || size <= 0.001 || arc < stream.lip + 0.35) {
          droplets.setMatrixAt(slot, hidden)
          continue
        }
        stream.curve.getPointAt(arc / stream.length, dropletPoint)
        /* Thrown clear of the drop to one side, alternating, and drifting out as they fall. */
        const aside =
          (k % 2 === 0 ? 1 : -1) * (DROP + 0.2 + 0.45 * stretch) * (0.8 + 0.5 * random(seed, 50 + k))
        dropletPoint.addScaledVector(stream.glass.right, aside)
        /* A falling drop is a little longer than it is wide. */
        dropletScale.set(size, size * (1 + 0.5 * stretch), size)
        droplets.setMatrixAt(slot, dropletMatrix.compose(dropletPoint, NO_TURN, dropletScale))
      }
      droplets.instanceMatrix.needsUpdate = true
    },
    layout(centre, radius) {
      hole.centre.copy(centre)
      hole.radius = radius
      ground.position.copy(centre)
      ground.scale.setScalar(radius)
      well.position.copy(centre)
      well.scale.setScalar(radius)
      ground.material.uniforms.uCentre.value.copy(centre)
      ground.material.uniforms.uRadius.value = radius
      wall.uniforms.uCentre.value.copy(centre)
      wall.uniforms.uRadius.value = radius
      build()
    },
    setDetail(lite) {
      const next = lite ? 110 : 180
      if (next === rings) return
      rings = next
      build()
    },
  }
}
