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
    id: 'photography',
    title: 'Professional photography',
    summary: 'Portraits, products, architecture and events, photographed for print and screen.',
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
  {
    id: 'cinematography',
    title: 'Cinematography and video production',
    summary: 'Brand films, promotional videos and event films, from the shoot to the final edit.',
    description:
      'Moving pictures for brands, places and occasions. Ronin Creative plans the shots, films on the ground and from the air, and edits the footage into a finished film.',
    offerings: ['Brand films', 'Promotional videos', 'Event films', 'Creative cinematography', 'Professional editing'],
    deliverables: [
      'A finished, colour-graded film',
      'Shorter cuts for social media',
      'Aerial sequences where the location allows',
    ],
    image: 'cine-camera',
    related: ['cinematography', 'events'],
    enabled: true,
  },
  {
    id: 'drone',
    title: 'Drone photography and videography',
    summary: 'Aerial stills and film, flown by a licensed drone pilot.',
    description:
      'Rohan Kamble is a licensed drone pilot. Each flight is planned around the location, the light and the airspace rules that apply there, then flown for stills, film or both.',
    offerings: [
      'Aerial photography',
      'Cinematic aerial filming',
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
    id: 'aerial-3d',
    title: 'Aerial 3D modelling',
    summary: 'Buildings, sites and terrain rebuilt as 3D models from drone photographs.',
    description:
      'A drone photographs the subject from many overlapping positions, and photogrammetry software turns those photographs into a textured 3D model you can orbit, zoom and present. The models are made for visualization, not as certified survey data.',
    offerings: [
      'Drone-based photogrammetry',
      'Aerial 3D reconstruction',
      'Property and terrain visualization',
      'Site documentation',
      '3D asset generation',
      'Interactive model presentation',
    ],
    deliverables: [
      'A textured 3D model, ready to view in a browser',
      'Rendered views of the model',
      'An interactive presentation for clients and stakeholders',
    ],
    image: 'model-city',
    related: ['3d-visualization', 'aerial'],
    enabled: true,
  },
  {
    id: 'aerial-360',
    title: '360° aerial experiences',
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
    image: 'aerial-skyline',
    related: ['aerial', 'architecture'],
    enabled: true,
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure and real estate imaging',
    summary: 'Progress records and marketing imagery for sites, buildings and developments.',
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
    related: ['aerial', 'architecture', '3d-visualization'],
    enabled: true,
  },
];
