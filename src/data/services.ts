import type { Service } from '@/types';

/**
 * The services Ronin Creative offers.
 *
 * These are proposed offerings. Set `enabled: false` on any service that is
 * not confirmed before launch: it disappears from the home page, the services
 * page, the contact form and the related-work lists in one step.
 *
 * Do not add claims the studio cannot back with verified capability
 * (survey-grade accuracy, RTK mapping, thermal inspection, LiDAR,
 * engineering certification).
 */
export const services: Service[] = [
  {
    id: 'drone',
    title: 'Drone Photography and Aerial Cinematography',
    summary: 'Aerial stills and cinematic footage by a licensed pilot.',
    description:
      'Rohan K. is a licensed drone pilot. Each flight is planned around the location, the light and the airspace rules that apply there, then flown for stills, footage or both.',
    offerings: [
      'Aerial photography',
      'Aerial cinematography',
      'Real estate aerial imagery',
      'Commercial property showcases',
      'Landscape photography',
      'Event aerial coverage',
    ],
    deliverables: [
      'Edited aerial photographs',
      'Stabilised aerial footage',
      'Top-down and oblique views of the same site',
    ],
    image: 'drone-flight',
    related: ['aerial'],
    enabled: true,
  },
  {
    id: 'aerial-360',
    title: '360° Aerial Experiences',
    summary: 'Aerial panoramas a viewer can look around in.',
    description:
      'A full panorama captured from one point in the air. Viewers turn the scene themselves on a phone or a laptop, which suits properties, campuses and large sites.',
    offerings: [
      'Aerial panoramas',
      'Immersive 360° photography',
      'Interactive property presentations',
      'Virtual aerial experiences',
    ],
    deliverables: [
      'A stitched 360° panorama',
      'An interactive view for your website',
      'Linked viewpoints for larger sites',
    ],
    image: 'panshet-1',
    related: ['360-tours', 'aerial'],
    enabled: true,
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure and Real Estate Imaging',
    summary: 'Progress records and marketing imagery for sites and buildings.',
    description:
      'Repeat visits record how a project changes, and finished buildings are photographed for sale and letting. Ground and aerial views are captured in the same visit.',
    offerings: [
      'Construction progress documentation',
      'Property marketing imagery',
      'Infrastructure visualization',
      'Site photography',
      'Aerial project documentation',
    ],
    deliverables: [
      'Dated photo sets from matching viewpoints',
      'Aerial overviews of the whole site',
      'Marketing images of the finished property',
    ],
    image: 'aerial-construction',
    related: ['aerial', 'architecture'],
    enabled: true,
  },
  {
    id: 'photography',
    title: 'Professional Photography',
    summary: 'Portraits, products, architecture and events.',
    description:
      'Still photography for people, brands and spaces. Each shoot starts with what the pictures are for, then the light, the location and the frames are planned around that use.',
    offerings: [
      'Portrait photography',
      'Commercial photography',
      'Product photography',
      'Architectural photography',
      'Event photography',
    ],
    deliverables: [
      'Edited, colour-corrected images',
      'High-resolution files for print',
      'Web-sized files for sites and social media',
    ],
    image: 'photo-camera',
    related: ['photography', 'architecture', 'events'],
    enabled: true,
  },
];
