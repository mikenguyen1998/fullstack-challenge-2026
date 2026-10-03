import type { RequestHandler } from 'express';
import { z, type ZodType } from 'zod';

import { HttpError } from '@/utils/errors.js';

export interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Validates and coerces req.body / req.query / req.params with Zod.
 * Parsed values replace the originals (Express 5's req.query is a getter,
 * so it is redefined on the request object).
 */
export const validate =
  (schemas: ValidationSchemas): RequestHandler =>
  (req, _res, next) => {
    const errors: { location: string; path: string; message: string }[] = [];

    for (const location of ['params', 'query', 'body'] as const) {
      const schema = schemas[location];
      if (!schema) continue;

      const result = schema.safeParse(req[location]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({ location, path: issue.path.join('.'), message: issue.message });
        }
        continue;
      }

      if (location === 'query') {
        Object.defineProperty(req, 'query', {
          value: result.data,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      } else {
        req[location] = result.data as never;
      }
    }

    if (errors.length > 0) return next(HttpError.validation(errors));
    return next();
  };

export { z };
