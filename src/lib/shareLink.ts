import type { PanoLook } from '@/components/three-d/PanoViewer';

/**
 * Short share links: `?s=<token>` holds one picture, or one 360° scene and the
 * direction it faces. A token is packed into a few bytes and scrambled so the
 * address does not read as a list of settings. This hides the details from a
 * casual reader and is not security: the site's own code can reverse it.
 *
 * Token bytes: checksum (2), then scrambled: kind (1), name id (3), and for a
 * 360° view yaw, pitch and fov (2 each). That is 8 characters for a picture and
 * 16 for a view. Changing this layout needs a new kind, so old links still open.
 */

const KIND_PICTURE = 0x11;
const KIND_VIEW = 0x12;
const PICTURE_LENGTH = 4;
const VIEW_LENGTH = 10;
const SCRAMBLE_SALT = 0x52c1f3a7;
const WORD_MAX = 0xffff;

const YAW = { min: -180, max: 180 };
const PITCH = { min: -90, max: 90 };
const FOV = { min: 0, max: 180 };

type Range = typeof YAW;

/** What the address asks the page to open. */
export interface SharedLink {
  isPicture?: (media: string) => boolean;
  isScene?: (slug: string) => boolean;
  look?: PanoLook;
}

function hash32(bytes: Uint8Array): number {
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** A picture key or scene slug as a 3-byte id, so adding or reordering items keeps old links right. */
function nameId(name: string): number {
  const hash = hash32(new TextEncoder().encode(name));
  return (hash ^ (hash >>> 24)) & 0xffffff;
}

function checksum(body: Uint8Array): number {
  const hash = hash32(body);
  return (hash ^ (hash >>> 16)) & WORD_MAX;
}

/** XORs the body with a stream seeded by its checksum. Running it twice restores the body. */
function scramble(body: Uint8Array, check: number): Uint8Array {
  let state = ((check * 0x10001) ^ SCRAMBLE_SALT) >>> 0;
  return body.map((byte) => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return byte ^ ((mixed ^ (mixed >>> 14)) & 0xff);
  });
}

function seal(body: Uint8Array): string {
  const check = checksum(body);
  const bytes = new Uint8Array(body.length + 2);
  bytes[0] = check >>> 8;
  bytes[1] = check & 0xff;
  bytes.set(scramble(body, check), 2);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/** The token's body, or null if it is damaged or was edited. */
function unseal(token: string): Uint8Array | null {
  if (!/^[\w-]+$/.test(token) || (token.length !== 8 && token.length !== 16)) return null;
  let text: string;
  try {
    text = atob(token.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return null;
  }
  const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
  const check = ((bytes[0] ?? 0) << 8) | (bytes[1] ?? 0);
  const body = scramble(bytes.slice(2), check);
  return checksum(body) === check ? body : null;
}

function putName(body: Uint8Array, kind: number, name: string) {
  const id = nameId(name);
  body[0] = kind;
  body[1] = id >>> 16;
  body[2] = (id >>> 8) & 0xff;
  body[3] = id & 0xff;
}

function putAngle(body: Uint8Array, offset: number, value: number, { min, max }: Range) {
  const held = Math.min(max, Math.max(min, value));
  const word = Math.round(((held - min) / (max - min)) * WORD_MAX);
  body[offset] = word >>> 8;
  body[offset + 1] = word & 0xff;
}

function getAngle(body: Uint8Array, offset: number, { min, max }: Range): number {
  const word = ((body[offset] ?? 0) << 8) | (body[offset + 1] ?? 0);
  return min + (word / WORD_MAX) * (max - min);
}

/** The token for one picture. */
export function pictureToken(media: string): string {
  const body = new Uint8Array(PICTURE_LENGTH);
  putName(body, KIND_PICTURE, media);
  return seal(body);
}

/** The token for one 360° scene facing one direction, in degrees. */
export function viewToken(sceneSlug: string, look: PanoLook): string {
  const body = new Uint8Array(VIEW_LENGTH);
  putName(body, KIND_VIEW, sceneSlug);
  putAngle(body, 4, look.yaw, YAW);
  putAngle(body, 6, look.pitch, PITCH);
  putAngle(body, 8, look.fov, FOV);
  return seal(body);
}

function readToken(token: string): SharedLink | null {
  const body = unseal(token);
  if (!body) return null;
  const id = ((body[1] ?? 0) << 16) | ((body[2] ?? 0) << 8) | (body[3] ?? 0);
  const matches = (name: string) => nameId(name) === id;

  if (body[0] === KIND_PICTURE && body.length === PICTURE_LENGTH) return { isPicture: matches };
  if (body[0] === KIND_VIEW && body.length === VIEW_LENGTH) {
    const look = { yaw: getAngle(body, 4, YAW), pitch: getAngle(body, 6, PITCH), fov: getAngle(body, 8, FOV) };
    return look.fov > 0 && look.fov < 180 ? { isScene: matches, look } : null;
  }
  return null;
}

/** The direction in an old link (?yaw=&pitch=&fov=), if all of it is there and valid. */
function readOldLook(params: URLSearchParams): PanoLook | undefined {
  const angle = (name: string) => {
    const value = params.get(name);
    return value === null || value.trim() === '' ? Number.NaN : Number(value);
  };
  const look = { yaw: angle('yaw'), pitch: angle('pitch'), fov: angle('fov') };
  return Number.isFinite(look.yaw) && Number.isFinite(look.pitch) && look.fov > 0 && look.fov < 180 ? look : undefined;
}

/** Reads a short token, or the older ?image= and ?view=&yaw=&pitch=&fov= links. */
export function readSharedLink(params: URLSearchParams): SharedLink {
  const token = params.get('s');
  const fromToken = token ? readToken(token) : null;
  if (fromToken) return fromToken;

  const image = params.get('image');
  const view = params.get('view');
  const shared: SharedLink = {};
  if (image) shared.isPicture = (media) => media === image;
  if (view) shared.isScene = (slug) => slug === view;
  const look = readOldLook(params);
  if (look) shared.look = look;
  return shared;
}

/** Removes the older link settings from an address. */
export function clearOldLink(params: URLSearchParams) {
  for (const name of ['image', 'view', 'yaw', 'pitch', 'fov']) params.delete(name);
}

/** The short form of an old link, or null if the address needs no change. */
export function upgradeOldLink(params: URLSearchParams, pictures: string[]): URLSearchParams | null {
  if (params.has('s')) return null;
  const image = params.get('image');
  const view = params.get('view');
  const look = readOldLook(params);

  let token: string | null = null;
  if (image && !view && !look && pictures.includes(image)) token = pictureToken(image);
  else if (view && look && !image) token = viewToken(view, look);
  if (!token) return null;

  const next = new URLSearchParams(params);
  clearOldLink(next);
  next.set('s', token);
  return next;
}
