import { rateLimit, type Options } from 'express-rate-limit';

import { env } from '@/config/env.js';
import { HttpError } from '@/utils/errors.js';

/**
 * In-memory store by default. For multiple instances use a shared store,
 * e.g. `rate-limit-redis` with the ioredis client in src/database/redis.example.ts.
 */
export const createRateLimiter = (overrides: Partial<Options> = {}) =>
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(HttpError.tooManyRequests()),
    ...overrides,
  });

/** Global API limiter. */
export const apiRateLimiter = createRateLimiter();
