import { create } from 'zustand';
import { maintenanceService, MaintenanceRequest, MaintenanceStatus, MaintenancePriority, MaintenanceCategory } from '../utils/apiClient';

interface MaintenanceRequestInput {
  renterId: string;
  roomId: string;
  title: string;
  description: string;
  priority?: MaintenancePriority;
  category: MaintenanceCategory;
  images?: string[];
  notes?: string;
}

interface MaintenanceFilters {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  roomId?: string;
  renterId?: string;
  assignedTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface MaintenanceState {
  maintenanceRequests: MaintenanceRequest[];
  selectedRequest: MaintenanceRequest | null;
  urgentRequests: MaintenanceRequest[];
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  filters: MaintenanceFilters;
  
  // Actions
  fetchMaintenanceRequests: (page?: number, limit?: number, filters?: MaintenanceFilters) => Promise<void>;
  fetchMaintenanceRequestById: (id: string) => Promise<void>;
  fetchMaintenanceRequestsByRenter: (renterId: string) => Promise<void>;
  fetchMaintenanceRequestsByRoom: (roomId: string) => Promise<void>;
  fetchUrgentMaintenanceRequests: () => Promise<void>;
  createMaintenanceRequest: (data: MaintenanceRequestInput) => Promise<MaintenanceRequest>;
  updateMaintenanceRequest: (id: string, data: Partial<MaintenanceRequestInput>) => Promise<void>;
  deleteMaintenanceRequest: (id: string) => Promise<void>;
  assignMaintenanceRequest: (id: string, assignedTo: string, estimatedCompletion?: string, notes?: string) => Promise<void>;
  completeMaintenanceRequest: (id: string, completionNotes?: string, completionImages?: string[]) => Promise<void>;
  setFilters: (filters: Partial<MaintenanceFilters>) => void;
  clearFilters: () => void;
  clearSelectedRequest: () => void;
  clearError: () => void;
}

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  maintenanceRequests: [],
  selectedRequest: null,
  urgentRequests: [],
  isLoading: false,
  error: null,
  pagination: null,
  filters: {},

  fetchMaintenanceRequests: async (page = 1, limit = 10, filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const currentFilters = { ...get().filters, ...filters };
      
      const response = await maintenanceService.getAllMaintenanceRequests(
        page,
        limit,
        currentFilters.search || '',
        currentFilters.status || '',
        currentFilters.priority || '',
        currentFilters.category || '',
        currentFilters.roomId || '',
        currentFilters.renterId || '',
        currentFilters.assignedTo || '',
        currentFilters.sortBy || 'submittedAt',
        currentFilters.sortOrder || 'desc'
      );
      
      set({
        maintenanceRequests: response.data.data,
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
      console.error('Error fetching maintenance requests:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch maintenance requests',
      });
    }
  },

  fetchMaintenanceRequestById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await maintenanceService.getMaintenanceRequestById(id);
      set({
        selectedRequest: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching maintenance request:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch maintenance request',
      });
    }
  },

  fetchMaintenanceRequestsByRenter: async (renterId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await maintenanceService.getMaintenanceRequestsByRenter(renterId);
      set({
        maintenanceRequests: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching maintenance requests by renter:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch maintenance requests for this renter',
      });
    }
  },

  fetchMaintenanceRequestsByRoom: async (roomId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await maintenanceService.getMaintenanceRequestsByRoom(roomId);
      set({
        maintenanceRequests: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching maintenance requests by room:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch maintenance requests for this room',
      });
    }
  },

  fetchUrgentMaintenanceRequests: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await maintenanceService.getUrgentMaintenanceRequests();
      set({
        urgentRequests: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching urgent maintenance requests:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch urgent maintenance requests',
      });
    }
  },

  createMaintenanceRequest: async (data: MaintenanceRequestInput) => {
    try {
      set({ isLoading: true, error: null });
      const response = await maintenanceService.createMaintenanceRequest(data);
      const newRequest = response.data.data;
      
      set((state) => ({
        maintenanceRequests: [...state.maintenanceRequests, newRequest],
        isLoading: false,
      }));
      
      return newRequest;
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create maintenance request',
      });
      throw error;
    }
  },

  updateMaintenanceRequest: async (id: string, data: Partial<MaintenanceRequestInput>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await maintenanceService.updateMaintenanceRequest(id, data);
      const updatedRequest = response.data.data;
      
      set((state) => ({
        maintenanceRequests: state.maintenanceRequests.map((request) =>
          request.id === id ? updatedRequest : request
        ),
        selectedRequest: state.selectedRequest?.id === id ? updatedRequest : state.selectedRequest,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update maintenance request',
      });
      throw error;
    }
  },

  deleteMaintenanceRequest: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await maintenanceService.deleteMaintenanceRequest(id);
      set((state) => ({
        maintenanceRequests: state.maintenanceRequests.filter((request) => request.id !== id),
        selectedRequest: state.selectedRequest?.id === id ? null : state.selectedRequest,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete maintenance request',
      });
      throw error;
    }
  },

  assignMaintenanceRequest: async (id: string, assignedTo: string, estimatedCompletion?: string, notes?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await maintenanceService.assignMaintenanceRequest(id, assignedTo, estimatedCompletion, notes);
      const assignedRequest = response.data.data;
      
      set((state) => ({
        maintenanceRequests: state.maintenanceRequests.map((request) =>
          request.id === id ? assignedRequest : request
        ),
        selectedRequest: state.selectedRequest?.id === id ? assignedRequest : state.selectedRequest,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error assigning maintenance request:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to assign maintenance request',
      });
      throw error;
    }
  },

  completeMaintenanceRequest: async (id: string, completionNotes?: string, completionImages?: string[]) => {
    try {
      set({ isLoading: true, error: null });
      const response = await maintenanceService.completeMaintenanceRequest(id, completionNotes, completionImages);
      const completedRequest = response.data.data;
      
      set((state) => ({
        maintenanceRequests: state.maintenanceRequests.map((request) =>
          request.id === id ? completedRequest : request
        ),
        selectedRequest: state.selectedRequest?.id === id ? completedRequest : state.selectedRequest,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error completing maintenance request:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to complete maintenance request',
      });
      throw error;
    }
  },

  setFilters: (filters: Partial<MaintenanceFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearSelectedRequest: () => set({ selectedRequest: null }),
  
  clearError: () => set({ error: null }),
}));