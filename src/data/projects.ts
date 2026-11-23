import type { PortfolioGroup, Project, ProjectCategory } from '@/types';

/**
 * Portfolio projects.
 *
 * Entries with `placeholder: true` are PLACEHOLDER STUDIES built on licensed
 * stand-in photographs. They show how real projects will look and read; none
 * of them is a client commission or Rohan K.'s work. Entries with
 * `placeholder: false` are his own.
 *
 * To publish a real project: add its pictures to media/originals/, run
 * `npm run media`, describe them in src/data/media.ts, then add an entry here
 * with `placeholder: false`. Fields you leave out are simply not rendered.
 * See the README, "Adding projects".
 */
export const categoryLabels: Record<ProjectCategory, string> = {
  '360-tours': '360° Tours',
  'aerial-cinematography': 'Aerial Cinematography',
  'aerial-photography': 'Aerial Photography',
  infrastructure: 'Infrastructure and Real Estate',
  product: 'Product',
  maternity: 'Maternity',
  'pre-wedding': 'Pre-Wedding',
  'ai-product': 'AI Product',
  'ai-model': 'AI Model',
  'other-photography': 'Photography',
};

/** The portfolio's filters. A section appears once it has at least one project. */
export const portfolioGroups: PortfolioGroup[] = [
  {
    id: 'aerial',
    label: 'Aerial',
    sections: [
      { id: '360-tours', label: categoryLabels['360-tours'] },
      { id: 'aerial-cinematography', label: categoryLabels['aerial-cinematography'] },
      { id: 'aerial-photography', label: categoryLabels['aerial-photography'] },
      { id: 'infrastructure', label: categoryLabels.infrastructure },
    ],
  },
  {
    id: 'photography',
    label: 'Photography',
    sections: [
      { id: 'product', label: categoryLabels.product },
      { id: 'maternity', label: categoryLabels.maternity },
      { id: 'pre-wedding', label: categoryLabels['pre-wedding'] },
    ],
  },
  {
    id: 'ai-studio',
    label: 'AI Studio',
    sections: [
      { id: 'ai-product', label: 'Product' },
      { id: 'ai-model', label: 'Model' },
    ],
  },
];

/** Whether a project belongs to a portfolio section and so appears in lists of work. */
export const isListed = (project: Pick<Project, 'category'>): boolean =>
  portfolioGroups.some((group) => group.sections.some((section) => section.id === project.category));

export const projects: Project[] = [
  {
    slug: 'splendid-valley-retreat-panshet',
    title: 'Splendid Valley Retreat, Panshet',
    category: '360-tours',
    summary: 'A 360° aerial tour of a hillside retreat near Panshet, seen from three points in the air.',
    overview: [
      'Three aerial panoramas, each taken from one point above the site, show the retreat with the valley and hills around it.',
      'Visitors turn each view themselves, from the sky overhead to the ground below the drone, and move between the three viewpoints in the tour below.',
    ],
    cover: 'panshet-1',
    gallery: ['panshet-1', 'panshet-2', 'panshet-3'],
    panorama: 'panshet',
    location: 'Panshet, Maharashtra',
    services: ['aerial-360', 'drone'],
    featured: true,
    placeholder: false,
  },
  {
    slug: 'coastline-straight-down',
    title: 'Coastline, Straight Down',
    category: 'aerial-photography',
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
    title: 'Glass Office at Dusk',
    category: 'infrastructure',
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
    title: 'Construction Site Overview',
    category: 'infrastructure',
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
    slug: 'festival-main-stage',
    title: 'Festival Main Stage',
    category: 'other-photography',
    summary: 'A night crowd under crossing beams of stage light.',
    overview: [
      'Event coverage follows the running order: the room before doors, the headline moments, the crowd from the back.',
      'Wide frames and close details are covered through the set.',
    ],
    cover: 'event-stage',
    gallery: ['event-drums'],
    services: ['photography'],
    featured: true,
    placeholder: true,
  },
  {
    slug: 'terraced-vineyards',
    title: 'Terraced Vineyards',
    category: 'aerial-photography',
    summary: 'Curving rows of vines across a hillside, seen from a low oblique angle.',
    cover: 'aerial-vineyard',
    gallery: ['aerial-hills', 'aerial-gardens'],
    services: ['drone'],
    placeholder: true,
  },
  {
    slug: 'crater-road',
    title: 'Road Into the Crater',
    category: 'aerial-photography',
    summary: 'A switchback road climbing a cliff while cloud spills over the rim.',
    cover: 'hero-home',
    services: ['drone'],
    placeholder: true,
  },
  {
    slug: 'city-crossing',
    title: 'City Crossing From Above',
    category: 'aerial-photography',
    summary: 'Painted road markings and a single taxi, framed from directly overhead.',
    cover: 'aerial-crossing',
    services: ['drone'],
    placeholder: true,
  },
  {
    slug: 'skyline-at-sunset',
    title: 'Skyline at Sunset',
    category: 'aerial-photography',
    summary: 'A city centre against low sun, from the height of a panorama flight.',
    cover: 'aerial-skyline',
    services: ['aerial-360', 'drone'],
    placeholder: true,
  },
  {
    slug: 'cable-stay-pylon',
    title: 'Cable-Stay Pylon at Night',
    category: 'infrastructure',
    summary: 'A bridge pylon and its fanned cables, lit against a black sky.',
    cover: 'arch-pylon',
    services: ['photography', 'infrastructure'],
    placeholder: true,
  },
  {
    slug: 'product-studio',
    title: 'Product Studio',
    category: 'product',
    summary: 'A lighting setup with softboxes around a product table.',
    cover: 'photo-studio',
    services: ['photography'],
    placeholder: true,
  },
  {
    slug: 'behind-the-lens',
    title: 'Behind the Lens',
    category: 'other-photography',
    summary: 'A photographer framing a shot in warm backlight.',
    cover: 'photo-camera',
    services: ['photography'],
    placeholder: true,
  },
];
