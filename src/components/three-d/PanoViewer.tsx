import { Maximize2, Minimize2, Minus, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import type MarzipanoLib from 'marzipano';
import type { CubeLevel, Scene, Viewer } from 'marzipano';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { withBase } from '@/lib/paths';
import type { Panorama } from '@/types';

type Status = 'poster' | 'loading' | 'ready' | 'error';
type Marzipano = typeof MarzipanoLib;

interface PanoViewerProps {
  panoramas: Panorama[];
  /** Show the row of project buttons above the viewer. Off on a project's own page. */
  showProjects?: boolean;
}

/** One scene the viewer can show: a single panorama, or one scene of a tour. */
interface SceneSpec {
  key: string;
  name: string;
  /** Small square picture for the scene chooser (tours only). */
  thumb?: string;
  /** Yaw in degrees at which the scene looks north. */
  north: number;
  /** Starting view, in Marzipano's radians (pitch counts downwards). */
  initial: { yaw: number; pitch: number; fov: number };
  build: (M: Marzipano) => Parameters<Viewer['createScene']>[0];
}

/** The parts of a Marzipano Tool data.js the site reads. */
interface TourScene {
  id: string;
  name: string;
  levels: CubeLevel[];
  faceSize: number;
  initialViewParameters: { yaw: number; pitch: number; fov: number };
}

const DEG = Math.PI / 180;
/** Slow turn: radians per second (about 7° a second, one full turn in under a minute). */
const TURN_SPEED = 0.20;
/** How long the view rests after the visitor lets go before turning again. */
const RESUME_AFTER_MS = 3000;
const FULL_WIDTH = 3840;
const SMALL_WIDTH = 1920;

const posterUrl = (id: string) => withBase(`/panoramas/${id}-poster.jpg`);
const imageUrl = (id: string, width: number) => withBase(`/panoramas/${id}-${width}.webp`);

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

/** Reads a Marzipano Tool export's data.js (`var APP_DATA = {...};`) without running it. */
async function loadTour(path: string): Promise<TourScene[]> {
  const response = await fetch(withBase(`${path}/data.js`));
  if (!response.ok) throw new Error(`Tour data missing at ${path}/data.js`);
  const text = await response.text();
  const data = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)) as { scenes?: TourScene[] };
  if (!data.scenes?.length) throw new Error(`No scenes in ${path}/data.js`);
  return data.scenes;
}

/** The scenes of one panorama entry: one for a single image, several for a tour. */
async function scenesOf(panorama: Panorama): Promise<SceneSpec[]> {
  if (panorama.tour) {
    const { path, north = {}, scenes: only } = panorama.tour;
    const base = withBase(path);
    const all = await loadTour(path);
    const scenes = only
      ? only.map((id) => all.find((scene) => scene.id === id)).filter((scene): scene is TourScene => Boolean(scene))
      : all;
    if (scenes.length === 0) throw new Error(`None of the listed scenes is in ${path}/data.js`);
    return scenes.map((scene) => {
      const tiles = `${base}/tiles/${scene.id}`;
      // The face the scene opens on, at the first level held in one tile, makes its thumbnail.
      const quarter = ((Math.round(scene.initialViewParameters.yaw / (Math.PI / 2)) % 4) + 4) % 4;
      const face = ['f', 'r', 'b', 'l'][quarter];
      const thumbLevel = scene.levels.findIndex((level) => !level.fallbackOnly && level.size <= level.tileSize);
      return {
        key: `${panorama.id}/${scene.id}`,
        name: scene.name,
        thumb: thumbLevel >= 0 ? `${tiles}/${thumbLevel}/${face}/0/0.jpg` : undefined,
        north: north[scene.id] ?? 0,
        initial: scene.initialViewParameters,
        build: (M) => ({
          source: M.ImageUrlSource.fromString(`${tiles}/{z}/{f}/{y}/{x}.jpg`, {
            cubeMapPreviewUrl: `${tiles}/preview.jpg`,
          }),
          geometry: new M.CubeGeometry(scene.levels),
          view: new M.RectilinearView(
            scene.initialViewParameters,
            M.RectilinearView.limit.traditional(scene.faceSize, 100 * DEG, 120 * DEG),
          ),
          pinFirstLevel: true,
        }),
      };
    });
  }

  const width = pickWidth();
  const view = panorama.view ?? { yaw: 0, pitch: -20, fov: 95 };
  // Marzipano counts pitch downwards; the site's data counts it upwards, like a camera tilt.
  const initial = { yaw: view.yaw * DEG, pitch: -view.pitch * DEG, fov: view.fov * DEG };
  return [
    {
      key: panorama.id,
      name: panorama.title,
      north: panorama.north ?? 0,
      initial,
      build: (M) => ({
        source: M.ImageUrlSource.fromString(imageUrl(panorama.id, width)),
        geometry: new M.EquirectGeometry([{ width }]),
        view: new M.RectilinearView(initial, M.RectilinearView.limit.traditional(width, 110 * DEG)),
        pinFirstLevel: true,
      }),
    },
  ];
}

