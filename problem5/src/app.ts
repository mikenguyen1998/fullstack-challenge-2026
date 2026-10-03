import express, { type Express } from 'express';

import { env } from '@/config/env.js';
import {
  apiRateLimiter,
  compressionMiddleware,
  corsMiddleware,
  errorHandler,
  helmetMiddleware,
  httpLogger,
  notFoundHandler,
  requestId,
} from '@/middlewares/index.js';
import { healthController } from '@/modules/health/health.controller.js';
import { apiRouter } from '@/routes.js';
import { setupSwagger } from '@/docs/swagger.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY ? 1 : false);
  app.set('query parser', 'extended');

  // --- Core middlewares (order matters) ---
  app.use(requestId);
  app.use(httpLogger);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(compressionMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // --- Unversioned liveness probe for load balancers / k8s ---
  app.get('/health', healthController.liveness);

  // --- Versioned API ---
  app.use(env.API_PREFIX, apiRateLimiter, apiRouter);

  // --- Swagger docs ---
  if (env.DOCS_ENABLED) setupSwagger(app);

  // --- 404 + centralized error handling (must be last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
