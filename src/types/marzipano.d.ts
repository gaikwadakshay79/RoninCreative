/**
 * Types for the parts of Marzipano the site uses. The library ships as plain
 * JavaScript; this covers one viewer, equirectangular scenes and autorotation.
 */
declare module 'marzipano' {
  export interface ViewParameters {
    yaw?: number;
    pitch?: number;
    fov?: number;
  }

  export type ViewLimiter = (params: Required<ViewParameters>) => Required<ViewParameters>;

  export class RectilinearView {
    constructor(params?: ViewParameters, limiter?: ViewLimiter);
    static limit: {
      traditional(maxResolution: number, maxVFov: number, maxHFov?: number): ViewLimiter;
    };
    yaw(): number;
    pitch(): number;
    fov(): number;
    setParameters(params: ViewParameters): void;
    offsetYaw(delta: number): void;
    offsetPitch(delta: number): void;
    offsetFov(delta: number): void;
  }

  export class EquirectGeometry {
    constructor(levels: Array<{ width: number }>);
  }

  export class ImageUrlSource {
    static fromString(url: string): ImageUrlSource;
  }

  export interface EventEmitter {
    addEventListener(event: string, listener: (...args: never[]) => void): void;
    removeEventListener(event: string, listener: (...args: never[]) => void): void;
  }

  export type TextureStore = EventEmitter;

  export interface Layer {
    textureStore(): TextureStore;
  }

  export interface Scene {
    switchTo(options?: { transitionDuration?: number }, done?: () => void): void;
    view(): RectilinearView;
    layer(): Layer;
    lookTo(params: ViewParameters, options?: { transitionDuration?: number }, done?: () => void): void;
  }

  export type Stage = EventEmitter;

  export interface Controls {
    disableMethod(id: string): void;
    enableMethod(id: string): void;
  }

  export type Movement = () => unknown;

  export class Viewer {
    constructor(
      element: HTMLElement,
      options?: { controls?: { mouseViewMode?: 'drag' | 'qtvr'; scrollZoom?: boolean }; stage?: { progressive?: boolean } },
    );
    createScene(options: {
      source: ImageUrlSource;
      geometry: EquirectGeometry;
      view: RectilinearView;
      pinFirstLevel?: boolean;
    }): Scene;
    stage(): Stage;
    controls(): Controls;
    updateSize(): void;
    startMovement(movement: Movement, done?: () => void): void;
    stopMovement(): void;
    setIdleMovement(timeout: number, movement?: Movement | null): void;
    breakIdleMovement(): void;
    destroy(): void;
  }

  export function autorotate(options?: {
    yawSpeed?: number;
    pitchSpeed?: number;
    fovSpeed?: number;
    yawAccel?: number;
    targetPitch?: number | null;
    targetFov?: number | null;
  }): Movement;

  const Marzipano: {
    Viewer: typeof Viewer;
    RectilinearView: typeof RectilinearView;
    EquirectGeometry: typeof EquirectGeometry;
    ImageUrlSource: typeof ImageUrlSource;
    autorotate: typeof autorotate;
  };
  export default Marzipano;
}
