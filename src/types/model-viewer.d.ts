import type { DetailedHTMLProps, HTMLAttributes } from 'react';

/** JSX typing for the <model-viewer> custom element, limited to the attributes the site sets. */
interface ModelViewerAttributes extends HTMLAttributes<HTMLElement> {
  src?: string;
  alt?: string;
  poster?: string;
  loading?: 'auto' | 'lazy' | 'eager';
  reveal?: 'auto' | 'manual';
  exposure?: string;
  'camera-controls'?: boolean;
  'touch-action'?: 'pan-x' | 'pan-y' | 'none';
  'interaction-prompt'?: 'auto' | 'none';
  'shadow-intensity'?: string;
  'auto-rotate'?: boolean;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': DetailedHTMLProps<ModelViewerAttributes, HTMLElement>;
    }
  }
}
