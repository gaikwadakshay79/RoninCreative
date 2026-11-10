import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { apiBaseUrl } from './config';

/** One error shape for every failed request, whatever went wrong underneath. */
export class ApiError extends Error {
  readonly status: number | undefined;
  readonly code: string | undefined;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

interface ErrorBody {
  message?: string;
  error?: string;
}

function toApiError(error: AxiosError<ErrorBody>): ApiError {
  if (error.response) {
    const { status, data } = error.response;
    const detail = data?.message ?? data?.error;
    return new ApiError(detail ?? `The server answered with status ${status}.`, status, error.code);
  }
  if (error.code === 'ECONNABORTED') {
    return new ApiError('The request took too long. Check the connection and try again.', undefined, error.code);
  }
  return new ApiError('The server could not be reached. Check the connection and try again.', undefined, error.code);
}

/**
 * The one Axios instance of the site. Service modules import it lazily, so the
 * library is only downloaded when a remote API or contact endpoint is in use.
 */
export const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl || undefined,
  timeout: 12_000,
  headers: { Accept: 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorBody>) => Promise.reject(toApiError(error)),
);
