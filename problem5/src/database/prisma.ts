import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import { env, isDevelopment } from '@/config/env.js';
import { logger } from '@/config/logger.js';
import { PrismaClient } from '@/generated/prisma/client.js';

/**
 * PrismaClient singleton (SQLite via the better-sqlite3 driver adapter).
 * The client is created lazily so importing this module never opens a connection;
 * in dev the instance is cached on globalThis to survive tsx watch reloads.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: isDevelopment ? ['warn', 'error'] : ['error'],
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

/** Convenience proxy so callers can `import { prisma }` and use it directly. */
export const prisma = new Proxy({} as PrismaClient, {
  get: (_target, prop) => {
    const client = getPrisma();
    const value: unknown = Reflect.get(client, prop, client);
    return typeof value === 'function'
      ? (value as (...a: unknown[]) => unknown).bind(client)
      : value;
  },
});

export async function connectPrisma(): Promise<void> {
  const client = getPrisma();
  await client.$connect();
  // Run a query so startup fails fast on a bad DATABASE_URL.
  await client.$queryRaw`SELECT 1`;
  logger.info('SQLite (Prisma) connected');
}

export async function disconnectPrisma(): Promise<void> {
  if (!globalForPrisma.prisma) return;
  await globalForPrisma.prisma.$disconnect();
  globalForPrisma.prisma = undefined;
  logger.info('SQLite (Prisma) disconnected');
}

/** Lightweight connectivity check used by the readiness probe. */
export async function pingPrisma(): Promise<boolean> {
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
