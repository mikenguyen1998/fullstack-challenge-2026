import type { ReactNode } from 'react';

import { useThemeEffect } from '@/hooks/useThemeEffect';

export function ThemeProvider({ children }: { children: ReactNode }) {
  useThemeEffect();
  return children;
}
