/**
 * Brand icons, built from the traced logo in src/assets/brand/.
 *
 *   public/favicon.svg            browser tab (hat-and-camera bust, light on the site's dark paper)
 *   public/favicon.ico            16, 32 and 48 px, for browsers and tools that want .ico
 *   public/apple-touch-icon.png   180 px, iOS home screen (square; iOS rounds the corners)
 *   public/icon-192.png, icon-512.png       web app manifest
 *   public/icon-maskable-512.png  Android adaptive icon (extra padding for the safe zone)
 *   public/brand/logo.png         512 px full mark, dark on white: the `logo` in structured data
 *   public/brand/mark.svg         full mark in the site's ink colour, for anyone linking it
 *
 * Usage: npm run icons
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brand = path.join(root, 'src', 'assets', 'brand');
const pub = path.join(root, 'public');

// The site's own colours (src/styles/globals.css): paper and ink.
const PAPER = '#04090c';
const INK = '#ebeff2';

async function shape(file) {
  const svg = await fs.readFile(path.join(brand, file), 'utf8');
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const [, d] = svg.match(/ d="([^"]+)"/);
  return { w: Number(w), h: Number(h), d };
}

/**
 * A square icon: `shape` centred horizontally, standing on the bottom padding, on `bg`.
 * `pad` is the share of the side left empty on each edge; `radius` rounds the square.
 */
function iconSvg({ w, h, d }, { bg, fg, pad, radius = 0, anchor = 'bottom' }) {
  const side = Math.max(w, h) / (1 - 2 * pad);
  const ox = (side - w) / 2;
  const oy = anchor === 'bottom' ? side * (1 - pad) - h : (side - h) / 2;
  const rect = bg ? `<rect width="${side}" height="${side}" rx="${side * radius}" fill="${bg}"/>` : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side.toFixed(1)} ${side.toFixed(1)}">` +
    `${rect}<path transform="translate(${ox.toFixed(1)} ${oy.toFixed(1)})" fill="${fg}" fill-rule="evenodd" d="${d}"/></svg>\n`
  );
}

const png = (svg, size) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** An .ico holding PNG images (supported by every current browser and Windows). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2);
    e.writeUInt8(0, 3);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const bust = await shape('bust.svg');
const mark = await shape('mark.svg');
await fs.mkdir(path.join(pub, 'brand'), { recursive: true });

const tab = iconSvg(bust, { bg: PAPER, fg: INK, pad: 0.1, radius: 0.2 });
await fs.writeFile(path.join(pub, 'favicon.svg'), tab);
await fs.writeFile(
  path.join(pub, 'favicon.ico'),
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(tab, size) })))),
);

const square = iconSvg(bust, { bg: PAPER, fg: INK, pad: 0.14 });
await fs.writeFile(path.join(pub, 'apple-touch-icon.png'), await png(square, 180));
await fs.writeFile(path.join(pub, 'icon-192.png'), await png(square, 192));
await fs.writeFile(path.join(pub, 'icon-512.png'), await png(square, 512));
// Maskable: launchers crop to a circle of 80% of the side, so keep the figure inside it.
const maskable = iconSvg(bust, { bg: PAPER, fg: INK, pad: 0.22, anchor: 'centre' });
await fs.writeFile(path.join(pub, 'icon-maskable-512.png'), await png(maskable, 512));

// Structured-data logo: search engines show it on white, so dark ink on white.
const logo = iconSvg(mark, { bg: '#ffffff', fg: PAPER, pad: 0.08, anchor: 'centre' });
await fs.writeFile(path.join(pub, 'brand', 'logo.png'), await png(logo, 512));
await fs.writeFile(
  path.join(pub, 'brand', 'mark.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mark.w} ${mark.h}"><path fill="${INK}" fill-rule="evenodd" d="${mark.d}"/></svg>\n`,
);

console.log('Wrote favicon.svg, favicon.ico, apple-touch-icon.png, icon-192/512, icon-maskable-512, brand/logo.png, brand/mark.svg');
