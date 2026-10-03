# Full-stack Code Challenge

I applied for a full-stack role, so this repo has both tracks: Problems 1–3 (frontend) and 4–6 (backend).

| Problem                    | Folder                                                                               | What's inside                                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Three ways to sum to n  | [`problem1`](./problem1)                                                             | Formula, loop and divide-and-conquer recursion, with tests.                                                                                                                                             |
| 2. Fancy Form              | [`problem2`](./problem2) · [live demo](https://fullstack-challenge-2026.vercel.app/) | React + Vite currency swap form with live prices, a mock wallet and swap backend, validation, unit and UI tests.                                                                                        |
| 3. Messy React             | [`problem3`](./problem3)                                                             | 21 issues found in the snippet, a refactor that passes `tsc --strict`, and tests.                                                                                                                       |
| 4. Three ways to sum to n  | [`problem4`](./problem4)                                                             | Same task as Problem 1, so it points to that solution.                                                                                                                                                  |
| 5. CRUD server             | [`problem5`](./problem5)                                                             | Express 5 + Prisma 7 (SQLite) CRUD API with Zod validation, consistent errors, pagination, case/accent-insensitive search, OpenAPI docs generated from the Zod schemas (`/docs`) and integration tests. |
| 6. Scoreboard architecture | [`problem6`](./problem6)                                                             | API module spec: signed action tokens against cheating, Redis sorted set + PostgreSQL, live updates over SSE, sequence diagram.                                                                         |

Each folder has its own README with how to run it and the decisions I made.

## Background: a 2025 attempt, revisited in 2026

I first did this challenge on my own in February 2025 ([previous attempt](https://github.com/MikeNguyen98/MIkeNguyen)). For this application I went back to that solution, reviewed it critically, fixed what was wrong and extended it, with Claude Code as a pair programmer and reviewer.

**What changed since 2025**

- **Problems 1 and 4:** the recursive version overflowed the stack and mishandled negative `n`. I replaced it with divide-and-conquer recursion and added real tests.
- **Problem 2:** the exchange rate was inverted, and the form could be submitted with errors. I rebuilt it on my `react-vite-base` boilerplate with shadcn, TanStack Query, a mock wallet and swap service, and unit + UI tests, and deployed it.
- **Problem 3:** my old refactor replaced `blockchain` with `currency`, which filtered out every balance. I redid the analysis (21 issues), wrote a refactor that passes `tsc --strict`, and added tests.
- **Problem 5:** there was no input validation, and every error came back as a 500 (even a missing id, which should be a 404). I rebuilt it on my `express-base` boilerplate with Zod validation, consistent errors, OpenAPI docs, tests and Docker.
- **Problem 6:** the old spec took `userId` from the request body and had no replay protection. I rewrote it around signed action tokens, a Redis sorted set with PostgreSQL as the source of truth, and live updates over SSE.

**My decisions:** the approach for each problem; building on my own boilerplates; a `searchName` column for accent-insensitive search (I rejected a unique `slug`, since names can repeat); the `1, 2, 2, 4` tie ranking ordered by a database sequence; and reverting a leaderboard change I didn't agree with.

**How I used AI:** Claude Code reviewed every solution and pointed out bugs and missing edge cases, and it wrote parts of the code, tests and docs (listed below). I've reviewed all of it and can walk through any line.

**How I verified it:** every problem has tests that I ran; I broke the code on purpose to check that the tests catch it; Problem 5 runs in Docker; the Problem 6 diagram was rendered.

<details>
<summary>Parts written by AI</summary>

- **Problems 1 and 4:** code review; tidied up my README.
- **Problem 2:** removed the parts of my boilerplate the form doesn't need; set up shadcn; moved the price logic into `lib/swap.ts` with a TanStack Query hook, and wrote `lib/swap.test.ts` and the UI tests (`HomePage.test.tsx`); provided the mock wallet and swap service design, which I applied.
- **Problem 3:** set up the project (Vitest, type declarations for the snippet, test mocks); restructured my README; wrote the test suite.
- **Problem 5:** set up the project and upgraded it to Prisma 7; brought in the infrastructure from my `express-base` boilerplate (config, logging, security, validation, error handling, graceful shutdown); restructured the code into a `resource` module; wrote the integration tests; provided the OpenAPI setup (spec generated from the Zod schemas, Swagger UI), which I applied.
- **Problem 6:** outline of the README, a guide for the anti-cheat, storage and real-time sections that I wrote up, and the sequence diagram.

</details>
