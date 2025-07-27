import { create } from 'zustand';
import { expenseService, Expense, ExpenseCategory, RecurringFrequency } from '../utils/apiClient';

interface ExpenseInput {
  propertyId: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  vendor?: string;
  receiptPath?: string;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
}

interface ExpenseFilters {
  search?: string;
  category?: string;
  propertyId?: string;
  isRecurring?: string;
  vendor?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface ExpenseSummary {
  category: string;
  totalAmount: number;
  count: number;
  expenses: Expense[];
}

interface ExpenseTotals {
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ExpenseState {
  expenses: Expense[];
  selectedExpense: Expense | null;
  recurringExpenses: Expense[];
  expenseSummary: ExpenseSummary[];
  expenseTotals: ExpenseTotals | null;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination | null;
  filters: ExpenseFilters;
  
  // Actions
  fetchExpenses: (page?: number, limit?: number, filters?: ExpenseFilters) => Promise<void>;
  fetchExpenseById: (id: string) => Promise<void>;
  fetchExpensesByProperty: (propertyId: string, category?: string, startDate?: string, endDate?: string) => Promise<void>;
  fetchRecurringExpenses: (propertyId?: string) => Promise<void>;
  fetchExpenseSummary: (propertyId?: string, startDate?: string, endDate?: string) => Promise<void>;
  createExpense: (data: ExpenseInput) => Promise<Expense>;
  updateExpense: (id: string, data: Partial<ExpenseInput>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ExpenseFilters>) => void;
  clearFilters: () => void;
  clearSelectedExpense: () => void;
  clearError: () => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  selectedExpense: null,
  recurringExpenses: [],
  expenseSummary: [],
  expenseTotals: null,
  isLoading: false,
  error: null,
  pagination: null,
  filters: {},

  fetchExpenses: async (page = 1, limit = 10, filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const currentFilters = { ...get().filters, ...filters };
      
      const response = await expenseService.getAllExpenses(
        page,
        limit,
        currentFilters.search || '',
        currentFilters.category || '',
        currentFilters.propertyId || '',
        currentFilters.isRecurring || '',
        currentFilters.vendor || '',
        currentFilters.startDate || '',
        currentFilters.endDate || '',
        currentFilters.sortBy || 'date',
        currentFilters.sortOrder || 'desc'
      );
      
      set({
        expenses: response.data.data,
        pagination: response.data.pagination ? {
          currentPage: response.data.pagination.currentPage || page,
          totalPages: response.data.pagination.totalPages || 1,
          totalItems: response.data.pagination.totalItems || response.data.data.length,
          itemsPerPage: response.data.pagination.itemsPerPage || limit,
          hasNextPage: (response.data.pagination.currentPage || page) < (response.data.pagination.totalPages || 1),
          hasPreviousPage: (response.data.pagination.currentPage || page) > 1,
        } : null,
        filters: currentFilters,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch expenses',
      });
    }
  },

  fetchExpenseById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await expenseService.getExpenseById(id);
      set({
        selectedExpense: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching expense:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch expense',
      });
    }
  },

  fetchExpensesByProperty: async (propertyId: string, category?: string, startDate?: string, endDate?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await expenseService.getExpensesByProperty(propertyId, category, startDate, endDate);
      set({
        expenses: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching expenses by property:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch expenses for this property',
      });
    }
  },

  fetchRecurringExpenses: async (propertyId?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await expenseService.getRecurringExpenses(propertyId);
      set({
        recurringExpenses: response.data.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recurring expenses',
      });
    }
  },

  fetchExpenseSummary: async (propertyId?: string, startDate?: string, endDate?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await expenseService.getExpenseSummary(propertyId, startDate, endDate);
      set({
        expenseSummary: response.data.data.summary,
        expenseTotals: response.data.data.totals,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching expense summary:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch expense summary',
      });
    }
  },

  createExpense: async (data: ExpenseInput) => {
    try {
      set({ isLoading: true, error: null });
      const response = await expenseService.createExpense(data);
      const newExpense = response.data.data;
      
      set((state) => ({
        expenses: [...state.expenses, newExpense],
        isLoading: false,
      }));
      
      return newExpense;
    } catch (error) {
      console.error('Error creating expense:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create expense',
      });
      throw error;
    }
  },

  updateExpense: async (id: string, data: Partial<ExpenseInput>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await expenseService.updateExpense(id, data);
      const updatedExpense = response.data.data;
      
      set((state) => ({
        expenses: state.expenses.map((expense) =>
          expense.id === id ? updatedExpense : expense
        ),
        selectedExpense: state.selectedExpense?.id === id ? updatedExpense : state.selectedExpense,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating expense:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update expense',
      });
      throw error;
    }
  },

  deleteExpense: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await expenseService.deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter((expense) => expense.id !== id),
        selectedExpense: state.selectedExpense?.id === id ? null : state.selectedExpense,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting expense:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete expense',
      });
      throw error;
    }
  },

  setFilters: (filters: Partial<ExpenseFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearSelectedExpense: () => set({ selectedExpense: null }),
  
  clearError: () => set({ error: null }),
}));