import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { formatAmount, getPriority, UNSUPPORTED_PRIORITY } from './helpers';
import { mockWallet, readRows } from './test/mocks';
import WalletPage from './WalletPage';

describe('WalletPage', () => {
  it('renders without crashing', () => {
    mockWallet({ balances: [] });
    const { container } = render(<WalletPage />);
    expect(readRows(container)).toEqual([]);
  });

  it('shows only positive balances', () => {
    mockWallet({
      balances: [
        { currency: 'ETH', amount: 2, blockchain: 'Ethereum' },
        { currency: 'OSMO', amount: 0, blockchain: 'Osmosis' },
        { currency: 'ARB', amount: -1, blockchain: 'Arbitrum' },
      ],
      prices: { ETH: 1645.93, OSMO: 0.5, ARB: 1 },
    });
    const { container } = render(<WalletPage />);
    expect(readRows(container).map((row) => row.amount)).toEqual([2]);
  });

  it('hides balances on unsupported blockchains', () => {
    mockWallet({
      balances: [
        { currency: 'ETH', amount: 2, blockchain: 'Ethereum' },
        { currency: 'SOL', amount: 5, blockchain: 'Solana' },
        // Inherited object keys must not count as supported chains.
        { currency: 'X', amount: 1, blockchain: 'toString' },
      ],
    });
    const { container } = render(<WalletPage />);
    expect(readRows(container).map((row) => row.amount)).toEqual([2]);
  });

  it('sorts rows by blockchain priority, highest first', () => {
    mockWallet({
      balances: [
        { currency: 'NEO', amount: 1, blockchain: 'Neo' },
        { currency: 'ARB', amount: 2, blockchain: 'Arbitrum' },
        { currency: 'OSMO', amount: 3, blockchain: 'Osmosis' },
        { currency: 'ZIL', amount: 4, blockchain: 'Zilliqa' },
        { currency: 'ETH', amount: 5, blockchain: 'Ethereum' },
      ],
    });
    const { container } = render(<WalletPage />);
    // Osmosis 100 > Ethereum 50 > Arbitrum 30 > Neo 20 = Zilliqa 20 (stable sort keeps input order on ties)
    expect(readRows(container).map((row) => row.amount)).toEqual([3, 5, 2, 1, 4]);
  });

  it('computes usdValue as price × amount', () => {
    mockWallet({
      balances: [
        { currency: 'ETH', amount: 2, blockchain: 'Ethereum' },
        { currency: 'OSMO', amount: 10, blockchain: 'Osmosis' },
      ],
      prices: { ETH: 1645.93, OSMO: 0.5 },
    });
    const { container } = render(<WalletPage />);
    const [osmo, eth] = readRows(container);
    expect(osmo?.usdValue).toBeCloseTo(5);
    expect(eth?.usdValue).toBeCloseTo(3291.86);
  });

  it('uses 0 USD (not NaN) when a price is missing', () => {
    mockWallet({
      balances: [{ currency: 'NOPRICE', amount: 3, blockchain: 'Arbitrum' }],
      prices: {},
    });
    const { container } = render(<WalletPage />);
    expect(readRows(container)).toEqual([{ amount: 3, usdValue: 0, formatted: '3.00' }]);
  });

  it('formats the amount for display', () => {
    mockWallet({
      balances: [
        { currency: 'OSMO', amount: 0.5, blockchain: 'Osmosis' },
        { currency: 'ETH', amount: 1234567.891, blockchain: 'Ethereum' },
        { currency: 'ARB', amount: 0.123456789, blockchain: 'Arbitrum' },
      ],
    });
    const { container } = render(<WalletPage />);
    // Unlike the original `toFixed()`, fractions are kept (2 to 8 decimals) and thousands are grouped.
    expect(readRows(container).map((row) => row.formatted)).toEqual([
      '0.50',
      '1,234,567.891',
      '0.12345679',
    ]);
  });

  it('passes extra props through to the container', () => {
    mockWallet({ balances: [] });
    const { container } = render(<WalletPage id="wallet" className="page" aria-label="Wallet" />);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute('id', 'wallet');
    expect(root).toHaveClass('page');
    expect(root).toHaveAttribute('aria-label', 'Wallet');
  });

  it('gives each row a class and a unique, stable key (no React key warning)', () => {
    const errors: unknown[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => errors.push(args);
    try {
      mockWallet({
        balances: [
          { currency: 'USDC', amount: 1, blockchain: 'Ethereum' },
          { currency: 'USDC', amount: 2, blockchain: 'Arbitrum' },
        ],
      });
      const { container } = render(<WalletPage />);
      const rows = container.querySelectorAll('[data-testid="wallet-row"]');
      expect(rows).toHaveLength(2);
      rows.forEach((row) => expect(row).toHaveClass('row'));
      expect(errors).toEqual([]);
    } finally {
      console.error = original;
    }
  });
});

describe('helpers', () => {
  it('getPriority returns the table value, or UNSUPPORTED_PRIORITY for unknown chains', () => {
    expect(getPriority('Osmosis')).toBe(100);
    expect(getPriority('Neo')).toBe(20);
    expect(getPriority('Solana')).toBe(UNSUPPORTED_PRIORITY);
    expect(getPriority('toString')).toBe(UNSUPPORTED_PRIORITY);
  });

  it('formatAmount uses en-US with 2 to 8 decimals', () => {
    expect(formatAmount(1)).toBe('1.00');
    expect(formatAmount(1234.5)).toBe('1,234.50');
    expect(formatAmount(0.000000012)).toBe('0.00000001');
  });
});
