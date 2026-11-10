import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PointCloudProps {
  className?: string;
  /** Read by screen readers in place of the canvas. */
  label?: string;
}

/** Deterministic pseudo-random numbers, so the terrain is the same on every visit. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth value noise on a lattice, summed over three octaves. */
function createHeightField(seed: number) {
  const rand = mulberry32(seed);
  const SIZE = 64;
  const lattice = new Float32Array(SIZE * SIZE);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rand();
  const at = (x: number, y: number) => lattice[((y % SIZE) + SIZE) % SIZE * SIZE + (((x % SIZE) + SIZE) % SIZE)] ?? 0;
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const sample = (x: number, y: number) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const tx = smooth(x - x0);
    const ty = smooth(y - y0);
    const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
    const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
    return top + (bottom - top) * ty;
  };
  return (x: number, z: number) =>
    sample(x * 2.1 + 9, z * 2.1 + 4) * 0.62 + sample(x * 5.3 + 2, z * 5.3 + 7) * 0.27 + sample(x * 12 + 5, z * 12) * 0.11;
}

interface Cloud {
  /** x, y, z triples in model space, roughly inside a unit cube. */
  positions: Float32Array;
  /** Colour bucket of each point: 0..BUCKETS-1 by height, BUCKETS for a found point. */
  bucket: Uint8Array;
  count: number;
}

const BUCKETS = 8;

/** A terrain of measured-looking points with a few structures and one "found" mound. */
function buildCloud(density: number): Cloud {
  const height = createHeightField(20240611);
  const rand = mulberry32(77);
  const xs: number[] = [];
  const buckets: number[] = [];
  const push = (x: number, y: number, z: number, b: number) => {
    xs.push(x, y, z);
    buckets.push(b);
  };

  const step = 2 / density;
  for (let i = 0; i <= density; i++) {
    for (let j = 0; j <= density; j++) {
      const x = -1 + i * step + (rand() - 0.5) * step * 0.9;
      const z = -1 + j * step + (rand() - 0.5) * step * 0.9;
      const h = height(x, z);
      const y = (h - 0.45) * 0.42;
      push(x, y, z, Math.max(0, Math.min(BUCKETS - 1, Math.floor(h * BUCKETS * 1.15 - 0.6))));
    }
  }

  // Structures: boxes sampled on their walls and roof.
  const boxes: Array<[number, number, number, number, number]> = [
    [-0.28, 0.12, 0.16, 0.12, 0.2],
    [0.02, 0.18, 0.1, 0.1, 0.32],
    [0.22, -0.08, 0.2, 0.09, 0.14],
    [-0.1, -0.3, 0.12, 0.16, 0.1],
  ];
  for (const [cx, cz, w, d, tall] of boxes) {
    const base = (height(cx, cz) - 0.45) * 0.42;
    const n = 14;
    for (let a = 0; a <= n; a++) {
      for (let b = 0; b <= n; b++) {
        const u = a / n - 0.5;
        const v = b / n;
        push(cx + u * w, base + v * tall, cz - d / 2, 6);
        push(cx + u * w, base + v * tall, cz + d / 2, 6);
        push(cx - w / 2, base + v * tall, cz + u * d, 5);
        push(cx + w / 2, base + v * tall, cz + u * d, 5);
        push(cx + u * w, base + tall, cz + (v - 0.5) * d, 7);
      }
    }
  }

  // One mound marked as found: the theme's single lime signal.
  for (let i = 0; i < 520; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = Math.sqrt(rand()) * 0.13;
    const x = 0.55 + Math.cos(angle) * radius;
    const z = 0.38 + Math.sin(angle) * radius * 0.8;
    const dome = Math.cos((radius / 0.13) * (Math.PI / 2)) * 0.07;
    push(x, (height(x, z) - 0.45) * 0.42 + dome, z, BUCKETS);
  }

  return { positions: Float32Array.from(xs), bucket: Uint8Array.from(buckets), count: buckets.length };
}

/** Reads the theme's point colours from the CSS tokens, so the canvas never holds a colour of its own. */
function readPalette(host: HTMLElement): { ramp: string[]; lit: string; found: string } {
  const probe = document.createElement('span');
  probe.style.display = 'none';
  host.appendChild(probe);
  const resolve = (value: string) => {
    probe.style.color = value;
    return getComputedStyle(probe).color;
  };
  const ramp: string[] = [];
  for (let i = 0; i < BUCKETS; i++) {
    const t = i / (BUCKETS - 1);
    ramp.push(
      t < 0.5
        ? resolve(`color-mix(in oklch, var(--point-mid) ${Math.round(t * 200)}%, var(--point-lo))`)
        : resolve(`color-mix(in oklch, var(--point-hi) ${Math.round((t - 0.5) * 200)}%, var(--point-mid))`),
    );
  }
  const lit = resolve('var(--point-hi)');
  const found = resolve('var(--color-accent)');
  probe.remove();
  return { ramp, lit, found };
}

const REVOLUTION_MS = 120_000;
const SWEEP_MS = 7_000;

