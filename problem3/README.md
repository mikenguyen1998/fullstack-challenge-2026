# Problem 3: Messy React

Original: [`src/original/WalletPage.tsx`](./src/original/WalletPage.tsx) · Refactor: [`src/WalletPage.tsx`](./src/WalletPage.tsx) · Tests: [`src/WalletPage.test.tsx`](./src/WalletPage.test.tsx)

```bash
npm install
npm run typecheck   # the refactor passes tsc --strict
npm test
```

`src/externals.d.ts` declares what the snippet uses but doesn't define (`BoxProps`, `useWalletBalances`, `usePrices`, `WalletRow`, `classes`), so the code can be type-checked. Tests replace them with mocks.

## Summary

I found 21 issues: 8 bugs, 4 inefficiencies and 9 anti-patterns. The most serious bugs mean the original code can't run as written: it reads a `blockchain` field the type doesn't have, uses an undefined variable (`lhsPriority`), and its filter is inverted, so it would show only empty balances. The refactor fixes all 21, passes `tsc --strict`, and is covered by 11 tests.

## Issues

### Bugs

| # | Where | Problem | Impact | Fix |
|---|---|---|---|---|
| 1 | `getPriority(balance.blockchain)` | `WalletBalance` has no `blockchain` field. | Doesn't compile in TypeScript. | Add `blockchain: string` to the interface. |
| 2 | `if (lhsPriority > -99)` | `lhsPriority` is never defined; the variable computed just above is `balancePriority`. | `ReferenceError` at runtime. | Use `balancePriority`. |
| 3 | `if (balance.amount <= 0) return true` | The filter condition is inverted. | The list shows only empty (zero or negative) balances. | Keep only `balance.amount > 0`. |
| 4 | `.sort((lhs, rhs) => …)` | The comparator returns nothing when both priorities are equal. | Returning `undefined` makes the sort order unreliable. | Return a number in every case, e.g. `rightPriority - leftPriority`. |
| 5 | `prices[balance.currency] * balance.amount` | A currency with no price gives `undefined * amount`. | `usdValue` becomes `NaN`. | Fall back to 0: `(prices[balance.currency] ?? 0) * balance.amount`. |
| 6 | `className={classes.row}` | `classes` is never defined or imported in the component. | `ReferenceError` at runtime. | Import the styles (CSS module / `useStyles`) the row class comes from. |
| 7 | `sortedBalances.map((balance: FormattedWalletBalance) …)` | The rows are built from `sortedBalances`, which has no `formatted` field, so `balance.formatted` is `undefined`. | The formatted amount is blank in every row. | Format the amount while building each row: `formatAmount(balance.amount)`. |
| 8 | `formatted: balance.amount.toFixed()` | `toFixed()` without an argument rounds to 0 decimal places. | Fractional balances display wrong: `0.5` shows as `"1"`, `1.4` as `"1"`. | Format with the shared `formatAmount` helper (2–8 decimals). |

### Inefficiencies

| # | Where | Problem | Fix |
|---|---|---|---|
| 9 | `useMemo(…, [balances, prices])` | `prices` is a dependency but isn't used inside. Every price update re-filters and re-sorts the list for nothing. | Remove `prices` from the dependency array. |
| 10 | `formattedBalances` | This array is computed on every render but never used for rendering: the rows are built from `sortedBalances`. It's also a second pass over the list. | Drop it and format inside the single `map` that builds the rows. |
| 11 | `getPriority(…)` inside `.sort` | The comparator calls `getPriority` twice per comparison, so O(n log n) times in total. | Compute the priority once per balance before sorting. |
| 12 | `const getPriority = …` inside the component | It's recreated on every render, and it's used inside `useMemo` without being in the dependency list. | Move it out of the component (`src/helpers`), so it's created once and is never a dependency. |

### Anti-patterns

| # | Where | Problem | Fix |
|---|---|---|---|
| 13 | `getPriority(blockchain: any)` | `any` turns off type checking for the argument. | Use `string`, or a union of the known chain names. |
| 14 | `switch (blockchain) { … }` | A long `switch` that only maps names to numbers is verbose and harder to maintain. | Use a lookup table (`Record<string, number>`) with a default of `UNSUPPORTED_PRIORITY`. |
| 15 | `key={index}` | The index isn't a stable key; when the list is re-sorted or filtered, React can reuse the wrong row. | Use a key from the data: ``key={`${blockchain}-${currency}`}``. |
| 16 | `const { children, ...rest } = props` | `children` is destructured but never used. | Don't destructure it; spread `props` directly. |
| 17 | `interface Props extends BoxProps {}` with `React.FC<Props> = (props: Props)` | An empty interface that adds nothing, and the props type is written twice. | Drop the empty interface and use a plain function component with a `Props` type (see #21 for what `Props` is). |
| 18 | `interface FormattedWalletBalance` | It repeats `currency` and `amount` from `WalletBalance`, and only exists to carry a formatted string. | Remove it and format the amount directly when building each row. |
| 19 | `if (…) { if (…) { return true; } } return false;` | Nested `if`s that return `true`/`false` are a long way to write a boolean. | Return the condition itself: `priority > UNSUPPORTED_PRIORITY && balance.amount > 0`. |
| 20 | `-99` | A magic number repeated in `getPriority` and the filter, with no name explaining what it means. | Name it once: `UNSUPPORTED_PRIORITY`. |
| 21 | `interface Props extends BoxProps` rendered as `<div {...rest}>` | The props come from `Box`, but the component renders a plain `<div>`. Any `Box`-only prop (e.g. MUI's `sx`) would land on a DOM element and trigger React warnings. | The real `BoxProps` isn't part of the brief, so I limit the props to `HTMLAttributes<HTMLDivElement>`, which is exactly what a `<div>` accepts. |

## Refactor: key decisions

- Priorities come from a lookup table, with `UNSUPPORTED_PRIORITY` (`-99`) for unknown chains, instead of a `switch`. `getPriority` uses `Object.hasOwn`, so names like `"toString"` don't match `Object.prototype` members.
- `getPriority` and `formatAmount` live in `src/helpers`, outside the component, so they're created once and never need to be dependencies.
- Each balance's priority is computed once, then a single boolean filter (`priority > UNSUPPORTED_PRIORITY && amount > 0`) and a sort by `rightPriority - leftPriority`.
- `prices` is not a dependency of the filter/sort `useMemo`; USD values are computed when building the rows.
- A missing price counts as 0 USD, so the page never renders `NaN`.
- Amounts are formatted with a shared `Intl.NumberFormat('en-US')` (2–8 decimals), so the output doesn't depend on the browser's language.
- Rows use a stable key built from `blockchain` and `currency`.

## Assumptions

- The real `BoxProps` isn't shown in the brief, so I don't know which non-DOM props it has. The refactor accepts `HTMLAttributes<HTMLDivElement>` instead, since it renders a `<div>`.
- `useWalletBalances` returns a `blockchain` for each balance, since the original code reads it.
- Balances on unsupported chains, and balances of 0 or less, are hidden. That's what the original filter seems meant to do.
- A token with no price is worth $0, so the page shows `0` instead of `NaN`.
- Amounts are shown with 2 to 8 decimals, in `en-US` format.
