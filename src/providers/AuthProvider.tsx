import React, { useEffect } from 'react';
import useAuthStore from '../stores/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

// This provider is a wrapper that checks authentication on mount
// It uses the Zustand auth store instead of React Context
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { checkAuth, isLoading } = useAuthStore();
  
  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // You could add a loading screen here if needed
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

export default AuthProvider;