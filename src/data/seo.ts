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
    title: 'Ronin Creative | Drone Imaging and Photography',
    description:
      'Ronin Creative brings together photography and drone expertise to capture compelling visuals from perspectives that stand apart.',
    image: 'hero-home',
  },
  about: {
    path: '/about',
    title: 'About Rohan K. and Ronin Creative',
    description:
      'Rohan K. is a professional photographer and licensed drone pilot. Read how Ronin Creative works on the ground and in the air.',
    image: 'aerial-hills',
  },
  services: {
    path: '/services',
    title: 'Drone, 360° Aerial, Infrastructure and Photography Services',
    description:
      'Drone photography and aerial cinematography, 360° aerial experiences, infrastructure and real estate imaging, and professional photography.',
    image: 'drone-flight',
  },
  portfolio: {
    path: '/portfolio',
    title: 'Portfolio of Aerial Work and Photography',
    description:
      'Aerial, 360° tour, architecture, photography and event work from Ronin Creative.',
    image: 'aerial-coast',
  },
  contact: {
    path: '/contact',
    title: 'Contact Ronin Creative',
    description: 'Tell Rohan K. about your shoot, drone flight or 360° tour and where it takes place.',
    image: 'hero-home',
  },
  credits: {
    path: '/credits',
    title: 'Photograph Credits',
    description: 'Credits and sources of the placeholder photographs shown on this site.',
    image: 'hero-home',
  },
} satisfies Record<string, PageSeo>;

export type PageKey = keyof typeof pageSeo;

export function formatTitle(title: string): string {
  return title.includes(siteName) ? title : `${title} | ${siteName}`;
}
