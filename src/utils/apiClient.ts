import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create a throttle map to track API calls
const throttleMap = new Map<string, number>();
const THROTTLE_WINDOW = 2000; // 2 seconds between identical requests

// Create base API client
const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This ensures cookies are sent with requests
});

// Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface Room {
  id: string;
  name: string;
  number: string;
  floor: number;
  size: number;
  description?: string;
  status: RoomStatus;
  price: number;
  images: string[];
  propertyId: string;
  createdAt: string;
  updatedAt: string;
  type?: string;
}

export interface Renter {
  id: string;
  name: string;
  email?: string;
  phone: string;
  emergencyContact?: string;
  identityNumber?: string;
  roomId?: string;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface Contract {
  id: string;
  renterId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit?: number;
  status: ContractStatus;
  terms?: string;
  documentPath?: string;
  terminationReason?: string;
  terminationDate?: string;
  contractType: ContractType;
  createdAt: string;
  updatedAt: string;
  room?: {
    id: string;
    name: string;
    number: string;
    floor?: number;
    size?: number;
    price?: number;
    property?: {
      id: string;
      name: string;
      address: string;
    };
  };
  renter?: {
    id: string;
    name: string;
    email?: string;
    phone: string;
    emergencyContact?: string;
  };
  payments?: Payment[];
}

export interface Payment {
  id: string;
  contractId: string;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  receiptPath?: string;
  createdAt: string;
  updatedAt: string;
  contract?: {
    id: string;
    monthlyRent: number;
    startDate: string;
    endDate: string;
    status: string;
    terms?: string;
    renter?: {
      id: string;
      name: string;
      email?: string;
      phone: string;
      emergencyContact?: string;
    };
    room?: {
      id: string;
      name: string;
      number: string;
      floor?: number;
      size?: number;
      property?: {
        id: string;
        name: string;
        address: string;
      };
    };
  };
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  fee: number;
  feeType: FeeType;
  icon?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    rooms: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface MaintenanceRequest {
  id: string;
  renterId: string;
  roomId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  category: MaintenanceCategory;
  submittedAt: string;
  assignedTo?: string;
  estimatedCompletion?: string;
  completedAt?: string;
  notes?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  renter?: {
    id: string;
    name: string;
    email?: string;
    phone: string;
    emergencyContact?: string;
  };
  room?: {
    id: string;
    name: string;
    number: string;
    floor?: number;
    size?: number;
    description?: string;
    property?: {
      id: string;
      name: string;
      address: string;
    };
  };
}

export interface Payment {
  id: string;
  contractId: string;
  amount: number;
  paymentDate?: string;
  dueDate: string;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  receiptPath?: string;
  createdAt: string;
  updatedAt: string;
  contract?: {
    id: string;
    monthlyRent: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    terms?: string;
    renter?: {
      id: string;
      name: string;
      email?: string;
      phone: string;
      emergencyContact?: string;
    };
    room?: {
      id: string;
      name: string;
      number: string;
      floor?: number;
      size?: number;
      property?: {
        id: string;
        name: string;
        address: string;
      };
    };
  };
}

export interface Expense {
  id: string;
  propertyId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  vendor?: string;
  receiptPath?: string;
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    name: string;
    address: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface ReportType {
  id: string;
  name: string;
  description: string;
  exportFormats: string[];
}

export interface FinancialReport {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: string;
  };
  incomeBreakdown: {
    propertyId: string;
    propertyName: string;
    totalIncome: number;
    paymentCount: number;
  }[];
  expenseBreakdown: {
    category: string;
    totalAmount: number;
    count: number;
  }[];
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

export interface OccupancyReport {
  summary: {
    totalRooms: number;
    occupiedRooms: number;
    vacantRooms: number;
    occupancyRate: number;
  };
  occupancyByProperty: {
    propertyId: string;
    propertyName: string;
    totalRooms: number;
    occupiedRooms: number;
    vacantRooms: number;
    occupancyRate: string;
  }[];
  contractHistory: any[];
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

export interface MaintenanceReport {
  summary: {
    totalRequests: number;
    completedRequests: number;
    pendingRequests: number;
    inProgressRequests: number;
    completionRate: string;
    avgResolutionTimeDays: string;
  };
  requestsByCategory: {
    category: string;
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  }[];
  requestsByPriority: {
    priority: string;
    count: number;
  }[];
  recentRequests: any[];
  period: {
    startDate: string;
    endDate: string;
  };
  generatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  priority: string;
  relatedId?: string;
  relatedType?: string;
  actionUrl?: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Enums
export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  TERMINATED = 'TERMINATED',
}

export enum ContractType {
  LONG_TERM = 'LONG_TERM',
  SHORT_TERM = 'SHORT_TERM',
}

export enum FeeType {
  ONE_TIME = 'ONE_TIME',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum MaintenanceCategory {
  PLUMBING = 'PLUMBING',
  ELECTRICAL = 'ELECTRICAL',
  HVAC = 'HVAC',
  APPLIANCES = 'APPLIANCES',
  CLEANING = 'CLEANING',
  REPAIRS = 'REPAIRS',
  OTHER = 'OTHER',
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum MaintenanceStatus {
  SUBMITTED = 'SUBMITTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  PARTIAL = 'PARTIAL',
}

export enum ExpenseCategory {
  MAINTENANCE = 'MAINTENANCE',
  UTILITIES = 'UTILITIES',
  TAXES = 'TAXES',
  INSURANCE = 'INSURANCE',
  SALARY = 'SALARY',
  SUPPLIES = 'SUPPLIES',
  MARKETING = 'MARKETING',
  OTHER = 'OTHER',
}

export enum RecurringFrequency {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum NotificationType {
  PAYMENT_DUE = 'PAYMENT_DUE',
  PAYMENT_OVERDUE = 'PAYMENT_OVERDUE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  MAINTENANCE_REQUEST = 'MAINTENANCE_REQUEST',
  MAINTENANCE_UPDATE = 'MAINTENANCE_UPDATE',
  MAINTENANCE_COMPLETED = 'MAINTENANCE_COMPLETED',
  MAINTENANCE_ASSIGNED = 'MAINTENANCE_ASSIGNED',
  MAINTENANCE_EMERGENCY = 'MAINTENANCE_EMERGENCY',
  MAINTENANCE_REMINDER = 'MAINTENANCE_REMINDER',
  CONTRACT_EXPIRING = 'CONTRACT_EXPIRING',
  CONTRACT_EXPIRED = 'CONTRACT_EXPIRED',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  GENERAL = 'GENERAL',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Generate a cache key based on method and URL
    const requestKey = `${config.method}-${config.url}`;

    // Check if this exact request was made recently
    const lastCallTime = throttleMap.get(requestKey);
    const currentTime = Date.now();

    if (lastCallTime && currentTime - lastCallTime < THROTTLE_WINDOW) {
      // Reject duplicated requests that come too quickly after each other
      return Promise.reject(
        new axios.Cancel(`Request throttled. Please wait before sending another identical request.`)
      );
    }

    // Update last call time for this request
    throttleMap.set(requestKey, currentTime);

    // Clean up old entries from the throttle map (simple garbage collection)
    if (throttleMap.size > 100) {
      const oldEntries = [...throttleMap.entries()]
        .filter(([, time]) => currentTime - time > THROTTLE_WINDOW * 2);
      oldEntries.forEach(([key]) => throttleMap.delete(key));
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the session - backend should handle this with cookies
        await apiClient.post('/auth/refresh');

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Session refresh failed:', refreshError);
        // Redirect to login (if needed)
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth service module
export const authService = {
  login: (email: string, password: string) => {
    return apiClient.post<ApiResponse<{user: User, token: string}>>('/auth/login', { email, password });
  },
  register: (name: string, email: string, password: string, role = 'RENTER') => {
    return apiClient.post<ApiResponse<{user: User, token: string}>>('/auth/register', { name, email, password, role });
  },
  logout: () => {
    return apiClient.post<ApiResponse<null>>('/auth/logout');
  },
  me: () => {
    return apiClient.get<ApiResponse<User>>('/auth/me');
  },
  refreshToken: () => {
    return apiClient.post<ApiResponse<{token: string}>>('/auth/refresh-token');
  }
};

/**
 * Room API service
 */
export const roomService = {
  /**
   * Get all rooms with pagination and filtering
   */
  getAllRooms: (page = 1, limit = 10, search = '', status = '') => {
    return apiClient.get<ApiResponse<Room[]>>(`/rooms?page=${page}&limit=${limit}&search=${search}${status ? `&status=${status}` : ''}`);
  },

  /**
   * Get a room by ID
   */
  getRoomById: (id: string) => {
    return apiClient.get<ApiResponse<Room>>(`/rooms/${id}`);
  },

  /**
   * Create a new room
   */
  createRoom: (data: Partial<Room>) => {
    return apiClient.post<ApiResponse<Room>>('/rooms', data);
  },

  /**
   * Update a room
   */
  updateRoom: (id: string, data: Partial<Room>) => {
    return apiClient.put<ApiResponse<Room>>(`/rooms/${id}`, data);
  },

  /**
   * Delete a room
   */
  deleteRoom: (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/rooms/${id}`);
  },

  /**
   * Get all properties (for selecting property when creating/editing rooms)
   */
  getProperties: () => {
    return apiClient.get<ApiResponse<Property[]>>('/properties');
  },
};

/**
 * Renter API service
 */
export const renterService = {
  /**
   * Get all renters with pagination and filtering
   */
  getAllRenters: (page = 1, limit = 10, search = '') => {
    return apiClient.get<ApiResponse<Renter[]>>(`/renters?page=${page}&limit=${limit}&search=${search}`);
  },

  /**
   * Get a renter by ID
   */
  getRenterById: (id: string) => {
    return apiClient.get<ApiResponse<Renter>>(`/renters/${id}`);
  },

  /**
   * Create a new renter
   */
  createRenter: (data: Partial<Renter>) => {
    return apiClient.post<ApiResponse<Renter>>('/renters', data);
  },

  /**
   * Update a renter
   */
  updateRenter: (id: string, data: Partial<Renter>) => {
    return apiClient.put<ApiResponse<Renter>>(`/renters/${id}`, data);
  },

  /**
   * Delete a renter
   */
  deleteRenter: (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/renters/${id}`);
  },
};

/**
 * Contract API service
 */
export const contractService = {
  /**
   * Get all contracts with pagination and filtering
   */
  getAllContracts: (page = 1, limit = 10, search = '', status = '', contractType = '', roomId = '', renterId = '', sortBy = 'createdAt', sortOrder = 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (contractType) params.append('contractType', contractType);
    if (roomId) params.append('roomId', roomId);
    if (renterId) params.append('renterId', renterId);
    
    return apiClient.get<ApiResponse<Contract[]>>(`/contracts?${params.toString()}`);
  },

  /**
   * Get a contract by ID
   */
  getContractById: (id: string) => {
    return apiClient.get<ApiResponse<Contract>>(`/contracts/${id}`);
  },

  /**
   * Create a new contract
   */
  createContract: (data: Partial<Contract>) => {
    return apiClient.post<ApiResponse<Contract>>('/contracts', data);
  },

  /**
   * Update a contract
   */
  updateContract: (id: string, data: Partial<Contract>) => {
    return apiClient.put<ApiResponse<Contract>>(`/contracts/${id}`, data);
  },

  /**
   * Delete a contract
   */
  deleteContract: (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/contracts/${id}`);
  },

  /**
   * Terminate a contract
   */
  terminateContract: (id: string, reason: string, terminationDate?: string) => {
    return apiClient.post<ApiResponse<Contract>>(`/contracts/${id}/terminate`, {
      reason,
      terminationDate: terminationDate || new Date().toISOString(),
    });
  },

  /**
   * Get contracts by renter ID
   */
  getContractsByRenter: (renterId: string) => {
    return apiClient.get<ApiResponse<Contract[]>>(`/contracts/renter/${renterId}`);
  },

  /**
   * Get contracts by room ID
   */
  getContractsByRoom: (roomId: string) => {
    return apiClient.get<ApiResponse<Contract[]>>(`/contracts/room/${roomId}`);
  },

  /**
   * Upload contract document
   */
  uploadContractDocument: (id: string, documentPath: string) => {
    return apiClient.post<ApiResponse<Contract>>(`/contracts/${id}/document`, {
      documentPath,
    });
  },

  /**
   * Get expiring contracts
   */
  getExpiringContracts: (days = 30) => {
    return apiClient.get<ApiResponse<Contract[]>>(`/contracts/expiring?days=${days}`);
  },

  /**
   * Handle contract expiration
   */
  handleContractExpiration: () => {
    return apiClient.post<ApiResponse<{ expiredCount: number }>>('/contracts/handle-expiration');
  },

  /**
   * Renew a contract
   */
  renewContract: (id: string, newEndDate: string, monthlyRent?: number, terms?: string) => {
    return apiClient.post<ApiResponse<Contract>>(`/contracts/${id}/renew`, {
      newEndDate,
      monthlyRent,
      terms,
    });
  },
};

/**
 * Service API service
 */
export const serviceService = {
  /**
   * Get all services with pagination and filtering
   */
  getAllServices: (page = 1, limit = 10, search = '') => {
    return apiClient.get<ApiResponse<Service[]>>(`/services?page=${page}&limit=${limit}&search=${search}`);
  },

  /**
   * Get a service by ID
   */
  getServiceById: (id: string) => {
    return apiClient.get<ApiResponse<Service>>(`/services/${id}`);
  },

  /**
   * Create a new service
   */
  createService: (data: Partial<Service>) => {
    return apiClient.post<ApiResponse<Service>>('/services', data);
  },

  /**
   * Update a service
   */
  updateService: (id: string, data: Partial<Service>) => {
    return apiClient.put<ApiResponse<Service>>(`/services/${id}`, data);
  },

  /**
   * Delete a service
   */
  deleteService: (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/services/${id}`);
  },
};

/**
 * Payment API service
 */
export const paymentService = {
  /**
   * Get all payments with pagination and filtering
   */
  getAllPayments: (page = 1, limit = 10, search = '', status = '', method = '', contractId = '', sortBy = 'dueDate', sortOrder = 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (method) params.append('method', method);
    if (contractId) params.append('contractId', contractId);
    
    return apiClient.get<ApiResponse<Payment[]>>(`/payments?${params.toString()}`);
  },

  /**
   * Get a payment by ID
   */
  getPaymentById: (id: string) => {
    return apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
  },

  /**
   * Create a new payment
   */
  createPayment: (data: Partial<Payment>) => {
    return apiClient.post<ApiResponse<Payment>>('/payments', data);
  },

  /**
   * Update a payment
   */
  updatePayment: (id: string, data: Partial<Payment>) => {
    return apiClient.put<ApiResponse<Payment>>(`/payments/${id}`, data);
  },

  /**
   * Delete a payment
   */
  deletePayment: (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/payments/${id}`);
  },

  /**
   * Record a payment (mark as paid)
   */
  recordPayment: (id: string, paymentDate?: string, method?: PaymentMethod, receiptPath?: string, notes?: string) => {
    return apiClient.post<ApiResponse<Payment>>(`/payments/${id}/record`, {
      paymentDate: paymentDate || new Date().toISOString(),
      method,
      receiptPath,
      notes,
    });
  },

  /**
   * Get payments by contract ID
   */
  getPaymentsByContract: (contractId: string) => {
    return apiClient.get<ApiResponse<Payment[]>>(`/payments/contract/${contractId}`);
  },

  /**
   * Get overdue payments
   */
  getOverduePayments: () => {
    return apiClient.get<ApiResponse<Payment[]>>('/payments/overdue');
  },

  /**
   * Get payment analytics
   */
  getPaymentAnalytics: (contractId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (contractId) params.append('contractId', contractId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get<ApiResponse<{
      summary: {
        totalAmount: number;
        totalCount: number;
        paidAmount: number;
        pendingAmount: number;
        overdueAmount: number;
        averageAmount: number;
      };
      breakdowns: {
        byStatus: Record<string, number>;
        byMethod: Record<string, number>;
      };
    }>>(`/payments/analytics?${params.toString()}`);
  },

  /**
   * Generate recurring payments for a contract
   */
  generateRecurringPayments: (contractId: string, months = 12) => {
    return apiClient.post<ApiResponse<{ createdCount: number }>>(`/payments/contract/${contractId}/generate`, {
      months,
    });
  },

  /**
   * Bulk update payment status
   */
  bulkUpdatePaymentStatus: (paymentIds: string[], status: PaymentStatus, paymentDate?: string) => {
    return apiClient.post<ApiResponse<{ updatedCount: number }>>('/payments/bulk-update', {
      paymentIds,
      status,
      paymentDate,
    });
  },
};

/**
 * Property API service
 */
export const propertyService = {
  /**
   * Get all properties with pagination and filtering
   */
  getAllProperties: (page = 1, limit = 10, search = '') => {
    return apiClient.get<ApiResponse<Property[]>>(`/properties?page=${page}&limit=${limit}&search=${search}`);
  },

  /**
   * Get a property by ID
   */
  getPropertyById: (id: string) => {
    return apiClient.get<ApiResponse<Property>>(`/properties/${id}`);
  },

  /**
   * Create a new property
   */
  createProperty: (data: { name: string; address: string }) => {
    return apiClient.post<ApiResponse<Property>>('/properties', data);
  },

  /**
   * Update a property
   */
  updateProperty: (id: string, data: { name?: string; address?: string }) => {
    return apiClient.put<ApiResponse<Property>>(`/properties/${id}`, data);
  },

  /**
   * Delete a property
   */
  deleteProperty: (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/properties/${id}`);
  },

  /**
   * Get all rooms for a property
   */
  getPropertyRooms: (id: string) => {
    return apiClient.get<ApiResponse<Room[]>>(`/properties/${id}/rooms`);
  },
};

/**
 * Maintenance API service
 */
export const maintenanceService = {
  /**
   * Get all maintenance requests with pagination and filtering
   */
  getAllMaintenanceRequests: (page = 1, limit = 10, search = '', status = '', priority = '', category = '', roomId = '', renterId = '', assignedTo = '', sortBy = 'submittedAt', sortOrder = 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (category) params.append('category', category);
    if (roomId) params.append('roomId', roomId);
    if (renterId) params.append('renterId', renterId);
    if (assignedTo) params.append('assignedTo', assignedTo);
    
    return apiClient.get<ApiResponse<MaintenanceRequest[]>>(`/maintenance?${params.toString()}`);
  },

  /**
   * Get a maintenance request by ID
   */
  getMaintenanceRequestById: (id: string) => {
    return apiClient.get<ApiResponse<MaintenanceRequest>>(`/maintenance/${id}`);
  },

  /**
   * Create a new maintenance request
   */
  createMaintenanceRequest: (data: Partial<MaintenanceRequest>) => {
    return apiClient.post<ApiResponse<MaintenanceRequest>>('/maintenance', data);
  },

  /**
   * Update a maintenance request
   */
  updateMaintenanceRequest: (id: string, data: Partial<MaintenanceRequest>) => {
    return apiClient.put<ApiResponse<MaintenanceRequest>>(`/maintenance/${id}`, data);
  },

  /**
   * Delete a maintenance request
   */
  deleteMaintenanceRequest: (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/maintenance/${id}`);
  },

  /**
   * Assign a maintenance request
   */
  assignMaintenanceRequest: (id: string, assignedTo: string, estimatedCompletion?: string, notes?: string) => {
    return apiClient.post<ApiResponse<MaintenanceRequest>>(`/maintenance/${id}/assign`, {
      assignedTo,
      estimatedCompletion,
      notes,
    });
  },

  /**
   * Complete a maintenance request
   */
  completeMaintenanceRequest: (id: string, completionNotes?: string, completionImages?: string[]) => {
    return apiClient.post<ApiResponse<MaintenanceRequest>>(`/maintenance/${id}/complete`, {
      completionNotes,
      completionImages,
    });
  },

  /**
   * Get maintenance requests by renter ID
   */
  getMaintenanceRequestsByRenter: (renterId: string) => {
    return apiClient.get<ApiResponse<MaintenanceRequest[]>>(`/maintenance/renter/${renterId}`);
  },

  /**
   * Get maintenance requests by room ID
   */
  getMaintenanceRequestsByRoom: (roomId: string) => {
    return apiClient.get<ApiResponse<MaintenanceRequest[]>>(`/maintenance/room/${roomId}`);
  },

  /**
   * Get urgent maintenance requests
   */
  getUrgentMaintenanceRequests: () => {
    return apiClient.get<ApiResponse<MaintenanceRequest[]>>('/maintenance/urgent');
  },
};


/**
 * Expense API service
 */
export const expenseService = {
  /**
   * Get all expenses with pagination and filtering
   */
  getAllExpenses: (page = 1, limit = 10, search = '', category = '', propertyId = '', isRecurring = '', vendor = '', startDate = '', endDate = '', sortBy = 'date', sortOrder = 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });
    
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (propertyId) params.append('propertyId', propertyId);
    if (isRecurring) params.append('isRecurring', isRecurring);
    if (vendor) params.append('vendor', vendor);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get<ApiResponse<Expense[]>>(`/expenses?${params.toString()}`);
  },

  /**
   * Get an expense by ID
   */
  getExpenseById: (id: string) => {
    return apiClient.get<ApiResponse<Expense>>(`/expenses/${id}`);
  },

  /**
   * Create a new expense
   */
  createExpense: (data: Partial<Expense>) => {
    return apiClient.post<ApiResponse<Expense>>('/expenses', data);
  },

  /**
   * Update an expense
   */
  updateExpense: (id: string, data: Partial<Expense>) => {
    return apiClient.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
  },

  /**
   * Delete an expense
   */
  deleteExpense: (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/expenses/${id}`);
  },

  /**
   * Get expenses by property ID
   */
  getExpensesByProperty: (propertyId: string, category?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get<ApiResponse<Expense[]>>(`/expenses/property/${propertyId}?${params.toString()}`);
  },

  /**
   * Get expense summary by category
   */
  getExpenseSummary: (propertyId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get<ApiResponse<{
      summary: {
        category: string;
        totalAmount: number;
        count: number;
        expenses: Expense[];
      }[];
      totals: {
        totalAmount: number;
        totalCount: number;
        averageAmount: number;
      };
    }>>(`/expenses/summary?${params.toString()}`);
  },

  /**
   * Get recurring expenses
   */
  getRecurringExpenses: (propertyId?: string) => {
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId);
    
    return apiClient.get<ApiResponse<Expense[]>>(`/expenses/recurring?${params.toString()}`);
  },
};

/**
 * Notification API service
 */
export const notificationService = {
  /**
   * Get all notifications for a user with pagination and filtering
   */
  getUserNotifications: (userId: string, page = 1, limit = 10, status = '', type = '', priority = '', sortBy = 'createdAt', sortOrder = 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });
    
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    if (priority) params.append('priority', priority);
    
