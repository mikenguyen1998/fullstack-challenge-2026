import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, type ReactNode } from 'react';

import { queryClient } from '@/lib/query-client';

// Devtools are only bundled/loaded in development.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools })),
    )
  : () => null;

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </Suspense>
    </QueryClientProvider>
  );
}
