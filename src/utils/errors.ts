import { AxiosError } from 'axios';

export interface ApiError extends Error {
  status?: number;
  data?: unknown; // Replace 'any' type with a more specific type
}

export function createApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const apiError: ApiError = new Error(error.response?.data?.message || error.message);
    apiError.status = error.response?.status;
    apiError.data = error.response?.data;
    return apiError;
  }
  return new Error(error instanceof Error ? error.message : 'An unknown error occurred');
}

export function formatApiError(error: ApiError): string {
  if (error.status === 401) {
    return 'Please log in to continue';
  }
  if (error.status === 403) {
    return 'You do not have permission to perform this action';
  }
  if (error.status === 404) {
    return 'The requested resource was not found';
  }
  return error.message || 'An unexpected error occurred';
}
