# Full-stack Code Challenge

I applied for a full-stack role, so this repo has both tracks: Problems 1–3 (frontend) and 4–6 (backend).

| Problem                    | Folder                   | What's inside                                                                                                                                                                                           |
| -------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Three ways to sum to n  | [`problem1`](./problem1) | Formula, loop and divide-and-conquer recursion, with tests.                                                                                                                                             |
| 2. Fancy Form              | [`problem2`](./problem2) | React + Vite currency swap form with live prices, a mock wallet and swap backend, validation and tests.                                                                                                 |
| 3. Messy React             | [`problem3`](./problem3) | 21 issues found in the snippet, a refactor that passes `tsc --strict`, and tests.                                                                                                                       |
| 4. Three ways to sum to n  | [`problem4`](./problem4) | Same task as Problem 1, so it points to that solution.                                                                                                                                                  |
| 5. CRUD server             | [`problem5`](./problem5) | Express 5 + Prisma 7 (SQLite) CRUD API with Zod validation, consistent errors, pagination, case/accent-insensitive search, OpenAPI docs generated from the Zod schemas (`/docs`) and integration tests. |
| 6. Scoreboard architecture | [`problem6`](./problem6) | API module spec: signed action tokens against cheating, Redis sorted set + PostgreSQL, live updates over SSE, sequence diagram.                                                                         |

Each folder has its own README with how to run it and the decisions I made.

## AI usage

I used Claude Code while working on this challenge, mainly as a reviewer. It reviewed each solution, pointed out bugs and missing edge cases, and I fixed them. It also wrote some parts directly, listed below. I've reviewed all of it and can walk through any line.

- **Problems 1 and 4:** code review; tidied up my README.
- **Problem 2:** removed the parts of my boilerplate the form doesn't need; set up shadcn; moved the price logic into `lib/swap.ts` with a TanStack Query hook, and wrote `lib/swap.test.ts`; provided the mock wallet and swap service design, which I applied.
- **Problem 3:** set up the project (Vitest, type declarations for the snippet, test mocks); restructured my README; wrote the test suite.
- **Problem 5:** set up the project and upgraded it to Prisma 7; brought in the infrastructure from my `express-base` boilerplate (config, logging, security, validation, error handling, graceful shutdown); restructured the code into a `resource` module; wrote the integration tests; provided the OpenAPI setup (spec generated from the Zod schemas, Swagger UI), which I applied.
- **Problem 6:** outline of the README, a guide for the anti-cheat, storage and real-time sections that I wrote up, and the sequence diagram.
