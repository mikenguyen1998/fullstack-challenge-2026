# Problem 1 + 4: Three ways to sum to n

I applied for a full-stack role, so I did both the frontend and backend tracks. Problems 1 and 4 ask for the same thing, so I solved them once, in TypeScript.

`sum_to_n(n)` returns `1 + 2 + ... + n`, e.g. `sum_to_n(5) === 15`.

Code: [`index.ts`](./index.ts) · Tests: [`index.test.ts`](./index.test.ts)

```bash
npx tsx --test index.test.ts
```

## How I read the brief

The brief says `n` is any integer and the result is always below `Number.MAX_SAFE_INTEGER`. I made these decisions from that:

- The largest valid `n` is `134,217,727`. Its sum, `9,007,199,187,632,128`, is the last one under `MAX_SAFE_INTEGER`. I test this value directly.
- `sum_to_n(0)` is `0`, an empty sum.
- For a negative `n` I sum towards `-1`, so `sum_to_n(-5) === -15`. All three functions compute the sum for `|n|` and then put the sign back.
- If the input isn't an integer (`1.5`, `NaN`, `Infinity`, a string…), I throw a `TypeError`.

## `sum_to_n_a`: recursion

- **Time:** O(n)
- **Space:** O(log n) call stack

My first attempt was the textbook `n + sum(n - 1)`. When I tested it, it threw `Maximum call stack size exceeded` at around `n = 10,000`, which is far below the valid range. JavaScript/TypeScript doesn't do tail-call optimisation, so making it tail-recursive wouldn't help either.

I switched to divide and conquer. I split `1..m` into two halves and sum each half recursively. The second half `d+1..m` is the same as `1..(d+r)` with `d` added to every term:

```text
S(m) = S(d) + S(d + r) + d * (d + r)     where d = floor(m / 2), r = m % 2
```

Each level halves the range, so the depth is at most about 27 even for the largest `n`. The catch is speed: it still makes about 2n function calls, which makes it the slowest of the three (around 3.6s at the max `n` on my machine). I kept it to show a recursive solution that is actually safe, not because I'd use it.

## `sum_to_n_b`: loop

- **Time:** O(n)
- **Space:** O(1)

A plain loop from `1` to `|n|`, then I apply the sign. It's the most straightforward of the three and has no recursion or stack concerns. It is linear, though: under a second at the max `n`.

## `sum_to_n_c`: formula

- **Time:** O(1)
- **Space:** O(1)

Gauss's formula on `|n|`, then I apply the sign:

```text
sum = |n| * (|n| + 1) / 2
```

The product `|n| * (|n| + 1)` can be about twice the final result, so I checked whether it could lose precision. It can't: the product is always even, and doubles represent every even integer up to 2^54 exactly (the largest product here is just under 2^54). This is the one I would use in real code.

## Tests

I used Node's built-in test runner, so there's nothing to install. Every function runs against the same cases:

- **Happy cases:** `0` and `±1` to `±5`
- **Edge cases:** `±134,217,727`, the largest valid inputs, with exact expected values
- **Invalid inputs:** `NaN`, `±Infinity`, `1.5`, `null`, `undefined` and a string, all expecting a `TypeError`
