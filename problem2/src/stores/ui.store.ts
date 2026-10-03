import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@/config/constants';

export type Theme = 'light' | 'dark' | 'system';

interface UiState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: STORAGE_KEYS.ui,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
