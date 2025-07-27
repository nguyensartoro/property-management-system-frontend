import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// API response type
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error'
  message?: string
  data?: T
  pagination?: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

// User type
export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Room type
export interface Room {
  id: string
  number: string
  floor: string
  type: string
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  capacity: number
  price: number
  description?: string
  createdAt: string
  updatedAt: string
}

// Renter type
export interface Renter {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  roomId?: string
  roomNumber?: string
  moveInDate: string
  createdAt: string
  updatedAt: string
}

// Contract type
export interface Contract {
  id: string
  type: 'long-term' | 'short-term'
  roomId: string
  roomNumber: string
  renterId: string
  renterName: string
  startDate: string
  endDate: string
  amount: number
  status: 'active' | 'expired' | 'terminated' | 'pending'
  createdAt: string
  updatedAt: string
}

// Service type
export interface Service {
  id: string
  name: string
  description?: string
  icon?: string
  fee: number
  feeType: 'ONE_TIME' | 'MONTHLY' | 'YEARLY'
  createdAt: string
  updatedAt: string
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

export interface LoginResponse {
  user: User
  token: string
}

// Rate limiting implementation - completely disabled
class RateLimiter {
  public shouldThrottle(): boolean {
    // Rate limiting completely disabled to fix 429 errors
    return false;
  }
}

const rateLimiter = new RateLimiter();

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  // Use relative URL path to leverage Vite's proxy
  baseURL: 'api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies cross-origin
})

// Add more detailed logging for debugging
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const url = config.url || '';

    // Apply rate limiting
    if (rateLimiter.shouldThrottle()) {
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

// Response interceptor to extract the data from the response
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response)
    // Return the data portion of the response directly
    return response.data
  },
  (error: AxiosError) => {
    console.error('API Error:', error)

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Waiting before retrying...');
      // You could implement retry logic here if needed
    }

    // Handle session expiry / token issues
    if (error.response?.status === 401) {
      // Clear token and redirect to login if in browser
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// API Services
const apiService = {
  auth: {
    login: async (credentials: LoginCredentials) => {
      console.log('Login request to:', 'api/v1/auth/login', credentials);
      try {
        const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
        console.log('Login response received:', response);
        return response;
      } catch (error: unknown) {
        console.error('Login error:', error);
        // Log full error details for debugging
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as AxiosError;
          console.error('Response data:', axiosError.response?.data);
          console.error('Response status:', axiosError.response?.status);
          console.error('Response headers:', axiosError.response?.headers);
        } else if (error && typeof error === 'object' && 'request' in error) {
          const axiosError = error as AxiosError;
          console.error('No response received, request:', axiosError.request);
        } else if (error && typeof error === 'object' && 'message' in error) {
          console.error('Error setting up request:', (error as Error).message);
        }
        throw error;
      }
    },

    register: (data: RegisterData) =>
      apiClient.post<ApiResponse<LoginResponse>>('/auth/register', data),

    logout: () =>
      apiClient.post<ApiResponse<void>>('/auth/logout'),

    me: () =>
      apiClient.get<ApiResponse<User>>('/auth/me'),
  },

  rooms: {
    getAll: (params?: Record<string, unknown>) =>
      apiClient.get<ApiResponse<Room[]>>('/rooms', { params }),

    getById: (id: string) =>
      apiClient.get<ApiResponse<Room>>(`/rooms/${id}`),

    create: (data: Partial<Room>) =>
      apiClient.post<ApiResponse<Room>>('/rooms', data),

    update: (id: string, data: Partial<Room>) =>
      apiClient.put<ApiResponse<Room>>(`/rooms/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<ApiResponse<void>>(`/rooms/${id}`),
  },

  renters: {
    getAll: (params?: Record<string, unknown>) =>
      apiClient.get<ApiResponse<Renter[]>>('/renters', { params }),

    getById: (id: string) =>
      apiClient.get<ApiResponse<Renter>>(`/renters/${id}`),

    create: (data: Partial<Renter>) =>
      apiClient.post<ApiResponse<Renter>>('/renters', data),

    update: (id: string, data: Partial<Renter>) =>
      apiClient.put<ApiResponse<Renter>>(`/renters/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<ApiResponse<void>>(`/renters/${id}`),
  },

  contracts: {
    getAll: (params?: Record<string, unknown>) =>
      apiClient.get<ApiResponse<Contract[]>>('/contracts', { params }),

    getById: (id: string) =>
      apiClient.get<ApiResponse<Contract>>(`/contracts/${id}`),

    create: (data: Partial<Contract>) =>
      apiClient.post<ApiResponse<Contract>>('/contracts', data),

    update: (id: string, data: Partial<Contract>) =>
      apiClient.put<ApiResponse<Contract>>(`/contracts/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<ApiResponse<void>>(`/contracts/${id}`),
  },

  services: {
    getAll: (params?: Record<string, unknown>) =>
      apiClient.get<ApiResponse<Service[]>>('/services', { params }),

    getById: (id: string) =>
      apiClient.get<ApiResponse<Service>>(`/services/${id}`),

    create: (data: Partial<Service>) =>
      apiClient.post<ApiResponse<Service>>('/services', data),

    update: (id: string, data: Partial<Service>) =>
      apiClient.put<ApiResponse<Service>>(`/services/${id}`, data),

    delete: (id: string) =>
      apiClient.delete<ApiResponse<void>>(`/services/${id}`),
  },
}

export default apiService