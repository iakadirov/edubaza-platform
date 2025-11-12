/**
 * API Common Types
 * Общие типы для API
 */

/**
 * Стандартный API Response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

/**
 * API Error
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

/**
 * Pagination Request
 */
export interface PaginationRequest {
  page: number;
  limit: number;
}

/**
 * Pagination Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Sort Order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Filter Operator
 */
export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';
