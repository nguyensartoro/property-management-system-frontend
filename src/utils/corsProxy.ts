/**
 * This utility helps handle CORS issues by providing proxy options
 * for development environments.
 */

// Determine if we're in development mode
const isDev = import.meta.env.MODE === 'development'

/**
 * Returns the appropriate base URL for API requests, taking CORS into account
 */
export const getBaseURL = (): string => {
  const configuredUrl = import.meta.env.VITE_API_URL
  
  // Use configured URL if available
  if (configuredUrl) {
    console.log('Using configured API URL:', configuredUrl)
    return configuredUrl
  }
  
  // In development, prefer same-origin if possible or a proxy
  if (isDev) {
    // Check if backend is on same origin
    const isSameOrigin = window.location.port === '5001'
    if (isSameOrigin) {
      return `${window.location.origin}/api/v1`
    }
    
    // Try using a CORS proxy or return default
    return 'http://localhost:5001/api/v1'
  }
  
  // Default for production
  return '/api/v1'
}

/**
 * Configure Vite for CORS handling
 * Add this to vite.config.ts server.proxy configuration
 */
export const corsProxyConfig = {
  '/api': {
    target: 'http://localhost:5001',
    changeOrigin: true,
    secure: false,
  }
}

export default {
  getBaseURL,
  corsProxyConfig
} 