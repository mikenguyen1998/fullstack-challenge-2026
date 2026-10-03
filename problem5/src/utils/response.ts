import type { Response } from 'express';

import type { PaginationMeta } from './pagination.js';

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  message: string;
  error: { code: string; details?: unknown; stack?: string };
  requestId?: string;
}

/** Send a standard success response. */
export function success<T>(
  res: Response,
  data: T,
  options: { message?: string; statusCode?: number; meta?: Record<string, unknown> } = {},
): Response<ApiSuccess<T>> {
  const body: ApiSuccess<T> = {
    success: true,
    message: options.message ?? 'OK',
    data,
    ...(options.meta ? { meta: options.meta } : {}),
  };
  return res.status(options.statusCode ?? 200).json(body);
}

/** Send a standard paginated response. */
export function paginated<T>(
  res: Response,
  items: T[],
  pagination: PaginationMeta,
  message?: string,
): Response<ApiSuccess<T[]>> {
  return success(res, items, { message, meta: { pagination } });
}
