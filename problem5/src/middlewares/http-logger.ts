import type { IncomingMessage } from 'node:http';

import { pinoHttp } from 'pino-http';

import { isTest } from '@/config/env.js';
import { logger } from '@/config/logger.js';

export const httpLogger = pinoHttp({
  logger,
  enabled: !isTest,
  // Reuse the id assigned by the request-id middleware.
  genReqId: (req: IncomingMessage & { id?: unknown }) => String(req.id ?? ''),
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url?.startsWith('/docs') === true,
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage: (req, res, responseTime) =>
    `${req.method} ${req.url} ${res.statusCode} - ${Math.round(responseTime)}ms`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
  serializers: {
    req: (req: { id: unknown; method: string; url: string }) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
  },
});
