// Add more detailed logging for debugging
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';

    /* Rate limiting disabled - don't call the rate limiter at all
    // Apply rate limiting
    if (rateLimiter.shouldThrottle(url)) {
      // If rate limited, create a fake 429 response
      return Promise.reject({
        response: {
          status: 429,
          data: {
            status: 'error',
            message: 'Too many requests. Please try again later.'
          }
        }
      });
    }
    */

    console.log('API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      withCredentials: config.withCredentials
    })

    // Get token from localStorage in browser environments
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)