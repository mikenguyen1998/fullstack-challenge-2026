import type { Server } from 'node:http';

import { createApp } from '@/app.js';
import { env } from '@/config/env.js';
import { logger } from '@/config/logger.js';
import { connectPrisma, disconnectPrisma } from '@/database/index.js';

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function bootstrap(): Promise<void> {
  await connectPrisma();

  const app = createApp();
  const server: Server = app.listen(env.PORT, env.HOST, () => {
    logger.info(`Server listening on http://${env.HOST}:${env.PORT} (${env.NODE_ENV})`);
  });

  // Keep-alive slightly above typical LB idle timeout (e.g. AWS ALB = 60s).
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  let shuttingDown = false;

  const shutdown = async (signal: string, exitCode = 0): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`${signal} received, shutting down gracefully...`);

    const forceExit = setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    try {
      // Stop accepting new connections and wait for in-flight requests.
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
        server.closeIdleConnections();
      });
      logger.info('HTTP server closed');

      await disconnectPrisma();
      logger.info('Shutdown complete');
      process.exit(exitCode);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
    void shutdown('unhandledRejection', 1);
  });
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception');
    void shutdown('uncaughtException', 1);
  });
}

bootstrap().catch(async (err: unknown) => {
  logger.fatal({ err }, 'Failed to start server');
  await disconnectPrisma();
  process.exit(1);
});
