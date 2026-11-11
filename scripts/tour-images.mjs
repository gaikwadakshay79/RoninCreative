/**
 * Flat pictures from a Marzipano Tool tour, made from the tour's own tiles.
 *
 * For each scene it takes the cube face the scene opens on (front, right,
 * back or left, from its starting yaw), joins that face's tiles and crops a
 * band around the horizon:
 *
 *   public/panoramas/<id>-poster.jpg   16:9, 1280px: the viewer's poster (first scene)
 *   media/originals/<id>-<n>.jpg       3:2, full face width: one still per scene,
 *                                      for the portfolio (then run `npm run media`)
 *
 * Usage: npm run tour-images -- <tour folder name> <panorama id>
 *        npm run tour-images -- panshet panshet
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [tourName, id] = process.argv.slice(2);
if (!tourName || !id) {
  console.error('Usage: npm run tour-images -- <tour folder name> <panorama id>');
  process.exit(1);
}

const tourDir = path.join(root, 'public', 'tours', tourName);
const posterOut = path.join(root, 'public', 'panoramas', `${id}-poster.jpg`);
const stillsDir = path.join(root, 'media', 'originals');

// data.js is a plain script that sets APP_DATA; run it in an empty sandbox to read it.
const sandbox = {};
vm.runInNewContext(`${await fs.readFile(path.join(tourDir, 'data.js'), 'utf8')}\nthis.APP_DATA = APP_DATA;`, sandbox);
const scenes = sandbox.APP_DATA?.scenes ?? [];
if (scenes.length === 0) throw new Error(`No scenes in ${path.join(tourDir, 'data.js')}`);

/** The face a scene opens on, joined from the tiles of the largest level up to `maxSize`. */
async function face(scene, maxSize) {
  const yaw = scene.initialViewParameters?.yaw ?? 0;
  const quarter = ((Math.round(yaw / (Math.PI / 2)) % 4) + 4) % 4;
  const name = ['f', 'r', 'b', 'l'][quarter];
  const levels = scene.levels.map((level, index) => ({ ...level, index })).filter((level) => !level.fallbackOnly);
  const level = levels.filter((l) => l.size <= maxSize).at(-1) ?? levels[0];
  const count = Math.ceil(level.size / level.tileSize);
  const tiles = [];
  for (let y = 0; y < count; y += 1) {
    for (let x = 0; x < count; x += 1) {
      tiles.push({
        input: path.join(tourDir, 'tiles', scene.id, String(level.index), name, String(y), `${x}.jpg`),
        left: x * level.tileSize,
        top: y * level.tileSize,
      });
    }
  }
  const buffer = await sharp({ create: { width: level.size, height: level.size, channels: 3, background: '#000' } })
    .composite(tiles)
    .png()
    .toBuffer();
  return { buffer, size: level.size, name };
}

/** A horizontal band of the face, centred on the horizon, `ratio` wide to 1 tall. */
const band = ({ buffer, size }, ratio) => {
  const height = Math.round(size / ratio);
  return sharp(buffer).extract({ left: 0, top: Math.round((size - height) / 2), width: size, height });
};

await fs.mkdir(path.dirname(posterOut), { recursive: true });
await fs.mkdir(stillsDir, { recursive: true });

const first = await face(scenes[0], 2048);
await band(first, 16 / 9).resize(1280, 720).jpeg({ quality: 78, mozjpeg: true }).toFile(posterOut);
console.log(`poster  ${path.relative(root, posterOut)} (scene "${scenes[0].name}", face ${first.name})`);

for (const [index, scene] of scenes.entries()) {
  const picture = await face(scene, 4096);
  const out = path.join(stillsDir, `${id}-${index + 1}.jpg`);
  await band(picture, 3 / 2).jpeg({ quality: 90, mozjpeg: true }).toFile(out);
  console.log(`still   ${path.relative(root, out)} (scene "${scene.name}", face ${picture.name}, ${picture.size}px)`);
}
console.log('Run `npm run media` to build the stills for the site.');
