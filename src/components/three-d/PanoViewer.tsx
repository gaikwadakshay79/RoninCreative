import { Maximize2, Minimize2, Minus, Pause, Play, Plus } from 'lucide-react';
import type { Scene, Viewer } from 'marzipano';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Panorama } from '@/types';

type Status = 'poster' | 'loading' | 'ready' | 'error';

interface PanoViewerProps {
  panoramas: Panorama[];
}

const DEG = Math.PI / 180;
const FULL_WIDTH = 3840;
const SMALL_WIDTH = 1920;

const posterUrl = (id: string) => `/panoramas/${id}-poster.jpg`;
const imageUrl = (id: string, width: number) => `/panoramas/${id}-${width}.webp`;

/** The widest panorama this device can hold as one texture, and should download. */
function pickWidth(): number {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return SMALL_WIDTH;
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const max = gl ? (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number) : 0;
    return max >= FULL_WIDTH ? FULL_WIDTH : SMALL_WIDTH;
  } catch {
    return SMALL_WIDTH;
  }
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Interactive 360° viewer on Marzipano.
 *
 * Nothing heavy loads until the visitor asks: the stage shows a flat poster
 * and a "Look around" button. Pressing it imports Marzipano (its own chunk)
 * and the panorama image. That keeps about a megabyte per panorama off the
 * page for everyone who only scrolls past, and it means a finger moving down
 * a phone screen scrolls the page instead of being caught by the viewer.
 *
 * Once open: drag to look, pinch or use the buttons to zoom, arrow keys to
 * turn, plus and minus to zoom, and a fullscreen button. The mouse wheel is
 * left to the page. The view turns slowly by itself until touched; that
 * motion pauses on hover and focus, has a visible pause button, and never
 * starts under reduced motion.
 *
 * A panorama with `embed` set shows a finished tour (Marzipano Tool or
 * Pano2VR export) in a frame instead.
 */
