import { PaginationMeta } from './pagination.dto';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
  errors?: any[];
}

export function successResponse<T>(data: T, message?: string, meta?: PaginationMeta): ApiResponse<T> {
  return { success: true, data, message, meta };
}

export function errorResponse(message: string, errors?: any[]): ApiResponse {
  return { success: false, message, errors };
}
