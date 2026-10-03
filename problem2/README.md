# Problem 2: Fancy Form

A currency swap form: pick two tokens, enter an amount, and see the converted amount from live USD prices.

**Live demo:** https://fullstack-challenge-2026.vercel.app/ (add `?fail` to the URL to see a failed swap)

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              |                                 |
| ------------------- | ------------------------------- |
| `npm run dev`       | Dev server                      |
| `npm run build`     | Type-check and build to `dist/` |
| `npm run lint`      | ESLint                          |
| `npm run test`      | Vitest                          |
| `npm run typecheck` | TypeScript only                 |

## Assumptions

- Prices come from the public feed. For duplicated currencies, the most recent `date` wins; tokens without a positive price are hidden.
- **The swap is simulated:** `swapService.executeSwap` waits 1.5 s and returns a receipt. Add `?fail` to the URL to see the error path. It sits behind an interface, so a real backend only needs a new implementation of that one function.
- **The wallet is a mock:** it starts with 2.5 ETH, 1000 USDC, 0.05 WBTC and 40 ATOM, and balances persist in `localStorage`. You can't send more than you hold.
- Amounts are shown in `en-US` format with up to 8 significant digits.

## Codebase

I started from my own boilerplate, [`react-vite-base`](https://github.com/mikenguyen1998/fullstack-boilerplates-NODEJS/tree/main/react-vite-base) (React 19, Vite, TypeScript, Tailwind CSS v4, TanStack Query, Zustand, React Hook Form), and removed everything this form doesn't need:

- **Removed:** auth and the refresh-token flow, routing, i18n, the example pages and services, Docker/Nginx.
- **Kept:** the Vite/TypeScript/ESLint/Prettier setup, TanStack Query, the error boundary, theme (light/dark/system) and the Vitest setup.
- **Added:** shadcn/ui components (Popover, Command, Sonner) for the token picker and toasts.

```
src/
├── lib/swap.ts               # pure logic: price dedup, exchange rate, output amount, formatting, wallet balances
├── lib/swap.test.ts          # unit tests for the pure logic
├── pages/HomePage.test.tsx   # UI tests: conversion, Max, balance check, loading, success, failure
├── services/token.service.ts # fetches the price feed
├── services/swap.service.ts  # mock swap backend (1.5 s delay, `?fail` to simulate an error)
├── stores/wallet.store.ts    # mock wallet balances (Zustand, persisted)
├── hooks/queries/useTokens.ts# TanStack Query hook, refreshes prices every 30s
├── components/common/TokenSelect.tsx
├── components/ui/            # shadcn components
└── pages/HomePage.tsx        # the swap form
```

## AI usage

See the [AI usage](../README.md#ai-usage) section in the root README.
