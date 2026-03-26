import { PaginationMeta } from './pagination.dto';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  errors?: unknown[];
}

export function successResponse<T>(data: T, message?: string, meta?: PaginationMeta): ApiResponse<T> {
  return { success: true, data, message, meta };
}

export function errorResponse(message: string, errors?: unknown[]): ApiResponse {
  return { success: false, message, errors };
}
