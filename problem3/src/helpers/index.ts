type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

const blockchainPriority: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const UNSUPPORTED_PRIORITY = -99;
/** Priority used to sort balances. Unknown chains get UNSUPPORTED_PRIORITY and are filtered out. */
const getPriority = (blockchain: string): number =>
  // hasOwn, so inherited keys like "toString" don't resolve to Object.prototype members
  Object.hasOwn(blockchainPriority, blockchain)
    ? blockchainPriority[blockchain as Blockchain]
    : UNSUPPORTED_PRIORITY;

// Fixed locale so the output doesn't depend on the browser language; created once and reused.
const amountFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 8,
});

const formatAmount = (n: number) => amountFormatter.format(n);

export { UNSUPPORTED_PRIORITY, getPriority, formatAmount };
