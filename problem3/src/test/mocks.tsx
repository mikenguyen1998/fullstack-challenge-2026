/**
 * Test doubles for the globals declared in src/externals.d.ts.
 * Call `mockWallet(...)` before rendering <WalletPage />.
 */
import type { JSX } from 'react';

type Balance = ReturnType<typeof useWalletBalances>[number];

const g = globalThis as unknown as {
  useWalletBalances: () => Balance[];
  usePrices: () => Record<string, number>;
  WalletRow: (props: WalletRowProps) => JSX.Element;
  classes: { row: string };
};

/** Renders each row as plain data so tests can read it back. */
function MockWalletRow({ className, amount, usdValue, formattedAmount }: WalletRowProps) {
  return (
    <div
      data-testid="wallet-row"
      className={className}
      data-amount={amount}
      data-usd-value={usdValue}
    >
      {formattedAmount}
    </div>
  );
}

export function mockWallet({
  balances,
  prices = {},
}: {
  balances: Balance[];
  prices?: Record<string, number>;
}) {
  g.useWalletBalances = () => balances;
  g.usePrices = () => prices;
  g.WalletRow = MockWalletRow;
  g.classes = { row: 'row' };
}

/** Reads the rendered rows back as plain objects, in display order. */
export function readRows(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>('[data-testid="wallet-row"]')].map((row) => ({
    amount: Number(row.dataset.amount),
    usdValue: Number(row.dataset.usdValue),
    formatted: row.textContent ?? '',
  }));
}
