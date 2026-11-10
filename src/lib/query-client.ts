import { QueryClient } from '@tanstack/react-query';
import { hasRemoteApi } from './api/config';

/**
 * Local content never goes stale and never needs a retry. Remote content is
 * cached for five minutes and retried twice, which suits a small content API.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: hasRemoteApi ? 5 * 60 * 1000 : Infinity,
      gcTime: 30 * 60 * 1000,
      retry: hasRemoteApi ? 2 : false,
      refetchOnWindowFocus: hasRemoteApi,
    },
    mutations: { retry: false },
  },
});
