import axios from 'axios';

import { normalizeError } from './api-error';

/** Shared HTTP client. Every error is normalized into an `ApiError`. */
export const api = axios.create({
  timeout: 15_000,
  headers: { Accept: 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeError(error)),
);
