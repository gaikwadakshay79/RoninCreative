/**
 * Business details, in one place. Every page reads from here.
 *
 * Leave a value as an empty string until it is confirmed. The site shows a
 * "to be added" state for a missing detail and never a broken link.
 */
export const siteConfig = {
  name: 'Ronin Creative',
  founder: 'Rohan Kamble',
  founderRole: 'Photographer, cinematographer and licensed drone pilot',
  tagline: 'Perspective Beyond the Ordinary.',
  supportingLine: 'From the ground to the sky, we capture perspectives that tell extraordinary stories.',
  description:
    'Ronin Creative is the studio of Rohan Kamble: professional photography, cinematography, aerial imaging and 3D visualization.',
  /** Public address of the live site, without a trailing slash. Set VITE_SITE_URL to fill it. */
  url: (import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, ''),
  locale: 'en_IN',
  /** City or region the studio works from, for example "Pune, Maharashtra". */
  location: '',
  contact: {
    email: '',
    /** Display format, for example "+91 98765 43210". */
    phone: '',
    /** Digits only with the country code, for example "919876543210". */
    whatsapp: '',
  },
  /** Full profile URLs. An empty value hides the link. */
  social: {
    instagram: '',
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

/** The contact endpoint of a future API. Empty means the form falls back to email. */
export const contactEndpoint: string = import.meta.env.VITE_CONTACT_ENDPOINT ?? '';

/** True when an enquiry has somewhere to go: an endpoint, or an address to write to. */
export const hasContactChannel = Boolean(siteConfig.contact.email || contactEndpoint);

export function whatsappHref(): string | null {
  const digits = siteConfig.contact.whatsapp.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

export function phoneHref(): string | null {
  const digits = siteConfig.contact.phone.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : null;
}
