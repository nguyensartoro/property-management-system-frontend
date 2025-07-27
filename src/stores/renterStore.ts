import { create } from 'zustand';
import { renterService, Renter } from '../utils/apiClient';

interface RenterInput {
  name: string;
  email?: string;
  phone: string;
  emergencyContact?: string;
  identityNumber?: string;
  roomId?: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface RenterState {
  renters: Renter[];
  selectedRenter: Renter | null;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  
  // Actions
  fetchRenters: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchRenterById: (id: string) => Promise<void>;
  createRenter: (data: RenterInput) => Promise<Renter>;
  updateRenter: (id: string, data: Partial<RenterInput>) => Promise<void>;
  deleteRenter: (id: string) => Promise<void>;
  clearSelectedRenter: () => void;
  clearError: () => void;
}

export const useRenterStore = create<RenterState>((set) => ({
  renters: [],
  selectedRenter: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchRenters: async (page = 1, limit = 10, search = '') => {
    try {
      set({ isLoading: true, error: null });
      const response = await renterService.getAllRenters(page, limit, search);
      set({
        renters: response.data.data,
        pagination: response.data.pagination || null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching renters:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch renters',
      });
    }
  },

  fetchRenterById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await renterService.getRenterById(id);
      set({
        selectedRenter: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching renter:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch renter',
      });
    }
  },

  createRenter: async (data: RenterInput) => {
    try {
      set({ isLoading: true, error: null });
      const response = await renterService.createRenter(data);
      const newRenter = response.data.data;
      
      set((state) => ({
        renters: [...state.renters, newRenter],
        isLoading: false,
      }));
      
      return newRenter;
    } catch (error) {
      console.error('Error creating renter:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create renter',
      });
      throw error;
    }
  },

  updateRenter: async (id: string, data: Partial<RenterInput>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await renterService.updateRenter(id, data);
      const updatedRenter = response.data.data;
      
      set((state) => ({
        renters: state.renters.map((renter) =>
          renter.id === id ? updatedRenter : renter
        ),
        selectedRenter: state.selectedRenter?.id === id ? updatedRenter : state.selectedRenter,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating renter:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update renter',
      });
      throw error;
    }
  },

  deleteRenter: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await renterService.deleteRenter(id);
      set((state) => ({
        renters: state.renters.filter((renter) => renter.id !== id),
        selectedRenter: state.selectedRenter?.id === id ? null : state.selectedRenter,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting renter:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete renter',
      });
      throw error;
    }
  },

  clearSelectedRenter: () => set({ selectedRenter: null }),
  
  clearError: () => set({ error: null }),
}));