import React from 'react';
import useAuth from '../../hooks/useAuth';

/**
 * QuickLogin component for development mode
 * Provides a simple button to quickly log in with admin credentials
 */
const QuickLogin: React.FC = () => {
  const { login, isLoading } = useAuth();

  const handleQuickLogin = async () => {
    const credentials = {
      email: 'admin@example.com',
      password: 'Admin@123'
    };
    
    console.log('Attempting quick login with admin credentials');
    try {
      const result = await login(credentials);
      console.log('Quick login result:', result ? 'success' : 'failed');
    } catch (error) {
      console.error('Quick login error:', error);
    }
  };

  return (
    <div className="p-4 mt-4 bg-blue-50 rounded-md border border-blue-200">
      <h3 className="mb-2 text-sm font-medium text-blue-800">Development Quick Login</h3>
      <p className="mb-3 text-xs text-blue-600">
        Credentials: admin@example.com / Admin@123
      </p>
      <button
        onClick={handleQuickLogin}
        disabled={isLoading}
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300 text-sm"
      >
        {isLoading ? 'Logging in...' : 'Quick Login'}
      </button>
    </div>
  );
};

export default QuickLogin; 