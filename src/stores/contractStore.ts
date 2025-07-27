import { create } from 'zustand';
import { contractService, Contract, ContractStatus, ContractType } from '../utils/apiClient';

interface ContractInput {
  renterId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit?: number;
  status?: ContractStatus;
  contractType?: ContractType;
  terms?: string;
  documentPath?: string;
}

interface ContractFilters {
  search?: string;
  status?: string;
  contractType?: string;
  roomId?: string;
  renterId?: string;
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

interface ContractState {
  contracts: Contract[];
  selectedContract: Contract | null;
  expiringContracts: Contract[];
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  filters: ContractFilters;
  
  // Actions
  fetchContracts: (page?: number, limit?: number, filters?: ContractFilters) => Promise<void>;
  fetchContractById: (id: string) => Promise<void>;
  fetchContractsByRenter: (renterId: string) => Promise<void>;
  fetchContractsByRoom: (roomId: string) => Promise<void>;
  fetchExpiringContracts: (days?: number) => Promise<void>;
  createContract: (data: ContractInput) => Promise<Contract>;
  updateContract: (id: string, data: Partial<ContractInput>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  terminateContract: (id: string, reason: string, terminationDate?: string) => Promise<void>;
  renewContract: (id: string, newEndDate: string, monthlyRent?: number, terms?: string) => Promise<void>;
  uploadContractDocument: (id: string, documentPath: string) => Promise<void>;
  handleContractExpiration: () => Promise<{ expiredCount: number }>;
  setFilters: (filters: Partial<ContractFilters>) => void;
  clearFilters: () => void;
  clearSelectedContract: () => void;
  clearError: () => void;
}

export const useContractStore = create<ContractState>((set, get) => ({
  contracts: [],
  selectedContract: null,
  expiringContracts: [],
  isLoading: false,
  error: null,
  pagination: null,
  filters: {},

  fetchContracts: async (page = 1, limit = 10, filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const currentFilters = { ...get().filters, ...filters };
      
      const response = await contractService.getAllContracts(
        page,
        limit,
        currentFilters.search || '',
        currentFilters.status || '',
        currentFilters.contractType || '',
        currentFilters.roomId || '',
        currentFilters.renterId || '',
        currentFilters.sortBy || 'createdAt',
        currentFilters.sortOrder || 'desc'
      );
      
      set({
        contracts: response.data.data,
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
      console.error('Error fetching contracts:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contracts',
      });
    }
  },

  fetchContractById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await contractService.getContractById(id);
      set({
        selectedContract: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching contract:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contract',
      });
    }
  },

  fetchContractsByRenter: async (renterId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await contractService.getContractsByRenter(renterId);
      set({
        contracts: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching contracts by renter:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contracts for this renter',
      });
    }
  },

  fetchContractsByRoom: async (roomId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await contractService.getContractsByRoom(roomId);
      set({
        contracts: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching contracts by room:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contracts for this room',
      });
    }
  },

  fetchExpiringContracts: async (days = 30) => {
    try {
      set({ isLoading: true, error: null });
      const response = await contractService.getExpiringContracts(days);
      set({
        expiringContracts: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching expiring contracts:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch expiring contracts',
      });
    }
  },

  createContract: async (data: ContractInput) => {
    try {
      set({ isLoading: true, error: null });
      const response = await contractService.createContract(data);
      const newContract = response.data.data;
      
      set((state) => ({
        contracts: [...state.contracts, newContract],
        isLoading: false,
      }));
      
      return newContract;
    } catch (error) {
      console.error('Error creating contract:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create contract',
      });
      throw error;
    }
  },

  updateContract: async (id: string, data: Partial<ContractInput>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await contractService.updateContract(id, data);
      const updatedContract = response.data.data;
      
      set((state) => ({
        contracts: state.contracts.map((contract) =>
          contract.id === id ? updatedContract : contract
        ),
        selectedContract: state.selectedContract?.id === id ? updatedContract : state.selectedContract,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating contract:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update contract',
      });
      throw error;
    }
  },

  deleteContract: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await contractService.deleteContract(id);
      set((state) => ({
        contracts: state.contracts.filter((contract) => contract.id !== id),
        selectedContract: state.selectedContract?.id === id ? null : state.selectedContract,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting contract:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete contract',
      });
      throw error;
    }
  },

  terminateContract: async (id: string, reason: string, terminationDate?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await contractService.terminateContract(id, reason, terminationDate);
      const terminatedContract = response.data.data;
      
      set((state) => ({
        contracts: state.contracts.map((contract) =>
          contract.id === id ? terminatedContract : contract
        ),
        selectedContract: state.selectedContract?.id === id ? terminatedContract : state.selectedContract,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error terminating contract:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to terminate contract',
      });
      throw error;
    }
  },

  renewContract: async (id: string, newEndDate: string, monthlyRent?: number, terms?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await contractService.renewContract(id, newEndDate, monthlyRent, terms);
      const renewedContract = response.data.data;
      
      set((state) => ({
        contracts: state.contracts.map((contract) =>
          contract.id === id ? renewedContract : contract
        ),
        selectedContract: state.selectedContract?.id === id ? renewedContract : state.selectedContract,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error renewing contract:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to renew contract',
      });
      throw error;
    }
  },

  uploadContractDocument: async (id: string, documentPath: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await contractService.uploadContractDocument(id, documentPath);
      const updatedContract = response.data.data;
      
      set((state) => ({
        contracts: state.contracts.map((contract) =>
          contract.id === id ? updatedContract : contract
        ),
        selectedContract: state.selectedContract?.id === id ? updatedContract : state.selectedContract,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error uploading contract document:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to upload contract document',
      });
      throw error;
    }
  },

  handleContractExpiration: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await contractService.handleContractExpiration();
      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      console.error('Error handling contract expiration:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to handle contract expiration',
      });
      throw error;
    }
  },

  setFilters: (filters: Partial<ContractFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearSelectedContract: () => set({ selectedContract: null }),
  
  clearError: () => set({ error: null }),
}));