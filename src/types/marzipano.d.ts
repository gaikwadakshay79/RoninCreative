/**
 * Types for the parts of Marzipano the site uses. The library ships as plain
 * JavaScript; this covers one viewer, equirectangular and tiled cube scenes
 * (Marzipano Tool exports) and autorotation.
 */
declare module 'marzipano' {
  export interface ViewParameters {
    yaw?: number;
    pitch?: number;
    fov?: number;
  }

  export type ViewLimiter = (params: Required<ViewParameters>) => Required<ViewParameters>;

  export interface EventEmitter {
    addEventListener(event: string, listener: (...args: never[]) => void): void;
    removeEventListener(event: string, listener: (...args: never[]) => void): void;
  }

  export class RectilinearView implements EventEmitter {
    addEventListener(event: string, listener: (...args: never[]) => void): void;
    removeEventListener(event: string, listener: (...args: never[]) => void): void;
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

  export interface CubeLevel {
    tileSize: number;
    size: number;
    fallbackOnly?: boolean;
  }

  export class CubeGeometry {
    constructor(levels: CubeLevel[]);
  }

  export class ImageUrlSource {
    /** `url` may hold {z} {f} {y} {x}; a cube preview strip is used while tiles load. */
    static fromString(url: string, options?: { cubeMapPreviewUrl?: string; cubeMapPreviewFaceOrder?: string }): ImageUrlSource;
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
      geometry: EquirectGeometry | CubeGeometry;
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
    CubeGeometry: typeof CubeGeometry;
    ImageUrlSource: typeof ImageUrlSource;
    autorotate: typeof autorotate;
  };
  export default Marzipano;
}
