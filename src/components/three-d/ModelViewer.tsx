import { Maximize2, Minimize2, Minus, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { getMedia, mediaUrl } from '@/lib/media';
import type { ModelAsset } from '@/types';

/** The parts of the <model-viewer> element this component uses. */
interface ModelViewerElement extends HTMLElement {
  zoom(keyPresses: number): void;
  dismissPoster(): void;
}

type Status = 'idle' | 'loading-viewer' | 'loading-model' | 'ready' | 'error';

interface ModelViewerProps {
  model: ModelAsset;
}

/**
 * Interactive 3D viewer for .glb and .gltf models, on Google's <model-viewer>.
 *
 * The viewer library is large, so it is not part of any page bundle: it is
 * imported only when this component scrolls near the screen. Until the model
 * has loaded, and wherever WebGL cannot run, the poster picture stands in.
 *
 * Controls: drag to orbit, pinch or scroll to zoom, plus and minus buttons,
 * and a fullscreen button. One-finger vertical drags still scroll the page.
 */
export function ModelViewer({ model }: ModelViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const poster = model.poster ? getMedia(model.poster) : null;
  const posterUrl = poster ? mediaUrl(poster.key, 'fallback') : undefined;

  // Import the viewer library the first time the stage comes near the screen.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || status !== 'idle') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setStatus('loading-viewer');
        import('@google/model-viewer')
          .then(() => setStatus('loading-model'))
          .catch(() => setStatus('error'));
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [status]);

  // Follow the model's own loading events.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || status === 'idle' || status === 'loading-viewer') return;
    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ totalProgress: number }>).detail;
      setProgress(Math.round((detail?.totalProgress ?? 0) * 100));
    };
    const onLoad = () => setStatus('ready');
    const onError = () => setStatus('error');
    viewer.addEventListener('progress', onProgress);
    viewer.addEventListener('load', onLoad);
    viewer.addEventListener('error', onError);
    return () => {
      viewer.removeEventListener('progress', onProgress);
      viewer.removeEventListener('load', onLoad);
      viewer.removeEventListener('error', onError);
    };
  }, [status]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === stageRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    const stage = stageRef.current;
    if (!stage) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.requestFullscreen?.();
  };

  const viewerMounted = status === 'loading-model' || status === 'ready';
  const busy = status === 'loading-viewer' || status === 'loading-model';
  const canFullscreen = typeof document !== 'undefined' && document.fullscreenEnabled;

  return (
    <div ref={stageRef} className="stage ticks aspect-[4/3] w-full bg-paper-2 lg:aspect-[16/9]">
      {viewerMounted ? (
        <model-viewer
          ref={viewerRef}
          src={model.src}
          alt={model.alt}
          poster={posterUrl}
          camera-controls
          touch-action="pan-y"
          interaction-prompt="auto"
          shadow-intensity="0.6"
          exposure="1"
          loading="eager"
          reveal="auto"
        />
      ) : posterUrl && status !== 'error' ? (
        <img
          src={posterUrl}
          alt={model.alt}
          width={poster?.width}
          height={poster?.height}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {status === 'error' ? (
        <div className="absolute inset-0 grid place-items-center p-lg text-center">
          <p className="max-w-[40ch] text-md text-ink-2" role="alert">
            This model could not be loaded. Check the connection and reload the page, or ask for a link to the model.
          </p>
        </div>
      ) : null}

      <div className="stage__bar">
        <p className="label" role="status" aria-live="polite">
          {busy ? (progress > 0 ? `Loading the model, ${progress}%` : 'Loading the model…') : null}
          {status === 'ready' ? 'Drag to orbit. Pinch or scroll to zoom.' : null}
        </p>
        <div className="flex shrink-0 gap-xs">
          <button
            type="button"
            className="icon-btn icon-btn--solid"
            aria-label="Zoom out"
            disabled={status !== 'ready'}
            onClick={() => viewerRef.current?.zoom(-1)}
          >
            <Minus size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn--solid"
            aria-label="Zoom in"
            disabled={status !== 'ready'}
            onClick={() => viewerRef.current?.zoom(1)}
          >
            <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
          {canFullscreen ? (
            <button
              type="button"
              className="icon-btn icon-btn--solid"
              aria-label={fullscreen ? 'Leave fullscreen' : 'View the model fullscreen'}
              aria-pressed={fullscreen}
              onClick={toggleFullscreen}
            >
              {fullscreen ? (
                <Minimize2 size={18} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Maximize2 size={18} strokeWidth={1.5} aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
