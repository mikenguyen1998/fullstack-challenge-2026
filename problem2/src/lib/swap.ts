import type { TokenData, TokenPrice } from '@/types';

const ICON_BASE = 'https://raw.githubusercontent.com/Switcheo/token-icons/refs/heads/main/tokens';

// The feed upper-cases some liquid-staking symbols; the icon repo is case-sensitive.
const ICON_OVERRIDES: Record<string, string> = {
  STATOM: 'stATOM',
  RATOM: 'rATOM',
  STEVMOS: 'stEVMOS',
  STOSMO: 'stOSMO',
  STLUNA: 'stLUNA',
};

export const getTokenIcon = (currency: string) =>
  `${ICON_BASE}/${ICON_OVERRIDES[currency] ?? currency}.svg`;

/**
 * Turns the raw feed into one entry per currency.
 * - Drops entries without a currency or a positive price.
 * - Duplicates (e.g. USDC ×4): the most recent `date` wins; on a tie, the later entry wins.
 */
export function toTokenMap(prices: TokenPrice[]): Record<string, TokenData> {
  const latest = new Map<string, TokenPrice>();
  for (const entry of prices) {
    if (!entry.currency || !(entry.price > 0)) continue;
    const current = latest.get(entry.currency);
    if (!current || Date.parse(entry.date) >= Date.parse(current.date)) {
      latest.set(entry.currency, entry);
    }
  }
  return Object.fromEntries(
    [...latest].map(([currency, { price }]) => [currency, { price, icon: getTokenIcon(currency) }]),
  );
}

/** How many `to` tokens one `from` token buys, from their USD prices. 0 if a price is missing. */
export const getExchangeRate = (fromPriceUsd: number, toPriceUsd: number) =>
  fromPriceUsd > 0 && toPriceUsd > 0 ? fromPriceUsd / toPriceUsd : 0;

export const computeOutputAmount = (inputAmount: number, exchangeRate: number) =>
  Number.isFinite(inputAmount) && inputAmount > 0 ? inputAmount * exchangeRate : 0;

const amountFormatter = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 });

/** Fixed `en-US` format with 8 significant digits, so tiny amounts don't round to 0. */
export const formatAmount = (amount: number) =>
  Number.isFinite(amount) && amount > 0 ? amountFormatter.format(amount) : '0';

// ---------- Wallet (mock balances) ----------
export type Balances = Record<string, number>;

/** Starting balances for the demo wallet. */
export const INITIAL_BALANCES: Balances = { ETH: 2.5, USDC: 1000, WBTC: 0.05, ATOM: 40 };

/** Keeps balances at 8 decimals so float noise (1.4817000000000002) never shows up. */
const round8 = (n: number) => Math.round(n * 1e8) / 1e8;

/** Get balance for a specific token */
export const getBalance = (balances: Balances, currency: string) => balances[currency] ?? 0;

export const applySwapToBalances = (
  balances: Balances,
  {
    from,
    to,
    amountIn,
    amountOut,
  }: { from: string; to: string; amountIn: number; amountOut: number },
): Balances => {
  const fromBalance = getBalance(balances, from);
  if (amountIn > fromBalance) throw new Error(`Insufficient ${from} balance`);
  return {
    ...balances,
    [from]: round8(fromBalance - amountIn),
    [to]: round8(getBalance(balances, to) + amountOut),
  };
};
