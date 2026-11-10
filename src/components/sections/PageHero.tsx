import { Pause, Play } from 'lucide-react';
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Picture } from '@/components/common/Picture';
import { mediaUrl } from '@/lib/media';
import type { MediaKey } from '@/types';

interface PageHeroProps {
  title: string;
  lead?: string;
  /** Background photograph. Without one the hero is type on paper. */
  media?: MediaKey;
  /** `full` fills the first screen (home). `short` leaves the next section in view. */
  size?: 'full' | 'short';
  /**
   * Optional film played over the photograph: a path under /public to a short
   * MP4 or WebM. It runs muted, looped and inline, with the photograph as its
   * poster, never under reduced motion, and with a pause button.
   */
  video?: string;
  children?: ReactNode;
}

const step = (index: number): CSSProperties => ({ '--i': index }) as CSSProperties;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Poster hero: the photograph fills the frame and the words sit low and left
 * on its calm side, over a scrim of the page's own paper colour. The headline,
 * one sentence and the actions enter once on load, then stand.
 */
export function PageHero({ title, lead, media, size = 'short', video, children }: PageHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [showVideo] = useState(() => Boolean(video) && !prefersReducedMotion());

  const toggleVideo = () => {
    const element = videoRef.current;
    if (!element) return;
    if (element.paused) {
      void element.play();
      setPaused(false);
    } else {
      element.pause();
      setPaused(true);
    }
  };

  if (!media) {
    return (
      <section className="section section--first" data-enter>
        <div className="shell flex flex-col gap-lg">
          <h1 className="enter" style={step(0)}>
            {title}
          </h1>
          {lead ? (
            <p className="lead enter" style={step(1)}>
              {lead}
            </p>
          ) : null}
          {children ? (
            <div className="enter flex flex-wrap gap-sm" style={step(2)}>
              {children}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className={`poster ${size === 'short' ? 'poster--short' : ''}`} data-enter>
      <div className="poster__media enter-media">
        <Picture media={media} sizes="100vw" priority alt="" />
        {showVideo && video ? (
          <video
            ref={videoRef}
            src={video}
            poster={mediaUrl(media, 'fallback')}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
          />
        ) : null}
      </div>
      <div className="poster__scrim" aria-hidden="true" />
      <div className="shell flex flex-col gap-lg pb-2xl pt-4xl lg:pb-3xl">
        <h1 className="enter" style={step(0)}>
          {title}
        </h1>
        {lead ? (
          <p className="lead enter text-ink" style={step(1)}>
            {lead}
          </p>
        ) : null}
        {children || showVideo ? (
          <div className="enter flex flex-wrap items-center gap-sm" style={step(2)}>
            {children}
            {showVideo ? (
              <button
                type="button"
                className="icon-btn icon-btn--solid ml-auto"
                aria-label={paused ? 'Play the background film' : 'Pause the background film'}
                aria-pressed={paused}
                onClick={toggleVideo}
              >
                {paused ? (
                  <Play size={18} strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Pause size={18} strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