/**
 * Compass: the dial turns as the visitor looks around, so N always points
 * north; the accent mark at the top is where the view faces. Pressing it
 * turns the view to face north.
 */
function Compass({ heading, onFaceNorth }: { heading: number; onFaceNorth: () => void }) {
  const letters = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 },
  ];
  return (
    <button type="button" className="pano-compass" aria-label="Face north" onClick={onFaceNorth}>
      <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <circle cx="32" cy="32" r="30" className="pano-compass__ring" />
        <g style={{ transform: `rotate(${-heading}deg)`, transformOrigin: '32px 32px' }}>
          {letters.map(({ label, angle }) => (
            <text
              key={label}
              x="32"
              y="14"
              transform={`rotate(${angle} 32 32)`}
              className={label === 'N' ? 'pano-compass__n' : 'pano-compass__letter'}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {label}
            </text>
          ))}
          {Array.from({ length: 12 }, (_, i) =>
            i % 3 === 0 ? null : (
              <line key={i} x1="32" y1="5" x2="32" y2="9" transform={`rotate(${i * 30} 32 32)`} className="pano-compass__tick" />
            ),
          )}
        </g>
        {/* Where the view faces: fixed at the top. */}
        <path d="M32 24 L37 36 L32 33 L27 36 Z" className="pano-compass__needle" />
      </svg>
    </button>
  );
}

/** Sets touch-action on the viewer's gesture layers: `pan-y` lets the page scroll, `none` keeps every touch. */
function allowPageScroll(mount: HTMLElement, allow: boolean) {
  const value = allow ? 'pan-y' : 'none';
  mount.style.touchAction = value;
  mount.querySelectorAll<HTMLElement>('*').forEach((element) => {
    if (element.style.touchAction) element.style.touchAction = value;
  });
}

/**
 * Interactive 360° viewer on Marzipano.
 *
 * Nothing heavy loads until the viewer comes near the screen: until then the
 * stage shows a flat poster. Then it imports Marzipano (its own chunk) and the
 * panorama, and starts turning slowly by itself. On touch screens a vertical
 * swipe still scrolls the page; a sideways drag turns the view and a pinch
 * zooms. The slow turn stops while the viewer is off screen.
 *
 * It shows single equirectangular panoramas and tiled tours exported from the
 * Marzipano Tool (read from their data.js), with the site's own controls: a
 * compass, scene thumbnails for tours, zoom, reset, slow turn and fullscreen.
 * Drag to look, pinch or use the buttons to zoom, arrow keys to turn, plus
 * and minus to zoom. The mouse wheel is left to the page. The slow turn stops
 * while the visitor drags and resumes a few seconds later, pauses while the
 * viewer has keyboard focus, has a visible pause button, and never starts
 * under reduced motion.
 *
 * A panorama with `embed` set shows a tour from another tool in a frame.
 */
