import { mediaLibrary } from '@/data/media';
import manifestJson from '@/data/media.manifest.json';
import type { MediaDimensions, MediaItem, MediaKey } from '@/types';
import { withBase } from './paths';

const manifest = manifestJson as Record<string, MediaDimensions>;

export type MediaFormat = 'avif' | 'webp';

export interface ResolvedMedia extends MediaItem, MediaDimensions {
  key: MediaKey;
}

/**
 * Joins a picture's description (src/data/media.ts) with its measured size
 * (src/data/media.manifest.json, written by `npm run media`). Returns null for
 * a key that has no file yet, so a missing picture never breaks a page.
 */
export function getMedia(key: MediaKey): ResolvedMedia | null {
  const item = mediaLibrary[key];
  const dimensions = manifest[key];
  if (!item || !dimensions) {
    if (import.meta.env.DEV) {
      console.warn(`[media] "${key}" is missing from ${item ? 'media.manifest.json (run npm run media)' : 'src/data/media.ts'}.`);
    }
    return null;
  }
  return { key, ...item, ...dimensions };
}

/**
 * Path of the 1200px JPEG from the site's own root, without the base path.
 * Used for link previews, where it is joined to the site's public address.
 */
export function mediaSharePath(key: MediaKey): string {
  return `/media/${key}-1200.jpg`;
}

/** URL of one generated file. `fallback` is the 1200px JPEG used for old browsers and link previews. */
export function mediaUrl(key: MediaKey, variant: 'fallback' | { width: number; format: MediaFormat }): string {
  if (variant === 'fallback') return withBase(mediaSharePath(key));
  return withBase(`/media/${key}-${variant.width}.${variant.format}`);
}

export function mediaSrcSet(media: ResolvedMedia, format: MediaFormat): string {
  return media.widths.map((width) => `${mediaUrl(media.key, { width, format })} ${width}w`).join(', ');
}

/** Every stand-in picture with its credit, for the credits page. */
export function listCredits(): Array<{ key: MediaKey; item: MediaItem }> {
  return Object.entries(mediaLibrary)
    .filter(([key, item]) => item.placeholder && item.credit && manifest[key])
    .map(([key, item]) => ({ key, item }));
}
