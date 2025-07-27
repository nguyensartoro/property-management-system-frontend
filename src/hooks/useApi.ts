import React from 'react';
import { AxiosResponse, AxiosError } from 'axios';

/**
 * Custom hook for fetching data from REST APIs with retry capabilities
 * @param fetcher - The function that fetches the data
 * @param deps - Dependencies array that triggers refetch when changed
 * @param immediate - Whether to fetch data immediately on mount
 */
const useApi = <T>(
  fetcher: () => Promise<AxiosResponse<T>>,
  deps: React.DependencyList = [],
  immediate: boolean = true
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState<boolean>(immediate);
  const [error, setError] = React.useState<Error | null>(null);
  
  // Use ref to track if this is the initial mount
  const isInitialMount = React.useRef(true);
  const fetcherRef = React.useRef(fetcher);
  const abortControllerRef = React.useRef<AbortController | null>(null);
  
  // Update fetcher ref when it changes
  React.useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);
  
  // Cleanup function
  React.useEffect(() => {
    return () => {
      // Cancel any ongoing requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  // Stable fetch function with retry logic
  const fetchData = React.useCallback(async (retryCount = 0, delay = 1000) => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetcherRef.current();
      setData(response.data);
      return response.data;
    } catch (err) {
      const error = err as Error | AxiosError;
      
      // If it's a 429 error (Too Many Requests) and we haven't retried too many times
      if (
        retryCount < 3 && 
        'isAxiosError' in error && 
        error.isAxiosError && 
        error.response?.status === 429
      ) {
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        
        // Wait for the specified delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry with exponential backoff
        return fetchData(retryCount + 1, delay * 2);
      }
      
      // For other errors, just set the error state
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Handle initial fetch
  React.useEffect(() => {
    if (immediate && isInitialMount.current) {
      fetchData();
    }
    isInitialMount.current = false;
  }, [immediate, fetchData]);
  
  // Handle dependency changes - only refetch if deps change AND it's not the initial mount
  React.useEffect(() => {
    if (!isInitialMount.current) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  
  return { data, loading, error, refetch: fetchData };
};

export default useApi;