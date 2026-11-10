import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useCallback, useEffect, useRef, type KeyboardEvent, type TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import { Picture } from '@/components/common/Picture';
import type { MediaKey } from '@/types';

export interface LightboxItem {
  media: MediaKey;
  title?: string;
  /** Optional link shown beside the title, for example to the project page. */
  href?: string;
  hrefLabel?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  /** Index of the open picture, or null when the lightbox is closed. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const SWIPE_DISTANCE = 48;

/**
 * Fullscreen picture viewer on the native <dialog> element, which supplies
 * the focus trap, Escape to close, an inert page behind it and the return of
 * focus to the picture that opened it.
 *
 * Keys: Left and Right step, Home and End jump, Escape closes.
 * Touch: swipe left or right to step.
 */
export function Lightbox({ items, index, onIndexChange, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const open = index !== null;
  const count = items.length;
  const current = open ? items[index] : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Keep the page behind from scrolling while the lightbox is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  const step = useCallback(
    (delta: number) => {
      if (index === null || count === 0) return;
      onIndexChange((index + delta + count) % count);
    },
    [index, count, onIndexChange],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') step(1);
    else if (event.key === 'ArrowLeft') step(-1);
    else if (event.key === 'Home') onIndexChange(0);
    else if (event.key === 'End') onIndexChange(count - 1);
    else return;
    event.preventDefault();
  };

  const onTouchStart = (event: TouchEvent) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    const end = event.changedTouches[0]?.clientX;
    touchStart.current = null;
    if (start === null || end === undefined) return;
    if (Math.abs(end - start) >= SWIPE_DISTANCE) step(end < start ? 1 : -1);
  };

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label="Picture viewer"
      onClose={onClose}
      onKeyDown={onKeyDown}
    >
      {current && index !== null ? (
        <>
          <div className="lightbox__bar">
            <p className="num text-sm text-ink-2" aria-live="polite">
              <span className="visually-hidden">Picture </span>
              {index + 1} <span className="text-muted">of {count}</span>
            </p>
            <button type="button" className="icon-btn" aria-label="Close the viewer" onClick={onClose} autoFocus>
              <X size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          <div className="lightbox__stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={current.media}
                className="grid h-full w-full place-items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <Picture media={current.media} sizes="100vw" priority className="contents" />
              </m.div>
            </AnimatePresence>
          </div>

          <div className="lightbox__bar">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-md gap-y-2xs">
              {current.title ? <p className="truncate text-md text-ink">{current.title}</p> : null}
              {current.href ? (
                <Link to={current.href} className="link text-sm">
                  {current.hrefLabel ?? 'See the project'}
                </Link>
              ) : null}
            </div>
            <div className="flex shrink-0 gap-xs">
              <button
                type="button"
                className="icon-btn"
                aria-label="Previous picture"
                onClick={() => step(-1)}
                disabled={count < 2}
              >
                <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="Next picture"
                onClick={() => step(1)}
                disabled={count < 2}
              >
                <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </dialog>
  );
}
