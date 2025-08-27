/**
 * Custom error types for the application
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface NetworkError {
  message: string;
  status: number;
  statusText: string;
}

export interface FirebaseError {
  code: string;
  message: string;
  email?: string;
  credential?: unknown;
}

export interface AuthError {
  message: string;
  code?: string;
  email?: string;
}

export interface UploadError {
  message: string;
  file?: File;
  progress?: number;
}

export interface FormError {
  message: string;
  field?: string;
}

// Type guard functions
export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return typeof error === 'object' && error !== null && 'field' in error && 'message' in error;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
  return typeof error === 'object' && error !== null && 'status' in error && 'statusText' in error;
};

export const isFirebaseError = (error: unknown): error is FirebaseError => {
  return typeof error === 'object' && error !== null && 'code' in error;
};

export const isAuthError = (error: unknown): error is AuthError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const isUploadError = (error: unknown): error is UploadError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const isFormError = (error: unknown): error is FormError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

// Error message extractor
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) return error.message;
  if (isValidationError(error)) return error.message;
  if (isNetworkError(error)) return error.message;
  if (isFirebaseError(error)) return error.message;
  if (isAuthError(error)) return error.message;
  if (isUploadError(error)) return error.message;
  if (isFormError(error)) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