    return apiClient.get<ApiResponse<Notification[]>>(`/notifications/user/${userId}?${params.toString()}`);
  },

  /**
   * Get all notifications with pagination and filtering (admin)
   */
  getAllNotifications: (page = 1, limit = 10, search = '', status = '', type = '', priority = '', userId = '', sortBy = 'createdAt', sortOrder = 'desc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    if (priority) params.append('priority', priority);
    if (userId) params.append('userId', userId);
    
    return apiClient.get<ApiResponse<Notification[]>>(`/notifications?${params.toString()}`);
  },

  /**
   * Get a notification by ID
   */
  getNotificationById: (id: string) => {
    return apiClient.get<ApiResponse<Notification>>(`/notifications/${id}`);
  },

  /**
   * Create a new notification
   */
  createNotification: (data: Partial<Notification>) => {
    return apiClient.post<ApiResponse<Notification>>('/notifications', data);
  },

  /**
   * Update a notification
   */
  updateNotification: (id: string, data: Partial<Notification>) => {
    return apiClient.put<ApiResponse<Notification>>(`/notifications/${id}`, data);
  },

  /**
   * Delete a notification
   */
  deleteNotification: (id: string) => {
    return apiClient.delete<ApiResponse<null>>(`/notifications/${id}`);
  },

