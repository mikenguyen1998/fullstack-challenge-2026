import { describe, expect, it } from 'vitest';

import {
  applySwapToBalances,
  computeOutputAmount,
  formatAmount,
  getExchangeRate,
  getTokenIcon,
  toTokenMap,
} from './swap';

describe('getExchangeRate', () => {
  it('returns how many `to` tokens one `from` token buys', () => {
    expect(getExchangeRate(1645.93, 1)).toBeCloseTo(1645.93); // 1 ETH → ~1645.93 USDC
    expect(getExchangeRate(1, 1645.93)).toBeCloseTo(1 / 1645.93); // 1 USDC → ~0.0006 ETH
  });

  it('returns 0 when a price is missing or not positive', () => {
    expect(getExchangeRate(0, 1)).toBe(0);
    expect(getExchangeRate(1, 0)).toBe(0);
    expect(getExchangeRate(-1, 1)).toBe(0);
  });
});

describe('computeOutputAmount', () => {
  it('multiplies the amount by the rate', () => {
    expect(computeOutputAmount(2, 1645.93)).toBeCloseTo(3291.86);
  });

  it('returns 0 for empty or invalid amounts', () => {
    expect(computeOutputAmount(0, 10)).toBe(0);
    expect(computeOutputAmount(NaN, 10)).toBe(0);
    expect(computeOutputAmount(-1, 10)).toBe(0);
  });
});

describe('toTokenMap', () => {
  it('keeps the most recent price for duplicated currencies', () => {
    const map = toTokenMap([
      { currency: 'USDC', date: '2023-08-29T07:10:30.000Z', price: 0.98 },
      { currency: 'USDC', date: '2023-08-29T07:10:40.000Z', price: 1 },
      { currency: 'USDC', date: '2023-08-29T07:10:35.000Z', price: 0.99 },
    ]);
    expect(map.USDC?.price).toBe(1);
  });

  it('on equal dates, the later entry wins', () => {
    const date = '2023-08-29T07:10:30.000Z';
    const map = toTokenMap([
      { currency: 'BUSD', date, price: 0.99 },
      { currency: 'BUSD', date, price: 1.01 },
    ]);
    expect(map.BUSD?.price).toBe(1.01);
  });

  it('drops entries without a positive price', () => {
    const date = '2023-08-29T07:10:30.000Z';
    const map = toTokenMap([
      { currency: 'ZERO', date, price: 0 },
      { currency: '', date, price: 1 },
      { currency: 'ETH', date, price: 1645.93 },
    ]);
    expect(Object.keys(map)).toEqual(['ETH']);
  });
});

describe('getTokenIcon', () => {
  it('maps upper-cased feed symbols to the icon repo casing', () => {
    expect(getTokenIcon('STATOM')).toMatch(/\/stATOM\.svg$/);
    expect(getTokenIcon('STLUNA')).toMatch(/\/stLUNA\.svg$/);
    expect(getTokenIcon('LUNA')).toMatch(/\/LUNA\.svg$/);
    expect(getTokenIcon('ETH')).toMatch(/\/ETH\.svg$/);
  });
});

describe('formatAmount', () => {
  it('keeps small amounts visible and large ones grouped', () => {
    expect(formatAmount(0.00000015384615)).toBe('0.00000015384615');
    expect(formatAmount(1646.134135902004)).toBe('1,646.1341');
  });

  it('shows 0 for empty or invalid amounts', () => {
    expect(formatAmount(0)).toBe('0');
    expect(formatAmount(NaN)).toBe('0');
  });
});

describe('applySwapToBalances', () => {
  it('moves funds from one token to another', () => {
    const next = applySwapToBalances(
      { ETH: 2, USDC: 100 },
      { from: 'ETH', to: 'USDC', amountIn: 0.5, amountOut: 822.97 },
    );
    expect(next).toEqual({ ETH: 1.5, USDC: 922.97 });
  });

  it('creates the target balance if the wallet had none', () => {
    const next = applySwapToBalances(
      { ETH: 1 },
      { from: 'ETH', to: 'ATOM', amountIn: 1, amountOut: 230 },
    );
    expect(next).toEqual({ ETH: 0, ATOM: 230 });
  });

  it('rounds away floating-point noise', () => {
    const next = applySwapToBalances(
      { ETH: 0.3, USDC: 0 },
      { from: 'ETH', to: 'USDC', amountIn: 0.1, amountOut: 0.1 + 0.2 },
    );
    expect(next).toEqual({ ETH: 0.2, USDC: 0.3 });
  });

  it('throws when the balance is too low, without changing anything', () => {
    const balances = { ETH: 1 };
    expect(() =>
      applySwapToBalances(balances, { from: 'ETH', to: 'USDC', amountIn: 2, amountOut: 3000 }),
    ).toThrow('Insufficient ETH balance');
    expect(balances).toEqual({ ETH: 1 });
  });
});
