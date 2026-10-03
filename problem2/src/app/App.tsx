import { MainLayout } from '@/components/layout';

import { AppProviders } from './providers/AppProviders';

export function App() {
  return (
    <AppProviders>
      <MainLayout />
    </AppProviders>
  );
}
