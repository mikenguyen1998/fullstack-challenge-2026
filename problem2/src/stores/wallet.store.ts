import { STORAGE_KEYS } from '@/config/constants';
import { applySwapToBalances, INITIAL_BALANCES, type Balances } from '@/lib/swap';
import type { SwapReceipt } from '@/services/swap.service';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface WalletState {
  balances: Balances;
  applySwap: (receipt: SwapReceipt) => void;
  resetWallet: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      balances: INITIAL_BALANCES,
      applySwap: (receipt) => set((s) => ({ balances: applySwapToBalances(s.balances, receipt) })),
      resetWallet: () => set({ balances: INITIAL_BALANCES }),
    }),
    { name: STORAGE_KEYS.wallet, storage: createJSONStorage(() => localStorage) },
  ),
);