export function PanoViewer({ panoramas, showProjects = true }: PanoViewerProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const scenesRef = useRef(new Map<string, Scene>());
  const specsCache = useRef(new Map<string, SceneSpec[]>());
  const activeSceneRef = useRef<Scene | null>(null);
  const rotateRef = useRef<(() => unknown) | null>(null);

  const [selected, setSelected] = useState(0);
  const [specs, setSpecs] = useState<SceneSpec[]>([]);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [status, setStatus] = useState<Status>('poster');
  const [held, setHeld] = useState(() => prefersReducedMotion());
  const [fullscreen, setFullscreen] = useState(false);
  const [yaw, setYaw] = useState(0);

  const active = panoramas[Math.min(selected, panoramas.length - 1)];
  const isEmbed = Boolean(active?.embed);
  const spec = specs[sceneIndex];

  /** Builds (or reuses) a scene and shows it. */
  const showSpec = useCallback(async (next: SceneSpec) => {
    const mount = mountRef.current;
    if (!mount) return;
    setStatus('loading');
    try {
      const { default: M } = await import('marzipano');

      if (!viewerRef.current) {
        const viewer = new M.Viewer(mount, { controls: { mouseViewMode: 'drag', scrollZoom: false } });
        try {
          viewer.controls().disableMethod('scrollZoom');
        } catch {
          // Older builds have no separate scroll method; the option above covers them.
        }
        viewer.stage().addEventListener('renderComplete', ((stable: boolean) => {
          if (stable) setStatus((current) => (current === 'loading' ? 'ready' : current));
        }) as never);
        rotateRef.current = M.autorotate({ yawSpeed: TURN_SPEED, targetPitch: null, targetFov: null });
        // Marzipano's gestures claim every touch (touch-action: none), which would trap a phone
        // visitor scrolling past. Let vertical swipes scroll the page; sideways drags and
        // pinches still reach the viewer. Fullscreen has no page to scroll, so it keeps them all.
        allowPageScroll(mount, true);
        viewerRef.current = viewer;
      }

      let scene = scenesRef.current.get(next.key);
      if (!scene) {
        const created = viewerRef.current.createScene(next.build(M));
        // A missing tile later on only leaves a blurrier patch; fail only if nothing could be drawn.
        created.layer().textureStore().addEventListener('textureError', (() =>
          setStatus((current) => (current === 'loading' ? 'error' : current))) as never);
        // Keep the compass in step with the view, once per frame at most.
        let frame = 0;
        created.view().addEventListener('change', (() => {
          if (frame || activeSceneRef.current !== created) return;
          frame = requestAnimationFrame(() => {
            frame = 0;
            setYaw(created.view().yaw() / DEG);
          });
        }) as never);
        scenesRef.current.set(next.key, created);
        scene = created;
      }
      activeSceneRef.current = scene;
      setYaw(scene.view().yaw() / DEG);
      scene.switchTo({ transitionDuration: prefersReducedMotion() ? 0 : 400 });
    } catch {
      setStatus('error');
    }
  }, []);

  /** Loads a panorama's scenes (a tour reads its data.js once) and shows one. */
  const showPanorama = useCallback(
    async (panorama: Panorama, index = 0) => {
      setStatus('loading');
      try {
        let list = specsCache.current.get(panorama.id);
        if (!list) {
          list = await scenesOf(panorama);
          specsCache.current.set(panorama.id, list);
        }
        setSpecs(list);
        setSceneIndex(index);
        const first = list[Math.min(index, list.length - 1)];
        if (first) await showSpec(first);
      } catch {
        setStatus('error');
      }
    },
    [showSpec],
  );

  // Changing panorama after the viewer is open swaps the scene in place.
  const choose = (index: number) => {
    if (index === selected) return;
    setSelected(index);
    setSpecs([]);
    setSceneIndex(0);
    const next = panoramas[index];
    if (!next || status === 'poster') return;
    if (next.embed) {
      viewerRef.current?.stopMovement();
      setStatus('ready');
      return;
    }
    void showPanorama(next);
  };

  const chooseScene = (index: number) => {
    const next = specs[index];
    if (!next || index === sceneIndex) return;
    setSceneIndex(index);
    void showSpec(next);
  };

  const open = () => {
    if (!active) return;
    if (active.embed) {
      setStatus('ready');
      return;
    }
    void showPanorama(active);
  };

  // Open by itself once the stage comes near the screen; track whether it is on screen.
  const [onScreen, setOnScreen] = useState(false);
  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  });
  const opening = useRef(false);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof IntersectionObserver === 'undefined') {
      openRef.current();
      return;
    }
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !opening.current) {
          opening.current = true;
          openRef.current();
          near.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    const visible = new IntersectionObserver(([entry]) => setOnScreen(Boolean(entry?.isIntersecting)), {
      threshold: 0.2,
    });
    near.observe(stage);
    visible.observe(stage);
    return () => {
      near.disconnect();
      visible.disconnect();
    };
  }, []);

  // Slow turn while idle: paused by the button, by keyboard focus and while off screen.
  const hovering = useRef(false);
  const syncMovement = useCallback(() => {
    const viewer = viewerRef.current;
    const rotate = rotateRef.current;
    if (!viewer || !rotate) return;
    if (held || hovering.current || !onScreen || status !== 'ready' || isEmbed) {
      viewer.setIdleMovement(Infinity, null);
      viewer.stopMovement();
    } else {
      viewer.startMovement(rotate);
      viewer.setIdleMovement(RESUME_AFTER_MS, rotate);
    }
  }, [held, onScreen, status, isEmbed]);

  useEffect(() => {
    syncMovement();
  }, [syncMovement]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // Only keyboard focus pauses: a mouse click on a button also focuses it, and must not stop the turn.
    const enter = (event: FocusEvent) => {
      if (!(event.target instanceof Element) || !event.target.matches(':focus-visible')) return;
      hovering.current = true;
      syncMovement();
    };
    const leave = () => {
      hovering.current = false;
      syncMovement();
    };
    stage.addEventListener('focusin', enter);
    stage.addEventListener('focusout', leave);
    return () => {
      stage.removeEventListener('focusin', enter);
      stage.removeEventListener('focusout', leave);
    };
  }, [syncMovement]);

  useEffect(() => {
    const onChange = () => {
      const isFull = document.fullscreenElement === stageRef.current;
      setFullscreen(isFull);
      if (mountRef.current && viewerRef.current) allowPageScroll(mountRef.current, !isFull);
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

  const lookTo = (params: { yaw?: number; pitch?: number; fov?: number }) => {
    const scene = activeSceneRef.current;
    if (!scene) return;
    viewerRef.current?.stopMovement();
    scene.lookTo(params, { transitionDuration: prefersReducedMotion() ? 0 : 900 });
  };

  const zoom = (direction: 1 | -1) => activeSceneRef.current?.view().offsetFov(-direction * 12 * DEG);
  const resetView = () => spec && lookTo(spec.initial);
  const faceNorth = () => {
    const view = activeSceneRef.current?.view();
    if (spec && view) lookTo({ yaw: spec.north * DEG, pitch: view.pitch(), fov: view.fov() });
  };

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
  const showChrome = opened && status !== 'error' && !isEmbed;
  // Heading of the view from north, 0 to 360.
  const heading = ((((yaw - (spec?.north ?? 0)) % 360) + 360) % 360);

  return (
    <div className="flex flex-col gap-lg">
      {/* One button per project, shown even for one, so the row reads as a list that grows. */}
      {showProjects && panoramas.length > 0 ? (
        <div className="seg" role="group" aria-label="Choose a project">
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

      <div ref={stageRef} className="stage pano-stage aspect-[4/5] w-full bg-paper-2 sm:aspect-[16/9]">
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
            src={active.embed ? withBase(active.embed) : undefined}
            title={active.title}
            className="absolute inset-0 h-full w-full border-0"
            allow="fullscreen; gyroscope; accelerometer; xr-spatial-tracking"
            allowFullScreen
            loading="lazy"
          />
        ) : null}

        {status === 'poster' || (status === 'loading' && !specs.length) || status === 'error' ? (
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


        {status === 'error' ? (
          <div className="absolute inset-0 grid place-items-center p-lg text-center">
            <p className="max-w-[40ch] rounded-card bg-paper px-md py-sm text-md text-ink" role="alert">
              This panorama could not be shown. Your browser may have 3D graphics switched off.
            </p>
          </div>
        ) : null}

        {showChrome ? (
          <>
            {/* Top left: where you are, and how to move. */}
            <div className="pano-chip">
              <p className="pano-chip__title">{spec?.name ?? active.title}</p>
              <p className="pano-chip__hint max-sm:sr-only" role="status" aria-live="polite">
                {status === 'loading' ? 'Loading the panorama…' : 'Drag to look around'}
              </p>
            </div>

            {controlsLive ? <Compass heading={heading} onFaceNorth={faceNorth} /> : null}

            <div className="pano-dock">
              {specs.length > 1 ? (
                <div className="pano-thumbs" role="group" aria-label="Choose a view">
                  {specs.map((item, index) => (
                    <button
                      key={item.key}
                      type="button"
                      className="pano-thumb"
                      aria-pressed={index === sceneIndex}
                      aria-label={item.name}
                      title={item.name}
                      onClick={() => chooseScene(index)}
                    >
                      {item.thumb ? <img src={item.thumb} alt="" width={96} height={64} loading="lazy" /> : null}
                      <span className="pano-thumb__name" aria-hidden="true">
                        {index + 1}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="pano-toolbar" role="toolbar" aria-label="Panorama controls">
                <button type="button" className="pano-tool" aria-label="Zoom in" disabled={!controlsLive} onClick={() => zoom(1)}>
                  <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
                <button type="button" className="pano-tool" aria-label="Zoom out" disabled={!controlsLive} onClick={() => zoom(-1)}>
                  <Minus size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="pano-tool"
                  aria-label={held ? 'Start turning the view' : 'Stop turning the view'}
                  aria-pressed={held}
                  disabled={!controlsLive}
                  onClick={() => setHeld((value) => !value)}
                >
                  {held ? (
                    <Play size={18} strokeWidth={1.75} aria-hidden="true" />
                  ) : (
                    <Pause size={18} strokeWidth={1.75} aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  className="pano-tool"
                  aria-label="Back to the starting view"
                  disabled={!controlsLive}
                  onClick={resetView}
                >
                  <RotateCcw size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
                {canFullscreen ? (
                  <button
                    type="button"
                    className="pano-tool"
                    aria-label={fullscreen ? 'Leave fullscreen' : 'View the panorama fullscreen'}
                    aria-pressed={fullscreen}
                    onClick={toggleFullscreen}
                  >
                    {fullscreen ? (
                      <Minimize2 size={18} strokeWidth={1.75} aria-hidden="true" />
                    ) : (
                      <Maximize2 size={18} strokeWidth={1.75} aria-hidden="true" />
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
