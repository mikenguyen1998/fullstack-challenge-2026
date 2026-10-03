# Problem 5: CRUD server

A CRUD API for a `Resource`, built with Express 5, Prisma 7 and TypeScript, with validation, pagination and case/accent-insensitive search. SQLite keeps it runnable with no setup.

The infrastructure (config, logging, security middleware, validation, error handling, graceful shutdown, tests) comes from my own boilerplate, [`express-base`](https://github.com/mikenguyen1998/fullstack-boilerplates-NODEJS/tree/main/express-base), trimmed to what this API needs. I dropped auth/JWT, i18n and the PostgreSQL/Redis/Mongo adapters.

## TL;DR

- **Run it:** `cp .env.example .env && npm install && npm run db:migrate && npm run db:seed && npm run dev`, then open http://localhost:3000/docs. Or just `docker compose up --build`.
- **The CRUD code is in [`src/modules/resource/`](./src/modules/resource)** (routes → controller → service, Zod schemas). Everything else is infrastructure from my boilerplate.
- **Beyond the brief:** validation (422), consistent error format, case/accent-insensitive search, pagination, OpenAPI docs, integration tests, Docker.

## Prerequisites

- Node.js 22.12+ and npm (or Docker)

## Setup

```bash
cp .env.example .env   # DATABASE_URL="file:./prisma/dev.db"
npm install            # also runs `prisma generate` (client goes to src/generated/prisma)
npm run db:migrate     # creates prisma/dev.db and applies migrations
npm run db:seed        # optional: 15 sample resources
```

## Running

```bash
npm run dev                  # development, reloads on change
npm run build && npm start   # production build
npm test                     # Vitest + Supertest against prisma/test.db
```

The server listens on `http://localhost:3000`, and the API is mounted under `/api/v1`.

**API docs:** Swagger UI at `http://localhost:3000/docs`, raw spec at `/openapi.json` (set `DOCS_ENABLED=false` to turn them off). Settings are read from `.env` and validated with Zod at startup (see `.env.example`).

| Script                                         |                                 |
| ---------------------------------------------- | ------------------------------- |
| `npm run dev`                                  | Dev server with reload          |
| `npm run build` / `npm start`                  | Compile to `dist/` and run it   |
| `npm test`                                     | Integration tests               |
| `npm run typecheck` / `lint` / `format`        | TypeScript, ESLint, Prettier    |
| `npm run db:migrate` / `db:deploy` / `db:seed` | Prisma migrations and seed data |

## API

Base URL: `http://localhost:3000/api/v1`

| Method   | Path                        | Description                               |
| -------- | --------------------------- | ----------------------------------------- |
| `POST`   | `/resources`                | Create a resource                         |
| `GET`    | `/resources`                | List resources (pagination, sort, search) |
| `GET`    | `/resources/:id`            | Get one resource                          |
| `PUT`    | `/resources/:id`            | Update a resource                         |
| `DELETE` | `/resources/:id`            | Delete a resource                         |
| `GET`    | `/health/ready`             | Readiness (checks the database)           |
| `GET`    | `/health` (no prefix)       | Liveness                                  |
| `GET`    | `/docs` (no prefix)         | Swagger UI                                |
| `GET`    | `/openapi.json` (no prefix) | OpenAPI 3.1 spec                          |

### Create / update body

```json
{ "name": "Example File", "description": "Sample description" }
```

- `name`: required, 1–255 characters, trimmed.
- `description`: optional, up to 1000 characters. On `PUT`, it's left unchanged when omitted.

### List query

`GET /resources?page=1&limit=20&name=example&sortBy=createdAt&sortOrder=desc`

| Param       | Default     | Notes                                                                                           |
| ----------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `page`      | `1`         | integer ≥ 1                                                                                     |
| `limit`     | `20`        | 1–100                                                                                           |
| `name`      |             | matches names that contain the text, ignoring case and accents (`bao cao` finds `Báo cáo.docx`) |
| `sortBy`    | `createdAt` | `createdAt`, `updatedAt`, `name` or `id`                                                        |
| `sortOrder` | `desc`      | `asc` or `desc`                                                                                 |

### Responses

Success:

```json
{
  "success": true,
  "message": "OK",
  "data": [
    { "id": 1, "name": "Example File", "description": null, "createdAt": "…", "updatedAt": "…" }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

Error (every error uses the same shape):

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "location": "body", "path": "name", "message": "…" }]
  },
  "requestId": "6f1c…"
}
```

| Status | Code                | When                                                      |
| ------ | ------------------- | --------------------------------------------------------- |
| 400    | `BAD_REQUEST`       | Malformed JSON body                                       |
| 404    | `NOT_FOUND`         | Unknown resource id or route                              |
| 422    | `VALIDATION_ERROR`  | Invalid params, query or body                             |
| 429    | `TOO_MANY_REQUESTS` | Rate limit exceeded                                       |
| 500    | `INTERNAL_ERROR`    | Anything unexpected (stack trace only outside production) |

Every response carries an `X-Request-Id` header, which also appears in the logs.

## API docs (OpenAPI)

The OpenAPI 3.1 spec is generated with [`zod-to-openapi`](https://github.com/asteasolutions/zod-to-openapi) from the **same Zod schemas** the `validate` middleware uses (`src/modules/resource/resource.schema.ts`). Docs and validation can't drift apart: change a rule, and both the 422 response and the docs follow. The response and error envelopes are documented as well, so "Try it out" in Swagger UI shows exactly what the API returns.

## Data model

| Field         | Type     | Notes                                                                                           |
| ------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `id`          | Int      | auto-increment primary key                                                                      |
| `name`        | String   | required                                                                                        |
| `searchName`  | String   | `name` lower-cased with accents removed, indexed; used for search and never returned by the API |
| `description` | String?  | optional                                                                                        |
| `createdAt`   | DateTime | set on create                                                                                   |
| `updatedAt`   | DateTime | set on every update                                                                             |

## Project structure

```
src/
├── app.ts / server.ts      # Express app; startup and graceful shutdown
├── routes.ts               # mounts modules under /api/v1
├── config/                 # env (Zod-validated), pino logger
├── database/               # Prisma client (SQLite adapter)
├── docs/                   # OpenAPI spec (from Zod) and Swagger UI
├── middlewares/            # request id, logging, helmet/cors/compression, rate limit, validate, 404, errors
├── modules/
│   ├── health/
│   └── resource/           # routes → controller → service, Zod schemas
└── utils/                  # errors, responses, pagination, search normalization
tests/                      # Vitest + Supertest (API, docs, health), separate prisma/test.db
```

## Docker

```bash
docker compose up --build   # API on http://localhost:3000, docs at /docs
```

Migrations run on startup, and the SQLite file lives in the `sqlite-data` volume, so data survives restarts. The container starts with an empty database (no seed data).
