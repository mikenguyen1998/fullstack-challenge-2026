import compression from 'compression';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';

import { env } from '@/config/env.js';

/** Security headers. */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'validator.swagger.io'],
      'script-src': ["'self'", "'unsafe-inline'"],
    },
  },
});

const allowAll = env.CORS_ORIGINS.includes('*');

const corsOptions: CorsOptions = {
  origin: allowAll
    ? true
    : (origin, callback) => {
        // Allow same-origin / server-to-server requests (no Origin header).
        if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
  credentials: !allowAll,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id', 'RateLimit', 'RateLimit-Policy', 'Retry-After'],
  maxAge: 86_400,
};

export const corsMiddleware = cors(corsOptions);

export const compressionMiddleware = compression();
