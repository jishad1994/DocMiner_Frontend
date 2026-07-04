import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast-service/toast.service';


export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const message = extractErrorMessage(error);
      toastService.error(message);
      return throwError(() => new Error(message));
    }),
  );
};

function extractErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    // The backend returns { success: false, message: '...' }
    if (isApiErrorBody(error.error)) {
      return error.error.message;
    }

    switch (error.status) {
      case 0:
        return 'Unable to reach the server. Check your network connection.';
      case 400:
        return 'Invalid request. Please check your input.';
      case 404:
        return 'The requested resource was not found.';
      case 413:
        return 'The file is too large. Maximum size is 50 MB.';
      case 422:
        return 'The uploaded file is not a valid PDF.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return `Unexpected error (${error.status}). Please try again.`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

interface ApiErrorBody {
  success: false;
  message: string;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as Record<string, unknown>)['success'] === false &&
    'message' in value &&
    typeof (value as Record<string, unknown>)['message'] === 'string'
  );
}