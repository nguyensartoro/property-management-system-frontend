import React from 'react';

/**
 * Comprehensive error handling utilities for the application
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: ValidationError[];
  code?: string;
}

/**
 * Parse API error response and return standardized error object
 */
export const parseApiError = (error: any): ApiError => {
  // Handle network errors
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection and try again.',
      status: 0,
      code: 'NETWORK_ERROR'
    };
  }

  const { status, data } = error.response;

  // Handle different HTTP status codes
  switch (status) {
    case 400:
      return {
        message: data?.message || 'Invalid request. Please check your input.',
        status,
        code: 'BAD_REQUEST',
        details: data?.errors || data?.details
      };
    
    case 401:
      return {
        message: 'Authentication required. Please log in again.',
        status,
        code: 'UNAUTHORIZED'
      };
    
    case 403:
      return {
        message: 'You do not have permission to perform this action.',
        status,
        code: 'FORBIDDEN'
      };
    
    case 404:
      return {
        message: data?.message || 'The requested resource was not found.',
        status,
        code: 'NOT_FOUND'
      };
    
    case 409:
      return {
        message: data?.message || 'A conflict occurred. The resource may already exist.',
        status,
        code: 'CONFLICT'
      };
    
    case 422:
      return {
        message: data?.message || 'Validation failed. Please check your input.',
        status,
        code: 'VALIDATION_ERROR',
        details: data?.errors || data?.details
      };
    
    case 429:
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        status,
        code: 'RATE_LIMITED'
      };
    
    case 500:
      return {
        message: 'Internal server error. Please try again later.',
        status,
        code: 'INTERNAL_ERROR'
      };
    
    case 502:
    case 503:
    case 504:
      return {
        message: 'Service temporarily unavailable. Please try again later.',
        status,
        code: 'SERVICE_UNAVAILABLE'
      };
    
    default:
      return {
        message: data?.message || 'An unexpected error occurred.',
        status,
        code: 'UNKNOWN_ERROR'
      };
  }
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  if (!errors || errors.length === 0) {
    return 'Validation failed';
  }

  if (errors.length === 1) {
    return errors[0].message;
  }

  return errors.map(error => `${error.field}: ${error.message}`).join(', ');
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: ApiError): string => {
  if (error.details && Array.isArray(error.details)) {
    return formatValidationErrors(error.details);
  }

  return error.message;
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: ApiError): boolean => {
  const retryableCodes = [
    'NETWORK_ERROR',
    'INTERNAL_ERROR',
    'SERVICE_UNAVAILABLE',
    'RATE_LIMITED'
  ];

  return retryableCodes.includes(error.code || '');
};

/**
 * Handle file upload errors
 */
export const handleFileUploadError = (error: any): ApiError => {
  const apiError = parseApiError(error);

  // Add specific file upload error handling
  if (apiError.status === 413) {
    return {
      ...apiError,
      message: 'File is too large. Please choose a smaller file.',
      code: 'FILE_TOO_LARGE'
    };
  }

  if (apiError.status === 415) {
    return {
      ...apiError,
      message: 'File type not supported. Please choose a different file.',
      code: 'UNSUPPORTED_FILE_TYPE'
    };
  }

  return apiError;
};

/**
 * Create error boundary fallback component props
 */
export const createErrorBoundaryProps = (componentName: string) => ({
  fallback: ({ error, resetError }: { error: Error; resetError: () => void }) => (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600 mb-4">
          An error occurred in the {componentName} component. Please try refreshing the page.
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  ),
  onError: (error: Error, errorInfo: any) => {
    console.error(`Error in ${componentName}:`, error, errorInfo);
    // Here you could send error to monitoring service
  }
});

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T,>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }

      const apiError = parseApiError(error);
      if (!isRetryableError(apiError)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Form validation error handler
 */
export const handleFormValidationError = (error: any, setFieldError: (field: string, message: string) => void) => {
  const apiError = parseApiError(error);
  
  if (apiError.details && Array.isArray(apiError.details)) {
    apiError.details.forEach((validationError: ValidationError) => {
      setFieldError(validationError.field, validationError.message);
    });
  }
};

/**
 * Global error handler for unhandled promise rejections
 */
export const setupGlobalErrorHandling = () => {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent the default browser behavior
    event.preventDefault();
    
    // You could show a toast notification here
    // toast.error('An unexpected error occurred');
  });

  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // You could send to monitoring service here
  });
};

/**
 * Error logging utility
 */
export const logError = (error: any, context?: string) => {
  const errorInfo = {
    message: error.message || 'Unknown error',
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.error('Error logged:', errorInfo);
  
  // Here you could send to external logging service
  // Example: Sentry, LogRocket, etc.
};

/**
 * Network status checker
 */
export const checkNetworkStatus = (): boolean => {
  return navigator.onLine;
};

/**
 * Handle offline scenarios
 */
export const handleOfflineError = (): ApiError => {
  return {
    message: 'You appear to be offline. Please check your internet connection.',
    status: 0,
    code: 'OFFLINE'
  };
};