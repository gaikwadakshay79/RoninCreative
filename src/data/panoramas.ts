import type { Panorama } from '@/types';

/**
 * 360° panoramas shown in the viewer on the Services page.
 *
 * THE THREE ENTRIES BELOW ARE LICENSED DEMOS (`placeholder: true`) from
 * Wikimedia Commons, credited on /credits. None is Ronin Creative's work.
 *
 * To add your own panorama (stitched in PTGui or similar):
 *   1. Export it as an equirectangular JPEG, exactly twice as wide as it is
 *      tall (for example 8000 x 4000), with the horizon level.
 *   2. Save it as media/panoramas/<id>.jpg and run `npm run media`.
 *   3. Add an entry here with the same id, `placeholder: false` and no credit.
 *
 * To show a finished tour exported from the Marzipano Tool or Pano2VR instead
 * (several linked scenes, hotspots): copy the exported folder to
 * public/tours/<name>/ and set `embed: '/tours/<name>/index.html'`. Add a
 * poster picture as public/panoramas/<id>-poster.jpg (16:9, about 1280px wide).
 *
 * See the README, "Adding 360° panoramas".
 */
export const panoramas: Panorama[] = [
  {
    id: 'coast',
    title: 'Coast and fields',
    alt: 'A 360° aerial view of a chalk coastline, with tidal flats on both sides and ploughed fields running inland',
    view: { yaw: 0, pitch: -22, fov: 95 },
    placeholder: true,
    credit: {
      author: 'Maximilian Schönherr',
      licence: 'CC BY-SA 4.0',
      source:
        'https://commons.wikimedia.org/wiki/File:Sotteville_sur_Mer_%E2%80%93_Normandie_%E2%80%93_360%C2%B0_drone_panorama.jpg',
    },
  },
  {
    id: 'river-town',
    title: 'River town',
    alt: 'A 360° aerial view of an old town on a river bend, with sandbanks, a long white hall and farmland beyond',
    view: { yaw: 0, pitch: -24, fov: 95 },
    placeholder: true,
    credit: {
      author: 'SimonWaldherr',
      licence: 'CC BY-SA 4.0',
      source: 'https://commons.wikimedia.org/wiki/File:Luftbildpanorama_Straubing_Donau.jpg',
    },
  },
  {
    id: 'city-district',
    title: 'City district',
    alt: 'A 360° aerial view of a dense city district of low industrial roofs, rail lines and a distant tower',
    view: { yaw: 0, pitch: -24, fov: 95 },
    placeholder: true,
    credit: {
      author: 'Maximilian Schönherr',
      licence: 'CC BY-SA 4.0',
      source:
        'https://commons.wikimedia.org/wiki/File:K%C3%B6ln-Ehrenfeld_%E2%80%93_360%C2%B0-Panorama_aus_der_Luft_(2019).jpg',
    },
  },
];
