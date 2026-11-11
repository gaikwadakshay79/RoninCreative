/**
 * Titles and descriptions of the fixed pages.
 *
 * Read by the app (src/hooks/useSeo.ts) and by scripts/postbuild.mjs, which
 * writes them into each page's static HTML so that crawlers and link previews
 * see them without running JavaScript. Keep this file free of imports.
 */
export interface PageSeo {
  path: string;
  title: string;
  description: string;
  /** Media key of the picture used for link previews. */
  image: string;
}

export const siteName = 'Ronin Creative';

export const pageSeo = {
  home: {
    path: '/',
    title: 'Ronin Creative | Photography, cinematography and aerial imaging',
    description:
      'Ronin Creative is the studio of Rohan Kamble: professional photography, cinematography, aerial imaging and 360° aerial tours.',
    image: 'hero-home',
  },
  about: {
    path: '/about',
    title: 'About Rohan Kamble and Ronin Creative',
    description:
      'Rohan Kamble is a professional photographer, cinematographer and licensed drone pilot. Read how Ronin Creative works on the ground and in the air.',
    image: 'aerial-hills',
  },
  services: {
    path: '/services',
    title: 'Photography, film, drone and 360° aerial services',
    description:
      'Professional photography, cinematography, drone photography and videography, 360° aerial tours and infrastructure imaging.',
    image: 'drone-flight',
  },
  portfolio: {
    path: '/portfolio',
    title: 'Portfolio of photography, film and aerial work',
    description:
      'Photography, cinematography, aerial, architecture, 360° tour and event work from Ronin Creative.',
    image: 'aerial-coast',
  },
  contact: {
    path: '/contact',
    title: 'Contact Ronin Creative',
    description: 'Tell Rohan Kamble about your shoot, film, drone flight or 360° tour and where it takes place.',
    image: 'hero-home',
  },
  credits: {
    path: '/credits',
    title: 'Photograph credits',
    description: 'Sources and licences of the placeholder photographs shown on this site.',
    image: 'hero-home',
  },
} satisfies Record<string, PageSeo>;

export type PageKey = keyof typeof pageSeo;

export function formatTitle(title: string): string {
  return title.includes(siteName) ? title : `${title} | ${siteName}`;
}
