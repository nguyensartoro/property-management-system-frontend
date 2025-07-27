import { create } from 'zustand';
import { paymentService, Payment, PaymentStatus, PaymentMethod } from '../utils/apiClient';

interface PaymentInput {
  contractId: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
  notes?: string;
  receiptPath?: string;
}

interface PaymentFilters {
  search?: string;
  status?: string;
  method?: string;
  contractId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaymentAnalytics {
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
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaymentState {
  payments: Payment[];
  selectedPayment: Payment | null;
  overduePayments: Payment[];
  analytics: PaymentAnalytics | null;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  filters: PaymentFilters;
  
  // Actions
  fetchPayments: (page?: number, limit?: number, filters?: PaymentFilters) => Promise<void>;
  fetchPaymentById: (id: string) => Promise<void>;
  fetchPaymentsByContract: (contractId: string) => Promise<void>;
  fetchOverduePayments: () => Promise<void>;
  fetchPaymentAnalytics: (contractId?: string, startDate?: string, endDate?: string) => Promise<void>;
  createPayment: (data: PaymentInput) => Promise<Payment>;
  updatePayment: (id: string, data: Partial<PaymentInput>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  recordPayment: (id: string, paymentDate?: string, method?: PaymentMethod, receiptPath?: string, notes?: string) => Promise<void>;
  generateRecurringPayments: (contractId: string, months?: number) => Promise<{ createdCount: number }>;
  bulkUpdatePaymentStatus: (paymentIds: string[], status: PaymentStatus, paymentDate?: string) => Promise<{ updatedCount: number }>;
  setFilters: (filters: Partial<PaymentFilters>) => void;
  clearFilters: () => void;
  clearSelectedPayment: () => void;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  selectedPayment: null,
  overduePayments: [],
  analytics: null,
  isLoading: false,
  error: null,
  pagination: null,
  filters: {},

  fetchPayments: async (page = 1, limit = 10, filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const currentFilters = { ...get().filters, ...filters };
      
      const response = await paymentService.getAllPayments(
        page,
        limit,
        currentFilters.search || '',
        currentFilters.status || '',
        currentFilters.method || '',
        currentFilters.contractId || '',
        currentFilters.sortBy || 'dueDate',
        currentFilters.sortOrder || 'desc'
      );
      
      set({
        payments: response.data.data,
        pagination: response.data.pagination ? {
          currentPage: response.data.pagination.currentPage || page,
          totalPages: response.data.pagination.totalPages || 1,
          totalItems: response.data.pagination.totalItems || response.data.data.length,
          itemsPerPage: response.data.pagination.itemsPerPage || limit,
          hasNextPage: response.data.pagination.hasNextPage || false,
          hasPreviousPage: response.data.pagination.hasPreviousPage || false,
        } : null,
        filters: currentFilters,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payments',
      });
    }
  },

  fetchPaymentById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await paymentService.getPaymentById(id);
      set({
        selectedPayment: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment',
      });
    }
  },

  fetchPaymentsByContract: async (contractId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await paymentService.getPaymentsByContract(contractId);
      set({
        payments: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching payments by contract:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payments for this contract',
      });
    }
  },

  fetchOverduePayments: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await paymentService.getOverduePayments();
      set({
        overduePayments: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching overdue payments:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch overdue payments',
      });
    }
  },

  fetchPaymentAnalytics: async (contractId?: string, startDate?: string, endDate?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await paymentService.getPaymentAnalytics(contractId, startDate, endDate);
      set({
        analytics: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment analytics',
      });
    }
  },

  createPayment: async (data: PaymentInput) => {
    try {
      set({ isLoading: true, error: null });
      const response = await paymentService.createPayment(data);
      const newPayment = response.data.data;
      
      set((state) => ({
        payments: [...state.payments, newPayment],
        isLoading: false,
      }));
      
      return newPayment;
    } catch (error) {
      console.error('Error creating payment:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create payment',
      });
      throw error;
    }
  },

  updatePayment: async (id: string, data: Partial<PaymentInput>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await paymentService.updatePayment(id, data);
      const updatedPayment = response.data.data;
      
      set((state) => ({
        payments: state.payments.map((payment) =>
          payment.id === id ? updatedPayment : payment
        ),
        selectedPayment: state.selectedPayment?.id === id ? updatedPayment : state.selectedPayment,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating payment:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update payment',
      });
      throw error;
    }
  },

  deletePayment: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await paymentService.deletePayment(id);
      set((state) => ({
        payments: state.payments.filter((payment) => payment.id !== id),
        selectedPayment: state.selectedPayment?.id === id ? null : state.selectedPayment,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting payment:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete payment',
      });
      throw error;
    }
  },

  recordPayment: async (id: string, paymentDate?: string, method?: PaymentMethod, receiptPath?: string, notes?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await paymentService.recordPayment(id, paymentDate, method, receiptPath, notes);
      const recordedPayment = response.data.data;
      
      set((state) => ({
        payments: state.payments.map((payment) =>
          payment.id === id ? recordedPayment : payment
        ),
        selectedPayment: state.selectedPayment?.id === id ? recordedPayment : state.selectedPayment,
        overduePayments: state.overduePayments.filter((payment) => payment.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error recording payment:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to record payment',
      });
      throw error;
    }
  },

  generateRecurringPayments: async (contractId: string, months = 12) => {
    try {
      set({ isLoading: true, error: null });
      const response = await paymentService.generateRecurringPayments(contractId, months);
      set({ isLoading: false });
      
      // Refresh payments list to show newly generated payments
      if (get().filters.contractId === contractId) {
        await get().fetchPayments();
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error generating recurring payments:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to generate recurring payments',
      });
      throw error;
    }
  },

  bulkUpdatePaymentStatus: async (paymentIds: string[], status: PaymentStatus, paymentDate?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await paymentService.bulkUpdatePaymentStatus(paymentIds, status, paymentDate);
      set({ isLoading: false });
      
      // Refresh payments list to show updated statuses
      await get().fetchPayments();
      
      return response.data.data;
    } catch (error) {
      console.error('Error bulk updating payment status:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to bulk update payment status',
      });
      throw error;
    }
  },

  setFilters: (filters: Partial<PaymentFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearSelectedPayment: () => set({ selectedPayment: null }),
  
  clearError: () => set({ error: null }),
}));