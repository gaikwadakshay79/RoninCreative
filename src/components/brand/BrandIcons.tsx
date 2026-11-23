import type { SVGProps } from 'react';

/*
 * WhatsApp and Instagram as outline icons, drawn on the same 24px grid and
 * 1.5 stroke as the site's other icons. Line shapes after Tabler Icons (MIT).
 * They take their colour from `currentColor`.
 */

interface BrandIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

function IconSvg({ size = 20, children, ...rest }: BrandIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function WhatsAppIcon(props: BrandIconProps) {
  return (
    <IconSvg {...props}>
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    </IconSvg>
  );
}

export function InstagramIcon(props: BrandIconProps) {
  return (
    <IconSvg {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.25" />
      <path d="M16.5 7.5v.01" />
    </IconSvg>
  );
}
