import * as m from 'motion/react-m';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Position in a staggered group, starting at 0. */
  index?: number;
  as?: 'div' | 'li' | 'section' | 'figure';
}

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The site's one scroll reveal: a short fade with an 8px rise, once, as the
 * block enters the screen. Opacity and transform only. With reduced motion
 * (MotionConfig reducedMotion="user") the rise is dropped and the fade stays.
 */
export function Reveal({ children, className, index = 0, as = 'div' }: RevealProps) {
  const Component = m[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.42, ease, delay: Math.min(index, 8) * 0.05 }}
    >
      {children}
    </Component>
  );
}
