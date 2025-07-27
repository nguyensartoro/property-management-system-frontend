import React, { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { authService, User } from '../utils/apiClient';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple debounced auth check implementation
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Refs to manage auth check throttling
  const authCheckInProgress = useRef(false);
  const lastAuthCheck = useRef(0);
  const authCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const AUTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const AUTH_CHECK_DEBOUNCE = 1000; // 1 second

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      setUser(response.data.data.user);
      setIsAuthenticated(true);
      lastAuthCheck.current = Date.now();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.register(name, email, password);
      setUser(response.data.data.user);
      setIsAuthenticated(true);
      lastAuthCheck.current = Date.now();
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      lastAuthCheck.current = Date.now();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Raw auth check implementation
  const checkAuthImplementation = async (): Promise<void> => {
    // Skip if another check is in progress or if last check was recent
    if (authCheckInProgress.current) {
      return;
    }
    
    const now = Date.now();
    if (now - lastAuthCheck.current < AUTH_CHECK_INTERVAL && lastAuthCheck.current !== 0) {
      return;
    }
    
    try {
      authCheckInProgress.current = true;
      setIsLoading(true);
      const response = await authService.me();

      // Check if the response contains user data
      if (response.data.data) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      lastAuthCheck.current = now;
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      authCheckInProgress.current = false;
    }
  };
  
  // Debounced version of checkAuth that returns a promise
  const checkAuth = useCallback((): Promise<void> => {
    return new Promise<void>((resolve) => {
      // Clear any pending auth check
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current);
      }
      
      // Schedule a new auth check
      authCheckTimeoutRef.current = setTimeout(async () => {
        try {
          await checkAuthImplementation();
          resolve();
        } catch (error) {
          console.error('Debounced auth check failed:', error);
          resolve();
        }
      }, AUTH_CHECK_DEBOUNCE);
    });
  }, []);

  // Check authentication status on mount, only once
  useEffect(() => {
    // Start with a longer delay for the initial auth check
    setTimeout(() => {
      checkAuth();
    }, 500);
    
    return () => {
      // Clean up timeout on unmount
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current);
      }
    };
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;