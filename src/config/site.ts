/**
 * Business details, in one place. Every page reads from here.
 *
 * Leave a value as an empty string until it is confirmed. The site shows a
 * "to be added" state for a missing detail and never a broken link.
 */
export const siteConfig = {
  name: 'Ronin Creative',
  founder: 'Rohan K.',
  founderRole: 'Photographer and Licensed Drone Pilot',
  tagline: 'Perspective Beyond the Ordinary.',
  supportingLine: 'From the ground to the sky, we capture perspectives that tell extraordinary stories.',
  description:
    'Ronin Creative brings together photography and drone expertise to capture compelling visuals from perspectives that stand apart.',
  /** Public address of the live site, without a trailing slash. Set VITE_SITE_URL to fill it. */
  url: (import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, ''),
  locale: 'en_IN',
  /** City or region the studio works from, for example "Pune, Maharashtra". */
  location: '',
  contact: {
    email: 'creativesbyronin@gmail.com',
    /** Display format, main number first. WhatsApp is available on every number here. */
    phones: ['+91 97675 58441', '+91 98814 48441'],
  },
  /** Full profile URLs. An empty value hides the link. */
  social: {
    instagram: 'https://www.instagram.com/ronin_creative',
    youtube: '',
    linkedin: '',
  },
  /** Home page hero. Add a short muted loop to play it over the poster photograph. */
  hero: {
    image: 'hero-home',
    /** Path under /public, for example "/videos/hero.mp4". Keep it under 2 MB. */
    video: '',
  },
};

export type SocialNetwork = keyof typeof siteConfig.social;

export const socialLabels: Record<SocialNetwork, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
};

/** The contact endpoint of a future API. When set, it is used instead of Web3Forms. */
export const contactEndpoint: string = import.meta.env.VITE_CONTACT_ENDPOINT ?? '';

/**
 * Web3Forms access key: enquiries are delivered to the inbox it belongs to.
 * Web3Forms designs this key to be public, so it is safe in client-side code.
 */
export const web3formsKey = 'c34a7ada-7227-4a98-a632-738ad8e30866';

/** True when an enquiry has somewhere to go: a form service, an endpoint or an address to write to. */
export const hasContactChannel = Boolean(web3formsKey || contactEndpoint || siteConfig.contact.email);

export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
