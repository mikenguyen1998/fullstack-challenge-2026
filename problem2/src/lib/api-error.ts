import { isAxiosError } from 'axios';

import type { ApiErrorBody } from '@/types/api';

/** Normalized error type thrown by every API call. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string[]>;
  readonly isNetworkError: boolean;

  constructor(options: {
    message: string;
    status?: number;
    code?: string;
    details?: Record<string, string[]>;
    isNetworkError?: boolean;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = 'ApiError';
    this.status = options.status ?? 0;
    this.code = options.code ?? 'UNKNOWN_ERROR';
    this.details = options.details;
    this.isNetworkError = options.isNetworkError ?? false;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Convert anything (AxiosError, Error, unknown) into an ApiError. */
export function normalizeError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return new ApiError({
        message: error.code === 'ECONNABORTED' ? 'Request timed out' : 'Network error',
        code: error.code ?? 'NETWORK_ERROR',
        isNetworkError: true,
        cause: error,
      });
    }
    const { status, data } = error.response;
    return new ApiError({
      message: data?.message ?? error.message,
      status,
      code: data?.code ?? `HTTP_${status}`,
      details: data?.errors,
      cause: error,
    });
  }

  if (error instanceof Error) return new ApiError({ message: error.message, cause: error });
  return new ApiError({ message: 'Unknown error', cause: error });
}
