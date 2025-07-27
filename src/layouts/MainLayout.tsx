import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar';
import useAuth from '../hooks/useAuth';
import useUIStore from '../stores/uiStore';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isSidebarOpen } = useUIStore();

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <main className={`flex-1 overflow-auto p-6 transition-all duration-300 ${isSidebarOpen ? '' : 'ml-0'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;