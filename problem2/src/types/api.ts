/** Shape of error bodies returned by an API (adjust to the API you call). */
export interface ApiErrorBody {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}
