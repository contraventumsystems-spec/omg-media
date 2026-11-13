/**
 * Phase 0, first pass, with no dependencies.
 * Reads the raw Sketchfab export and writes public/models/tv-pile.gltf, which:
 *   - drops the hidden Mixamo character, its skin and the baked animation
 *   - drops the three zero-scale nodes and the duplicate static frames
 *   - stops referencing the textures the shaders replace
 *     (static frames, the stripe textures, the halftone dots, the character)
 *
 * The .bin and the two TV ink textures are still read from
 * public/technical_difficulties, so the unused bytes inside scene.bin remain.
 * Decimation, mesh joins, meshopt and KTX2 are the later @gltf-transform pass.
 *
 * Run: node scripts/trim-model.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "public", "technical_difficulties");
const outDir = path.join(root, "public", "models");
const outFile = path.join(outDir, "tv-pile.gltf");
const sourceUri = "../technical_difficulties/";

const gltf = JSON.parse(fs.readFileSync(path.join(sourceDir, "scene.gltf"), "utf8"));

/** Materials whose meshes never reach the screen. */
const DROP_MATERIALS = new Set(["Material__20", "SCREEN.002", "SCREEN.003"]);
/** Materials drawn by a shader at runtime, so their textures are not fetched. */
const PROCEDURAL = /^(SCREEN|SCREEN\.001|small-polka-dot)/;

function localMatrix(node) {
  if (node.matrix) return node.matrix;
  const [tx, ty, tz] = node.translation ?? [0, 0, 0];
  const [x, y, z, w] = node.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale ?? [1, 1, 1];
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    tx, ty, tz, 1,
  ];
}

function multiply(a, b) {
  const out = new Array(16).fill(0);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const stats = { kept: 0, character: 0, duplicates: 0, collapsed: 0, empty: 0 };

/** Returns true when the node, or something under it, still draws. */
function prune(index, parentMatrix) {
  const node = gltf.nodes[index];
  const world = multiply(parentMatrix, localMatrix(node));
  const scale = Math.hypot(world[0], world[1], world[2]);

  if (node.mesh !== undefined) {
    const materials = gltf.meshes[node.mesh].primitives.map(
      (primitive) => gltf.materials[primitive.material]?.name ?? "",
    );
    const skinned = node.skin !== undefined;
    const dropped = materials.some((name) => DROP_MATERIALS.has(name));
    const collapsed = scale < 1e-4;

    if (skinned || dropped || collapsed) {
      if (skinned) stats.character++;
      else if (collapsed) stats.collapsed++;
      else stats.duplicates++;
      delete node.mesh;
      delete node.skin;
    } else {
      stats.kept++;
    }
  }

  node.children = (node.children ?? []).filter((child) => prune(child, world));
  if (node.children.length === 0) delete node.children;

  const draws = node.mesh !== undefined || node.children !== undefined;
  if (!draws) stats.empty++;
  return draws;
}

for (const scene of gltf.scenes) {
  scene.nodes = scene.nodes.filter((index) => prune(index, IDENTITY));
}

delete gltf.animations;
delete gltf.skins;

for (const material of gltf.materials) {
  if (!PROCEDURAL.test(material.name) && !DROP_MATERIALS.has(material.name)) continue;
  delete material.emissiveTexture;
  delete material.pbrMetallicRoughness?.baseColorTexture;
}

/* Only textures that a kept material still points at are fetched by the loader. */
const usedTextures = new Set();
for (const material of gltf.materials) {
  for (const slot of [material.emissiveTexture, material.pbrMetallicRoughness?.baseColorTexture]) {
    if (slot) usedTextures.add(slot.index);
  }
}
const usedImages = new Set([...usedTextures].map((index) => gltf.textures[index].source));

for (const buffer of gltf.buffers) buffer.uri = sourceUri + buffer.uri;
gltf.images.forEach((image, index) => {
  image.uri = usedImages.has(index) ? sourceUri + image.uri : "data:,";
});

gltf.asset.extras = {
  ...gltf.asset.extras,
  trimmedBy: "scripts/trim-model.mjs",
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(gltf));

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
const textureBytes = [...usedImages].reduce(
  (sum, index) => sum + fs.statSync(path.join(sourceDir, gltf.images[index].uri.replace(sourceUri, ""))).size,
  0,
);
console.log(`meshes kept ${stats.kept}`);
console.log(
  `removed: character ${stats.character}, duplicate static ${stats.duplicates}, zero-scale ${stats.collapsed}, empty nodes ${stats.empty}`,
);
console.log(`textures fetched: ${usedImages.size} (${kb(textureBytes)})`);
console.log(`wrote ${path.relative(root, outFile)} (${kb(fs.statSync(outFile).size)})`);
