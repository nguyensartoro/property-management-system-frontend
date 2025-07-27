import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, User } from '../utils/apiClient';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login(email, password);
          // Extract user from the response data structure
          const userData = response.data.data.user;
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Login failed:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed. Please try again.',
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string, role = 'RENTER') => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.register(name, email, password, role);
          // Extract user from the response data structure
          const userData = response.data.data.user;
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Registration failed:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed. Please try again.',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await authService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Logout failed:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Logout failed. Please try again.',
          });
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.me();
          // Extract user from the response data structure
          const userData = response.data.data;
          set({
            user: userData,
            isAuthenticated: !!userData,
            isLoading: false,
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);