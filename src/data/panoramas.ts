import type { Panorama } from '@/types';

/**
 * 360° panoramas shown in the viewer on the Services page.
 *
 * A finished tour from the Marzipano Tool (several scenes, tiled): copy the
 * export's app-files/ folder to public/tours/<name>/, set
 * `tour: { path: '/tours/<name>' }` and make the poster with
 * `npm run tour-images -- <name> <id>`. The site reads the tour's data.js and
 * shows its scenes in its own viewer, with a compass and scene thumbnails.
 *
 * A single panorama (stitched in PTGui or similar): export an
 * equirectangular JPEG exactly twice as wide as it is tall, save it as
 * media/panoramas/<id>.jpg, run `npm run media` and add an entry with the
 * same id and no `tour`.
 *
 * A tour from another tool (Pano2VR and the like): copy it to
 * public/tours/<name>/ and set `embed: '/tours/<name>/index.html'`. It is
 * shown in a frame with that tool's own controls.
 *
 * See the README, "Adding 360° panoramas".
 */
export const panoramas: Panorama[] = [
  {
    // Rohan's own aerial tour, three scenes, exported from the Marzipano Tool.
    id: 'panshet',
    title: 'Splendid Valley Retreat, Panshet',
    alt: 'A 360° aerial tour of Splendid Valley Retreat near Panshet: a terraced café with stone retaining walls, red earth paths and forested hills all around',
    tour: {
      path: '/tours/panshet',
      // Where north lies in each scene, in degrees of yaw. All three scenes are
      // stitched by scripts/stitch from the drone's compass headings, so yaw 0 is
      // true north in each.
      north: { '0-panshet-1': 0, '1-pano_0001-panorama': 0, '2-pano_0001-panorama': 0 },
    },
    placeholder: false,
  },
];
