import type { ModelAsset } from '@/types';

/**
 * Interactive 3D models shown on the Aerial 3D page.
 *
 * The list is empty on purpose: no finished model has been supplied yet, and
 * the site never shows a fabricated one. While it is empty the page shows a
 * "being prepared" state in place of the viewer.
 *
 * To add a model:
 *   1. Export it as .glb (preferred) or .gltf and copy it to public/models/.
 *   2. Optionally add a poster picture to media/originals/ and run `npm run media`.
 *   3. Add an entry below.
 *
 * Example:
 *
 *   {
 *     id: 'hillside-villa',
 *     title: 'Hillside villa',
 *     src: '/models/hillside-villa.glb',
 *     poster: 'hillside-villa-poster',
 *     alt: 'A 3D model of a two-storey villa on a sloped plot, with its garden and driveway',
 *     description: 'Reconstructed from drone photographs taken in one morning flight.',
 *   },
 */
export const models: ModelAsset[] = [];
