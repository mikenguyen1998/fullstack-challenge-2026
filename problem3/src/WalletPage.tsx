import { type HTMLAttributes, useMemo } from 'react';

import { UNSUPPORTED_PRIORITY, formatAmount, getPriority } from './helpers';

// Stand-in for the real styles hook (CSS module / JSS) the row class comes from.
const useStyles = () => ({
  row: 'row',
});

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

// The real `BoxProps` isn't part of the brief, so the props are limited to what a <div> accepts.
type Props = HTMLAttributes<HTMLDivElement>;

const WalletPage = (props: Props) => {
  const classes = useStyles();
  const balances: WalletBalance[] = useWalletBalances();
  const prices = usePrices();

  // Depends only on balances, so a price update doesn't re-filter or re-sort.
  // Each priority is computed once per balance, not O(n log n) times inside the comparator.
  const sortedBalances = useMemo(
    () =>
      balances
        .map((balance) => ({ balance, priority: getPriority(balance.blockchain) }))
        .filter(({ balance, priority }) => priority > UNSUPPORTED_PRIORITY && balance.amount > 0)
        .sort((lhs, rhs) => rhs.priority - lhs.priority)
        .map(({ balance }) => balance),
    [balances],
  );

  const rows = sortedBalances.map((balance) => {
    const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={`${balance.blockchain}-${balance.currency}`}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={formatAmount(balance.amount)}
      />
    );
  });

  return <div {...props}>{rows}</div>;
};

export default WalletPage;
