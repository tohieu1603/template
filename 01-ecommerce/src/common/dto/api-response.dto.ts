import { PaginationMeta } from './pagination.dto';

/**
 * Standard API response wrapper for all endpoints.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  errors?: any[];
}

/**
 * Factory for success responses.
 */
export function successResponse<T>(data: T, message?: string, meta?: PaginationMeta): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    meta,
  };
}

/**
 * Factory for error responses (used in error handler middleware).
 */
export function errorResponse(message: string, errors?: any[]): ApiResponse {
  return {
    success: false,
    message,
    errors,
  };
}
