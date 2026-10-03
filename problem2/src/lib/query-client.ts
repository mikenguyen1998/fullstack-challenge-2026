import { QueryClient } from '@tanstack/react-query';

import { isApiError } from './api-error';

const MAX_RETRIES = 2;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Never retry client errors (4xx) — they won't succeed on retry.
        if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
        return failureCount < MAX_RETRIES;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
