/**
 * Media pipeline.
 *
 * Reads every image in media/originals/ and writes responsive AVIF and WebP
 * variants (plus one JPEG fallback) into public/media/, then records each
 * image's dimensions in src/data/media.manifest.json.
 *
 * The file name without its extension is the media key the site uses
 * (media/originals/hero-home.jpg -> key "hero-home"). To replace a picture,
 * overwrite the original with the same name and run `npm run media`.
 *
 * Usage: npm run media            (only images that changed)
 *        npm run media -- --force (rebuild everything)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'media', 'originals');
const OUT = path.join(root, 'public', 'media');
const MANIFEST = path.join(root, 'src', 'data', 'media.manifest.json');

const WIDTHS = [480, 800, 1200, 1600, 2400];
const FALLBACK_WIDTH = 1200;
const force = process.argv.includes('--force');

const exists = (file) => fs.access(file).then(() => true, () => false);

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const files = (await fs.readdir(SRC)).filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f)).sort();
  if (files.length === 0) {
    console.log('No images in media/originals/.');
    return;
  }

  const manifest = {};
  let built = 0;

  for (const file of files) {
    const key = path.parse(file).name;
    if (!/^[a-z0-9-]+$/.test(key)) {
      console.warn(`skipped ${file}: use lowercase letters, digits and hyphens in the file name`);
      continue;
    }
    const input = path.join(SRC, file);
    const image = sharp(input).rotate();
    const meta = await image.metadata();
    const landscape = (meta.orientation ?? 1) < 5;
    const width = landscape ? meta.width : meta.height;
    const height = landscape ? meta.height : meta.width;
    const widths = WIDTHS.filter((w) => w <= width);
    if (widths.length === 0) widths.push(width);

    const srcStat = await fs.stat(input);
    const fallback = path.join(OUT, `${key}-${FALLBACK_WIDTH}.jpg`);
    const fresh = !force && (await exists(fallback)) && (await fs.stat(fallback)).mtimeMs >= srcStat.mtimeMs;

    if (!fresh) {
      for (const w of widths) {
        const resized = sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
        await resized.clone().avif({ quality: 52, effort: 4 }).toFile(path.join(OUT, `${key}-${w}.avif`));
        await resized.clone().webp({ quality: 76 }).toFile(path.join(OUT, `${key}-${w}.webp`));
      }
      await sharp(input)
        .rotate()
        .resize({ width: FALLBACK_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(fallback);
      built += 1;
      console.log(`built   ${key} (${width}x${height}) -> ${widths.join(', ')}`);
    }

    manifest[key] = { width, height, widths };
  }

  await fs.writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`${files.length} images in the manifest, ${built} rebuilt.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