export function PanoViewer({ panoramas }: PanoViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const scenesRef = useRef(new Map<string, Scene>());
  const activeSceneRef = useRef<Scene | null>(null);
  const rotateRef = useRef<(() => unknown) | null>(null);

  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState<Status>('poster');
  const [held, setHeld] = useState(() => prefersReducedMotion());
  const [fullscreen, setFullscreen] = useState(false);

  const active = panoramas[Math.min(selected, panoramas.length - 1)];
  const isEmbed = Boolean(active?.embed);

  /** Builds (or reuses) the scene of one panorama and shows it. */
  const showScene = useCallback(async (panorama: Panorama) => {
    const mount = mountRef.current;
    if (!mount) return;
    setStatus('loading');
    try {
      const { default: Marzipano } = await import('marzipano');

      if (!viewerRef.current) {
        const viewer = new Marzipano.Viewer(mount, { controls: { mouseViewMode: 'drag', scrollZoom: false } });
        try {
          viewer.controls().disableMethod('scrollZoom');
        } catch {
          // Older builds have no separate scroll method; the option above covers them.
        }
        viewer.stage().addEventListener('renderComplete', ((stable: boolean) => {
          if (stable) setStatus((current) => (current === 'loading' ? 'ready' : current));
        }) as never);
        rotateRef.current = Marzipano.autorotate({ yawSpeed: 0.035, targetPitch: null, targetFov: null });
        viewerRef.current = viewer;
      }

      let scene = scenesRef.current.get(panorama.id);
      if (!scene) {
        const width = pickWidth();
        const view = panorama.view ?? { yaw: 0, pitch: -20, fov: 95 };
        scene = viewerRef.current.createScene({
          source: Marzipano.ImageUrlSource.fromString(imageUrl(panorama.id, width)),
          geometry: new Marzipano.EquirectGeometry([{ width }]),
          view: new Marzipano.RectilinearView(
            // Marzipano counts pitch downwards; the site's data counts it upwards, like a camera tilt.
            { yaw: view.yaw * DEG, pitch: -view.pitch * DEG, fov: view.fov * DEG },
            Marzipano.RectilinearView.limit.traditional(width, 110 * DEG),
          ),
          pinFirstLevel: true,
        });
        scene.layer().textureStore().addEventListener('textureError', (() => setStatus('error')) as never);
        scenesRef.current.set(panorama.id, scene);
      }
      activeSceneRef.current = scene;
      scene.switchTo({ transitionDuration: 400 });
    } catch {
      setStatus('error');
    }
  }, []);

  // Changing panorama after the viewer is open swaps the scene in place.
  const choose = (index: number) => {
    if (index === selected) return;
    setSelected(index);
    const next = panoramas[index];
    if (!next) return;
    if (status === 'poster') return;
    if (next.embed) {
      viewerRef.current?.stopMovement();
      setStatus('ready');
      return;
    }
    void showScene(next);
  };

  const open = () => {
    if (!active) return;
    if (active.embed) {
      setStatus('ready');
      return;
    }
    void showScene(active);
  };

  // Slow turn while idle: paused by the button, by hover and by focus.
  const hovering = useRef(false);
  const syncMovement = useCallback(() => {
    const viewer = viewerRef.current;
    const rotate = rotateRef.current;
    if (!viewer || !rotate) return;
    if (held || hovering.current || status !== 'ready' || isEmbed) {
      viewer.setIdleMovement(Infinity, null);
      viewer.stopMovement();
    } else {
      viewer.startMovement(rotate);
      viewer.setIdleMovement(4000, rotate);
    }
  }, [held, status, isEmbed]);

  useEffect(() => {
    syncMovement();
  }, [syncMovement]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const enter = () => {
      hovering.current = true;
      syncMovement();
    };
    const leave = () => {
      hovering.current = false;
      syncMovement();
    };
    stage.addEventListener('pointerenter', enter);
    stage.addEventListener('pointerleave', leave);
    stage.addEventListener('focusin', enter);
    stage.addEventListener('focusout', leave);
    return () => {
      stage.removeEventListener('pointerenter', enter);
      stage.removeEventListener('pointerleave', leave);
      stage.removeEventListener('focusin', enter);
      stage.removeEventListener('focusout', leave);
    };
  }, [syncMovement]);

  useEffect(() => {
    const onChange = () => {
      setFullscreen(document.fullscreenElement === stageRef.current);
      viewerRef.current?.updateSize();
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // Release the WebGL context when the viewer leaves the page.
  useEffect(() => {
    const scenes = scenesRef.current;
    return () => {
      viewerRef.current?.destroy();
      viewerRef.current = null;
      scenes.clear();
    };
  }, []);

  const zoom = (direction: 1 | -1) => activeSceneRef.current?.view().offsetFov(-direction * 12 * DEG);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const view = activeSceneRef.current?.view();
    if (!view || status !== 'ready' || isEmbed) return;
    const step = 8 * DEG;
    if (event.key === 'ArrowLeft') view.offsetYaw(-step);
    else if (event.key === 'ArrowRight') view.offsetYaw(step);
    else if (event.key === 'ArrowUp') view.offsetPitch(-step);
    else if (event.key === 'ArrowDown') view.offsetPitch(step);
    else if (event.key === '+' || event.key === '=') zoom(1);
    else if (event.key === '-') zoom(-1);
    else return;
    event.preventDefault();
  };

  const toggleFullscreen = () => {
    const stage = stageRef.current;
    if (!stage) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.requestFullscreen?.();
  };

  if (!active) return null;

  const opened = status !== 'poster';
  const canFullscreen = typeof document !== 'undefined' && document.fullscreenEnabled;
  const controlsLive = status === 'ready' && !isEmbed;

  return (
    <div className="flex flex-col gap-lg">
      {panoramas.length > 1 ? (
        <div className="seg" role="group" aria-label="Choose a panorama">
          {panoramas.map((panorama, index) => (
            <button
              key={panorama.id}
              type="button"
              className="seg__item"
              aria-pressed={index === selected}
              onClick={() => choose(index)}
            >
              {panorama.title}
            </button>
          ))}
        </div>
      ) : null}

      <div ref={stageRef} className="stage ticks aspect-[4/3] w-full bg-paper-2 lg:aspect-[16/9]">
        {/* Marzipano draws into this element. It stays mounted so the viewer survives scene changes. */}
        <div
          ref={mountRef}
          className="pano"
          role="application"
          tabIndex={controlsLive ? 0 : -1}
          aria-label={`${active.alt}. Use the arrow keys to look around and plus or minus to zoom.`}
          aria-hidden={!opened || isEmbed}
          hidden={isEmbed && opened}
          onKeyDown={onKeyDown}
        />

        {isEmbed && opened ? (
          <iframe
            src={active.embed}
            title={active.title}
            className="absolute inset-0 h-full w-full border-0"
            allow="fullscreen; gyroscope; accelerometer; xr-spatial-tracking"
            allowFullScreen
            loading="lazy"
          />
        ) : null}

        {status === 'poster' || status === 'loading' || status === 'error' ? (
          <img
            src={posterUrl(active.id)}
            alt={status === 'poster' ? active.alt : ''}
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            className={`pano__poster ${status === 'loading' ? 'opacity-60' : ''}`}
          />
        ) : null}

        {status === 'poster' ? (
          <div className="absolute inset-0 grid place-items-center">
            <button type="button" className="btn" onClick={open}>
              Look around in 360°
            </button>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="absolute inset-0 grid place-items-center p-lg text-center">
            <p className="max-w-[40ch] rounded-card bg-paper px-md py-sm text-md text-ink" role="alert">
              This panorama could not be shown. Your browser may have 3D graphics switched off.
            </p>
          </div>
        ) : null}

        {opened && status !== 'error' ? (
          <div className="stage__bar max-sm:justify-end">
            {/* On a phone the hint would crowd out the buttons, so it is read aloud but not shown. */}
            <p className="label rounded-card bg-paper px-xs py-2xs max-sm:sr-only" role="status" aria-live="polite">
              {status === 'loading' ? 'Loading the panorama…' : null}
              {controlsLive ? 'Drag to look around. Pinch or use the buttons to zoom.' : null}
            </p>
            {isEmbed ? null : (
              <div className="flex shrink-0 gap-xs">
                <button
                  type="button"
                  className="icon-btn icon-btn--solid"
                  aria-label={held ? 'Start turning the view' : 'Stop turning the view'}
                  aria-pressed={held}
                  disabled={!controlsLive}
                  onClick={() => setHeld((value) => !value)}
                >
                  {held ? (
                    <Play size={18} strokeWidth={1.5} aria-hidden="true" />
                  ) : (
                    <Pause size={18} strokeWidth={1.5} aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn--solid"
                  aria-label="Zoom out"
                  disabled={!controlsLive}
                  onClick={() => zoom(-1)}
                >
                  <Minus size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn--solid"
                  aria-label="Zoom in"
                  disabled={!controlsLive}
                  onClick={() => zoom(1)}
                >
                  <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>
                {canFullscreen ? (
                  <button
                    type="button"
                    className="icon-btn icon-btn--solid"
                    aria-label={fullscreen ? 'Leave fullscreen' : 'View the panorama fullscreen'}
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
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
