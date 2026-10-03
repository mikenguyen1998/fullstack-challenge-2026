import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async route handler and forwards rejections to `next()`.
 * Express 5 already forwards rejected promises, but this wrapper keeps
 * intent explicit and makes handlers portable.
 */
export const asyncHandler =
  <Req extends Request = Request, Res extends Response = Response>(
    fn: (req: Req, res: Res, next: NextFunction) => Promise<unknown>,
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as Req, res as Res, next)).catch(next);
  };
