/**
 * Base application error. `message` is the human-readable error message
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;
  public readonly params?: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      code?: string;
      details?: unknown;
      params?: Record<string, unknown>;
      isOperational?: boolean;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = new.target.name;
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.details = options.details;
    this.params = options.params;
    this.isOperational = options.isOperational ?? true;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** HTTP error with convenient static factories. */
export class HttpError extends AppError {
  constructor(
    statusCode: number,
    message: string,
    code: string,
    extra: { details?: unknown; params?: Record<string, unknown> } = {},
  ) {
    super(message, { statusCode, code, ...extra });
  }

  static badRequest(message = 'Bad request', details?: unknown) {
    return new HttpError(400, message, 'BAD_REQUEST', { details });
  }

  static validation(details: unknown, message = 'Validation failed') {
    return new HttpError(422, message, 'VALIDATION_ERROR', { details });
  }

  static unauthorized(message = 'Unauthorized') {
    return new HttpError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden') {
    return new HttpError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Not found', params?: Record<string, unknown>) {
    return new HttpError(404, message, 'NOT_FOUND', { params });
  }

  static conflict(message = 'Conflict') {
    return new HttpError(409, message, 'CONFLICT');
  }

  static tooManyRequests(message = 'Too many requests') {
    return new HttpError(429, message, 'TOO_MANY_REQUESTS');
  }

  static internal(message = 'Internal server error') {
    return new HttpError(500, message, 'INTERNAL_ERROR');
  }
}