/**
 * Vantage's signature surface: a terrain drawn as points only, turning once
 * every two minutes while a sweep passes through and lifts the points it
 * touches. No lines between points, no glow. Colour runs by height from
 * --point-lo to --point-hi; lime marks the one thing found.
 *
 * It is an illustration generated in the browser, not a scan of a real site.
 * The loop pauses off screen and in a hidden tab, has a visible pause button,
 * and under reduced motion shows one still frame with the sweep mid-scene.
 */
export function PointCloud({ className = '', label = 'A terrain with a few buildings drawn as a cloud of points, turning slowly.' }: PointCloudProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [held, setHeld] = useState(false);
  const heldRef = useRef(held);

  useEffect(() => {
    heldRef.current = held;
  }, [held]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!host || !canvas || !context) return;

    const small = window.matchMedia('(max-width: 48rem)').matches;
    const cloud = buildCloud(small ? 96 : 150);
    const palette = readPalette(host);

    // Draw order by bucket, so the fill colour changes nine times a frame, not once a point.
    const order = Array.from({ length: cloud.count }, (_, i) => i).sort(
      (a, b) => (cloud.bucket[a] ?? 0) - (cloud.bucket[b] ?? 0),
    );

    let width = 0;
    let height = 0;
    let dpr = 1;
    let visible = true;
    let frame = 0;
    let clock = SWEEP_MS * 0.45;
    let last = 0;
    let tiltX = 0;
    let tiltY = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const yaw = (clock / REVOLUTION_MS) * Math.PI * 2 + 0.6 + tiltX;
      const pitch = 0.62 + tiltY;
      const cosYaw = Math.cos(yaw);
      const sinYaw = Math.sin(yaw);
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const scale = Math.min(width, height * 1.5) * 0.52;
      const centreX = width * 0.52;
      const centreY = height * 0.52;
      // Linear travel: the sweep is a scan crossing the site, not a UI state.
      const sweep = ((clock % SWEEP_MS) / SWEEP_MS) * 2.6 - 1.3;
      const lit: number[] = [];

      let currentBucket = -1;
      for (const index of order) {
        const o = index * 3;
        const x = cloud.positions[o] ?? 0;
        const y = cloud.positions[o + 1] ?? 0;
        const z = cloud.positions[o + 2] ?? 0;
        const rx = x * cosYaw - z * sinYaw;
        const rz = x * sinYaw + z * cosYaw;
        const ry = y * cosPitch - rz * sinPitch;
        const depth = y * sinPitch + rz * cosPitch;
        const perspective = 2.6 / (2.6 + depth);
        const sx = centreX + rx * scale * perspective;
        const sy = centreY - ry * scale * perspective;
        if (sx < -4 || sx > width + 4 || sy < -4 || sy > height + 4) continue;
        const size = perspective > 1.08 ? 1.9 : perspective > 0.94 ? 1.4 : 1;
        const bucket = cloud.bucket[index] ?? 0;
        if (bucket < BUCKETS && Math.abs(x - sweep) < 0.035) {
          lit.push(sx, sy, size);
          continue;
        }
        if (bucket !== currentBucket) {
          currentBucket = bucket;
          context.fillStyle = bucket === BUCKETS ? palette.found : (palette.ramp[bucket] ?? palette.lit);
        }
        context.fillRect(sx, sy, size, size);
      }

      context.fillStyle = palette.lit;
      for (let i = 0; i < lit.length; i += 3) {
        const size = (lit[i + 2] ?? 1) + 0.6;
        context.fillRect(lit[i] ?? 0, lit[i + 1] ?? 0, size, size);
      }
    };

    const tick = (now: number) => {
      frame = window.requestAnimationFrame(tick);
      const delta = last ? Math.min(now - last, 64) : 16;
      last = now;
      if (!visible || heldRef.current || document.hidden) return;
      clock += delta;
      tiltX += (targetTiltX - tiltX) * 0.06;
      tiltY += (targetTiltY - tiltY) * 0.06;
      draw();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = host.getBoundingClientRect();
      targetTiltX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.1;
      targetTiltY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.06;
    };
    const onPointerLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    visibilityObserver.observe(host);
    resize();

    if (!reducedMotion) {
      host.addEventListener('pointermove', onPointerMove);
      host.addEventListener('pointerleave', onPointerLeave);
      frame = window.requestAnimationFrame(tick);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [reducedMotion]);

  return (
    <div ref={hostRef} className={`stage ${className}`}>
      <canvas ref={canvasRef} className="stage__cloud" role="img" aria-label={label} />
      <div className="stage__bar">
        <p className="label">Illustration drawn in your browser, not a scan of a real site.</p>
        {reducedMotion ? null : (
          <button
            type="button"
            className="icon-btn icon-btn--solid shrink-0"
            aria-label={held ? 'Play the point cloud' : 'Pause the point cloud'}
            aria-pressed={held}
            onClick={() => setHeld((value) => !value)}
          >
            {held ? (
              <Play size={18} strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Pause size={18} strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
