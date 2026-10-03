FROM node:24-alpine AS build

WORKDIR /app
# prisma.config.ts requires DATABASE_URL; `prisma generate` only needs it to exist (no connection is made).
ENV DATABASE_URL=file:/data/dev.db
# For Alpine-based images:
RUN apk add --no-cache openssl
# better-sqlite3 may need to compile on Alpine (musl)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json prisma.config.ts ./

COPY prisma ./prisma

# Skip install scripts here (the root `postinstall` runs `prisma generate` before the source is copied);
# the build script runs `prisma generate` later. Then compile the native SQLite driver explicitly.
RUN npm ci --ignore-scripts && npm rebuild better-sqlite3

COPY . .

RUN npm run build

FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production PORT=3000 DATABASE_URL=file:/data/dev.db

# Keep node_modules from the build stage: it has the compiled better-sqlite3 and the prisma CLI for migrations.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json prisma.config.ts ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]