  /**
   * Mark a notification as read
   */
  markAsRead: (id: string) => {
    return apiClient.post<ApiResponse<Notification>>(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead: (userId: string) => {
    return apiClient.post<ApiResponse<{ updatedCount: number }>>(`/notifications/user/${userId}/read-all`);
  },

  /**
   * Get unread notification count for a user
   */
  getUnreadCount: (userId: string) => {
    return apiClient.get<ApiResponse<{ unreadCount: number }>>(`/notifications/user/${userId}/unread-count`);
  },

  /**
   * Create bulk notifications
   */
  createBulkNotifications: (userIds: string[], type: NotificationType, title: string, message: string, priority = 'NORMAL', relatedId?: string, relatedType?: string, actionUrl?: string) => {
    return apiClient.post<ApiResponse<{ createdCount: number }>>('/notifications/bulk', {
      userIds,
      type,
      title,
      message,
      priority,
      relatedId,
      relatedType,
      actionUrl,
    });
  },
};

/**
 * Report API service
 */
export const reportService = {
  /**
   * Get available report types
   */
  getReportTypes: () => {
    return apiClient.get<ApiResponse<ReportType[]>>('/reports/types');
  },

  /**
   * Generate financial report
   */
  generateFinancialReport: (propertyId?: string, startDate?: string, endDate?: string, format = 'json') => {
    const params = new URLSearchParams({ format });
    if (propertyId) params.append('propertyId', propertyId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get<ApiResponse<FinancialReport>>(`/reports/financial?${params.toString()}`);
  },

  /**
   * Generate occupancy report
   */
  generateOccupancyReport: (propertyId?: string, startDate?: string, endDate?: string, format = 'json') => {
    const params = new URLSearchParams({ format });
    if (propertyId) params.append('propertyId', propertyId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get<ApiResponse<OccupancyReport>>(`/reports/occupancy?${params.toString()}`);
  },

  /**
   * Generate maintenance report
   */
  generateMaintenanceReport: (propertyId?: string, startDate?: string, endDate?: string, format = 'json') => {
    const params = new URLSearchParams({ format });
    if (propertyId) params.append('propertyId', propertyId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get<ApiResponse<MaintenanceReport>>(`/reports/maintenance?${params.toString()}`);
  },

  /**
   * Export report as CSV
   */
  exportReportAsCSV: (reportType: string, propertyId?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ format: 'csv' });
    if (propertyId) params.append('propertyId', propertyId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiClient.get(`/reports/${reportType}?${params.toString()}`, {
      responseType: 'blob',
    });
  },
};

export default apiClient;