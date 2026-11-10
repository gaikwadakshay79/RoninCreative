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

/**
 * 360° panoramas: every equirectangular image (twice as wide as it is tall) in
 * media/panoramas/ becomes public/panoramas/<key>-3840.webp and -1920.webp for
 * the viewer, plus <key>-poster.jpg, a flat 16:9 crop shown before it loads.
 */
const PANO_SRC = path.join(root, 'media', 'panoramas');
const PANO_OUT = path.join(root, 'public', 'panoramas');

async function panoramas() {
  if (!(await exists(PANO_SRC))) return;
  const files = (await fs.readdir(PANO_SRC)).filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f)).sort();
  if (files.length === 0) return;
  await fs.mkdir(PANO_OUT, { recursive: true });
  let built = 0;

  for (const file of files) {
    const key = path.parse(file).name;
    const input = path.join(PANO_SRC, file);
    const meta = await sharp(input).metadata();
    if (Math.abs(meta.width / meta.height - 2) > 0.02) {
      console.warn(`skipped panorama ${file}: it must be equirectangular, exactly twice as wide as it is tall`);
      continue;
    }
    const poster = path.join(PANO_OUT, `${key}-poster.jpg`);
    const srcStat = await fs.stat(input);
    if (!force && (await exists(poster)) && (await fs.stat(poster)).mtimeMs >= srcStat.mtimeMs) continue;

    for (const width of [3840, 1920]) {
      await sharp(input)
        .resize({ width, height: width / 2, fit: 'fill', withoutEnlargement: false })
        .webp({ quality: 80 })
        .toFile(path.join(PANO_OUT, `${key}-${width}.webp`));
    }
    // The poster is the middle third of the panorama, looking at its centre.
    const cropWidth = Math.round(meta.width / 3);
    const cropHeight = Math.round((cropWidth * 9) / 16);
    await sharp(input)
      .extract({
        left: Math.round((meta.width - cropWidth) / 2),
        top: Math.max(0, Math.round(meta.height * 0.56 - cropHeight / 2)),
        width: cropWidth,
        height: cropHeight,
      })
      .resize({ width: 1280 })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(poster);
    built += 1;
    console.log(`built   panorama ${key}`);
  }
  console.log(`${files.length} panoramas, ${built} rebuilt.`);
}

main()
  .then(panoramas)
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
