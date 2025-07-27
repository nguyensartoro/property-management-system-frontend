import { describe, it, expect, vi } from 'vitest';
import {
  parseApiError,
  formatValidationErrors,
  getUserFriendlyErrorMessage,
  isRetryableError,
  handleFileUploadError,
  retryWithBackoff,
} from '../errorHandling';

describe('errorHandling', () => {
  describe('parseApiError', () => {
    it('should handle network errors', () => {
      const error = { message: 'Network Error' };
      const result = parseApiError(error);
      
      expect(result).toEqual({
        message: 'Network error. Please check your connection and try again.',
        status: 0,
        code: 'NETWORK_ERROR'
      });
    });

    it('should handle 400 bad request', () => {
      const error = {
        response: {
          status: 400,
          data: {
            message: 'Invalid input',
            errors: [{ field: 'email', message: 'Invalid email' }]
          }
        }
      };
      const result = parseApiError(error);
      
      expect(result).toEqual({
        message: 'Invalid input',
        status: 400,
        code: 'BAD_REQUEST',
        details: [{ field: 'email', message: 'Invalid email' }]
      });
    });

    it('should handle 401 unauthorized', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      const result = parseApiError(error);
      
      expect(result).toEqual({
        message: 'Authentication required. Please log in again.',
        status: 401,
        code: 'UNAUTHORIZED'
      });
    });

    it('should handle 403 forbidden', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      };
      const result = parseApiError(error);
      
      expect(result).toEqual({
        message: 'You do not have permission to perform this action.',
        status: 403,
        code: 'FORBIDDEN'
      });
    });

    it('should handle 404 not found', () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        }
      };
      const result = parseApiError(error);
      
      expect(result).toEqual({
        message: 'Resource not found',
        status: 404,
        code: 'NOT_FOUND'
      });
    });

    it('should handle 500 internal server error', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal error' }
        }
      };
      const result = parseApiError(error);
      
      expect(result).toEqual({
        message: 'Internal server error. Please try again later.',
        status: 500,
        code: 'INTERNAL_ERROR'
      });
    });
  });

  describe('formatValidationErrors', () => {
    it('should format single validation error', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      const result = formatValidationErrors(errors);
      
      expect(result).toBe('Invalid email');
    });

    it('should format multiple validation errors', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Password too short' }
      ];
      const result = formatValidationErrors(errors);
      
      expect(result).toBe('email: Invalid email, password: Password too short');
    });

    it('should handle empty errors array', () => {
      const result = formatValidationErrors([]);
      expect(result).toBe('Validation failed');
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return formatted validation errors when details exist', () => {
      const error = {
        message: 'Validation failed',
        details: [{ field: 'email', message: 'Invalid email' }]
      };
      const result = getUserFriendlyErrorMessage(error);
      
      expect(result).toBe('Invalid email');
    });

    it('should return original message when no details', () => {
      const error = { message: 'Something went wrong' };
      const result = getUserFriendlyErrorMessage(error);
      
      expect(result).toBe('Something went wrong');
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      const retryableErrors = [
        { code: 'NETWORK_ERROR' },
        { code: 'INTERNAL_ERROR' },
        { code: 'SERVICE_UNAVAILABLE' },
        { code: 'RATE_LIMITED' }
      ];

      retryableErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(true);
      });
    });

    it('should identify non-retryable errors', () => {
      const nonRetryableErrors = [
        { code: 'BAD_REQUEST' },
        { code: 'UNAUTHORIZED' },
        { code: 'FORBIDDEN' },
        { code: 'NOT_FOUND' }
      ];

      nonRetryableErrors.forEach(error => {
        expect(isRetryableError(error)).toBe(false);
      });
    });
  });

  describe('handleFileUploadError', () => {
    it('should handle file too large error', () => {
      const error = {
        response: {
          status: 413,
          data: { message: 'File too large' }
        }
      };
      const result = handleFileUploadError(error);
      
      expect(result.message).toBe('File is too large. Please choose a smaller file.');
      expect(result.code).toBe('FILE_TOO_LARGE');
    });

    it('should handle unsupported file type error', () => {
      const error = {
        response: {
          status: 415,
          data: { message: 'Unsupported file type' }
        }
      };
      const result = handleFileUploadError(error);
      
      expect(result.message).toBe('File type not supported. Please choose a different file.');
      expect(result.code).toBe('UNSUPPORTED_FILE_TYPE');
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first try', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce({ code: 'NETWORK_ERROR' })
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockFn, 2);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const mockFn = vi.fn().mockRejectedValue({ code: 'BAD_REQUEST' });
      
      await expect(retryWithBackoff(mockFn)).rejects.toEqual({ code: 'BAD_REQUEST' });
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should respect max retries', async () => {
      const mockFn = vi.fn().mockRejectedValue({ code: 'NETWORK_ERROR' });
      
      await expect(retryWithBackoff(mockFn, 2)).rejects.toEqual({ code: 'NETWORK_ERROR' });
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});