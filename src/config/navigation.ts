import type { NavItem } from '@/types';

export const primaryNav: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Aerial 3D', to: '/aerial-3d' },
  { label: 'Contact', to: '/contact' },
];

export const contactCta: NavItem = { label: "Let's talk", to: '/contact' };
