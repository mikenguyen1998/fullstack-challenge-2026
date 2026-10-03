import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { isProduction } from '@/config/env.js';
import { logger } from '@/config/logger.js';
import { AppError, HttpError } from '@/utils/errors.js';
import type { ApiError } from '@/utils/response.js';

/** Map known third-party errors to AppError. */
function normalizeError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof ZodError) {
    return HttpError.validation(
      err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    );
  }

  if (typeof err === 'object' && err !== null) {
    const e = err as { type?: string; status?: number; code?: string; name?: string };

    // body-parser: malformed JSON / payload too large
    if (e.type === 'entity.parse.failed') return HttpError.badRequest('Malformed JSON body');
    if (e.type === 'entity.too.large') {
      return new HttpError(413, 'Payload too large', 'PAYLOAD_TOO_LARGE');
    }

    // Prisma known request errors (duck-typed to avoid importing the generated client)
    if (e.name === 'PrismaClientKnownRequestError') {
      if (e.code === 'P2002') return HttpError.conflict();
      if (e.code === 'P2025') return HttpError.notFound();
    }
  }

  return new AppError('Internal server error', {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    isOperational: false,
    cause: err,
  });
}

// Express identifies error handlers by arity (4 args) — keep `_next`.
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = normalizeError(err);

  if (appError.statusCode >= 500) {
    req.log?.error({ err, requestId: req.id }, appError.message);
    if (!req.log) logger.error({ err, requestId: req.id }, appError.message);
  }

  if (res.headersSent) return;

  const body: ApiError = {
    success: false,
    message: appError.message,
    error: {
      code: appError.code,
      ...(appError.details !== undefined ? { details: appError.details } : {}),
      ...(!isProduction && appError.statusCode >= 500 && err instanceof Error
        ? { stack: err.stack }
        : {}),
    },
    requestId: String(req.id),
  };

  res.status(appError.statusCode).json(body);
};
