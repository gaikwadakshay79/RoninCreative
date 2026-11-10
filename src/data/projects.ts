import type { Project, ProjectCategory } from '@/types';

/**
 * Portfolio projects.
 *
 * Every entry below is a PLACEHOLDER STUDY built on a licensed stand-in
 * photograph (`placeholder: true`). They show how real projects will look and
 * read; none of them is a client commission and none is Rohan Kamble's work.
 *
 * To publish a real project: add its pictures to media/originals/, run
 * `npm run media`, describe them in src/data/media.ts, then add an entry here
 * with `placeholder: false`. Fields you leave out are simply not rendered.
 * See the README, "Adding projects".
 */
export const categoryLabels: Record<ProjectCategory, string> = {
  photography: 'Photography',
  cinematography: 'Cinematography',
  aerial: 'Aerial',
  architecture: 'Architecture',
  '3d-visualization': '3D Visualization',
  events: 'Events',
};

export const categoryOrder: ProjectCategory[] = [
  'photography',
  'cinematography',
  'aerial',
  'architecture',
  '3d-visualization',
  'events',
];

export const projects: Project[] = [
  {
    slug: 'coastline-straight-down',
    title: 'Coastline, straight down',
    category: 'aerial',
    summary: 'A top-down pass along a rocky shore, with forest on one side and open water on the other.',
    overview: [
      'Top-down coastal flights are planned around the tide and the angle of the sun, so the water keeps its colour.',
      'The same flight returns oblique views and a wider establishing frame.',
    ],
    cover: 'aerial-coast',
    gallery: ['aerial-island', 'aerial-beach', 'aerial-village'],
    services: ['drone'],
    featured: true,
    placeholder: true,
  },
  {
    slug: 'glass-office-at-dusk',
    title: 'Glass office at dusk',
    category: 'architecture',
    summary: 'A corner office building at blue hour, its floors lit from inside.',
    overview: [
      'Buildings are photographed twice where the schedule allows: in flat daylight for the record, and at dusk when interior light balances the sky.',
      'Facade and circulation details follow.',
    ],
    cover: 'arch-office',
    gallery: ['arch-facade', 'arch-stairs'],
    services: ['photography'],
    featured: true,
    placeholder: true,
  },
  {
    slug: 'construction-site-overview',
    title: 'Construction site overview',
    category: 'aerial',
    summary: 'A large structure mid-build, recorded from the air with its roads and surroundings.',
    overview: [
      'Progress records repeat the same viewpoints on every visit, so one month can be laid over the next.',
      'An overview of the whole site is paired with closer frames of the works.',
    ],
    cover: 'aerial-construction',
    gallery: ['aerial-interchange', 'aerial-bridge', 'aerial-railworks'],
    services: ['infrastructure', 'drone'],
    featured: true,
    placeholder: true,
  },
  {
    slug: 'city-block-model',
    title: 'City block model',
    category: '3d-visualization',
    summary: 'A district set out as a scale model, with its buildings, streets and trees.',
    overview: [
      'Aerial 3D models start as several hundred overlapping photographs, matched point by point to rebuild the surface of a site.',
      'The finished model can be orbited in a browser or rendered as stills.',
    ],
    cover: 'model-city',
    gallery: ['model-massing', 'aerial-city'],
    services: ['aerial-3d'],
    featured: true,
    placeholder: true,
  },
  {
    slug: 'festival-main-stage',
    title: 'Festival main stage',
    category: 'events',
    summary: 'A night crowd under crossing beams of stage light.',
    overview: [
      'Event coverage follows the running order: the room before doors, the headline moments, the crowd from the back.',
      'Stills and film are shot side by side.',
    ],
    cover: 'event-stage',
    gallery: ['event-drums'],
    services: ['photography', 'cinematography'],
    featured: true,
    placeholder: true,
  },
  {
    slug: 'terraced-vineyards',
    title: 'Terraced vineyards',
    category: 'aerial',
    summary: 'Curving rows of vines across a hillside, seen from a low oblique angle.',
    cover: 'aerial-vineyard',
    gallery: ['aerial-hills', 'aerial-gardens'],
    services: ['drone'],
    placeholder: true,
  },
  {
    slug: 'crater-road',
    title: 'Road into the crater',
    category: 'aerial',
    summary: 'A switchback road climbing a cliff while cloud spills over the rim.',
    cover: 'hero-home',
    services: ['drone', 'cinematography'],
    placeholder: true,
  },
  {
    slug: 'city-crossing',
    title: 'City crossing from above',
    category: 'aerial',
    summary: 'Painted road markings and a single taxi, framed from directly overhead.',
    cover: 'aerial-crossing',
    services: ['drone'],
    placeholder: true,
  },
  {
    slug: 'skyline-at-sunset',
    title: 'Skyline at sunset',
    category: 'aerial',
    summary: 'A city centre against low sun, from the height of a panorama flight.',
    cover: 'aerial-skyline',
    services: ['aerial-360', 'drone'],
    placeholder: true,
  },
  {
    slug: 'cable-stay-pylon',
    title: 'Cable-stay pylon at night',
    category: 'architecture',
    summary: 'A bridge pylon and its fanned cables, lit against a black sky.',
    cover: 'arch-pylon',
    services: ['photography', 'infrastructure'],
    placeholder: true,
  },
  {
    slug: 'three-spotlights',
    title: 'Three spotlights',
    category: 'cinematography',
    summary: 'Dancers in silhouette against red, blue and yellow circles of light.',
    cover: 'event-dancers',
    services: ['cinematography'],
    placeholder: true,
  },
  {
    slug: 'camera-on-set',
    title: 'Camera on set',
    category: 'cinematography',
    summary: 'A cinema camera rigged with a matte box and rails, ready for a take.',
    cover: 'cine-camera',
    services: ['cinematography'],
    placeholder: true,
  },
  {
    slug: 'product-studio',
    title: 'Product studio',
    category: 'photography',
    summary: 'A lighting setup with softboxes around a product table.',
    cover: 'photo-studio',
    services: ['photography'],
    placeholder: true,
  },
  {
    slug: 'behind-the-lens',
    title: 'Behind the lens',
    category: 'photography',
    summary: 'A photographer framing a shot in warm backlight.',
    cover: 'photo-camera',
    services: ['photography'],
    placeholder: true,
  },
];
