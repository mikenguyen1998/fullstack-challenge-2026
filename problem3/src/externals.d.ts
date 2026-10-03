/**
 * Declarations for things the Problem 3 snippet (WalletPage) uses but never defines or imports.
 * They come from the rest of the original codebase, so they're declared globally here
 * just to let the code type-check. The shapes match how the snippet uses them.
 * In tests they're replaced with mocks (see src/test/mocks.tsx).
 */
import type { FC, HTMLAttributes } from 'react';

declare global {
  /** Props of the layout `Box` component the page extends. */
  interface BoxProps extends HTMLAttributes<HTMLDivElement> {}

  /** Wallet balances. The API also returns `blockchain`, which the snippet's interface is missing. */
  function useWalletBalances(): Array<{ currency: string; amount: number; blockchain: string }>;

  /** USD price per currency, e.g. { ETH: 1645.93 }. A currency without a price is absent. */
  function usePrices(): Record<string, number>;

  interface WalletRowProps {
    className?: string;
    amount: number;
    usdValue: number;
    formattedAmount: string;
  }
  const WalletRow: FC<WalletRowProps>;

  /** CSS-module / JSS classes used as `classes.row`. */
  const classes: { row: string };
}

export {};
