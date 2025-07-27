import { create } from 'zustand';
import { propertyService, Property } from '../utils/apiClient';

interface PropertyInput {
  name: string;
  address: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface PropertyState {
  properties: Property[];
  selectedProperty: Property | null;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  
  // Actions
  fetchProperties: (page?: number, limit?: number, search?: string) => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
  createProperty: (data: PropertyInput) => Promise<Property>;
  updateProperty: (id: string, data: Partial<PropertyInput>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  clearSelectedProperty: () => void;
  clearError: () => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  properties: [],
  selectedProperty: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchProperties: async (page = 1, limit = 10, search = '') => {
    try {
      set({ isLoading: true, error: null });
      const response = await propertyService.getAllProperties(page, limit, search);
      set({
        properties: response.data.data,
        pagination: response.data.pagination || null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch properties',
      });
    }
  },

  fetchPropertyById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await propertyService.getPropertyById(id);
      set({
        selectedProperty: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch property',
      });
    }
  },

  createProperty: async (data: PropertyInput) => {
    try {
      set({ isLoading: true, error: null });
      const response = await propertyService.createProperty(data);
      const newProperty = response.data.data;
      
      set((state) => ({
        properties: [...state.properties, newProperty],
        isLoading: false,
      }));
      
      return newProperty;
    } catch (error) {
      console.error('Error creating property:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create property',
      });
      throw error;
    }
  },

  updateProperty: async (id: string, data: Partial<PropertyInput>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await propertyService.updateProperty(id, data);
      const updatedProperty = response.data.data;
      
      set((state) => ({
        properties: state.properties.map((property) =>
          property.id === id ? updatedProperty : property
        ),
        selectedProperty: state.selectedProperty?.id === id ? updatedProperty : state.selectedProperty,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating property:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update property',
      });
      throw error;
    }
  },

  deleteProperty: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await propertyService.deleteProperty(id);
      set((state) => ({
        properties: state.properties.filter((property) => property.id !== id),
        selectedProperty: state.selectedProperty?.id === id ? null : state.selectedProperty,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting property:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete property',
      });
      throw error;
    }
  },

  clearSelectedProperty: () => set({ selectedProperty: null }),
  
  clearError: () => set({ error: null }),
}));