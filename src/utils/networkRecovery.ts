/**
 * Network error recovery utilities
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

/**
 * Get current network status
 */
export const getNetworkStatus = (): NetworkStatus => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    isOnline: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt
  };
};

/**
 * Check if error is network-related
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  // No response means network error
  if (!error.response) return true;
  
  // Specific network error codes
  const networkErrorCodes = [0, 408, 502, 503, 504, 522, 524];
  return networkErrorCodes.includes(error.response?.status);
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  if (isNetworkError(error)) return true;
  
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  return retryableStatusCodes.includes(error.response?.status);
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryCondition = isRetryableError,
    onRetry
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Check if error is retryable
      if (!retryCondition(error)) {
        throw error;
      }

      // Call onRetry callback
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt);
      const jitter = Math.random() * 0.1 * exponentialDelay;
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Queue for offline requests
 */
class OfflineRequestQueue {
  private queue: Array<{
    id: string;
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
    retries: number;
  }> = [];

  private isProcessing = false;
  private maxRetries = 3;
  private maxAge = 5 * 60 * 1000; // 5 minutes

  add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      
      this.queue.push({
        id,
        request,
        resolve,
        reject,
        timestamp: Date.now(),
        retries: 0
      });

      // Start processing if online
      if (navigator.onLine && !this.isProcessing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    if (this.isProcessing || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue[0];
      
      // Remove expired items
      if (Date.now() - item.timestamp > this.maxAge) {
        this.queue.shift();
        item.reject(new Error('Request expired'));
        continue;
      }

      try {
        const result = await item.request();
        this.queue.shift();
        item.resolve(result);
      } catch (error) {
        item.retries++;
        
        if (item.retries >= this.maxRetries || !isRetryableError(error)) {
          this.queue.shift();
          item.reject(error);
        } else {
          // Move to end of queue for retry
          this.queue.push(this.queue.shift()!);
        }
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  // Start processing when coming back online
  onOnline() {
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Clear expired items
  cleanup() {
    const now = Date.now();
    this.queue = this.queue.filter(item => {
      if (now - item.timestamp > this.maxAge) {
        item.reject(new Error('Request expired'));
        return false;
      }
      return true;
    });
  }

  getQueueSize(): number {
    return this.queue.length;
  }
}

// Global offline queue instance
export const offlineQueue = new OfflineRequestQueue();

/**
 * Setup network event listeners
 */
export const setupNetworkListeners = () => {
  window.addEventListener('online', () => {
    console.log('Network: Back online');
    offlineQueue.onOnline();
  });

  window.addEventListener('offline', () => {
    console.log('Network: Gone offline');
  });

  // Cleanup expired requests periodically
  setInterval(() => {
    offlineQueue.cleanup();
  }, 60000); // Every minute
};

/**
 * Enhanced fetch with retry and offline support
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> => {
  const request = () => fetch(url, options);

  // If offline, add to queue
  if (!navigator.onLine) {
    return offlineQueue.add(request);
  }

  // Otherwise, retry with backoff
  return retryWithBackoff(request, {
    ...retryOptions,
    retryCondition: (error) => {
      // Add to offline queue if network error
      if (isNetworkError(error)) {
        offlineQueue.add(request);
        return false; // Don't retry immediately
      }
      return retryOptions.retryCondition ? retryOptions.retryCondition(error) : isRetryableError(error);
    }
  });
};

/**
 * Network-aware API client wrapper
 */
export const createNetworkAwareClient = (baseClient: any) => {
  return new Proxy(baseClient, {
    get(target, prop) {
      const originalMethod = target[prop];
      
      if (typeof originalMethod === 'function') {
        return function(...args: any[]) {
          const request = () => originalMethod.apply(target, args);
          
          // If offline, add to queue
          if (!navigator.onLine) {
            return offlineQueue.add(request);
          }
          
          // Otherwise, execute with retry
          return retryWithBackoff(request, {
            onRetry: (attempt, error) => {
              console.log(`Retrying ${String(prop)} (attempt ${attempt}):`, error.message);
            }
          });
        };
      }
      
      return originalMethod;
    }
  });
};

/**
 * Connection quality detector
 */
export const getConnectionQuality = (): 'slow' | 'medium' | 'fast' | 'unknown' => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return 'unknown';
  
  const { effectiveType, downlink, rtt } = connection;
  
  if (effectiveType === 'slow-2g' || effectiveType === '2g') {
    return 'slow';
  }
  
  if (effectiveType === '3g' || (downlink && downlink < 1.5) || (rtt && rtt > 300)) {
    return 'medium';
  }
  
  return 'fast';
};

/**
 * Adaptive timeout based on connection quality
 */
export const getAdaptiveTimeout = (): number => {
  const quality = getConnectionQuality();
  
  switch (quality) {
    case 'slow':
      return 30000; // 30 seconds
    case 'medium':
      return 15000; // 15 seconds
    case 'fast':
      return 10000; // 10 seconds
    default:
      return 15000; // Default 15 seconds
  }
};

import React from 'react';

/**
 * React hook for network status
 */
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = React.useState(getConnectionQuality());

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionQuality(getConnectionQuality());
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleConnectionChange = () => {
      setConnectionQuality(getConnectionQuality());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  return {
    isOnline,
    connectionQuality,
    queueSize: offlineQueue.getQueueSize()
  };
};