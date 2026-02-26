/**
 * Service layer result types for consistent error handling
 */

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ServiceError };

export interface ServiceError {
  code: ErrorCode;
  message: string;
  details?: unknown;
}

export enum ErrorCode {
  NOT_FOUND = "NOT_FOUND",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  OPERATION_FAILED = "OPERATION_FAILED",
}