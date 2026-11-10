import type { CSSProperties } from 'react';
import { getMedia, mediaSrcSet, mediaUrl } from '@/lib/media';
import type { MediaKey } from '@/types';

export interface PictureProps {
  media: MediaKey;
  /** The `sizes` attribute: how wide the picture is shown at each breakpoint. */
  sizes: string;
  /** True only for the picture that is the page's largest first paint. */
  priority?: boolean;
  /** Overrides the stored description. Pass an empty string when the subject is named beside the picture. */
  alt?: string;
  className?: string;
  imgClassName?: string;
}

/**
 * One picture, in AVIF and WebP at every generated width, with a JPEG
 * fallback, explicit dimensions (no layout shift) and lazy loading unless it
 * is the page's priority image.
 */
export function Picture({ media, sizes, priority = false, alt, className, imgClassName }: PictureProps) {
  const resolved = getMedia(media);
  if (!resolved) return null;

  const style: CSSProperties | undefined = resolved.position ? { objectPosition: resolved.position } : undefined;

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={mediaSrcSet(resolved, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={mediaSrcSet(resolved, 'webp')} sizes={sizes} />
      <img
        src={mediaUrl(resolved.key, 'fallback')}
        width={resolved.width}
        height={resolved.height}
        alt={alt ?? resolved.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        className={imgClassName}
        style={style}
        data-placeholder={resolved.placeholder ? '' : undefined}
      />
    </picture>
  );
}

interface FrameProps extends PictureProps {
  /** Tailwind classes that size the frame, for example "aspect-[4/5]". */
  frameClassName?: string;
  /** Names the picture the studio should supply for this slot. */
  slot?: string;
}

/** A picture cropped by a frame of fixed ratio, with the theme's keyline. */
export function Frame({ frameClassName = '', slot, ...picture }: FrameProps) {
  return (
    <figure className={`frame ${frameClassName}`} data-slot={slot}>
      <Picture {...picture} />
    </figure>
  );
}
