import { useAuthStore } from '../stores/authStore';

// This hook provides a convenient way to access auth state and actions
const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
  } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
  };
};

export default useAuth;