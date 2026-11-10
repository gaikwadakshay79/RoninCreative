import { QueryClientProvider } from '@tanstack/react-query';
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { queryClient } from '@/lib/query-client';

/**
 * App-wide providers. Ant Design is not here on purpose: its ConfigProvider
 * lives in AntdProvider and loads only with the pieces that use it (the
 * contact form and the mobile menu), which keeps it out of the first paint.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
    </QueryClientProvider>
  );
}
